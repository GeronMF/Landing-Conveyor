'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, ArrowLeft, Save, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { BilingualField } from './bilingual-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VariantGallery } from './variant-gallery';
import { VariantVideo } from './variant-video';
import { VariantBenefits } from './variant-benefits';
import { VariantSpecifications } from './variant-specifications';
import { VariantReviews } from './variant-reviews';
import { ImageUpload } from './image-upload';
import { Switch } from '@/components/ui/switch';

interface VariantEditorProps {
  variant: any;
  landingId: string;
  onSave: (variant: any) => Promise<void>;
  onDelete?: () => void;
  onBack?: () => void;
  onDuplicate?: (newVariant: any) => void;
}

export function VariantEditor({ variant, landingId, onSave, onDelete, onBack, onDuplicate }: VariantEditorProps) {
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  // Инициализируем с дефолтными значениями для новых полей
  const [localVariant, setLocalVariant] = useState({
    ...variant,
    economyText: variant.economyText || '',
    economyTextRu: variant.economyTextRu || '',
    faqLinkText: variant.faqLinkText || '',
    faqLinkTextRu: variant.faqLinkTextRu || '',
    keycrmOfferSku: variant.keycrmOfferSku || '',
  });

  // Синхронизируем с пропсами при их изменении
  useEffect(() => {
    console.log('VariantEditor: variant updated', {
      id: variant.id,
      economyText: variant.economyText,
      economyTextRu: variant.economyTextRu,
      faqLinkText: variant.faqLinkText,
      faqLinkTextRu: variant.faqLinkTextRu,
    });
    setLocalVariant({
      ...variant,
      economyText: variant.economyText || '',
      economyTextRu: variant.economyTextRu || '',
      faqLinkText: variant.faqLinkText || '',
      faqLinkTextRu: variant.faqLinkTextRu || '',
    });
  }, [variant]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Собираем данные для сохранения, id передаем отдельно
      const variantId = localVariant.id;
      const dataToSave = {
        title: localVariant.title || '',
        titleRu: localVariant.titleRu || null,
        subtitle: localVariant.subtitle || null,
        subtitleRu: localVariant.subtitleRu || null,
        offerText: localVariant.offerText || null,
        offerTextRu: localVariant.offerTextRu || null,
        badgeText: localVariant.badgeText || null,
        badgeTextRu: localVariant.badgeTextRu || null,
        price: typeof localVariant.price === 'number' ? localVariant.price : parseFloat(localVariant.price) || 0,
        oldPrice: localVariant.oldPrice ? (typeof localVariant.oldPrice === 'number' ? localVariant.oldPrice : parseFloat(localVariant.oldPrice)) : null,
        currency: localVariant.currency || 'UAH',
        ctaPrimaryText: localVariant.ctaPrimaryText || '',
        ctaPrimaryTextRu: localVariant.ctaPrimaryTextRu || null,
        ctaSecondaryPhoneText: localVariant.ctaSecondaryPhoneText || null,
        ctaSecondaryPhoneTextRu: localVariant.ctaSecondaryPhoneTextRu || null,
        primaryPhone: localVariant.primaryPhone || null,
        videoUrlDesktop: localVariant.videoUrlDesktop || null,
        videoHtmlDesktop: localVariant.videoHtmlDesktop || null,
        videoUrlMobile: localVariant.videoUrlMobile || null,
        videoHtmlMobile: localVariant.videoHtmlMobile || null,
        videoTitle: localVariant.videoTitle || null,
        videoTitleRu: localVariant.videoTitleRu || null,
        videoText: localVariant.videoText || null,
        videoTextRu: localVariant.videoTextRu || null,
        economyText: localVariant.economyText ? String(localVariant.economyText).trim() || null : null,
        economyTextRu: localVariant.economyTextRu ? String(localVariant.economyTextRu).trim() || null : null,
        faqLinkText: localVariant.faqLinkText ? String(localVariant.faqLinkText).trim() || null : null,
        faqLinkTextRu: localVariant.faqLinkTextRu ? String(localVariant.faqLinkTextRu).trim() || null : null,
        sizeTableHtml: localVariant.sizeTableHtml || null,
        sizeTableHtmlRu: localVariant.sizeTableHtmlRu || null,
        specificationsBackgroundImage: localVariant.specsBackgroundImage || localVariant.specificationsBackgroundImage || null,
        specificationsFixedBackground: localVariant.specsBackgroundFixed ?? localVariant.specificationsFixedBackground ?? false,
        cscartProductId: localVariant.cscartProductId ? String(localVariant.cscartProductId).trim() || null : null,
        keycrmOfferSku: localVariant.keycrmOfferSku ? String(localVariant.keycrmOfferSku).trim() || null : null,
        hideTimer: localVariant.hideTimer ?? false,
        stockText: localVariant.stockText ? String(localVariant.stockText).trim() || null : null,
        stockTextRu: localVariant.stockTextRu ? String(localVariant.stockTextRu).trim() || null : null,
        stockStart: localVariant.stockStart !== undefined && localVariant.stockStart !== null && localVariant.stockStart !== ''
          ? parseInt(String(localVariant.stockStart), 10) || null
          : null,
        stockMin: localVariant.stockMin !== undefined && localVariant.stockMin !== null && localVariant.stockMin !== ''
          ? parseInt(String(localVariant.stockMin), 10) || null
          : null,
        whyUsTitle: localVariant.whyUsTitle ? String(localVariant.whyUsTitle).trim() || null : null,
        whyUsTitleRu: localVariant.whyUsTitleRu ? String(localVariant.whyUsTitleRu).trim() || null : null,
        whyUsItems: Array.isArray(localVariant.whyUsItems) && localVariant.whyUsItems.length > 0
          ? localVariant.whyUsItems
          : null,
        measureGuideTitle: localVariant.measureGuideTitle ? String(localVariant.measureGuideTitle).trim() || null : null,
        measureGuideTitleRu: localVariant.measureGuideTitleRu ? String(localVariant.measureGuideTitleRu).trim() || null : null,
        measureGuideHtml: localVariant.measureGuideHtml ? String(localVariant.measureGuideHtml).trim() || null : null,
        measureGuideHtmlRu: localVariant.measureGuideHtmlRu ? String(localVariant.measureGuideHtmlRu).trim() || null : null,
        measureGuideImage: localVariant.measureGuideImage || null,
      };
      // Передаем id вместе с данными
      await onSave({ id: variantId, ...dataToSave });
    } catch (error: any) {
      console.error('Error saving variant:', error);
      toast.error('Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    setDuplicating(true);
    try {
      const response = await fetch(`/api/admin/variants/${localVariant.id}/duplicate`, {
        method: 'POST',
      });
      if (response.ok) {
        const newVariant = await response.json();
        toast.success('Варіант продубльовано');
        onDuplicate?.(newVariant);
      } else {
        const err = await response.json();
        toast.error(`Помилка: ${err.error || 'Невідома помилка'}`);
      }
    } catch (e: any) {
      toast.error(`Помилка: ${e.message}`);
    } finally {
      setDuplicating(false);
    }
  };

  // Обновляем локальное состояние при изменении подвкладок
  const handleVariantUpdate = (data: any) => {
    setLocalVariant({ ...localVariant, ...data });
  };

  // --- Управление карточками блока "Чому наш" ---
  const whyUsItems: any[] = Array.isArray(localVariant.whyUsItems) ? localVariant.whyUsItems : [];

  const updateWhyUsItem = (index: number, patch: any) => {
    const next = whyUsItems.map((item, i) => (i === index ? { ...item, ...patch } : item));
    setLocalVariant({ ...localVariant, whyUsItems: next });
  };

  const addWhyUsItem = () => {
    setLocalVariant({
      ...localVariant,
      whyUsItems: [...whyUsItems, { title: '', titleRu: '', text: '', textRu: '' }],
    });
  };

  const removeWhyUsItem = (index: number) => {
    setLocalVariant({ ...localVariant, whyUsItems: whyUsItems.filter((_, i) => i !== index) });
  };

  const moveWhyUsItem = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= whyUsItems.length) return;
    const next = [...whyUsItems];
    [next[index], next[target]] = [next[target], next[index]];
    setLocalVariant({ ...localVariant, whyUsItems: next });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <CardTitle>Редагування варіанту</CardTitle>
          </div>
          <div className="flex gap-2">
            {onDuplicate && (
              <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={duplicating}>
                <Copy className="w-4 h-4 mr-2" />
                {duplicating ? 'Копіюємо...' : 'Дублювати'}
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={onDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Видалити
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-1" />
              {saving ? 'Зберігаємо...' : 'Зберегти'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList>
            <TabsTrigger value="basic">Основне</TabsTrigger>
            <TabsTrigger value="gallery">Галерея</TabsTrigger>
            <TabsTrigger value="video">Відео</TabsTrigger>
            <TabsTrigger value="benefits">Переваги</TabsTrigger>
            <TabsTrigger value="whyus">Чому наш</TabsTrigger>
            <TabsTrigger value="specs">Характеристики</TabsTrigger>
            <TabsTrigger value="sizes">Таблиці розмірів</TabsTrigger>
            <TabsTrigger value="reviews">Відгуки</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <BilingualField
              label="Назва варіанту"
              ukValue={localVariant.title || ''}
              ruValue={localVariant.titleRu || ''}
              onUkChange={(value) => setLocalVariant({ ...localVariant, title: value })}
              onRuChange={(value) => setLocalVariant({ ...localVariant, titleRu: value })}
            />

            <BilingualField
              label="Підзаголовок"
              ukValue={localVariant.subtitle || ''}
              ruValue={localVariant.subtitleRu || ''}
              onUkChange={(value) => setLocalVariant({ ...localVariant, subtitle: value })}
              onRuChange={(value) => setLocalVariant({ ...localVariant, subtitleRu: value })}
              type="rich"
            />

            <BilingualField
              label="Текст оффера"
              ukValue={localVariant.offerText || ''}
              ruValue={localVariant.offerTextRu || ''}
              onUkChange={(value) => setLocalVariant({ ...localVariant, offerText: value })}
              onRuChange={(value) => setLocalVariant({ ...localVariant, offerTextRu: value })}
              type="rich"
            />

            <BilingualField
              label="Бейдж"
              ukValue={localVariant.badgeText || ''}
              ruValue={localVariant.badgeTextRu || ''}
              onUkChange={(value) => setLocalVariant({ ...localVariant, badgeText: value })}
              onRuChange={(value) => setLocalVariant({ ...localVariant, badgeTextRu: value })}
            />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Ціна</Label>
                <Input
                  type="number"
                  value={localVariant.price || ''}
                  onChange={(e) => setLocalVariant({ ...localVariant, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Стара ціна</Label>
                <Input
                  type="number"
                  value={localVariant.oldPrice || ''}
                  onChange={(e) => setLocalVariant({ ...localVariant, oldPrice: parseFloat(e.target.value) || null })}
                />
              </div>
              <div>
                <Label>Валюта</Label>
                <Input
                  value={localVariant.currency || 'UAH'}
                  onChange={(e) => setLocalVariant({ ...localVariant, currency: e.target.value })}
                />
              </div>
            </div>

            <BilingualField
              label="Кнопка CTA"
              ukValue={localVariant.ctaPrimaryText || ''}
              ruValue={localVariant.ctaPrimaryTextRu || ''}
              onUkChange={(value) => setLocalVariant({ ...localVariant, ctaPrimaryText: value })}
              onRuChange={(value) => setLocalVariant({ ...localVariant, ctaPrimaryTextRu: value })}
            />

            <BilingualField
              label="Текст під кнопкою"
              ukValue={localVariant.ctaSecondaryPhoneText || ''}
              ruValue={localVariant.ctaSecondaryPhoneTextRu || ''}
              onUkChange={(value) => setLocalVariant({ ...localVariant, ctaSecondaryPhoneText: value })}
              onRuChange={(value) => setLocalVariant({ ...localVariant, ctaSecondaryPhoneTextRu: value })}
            />

            <div>
              <Label>Телефон</Label>
              <Input
                value={localVariant.primaryPhone || ''}
                onChange={(e) => setLocalVariant({ ...localVariant, primaryPhone: e.target.value })}
              />
            </div>

            <div>
              <Label>ID товару CS-Cart</Label>
              <Input
                placeholder="Наприклад: 13992"
                value={localVariant.cscartProductId || ''}
                onChange={(e) => setLocalVariant({ ...localVariant, cscartProductId: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                ID товару з CS-Cart. При відправці заявки буде створено замовлення з цим товаром.
              </p>
            </div>

            <div>
              <Label>SKU товару в KeyCRM</Label>
              <Input
                placeholder="Наприклад: WINTER_SUIT_RED_M"
                value={localVariant.keycrmOfferSku || ''}
                onChange={(e) =>
                  setLocalVariant({ ...localVariant, keycrmOfferSku: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                SKU товару з KeyCRM. Використовується при створенні замовлення в KeyCRM.
              </p>
            </div>

            <BilingualField
              label="Текст бейджа економії"
              ukValue={localVariant.economyText || ''}
              ruValue={localVariant.economyTextRu || ''}
              onUkChange={(value) => setLocalVariant({ ...localVariant, economyText: value })}
              onRuChange={(value) => setLocalVariant({ ...localVariant, economyTextRu: value })}
            />

            <BilingualField
              label="Текст посилання на FAQ"
              ukValue={localVariant.faqLinkText || ''}
              ruValue={localVariant.faqLinkTextRu || ''}
              onUkChange={(value) => setLocalVariant({ ...localVariant, faqLinkText: value })}
              onRuChange={(value) => setLocalVariant({ ...localVariant, faqLinkTextRu: value })}
            />

            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Перший екран: таймер та дефіцит</h3>

              <div className="flex items-center space-x-2">
                <Switch
                  id="hide-timer"
                  checked={localVariant.hideTimer ?? false}
                  onCheckedChange={(checked) => setLocalVariant({ ...localVariant, hideTimer: checked })}
                />
                <Label htmlFor="hide-timer" className="cursor-pointer">
                  Сховати таймер зворотного відліку
                </Label>
              </div>

              <BilingualField
                label="Текст дефіциту (використовуйте {n} для числа)"
                ukValue={localVariant.stockText || ''}
                ruValue={localVariant.stockTextRu || ''}
                onUkChange={(value) => setLocalVariant({ ...localVariant, stockText: value })}
                onRuChange={(value) => setLocalVariant({ ...localVariant, stockTextRu: value })}
              />
              <p className="text-xs text-muted-foreground -mt-2">
                Приклад: «🔥 Залишилось {'{n}'} шт». Залиште порожнім, щоб не показувати блок.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Початкова кількість</Label>
                  <Input
                    type="number"
                    placeholder="Напр. 12"
                    value={localVariant.stockStart ?? ''}
                    onChange={(e) => setLocalVariant({ ...localVariant, stockStart: e.target.value === '' ? null : parseInt(e.target.value, 10) })}
                  />
                </div>
                <div>
                  <Label>Мінімальна кількість</Label>
                  <Input
                    type="number"
                    placeholder="Напр. 2"
                    value={localVariant.stockMin ?? ''}
                    onChange={(e) => setLocalVariant({ ...localVariant, stockMin: e.target.value === '' ? null : parseInt(e.target.value, 10) })}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground -mt-2">
                Число плавно зменшується протягом дня від початкового до мінімального і скидається щодня.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="mt-4">
            <VariantGallery
              images={localVariant.oldImages || []}
              landingId={landingId}
              variantId={localVariant.id}
              onUpdate={(images) => setLocalVariant({ ...localVariant, oldImages: images })}
            />
          </TabsContent>

          <TabsContent value="video" className="mt-4">
            <VariantVideo
              variant={localVariant}
              onUpdate={handleVariantUpdate}
            />
          </TabsContent>

          <TabsContent value="benefits" className="mt-4">
            <VariantBenefits
              benefits={localVariant.oldBenefits || []}
              landingId={landingId}
              variantId={localVariant.id}
              onUpdate={(benefits) => setLocalVariant({ ...localVariant, oldBenefits: benefits })}
            />
          </TabsContent>

          <TabsContent value="whyus" className="mt-4 space-y-4">
            <div className="text-sm text-muted-foreground bg-muted/40 rounded-lg p-3">
              Блок-порівняння «Чому наш» (напр. «Чому 1000, а не 700 як в інших»). Кожна картка — окремий аргумент. Якщо карток немає, блок не показується.
            </div>

            <BilingualField
              label="Заголовок блоку"
              ukValue={localVariant.whyUsTitle || ''}
              ruValue={localVariant.whyUsTitleRu || ''}
              onUkChange={(value) => setLocalVariant({ ...localVariant, whyUsTitle: value })}
              onRuChange={(value) => setLocalVariant({ ...localVariant, whyUsTitleRu: value })}
            />

            <div className="space-y-4">
              {whyUsItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">Картка {index + 1}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => moveWhyUsItem(index, -1)} disabled={index === 0}>
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => moveWhyUsItem(index, 1)} disabled={index === whyUsItems.length - 1}>
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeWhyUsItem(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <BilingualField
                    label="Заголовок картки"
                    ukValue={item.title || ''}
                    ruValue={item.titleRu || ''}
                    onUkChange={(value) => updateWhyUsItem(index, { title: value })}
                    onRuChange={(value) => updateWhyUsItem(index, { titleRu: value })}
                  />

                  <BilingualField
                    label="Текст картки"
                    ukValue={item.text || ''}
                    ruValue={item.textRu || ''}
                    onUkChange={(value) => updateWhyUsItem(index, { text: value })}
                    onRuChange={(value) => updateWhyUsItem(index, { textRu: value })}
                    type="rich"
                  />
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={addWhyUsItem} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Додати картку
            </Button>

            <Button onClick={handleSave} className="w-full" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Зберігаємо...' : 'Зберегти блок «Чому наш»'}
            </Button>
          </TabsContent>

          <TabsContent value="specs" className="mt-4 space-y-6">
            <VariantSpecifications
              specifications={localVariant.oldSpecifications || []}
              variantId={localVariant.id}
              onUpdate={(specs) => setLocalVariant({ ...localVariant, oldSpecifications: specs })}
            />
            
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Фон для секції характеристик</h3>
              
              <div>
                <Label>Фонове зображення</Label>
                <div className="mt-2">
                  <ImageUpload
                    value={localVariant.specificationsBackgroundImage || localVariant.specsBackgroundImage || undefined}
                    onChange={(url) => setLocalVariant({ ...localVariant, specificationsBackgroundImage: url || null, specsBackgroundImage: url || null })}
                    landingId={landingId}
                    label="Завантажити фонове зображення"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Якщо не вказано, буде використано друге зображення з галереї
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="specs-fixed-bg"
                  checked={localVariant.specificationsFixedBackground ?? localVariant.specsBackgroundFixed ?? false}
                  onCheckedChange={(checked) => setLocalVariant({ ...localVariant, specificationsFixedBackground: checked, specsBackgroundFixed: checked })}
                />
                <Label htmlFor="specs-fixed-bg" className="cursor-pointer">
                  Фіксований фон (для десктопу)
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                На мобільних пристроях фіксований фон не підтримується, буде використано паралакс-ефект
              </p>
            </div>
          </TabsContent>

          <TabsContent value="sizes" className="mt-4 space-y-4">
            {/* Предупреждение о старых таблицах в БД */}
            {localVariant.oldSizeTables && localVariant.oldSizeTables.length > 0 && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-lg p-3 text-sm text-amber-800">
                <span className="text-amber-500 mt-0.5">⚠️</span>
                <div className="flex-1">
                  <p className="font-semibold">На лендингу відображаються старі таблиці розмірів ({localVariant.oldSizeTables.length} шт.)</p>
                  <p className="mt-0.5 text-amber-700">Вони будуть показані доки ви не заповните HTML-поле нижче або не видалите їх.</p>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-2"
                    onClick={async () => {
                      if (!confirm('Видалити всі старі таблиці розмірів?')) return;
                      try {
                        const res = await fetch(`/api/admin/variants/${localVariant.id}/size-tables`, { method: 'DELETE' });
                        if (res.ok) {
                          setLocalVariant({ ...localVariant, oldSizeTables: [] });
                          toast.success('Старі таблиці видалено');
                        } else {
                          toast.error('Помилка видалення');
                        }
                      } catch {
                        toast.error('Помилка видалення');
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Видалити старі таблиці
                  </Button>
                </div>
              </div>
            )}
            <div className="text-sm text-muted-foreground bg-muted/40 rounded-lg p-3">
              Вставте готовий HTML з таблицями розмірів. Підтримуються теги <code>&lt;table&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;strong&gt;</code>, <code>&lt;br&gt;</code> тощо. Теги <code>&lt;style&gt;</code> будуть ігноруватись.
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Таблиця розмірів (UA)</Label>
              </div>
              <Textarea
                value={localVariant.sizeTableHtml || ''}
                onChange={(e) => setLocalVariant({ ...localVariant, sizeTableHtml: e.target.value })}
                rows={12}
                className="font-mono text-xs"
                placeholder="<p><strong>Розмірний ряд...</strong></p><table>...</table>"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Таблиця розмірів (RU)</Label>
              </div>
              <Textarea
                value={localVariant.sizeTableHtmlRu || ''}
                onChange={(e) => setLocalVariant({ ...localVariant, sizeTableHtmlRu: e.target.value })}
                rows={12}
                className="font-mono text-xs"
                placeholder="<p><strong>Размерный ряд...</strong></p><table>...</table>"
              />
            </div>
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Як зняти мірки</h3>
              <p className="text-xs text-muted-foreground">
                Показується одразу під таблицею розмірів. Можна додати картинку-схему та/або текст-інструкцію.
              </p>

              <BilingualField
                label="Заголовок блоку"
                ukValue={localVariant.measureGuideTitle || ''}
                ruValue={localVariant.measureGuideTitleRu || ''}
                onUkChange={(value) => setLocalVariant({ ...localVariant, measureGuideTitle: value })}
                onRuChange={(value) => setLocalVariant({ ...localVariant, measureGuideTitleRu: value })}
                placeholder="Як зняти мірки"
              />

              <div>
                <Label>Картинка-схема замірів</Label>
                <div className="mt-2">
                  <ImageUpload
                    value={localVariant.measureGuideImage || undefined}
                    onChange={(url) => setLocalVariant({ ...localVariant, measureGuideImage: url || null })}
                    landingId={landingId}
                    label="Завантажити схему замірів"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Інструкція «Як зняти мірки» (UA)</Label>
                <Textarea
                  value={localVariant.measureGuideHtml || ''}
                  onChange={(e) => setLocalVariant({ ...localVariant, measureGuideHtml: e.target.value })}
                  rows={8}
                  className="font-mono text-xs"
                  placeholder="<p>Як правильно зняти мірки...</p><ul><li>...</li></ul>"
                />
              </div>
              <div className="space-y-2">
                <Label>Інструкція «Як зняти мірки» (RU)</Label>
                <Textarea
                  value={localVariant.measureGuideHtmlRu || ''}
                  onChange={(e) => setLocalVariant({ ...localVariant, measureGuideHtmlRu: e.target.value })}
                  rows={8}
                  className="font-mono text-xs"
                  placeholder="<p>Как правильно снять мерки...</p><ul><li>...</li></ul>"
                />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Зберігаємо...' : 'Зберегти таблиці розмірів'}
            </Button>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <VariantReviews
              reviews={localVariant.oldReviews || []}
              landingId={landingId}
              variantId={localVariant.id}
              onUpdate={(reviews) => setLocalVariant({ ...localVariant, oldReviews: reviews })}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
