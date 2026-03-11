import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

const createFAQSchema = z.object({
  landingId: z.string(),
  question: z.string(),
  answer: z.string(),
  order: z.number().default(0),
});

export async function POST(request: NextRequest) {
  try {
    await verifyAuth();

    const body = await request.json();
    const data = createFAQSchema.parse(body);

    const faq = await db.fAQ.create({ data });

    return NextResponse.json(faq);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
