'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface HeroSectionProps {
  heroImages?: Array<{ url: string; alt?: string }> | null;
  pageTitle?: string | null;
  introText?: string | null;
  primaryColor?: string | null;
}

export function HeroSection({ heroImages, pageTitle, introText, primaryColor }: HeroSectionProps) {
  const primaryColorStyle = primaryColor 
    ? { 
        '--primary': primaryColor,
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`
      } as React.CSSProperties
    : {};

  if (heroImages && Array.isArray(heroImages) && heroImages.length > 0) {
    return (
      <section className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroImages[0].url}
            alt={heroImages[0].alt || pageTitle || ''}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
        
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-4xl">
            {pageTitle && (
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              >
                {pageTitle}
              </motion.h1>
            )}
            {introText && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                className="text-xl md:text-2xl text-white/90 leading-relaxed"
              >
                {introText}
              </motion.p>
            )}
          </div>
        </div>

        {/* Декоративные элементы */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>
    );
  }

  if (pageTitle) {
    return (
      <section className="relative py-20 md:py-32 overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--th-hero-from) 0%, var(--th-hero-via) 50%, var(--th-hero-to) 100%)' }}>
        {/* Декоративный фон */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, var(--th-orb-1), var(--th-orb-2), transparent)` }} />
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, var(--th-orb-2), var(--th-orb-3), transparent)` }} />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 th-title-gradient"
            >
              {pageTitle}
            </motion.h1>
            {introText && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                className="text-xl md:text-2xl text-muted-foreground leading-relaxed"
              >
                {introText}
              </motion.p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return null;
}
