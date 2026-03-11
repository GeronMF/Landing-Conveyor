'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Eye, Copy, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function LandingsPage() {
  const [landings, setLandings] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Создание
  const [createOpen, setCreateOpen] = useState(false);
  const [newSlug, setNewSlug] = useState('');

  // Дублирование
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [duplicateSource, setDuplicateSource] = useState<{ id: string; slug: string } | null>(null);
  const [duplicateSlug, setDuplicateSlug] = useState('');
  const [duplicating, setDuplicating] = useState(false);

  // Удаление
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; slug: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Переименование slug
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: string; slug: string } | null>(null);
  const [renameSlug, setRenameSlug] = useState('');
  const [renaming, setRenaming] = useState(false);

  useEffect(() => {
    fetchLandings();
  }, [search]);

  const fetchLandings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const response = await fetch(`/api/admin/landings?${params}`);
      if (response.ok) setLandings(await response.json());
    } catch {
      toast.error('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  // ── Создать ──────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newSlug.trim()) return;
    try {
      const response = await fetch('/api/admin/landings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: newSlug }),
      });
      if (response.ok) {
        const data = await response.json();
        toast.success('Лендинг создан');
        setCreateOpen(false);
        setNewSlug('');
        fetchLandings();
        router.push(`/admin/landings/${data.id}`);
      } else {
        const err = await response.json();
        toast.error(err.error || 'Ошибка создания');
      }
    } catch {
      toast.error('Ошибка создания');
    }
  };

  // ── Дублировать ──────────────────────────────────────────────────────────
  const openDuplicate = (landing: any) => {
    setDuplicateSource({ id: landing.id, slug: landing.slug });
    setDuplicateSlug(`${landing.slug}-copy`);
    setDuplicateOpen(true);
  };

  const handleDuplicate = async () => {
    if (!duplicateSource || !duplicateSlug.trim()) return;
    setDuplicating(true);
    try {
      const response = await fetch(`/api/admin/landings/${duplicateSource.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: duplicateSlug.trim() }),
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(`Продубльовано як "${data.slug}"`);
        setDuplicateOpen(false);
        fetchLandings();
        router.push(`/admin/landings/${data.id}`);
      } else {
        const err = await response.json();
        toast.error(err.error || 'Помилка дублювання');
      }
    } catch {
      toast.error('Помилка дублювання');
    } finally {
      setDuplicating(false);
    }
  };

  // ── Удалить ──────────────────────────────────────────────────────────────
  const openDelete = (landing: any) => {
    setDeleteTarget({ id: landing.id, slug: landing.slug });
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/landings/${deleteTarget.id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success(`Лендинг "${deleteTarget.slug}" видалено`);
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchLandings();
      } else {
        toast.error('Помилка видалення');
      }
    } catch {
      toast.error('Помилка видалення');
    } finally {
      setDeleting(false);
    }
  };

  // ── Переименовать slug ────────────────────────────────────────────────────
  const openRename = (landing: any) => {
    setRenameTarget({ id: landing.id, slug: landing.slug });
    setRenameSlug(landing.slug);
    setRenameOpen(true);
  };

  const handleRename = async () => {
    if (!renameTarget || !renameSlug.trim()) return;
    if (renameSlug.trim() === renameTarget.slug) {
      setRenameOpen(false);
      return;
    }
    setRenaming(true);
    try {
      const response = await fetch(`/api/admin/landings/${renameTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: renameSlug.trim() }),
      });
      if (response.ok) {
        toast.success(`Slug змінено на "${renameSlug.trim()}"`);
        setRenameOpen(false);
        fetchLandings();
      } else {
        const err = await response.json();
        toast.error(err.error || 'Помилка перейменування');
      }
    } catch {
      toast.error('Помилка перейменування');
    } finally {
      setRenaming(false);
    }
  };

  const slugPattern = (val: string) => val.toLowerCase().replace(/[^a-z0-9-]/g, '');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Лендинги</h1>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Создать
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Новий лендинг</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Slug</Label>
                <Input
                  value={newSlug}
                  onChange={(e) => setNewSlug(slugPattern(e.target.value))}
                  placeholder="my-landing-slug"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Тільки маленькі латинські літери, цифри та дефіси
                </p>
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={!newSlug.trim()}>
                Створити
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Пошук по slug або назві..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Завантаження...</div>
      ) : landings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Лендинги не знайдені</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>Назва</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Варіантів</TableHead>
                <TableHead>Заявок</TableHead>
                <TableHead>Створено</TableHead>
                <TableHead className="text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {landings.map((landing) => (
                <TableRow key={landing.id}>
                  <TableCell className="font-mono">{landing.slug}</TableCell>
                  <TableCell>{landing.pageTitle || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={landing.status === 'published' ? 'default' : 'secondary'}>
                      {landing.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{landing._count.oldVariants}</TableCell>
                  <TableCell>{landing._count.leads}</TableCell>
                  <TableCell>{format(new Date(landing.createdAt), 'dd.MM.yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* Просмотр */}
                      <Button variant="ghost" size="sm" title="Переглянути" asChild>
                        <Link href={`/l/${landing.slug}?preview=1`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>

                      {/* Переименовать slug */}
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Змінити slug"
                        onClick={() => openRename(landing)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      {/* Дублировать */}
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Дублювати"
                        onClick={() => openDuplicate(landing)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      {/* Редактировать */}
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/landings/${landing.id}`}>
                          Редагувати
                        </Link>
                      </Button>

                      {/* Удалить */}
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Видалити"
                        className="text-destructive hover:text-destructive"
                        onClick={() => openDelete(landing)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Диалог: дублирование ── */}
      <Dialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Дублювати лендинг</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Копія лендингу <span className="font-mono font-semibold">{duplicateSource?.slug}</span>
            </p>
            <div>
              <Label>Slug для копії</Label>
              <Input
                value={duplicateSlug}
                onChange={(e) => setDuplicateSlug(slugPattern(e.target.value))}
                placeholder="my-landing-copy"
                onKeyDown={(e) => e.key === 'Enter' && handleDuplicate()}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Тільки маленькі латинські літери, цифри та дефіси
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={handleDuplicate} disabled={duplicating || !duplicateSlug.trim()}>
              {duplicating ? 'Дублюємо...' : 'Дублювати'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Диалог: удаление ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Видалити лендинг?</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              Ви впевнені, що хочете видалити лендинг{' '}
              <span className="font-mono font-semibold text-foreground">{deleteTarget?.slug}</span>?
            </p>
            <p className="text-sm text-destructive mt-2 font-medium">
              Ця дія незворотна. Всі варіанти, відгуки та FAQ будуть видалені.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Скасувати
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Видаляємо...' : 'Видалити'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Диалог: переименовать slug ── */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Змінити slug</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Поточний slug: <span className="font-mono font-semibold">{renameTarget?.slug}</span>
            </p>
            <div>
              <Label>Новий slug</Label>
              <Input
                value={renameSlug}
                onChange={(e) => setRenameSlug(slugPattern(e.target.value))}
                placeholder="new-slug"
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Тільки маленькі латинські літери, цифри та дефіси
              </p>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              ⚠️ Зміна slug змінить URL лендингу. Переконайтесь, що старі посилання більше не використовуються.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              Скасувати
            </Button>
            <Button
              onClick={handleRename}
              disabled={renaming || !renameSlug.trim() || renameSlug === renameTarget?.slug}
            >
              {renaming ? 'Зберігаємо...' : 'Зберегти'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
