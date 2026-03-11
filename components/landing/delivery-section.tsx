'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';
import { AlertCircle, Truck } from 'lucide-react';

interface Carrier {
  name: string;
  logoUrl?: string;
}

interface DeliveryData {
  title?: string;
  titleRu?: string;
  shippingText?: string;
  shippingTextRu?: string;
  carriers?: Carrier[];
  promoText?: string;
  promoTextRu?: string;
  paymentNote?: string;
  paymentNoteRu?: string;
}

interface DeliverySectionProps {
  data: DeliveryData | null | undefined;
}

const fadeInUp = {
  initial: { opacity: 0, y: 25 },
  animate: { opacity: 1, y: 0 },
};

export function DeliverySection({ data }: DeliverySectionProps) {
  const { language } = useI18n();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  if (!data) return null;

  const title = language === 'ru' && data.titleRu ? data.titleRu : (data.title || '');
  const shippingText = language === 'ru' && data.shippingTextRu ? data.shippingTextRu : (data.shippingText || '');
  const promoText = language === 'ru' && data.promoTextRu ? data.promoTextRu : (data.promoText || '');
  const paymentNote = language === 'ru' && data.paymentNoteRu ? data.paymentNoteRu : (data.paymentNote || '');
  const carriers = data.carriers || [];

  if (!title && !shippingText && !paymentNote) return null;

  return (
    <section
      ref={ref}
      className="py-16 md:py-20 bg-white relative overflow-hidden"
    >
      {/* Subtle decoration */}
      <div className="absolute top-0 left-0 right-0 h-1 opacity-30"
        style={{ background: 'linear-gradient(90deg, var(--th-btn-from, #f97316), var(--th-btn-to, #ea580c))' }}
      />

      <div className="container mx-auto px-4">
        {/* Title */}
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800"
          >
            {title}
          </motion.h2>
        )}

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          {/* Left: Shipping info */}
          <motion.div
            initial="initial"
            animate={isInView ? 'animate' : 'initial'}
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {shippingText && (
              <p className="text-gray-600 text-base md:text-lg">{shippingText}</p>
            )}

            {/* Carrier logos / names */}
            {carriers.length > 0 && (
              <div className="flex flex-wrap gap-4 items-center">
                {carriers.map((carrier, idx) => (
                  <div key={idx}>
                    {carrier.logoUrl ? (
                      <img
                        src={carrier.logoUrl}
                        alt={carrier.name}
                        className="h-12 object-contain"
                      />
                    ) : (
                      <div
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-semibold text-sm"
                        style={{
                          borderColor: 'var(--th-primary, #f97316)',
                          color: 'var(--th-primary, #f97316)',
                        }}
                      >
                        <Truck className="w-4 h-4" />
                        {carrier.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Promo text */}
            {promoText && (
              <p
                className="text-sm md:text-base font-medium"
                style={{ color: 'var(--th-primary, #f97316)' }}
              >
                {promoText}
              </p>
            )}
          </motion.div>

          {/* Right: Payment note */}
          {paymentNote && (
            <motion.div
              initial="initial"
              animate={isInView ? 'animate' : 'initial'}
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div
                className="flex items-start gap-4 rounded-2xl px-6 py-5 shadow-sm"
                style={{
                  background: 'rgba(249, 115, 22, 0.06)',
                  border: '1.5px solid rgba(249, 115, 22, 0.25)',
                }}
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(249, 115, 22, 0.12)' }}
                >
                  <AlertCircle
                    className="w-5 h-5"
                    style={{ color: 'var(--th-primary, #f97316)' }}
                  />
                </div>
                <p className="text-gray-700 font-medium leading-relaxed">
                  <span className="font-bold">Оплата</span>{' '}
                  {paymentNote.replace(/^оплата\s*/i, '')}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
