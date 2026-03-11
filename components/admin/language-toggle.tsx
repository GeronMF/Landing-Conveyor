'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  language: 'uk' | 'ru';
  onChange: (lang: 'uk' | 'ru') => void;
  className?: string;
}

export function LanguageToggle({ language, onChange, className }: LanguageToggleProps) {
  return (
    <div className={cn('flex gap-1 rounded-md border border-border p-1', className)}>
      <Button
        type="button"
        variant={language === 'uk' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('uk')}
        className="h-7 px-3 text-xs"
      >
        UK
      </Button>
      <Button
        type="button"
        variant={language === 'ru' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('ru')}
        className="h-7 px-3 text-xs"
      >
        RU
      </Button>
    </div>
  );
}
