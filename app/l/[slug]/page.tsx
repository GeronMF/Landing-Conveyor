import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { existsSync } from 'fs';
import { UPLOADS_ROOT, resolveSafePath } from '@/lib/media-storage';
import { db } from '@/lib/db';
import { VariantSection } from '@/components/landing/variant-section';
import { FAQSection } from '@/components/landing/faq-section';
import { ReviewsSection } from '@/components/landing/reviews-section';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { ScrollToTop } from '@/components/landing/scroll-to-top';
import { ThemeProvider } from '@/components/landing/theme-provider';
import { AgeVerificationPopup } from '@/components/landing/age-verification-popup';
import { HowToOrderSection } from '@/components/landing/how-to-order-section';
import { DeliverySection } from '@/components/landing/delivery-section';
import Script from 'next/script';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

// Нужно чтобы `generateMetadata` пересчитывался на запросе (для корректного `og:image` в Telegram/Viber).
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LandingPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;

  const landing = await db.landing.findUnique({
    where: { slug },
    include: {
      // Загружаем тему, если она есть
      theme: true,
      // Старые связи для обратной совместимости
      oldVariants: {
        orderBy: { order: 'asc' },
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
      },
      oldFaqs: { orderBy: { order: 'asc' } },
    },
  });

  if (!landing) {
    notFound();
  }

  if (landing.status !== 'published' && preview !== '1') {
    notFound();
  }

  // Проверяем, есть ли заполненные русские поля
  const hasRussianContent = (() => {
    // Проверяем поля лендинга
    if (landing.pageTitleRu || landing.introTextRu || landing.seoTitleRu || landing.seoDescriptionRu || 
        landing.globalFAQTitleRu || landing.companyNameRu || landing.legalTextRu) {
      return true;
    }

    // Проверяем варианты
    const variantsToCheck = landing.oldVariants || [];
    for (const variant of variantsToCheck) {
      if (variant.titleRu || variant.subtitleRu || variant.offerTextRu || variant.badgeTextRu ||
          variant.ctaPrimaryTextRu || variant.ctaSecondaryPhoneTextRu || variant.videoTitleRu || 
          variant.videoTextRu || variant.economyTextRu || variant.faqLinkTextRu) {
        return true;
      }

      // Проверяем связанные данные
      if (variant.oldBenefits?.some((b: any) => b.titleRu || b.textRu)) return true;
      if (variant.oldSpecifications?.some((s: any) => s.keyRu || s.valueRu)) return true;
      if (variant.oldSizeTables?.some((st: any) => st.titleRu)) return true;
      if (variant.oldReviews?.some((r: any) => r.authorNameRu || r.textRu)) return true;
    }

    // Проверяем FAQ
    if (landing.oldFaqs?.some((faq: any) => faq.questionRu || faq.answerRu)) {
      return true;
    }

    // Проверяем JSON варианты
    if (landing.variantsJson && Array.isArray(landing.variantsJson)) {
      for (const variant of landing.variantsJson) {
        if ((variant as any).economyTextRu || (variant as any).faqLinkTextRu) {
          return true;
        }
      }
    }

    // Проверяем JSON FAQ
    if (landing.faqsJson && Array.isArray(landing.faqsJson)) {
      for (const faq of landing.faqsJson) {
        if ((faq as any).questionRu || (faq as any).answerRu) {
          return true;
        }
      }
    }

    return false;
  })();

  return (
    <>
      <ThemeProvider 
        theme={landing.theme || null}
        fallbackPrimary={landing.themePrimaryColor}
        fallbackAccent={landing.themeAccentColor}
      />
      {landing.ageVerification && <AgeVerificationPopup slug={slug} />}
      {process.env.NEXT_PUBLIC_GTM_ID && !process.env.NEXT_PUBLIC_GTM_ID_TOPCINA && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      <LandingHeader 
        variants={(() => {
          // Подготавливаем варианты для шапки
          if (landing.variantsJson && Array.isArray(landing.variantsJson) && landing.variantsJson.length > 0) {
            return landing.variantsJson.map((variant: any) => ({
              id: variant.id || variant.slug,
              title: variant.name,
              images: variant.images || variant.gallery,
              color: variant.color,
            }));
          }
          
          if (landing.oldVariants && landing.oldVariants.length > 0) {
            return landing.oldVariants.map((variant: any) => ({
              id: variant.id,
              title: variant.title,
              oldImages: variant.oldImages,
              color: variant.color,
            }));
          }
          
          return [];
        })()}
        logoUrl={landing.logoUrl || '/logo.png'}
        showLanguageSwitcher={hasRussianContent}
      />
      <main className="min-h-screen pt-16 md:pt-20">
        {/* H1 заголовок и описание для SEO */}
        {(landing.pageTitle || landing.introText) && (
          <div className="sr-only">
            {landing.pageTitle && <h1>{landing.pageTitle}</h1>}
            {landing.introText && <p>{landing.introText}</p>}
          </div>
        )}

        {/* Используем JSON варианты если есть, иначе старые варианты */}
        {(() => {
          // Приоритет JSON вариантам
          if (landing.variantsJson && Array.isArray(landing.variantsJson) && landing.variantsJson.length > 0) {
            return landing.variantsJson.map((variant: any, index: number) => (
              <VariantSection
                key={variant.id || variant.slug}
                landingId={landing.id}
                variant={variant}
                primaryColor={
                  landing.theme?.primaryColor || 
                  landing.themePrimaryColor || 
                  undefined
                }
                variantIndex={index}
                formConfig={landing.formConfig || null}
              />
            ));
          }
          
          // Fallback на старые варианты
          if (landing.oldVariants && landing.oldVariants.length > 0) {
            return landing.oldVariants.map((variant, index) => (
              <VariantSection
                key={variant.id}
                landingId={landing.id}
                variant={{
                  ...variant,
                  // Конвертируем Prisma Decimal → number чтобы избежать
                  // "Only plain objects can be passed to Client Components"
                  price: variant.price ? Number(variant.price) : 0,
                  oldPrice: variant.oldPrice ? Number(variant.oldPrice) : null,
                }}
                primaryColor={
                  landing.theme?.primaryColor || 
                  landing.themePrimaryColor || 
                  undefined
                }
                variantIndex={index}
                formConfig={landing.formConfig || null}
              />
            ));
          }
          
          return null;
        })()}

        {/* Отзывы - после всех вариантов, перед FAQ */}
        {(() => {
          let reviewsToShow: Array<{ id: string; authorName: string; rating: number; text: string; photoUrl?: string }> = [];
          
          // Пробуем старые связи (oldVariants)
          if (landing.oldVariants && landing.oldVariants.length > 0) {
            // Сначала пробуем второй вариант
            if (landing.oldVariants.length > 1 && landing.oldVariants[1].oldReviews && landing.oldVariants[1].oldReviews.length > 0) {
              reviewsToShow = landing.oldVariants[1].oldReviews.map((review: any) => ({
                id: review.id,
                authorName: review.authorName,
                authorNameRu: review.authorNameRu || null,
                rating: review.rating,
                text: review.text,
                textRu: review.textRu || null,
                photoUrl: review.photoUrl || '',
              }));
            }
            // Если нет во втором, берем из первого
            else if (landing.oldVariants[0].oldReviews && landing.oldVariants[0].oldReviews.length > 0) {
              reviewsToShow = landing.oldVariants[0].oldReviews.map((review: any) => ({
                id: review.id,
                authorName: review.authorName,
                authorNameRu: review.authorNameRu || null,
                rating: review.rating,
                text: review.text,
                textRu: review.textRu || null,
                photoUrl: review.photoUrl || '',
              }));
            }
          }
          
          // Если нет в старых связях, пробуем JSON варианты
          if (reviewsToShow.length === 0 && landing.variantsJson && Array.isArray(landing.variantsJson) && landing.variantsJson.length > 0) {
            // Берем отзывы из второго варианта, если есть, иначе из первого
            const variantIndex = landing.variantsJson.length > 1 ? 1 : 0;
            const variant = landing.variantsJson[variantIndex];
            
            const variantReviews = (variant as any)?.reviews;
            if (variant && variantReviews && Array.isArray(variantReviews) && variantReviews.length > 0) {
              reviewsToShow = variantReviews.map((review: any) => ({
                id: review.id || `review-${Date.now()}`,
                authorName: review.name || review.authorName || '',
                rating: review.rating || 5,
                text: review.text || '',
                photoUrl: review.photo || review.photoUrl || '',
              }));
            }
          }
          
          return reviewsToShow.length > 0 ? (
            <ReviewsSection reviews={reviewsToShow} />
          ) : null;
        })()}

        {/* Секція "Як замовити" */}
        <HowToOrderSection data={landing.howToOrder as any} />

        {/* Секція "Доставка та оплата" */}
        <DeliverySection data={landing.delivery as any} />

        {/* Используем JSON FAQ если есть, иначе старые */}
        {(() => {
          let faqsToShow: Array<{ id: string; question: string; questionRu?: string | null; answer: string; answerRu?: string | null; isOpen?: boolean }> = [];
          
          if (landing.faqsJson && Array.isArray(landing.faqsJson) && landing.faqsJson.length > 0) {
            faqsToShow = landing.faqsJson.map((faq: any) => ({
              id: faq.id,
              question: faq.question,
              questionRu: faq.questionRu || null,
              answer: faq.answer,
              answerRu: faq.answerRu || null,
              isOpen: faq.isOpen ?? false,
            }));
          } else if (landing.oldFaqs && landing.oldFaqs.length > 0) {
            faqsToShow = landing.oldFaqs.map((faq: any) => ({
              id: faq.id,
              question: faq.question,
              questionRu: faq.questionRu || null,
              answer: faq.answer,
              answerRu: faq.answerRu || null,
              isOpen: faq.isOpen ?? false,
            }));
          }
          
          return faqsToShow.length > 0 ? (
            <FAQSection
              title={landing.globalFAQTitle}
              faqs={faqsToShow}
            />
          ) : null;
        })()}

        <LandingFooter
          companyName={(landing.companyInfo as any)?.companyName || landing.companyName || undefined}
          legalText={(landing.companyInfo as any)?.legalAddress || landing.legalText || undefined}
          legalTextRu={landing.legalTextRu || undefined}
          phone={(landing.companyInfo as any)?.phone || landing.phone || undefined}
          email={(landing.companyInfo as any)?.email || landing.email || undefined}
          socials={landing.socials as Record<string, string> | undefined}
          privacyPolicyText={landing.privacyPolicyText || undefined}
          privacyPolicyTextRu={landing.privacyPolicyTextRu || undefined}
          termsText={landing.termsText || undefined}
          termsTextRu={landing.termsTextRu || undefined}
          copyrightText={landing.copyrightText || undefined}
          copyrightTextRu={landing.copyrightTextRu || undefined}
        />
        
        <ScrollToTop />
      </main>
    </>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  const landing = await db.landing.findUnique({
    where: { slug },
    select: {
      seoTitle: true,
      seoDescription: true,
      ogImage: true,
      pageTitle: true,
      introText: true,
      heroImages: true,
      oldVariants: {
        orderBy: { order: 'asc' },
        take: 1,
        select: {
          oldImages: {
            orderBy: { order: 'asc' },
            take: 1,
            select: { url: true },
          },
        },
      },
      variantsJson: true,
    },
  });

  if (!landing) {
    return {};
  }

  // Определяем OG-картинку: сначала явный ogImage, потом первая картинка из контента
  // Важно для Telegram/Viber: в `og:image` нужна абсолютная ссылка с публичным доменом.
  // Для надежности origin берём из заголовков запроса, а не только из NEXT_PUBLIC_APP_URL.
  const hdrs = headers();
  const forwardedProto = hdrs.get('x-forwarded-proto')?.split(',')?.[0]?.trim();
  const host = hdrs.get('x-forwarded-host') || hdrs.get('host') || '';
  const cleanHost = host.replace(/:\d+$/, '');
  const originFromHeaders = cleanHost
    ? `${forwardedProto || 'https'}://${cleanHost}`
    : (process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || '');

  const toAbsoluteUrl = (url: string | null | undefined) => {
    if (!url) return null;

    const appOrigin = originFromHeaders;

    if (url.startsWith('//')) return appOrigin ? `https:${url}` : `https:${url}`;

    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Если по какой-то причине в БД лежит localhost/127.0.0.1 — заменяем на публичный origin.
      if (appOrigin) {
        const normalized = url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, '');
        if (normalized !== url) return `${appOrigin}${normalized.startsWith('/') ? '' : '/'}${normalized}`;
      }
      return url;
    }

    if (!appOrigin) return url;
    if (url.startsWith('/')) return `${appOrigin}${url}`;
    return `${appOrigin}/${url}`;
  };

  const getOgCandidates = () => {
    const candidates: Array<string | null | undefined> = [];
    candidates.push(landing.ogImage ?? null);

    // Первое изображение из JSON-вариантов
    if (Array.isArray(landing.variantsJson) && landing.variantsJson.length > 0) {
      const v = (landing.variantsJson as any[])[0];
      const imgs = v?.images || v?.gallery;
      if (Array.isArray(imgs) && imgs.length > 0 && imgs[0]?.url) {
        candidates.push(imgs[0].url);
      }
    }

    // Первое изображение из старых вариантов
    const firstOldImage = landing.oldVariants?.[0]?.oldImages?.[0]?.url;
    if (firstOldImage) candidates.push(firstOldImage);

    // Первое изображение из heroImages (fallback)
    if (Array.isArray(landing.heroImages) && landing.heroImages.length > 0) {
      const first = (landing.heroImages as any[])[0];
      if (first?.url) candidates.push(first.url);
    }

    return candidates.filter(Boolean) as string[];
  };

  // Проверяем, что если URL ведет на наш /api/uploads, то файл есть на диске (MEDIA_STORAGE_ROOT/uploads, не public/)
  const isCandidateAvailable = (candidateUrl: string) => {
    try {
      const pathname = candidateUrl.startsWith('http')
        ? new URL(candidateUrl).pathname
        : candidateUrl;
      const match = pathname.match(/^\/api\/uploads\/([^/]+)\/(.+)$/);
      if (!match) return true; // внешние/другие URL считаем валидными

      const folder = match[1];
      const fileName = match[2];
      const filePath = resolveSafePath(UPLOADS_ROOT, [folder, fileName]);
      return filePath ? existsSync(filePath) : false;
    } catch {
      return true;
    }
  };

  const ogCandidates = getOgCandidates();
  const selectedOgImageUrl = ogCandidates.find((u) => isCandidateAvailable(u)) ?? null;
  const ogImageAbsoluteUrl = toAbsoluteUrl(selectedOgImageUrl);

  const title = landing.seoTitle || landing.pageTitle || 'Landing';
  const description = landing.seoDescription || landing.introText || '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(ogImageAbsoluteUrl
        ? { images: [{ url: ogImageAbsoluteUrl, secureUrl: ogImageAbsoluteUrl }] }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImageAbsoluteUrl ? { images: [ogImageAbsoluteUrl] } : {}),
    },
  };
}
