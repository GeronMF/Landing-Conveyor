import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

const createSpecificationSchema = z.object({
  key: z.string(),
  keyRu: z.string().optional().nullable(),
  value: z.string(),
  valueRu: z.string().optional().nullable(),
  order: z.number().default(0),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id } = await params;

    const body = await request.json();
    const data = createSpecificationSchema.parse(body);

    const specification = await db.specification.create({
      data: {
        variantId: id,
        ...data,
      },
    });

    return NextResponse.json(specification);
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
