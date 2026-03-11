'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { BilingualField } from './bilingual-field';

export interface FormFieldConfig {
  name: string;
  label?: string;
  labelRu?: string;
  placeholder?: string;
  placeholderRu?: string;
  required?: boolean;
  visible?: boolean;
}

export interface FormConfig {
  title?: string;
  titleRu?: string;
  subtitle?: string;
  subtitleRu?: string;
  buttonText?: string;
  buttonTextRu?: string;
  successTitle?: string;
  successTitleRu?: string;
  successText?: string;
  successTextRu?: string;
  fields?: FormFieldConfig[];
}

const DEFAULT_FIELDS: FormFieldConfig[] = [
  { name: 'name',    label: "Ім'я",     labelRu: 'Имя',          placeholder: "Ваше ім'я",             placeholderRu: 'Ваше имя',                required: true,  visible: true },
  { name: 'phone',   label: 'Телефон',  labelRu: 'Телефон',      placeholder: '+380 (67) 123-45-67',   placeholderRu: '+7 (999) 123-45-67',      required: true,  visible: true },
  { name: 'city',    label: 'Місто',    labelRu: 'Город',        placeholder: 'Київ',                  placeholderRu: 'Москва',                  required: false, visible: true },
  { name: 'comment', label: 'Коментар', labelRu: 'Комментарий',  placeholder: 'Додаткова інформація',  placeholderRu: 'Дополнительная информация', required: false, visible: true },
];

interface FormConfigEditorProps {
  value: FormConfig | null | undefined;
  onChange: (config: FormConfig) => void;
}

const FIELD_NAME_LABELS: Record<string, string> = {
  name:    "Ім'я",
  phone:   'Телефон',
  city:    'Місто',
  comment: 'Коментар',
};

export function FormConfigEditor({ value, onChange }: FormConfigEditorProps) {
  const [config, setConfig] = useState<FormConfig>(() => {
    const base: FormConfig = {
      title:        value?.title        || "Оформити замовлення",
      titleRu:      value?.titleRu      || "Оформить заказ",
      subtitle:     value?.subtitle     || '',
      subtitleRu:   value?.subtitleRu   || '',
      buttonText:   value?.buttonText   || 'Відправити заявку',
      buttonTextRu: value?.buttonTextRu || 'Отправить заявку',
      successTitle:    value?.successTitle    || 'Дякуємо!',
      successTitleRu:  value?.successTitleRu  || 'Спасибо!',
      successText:     value?.successText     || 'Ми зв\'яжемось з вами найближчим часом.',
      successTextRu:   value?.successTextRu   || 'Мы свяжемся с вами в ближайшее время.',
      fields: value?.fields && value.fields.length > 0
        ? value.fields
        : DEFAULT_FIELDS,
    };
    return base;
  });

  useEffect(() => {
    if (value) {
      setConfig({
        title:        value.title        || "Оформити замовлення",
        titleRu:      value.titleRu      || "Оформить заказ",
        subtitle:     value.subtitle     || '',
        subtitleRu:   value.subtitleRu   || '',
        buttonText:   value.buttonText   || 'Відправити заявку',
        buttonTextRu: value.buttonTextRu || 'Отправить заявку',
        successTitle:    value.successTitle    || 'Дякуємо!',
        successTitleRu:  value.successTitleRu  || 'Спасибо!',
        successText:     value.successText     || '',
        successTextRu:   value.successTextRu   || '',
        fields: value.fields && value.fields.length > 0 ? value.fields : DEFAULT_FIELDS,
      });
    }
  }, []);

  const update = (partial: Partial<FormConfig>) => {
    const next = { ...config, ...partial };
    setConfig(next);
    onChange(next);
  };

  const updateField = (index: number, partial: Partial<FormFieldConfig>) => {
    const fields = [...(config.fields || DEFAULT_FIELDS)];
    fields[index] = { ...fields[index], ...partial };
    update({ fields });
  };

  return (
    <div className="space-y-6">
      {/* Тексты формы */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Заголовок та кнопка</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <BilingualField
            label="Заголовок форми"
            ukValue={config.title || ''}
            ruValue={config.titleRu || ''}
            onUkChange={(v) => update({ title: v })}
            onRuChange={(v) => update({ titleRu: v })}
          />
          <BilingualField
            label="Підзаголовок (необов'язково)"
            ukValue={config.subtitle || ''}
            ruValue={config.subtitleRu || ''}
            onUkChange={(v) => update({ subtitle: v })}
            onRuChange={(v) => update({ subtitleRu: v })}
          />
          <BilingualField
            label="Текст кнопки відправки"
            ukValue={config.buttonText || ''}
            ruValue={config.buttonTextRu || ''}
            onUkChange={(v) => update({ buttonText: v })}
            onRuChange={(v) => update({ buttonTextRu: v })}
          />
        </CardContent>
      </Card>

      {/* Повідомлення успіху */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Повідомлення після відправки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <BilingualField
            label="Заголовок успіху"
            ukValue={config.successTitle || ''}
            ruValue={config.successTitleRu || ''}
            onUkChange={(v) => update({ successTitle: v })}
            onRuChange={(v) => update({ successTitleRu: v })}
          />
          <BilingualField
            label="Текст успіху"
            ukValue={config.successText || ''}
            ruValue={config.successTextRu || ''}
            onUkChange={(v) => update({ successText: v })}
            onRuChange={(v) => update({ successTextRu: v })}
            type="textarea"
          />
        </CardContent>
      </Card>

      {/* Поля форми */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Поля форми</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(config.fields || DEFAULT_FIELDS).map((field, idx) => (
            <div key={field.name} className="border rounded-xl p-4 space-y-3 bg-muted/30">
              {/* Заголовок поля */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono">{field.name}</Badge>
                  <span className="text-sm font-medium">{FIELD_NAME_LABELS[field.name] || field.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`required-${field.name}`}
                      checked={field.required ?? false}
                      onCheckedChange={(v) => updateField(idx, { required: v })}
                      disabled={field.name === 'name' || field.name === 'phone'}
                    />
                    <Label htmlFor={`required-${field.name}`} className="text-xs text-muted-foreground cursor-pointer">
                      Обов'язкове
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`visible-${field.name}`}
                      checked={field.visible !== false}
                      onCheckedChange={(v) => updateField(idx, { visible: v })}
                      disabled={field.name === 'name' || field.name === 'phone'}
                    />
                    <Label htmlFor={`visible-${field.name}`} className="text-xs text-muted-foreground cursor-pointer">
                      Показувати
                    </Label>
                  </div>
                </div>
              </div>

              {/* Лейбли и плейсхолдеры */}
              {field.visible !== false && (
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Назва (UK)</Label>
                      <Input
                        value={field.label || ''}
                        onChange={(e) => updateField(idx, { label: e.target.value })}
                        placeholder="Назва поля"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Назва (RU)</Label>
                      <Input
                        value={field.labelRu || ''}
                        onChange={(e) => updateField(idx, { labelRu: e.target.value })}
                        placeholder="Название поля"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Placeholder (UK)</Label>
                      <Input
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(idx, { placeholder: e.target.value })}
                        placeholder="Підказка (UK)"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Placeholder (RU)</Label>
                      <Input
                        value={field.placeholderRu || ''}
                        onChange={(e) => updateField(idx, { placeholderRu: e.target.value })}
                        placeholder="Подсказка (RU)"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
