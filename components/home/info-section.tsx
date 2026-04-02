'use client';

import { motion } from 'framer-motion';

export function InfoSection() {
  return (
    <section id="legal" className="px-4 pb-16 md:pb-20">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-slate-50/90 px-6 py-8 text-center md:px-10"
      >
        <p className="text-sm leading-relaxed text-slate-700 md:text-base">
          Оформлення замовлення здійснюється через сторінки пропозицій. Асортимент і умови можуть
          відрізнятися залежно від товару.
        </p>
      </motion.div>
    </section>
  );
}
