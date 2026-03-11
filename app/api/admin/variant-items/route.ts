import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

const schemas = {
  image: z.object({
    variantId: z.string(),
    url: z.string(),
    alt: z.string().optional(),
    order: z.number().default(0),
  }),
  benefit: z.object({
    variantId: z.string(),
    title: z.string(),
    text: z.string(),
    imageUrl: z.string().optional(),
    order: z.number().default(0),
  }),
  specification: z.object({
    variantId: z.string(),
    key: z.string(),
    value: z.string(),
    order: z.number().default(0),
  }),
  review: z.object({
    variantId: z.string(),
    authorName: z.string(),
    rating: z.number().min(1).max(5),
    text: z.string(),
    photoUrl: z.string().optional(),
    order: z.number().default(0),
  }),
};

export async function POST(request: NextRequest) {
  try {
    await verifyAuth();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as keyof typeof schemas;

    if (!type || !schemas[type]) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const body = await request.json();
    const data = schemas[type].parse(body);

    let result;
    switch (type) {
      case 'image':
        result = await db.variantImage.create({ data: data as any });
        break;
      case 'benefit':
        result = await db.benefit.create({ data: data as any });
        break;
      case 'specification':
        result = await db.specification.create({ data: data as any });
        break;
      case 'review':
        result = await db.review.create({ data: data as any });
        break;
    }

    return NextResponse.json(result);
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
