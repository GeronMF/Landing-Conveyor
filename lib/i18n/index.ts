import uk from './uk.json';
import ru from './ru.json';

export type Language = 'uk' | 'ru';

export const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export const translations = {
  uk,
  ru,
} as const;

export function getTranslation(lang: Language = 'uk') {
  return translations[lang] || translations.uk;
}
