'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, ArrowLeft, Save } from 'lucide-react';
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
