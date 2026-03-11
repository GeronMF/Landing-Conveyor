import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

const createFaqSchema = z.object({
  question: z.string().min(1),
  questionRu: z.string().optional().nullable(),
  answer: z.string().min(1),
  answerRu: z.string().optional().nullable(),
  order: z.number().optional(),
  isOpen: z.boolean().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id: landingId } = await params;

    const body = await request.json();
    const parsed = createFaqSchema.parse(body);

    const faq = await db.fAQ.create({
      data: {
        landingId,
        question: parsed.question,
        questionRu: parsed.questionRu ?? null,
        answer: parsed.answer,
        answerRu: parsed.answerRu ?? null,
        order: parsed.order ?? 0,
        isOpen: parsed.isOpen ?? false,
      },
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (error: any) {
    console.error('POST /faqs error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id: landingId } = await params;

    const faqs = await db.fAQ.findMany({
      where: { landingId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(faqs);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
