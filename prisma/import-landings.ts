import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const importPath = path.join(__dirname, 'landings-export.json');

  if (!fs.existsSync(importPath)) {
    console.error(`❌ File not found: ${importPath}`);
    console.log('💡 First run: npm run export-landings (on local machine)');
    process.exit(1);
  }

  console.log('📥 Importing landings to database...');

  const landingsData = JSON.parse(fs.readFileSync(importPath, 'utf-8'));

  let imported = 0;
  let skipped = 0;

  for (const landingData of landingsData) {
    const existing = await prisma.landing.findUnique({
      where: { slug: landingData.slug },
    });

    if (existing) {
      console.log(`⏭️  Skipping "${landingData.slug}" (already exists)`);
      skipped++;
      continue;
    }

    try {
      // Проверяем существование темы
      let themeId = landingData.themeId;
      if (themeId) {
        const themeExists = await prisma.theme.findUnique({
          where: { id: themeId },
        });
        if (!themeExists) {
          console.log(`⚠️  Theme ${themeId} not found, setting themeId to null`);
          themeId = null;
        }
      }

      const landing = await prisma.landing.create({
        data: {
          slug: landingData.slug,
          status: landingData.status,
          pageTitle: landingData.pageTitle,
          pageTitleRu: landingData.pageTitleRu,
          introText: landingData.introText,
          introTextRu: landingData.introTextRu,
          globalFAQTitle: landingData.globalFAQTitle,
          globalFAQTitleRu: landingData.globalFAQTitleRu,
          seoTitle: landingData.seoTitle,
          seoDescription: landingData.seoDescription,
          themeId: themeId,
          themePrimaryColor: landingData.themePrimaryColor,
          themeAccentColor: landingData.themeAccentColor,
          companyName: landingData.companyName,
          companyNameRu: landingData.companyNameRu,
          legalText: landingData.legalText,
          legalTextRu: landingData.legalTextRu,
          phone: landingData.phone,
          email: landingData.email,
          socials: landingData.socials as Prisma.InputJsonValue,
          links: landingData.links as Prisma.InputJsonValue,
          formConfig: landingData.formConfig as Prisma.InputJsonValue,
          ageVerification: landingData.ageVerification || false,
          howToOrder: landingData.howToOrder as Prisma.InputJsonValue,
          delivery: landingData.delivery as Prisma.InputJsonValue,
          oldVariants: {
            create: landingData.variants.map((variant: any) => ({
              order: variant.order,
              title: variant.title,
              titleRu: variant.titleRu,
              subtitle: variant.subtitle,
              subtitleRu: variant.subtitleRu,
              offerText: variant.offerText,
              offerTextRu: variant.offerTextRu,
              badgeText: variant.badgeText,
              badgeTextRu: variant.badgeTextRu,
              price: new Prisma.Decimal(variant.price),
              oldPrice: variant.oldPrice ? new Prisma.Decimal(variant.oldPrice) : null,
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
              oldImages: {
                create: variant.images.map((img: any) => ({
                  url: img.url,
                  alt: img.alt,
                  altRu: img.altRu,
                  order: img.order,
                })),
              },
              oldBenefits: {
                create: variant.benefits.map((benefit: any) => ({
                  title: benefit.title,
                  titleRu: benefit.titleRu,
                  text: benefit.text,
                  textRu: benefit.textRu,
                  order: benefit.order,
                })),
              },
              oldSpecifications: {
                create: variant.specifications.map((spec: any) => ({
                  key: spec.key,
                  keyRu: spec.keyRu,
                  value: spec.value,
                  valueRu: spec.valueRu,
                  order: spec.order,
                })),
              },
              oldSizeTables: {
                create: variant.sizeTables.map((table: any) => ({
                  title: table.title,
                  titleRu: table.titleRu,
                  order: table.order,
                  rows: {
                    create: table.rows.map((row: any) => ({
                      sizeLabel: row.sizeLabel,
                      columns: row.columns as Prisma.InputJsonValue,
                      order: row.order,
                    })),
                  },
                })),
              },
              oldReviews: {
                create: variant.reviews.map((review: any) => ({
                  authorName: review.authorName,
                  authorNameRu: review.authorNameRu,
                  rating: review.rating,
                  text: review.text,
                  textRu: review.textRu,
                  photoUrl: review.photoUrl,
                  order: review.order,
                })),
              },
            })),
          },
          oldFaqs: {
            create: landingData.faqs.map((faq: any) => ({
              question: faq.question,
              questionRu: faq.questionRu,
              answer: faq.answer,
              answerRu: faq.answerRu,
              order: faq.order,
              isOpen: faq.isOpen,
            })),
          },
        },
      });

      console.log(`✅ Imported "${landingData.slug}" (${landingData.variants.length} variants)`);
      imported++;
    } catch (error: any) {
      console.error(`❌ Failed to import "${landingData.slug}":`, error.message);
    }
  }

  console.log(`\n✅ Import completed!`);
  console.log(`   Imported: ${imported}`);
  console.log(`   Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
