'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Pencil, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

/* ─── типы ─────────────────────────────────────────── */
interface Theme {
  id: string;
  name: string;
  // Основные цвета
  primaryColor: string;
  accentColor: string;
  // Фон секций
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  // Кнопки
  buttonFrom?: string | null;
  buttonVia?: string | null;
  buttonTo?: string | null;
  // Заголовки
  titleFrom?: string | null;
  titleVia?: string | null;
  titleTo?: string | null;
}

interface ThemeSelectorProps {
  value?: string | null;
  onChange: (themeId: string | null) => void;
}

/* ─── дефолтные значения для новой темы ─────────────── */
const EMPTY_THEME: Omit<Theme, 'id'> = {
  name: '',
  primaryColor: '#2563eb',
  accentColor:  '#10b981',
  gradientFrom: '#dbeafe',
  gradientVia:  '#cffafe',
  gradientTo:   '#ccfbf1',
  buttonFrom:   '#1e3a8a',
  buttonVia:    '#0891b2',
  buttonTo:     '#0d9488',
  titleFrom:    '#2563eb',
  titleVia:     '#0891b2',
  titleTo:      '#0d9488',
};

/* ─── компонент ColorRow ─────────────────────────────── */
function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-lg border-2 border-gray-200 flex-shrink-0 cursor-pointer overflow-hidden shadow-sm"
        title={value}
      >
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full border-none cursor-pointer opacity-0 absolute"
          style={{ width: '32px', height: '32px', position: 'relative', opacity: 1, padding: 0 }}
        />
      </div>
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="h-7 text-xs font-mono mt-0.5"
        />
      </div>
    </div>
  );
}

/* ─── компонент ThemePreview ─────────────────────────── */
function ThemePreview({ theme }: { theme: Omit<Theme, 'id'> }) {
  const btnFrom   = theme.buttonFrom   || theme.primaryColor;
  const btnTo     = theme.buttonTo     || theme.accentColor;
  const titleFrom = theme.titleFrom    || theme.primaryColor;
  const titleTo   = theme.titleTo      || theme.accentColor;

  return (
    <div className="rounded-xl overflow-hidden border shadow-md text-xs">
      {/* Hero bg */}
      <div
        className="p-3 relative"
        style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientVia}, ${theme.gradientTo})` }}
      >
        <div
          className="font-bold text-sm bg-clip-text text-transparent inline-block mb-1"
          style={{ backgroundImage: `linear-gradient(to right, ${titleFrom}, ${titleTo})` }}
        >
          Заголовок товару
        </div>
        <div className="flex gap-2 items-center mb-2">
          <span
            className="px-2 py-0.5 rounded text-white text-[10px] font-semibold"
            style={{ background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.accentColor})` }}
          >
            Знижка 50%
          </span>
          <span className="font-bold" style={{ color: theme.primaryColor }}>1200 UAH</span>
        </div>
        <button
          className="w-full py-1.5 rounded text-white text-xs font-bold shadow"
          style={{ background: `linear-gradient(to right, ${btnFrom}, ${btnTo})` }}
        >
          Замовити зараз
        </button>
      </div>
      {/* Footer */}
      <div className="bg-white dark:bg-gray-900 px-3 py-2 flex gap-2">
        <div className="w-4 h-4 rounded-full" style={{ background: theme.primaryColor }} />
        <div className="w-4 h-4 rounded-full" style={{ background: theme.accentColor }} />
        <div className="flex-1 h-4 rounded" style={{ background: `linear-gradient(to right, ${btnFrom}, ${btnTo})`, opacity: 0.3 }} />
      </div>
    </div>
  );
}

/* ─── форма темы ────────────────────────────────────── */
function ThemeForm({
  initial,
  onSave,
  onCancel,
  saveLabel = 'Зберегти',
}: {
  initial: Omit<Theme, 'id'>;
  onSave: (data: Omit<Theme, 'id'>) => Promise<void>;
  onCancel: () => void;
  saveLabel?: string;
}) {
  const [data, setData] = useState<Omit<Theme, 'id'>>(initial);
  const [saving, setSaving] = useState(false);
  const upd = (k: keyof typeof data, v: string) => setData((prev) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!data.name.trim()) { toast.error('Введіть назву теми'); return; }
    setSaving(true);
    try { await onSave(data); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Назва теми *</Label>
        <Input
          value={data.name}
          onChange={(e) => upd('name', e.target.value)}
          placeholder="Моя тема"
          className="mt-1"
        />
      </div>

      <Tabs defaultValue="base">
        <TabsList className="w-full">
          <TabsTrigger value="base" className="flex-1 text-xs">Основні</TabsTrigger>
          <TabsTrigger value="bg"   className="flex-1 text-xs">Фон секцій</TabsTrigger>
          <TabsTrigger value="btn"  className="flex-1 text-xs">Кнопки</TabsTrigger>
          <TabsTrigger value="title" className="flex-1 text-xs">Заголовки</TabsTrigger>
        </TabsList>

        <TabsContent value="base" className="space-y-3 mt-3">
          <ColorRow label="Основний колір" value={data.primaryColor} onChange={(v) => upd('primaryColor', v)} />
          <ColorRow label="Акцентний колір" value={data.accentColor}  onChange={(v) => upd('accentColor', v)}  />
        </TabsContent>

        <TabsContent value="bg" className="space-y-3 mt-3">
          <p className="text-xs text-muted-foreground">Градієнт фону секцій товару</p>
          <ColorRow label="Від (from)"   value={data.gradientFrom} onChange={(v) => upd('gradientFrom', v)} />
          <ColorRow label="Через (via)"  value={data.gradientVia}  onChange={(v) => upd('gradientVia',  v)} />
          <ColorRow label="До (to)"      value={data.gradientTo}   onChange={(v) => upd('gradientTo',   v)} />
        </TabsContent>

        <TabsContent value="btn" className="space-y-3 mt-3">
          <p className="text-xs text-muted-foreground">Градієнт кнопок та ціни</p>
          <ColorRow label="Від (from)"   value={data.buttonFrom || ''} onChange={(v) => upd('buttonFrom', v)} />
          <ColorRow label="Через (via)"  value={data.buttonVia  || ''} onChange={(v) => upd('buttonVia',  v)} />
          <ColorRow label="До (to)"      value={data.buttonTo   || ''} onChange={(v) => upd('buttonTo',   v)} />
        </TabsContent>

        <TabsContent value="title" className="space-y-3 mt-3">
          <p className="text-xs text-muted-foreground">Градієнт заголовків та текстів</p>
          <ColorRow label="Від (from)"   value={data.titleFrom || ''} onChange={(v) => upd('titleFrom', v)} />
          <ColorRow label="Через (via)"  value={data.titleVia  || ''} onChange={(v) => upd('titleVia',  v)} />
          <ColorRow label="До (to)"      value={data.titleTo   || ''} onChange={(v) => upd('titleTo',   v)} />
        </TabsContent>
      </Tabs>

      {/* Live preview */}
      <div>
        <Label className="flex items-center gap-1.5 mb-2">
          <Eye className="w-3.5 h-3.5" /> Попередній перегляд
        </Label>
        <ThemePreview theme={data} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? 'Збереження...' : saveLabel}
        </Button>
        <Button variant="outline" onClick={onCancel}>Скасувати</Button>
      </div>
    </div>
  );
}

/* ─── главный компонент ─────────────────────────────── */
export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  const [themes, setThemes]         = useState<Theme[]>([]);
  const [loading, setLoading]       = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTheme, setEditTheme]   = useState<Theme | null>(null);

  useEffect(() => { fetchThemes(); }, []);

  const fetchThemes = async () => {
    try {
      const res = await fetch('/api/admin/themes');
      if (res.ok) setThemes(await res.json() || []);
    } catch { toast.error('Помилка завантаження тем'); }
    finally { setLoading(false); }
  };

  /* Создать тему */
  const handleCreate = async (data: Omit<Theme, 'id'>) => {
    const res = await fetch('/api/admin/themes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      setThemes((prev) => [created, ...prev]);
      onChange(created.id);
      setCreateOpen(false);
      toast.success('Тему створено');
    } else {
      toast.error('Помилка створення теми');
    }
  };

  /* Обновить тему */
  const handleUpdate = async (data: Omit<Theme, 'id'>) => {
    if (!editTheme) return;
    const res = await fetch(`/api/admin/themes/${editTheme.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setThemes((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditTheme(null);
      toast.success('Тему оновлено');
    } else {
      toast.error('Помилка збереження теми');
    }
  };

  /* Удалить тему из лендинга */
  const handleDetach = () => {
    if (confirm('Видалити тему з лендингу? Стандартна тема буде повернена.')) {
      onChange(null);
      toast.success('Тема видалена. Натисніть «Зберегти» для збереження.');
    }
  };

  /* Удалить тему из БД */
  const handleDeleteFromDB = async (theme: Theme) => {
    if (!confirm(`Видалити тему «${theme.name}» назавжди?`)) return;
    const res = await fetch(`/api/admin/themes/${theme.id}`, { method: 'DELETE' });
    if (res.ok) {
      setThemes((prev) => prev.filter((t) => t.id !== theme.id));
      if (value === theme.id) onChange(null);
      toast.success('Тему видалено');
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || 'Помилка видалення');
    }
  };

  const selectedTheme = themes.find((t) => t.id === value);

  return (
    <div className="space-y-3">
      {/* Хедер */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Тема оформлення</Label>
        <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Нова тема
        </Button>
      </div>

      {/* Список тем */}
      <Select
        value={value || 'none'}
        onValueChange={(val) => onChange(val === 'none' ? null : val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Виберіть тему" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">⚪ Стандартна (без теми)</SelectItem>
          {themes.map((theme) => (
            <SelectItem key={theme.id} value={theme.id}>
              {theme.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Карточка выбранной темы */}
      {selectedTheme && (
        <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
          {/* Цветовые чипы */}
          <div className="flex gap-2 flex-wrap">
            {[
              { label: 'Primary', color: selectedTheme.primaryColor },
              { label: 'Accent',  color: selectedTheme.accentColor  },
              { label: 'Btn',     color: selectedTheme.buttonFrom || selectedTheme.primaryColor },
              { label: 'Title',   color: selectedTheme.titleFrom  || selectedTheme.primaryColor },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: color }} />
                {label}
              </div>
            ))}
          </div>

          {/* Градиент-бар фона */}
          <div
            className="h-6 rounded-lg w-full shadow-inner"
            style={{ background: `linear-gradient(to right, ${selectedTheme.gradientFrom}, ${selectedTheme.gradientVia}, ${selectedTheme.gradientTo})` }}
            title="Фон секцій"
          />

          {/* Кнопки управления */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditTheme(selectedTheme)}
              className="flex-1"
            >
              <Pencil className="w-4 h-4 mr-1" /> Редагувати
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDetach}
              className="flex-1"
            >
              Відв'язати
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteFromDB(selectedTheme)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Диалог: Создать тему ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Створити нову тему</DialogTitle>
          </DialogHeader>
          <ThemeForm
            initial={EMPTY_THEME}
            onSave={handleCreate}
            onCancel={() => setCreateOpen(false)}
            saveLabel="Створити"
          />
        </DialogContent>
      </Dialog>

      {/* ── Диалог: Редактировать тему ── */}
      <Dialog open={!!editTheme} onOpenChange={(o) => { if (!o) setEditTheme(null); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редагувати тему: {editTheme?.name}</DialogTitle>
          </DialogHeader>
          {editTheme && (
            <ThemeForm
              initial={editTheme}
              onSave={handleUpdate}
              onCancel={() => setEditTheme(null)}
              saveLabel="Зберегти зміни"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
