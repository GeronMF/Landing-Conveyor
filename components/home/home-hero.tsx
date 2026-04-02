'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Headphones, ListOrdered } from 'lucide-react';

export function HomeHero() {
  const scrollToContact = useCallback(() => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollToHow = useCallback(() => {
    document.getElementById('how-we-work')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-slate-50 to-white px-4 py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.08),transparent)]" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative mx-auto max-w-3xl text-center"
      >
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          Офіційна сторінка оформлення замовлень
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 md:text-lg">
          Якщо ви перейшли на головну адресу сайту, ви знаходитесь на сторінці підтримки та
          оформлення замовлень. Для покупки використовуйте сторінку пропозиції, на яку ви
          переходили раніше.
        </p>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button
            size="lg"
            className="rounded-xl shadow-md shadow-slate-900/5 transition hover:shadow-lg"
            onClick={scrollToContact}
          >
            <Headphones className="mr-2 h-4 w-4" />
            Зв'язатися з менеджером
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-xl border-slate-200 bg-white/80 backdrop-blur transition hover:bg-slate-50"
            onClick={scrollToHow}
          >
            <ListOrdered className="mr-2 h-4 w-4" />
            Як це працює
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
