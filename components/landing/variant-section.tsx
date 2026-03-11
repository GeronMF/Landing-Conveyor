'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Star, Check, Sparkles, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { LeadForm } from './lead-form';
import { ImageGallery } from './image-gallery';
import { CountdownTimer } from './countdown-timer';
import { useI18n } from '@/lib/i18n/context';

// Компонент для блока характеристик с fixed background
const FixedBackgroundSpecs = forwardRef<HTMLDivElement, {
  backgroundImage?: string;
  fixedBackground?: boolean;
  specifications: any[];
  t: any;
  getTranslatedField: (uk: any, ru: any) => string;
}>(({ backgroundImage, fixedBackground = false, specifications, t, getTranslatedField }, ref) => {
  const mobileBgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile || !mobileBgRef.current) return;

    const bgEl = mobileBgRef.current;
    const container = bgEl.parentElement;
    if (!container) return;

    let rafId: number | null = null;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      // Используем requestAnimationFrame для плавности и debounce
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      
      rafId = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        // Пропускаем если скролл не изменился значительно (оптимизация)
        if (Math.abs(currentScrollY - lastScrollY) < 1) {
          return;
        }
        lastScrollY = currentScrollY;

        const rect = container.getBoundingClientRect();
        const progress = -rect.top / (rect.height + window.innerHeight);
        const offset = progress * 60; // 60px смещение
        bgEl.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className="mb-12 md:mb-16 relative min-h-[600px] md:min-h-[800px] rounded-2xl overflow-hidden"
      style={{
        isolation: 'isolate',
      }}
    >
      {/* Фоновое изображение */}
      {backgroundImage && (
        <>
          {/* Десктоп: background-attachment: fixed если включено */}
          <div
            className="hidden md:block absolute inset-0"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: fixedBackground ? 'fixed' : 'scroll',
            }}
          />
          {/* Мобайл/iOS: JavaScript parallax */}
          <div
            ref={mobileBgRef}
            className="md:hidden absolute -inset-x-0 -top-[60px] -bottom-[60px]"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
            }}
          />
        </>
      )}

      {/* Затемнение для читаемости */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
      
      {/* Контент блока характеристик */}
      <div className="relative z-10 py-12 md:py-16">
        <h3 className="text-3xl md:text-4xl font-bold mb-8 px-6 text-center th-title-gradient drop-shadow-lg">
          {t.common.specifications}
        </h3>
        <Card 
          className="border-2 border-white/20 dark:border-white/10 shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm mx-6"
        >
          <CardContent className="pt-6">
            <dl className="space-y-4">
              {specifications
                .filter((spec: any) => (spec.key || spec.name) && spec.value)
                .map((spec: any, idx: number) => (
                <div
                  key={spec.id || `spec-${idx}`}
                  className="flex justify-between items-center py-3 border-b last:border-0 hover:bg-muted/50 px-4 rounded-lg transition-colors"
                  style={{
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <dt className="font-semibold text-lg"><RichContent html={getTranslatedField(spec.key || spec.name, spec.keyRu || spec.nameRu)} /></dt>
                  <dd className="text-muted-foreground text-right"><RichContent html={getTranslatedField(spec.value, spec.valueRu)} /></dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

FixedBackgroundSpecs.displayName = 'FixedBackgroundSpecs';

// Компонент для обработки HTML видео с добавлением webkit-playsinline и исправлением путей
function VideoHtmlContainer({ html, className }: { html: string; className: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Обрабатываем HTML перед вставкой
  let processedHtml = html
    // Заменяем старые пути /video/ на /api/video/ (в src и в source тегах)
    .replace(/src=["']\/video\//gi, (match) => match.replace('/video/', '/api/video/'))
    // Добавляем webkit-playsinline и muted (если autoplay) к video тегам
    .replace(
      /<video\s+([^>]*?)>/gi,
      (match, attrs) => {
        let newAttrs = attrs;
        
        // Добавляем webkit-playsinline если его нет
        if (!/webkit-playsinline/i.test(newAttrs)) {
          if (/playsinline/i.test(newAttrs)) {
            newAttrs = newAttrs.replace(/playsinline/i, 'playsinline webkit-playsinline');
          } else {
            newAttrs = `${newAttrs} playsinline webkit-playsinline`;
          }
        }
        
        // Если есть autoplay, убеждаемся что есть muted (требование iOS)
        if (/autoplay/i.test(newAttrs) && !/muted/i.test(newAttrs)) {
          newAttrs = `${newAttrs} muted`;
        }
        
        return `<video ${newAttrs}>`;
      }
    );

  // После монтирования обрабатываем уже вставленные видео (только один раз, чтобы не вызывать проблемы производительности)
  useEffect(() => {
    if (!containerRef.current) return;
    const videos = containerRef.current.querySelectorAll('video');
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    videos.forEach((video) => {
      // iOS требует webkit-playsinline для inline воспроизведения
      if (!video.hasAttribute('webkit-playsinline')) {
        video.setAttribute('webkit-playsinline', '');
      }
      if (!video.hasAttribute('playsinline')) {
        video.setAttribute('playsinline', '');
      }
      // iOS требует muted для autoplay
      if (video.hasAttribute('autoplay') && !video.hasAttribute('muted')) {
        video.setAttribute('muted', '');
      }
      // Исправляем пути в source тегах
      const sources = video.querySelectorAll('source');
      sources.forEach((source) => {
        const src = source.getAttribute('src');
        if (src && src.startsWith('/video/')) {
          source.setAttribute('src', src.replace('/video/', '/api/video/'));
        }
      });
      // Исправляем путь в самом video теге, если есть
      const videoSrc = video.getAttribute('src');
      if (videoSrc && videoSrc.startsWith('/video/')) {
        video.setAttribute('src', videoSrc.replace('/video/', '/api/video/'));
      }
      // Принудительно загружаем видео только на iOS и только если видео еще не загружено
      if (isIOS && video.readyState === 0) {
        // Используем requestAnimationFrame чтобы не блокировать скролл
        requestAnimationFrame(() => {
          video.load();
        });
      }
    });
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}

interface VariantSectionProps {
  landingId: string;
  variant: any;
  primaryColor?: string;
  variantIndex?: number;
  formConfig?: any;
}

// Нормализует данные варианта для работы с обеими структурами (старой и JSON)
function normalizeVariant(variant: any) {
  const isJsonVariant = variant.name && variant.slug && !variant.title;
  
  if (isJsonVariant) {
    return {
      id: variant.id,
      title: variant.name,
      subtitle: variant.subtitle || '',
      slug: variant.slug,
      color: variant.color || '',
      images: Array.isArray(variant.images) 
        ? variant.images.map((img: any, idx: number) => ({ 
            id: img.id || `img-${idx}`, 
            url: typeof img === 'string' ? img : (img.url || ''), 
            alt: typeof img === 'string' ? variant.name : (img.alt || variant.name || '')
          }))
        : Array.isArray(variant.gallery)
        ? variant.gallery.map((img: any, idx: number) => ({
            id: img.id || `img-${idx}`,
            url: typeof img === 'string' ? img : (img.url || ''),
            alt: typeof img === 'string' ? variant.name : (img.alt || variant.name || '')
          }))
        : [],
      benefits: Array.isArray(variant.advantages)
        ? variant.advantages.map((adv: any, idx: number) => ({
            id: adv.id || `adv-${idx}`,
            title: adv.title || '',
            text: adv.text || '',
            imageUrl: adv.image || '',
          }))
        : [],
      specifications: Array.isArray(variant.specifications)
        ? variant.specifications.map((spec: any, idx: number) => ({
            id: spec.id || `spec-${idx}`,
            key: spec.name || '',
            value: spec.value || '',
          }))
        : [],
      sizeTables: Array.isArray(variant.sizeTable) && variant.sizeTable.length > 0
        ? variant.sizeTable.map((table: any, idx: number) => ({
            id: table.id || `table-${idx}`,
            title: table.name || '',
            rows: Array.isArray(table.rows)
              ? table.rows.map((row: any, rowIdx: number) => ({
                  id: row.id || `row-${rowIdx}`,
                  sizeLabel: row.sizeLabel || row.name || '',
                  columns: row.columns || {},
                }))
              : [],
          }))
        : [],
      reviews: Array.isArray(variant.reviews)
        ? variant.reviews.map((review: any, idx: number) => ({
            id: review.id || `review-${idx}`,
            authorName: review.name || '',
            rating: review.rating || 5,
            text: review.text || '',
            photoUrl: review.photo || '',
          }))
        : [],
      price: variant.price || 0,
      oldPrice: variant.oldPrice || null,
      currency: variant.currency || 'UAH',
      badgeText: variant.badgeText || '',
      offerText: variant.offerText || '',
      ctaPrimaryText: variant.ctaPrimaryText || '',
      ctaSecondaryPhoneText: variant.ctaSecondaryPhoneText || '',
      primaryPhone: variant.primaryPhone || '',
      // Преобразуем пустые строки в null для видео полей
      videoUrl: (variant.videoUrl && variant.videoUrl.trim()) || null,
      videoTitle: (variant.videoTitle && variant.videoTitle.trim()) || null,
      videoText: (variant.videoText && variant.videoText.trim()) || null,
      videoTitleRu: (variant.videoTitleRu && variant.videoTitleRu.trim()) || null,
      videoTextRu: (variant.videoTextRu && variant.videoTextRu.trim()) || null,
      videoHtmlDesktop: (variant.videoHtmlDesktop && variant.videoHtmlDesktop.trim()) || null,
      videoHtmlMobile: (variant.videoHtmlMobile && variant.videoHtmlMobile.trim()) || null,
      videoUrlDesktop: (variant.videoUrlDesktop && variant.videoUrlDesktop.trim()) || null,
      videoUrlMobile: (variant.videoUrlMobile && variant.videoUrlMobile.trim()) || null,
      repeatOfferBlocks: variant.repeatOfferBlocks || 2,
    };
  }
  
  // Старый вариант - нормализуем структуру
  // Проверяем JSON поля из модели Variant (advantages, specifications, gallery, reviews)
  const advantagesJson = Array.isArray(variant.advantages) ? variant.advantages : [];
  const specificationsJson = Array.isArray(variant.specifications) ? variant.specifications : [];
  const sizeTableJson = variant.sizeTable;
  const reviewsJson = Array.isArray(variant.reviews) ? variant.reviews : [];
  const galleryJson = Array.isArray(variant.gallery) ? variant.gallery : [];
  
  // Нормализуем oldImages в нужный формат
  const normalizedOldImages = Array.isArray(variant.oldImages) 
    ? variant.oldImages.map((img: any, idx: number) => ({
        id: img.id || `img-${idx}`,
        url: img.url || '',
        alt: img.alt || variant.title || '',
      }))
    : [];
  
  const normalized = {
    ...variant,
    id: variant.id,
    title: variant.title || '',
    subtitle: variant.subtitle || '',
    price: variant.price ? Number(variant.price) : 0,
    oldPrice: variant.oldPrice ? Number(variant.oldPrice) : null,
    currency: variant.currency || 'UAH',
    badgeText: variant.badgeText || '',
    offerText: variant.offerText || '',
    ctaPrimaryText: variant.ctaPrimaryText || '',
    ctaSecondaryPhoneText: variant.ctaSecondaryPhoneText || '',
    primaryPhone: variant.primaryPhone || '',
    // Преобразуем пустые строки в null для видео полей
    videoUrl: (variant.videoUrl && variant.videoUrl.trim()) || null,
    videoTitle: (variant.videoTitle && variant.videoTitle.trim()) || null,
    videoText: (variant.videoText && variant.videoText.trim()) || null,
    videoTitleRu: (variant.videoTitleRu && variant.videoTitleRu.trim()) || null,
    videoTextRu: (variant.videoTextRu && variant.videoTextRu.trim()) || null,
    videoHtmlDesktop: (variant.videoHtmlDesktop && variant.videoHtmlDesktop.trim()) || null,
    videoHtmlMobile: (variant.videoHtmlMobile && variant.videoHtmlMobile.trim()) || null,
    videoUrlDesktop: (variant.videoUrlDesktop && variant.videoUrlDesktop.trim()) || null,
    videoUrlMobile: (variant.videoUrlMobile && variant.videoUrlMobile.trim()) || null,
    economyText: variant.economyText || '',
    economyTextRu: variant.economyTextRu || '',
    faqLinkText: variant.faqLinkText || '',
    faqLinkTextRu: variant.faqLinkTextRu || '',
    repeatOfferBlocks: variant.repeatOfferBlocks || 2,
    // Приоритет JSON полям, затем старым связям
    images: galleryJson.length > 0 
      ? galleryJson.map((img: any, idx: number) => ({ 
          id: img.id || `img-${idx}`, 
          url: typeof img === 'string' ? img : (img.url || ''), 
          alt: typeof img === 'string' ? variant.title : (img.alt || variant.title || '')
        }))
      : normalizedOldImages.length > 0
      ? normalizedOldImages
      : [],
    benefits: advantagesJson.length > 0
      ?       advantagesJson.map((adv: any, idx: number) => ({
          id: adv.id || `adv-${idx}`,
          title: adv.title || '',
          text: adv.text || '',
          imageUrl: adv.image || adv.imageUrl || '',
        }))
      : Array.isArray(variant.oldBenefits)
      ? variant.oldBenefits.map((benefit: any, idx: number) => ({
          id: benefit.id || `benefit-${idx}`,
          title: benefit.title || '',
          titleRu: benefit.titleRu || '',
          text: benefit.text || '',
          textRu: benefit.textRu || '',
          imageUrl: benefit.imageUrl || '',
        }))
      : [],
    // Нормализуем specifications - приоритет JSON полю
    specifications: specificationsJson.length > 0
      ?       specificationsJson.map((spec: any, idx: number) => ({
          id: spec.id || `spec-${idx}`,
          key: spec.name || spec.key || '',
          value: spec.value || '',
        }))
      : Array.isArray(variant.oldSpecifications)
      ? variant.oldSpecifications.map((spec: any, idx: number) => ({
          id: spec.id || `spec-${idx}`,
          key: spec.key || spec.name || '',
          keyRu: spec.keyRu || spec.nameRu || '',
          value: spec.value || '',
          valueRu: spec.valueRu || '',
        }))
      : [],
    sizeTables: sizeTableJson && Array.isArray(sizeTableJson) && sizeTableJson.length > 0
      ?       sizeTableJson.map((table: any, idx: number) => ({
          id: table.id || `table-${idx}`,
          title: table.name || table.title || '',
          rows: Array.isArray(table.rows)
            ? table.rows.map((row: any, rowIdx: number) => ({
                id: row.id || `row-${rowIdx}`,
                sizeLabel: row.sizeLabel || row.name || '',
                columns: row.columns || {},
              }))
            : [],
        }))
      : Array.isArray(variant.oldSizeTables)
      ? variant.oldSizeTables.map((table: any, idx: number) => ({
          id: table.id || `table-${idx}`,
          title: table.title || '',
          rows: Array.isArray(table.rows)
            ? table.rows.map((row: any, rowIdx: number) => ({
                id: row.id || `row-${rowIdx}`,
                sizeLabel: row.sizeLabel || '',
                columns: row.columns || {},
              }))
            : [],
        }))
      : [],
    reviews: reviewsJson.length > 0
      ?       reviewsJson.map((review: any, idx: number) => ({
          id: review.id || `review-${idx}`,
          authorName: review.name || review.authorName || '',
          rating: review.rating || 5,
          text: review.text || '',
          photoUrl: review.photo || review.photoUrl || '',
        }))
      : Array.isArray(variant.oldReviews)
      ? variant.oldReviews.map((review: any, idx: number) => ({
          id: review.id || `review-${idx}`,
          authorName: review.authorName || '',
          authorNameRu: review.authorNameRu || '',
          rating: review.rating || 5,
          text: review.text || '',
          textRu: review.textRu || '',
          photoUrl: review.photoUrl || '',
        }))
      : [],
  };
  
  return normalized;
}

const fadeInUp = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const fadeInUpAnimated = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
};

// Хелпер для генерации градиента на основе primaryColor
function getGradientStyle(primaryColor?: string, type: 'text' | 'bg' | 'button' = 'bg') {
  if (!primaryColor) {
    return type === 'text' 
      ? { backgroundImage: 'linear-gradient(to right, #2563eb, #06b6d4, #14b8a6)' }
      : { background: 'linear-gradient(to right, #2563eb, #06b6d4, #14b8a6)' };
  }
  
  // Создаем вариации цвета для градиента
  const color1 = primaryColor;
  const color2 = primaryColor + 'dd';
  const color3 = primaryColor + 'bb';
  
  if (type === 'text') {
    return {
      backgroundImage: `linear-gradient(to right, ${color1}, ${color2}, ${color3})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    };
  }
  
  return {
    background: `linear-gradient(to right, ${color1}, ${color2}, ${color3})`
  };
}

// Хелпер: рендерит HTML-строку через dangerouslySetInnerHTML
// Если контент содержит блочные теги (<p>, <div>, <h*>, <ul>, <table> etc.)
// — рендерим как <div>, иначе как <span>.
// suppressHydrationWarning убирает hydration mismatch при разных server/client значениях.
const BLOCK_TAG_RE = /<(p|div|h[1-6]|ul|ol|li|table|thead|tbody|tr|th|td|blockquote|pre|figure|br)\b/i;

function RichContent({ html, className }: { html: string; className?: string }) {
  const isBlock = html ? BLOCK_TAG_RE.test(html) : false;
  if (isBlock) {
    return (
      <div
        className={className}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: html || '' }}
      />
    );
  }
  return (
    <span
      className={className}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html || '' }}
    />
  );
}

export function VariantSection({ landingId, variant, primaryColor, variantIndex = 0, formConfig }: VariantSectionProps) {
  const { t, language } = useI18n();
  const [formOpen, setFormOpen] = useState(false);
  
  // Хелпер для получения переведенного значения поля
  const getTranslatedField = (ukValue: string | null | undefined, ruValue: string | null | undefined, fallback: string = '') => {
    if (language === 'ru' && ruValue) return ruValue;
    return ukValue || fallback;
  };
  const [currentImage, setCurrentImage] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const ref = useRef(null);
  const specsRef = useRef(null);
  // Используем useInView только для тех элементов, которые реально нужны для анимаций
  // Убираем неиспользуемые хуки чтобы не вызывать ре-рендеры при скролле
  const isInView = useInView(ref, { once: true, margin: '-50px', amount: 0 });

  const normalizedVariant = normalizeVariant(variant);
  

  const discount = normalizedVariant.oldPrice
    ? Math.round(((normalizedVariant.oldPrice - normalizedVariant.price) / normalizedVariant.oldPrice) * 100)
    : 0;

  const scrollToFAQ = () => {
    document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const delta = e.targetTouches[0].clientX - touchStart;
    setDragOffset(delta);
  };

  const handleTouchEnd = () => {
    if (touchStart === null) return;
    if (dragOffset > 50 && normalizedVariant.images && normalizedVariant.images.length > 0) {
      setCurrentImage((prev) => (prev === 0 ? normalizedVariant.images.length - 1 : prev - 1));
    } else if (dragOffset < -50 && normalizedVariant.images && normalizedVariant.images.length > 0) {
      setCurrentImage((prev) => (prev === normalizedVariant.images.length - 1 ? 0 : prev + 1));
    }
    setTouchStart(null);
    setDragOffset(0);
  };


  return (
    <section 
      ref={ref}
      className="py-16 md:py-24 relative -mt-1" 
      id={`variant-${normalizedVariant.id}`}
    >
      {/* Декоративный фон — управляется через CSS-переменные темы */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, var(--th-hero-from) 0%, var(--th-hero-via) 50%, var(--th-hero-to) 100%)', opacity: 0.95 }} />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-3xl pointer-events-none" style={{ background: `radial-gradient(circle, var(--th-orb-1), var(--th-orb-2), transparent)` }} />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full blur-3xl pointer-events-none" style={{ background: `radial-gradient(circle, var(--th-orb-2), var(--th-orb-3), transparent)` }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none" style={{ background: `radial-gradient(circle, var(--th-orb-3), var(--th-orb-1), transparent)` }} />
      
      <div className="container mx-auto px-4 relative z-10 w-full max-w-full">
        <div className="max-w-7xl mx-auto w-full">
          {/* Заголовок секции - только на десктопе */}
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={isInView ? fadeInUpAnimated : fadeInUp}
            className="hidden md:block text-center mb-12 md:mb-16"
          >
            {normalizedVariant.badgeText && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.2 }}
                className="inline-block mb-4"
              >
                <Badge 
                  className="px-4 py-1.5 text-sm font-semibold text-white border-0 shadow-lg"
                  variant="secondary"
                  style={getGradientStyle(primaryColor, 'bg')}
                >
                  <Sparkles className="w-3 h-3 mr-1.5 inline" />
                  {getTranslatedField(normalizedVariant.badgeText, normalizedVariant.badgeTextRu)}
                </Badge>
              </motion.div>
            )}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, var(--th-title-from), var(--th-title-via), var(--th-title-to))' }}>
              {getTranslatedField(normalizedVariant.title, normalizedVariant.titleRu)}
            </h2>
            {normalizedVariant.subtitle && (
              <div className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                <RichContent html={getTranslatedField(normalizedVariant.subtitle, normalizedVariant.subtitleRu)} />
              </div>
            )}
          </motion.div>

          {/* Основной блок с изображением и информацией */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-12 mb-8 md:mb-12">
            {/* Галерея изображений */}
            <motion.div
              initial="initial"
              animate={isInView ? "animate" : "initial"}
              variants={isInView ? fadeInUpAnimated : fadeInUp}
              className="order-1"
            >
              {normalizedVariant.images && normalizedVariant.images.length > 0 ? (
                <div className="space-y-4">
                  <div
                    className="relative aspect-[9/16] md:aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100/50 via-blue-100/50 to-cyan-100/50 dark:from-slate-900/30 dark:via-blue-900/30 dark:to-cyan-900/30 shadow-2xl cursor-pointer max-h-[70vh] md:max-h-none mx-auto md:hover:scale-[1.02] transition-transform duration-300"
                    style={{ touchAction: 'pan-y' }}
                    onClick={() => setGalleryOpen(true)}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {/* SLIDE TRACK — все картинки в ряд */}
                    <div
                      className="flex h-full"
                      style={{
                        width: `${normalizedVariant.images.length * 100}%`,
                        transform: `translateX(calc(-${currentImage * (100 / normalizedVariant.images.length)}% + ${dragOffset / normalizedVariant.images.length}px))`,
                        transition: touchStart !== null ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        willChange: 'transform',
                      }}
                    >
                      {normalizedVariant.images.map((img: any, i: number) => (
                        <div
                          key={img.id || i}
                          className="relative flex-shrink-0 h-full"
                          style={{ width: `${100 / normalizedVariant.images.length}%` }}
                        >
                          <Image
                            src={img.url || '/placeholder.svg'}
                            alt={img.alt || getTranslatedField(normalizedVariant.title, normalizedVariant.titleRu)}
                            fill
                            className="object-cover"
                            priority={i === 0}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    
                    {/* Стрелки навигации - всегда видимые */}
                    {normalizedVariant.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImage((prev) => (prev === 0 ? normalizedVariant.images.length - 1 : prev - 1));
                          }}
                          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white backdrop-blur-sm rounded-full p-2 md:p-3 shadow-xl border-2 border-blue-200/50 hover:border-purple-400 transition-all hover:scale-110"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImage((prev) => (prev === normalizedVariant.images.length - 1 ? 0 : prev + 1));
                          }}
                          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white backdrop-blur-sm rounded-full p-2 md:p-3 shadow-xl border-2 border-blue-200/50 hover:border-purple-400 transition-all hover:scale-110"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                        </button>
                      </>
                    )}
                    
                    {/* Индикатор текущего изображения */}
                    {normalizedVariant.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {normalizedVariant.images.map((_: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImage(idx);
                            }}
                            className={`w-2 h-2 rounded-full transition-all ${
                              idx === currentImage 
                                ? 'bg-white w-8' 
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {normalizedVariant.images.length > 1 && (
                    <div className="hidden md:grid grid-cols-4 gap-3">
                      {normalizedVariant.images.map((img: any, idx: number) => (
                        <motion.button
                          key={img.id || idx}
                          onClick={() => setCurrentImage(idx)}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                            currentImage === idx 
                              ? 'border-primary shadow-lg scale-105' 
                              : 'border-transparent hover:border-primary/50'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Image
                            src={img.url}
                            alt={img.alt || ''}
                            fill
                            className="object-cover"
                          />
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shadow-xl">
                  <span className="text-muted-foreground">{t.common.noImage}</span>
                </div>
              )}
              
              {/* Описание под галереей - только на мобильных */}
              {normalizedVariant.offerText && (
                <motion.div
                  className="text-lg md:text-xl text-muted-foreground leading-relaxed mt-4 md:hidden prose prose-sm max-w-none"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <RichContent html={getTranslatedField(normalizedVariant.offerText, normalizedVariant.offerTextRu)} />
                </motion.div>
              )}
            </motion.div>

            {/* Информация о товаре */}
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0 }}
              variants={fadeInUp}
              className="flex flex-col justify-center space-y-6 order-2"
            >
              {/* Заголовок - только на мобильных */}
              <div className="md:hidden text-center space-y-4">
                {normalizedVariant.badgeText && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0 }}
                    transition={{ delay: 0.1 }}
                    className="inline-block"
                  >
                    <Badge 
                      className="px-4 py-1.5 text-sm font-semibold text-white border-0 shadow-lg"
                      style={{ background: 'linear-gradient(to right, var(--th-badge-from), var(--th-badge-to))' }}
                      variant="secondary"
                    >
                      <Sparkles className="w-3 h-3 mr-1.5 inline" />
                      {getTranslatedField(normalizedVariant.badgeText, normalizedVariant.badgeTextRu)}
                    </Badge>
                  </motion.div>
                )}
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-3xl font-bold th-title-gradient"
                >
                  {getTranslatedField(normalizedVariant.title, normalizedVariant.titleRu)}
                </motion.h2>
                {normalizedVariant.subtitle && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-base text-muted-foreground prose prose-sm max-w-none"
                  >
                    <RichContent html={getTranslatedField(normalizedVariant.subtitle, normalizedVariant.subtitleRu)} />
                  </motion.div>
                )}
              </div>

              {normalizedVariant.offerText && (
                <motion.div
                  className="hidden md:block text-lg md:text-xl text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <RichContent html={getTranslatedField(normalizedVariant.offerText, normalizedVariant.offerTextRu)} />
                </motion.div>
              )}

              {/* Цена */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2 relative"
              >
                <div className="flex items-baseline gap-4 flex-wrap relative z-10">
                  <span
                    className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(to right, var(--th-btn-from), var(--th-btn-via), var(--th-btn-to))',
                    }}
                  >
                    {normalizedVariant.price} {normalizedVariant.currency}
                  </span>
                  {normalizedVariant.oldPrice && (
                    <span className="text-2xl line-through" style={{ color: 'var(--th-text-muted)' }}>
                      {normalizedVariant.oldPrice} {normalizedVariant.currency}
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border-2 shadow-lg relative z-20"
                    style={{
                      borderColor: '#22c55e'
                    }}
                  >
                    <span className="font-bold text-lg" style={{ color: '#29a350' }}>
                      {getTranslatedField(normalizedVariant.economyText, normalizedVariant.economyTextRu, t.common.economy)}: {discount}%
                    </span>
                    <span className="text-sm" style={{ color: '#29a350' }}>
                      ({normalizedVariant.oldPrice - normalizedVariant.price} {normalizedVariant.currency})
                    </span>
                  </motion.div>
                )}
              </motion.div>

              {/* Кнопки действий */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3 pt-4"
              >
                {/* Таймер обратного отсчета */}
                <CountdownTimer />
                
                <Button
                  size="lg"
                  className="w-full text-lg py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-white border-0 font-bold"
                  style={{ background: 'linear-gradient(to right, var(--th-btn-from), var(--th-btn-via), var(--th-btn-to))' }}
                  onClick={() => setFormOpen(true)}
                >
                  {getTranslatedField(normalizedVariant.ctaPrimaryText, normalizedVariant.ctaPrimaryTextRu, t.common.orderNow)}
                </Button>

                {normalizedVariant.primaryPhone && (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full text-lg py-6 border-2 hover:bg-primary/5 transition-all"
                    asChild
                  >
                    <a href={`tel:${normalizedVariant.primaryPhone}`}>
                      <Phone className="mr-2 h-5 w-5" />
                      {getTranslatedField(normalizedVariant.ctaSecondaryPhoneText, normalizedVariant.ctaSecondaryPhoneTextRu, normalizedVariant.primaryPhone || '')}
                    </a>
                  </Button>
                )}
              </motion.div>

              <motion.button
                onClick={scrollToFAQ}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline text-left"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0 }}
                transition={{ delay: 0.5 }}
              >
                {getTranslatedField(normalizedVariant.faqLinkText, normalizedVariant.faqLinkTextRu, t.common.frequentlyAskedQuestions)}
              </motion.button>
            </motion.div>
          </div>

          {/* Видео блок — lazy loading для быстрой загрузки */}
          {(() => {
            // Нормализуем все видео поля: trim и проверяем что не пустые
            const videoHtmlDesktop = normalizedVariant.videoHtmlDesktop?.trim() || null;
            const videoHtmlMobile = normalizedVariant.videoHtmlMobile?.trim() || null;
            const videoUrlDesktop = normalizedVariant.videoUrlDesktop?.trim() || null;
            const videoUrlMobile = normalizedVariant.videoUrlMobile?.trim() || null;
            const videoUrl = normalizedVariant.videoUrl?.trim() || null;
            
            // Проверяем что хотя бы одно поле не null и не пустая строка
            const hasVideo = 
              (videoHtmlDesktop && videoHtmlDesktop.length > 0) ||
              (videoHtmlMobile && videoHtmlMobile.length > 0) ||
              (videoUrlDesktop && videoUrlDesktop.length > 0) ||
              (videoUrlMobile && videoUrlMobile.length > 0) ||
              (videoUrl && videoUrl.length > 0);
            
            if (!hasVideo) return null;
            
            return (
              <div className="mb-12 md:mb-16 -mt-6 md:-mt-4">
                {normalizedVariant.videoTitle && (
                  <h3 className="text-3xl font-bold mb-3">{getTranslatedField(normalizedVariant.videoTitle, normalizedVariant.videoTitleRu)}</h3>
                )}
                {normalizedVariant.videoText && (
                  <div className="text-muted-foreground mb-6 text-lg prose prose-sm max-w-none">
                    <RichContent html={getTranslatedField(normalizedVariant.videoText, normalizedVariant.videoTextRu)} />
                  </div>
                )}

                {/* Десктоп: кастомный HTML */}
                {videoHtmlDesktop && videoHtmlDesktop.length > 0 && (
                  <VideoHtmlContainer
                    html={normalizedVariant.videoHtmlDesktop!}
                    className="hidden md:flex justify-center items-center rounded-2xl overflow-hidden shadow-2xl bg-muted/50"
                  />
                )}
                {/* Десктоп: YouTube URL с lazy loading */}
                {(!videoHtmlDesktop || videoHtmlDesktop.length === 0) && 
                 ((videoUrlDesktop && videoUrlDesktop.length > 0) || 
                  ((!videoUrlMobile || videoUrlMobile.length === 0) && 
                   (videoUrl && videoUrl.length > 0))) && (
                  <div className="hidden md:block rounded-2xl overflow-hidden shadow-2xl bg-muted relative w-full" style={{ aspectRatio: '16/9' }}>
                    <iframe
                      src={videoUrlDesktop || videoUrl || ''}
                      className="w-full h-full"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Мобайл: кастомный HTML */}
                {videoHtmlMobile && videoHtmlMobile.length > 0 && (
                  <VideoHtmlContainer
                    html={normalizedVariant.videoHtmlMobile!}
                    className="flex md:hidden justify-center items-center rounded-2xl overflow-hidden shadow-2xl bg-muted/50"
                  />
                )}
                {/* Мобайл: YouTube URL с lazy loading */}
                {(!videoHtmlMobile || videoHtmlMobile.length === 0) && 
                 ((videoUrlMobile && videoUrlMobile.length > 0) || 
                  ((!videoUrlDesktop || videoUrlDesktop.length === 0) && 
                   (videoUrl && videoUrl.length > 0))) && (
                  <div className="block md:hidden rounded-2xl overflow-hidden shadow-2xl bg-muted relative w-full" style={{ aspectRatio: '16/9' }}>
                    <iframe
                      src={videoUrlMobile || videoUrl || ''}
                      className="w-full h-full"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Если только videoUrl без десктоп/мобайл разделения — показываем на всех с lazy loading */}
                {(!videoHtmlDesktop || videoHtmlDesktop.length === 0) && 
                 (!videoHtmlMobile || videoHtmlMobile.length === 0) && 
                 (!videoUrlDesktop || videoUrlDesktop.length === 0) && 
                 (!videoUrlMobile || videoUrlMobile.length === 0) && 
                 (videoUrl && videoUrl.length > 0) && (
                  <div className="rounded-2xl overflow-hidden shadow-2xl bg-muted relative w-full" style={{ aspectRatio: '16/9' }}>
                    <iframe
                      src={videoUrl}
                      className="w-full h-full"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            );
          })()}

          {/* Преимущества */}
          {normalizedVariant.benefits && normalizedVariant.benefits.length > 0 && (
            <div
              className="mb-12 md:mb-16"
            >
              <h3 className="text-3xl md:text-4xl font-bold mb-4 text-center th-title-gradient">
                {t.common.advantages}
              </h3>

              {normalizedVariant.subtitle && (
                <div className="text-lg md:text-xl font-bold mb-8 text-center th-title-gradient prose prose-sm max-w-none">
                  <RichContent html={getTranslatedField(normalizedVariant.subtitle, normalizedVariant.subtitleRu)} />
                </div>
              )}

              {/* Карточки преимуществ — простая сетка, без карусели */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 w-full place-items-start ${
                normalizedVariant.benefits.length === 1 ? 'lg:grid-cols-1' :
                normalizedVariant.benefits.length === 2 ? 'lg:grid-cols-2' :
                normalizedVariant.benefits.length === 3 ? 'lg:grid-cols-3' :
                'lg:grid-cols-4'
              }`}>
                {normalizedVariant.benefits.map((benefit: any, idx: number) => {
                  const galleryIndex = normalizedVariant.images && normalizedVariant.images.length > 0
                    ? (idx + 1) % normalizedVariant.images.length
                    : -1;
                  const benefitImage = benefit.imageUrl
                    || (galleryIndex >= 0 && normalizedVariant.images[galleryIndex]?.url)
                    || '';

                  // Цвета для каждой карточки
                  const cardColors = [
                    { border: 'from-blue-400 to-cyan-400', glow: 'hover:shadow-blue-200/60 dark:hover:shadow-blue-900/60', num: 'from-blue-500 to-cyan-500', ring: 'border-blue-300 dark:border-blue-600' },
                    { border: 'from-cyan-400 to-teal-400', glow: 'hover:shadow-cyan-200/60 dark:hover:shadow-cyan-900/60', num: 'from-cyan-500 to-teal-500', ring: 'border-cyan-300 dark:border-cyan-600' },
                    { border: 'from-teal-400 to-emerald-400', glow: 'hover:shadow-teal-200/60 dark:hover:shadow-teal-900/60', num: 'from-teal-500 to-emerald-500', ring: 'border-teal-300 dark:border-teal-600' },
                    { border: 'from-indigo-400 to-blue-400', glow: 'hover:shadow-indigo-200/60 dark:hover:shadow-indigo-900/60', num: 'from-indigo-500 to-blue-500', ring: 'border-indigo-300 dark:border-indigo-600' },
                  ];
                  const color = cardColors[idx % cardColors.length];

                  return (
                    <div
                      key={benefit.id}
                      className="w-full flex flex-col items-center group"
                    >
                      {/* Кружок с картинкой — над карточкой */}
                      {benefitImage && (
                        <div className={`relative w-40 h-40 rounded-full overflow-hidden border-4 ${color.ring} shadow-2xl -mb-6 z-10 transition-transform duration-300 group-hover:scale-105`}>
                          <Image
                            src={benefitImage}
                            alt={getTranslatedField(benefit.title, benefit.titleRu)}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Карточка */}
                      <div className={`w-full relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 ${color.glow} hover:shadow-2xl shadow-lg`}>
                        {/* Градиентная рамка сверху */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color.border}`} />

                        {/* Фоновые декоративные круги */}
                        <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-gradient-to-br from-blue-100/60 to-cyan-100/60 dark:from-blue-900/20 dark:to-cyan-900/20 blur-xl" />
                        <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100/40 to-purple-100/40 dark:from-indigo-900/10 dark:to-purple-900/10 blur-lg" />

                        {/* Контент */}
                        <div className={`relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm ${benefitImage ? 'pt-12' : 'pt-6'} pb-8 px-6 flex flex-col items-center`}>
                          {/* Номер карточки */}
                          <div className={`absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br ${color.border} flex items-center justify-center text-white text-xs font-bold shadow-md`}>
                            {idx + 1}
                          </div>

                          {/* Иконка звёздочки если нет картинки */}
                          {!benefitImage && (
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${color.border} flex items-center justify-center mb-4 shadow-lg`}>
                              <span className="text-white text-xl">✦</span>
                            </div>
                          )}

                          <div className={`font-bold mb-3 text-center text-xl bg-gradient-to-r ${color.num} bg-clip-text text-transparent`}>
                            <RichContent html={getTranslatedField(benefit.title, benefit.titleRu)} />
                          </div>

                          {/* Разделитель */}
                          <div className={`w-12 h-0.5 bg-gradient-to-r ${color.border} mb-3 rounded-full`} />

                          <div className="text-sm text-muted-foreground text-center leading-relaxed prose prose-sm max-w-none">
                            <RichContent html={getTranslatedField(benefit.text, benefit.textRu)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Таблицы размеров — HTML-рендер */}
          {(() => {
            const htmlContent = language === 'ru' && normalizedVariant.sizeTableHtmlRu
              ? normalizedVariant.sizeTableHtmlRu
              : normalizedVariant.sizeTableHtml;

            // Убираем <style> теги из HTML чтобы не ломать страницу
            const sanitized = htmlContent
              ? htmlContent.replace(/<style[\s\S]*?<\/style>/gi, '')
              : '';

            // Старый формат — если нет нового HTML, рендерим старые sizeTables
            if (!sanitized && normalizedVariant.sizeTables && normalizedVariant.sizeTables.length > 0) {
              return (
                <motion.div
                  initial="initial"
                  animate={isInView ? 'animate' : 'initial'}
                  variants={isInView ? fadeInUpAnimated : fadeInUp}
                  className="mb-12 md:mb-16"
                >
                  <h3 className="text-3xl md:text-4xl font-bold mb-8 th-title-gradient">{t.common.sizeTables}</h3>
                  {normalizedVariant.sizeTables.map((table: any) => (
                    <div key={table.id} className="mb-8">
                      {normalizedVariant.sizeTables.length > 1 && (
                        <h4 className="text-xl font-semibold mb-4">{table.title}</h4>
                      )}
                      <div className="overflow-x-auto rounded-xl border-2 border-blue-200/50 dark:border-blue-800/50 shadow-lg bg-white dark:bg-gray-900">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-blue-100 via-cyan-100 to-teal-100 dark:from-blue-900/50 dark:via-cyan-900/50 dark:to-teal-900/50">
                            <tr>
                              <th className="border p-3 text-left font-bold">{t.common.size || 'Розмір'}</th>
                              {table.rows[0] && Object.keys(table.rows[0].columns).map((key: string) => (
                                <th key={key} className="border p-3 text-left font-bold capitalize">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {table.rows.map((row: any, rowIdx: number) => (
                              <tr key={row.id} className={rowIdx % 2 === 0 ? 'bg-muted/30' : 'bg-background'}>
                                <td className="border p-3 font-semibold">{row.sizeLabel}</td>
                                {Object.values(row.columns).map((value: any, idx: number) => (
                                  <td key={idx} className="border p-3">{value}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </motion.div>
              );
            }

            if (!sanitized) return null;

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5 }}
                className="mb-12 md:mb-16"
              >
                <h3 className="text-3xl md:text-4xl font-bold mb-8 th-title-gradient">
                  {t.common.sizeTables}
                </h3>
                <div
                  className="size-table-html"
                  dangerouslySetInnerHTML={{ __html: sanitized }}
                />
              </motion.div>
            );
          })()}

          {/* Характеристики */}
          {normalizedVariant.specifications && Array.isArray(normalizedVariant.specifications) && normalizedVariant.specifications.length > 0 && (
            <FixedBackgroundSpecs
              ref={specsRef}
              backgroundImage={normalizedVariant.specificationsBackgroundImage || normalizedVariant.specsBackgroundImage || (normalizedVariant.images && normalizedVariant.images.length > 1 ? normalizedVariant.images[1]?.url : undefined)}
              fixedBackground={normalizedVariant.specificationsFixedBackground ?? normalizedVariant.specsBackgroundFixed ?? false}
              specifications={normalizedVariant.specifications}
              t={t}
              getTranslatedField={getTranslatedField}
            />
          )}

          {/* Кнопки после Характеристик */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 md:mb-16 flex flex-col gap-4 max-w-md mx-auto"
          >
            <Button
              size="lg"
              className="w-full text-lg py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-white border-0 font-bold"
              style={{ background: 'linear-gradient(to right, var(--th-btn-from), var(--th-btn-via), var(--th-btn-to))' }}
              onClick={() => setFormOpen(true)}
            >
              {normalizedVariant.ctaPrimaryText || t.common.orderNow}
            </Button>

            {normalizedVariant.primaryPhone && (
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full text-lg py-6 border-2 hover:bg-primary/5 transition-all"
                asChild
              >
                <a href={`tel:${normalizedVariant.primaryPhone}`}>
                  <Phone className="mr-2 h-5 w-5" />
                  {normalizedVariant.ctaSecondaryPhoneText || normalizedVariant.primaryPhone}
                </a>
              </Button>
            )}
          </motion.div>

        </div>
      </div>

      <LeadForm
        landingId={landingId}
        variantId={normalizedVariant.id}
        variantTitle={getTranslatedField(normalizedVariant.title, normalizedVariant.titleRu)}
        variantPrice={normalizedVariant.price}
        variantOldPrice={normalizedVariant.oldPrice}
        variantCurrency={normalizedVariant.currency || 'UAH'}
        variantImage={normalizedVariant.images?.[0]?.url || undefined}
        open={formOpen}
        onOpenChange={setFormOpen}
        formConfig={formConfig}
      />

      {galleryOpen && normalizedVariant.images && normalizedVariant.images.length > 0 && (
        <ImageGallery
          images={normalizedVariant.images.map((img: any) => ({
            url: typeof img === 'string' ? img : (img.url || ''),
            alt: typeof img === 'string' ? getTranslatedField(normalizedVariant.title, normalizedVariant.titleRu) : (img.alt || getTranslatedField(normalizedVariant.title, normalizedVariant.titleRu)),
          }))}
          currentIndex={currentImage}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </section>
  );
}
