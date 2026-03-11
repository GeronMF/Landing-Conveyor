import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

const createImageSchema = z.object({
  url: z.string(),
  alt: z.string().optional().nullable(),
  altRu: z.string().optional().nullable(),
  order: z.number().default(0),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id } = await params;

    // Проверяем, существует ли вариант
    const variant = await db.variant.findUnique({
      where: { id },
    });

    if (!variant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    const body = await request.json();
    console.log('Creating image with data:', { variantId: id, ...body });
    const data = createImageSchema.parse(body);

    try {
      const image = await db.variantImage.create({
        data: {
          variantId: id,
          url: data.url,
          alt: data.alt || null,
          altRu: data.altRu || null,
          order: data.order,
        },
      });

      console.log('Image created successfully:', image.id);
      return NextResponse.json(image);
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      throw dbError;
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating variant image:', error);
    // Проверяем, существует ли таблица
    if (error.message?.includes('does not exist') || error.message?.includes('Unknown table')) {
      return NextResponse.json(
        { error: 'Database table not found. Please run: npx prisma db push' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
