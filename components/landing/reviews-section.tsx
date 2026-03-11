'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Star, User } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

interface ReviewsSectionProps {
  reviews: Array<{
    id: string;
    authorName: string;
    authorNameRu?: string | null;
    rating: number;
    text: string;
    textRu?: string | null;
    photoUrl?: string;
  }>;
}

const fadeInUp = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const { t, language } = useI18n();
  
  // Хелпер для получения переведенного значения поля
  const getTranslatedField = (ukValue: string | null | undefined, ruValue: string | null | undefined, fallback: string = '') => {
    if (language === 'ru' && ruValue) return ruValue;
    return ukValue || fallback;
  };
  const reviewsRef = useRef(null);
  const isReviewsInView = useInView(reviewsRef, { once: true, margin: '-100px', amount: 0.1 });

  if (!reviews || reviews.length === 0) return null;

  return (
    <motion.div
      ref={reviewsRef}
      initial="initial"
      animate={isReviewsInView ? "animate" : "initial"}
      variants={isReviewsInView ? staggerContainer : { animate: { transition: { staggerChildren: 0 } } }}
      className="pt-10 md:pt-14 mb-8 md:mb-12 container mx-auto px-4"
    >
      <motion.h3 
        variants={fadeInUp}
        className="text-3xl md:text-4xl font-bold mb-8 text-center th-title-gradient"
      >
        {t.common.reviews}
      </motion.h3>
      <div className="flex justify-center">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl w-full justify-items-center">
          {reviews.map((review: any, idx: number) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 1, y: 0 }}
              animate={isReviewsInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card className="h-full w-full border-2 border-blue-200/60 hover:border-cyan-400/80 dark:border-blue-800/60 dark:hover:border-cyan-600/80 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-white/95 via-blue-50/50 to-cyan-50/50 dark:from-gray-900/95 dark:via-blue-950/30 dark:to-cyan-950/30 backdrop-blur-sm">
                <CardContent className="pt-8 pb-8 px-6">
                  <div className="flex flex-col items-center text-center">
                    {review.photoUrl ? (
                      <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-[3px] border-blue-300/50 dark:border-blue-600/50 shadow-lg mb-4">
                        <Image
                          src={review.photoUrl}
                          alt={getTranslatedField(review.authorName, review.authorNameRu)}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="relative w-20 h-20 rounded-full flex-shrink-0 border-[3px] border-blue-300/50 dark:border-blue-600/50 shadow-lg mb-4 bg-gradient-to-br from-blue-200 to-cyan-200 dark:from-blue-800 dark:to-cyan-800 flex items-center justify-center">
                        <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    <div className="w-full">
                      <h4 className="font-bold text-lg mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                        {getTranslatedField(review.authorName, review.authorNameRu)}
                      </h4>
                      <div className="flex justify-center gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-300 text-gray-300'
                            } drop-shadow-sm`}
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-center">{getTranslatedField(review.text, review.textRu)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
