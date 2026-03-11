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

    // Получаем желаемый slug из тела запроса
    const body = await request.json().catch(() => ({}));
    const requestedSlug: string | undefined = body.slug?.trim();

    // Загружаем оригинальный лендинг со всеми связанными данными
    const original = await db.landing.findUnique({
      where: { id },
      include: {
        oldVariants: {
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
        },
        oldFaqs: { orderBy: { order: 'asc' } },
      },
    });

    if (!original) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Определяем slug для копии
    let newSlug = requestedSlug || `${original.slug}-copy`;

    // Проверяем уникальность slug
    const existing = await db.landing.findUnique({ where: { slug: newSlug } });
    if (existing) {
      return NextResponse.json(
        { error: `Slug "${newSlug}" вже зайнятий. Оберіть інший.` },
        { status: 409 }
      );
    }

    // Создаём копию лендинга — явно перечисляем только скалярные поля
    const copy = await db.landing.create({
      data: {
        slug:              newSlug,
        status:            'draft',
        pageTitle:         original.pageTitle,
        pageTitleRu:       original.pageTitleRu,
        introText:         original.introText,
        introTextRu:       original.introTextRu,
        globalFAQTitle:    original.globalFAQTitle,
        globalFAQTitleRu:  original.globalFAQTitleRu,
        seoTitle:          original.seoTitle,
        seoTitleRu:        original.seoTitleRu,
        seoDescription:    original.seoDescription,
        seoDescriptionRu:  original.seoDescriptionRu,
        ogImage:           original.ogImage,
        logoUrl:           original.logoUrl,
        themeId:           original.themeId || undefined,
        themePrimaryColor: original.themePrimaryColor,
        themeAccentColor:  original.themeAccentColor,
        companyName:       original.companyName,
        companyNameRu:     original.companyNameRu,
        legalText:         original.legalText,
        legalTextRu:       original.legalTextRu,
        privacyPolicyText:    original.privacyPolicyText,
        privacyPolicyTextRu:  original.privacyPolicyTextRu,
        termsText:            original.termsText,
        termsTextRu:          original.termsTextRu,
        copyrightText:        original.copyrightText,
        copyrightTextRu:      original.copyrightTextRu,
        phone:             original.phone,
        email:             original.email,
        socials:           original.socials ?? undefined,
        links:             original.links ?? undefined,
        heroImages:        original.heroImages ?? undefined,
        variantsJson:      original.variantsJson ?? undefined,
        faqsJson:          original.faqsJson ?? undefined,
        companyInfo:       original.companyInfo ?? undefined,
        formConfig:        original.formConfig ?? undefined,
        ageVerification:   original.ageVerification,
        howToOrder:        original.howToOrder ?? undefined,
        delivery:          original.delivery ?? undefined,
      },
    });

    // Копируем варианты со всеми вложенными данными
    for (const variant of original.oldVariants) {
      const newVariant = await db.variant.create({
        data: {
          landingId:              copy.id,
          order:                  variant.order,
          title:                  variant.title,
          titleRu:                variant.titleRu,
          subtitle:               variant.subtitle,
          subtitleRu:             variant.subtitleRu,
          offerText:              variant.offerText,
          offerTextRu:            variant.offerTextRu,
          badgeText:              variant.badgeText,
          badgeTextRu:            variant.badgeTextRu,
          price:                  variant.price,
          oldPrice:               variant.oldPrice,
          currency:               variant.currency,
          ctaPrimaryText:         variant.ctaPrimaryText,
          ctaPrimaryTextRu:       variant.ctaPrimaryTextRu,
          ctaSecondaryPhoneText:  variant.ctaSecondaryPhoneText,
          ctaSecondaryPhoneTextRu: variant.ctaSecondaryPhoneTextRu,
          primaryPhone:           variant.primaryPhone,
          economyText:            variant.economyText,
          economyTextRu:          variant.economyTextRu,
          faqLinkText:            variant.faqLinkText,
          faqLinkTextRu:          variant.faqLinkTextRu,
          heroImageUrl:           variant.heroImageUrl,
          videoUrl:               variant.videoUrl,
          videoUrlDesktop:        variant.videoUrlDesktop,
          videoHtmlDesktop:       variant.videoHtmlDesktop,
          videoUrlMobile:         variant.videoUrlMobile,
          videoHtmlMobile:        variant.videoHtmlMobile,
          videoTitle:             variant.videoTitle,
          videoTitleRu:           variant.videoTitleRu,
          videoText:              variant.videoText,
          videoTextRu:            variant.videoTextRu,
          sizeTableHtml:          variant.sizeTableHtml,
          sizeTableHtmlRu:        variant.sizeTableHtmlRu,
          repeatOfferBlocks:      variant.repeatOfferBlocks ?? undefined,
          heroImages:             variant.heroImages ?? undefined,
          advantages:             variant.advantages ?? undefined,
          specifications:         variant.specifications ?? undefined,
          sizeTable:              variant.sizeTable ?? undefined,
          gallery:                variant.gallery ?? undefined,
          reviews:                variant.reviews ?? undefined,
        },
      });

      // Изображения
      for (const img of variant.oldImages) {
        await db.variantImage.create({
          data: { variantId: newVariant.id, url: img.url, alt: img.alt, altRu: img.altRu, order: img.order },
        });
      }

      // Преимущества
      for (const b of variant.oldBenefits) {
        await db.benefit.create({
          data: { variantId: newVariant.id, title: b.title, titleRu: b.titleRu, text: b.text, textRu: b.textRu, imageUrl: b.imageUrl, order: b.order },
        });
      }

      // Характеристики
      for (const s of variant.oldSpecifications) {
        await db.specification.create({
          data: { variantId: newVariant.id, key: s.key, keyRu: s.keyRu, value: s.value, valueRu: s.valueRu, order: s.order },
        });
      }

      // Таблицы размеров
      for (const st of variant.oldSizeTables) {
        const newSizeTable = await db.sizeTable.create({
          data: { variantId: newVariant.id, title: st.title, titleRu: st.titleRu, columns: st.columns ?? undefined, order: st.order },
        });
        for (const row of st.rows) {
          await db.sizeTableRow.create({
            data: { sizeTableId: newSizeTable.id, sizeLabel: row.sizeLabel, columns: row.columns ?? undefined, order: row.order },
          });
        }
      }

      // Отзывы
      for (const r of variant.oldReviews) {
        await db.review.create({
          data: { variantId: newVariant.id, authorName: r.authorName, authorNameRu: r.authorNameRu, rating: r.rating, text: r.text, textRu: r.textRu, photoUrl: r.photoUrl, order: r.order },
        });
      }
    }

    // Копируем FAQ
    for (const faq of original.oldFaqs) {
      await db.fAQ.create({
        data: { landingId: copy.id, question: faq.question, questionRu: faq.questionRu, answer: faq.answer, answerRu: faq.answerRu, order: faq.order, isOpen: faq.isOpen },
      });
    }

    return NextResponse.json({ id: copy.id, slug: copy.slug }, { status: 201 });
  } catch (error: any) {
    console.error('Duplicate landing error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
