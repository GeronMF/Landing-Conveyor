'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

interface FAQSectionProps {
  title: string;
  faqs: Array<{
    id: string;
    question: string;
    questionRu?: string | null;
    answer: string;
    answerRu?: string | null;
    isOpen?: boolean;
  }>;
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

export function FAQSection({ title, faqs }: FAQSectionProps) {
  const { language } = useI18n();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  // Хелпер для получения переведенного значения поля
  const getTranslatedField = (ukValue: string | null | undefined, ruValue: string | null | undefined, fallback: string = '') => {
    if (language === 'ru' && ruValue) return ruValue;
    return ukValue || fallback;
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <section 
      ref={ref}
      id="faq-section" 
      className="py-16 md:py-24 relative overflow-hidden -mt-1"
      style={{ background: 'linear-gradient(135deg, var(--th-hero-from) 0%, var(--th-hero-via) 50%, var(--th-hero-to) 100%)' }}
    >
      {/* Декоративный фон */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-bold mb-12 text-center th-title-gradient"
          >
            {title}
          </motion.h2>

          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={{
              initial: {},
              animate: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            <Accordion
              type="multiple"
              defaultValue={faqs.filter(f => f.isOpen).map(f => f.id)}
              className="w-full space-y-4"
            >
              {faqs.map((faq) => {
                const answerHtml = getTranslatedField(faq.answer, faq.answerRu);
                const isHtml = /<[a-z][\s\S]*>/i.test(answerHtml);
                return (
                  <motion.div
                    key={faq.id}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AccordionItem
                      value={faq.id}
                      className="border-2 rounded-xl px-6 py-2 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all"
                      style={{
                        backgroundColor: 'var(--th-card-bg)',
                        borderColor: 'var(--th-card-border)',
                      }}
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <div className="flex items-start gap-3">
                          <HelpCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                          <span className="font-semibold text-lg" style={{ color: 'var(--th-text-primary)' }}>{getTranslatedField(faq.question, faq.questionRu)}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="leading-relaxed pt-2 pb-4 pl-8" style={{ color: 'var(--th-text-muted)' }}>
                        {isHtml
                          ? <div className="prose prose-sm max-w-none" style={{ color: 'var(--th-text-muted)' }} dangerouslySetInnerHTML={{ __html: answerHtml }} />
                          : answerHtml
                        }
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                );
              })}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
