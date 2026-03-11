'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { BilingualField } from './bilingual-field';

interface VariantSpecificationsProps {
  specifications: Array<{ id: string; key: string; keyRu?: string; value: string; valueRu?: string; order: number }>;
  variantId: string;
  onUpdate: (specs: any[]) => void;
}

export function VariantSpecifications({ specifications, variantId, onUpdate }: VariantSpecificationsProps) {
  const [localSpecs, setLocalSpecs] = useState(
    (specifications || []).sort((a, b) => (a.order || 0) - (b.order || 0))
  );

  useEffect(() => {
    const sorted = (specifications || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    setLocalSpecs(sorted);
  }, [specifications]);

  const handleAdd = async () => {
    try {
      const response = await fetch(`/api/admin/variants/${variantId}/specifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'Назва',
          value: 'Значення',
          order: localSpecs.length,
        }),
      });
      if (response.ok) {
        const newSpec = await response.json();
        const updated = [...localSpecs, newSpec];
        setLocalSpecs(updated);
        onUpdate(updated);
        toast.success('Рядок додано');
      } else {
        toast.error('Помилка додавання');
      }
    } catch {
      toast.error('Помилка додавання');
    }
  };

  const handleDelete = async (specId: string) => {
    try {
      const response = await fetch(`/api/admin/specifications/${specId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const updated = localSpecs.filter((s) => s.id !== specId);
        setLocalSpecs(updated);
        onUpdate(updated);
        toast.success('Рядок видалено');
      } else {
        toast.error('Помилка видалення');
      }
    } catch {
      toast.error('Помилка видалення');
    }
  };

  const handleUpdate = async (specId: string, data: any) => {
    try {
      const response = await fetch(`/api/admin/specifications/${specId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const updated = localSpecs.map((s) => (s.id === specId ? { ...s, ...data } : s));
        setLocalSpecs(updated);
        onUpdate(updated);
      } else {
        toast.error('Помилка збереження');
      }
    } catch {
      toast.error('Помилка збереження');
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleAdd}>
        <Plus className="w-4 h-4 mr-2" />
        Додати рядок
      </Button>

      <div className="space-y-3">
        {localSpecs.map((spec) => (
          <Card key={spec.id}>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <GripVertical className="w-5 h-5 text-muted-foreground mt-2" />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(spec.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <BilingualField
                label="Назва"
                ukValue={spec.key || ''}
                ruValue={spec.keyRu || ''}
                onUkChange={(value) => handleUpdate(spec.id, { key: value })}
                onRuChange={(value) => handleUpdate(spec.id, { keyRu: value })}
              />

              <BilingualField
                label="Значення"
                ukValue={spec.value || ''}
                ruValue={spec.valueRu || ''}
                onUkChange={(value) => handleUpdate(spec.id, { value })}
                onRuChange={(value) => handleUpdate(spec.id, { valueRu: value })}
                type="rich"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
