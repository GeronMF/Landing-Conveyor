import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id } = await params;

    // Загружаем оригинальный вариант со всеми связями
    const original = await db.variant.findUnique({
      where: { id },
      include: {
        oldImages:         { orderBy: { order: 'asc' } },
        oldBenefits:       { orderBy: { order: 'asc' } },
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

    if (!original) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    // Считаем следующий order
    const maxOrderResult = await db.variant.aggregate({
      where: { landingId: original.landingId },
      _max: { order: true },
    });
    const newOrder = (maxOrderResult._max.order ?? 0) + 1;

    // Создаём копию варианта (без id, landingId берём у оригинала)
    const newVariant = await db.variant.create({
      data: {
        landingId:              original.landingId,
        order:                  newOrder,
        title:                  `${original.title} (копія)`,
        titleRu:                original.titleRu,
        subtitle:               original.subtitle,
        subtitleRu:             original.subtitleRu,
        offerText:              original.offerText,
        offerTextRu:            original.offerTextRu,
        badgeText:              original.badgeText,
        badgeTextRu:            original.badgeTextRu,
        price:                  original.price,
        oldPrice:               original.oldPrice,
        currency:               original.currency,
        ctaPrimaryText:         original.ctaPrimaryText,
        ctaPrimaryTextRu:       original.ctaPrimaryTextRu,
        ctaSecondaryPhoneText:  original.ctaSecondaryPhoneText,
        ctaSecondaryPhoneTextRu: original.ctaSecondaryPhoneTextRu,
        primaryPhone:           original.primaryPhone,
        economyText:            original.economyText,
        economyTextRu:          original.economyTextRu,
        faqLinkText:            original.faqLinkText,
        faqLinkTextRu:          original.faqLinkTextRu,
        heroImageUrl:           original.heroImageUrl,
        videoUrl:               original.videoUrl,
        videoUrlDesktop:        original.videoUrlDesktop,
        videoHtmlDesktop:       original.videoHtmlDesktop,
        videoUrlMobile:         original.videoUrlMobile,
        videoHtmlMobile:        original.videoHtmlMobile,
        videoTitle:             original.videoTitle,
        videoTitleRu:           original.videoTitleRu,
        videoText:              original.videoText,
        videoTextRu:            original.videoTextRu,
        sizeTableHtml:          original.sizeTableHtml,
        sizeTableHtmlRu:        original.sizeTableHtmlRu,
        repeatOfferBlocks:      original.repeatOfferBlocks,
        // JSON поля копируем напрямую
        heroImages:     original.heroImages ?? undefined,
        advantages:     original.advantages ?? undefined,
        specifications: original.specifications ?? undefined,
        sizeTable:      original.sizeTable ?? undefined,
        gallery:        original.gallery ?? undefined,
        reviews:        original.reviews ?? undefined,
      },
    });

    // Копируем старые связи (oldImages)
    for (const img of original.oldImages) {
      await db.variantImage.create({
        data: {
          variantId: newVariant.id,
          url:   img.url,
          alt:   img.alt,
          altRu: img.altRu,
          order: img.order,
        },
      });
    }

    // Копируем oldBenefits
    for (const b of original.oldBenefits) {
      await db.benefit.create({
        data: {
          variantId: newVariant.id,
          title:    b.title,
          titleRu:  b.titleRu,
          text:     b.text,
          textRu:   b.textRu,
          imageUrl: b.imageUrl,
          order:    b.order,
        },
      });
    }

    // Копируем oldSpecifications
    for (const spec of original.oldSpecifications) {
      await db.specification.create({
        data: {
          variantId: newVariant.id,
          key:     spec.key,
          keyRu:   spec.keyRu,
          value:   spec.value,
          valueRu: spec.valueRu,
          order:   spec.order,
        },
      });
    }

    // Копируем oldSizeTables + rows
    for (const table of original.oldSizeTables) {
      const newTable = await db.sizeTable.create({
        data: {
          variantId: newVariant.id,
          title:    table.title,
          titleRu:  table.titleRu,
          columns:  table.columns ?? undefined,
          order:    table.order,
        },
      });
      for (const row of table.rows) {
        await db.sizeTableRow.create({
          data: {
            sizeTableId: newTable.id,
            sizeLabel:   row.sizeLabel,
            columns:     row.columns,
            order:       row.order,
          },
        });
      }
    }

    // Копируем oldReviews
    for (const review of original.oldReviews) {
      await db.review.create({
        data: {
          variantId:     newVariant.id,
          authorName:    review.authorName,
          authorNameRu:  review.authorNameRu,
          rating:        review.rating,
          text:          review.text,
          textRu:        review.textRu,
          photoUrl:      review.photoUrl,
          order:         review.order,
        },
      });
    }

    // Возвращаем новый вариант с полными данными
    const fullNewVariant = await db.variant.findUnique({
      where: { id: newVariant.id },
      include: {
        oldImages:         { orderBy: { order: 'asc' } },
        oldBenefits:       { orderBy: { order: 'asc' } },
        oldSpecifications: { orderBy: { order: 'asc' } },
        oldSizeTables: {
          orderBy: { order: 'asc' },
          include: { rows: { orderBy: { order: 'asc' } } },
        },
        oldReviews: { orderBy: { order: 'asc' } },
      },
    });

    return NextResponse.json(fullNewVariant, { status: 201 });
  } catch (error: any) {
    console.error('Error duplicating variant:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
