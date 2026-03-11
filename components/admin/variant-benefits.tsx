'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { BilingualField } from './bilingual-field';
import { ImageUpload } from './image-upload';

interface VariantBenefitsProps {
  benefits: Array<{ id: string; title: string; titleRu?: string; text: string; textRu?: string; imageUrl?: string; order: number }>;
  landingId: string;
  variantId: string;
  onUpdate: (benefits: any[]) => void;
}

export function VariantBenefits({ benefits, landingId, variantId, onUpdate }: VariantBenefitsProps) {
  const [localBenefits, setLocalBenefits] = useState(
    (benefits || []).sort((a, b) => (a.order || 0) - (b.order || 0))
  );

  useEffect(() => {
    const sorted = (benefits || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    setLocalBenefits(sorted);
  }, [benefits]);

  const handleAdd = async () => {
    try {
      const response = await fetch(`/api/admin/variants/${variantId}/benefits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Нова перевага',
          text: '',
          order: localBenefits.length,
        }),
      });
      if (response.ok) {
        const newBenefit = await response.json();
        const updated = [...localBenefits, newBenefit];
        setLocalBenefits(updated);
        onUpdate(updated);
        toast.success('Перевагу додано');
      } else {
        toast.error('Помилка додавання');
      }
    } catch (error: any) {
      toast.error('Помилка додавання');
    }
  };

  const handleDelete = async (benefitId: string) => {
    try {
      const response = await fetch(`/api/admin/benefits/${benefitId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const updated = localBenefits.filter((b) => b.id !== benefitId);
        setLocalBenefits(updated);
        onUpdate(updated);
        toast.success('Перевагу видалено');
      } else {
        toast.error('Помилка видалення');
      }
    } catch (error: any) {
      toast.error('Помилка видалення');
    }
  };

  const handleUpdate = async (benefitId: string, data: any) => {
    try {
      const response = await fetch(`/api/admin/benefits/${benefitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const updated = localBenefits.map((b) => (b.id === benefitId ? { ...b, ...data } : b));
        setLocalBenefits(updated);
        onUpdate(updated);
      } else {
        toast.error('Помилка збереження');
      }
    } catch (error: any) {
      toast.error('Помилка збереження');
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleAdd}>
        <Plus className="w-4 h-4 mr-2" />
        Додати перевагу
      </Button>

      <div className="space-y-4">
        {localBenefits.map((benefit) => (
          <Card key={benefit.id}>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <GripVertical className="w-5 h-5 text-muted-foreground mt-2" />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(benefit.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <BilingualField
                label="Назва"
                ukValue={benefit.title || ''}
                ruValue={benefit.titleRu || ''}
                onUkChange={(value) => handleUpdate(benefit.id, { title: value })}
                onRuChange={(value) => handleUpdate(benefit.id, { titleRu: value })}
                type="rich"
              />

              <BilingualField
                label="Текст"
                ukValue={benefit.text || ''}
                ruValue={benefit.textRu || ''}
                onUkChange={(value) => handleUpdate(benefit.id, { text: value })}
                onRuChange={(value) => handleUpdate(benefit.id, { textRu: value })}
                type="rich"
              />

              <div>
                <label className="text-sm font-medium">Іконка/зображення</label>
                <div className="mt-2">
                  <ImageUpload
                    value={benefit.imageUrl || undefined}
                    onChange={(url) => handleUpdate(benefit.id, { imageUrl: url || null })}
                    landingId={landingId}
                    label="Завантажити зображення"
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
