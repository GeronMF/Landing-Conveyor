'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { submitContactForm } from '@/lib/submit-contact-form';
import { motion } from 'framer-motion';
import { Loader2, Send } from 'lucide-react';

export function ContactSection() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await submitContactForm({
        name: name.trim(),
        phone: phone.trim(),
        comment: comment.trim() || undefined,
      });
      if (res.ok) setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contact" className="scroll-mt-20 px-4 py-16 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-lg"
      >
        <h2 className="text-center text-xl font-semibold text-slate-900 md:text-2xl">
          Нужна помощь с оформлением?
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Оставьте заявку — менеджер свяжется с вами.
        </p>
        {done ? (
          <p className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-6 text-center text-sm text-emerald-900">
            Спасибо! Заявка отправлена. Мы свяжемся с вами в ближайшее время.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 md:p-8"
          >
            <div className="space-y-2">
              <Label htmlFor="contact-name">Имя</Label>
              <Input
                id="contact-name"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как к вам обращаться"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Телефон</Label>
              <Input
                id="contact-phone"
                required
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+380 …"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-comment">Комментарий (необязательно)</Label>
              <Textarea
                id="contact-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Кратко опишите вопрос"
                className="rounded-xl resize-y min-h-[88px]"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full rounded-xl"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Отправить заявку
            </Button>
          </form>
        )}
      </motion.div>
    </section>
  );
}
