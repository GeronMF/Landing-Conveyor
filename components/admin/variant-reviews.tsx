'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { BilingualField } from './bilingual-field';
import { ImageUpload } from './image-upload';
import { Label } from '@/components/ui/label';

interface VariantReviewsProps {
  reviews: Array<{
    id: string;
    authorName: string;
    authorNameRu?: string;
    text: string;
    textRu?: string;
    rating: number;
    photoUrl?: string;
    createdAt: string;
  }>;
  landingId: string;
  variantId: string;
  onUpdate: (reviews: any[]) => void;
}

export function VariantReviews({ reviews, landingId, variantId, onUpdate }: VariantReviewsProps) {
  const [localReviews, setLocalReviews] = useState(
    (reviews || []).sort((a, b) => (a.order || 0) - (b.order || 0))
  );

  useEffect(() => {
    const sorted = (reviews || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    setLocalReviews(sorted);
  }, [reviews]);

  const handleAdd = async () => {
    try {
      const response = await fetch(`/api/admin/variants/${variantId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: 'Новий автор',
          text: '',
          rating: 5,
        }),
      });
      if (response.ok) {
        const newReview = await response.json();
        const updated = [...localReviews, newReview];
        setLocalReviews(updated);
        onUpdate(updated);
        toast.success('Відгук додано');
      } else {
        toast.error('Помилка додавання');
      }
    } catch {
      toast.error('Помилка додавання');
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const updated = localReviews.filter((r) => r.id !== reviewId);
        setLocalReviews(updated);
        onUpdate(updated);
        toast.success('Відгук видалено');
      } else {
        toast.error('Помилка видалення');
      }
    } catch {
      toast.error('Помилка видалення');
    }
  };

  const handleUpdate = async (reviewId: string, data: any) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const updated = localReviews.map((r) => (r.id === reviewId ? { ...r, ...data } : r));
        setLocalReviews(updated);
        onUpdate(updated);
        // Toast только для рейтинга (явное действие), не для каждого символа текста
        if ('rating' in data) toast.success('Рейтинг оновлено');
      } else {
        toast.error('Помилка збереження');
      }
    } catch {
      toast.error('Помилка збереження');
    }
  };

  const handleRatingChange = (reviewId: string, rating: number) => {
    handleUpdate(reviewId, { rating });
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleAdd}>
        <Plus className="w-4 h-4 mr-2" />
        Додати відгук
      </Button>

      <div className="space-y-4">
        {localReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="text-sm text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(review.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <BilingualField
                label="Ім'я автора"
                ukValue={review.authorName || ''}
                ruValue={review.authorNameRu || ''}
                onUkChange={(value) => handleUpdate(review.id, { authorName: value })}
                onRuChange={(value) => handleUpdate(review.id, { authorNameRu: value })}
              />

              <BilingualField
                label="Текст відгуку"
                ukValue={review.text || ''}
                ruValue={review.textRu || ''}
                onUkChange={(value) => handleUpdate(review.id, { text: value })}
                onRuChange={(value) => handleUpdate(review.id, { textRu: value })}
                type="textarea"
              />

              <div>
                <Label>Рейтинг</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(review.id, star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Аватар</Label>
                <div className="mt-2">
                  <ImageUpload
                    value={review.photoUrl || undefined}
                    onChange={(url) => handleUpdate(review.id, { photoUrl: url || null })}
                    landingId={landingId}
                    label="Завантажити аватар"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
