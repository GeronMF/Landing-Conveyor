'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, Facebook, Instagram, Twitter, Youtube, Linkedin, X, Music2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';

interface LandingFooterProps {
  companyName?: string;
  legalText?: string;
  legalTextRu?: string;
  phone?: string;
  email?: string;
  socials?: Record<string, string>;
  links?: Record<string, string>;
  privacyPolicyText?: string;
  privacyPolicyTextRu?: string;
  termsText?: string;
  termsTextRu?: string;
  copyrightText?: string;
  copyrightTextRu?: string;
}

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  tiktok: Music2,
};

interface PolicyModalProps {
  title: string;
  html: string;
  onClose: () => void;
}

function PolicyModal({ title, html, onClose }: PolicyModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Modal */}
        <motion.div
          className="relative z-10 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-bold th-title-gradient">
              {title}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
              <X className="w-5 h-5" />
            </Button>
          </div>
          {/* Content */}
          <div className="overflow-y-auto px-6 py-5 prose prose-sm max-w-none text-sm text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {/* Footer */}
          <div className="px-6 py-4 border-t flex justify-end">
            <Button onClick={onClose} className="text-white" style={{ background: 'linear-gradient(to right, var(--th-btn-from), var(--th-btn-to))' }}>
              Закрити
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function LandingFooter({
  companyName,
  legalText,
  legalTextRu,
  phone,
  email,
  socials,
  privacyPolicyText,
  privacyPolicyTextRu,
  termsText,
  termsTextRu,
  copyrightText,
  copyrightTextRu,
}: LandingFooterProps) {
  const { t, language } = useI18n();
  const [openModal, setOpenModal] = useState<'privacy' | 'terms' | null>(null);
  const [currentYear, setCurrentYear] = useState<number>(2024);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const currentLegalText = language === 'ru' && legalTextRu ? legalTextRu : legalText;
  const currentPrivacyText = language === 'ru' && privacyPolicyTextRu ? privacyPolicyTextRu : privacyPolicyText;
  const currentTermsText = language === 'ru' && termsTextRu ? termsTextRu : termsText;

  const hasSocials = socials && Object.values(socials).some(v => v);
  const hasLinks = currentPrivacyText || currentTermsText;

  return (
    <>
      <footer className="relative overflow-hidden border-t -mt-1 pb-0" style={{ background: 'linear-gradient(135deg, var(--th-hero-from) 0%, var(--th-hero-via) 50%, var(--th-hero-to) 100%)' }}>
        {/* Декоративный фон */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, var(--th-orb-1), var(--th-orb-2), transparent)` }} />
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, var(--th-orb-2), var(--th-orb-3), transparent)` }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto pt-6 md:pt-8">
            <div className={`grid gap-8 md:gap-12 mb-4 ${hasSocials ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>

              {/* О компании */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {companyName && (
                  <h3 className="font-bold text-xl mb-4 th-title-gradient">
                    {companyName}
                  </h3>
                )}
                {currentLegalText && (
                  /<[a-z][\s\S]*>/i.test(currentLegalText)
                    ? <div className="text-sm leading-relaxed prose prose-sm max-w-none" style={{ color: 'var(--th-text-muted)' }} dangerouslySetInnerHTML={{ __html: currentLegalText }} />
                    : <p className="text-sm leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>{currentLegalText}</p>
                )}
              </motion.div>

              {/* Контакты */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h4 className="font-semibold mb-4 text-lg" style={{ color: 'var(--th-text-primary)' }}>Контакти</h4>
                <div className="space-y-3">
                  {phone && (
                    <motion.a
                      href={`tel:${phone}`}
                      className="flex items-center gap-3 text-sm transition-colors group"
                      style={{ color: 'var(--th-text-primary)' }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="p-2 rounded-lg transition-colors" style={{ background: 'color-mix(in srgb, var(--th-btn-via) 20%, transparent)' }}>
                        <Phone className="w-4 h-4" style={{ color: 'var(--th-btn-via)' }} />
                      </div>
                      <span>{phone}</span>
                    </motion.a>
                  )}
                  {email && (
                    <motion.a
                      href={`mailto:${email}`}
                      className="flex items-center gap-3 text-sm transition-colors group"
                      style={{ color: 'var(--th-text-primary)' }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="p-2 rounded-lg transition-colors" style={{ background: 'color-mix(in srgb, var(--th-btn-via) 20%, transparent)' }}>
                        <Mail className="w-4 h-4" style={{ color: 'var(--th-btn-via)' }} />
                      </div>
                      <span>{email}</span>
                    </motion.a>
                  )}
                </div>
              </motion.div>

              {/* Социальные сети */}
              {hasSocials && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h4 className="font-semibold mb-4 text-lg" style={{ color: 'var(--th-text-primary)' }}>Соціальні мережі</h4>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(socials!).filter(([, url]) => url).map(([name, url]) => {
                      const Icon = socialIcons[name.toLowerCase()] || Facebook;
                      return (
                        <motion.a
                          key={name}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl transition-all group"
                          style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--th-btn-from) 20%, white), color-mix(in srgb, var(--th-btn-via) 20%, white))' }}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: 'var(--th-btn-via)' }} />
                        </motion.a>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Ссылки-попапы */}
            {hasLinks && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="border-t border-border/40 pt-6 flex flex-wrap gap-6 justify-center"
              >
                {currentPrivacyText && (
                  <button
                    onClick={() => setOpenModal('privacy')}
                    className="text-sm transition-colors relative group hover:opacity-80"
                    style={{ color: 'var(--th-text-muted)' }}
                  >
                    Політика конфіденційності
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all group-hover:w-full" style={{ background: 'linear-gradient(to right, var(--th-btn-from), var(--th-btn-via))' }} />
                  </button>
                )}
                {currentTermsText && (
                  <button
                    onClick={() => setOpenModal('terms')}
                    className="text-sm transition-colors relative group hover:opacity-80"
                    style={{ color: 'var(--th-text-muted)' }}
                  >
                    Повернення та обмін товарів
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all group-hover:w-full" style={{ background: 'linear-gradient(to right, var(--th-btn-from), var(--th-btn-via))' }} />
                  </button>
                )}
              </motion.div>
            )}

            {/* Копирайт */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center text-sm mt-3 pt-3 pb-0 border-t border-border/40"
              style={{ color: 'var(--th-text-muted)' }}
            >
              <span suppressHydrationWarning>{currentYear}</span>{' '}{(language === 'ru' && copyrightTextRu ? copyrightTextRu : copyrightText) || `© ${companyName || 'Всі права захищені'}`}
            </motion.div>
          </div>
        </div>
      </footer>

      {/* Попапы */}
      {openModal === 'privacy' && currentPrivacyText && (
        <PolicyModal
          title="Політика конфіденційності"
          html={currentPrivacyText}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === 'terms' && currentTermsText && (
        <PolicyModal
          title="Повернення та обмін товарів"
          html={currentTermsText}
          onClose={() => setOpenModal(null)}
        />
      )}
    </>
  );
}
