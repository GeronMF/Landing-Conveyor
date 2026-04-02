'use client';

import { motion } from 'framer-motion';

const steps = [
  { n: '1', title: 'Вы переходите на страницу товара', text: 'Используйте ссылку на конкретное предложение.' },
  { n: '2', title: 'Оставляете заявку', text: 'Укажите контакты — так мы сможем с вами связаться.' },
  { n: '3', title: 'Менеджер подтверждает заказ', text: 'Уточняются детали и условия по выбранному товару.' },
];

export function HowWeWork() {
  return (
    <section id="how-we-work" className="scroll-mt-20 border-y border-slate-200/80 bg-slate-50/80 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-xl font-semibold text-slate-900 md:text-2xl">
          Как мы работаем
        </h2>
        <ol className="mt-12 space-y-6">
          {steps.map((step, i) => (
            <motion.li
              key={step.n}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {step.n}
              </span>
              <div>
                <h3 className="font-medium text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.text}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
