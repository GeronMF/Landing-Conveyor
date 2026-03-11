'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LanguageToggle } from './language-toggle';
import { RichTextEditor } from './rich-text-editor';

interface BilingualFieldProps {
  label: string;
  ukValue: string;
  ruValue: string;
  onUkChange: (value: string) => void;
  onRuChange: (value: string) => void;
  type?: 'input' | 'textarea' | 'rich';
  textareaRows?: number;
  className?: string;
}

export function BilingualField({
  label,
  ukValue,
  ruValue,
  onUkChange,
  onRuChange,
  type = 'input',
  textareaRows = 3,
  className = '',
}: BilingualFieldProps) {
  const [language, setLanguage] = useState<'uk' | 'ru'>('uk');

  const isUk = language === 'uk';

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <Label>{label}</Label>
        <LanguageToggle language={language} onChange={setLanguage} />
      </div>

      {type === 'input' && (
        <Input
          value={isUk ? ukValue : ruValue}
          onChange={(e) => isUk ? onUkChange(e.target.value) : onRuChange(e.target.value)}
          placeholder={isUk ? 'Українська' : 'Русский'}
        />
      )}

      {type === 'textarea' && (
        <Textarea
          value={isUk ? ukValue : ruValue}
          onChange={(e) => isUk ? onUkChange(e.target.value) : onRuChange(e.target.value)}
          rows={textareaRows}
          placeholder={isUk ? 'Українська' : 'Русский'}
        />
      )}

      {type === 'rich' && (
        <RichTextEditor
          value={isUk ? ukValue : ruValue}
          onChange={(val) => isUk ? onUkChange(val) : onRuChange(val)}
          placeholder={isUk ? 'Українська' : 'Русский'}
        />
      )}
    </div>
  );
}
