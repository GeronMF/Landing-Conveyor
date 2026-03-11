'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';

export function CountdownTimer() {
  const { t } = useI18n();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const difference = endOfDay.getTime() - now.getTime();
      
      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Вычисляем сразу
    calculateTimeLeft();

    // Обновляем каждую секунду
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <div className="bg-white dark:bg-gray-900 rounded-full px-6 py-4 shadow-lg border-2 border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-center justify-center gap-6 md:gap-8">
          {/* Часы */}
          <div className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.common.hours || 'години'}
            </span>
          </div>
          
          {/* Разделитель */}
          <span className="text-2xl md:text-3xl font-bold text-gray-400 dark:text-gray-500">:</span>
          
          {/* Минуты */}
          <div className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.common.minutes || 'хвилини'}
            </span>
          </div>
          
          {/* Разделитель */}
          <span className="text-2xl md:text-3xl font-bold text-gray-400 dark:text-gray-500">:</span>
          
          {/* Секунды */}
          <div className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.common.seconds || 'секунди'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
