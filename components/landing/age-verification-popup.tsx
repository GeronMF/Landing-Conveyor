'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

const STORAGE_KEY = 'age_verified';

interface AgeVerificationPopupProps {
  slug: string; // Используем slug лендинга, чтобы хранить отдельно для каждого
}

export function AgeVerificationPopup({ slug }: AgeVerificationPopupProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Проверяем sessionStorage (закрывается при закрытии вкладки)
    const key = `${STORAGE_KEY}_${slug}`;
    const verified = sessionStorage.getItem(key);
    if (!verified) {
      // Небольшая задержка, чтобы лендинг успел отрисоваться
      const timer = setTimeout(() => setVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, [slug]);

  // До монтирования не рендерим ничего — избегаем hydration mismatch
  if (!mounted) return null;

  const handleConfirm = () => {
    sessionStorage.setItem(`${STORAGE_KEY}_${slug}`, '1');
    setVisible(false);
  };

  const handleDecline = () => {
    // Уходим назад или на главную
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'about:blank';
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop — размытый фон */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9998] backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.75) 100%)',
            }}
          />

          {/* Попап */}
          <motion.div
            key="popup"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280, delay: 0.1 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <div
              className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(145deg, var(--th-hero-from) 0%, var(--th-hero-to) 100%)',
              }}
            >
              {/* Декоративный градиентный верх */}
              <div
                className="h-2 w-full"
                style={{ background: 'linear-gradient(to right, var(--th-btn-from), var(--th-btn-via), var(--th-btn-to))' }}
              />

              {/* Контент */}
              <div className="px-8 pt-8 pb-8 flex flex-col items-center text-center">
                {/* Иконка */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, var(--th-btn-from), var(--th-btn-via))' }}
                >
                  <ShieldCheck className="w-10 h-10 text-white" />
                </div>

                {/* Бейдж 18+ */}
                <div
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-sm font-bold mb-5 shadow-md"
                  style={{ background: 'linear-gradient(to right, var(--th-btn-from), var(--th-btn-to))' }}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  18+
                </div>

                {/* Заголовок */}
                <h2
                  className="text-2xl font-bold mb-3 bg-clip-text text-transparent leading-tight"
                  style={{ backgroundImage: 'linear-gradient(to right, var(--th-title-from), var(--th-title-to))' }}
                >
                  Вам вже виповнилося 18 років?
                </h2>

                {/* Описание */}
                <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                  Цей товар доступний лише для дорослих.
                  <br />
                  Підтвердьте свій вік, будь ласка.
                </p>

                {/* Кнопки */}
                <div className="flex flex-col gap-3 w-full">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleConfirm}
                    className="w-full py-3.5 rounded-2xl text-white font-bold text-base shadow-lg transition-all"
                    style={{ background: 'linear-gradient(to right, var(--th-btn-from), var(--th-btn-via), var(--th-btn-to))' }}
                  >
                    Так, мені вже є 18 ✓
                  </motion.button>

                  <button
                    onClick={handleDecline}
                    className="w-full py-2.5 rounded-2xl text-muted-foreground text-sm font-medium border border-border/50 hover:bg-muted/40 transition-all"
                  >
                    Ні, мені немає 18 років
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
