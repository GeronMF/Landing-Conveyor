'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';
import { ClipboardList, Phone, CreditCard, Package, Truck, CheckCircle, Star, ShoppingCart, MessageCircle, ChevronRight, ChevronDown } from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  clipboard: ClipboardList,
  phone: Phone,
  'credit-card': CreditCard,
  package: Package,
  truck: Truck,
  check: CheckCircle,
  star: Star,
  cart: ShoppingCart,
  message: MessageCircle,
};

const DEFAULT_ICONS = ['clipboard', 'phone', 'credit-card'];

interface Step {
  icon?: string;
  label?: string;
  labelRu?: string;
  text?: string;
  textRu?: string;
}

interface HowToOrderData {
  title?: string;
  titleRu?: string;
  productName?: string;
  productNameRu?: string;
  steps?: Step[];
}

interface HowToOrderSectionProps {
  data: HowToOrderData | null | undefined;
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export function HowToOrderSection({ data }: HowToOrderSectionProps) {
  const { language } = useI18n();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  if (!data || !data.steps || data.steps.length === 0) return null;

  const title = language === 'ru' && data.titleRu ? data.titleRu : (data.title || 'Як замовити');
  const productName = language === 'ru' && data.productNameRu ? data.productNameRu : (data.productName || '');

  const getStepText = (step: Step) =>
    language === 'ru' && step.textRu ? step.textRu : (step.text || '');
  const getStepLabel = (step: Step) =>
    language === 'ru' && step.labelRu ? step.labelRu : (step.label || '');

  const steps = data.steps;

  return (
    <section
      ref={ref}
      className="py-16 md:py-20 relative overflow-hidden bg-white"
    >
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'var(--th-btn-from, #f97316)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{ background: 'var(--th-btn-to, #ea580c)' }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800"
        >
          {title}
          {productName && (
            <>
              {' '}
              <span style={{ color: 'var(--th-primary, #f97316)' }}>{productName}</span>
            </>
          )}
          {productName ? '?' : ''}
        </motion.h2>

        {/* ── DESKTOP: horizontal chevrons ── */}
        <div className="hidden md:flex items-stretch justify-center max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const iconKey = step.icon || DEFAULT_ICONS[index] || 'clipboard';
            const Icon = ICONS[iconKey] || ClipboardList;
            const label = getStepLabel(step);
            const text = getStepText(step);
            const isFirst = index === 0;
            const isLast = index === steps.length - 1;

            // clipPath: первый без левого зубца, последний без правого
            const clip = isFirst
              ? (isLast
                  ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
                  : 'polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%)')
              : (isLast
                  ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 8% 50%)'
                  : 'polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%, 8% 50%)');

            return (
              <motion.div
                key={index}
                initial="initial"
                animate={isInView ? 'animate' : 'initial'}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="flex-1"
                style={{ marginLeft: index > 0 ? '-16px' : '0', zIndex: steps.length - index, position: 'relative' }}
              >
                <div
                  className="flex flex-col items-center text-center px-8 py-10 h-full"
                  style={{
                    background: 'rgba(249, 115, 22, 0.07)',
                    clipPath: clip,
                  }}
                >
                  {/* Icon circle */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #374151, #1f2937)' }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {label && (
                    <p className="text-lg font-bold mb-2" style={{ color: 'var(--th-primary, #f97316)' }}>
                      {label}
                    </p>
                  )}

                  <p className="text-sm text-gray-600 leading-relaxed max-w-[160px]">
                    {text}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── MOBILE: vertical cards with connectors ── */}
        <div className="flex md:hidden flex-col items-center gap-0 max-w-sm mx-auto">
          {steps.map((step, index) => {
            const iconKey = step.icon || DEFAULT_ICONS[index] || 'clipboard';
            const Icon = ICONS[iconKey] || ClipboardList;
            const label = getStepLabel(step);
            const text = getStepText(step);
            const isLast = index === steps.length - 1;

            return (
              <motion.div
                key={index}
                initial="initial"
                animate={isInView ? 'animate' : 'initial'}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="w-full"
              >
                {/* Card */}
                <div
                  className="flex items-center gap-4 rounded-2xl px-5 py-5 shadow-sm"
                  style={{
                    background: 'rgba(249, 115, 22, 0.07)',
                    border: '1px solid rgba(249, 115, 22, 0.15)',
                  }}
                >
                  {/* Step number + icon */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center shadow-md"
                      style={{ background: 'linear-gradient(135deg, #374151, #1f2937)' }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex-1 text-left">
                    {label && (
                      <p className="text-base font-bold mb-1" style={{ color: 'var(--th-primary, #f97316)' }}>
                        {label}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {text}
                    </p>
                  </div>
                </div>

                {/* Connector arrow (not after last) */}
                {!isLast && (
                  <div className="flex justify-center py-1">
                    <ChevronDown
                      className="w-6 h-6"
                      style={{ color: 'var(--th-primary, #f97316)', opacity: 0.5 }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
