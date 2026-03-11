'use client';

interface ThemeData {
  name?:         string;
  primaryColor:  string;
  accentColor:   string;
  gradientFrom:  string;   // hero bg from
  gradientVia:   string;   // hero bg via
  gradientTo:    string;   // hero bg to
  buttonFrom?:   string | null;
  buttonVia?:    string | null;
  buttonTo?:     string | null;
  titleFrom?:    string | null;
  titleVia?:     string | null;
  titleTo?:      string | null;
}

interface ThemeProviderProps {
  theme?: ThemeData | null;
  fallbackPrimary?: string | null;
  fallbackAccent?: string | null;
}

/** Вычисляет относительную яркость hex-цвета (0..1) */
function hexLuminance(hex: string): number {
  const h = hex.replace('#', '');
  if (h.length < 6) return 1;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** CSS-переменные для светлого текста (тёмный фон) */
const DARK_BG_TEXT = `
  --th-text-primary: #e2e8f0;
  --th-text-muted:   rgba(226,232,240,0.65);
  --th-card-bg:      rgba(255,255,255,0.06);
  --th-card-border:  rgba(255,255,255,0.15);
`;

/** CSS-переменные для тёмного текста (светлый фон) */
const LIGHT_BG_TEXT = `
  --th-text-primary: #1e293b;
  --th-text-muted:   #64748b;
  --th-card-bg:      rgba(255,255,255,0.85);
  --th-card-border:  rgba(148,163,184,0.30);
`;

/** Стандартные значения (синяя/cyan/teal тема) */
const STANDARD_CSS = `
  --th-btn-from:   #1e3a8a;
  --th-btn-via:    #0891b2;
  --th-btn-to:     #0d9488;
  --th-hero-from:  #dbeafe;
  --th-hero-via:   #cffafe;
  --th-hero-to:    #ccfbf1;
  --th-title-from: #2563eb;
  --th-title-via:  #0891b2;
  --th-title-to:   #0d9488;
  --th-orb-1:      rgba(96, 165, 250, 0.50);
  --th-orb-2:      rgba(34, 211, 238, 0.45);
  --th-orb-3:      rgba(45, 212, 191, 0.40);
  --th-badge-from: #2563eb;
  --th-badge-to:   #0891b2;
  --primary: #2563eb;
  --accent:  #10b981;
  ${LIGHT_BG_TEXT}
`;

export function ThemeProvider({ theme, fallbackPrimary, fallbackAccent }: ThemeProviderProps) {
  /* ── Нет темы → стандартные стили ──────────────────────────── */
  if (!theme && !fallbackPrimary) {
    return (
      <style dangerouslySetInnerHTML={{ __html: `:root { ${STANDARD_CSS} }` }} />
    );
  }

  /* ── Только fallback цвета (устаревший режим) ───────────────── */
  if (!theme && fallbackPrimary) {
    const p = fallbackPrimary;
    const a = fallbackAccent || fallbackPrimary;
    return (
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            --primary: ${p};
            --accent:  ${a};
            --th-btn-from:   ${p};
            --th-btn-via:    ${a};
            --th-btn-to:     ${a};
            --th-hero-from:  ${p}22;
            --th-hero-via:   ${a}22;
            --th-hero-to:    ${a}11;
            --th-title-from: ${p};
            --th-title-via:  ${a};
            --th-title-to:   ${a};
            --th-badge-from: ${p};
            --th-badge-to:   ${a};
            --th-orb-1:      ${p}80;
            --th-orb-2:      ${a}73;
            --th-orb-3:      ${a}66;
            ${LIGHT_BG_TEXT}
          }
        `
      }} />
    );
  }

  /* ── Полная тема из БД ──────────────────────────────────────── */
  const t = theme!;
  const btnFrom   = t.buttonFrom  || t.primaryColor;
  const btnVia    = t.buttonVia   || t.accentColor;
  const btnTo     = t.buttonTo    || t.accentColor;
  const titleFrom = t.titleFrom   || t.primaryColor;
  const titleVia  = t.titleVia    || t.accentColor;
  const titleTo   = t.titleTo     || t.accentColor;

  // Определяем, тёмный ли фон темы, и подбираем цвета текста
  const isDark = hexLuminance(t.gradientFrom) < 0.4;
  const textVars = isDark ? DARK_BG_TEXT : LIGHT_BG_TEXT;

  // Для стандартной темы делаем орбы менее заметными (почти прозрачными)
  const isStandardTheme = t.name === 'Стандартна' || t.name === 'Стандартна (без темы)';
  const orbOpacity = isStandardTheme ? '05' : '80'; // 5% для стандартной (почти невидимы), 50% для остальных
  const orbOpacity2 = isStandardTheme ? '04' : '73';
  const orbOpacity3 = isStandardTheme ? '03' : '66';

  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        :root {
          --primary: ${t.primaryColor};
          --accent:  ${t.accentColor};
          --th-btn-from:   ${btnFrom};
          --th-btn-via:    ${btnVia};
          --th-btn-to:     ${btnTo};
          --th-hero-from:  ${t.gradientFrom};
          --th-hero-via:   ${t.gradientVia};
          --th-hero-to:    ${t.gradientTo};
          --th-title-from: ${titleFrom};
          --th-title-via:  ${titleVia};
          --th-title-to:   ${titleTo};
          --th-badge-from: ${t.primaryColor};
          --th-badge-to:   ${t.accentColor};
          --th-orb-1:      ${t.primaryColor}${orbOpacity};
          --th-orb-2:      ${t.accentColor}${orbOpacity2};
          --th-orb-3:      ${t.accentColor}${orbOpacity3};
          ${textVars}
        }
      `
    }} />
  );
}
