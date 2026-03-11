'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from './image-upload';
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { BilingualField } from './bilingual-field';

interface VariantGalleryProps {
  images: Array<{ id: string; url: string; alt?: string; altRu?: string; order: number }>;
  landingId: string;
  variantId: string;
  onUpdate: (images: Array<{ id: string; url: string; alt?: string; altRu?: string; order: number }>) => void;
}

export function VariantGallery({ images, landingId, variantId, onUpdate }: VariantGalleryProps) {
  const [localImages, setLocalImages] = useState(
    (images || []).sort((a, b) => (a.order || 0) - (b.order || 0))
  );

  // Синхронизируем с пропсами при их изменении
  useEffect(() => {
    const sorted = (images || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    setLocalImages(sorted);
  }, [images]);

  const handleAddImage = async (url: string) => {
    try {
      const response = await fetch(`/api/admin/variants/${variantId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, order: localImages.length }),
      });
      if (response.ok) {
        const newImage = await response.json();
        const updated = [...localImages, newImage];
        setLocalImages(updated);
        onUpdate(updated);
        toast.success('Зображення додано');
      } else {
        toast.error('Помилка завантаження зображення');
      }
    } catch {
      toast.error('Помилка завантаження зображення');
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      const response = await fetch(`/api/admin/images/${imageId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const updated = localImages.filter((img) => img.id !== imageId);
        setLocalImages(updated);
        onUpdate(updated);
        toast.success('Зображення видалено');
      } else {
        toast.error('Помилка видалення');
      }
    } catch {
      toast.error('Помилка видалення');
    }
  };

  const handleAltChange = async (imageId: string, alt: string, altRu: string) => {
    try {
      const response = await fetch(`/api/admin/images/${imageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alt, altRu }),
      });
      if (!response.ok) {
        toast.error('Помилка збереження alt-тексту');
      } else {
        const updated = localImages.map((img) =>
          img.id === imageId ? { ...img, alt, altRu } : img
        );
        setLocalImages(updated);
        onUpdate(updated);
      }
    } catch {
      toast.error('Помилка збереження alt-тексту');
    }
  };

  const handleMove = async (imageId: string, direction: 'up' | 'down') => {
    const index = localImages.findIndex((img) => img.id === imageId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === localImages.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newImages = [...localImages];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];

    const reorderData = newImages.map((img, idx) => ({ id: img.id, order: idx }));
    try {
      const response = await fetch('/api/admin/images/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: reorderData }),
      });
      if (response.ok) {
        const updated = newImages.map((img, idx) => ({ ...img, order: idx }));
        setLocalImages(updated);
        onUpdate(updated);
      } else {
        toast.error('Помилка зміни порядку');
      }
    } catch {
      toast.error('Помилка зміни порядку');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Завантажити зображення</Label>
        <div className="mt-2">
          <ImageUpload
            value={undefined}
            onChange={(url) => url && handleAddImage(url)}
            landingId={landingId}
            label="Додати зображення"
          />
        </div>
      </div>

      <div className="space-y-3">
        {localImages.map((image, index) => (
          <div key={image.id} className="flex gap-4 p-4 border rounded-lg items-start">
            <div className="flex flex-col gap-1">
              <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMove(image.id, 'up')}
                disabled={index === 0}
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMove(image.id, 'down')}
                disabled={index === localImages.length - 1}
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative w-24 h-24 rounded overflow-hidden flex-shrink-0">
              <Image src={image.url} alt={image.alt || ''} fill className="object-cover" />
            </div>
            <div className="flex-1 space-y-2">
              <BilingualField
                label="Alt текст"
                ukValue={image.alt || ''}
                ruValue={image.altRu || ''}
                onUkChange={(value) => handleAltChange(image.id, value, image.altRu || '')}
                onRuChange={(value) => handleAltChange(image.id, image.alt || '', value)}
              />
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(image.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
