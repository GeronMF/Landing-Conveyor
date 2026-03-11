import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id } = await params;

    const variant = await db.variant.findUnique({
      where: { id },
      include: {
        oldImages: { orderBy: { order: 'asc' } },
        oldBenefits: { orderBy: { order: 'asc' } },
        oldSpecifications: { orderBy: { order: 'asc' } },
        oldSizeTables: {
          orderBy: { order: 'asc' },
          include: {
            rows: { orderBy: { order: 'asc' } },
          },
        },
        oldReviews: { orderBy: { order: 'asc' } },
      },
    });

    if (!variant) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Логируем для отладки
    console.log('GET /api/admin/variants/[id]: Returning variant:', {
      id: variant.id,
      economyText: variant.economyText,
      economyTextRu: variant.economyTextRu,
      faqLinkText: variant.faqLinkText,
      faqLinkTextRu: variant.faqLinkTextRu,
    });

    return NextResponse.json(variant);
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

const updateVariantSchema = z.object({
  order: z.number().optional(),
  title: z.string().optional(),
  titleRu: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  subtitleRu: z.string().optional().nullable(),
  offerText: z.string().optional().nullable(),
  offerTextRu: z.string().optional().nullable(),
  badgeText: z.string().optional().nullable(),
  badgeTextRu: z.string().optional().nullable(),
  price: z.number().optional(),
  oldPrice: z.number().optional().nullable(),
  currency: z.string().optional(),
  ctaPrimaryText: z.string().optional(),
  ctaPrimaryTextRu: z.string().optional().nullable(),
  ctaSecondaryPhoneText: z.string().optional().nullable(),
  ctaSecondaryPhoneTextRu: z.string().optional().nullable(),
  primaryPhone: z.string().optional().nullable(),
  economyText: z.string().optional().nullable(),
  economyTextRu: z.string().optional().nullable(),
  faqLinkText: z.string().optional().nullable(),
  faqLinkTextRu: z.string().optional().nullable(),
  heroImageUrl: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  videoUrlDesktop: z.string().optional().nullable(),
  videoHtmlDesktop: z.string().optional().nullable(),
  videoUrlMobile: z.string().optional().nullable(),
  videoHtmlMobile: z.string().optional().nullable(),
  videoTitle: z.string().optional().nullable(),
  videoTitleRu: z.string().optional().nullable(),
  videoText: z.string().optional().nullable(),
  videoTextRu: z.string().optional().nullable(),
  sizeTableHtml: z.string().optional().nullable(),
  sizeTableHtmlRu: z.string().optional().nullable(),
  repeatOfferBlocks: z.number().optional(),
  specificationsBackgroundImage: z.string().optional().nullable(),
  specificationsFixedBackground: z.boolean().optional(),
  cscartProductId: z.string().optional().nullable(),
  keycrmOfferSku: z.string().optional().nullable(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id } = await params;

    const body = await request.json();
    const parsed = updateVariantSchema.parse(body);
    
    // Убираем id из данных, если он там есть (он используется только в URL)
    const { id: _, ...data } = parsed;

    // Явная очистка пустых значений для видео полей (чтобы блок не показывался если все удалено)
    const cleanedData = {
      ...data,
      videoUrl: data.videoUrl?.trim() || null,
      videoHtmlDesktop: data.videoHtmlDesktop?.trim() || null,
      videoHtmlMobile: data.videoHtmlMobile?.trim() || null,
      videoUrlDesktop: data.videoUrlDesktop?.trim() || null,
      videoUrlMobile: data.videoUrlMobile?.trim() || null,
    };

    // Логируем для отладки
    console.log('Updating variant:', id, 'with data:', JSON.stringify(cleanedData, null, 2));

    const variant = await db.variant.update({
      where: { id },
      data: cleanedData,
    });

    console.log('Updated variant:', variant.id, 'economyText:', variant.economyText, 'faqLinkText:', variant.faqLinkText);

    return NextResponse.json(variant);
  } catch (error: any) {
    console.error('Error updating variant:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      console.error('Zod validation error:', error.errors);
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined },
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

    await db.variant.delete({
      where: { id },
    });

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
