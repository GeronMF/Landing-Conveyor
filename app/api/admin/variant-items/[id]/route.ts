import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

const updateSchemas = {
  image: z.object({
    url: z.string().optional(),
    alt: z.string().optional(),
    order: z.number().optional(),
  }),
  benefit: z.object({
    title: z.string().optional(),
    text: z.string().optional(),
    imageUrl: z.string().optional(),
    order: z.number().optional(),
  }),
  specification: z.object({
    key: z.string().optional(),
    value: z.string().optional(),
    order: z.number().optional(),
  }),
  review: z.object({
    authorName: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
    text: z.string().optional(),
    photoUrl: z.string().optional(),
    order: z.number().optional(),
  }),
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as keyof typeof updateSchemas;

    if (!type || !updateSchemas[type]) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const body = await request.json();
    const data = updateSchemas[type].parse(body);

    let result;
    switch (type) {
      case 'image':
        result = await db.variantImage.update({ where: { id }, data: data as any });
        break;
      case 'benefit':
        result = await db.benefit.update({ where: { id }, data: data as any });
        break;
      case 'specification':
        result = await db.specification.update({ where: { id }, data: data as any });
        break;
      case 'review':
        result = await db.review.update({ where: { id }, data: data as any });
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'image':
        await db.variantImage.delete({ where: { id } });
        break;
      case 'benefit':
        await db.benefit.delete({ where: { id } });
        break;
      case 'specification':
        await db.specification.delete({ where: { id } });
        break;
      case 'review':
        await db.review.delete({ where: { id } });
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
