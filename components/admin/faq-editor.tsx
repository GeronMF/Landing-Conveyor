'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { BilingualField } from './bilingual-field';

interface FAQItem {
  id: string;
  question: string;
  questionRu?: string;
  answer: string;
  answerRu?: string;
  order: number;
  isOpen: boolean;
}

interface FAQEditorProps {
  faqs: FAQItem[];
  landingId: string;
  onUpdate: (faqs: any[]) => void;
}

export function FAQEditor({ faqs, landingId, onUpdate }: FAQEditorProps) {
  const [localFaqs, setLocalFaqs] = useState<FAQItem[]>(
    (faqs || []).sort((a, b) => (a.order || 0) - (b.order || 0))
  );

  useEffect(() => {
    const sorted = (faqs || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    setLocalFaqs(sorted);
  }, [faqs]);

  const handleAdd = async () => {
    try {
      const response = await fetch(`/api/admin/landings/${landingId}/faqs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'Нове питання',
          answer: 'Відповідь',
          order: localFaqs.length,
          isOpen: false,
        }),
      });
      if (response.ok) {
        const newFaq = await response.json();
        const updated = [...localFaqs, newFaq];
        setLocalFaqs(updated);
        onUpdate(updated);
        toast.success('Питання додано');
      } else {
        toast.error('Помилка додавання');
      }
    } catch {
      toast.error('Помилка додавання');
    }
  };

  const handleDelete = async (faqId: string) => {
    try {
      const response = await fetch(`/api/admin/faqs/${faqId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const updated = localFaqs.filter((f) => f.id !== faqId);
        setLocalFaqs(updated);
        onUpdate(updated);
        toast.success('Питання видалено');
      } else {
        toast.error('Помилка видалення');
      }
    } catch {
      toast.error('Помилка видалення');
    }
  };

  const handleUpdate = async (faqId: string, data: Partial<FAQItem>) => {
    try {
      const response = await fetch(`/api/admin/faqs/${faqId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const updated = localFaqs.map((f) => (f.id === faqId ? { ...f, ...data } : f));
        setLocalFaqs(updated);
        onUpdate(updated);
        // Показываем toast только для явных переключений (isOpen), не для текстовых полей
        if ('isOpen' in data) {
          toast.success(data.isOpen ? 'Питання відкрите за замовчуванням' : 'Питання закрите за замовчуванням');
        }
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
        Додати питання
      </Button>

      <div className="space-y-4">
        {localFaqs.map((faq) => (
          <Card key={faq.id} className={faq.isOpen ? 'border-blue-400/60' : ''}>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <GripVertical className="w-5 h-5 text-muted-foreground shrink-0" />

                {/* Toggle isOpen */}
                <div className="flex items-center gap-2 flex-1">
                  <Switch
                    id={`isOpen-${faq.id}`}
                    checked={faq.isOpen ?? false}
                    onCheckedChange={(checked) => handleUpdate(faq.id, { isOpen: checked })}
                  />
                  <Label htmlFor={`isOpen-${faq.id}`} className="text-sm text-muted-foreground cursor-pointer">
                    {faq.isOpen ? 'Відкритий за замовчуванням' : 'Закритий за замовчуванням'}
                  </Label>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(faq.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <BilingualField
                label="Питання"
                ukValue={faq.question || ''}
                ruValue={faq.questionRu || ''}
                onUkChange={(value) => handleUpdate(faq.id, { question: value })}
                onRuChange={(value) => handleUpdate(faq.id, { questionRu: value })}
                type="textarea"
              />

              <BilingualField
                label="Відповідь"
                ukValue={faq.answer || ''}
                ruValue={faq.answerRu || ''}
                onUkChange={(value) => handleUpdate(faq.id, { answer: value })}
                onRuChange={(value) => handleUpdate(faq.id, { answerRu: value })}
                type="rich"
                textareaRows={4}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
