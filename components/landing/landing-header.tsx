'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { LanguageSwitcher } from './language-switcher';

interface Variant {
  id: string;
  title?: string;
  name?: string;
  images?: Array<{ url: string; alt?: string }>;
  oldImages?: Array<{ url: string; alt?: string }>;
  gallery?: Array<{ url: string; alt?: string }>;
  color?: string;
}

interface LandingHeaderProps {
  variants?: Variant[];
  logoUrl?: string | null;
  showLanguageSwitcher?: boolean;
}

export function LandingHeader({ variants, logoUrl, showLanguageSwitcher = true }: LandingHeaderProps) {
  const scrollToVariant = (variantId: string) => {
    const element = document.getElementById(`variant-${variantId}`);
    if (element) {
      const headerHeight = 80; // Высота шапки
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Нормализуем варианты для получения изображений
  const normalizedVariants = variants?.map((variant) => {
    const images = variant.images || variant.gallery || variant.oldImages || [];
    const firstImage = images.length > 0 ? images[0] : null;
    
    return {
      id: variant.id,
      title: variant.title || variant.name || '',
      imageUrl: firstImage?.url || '',
      imageAlt: firstImage?.alt || variant.title || variant.name || '',
      color: variant.color || '',
    };
  }).filter(v => v.imageUrl) || [];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm"
    >
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-between h-16 md:h-20 gap-4">
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative h-10 md:h-12 w-auto"
              >
                <Image
                  src={logoUrl}
                  alt="Logo"
                  width={120}
                  height={48}
                  className="h-full w-auto object-contain"
                  priority
                />
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:block text-xl md:text-2xl font-bold bg-clip-text text-transparent"
                style={{ color: '#29bdd2' }}
              >
                Landing Conveyor
              </motion.div>
            )}
          </div>
          
          {/* Кнопки перехода на варианты - по центру */}
          {normalizedVariants.length > 1 && (
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-3">
              {normalizedVariants.map((variant, idx) => (
                <motion.button
                  key={variant.id}
                  onClick={() => scrollToVariant(variant.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-transparent hover:border-blue-400 dark:hover:border-cyan-400 transition-all shadow-md hover:shadow-lg"
                  aria-label={variant.title}
                >
                  <Image
                    src={variant.imageUrl}
                    alt={variant.imageAlt}
                    fill
                    className="object-cover"
                  />
                </motion.button>
              ))}
            </div>
          )}
          
          {showLanguageSwitcher && (
            <div className="ml-auto">
              <LanguageSwitcher />
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
