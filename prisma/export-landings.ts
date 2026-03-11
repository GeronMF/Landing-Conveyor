import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('📤 Exporting landings from local database...');

  const landings = await prisma.landing.findMany({
    where: {
      slug: {
        not: 'demo-winter-suit', // Исключаем demo-лендинг
      },
    },
    include: {
      oldVariants: {
        include: {
          oldImages: {
            orderBy: { order: 'asc' },
          },
          oldBenefits: {
            orderBy: { order: 'asc' },
          },
          oldSpecifications: {
            orderBy: { order: 'asc' },
          },
          oldSizeTables: {
            include: {
              rows: {
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
          oldReviews: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
      oldFaqs: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (landings.length === 0) {
    console.log('❌ No landings found in database (excluding demo)');
    return;
  }

  const exportData = landings.map((landing) => ({
    slug: landing.slug,
    status: landing.status,
    pageTitle: landing.pageTitle,
    pageTitleRu: landing.pageTitleRu,
    introText: landing.introText,
    introTextRu: landing.introTextRu,
    globalFAQTitle: landing.globalFAQTitle,
    globalFAQTitleRu: landing.globalFAQTitleRu,
    seoTitle: landing.seoTitle,
    seoDescription: landing.seoDescription,
    themeId: landing.themeId,
    themePrimaryColor: landing.themePrimaryColor,
    themeAccentColor: landing.themeAccentColor,
    companyName: landing.companyName,
    companyNameRu: landing.companyNameRu,
    legalText: landing.legalText,
    legalTextRu: landing.legalTextRu,
    phone: landing.phone,
    email: landing.email,
    socials: landing.socials,
    links: landing.links,
    formConfig: landing.formConfig,
    ageVerification: landing.ageVerification,
    howToOrder: landing.howToOrder,
    delivery: landing.delivery,
    variants: landing.oldVariants.map((variant: any) => ({
      order: variant.order,
      title: variant.title,
      titleRu: variant.titleRu,
      subtitle: variant.subtitle,
      subtitleRu: variant.subtitleRu,
      offerText: variant.offerText,
      offerTextRu: variant.offerTextRu,
      badgeText: variant.badgeText,
      badgeTextRu: variant.badgeTextRu,
      price: variant.price.toString(),
      oldPrice: variant.oldPrice?.toString() || null,
      currency: variant.currency,
      ctaPrimaryText: variant.ctaPrimaryText,
      ctaPrimaryTextRu: variant.ctaPrimaryTextRu,
      ctaSecondaryPhoneText: variant.ctaSecondaryPhoneText,
      ctaSecondaryPhoneTextRu: variant.ctaSecondaryPhoneTextRu,
      primaryPhone: variant.primaryPhone,
      videoUrl: variant.videoUrl,
      videoTitle: variant.videoTitle,
      videoTitleRu: variant.videoTitleRu,
      videoText: variant.videoText,
      videoTextRu: variant.videoTextRu,
      repeatOfferBlocks: variant.repeatOfferBlocks,
      images: variant.oldImages.map((img: any) => ({
        url: img.url,
        alt: img.alt,
        altRu: img.altRu,
        order: img.order,
      })),
      benefits: variant.oldBenefits.map((benefit: any) => ({
        title: benefit.title,
        titleRu: benefit.titleRu,
        text: benefit.text,
        textRu: benefit.textRu,
        order: benefit.order,
      })),
      specifications: variant.oldSpecifications.map((spec: any) => ({
        key: spec.key,
        keyRu: spec.keyRu,
        value: spec.value,
        valueRu: spec.valueRu,
        order: spec.order,
      })),
      sizeTables: variant.oldSizeTables.map((table: any) => ({
        title: table.title,
        titleRu: table.titleRu,
        order: table.order,
        rows: table.rows.map((row: any) => ({
          sizeLabel: row.sizeLabel,
          columns: row.columns,
          order: row.order,
        })),
      })),
      reviews: variant.oldReviews.map((review: any) => ({
        authorName: review.authorName,
        authorNameRu: review.authorNameRu,
        rating: review.rating,
        text: review.text,
        textRu: review.textRu,
        photoUrl: review.photoUrl,
        order: review.order,
      })),
    })),
    faqs: landing.oldFaqs.map((faq: any) => ({
      question: faq.question,
      questionRu: faq.questionRu,
      answer: faq.answer,
      answerRu: faq.answerRu,
      order: faq.order,
      isOpen: faq.isOpen,
    })),
  }));

  const outputPath = path.join(__dirname, 'landings-export.json');
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

  console.log(`✅ Exported ${landings.length} landings to ${outputPath}`);
  console.log('\n📋 Landings:');
  landings.forEach((landing) => {
    console.log(`   - ${landing.slug} (${landing.oldVariants.length} variants)`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Export failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
