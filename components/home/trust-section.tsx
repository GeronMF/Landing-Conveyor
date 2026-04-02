'use client';

import { motion } from 'framer-motion';
import { BadgeCheck, Headphones, ShieldCheck, UserCheck } from 'lucide-react';

const items = [
  {
    icon: BadgeCheck,
    title: 'Официальное оформление заказа',
    text: 'Заявки обрабатываются в рамках согласованного предложения.',
  },
  {
    icon: UserCheck,
    title: 'Подтверждение менеджером',
    text: 'После заявки с вами свяжется менеджер для уточнения деталей.',
  },
  {
    icon: Headphones,
    title: 'Поддержка клиентов',
    text: 'Помощь при оформлении и вопросах по заказу.',
  },
  {
    icon: ShieldCheck,
    title: 'Безопасные условия',
    text: 'Прозрачные шаги оформления без навязанных «акций».',
  },
];

export function TrustSection() {
  return (
    <section className="px-4 py-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-xl font-semibold text-slate-900 md:text-2xl">
          Почему это удобно
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm shadow-slate-900/5 transition hover:border-slate-300 hover:shadow-md"
            >
              <item.icon className="h-9 w-9 text-slate-700 transition group-hover:text-blue-600" />
              <h3 className="mt-4 font-medium text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
