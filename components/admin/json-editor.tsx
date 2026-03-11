'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Plus, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface JsonEditorProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  schema?: 'heroImages' | 'variants' | 'faqs' | 'companyInfo' | 'advantages' | 'specifications' | 'sizeTable' | 'gallery' | 'reviews';
}

export function JsonEditor({ label, value, onChange, schema }: JsonEditorProps) {
  const [isTextMode, setIsTextMode] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTextMode = () => {
    if (isTextMode) {
      // Сохранить из текстового режима
      try {
        const parsed = JSON.parse(textValue);
        onChange(parsed);
        setError(null);
        setIsTextMode(false);
      } catch (e: any) {
        setError(`Ошибка JSON: ${e.message}`);
      }
    } else {
      // Переключиться в текстовый режим
      setTextValue(JSON.stringify(value || [], null, 2));
      setIsTextMode(true);
      setError(null);
    }
  };

  if (isTextMode) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{label}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleTextMode}>
                <Check className="h-4 w-4 mr-2" />
                Сохранить JSON
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsTextMode(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Textarea
            value={textValue}
            onChange={(e) => {
              setTextValue(e.target.value);
              setError(null);
            }}
            rows={15}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Редактируйте JSON напрямую. После сохранения проверьте валидность.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Визуальный редактор в зависимости от схемы
  if (schema === 'heroImages') {
    const images = (value as any[]) || [];
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{label}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onChange([...images, { url: '', alt: '' }])}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить
              </Button>
              <Button variant="ghost" size="sm" onClick={handleTextMode}>
                JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {images.map((img, idx) => (
            <div key={idx} className="flex gap-2 items-start p-3 border rounded">
              <div className="flex-1 space-y-2">
                <div>
                  <Label>URL</Label>
                  <Input
                    value={img.url || ''}
                    onChange={(e) => {
                      const newImages = [...images];
                      newImages[idx] = { ...img, url: e.target.value };
                      onChange(newImages);
                    }}
                  />
                </div>
                <div>
                  <Label>Alt текст</Label>
                  <Input
                    value={img.alt || ''}
                    onChange={(e) => {
                      const newImages = [...images];
                      newImages[idx] = { ...img, alt: e.target.value };
                      onChange(newImages);
                    }}
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onChange(images.filter((_, i) => i !== idx))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {images.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Нет изображений. Нажмите "Добавить" чтобы добавить первое изображение.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (schema === 'faqs') {
    const faqs = (value as any[]) || [];
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{label}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange([...faqs, { id: `faq-${Date.now()}`, question: '', answer: '' }])}
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить FAQ
              </Button>
              <Button variant="ghost" size="sm" onClick={handleTextMode}>
                JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={faq.id || idx} className="p-4 border rounded space-y-2">
              <div>
                <Label>Вопрос</Label>
                <Input
                  value={faq.question || ''}
                  onChange={(e) => {
                    const newFaqs = [...faqs];
                    newFaqs[idx] = { ...faq, question: e.target.value };
                    onChange(newFaqs);
                  }}
                />
              </div>
              <div>
                <Label>Ответ</Label>
                <Textarea
                  value={faq.answer || ''}
                  onChange={(e) => {
                    const newFaqs = [...faqs];
                    newFaqs[idx] = { ...faq, answer: e.target.value };
                    onChange(newFaqs);
                  }}
                  rows={3}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange(faqs.filter((_, i) => i !== idx))}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // По умолчанию - текстовый редактор
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{label}</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleTextMode}>
            {isTextMode ? 'Візуальний' : 'JSON'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={JSON.stringify(value || null, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              onChange(parsed);
              setError(null);
            } catch {
              setError('Неверный JSON');
            }
          }}
          rows={10}
          className="font-mono text-sm"
        />
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
