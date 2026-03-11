import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

const updateFaqSchema = z.object({
  question: z.string().optional(),
  questionRu: z.string().optional().nullable(),
  answer: z.string().optional(),
  answerRu: z.string().optional().nullable(),
  order: z.number().optional(),
  isOpen: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id } = await params;

    const body = await request.json();
    const parsed = updateFaqSchema.parse(body);

    const faq = await db.fAQ.update({
      where: { id },
      data: parsed,
    });

    return NextResponse.json(faq);
  } catch (error: any) {
    console.error('PUT /faqs/[id] error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id } = await params;

    await db.fAQ.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
