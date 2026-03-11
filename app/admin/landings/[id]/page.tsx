'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Eye, Trash2, Plus, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { JsonEditor } from '@/components/admin/json-editor';
import { BilingualField } from '@/components/admin/bilingual-field';
import { ImageUpload } from '@/components/admin/image-upload';
import { VariantEditor } from '@/components/admin/variant-editor';
import { FAQEditor } from '@/components/admin/faq-editor';
import { ThemeSelector } from '@/components/admin/theme-selector';
import { FormConfigEditor } from '@/components/admin/form-config-editor';

export default function EditLandingPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = 'then' in params ? use(params) : params;
  const { id } = resolvedParams;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [landing, setLanding] = useState<any>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchLanding();
    }
  }, [id]);

  // Загружаем полные данные варианта при выборе
  useEffect(() => {
    if (selectedVariantId && landing?.oldVariants) {
      const variant = landing.oldVariants.find((v: any) => v.id === selectedVariantId);
      // Всегда загружаем полные данные варианта из БД, чтобы получить все поля включая economyText, faqLinkText
      if (variant) {
        const loadVariant = async () => {
          try {
            const response = await fetch(`/api/admin/variants/${selectedVariantId}`);
            if (response.ok) {
              const fullVariant = await response.json();
              console.log('Loaded full variant from API:', {
                id: fullVariant.id,
                economyText: fullVariant.economyText,
                economyTextRu: fullVariant.economyTextRu,
                faqLinkText: fullVariant.faqLinkText,
                faqLinkTextRu: fullVariant.faqLinkTextRu,
                allFields: Object.keys(fullVariant),
              });
              setLanding((prevLanding) => ({
                ...prevLanding,
                oldVariants: prevLanding.oldVariants.map((v: any) =>
                  v.id === fullVariant.id ? fullVariant : v
                ),
              }));
            } else {
              const errorData = await response.json();
              console.error('Error loading variant:', errorData);
            }
          } catch (error: any) {
            console.error('Error loading variant:', error);
          }
        };
        loadVariant();
      }
    }
  }, [selectedVariantId]);

  const fetchLanding = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/landings/${id}`);
      if (response.ok) {
        const data = await response.json();
        // Инициализируем JSON поля, если их нет
        setLanding({
          ...data,
          heroImages: data.heroImages || null,
          variantsJson: data.variantsJson || null,
          faqsJson: data.faqsJson || null,
          companyInfo: data.companyInfo || null,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Ошибка загрузки:', errorData);
        toast.error('Лендинг не найден');
        router.push('/admin/landings');
      }
    } catch (error: any) {
      console.error('Ошибка при загрузке:', error);
      toast.error(`Ошибка загрузки: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!landing) return;
    
    setSaving(true);
    try {
      // Подготавливаем данные для отправки - только разрешенные поля
      const dataToSend: any = {
        slug: landing.slug,
        status: landing.status,
        pageTitle: landing.pageTitle || null,
        pageTitleRu: landing.pageTitleRu || null,
        introText: landing.introText || null,
        introTextRu: landing.introTextRu || null,
        globalFAQTitle: landing.globalFAQTitle || 'FAQ',
        globalFAQTitleRu: landing.globalFAQTitleRu || null,
        seoTitle: landing.seoTitle || null,
        seoTitleRu: landing.seoTitleRu || null,
        seoDescription: landing.seoDescription || null,
        seoDescriptionRu: landing.seoDescriptionRu || null,
        ogImage: landing.ogImage || null,
        logoUrl: landing.logoUrl || null,
        themeId: landing.themeId || null,
        themePrimaryColor: landing.themePrimaryColor || null,
        themeAccentColor: landing.themeAccentColor || null,
        companyName: landing.companyName || null,
        companyNameRu: landing.companyNameRu || null,
        legalText: landing.legalText || null,
        legalTextRu: landing.legalTextRu || null,
        privacyPolicyText: landing.privacyPolicyText || null,
        privacyPolicyTextRu: landing.privacyPolicyTextRu || null,
        termsText: landing.termsText || null,
        termsTextRu: landing.termsTextRu || null,
        copyrightText: landing.copyrightText || null,
        copyrightTextRu: landing.copyrightTextRu || null,
        phone: landing.phone || null,
        email: landing.email || null,
        socials: landing.socials || null,
        links: landing.links || null,
        formConfig: landing.formConfig || null,
        ageVerification: landing.ageVerification ?? false,
        howToOrder: landing.howToOrder || null,
        delivery: landing.delivery || null,
      };

      const response = await fetch(`/api/admin/landings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        toast.success('Сохранено');
        fetchLanding();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Ошибка сохранения:', errorData);
        toast.error(`Ошибка сохранения: ${errorData.error || response.statusText}`);
      }
    } catch (error: any) {
      console.error('Ошибка при сохранении:', error);
      toast.error(`Ошибка сохранения: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const newStatus = landing.status === 'published' ? 'draft' : 'published';
    setLanding({ ...landing, status: newStatus });

    try {
      await fetch(`/api/admin/landings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(newStatus === 'published' ? 'Опубликовано' : 'Снято с публикации');
    } catch {
      toast.error('Ошибка');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>;
  }

  if (!landing) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/landings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {landing.pageTitle || landing.slug}
            </h1>
            <p className="text-sm text-muted-foreground">/{landing.slug}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/l/${landing.slug}?preview=1`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
          <Button
            variant={landing.status === 'published' ? 'secondary' : 'default'}
            onClick={handlePublish}
          >
            {landing.status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Общие</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="variants">Варіанти товару</TabsTrigger>
          <TabsTrigger value="form">Форма замовлення</TabsTrigger>
          <TabsTrigger value="sections">Секції сторінки</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="company">Інфо компанії / Футер</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Загальні налаштування</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <BilingualField
                label="Заголовок сторінки (H1)"
                ukValue={landing.pageTitle || ''}
                ruValue={landing.pageTitleRu || ''}
                onUkChange={(value) => setLanding({ ...landing, pageTitle: value })}
                onRuChange={(value) => setLanding({ ...landing, pageTitleRu: value })}
              />

              <BilingualField
                label="Вступний текст"
                ukValue={landing.introText || ''}
                ruValue={landing.introTextRu || ''}
                onUkChange={(value) => setLanding({ ...landing, introText: value })}
                onRuChange={(value) => setLanding({ ...landing, introTextRu: value })}
                type="textarea"
                textareaRows={4}
              />

              <BilingualField
                label="Назва FAQ секції"
                ukValue={landing.globalFAQTitle || 'FAQ'}
                ruValue={landing.globalFAQTitleRu || ''}
                onUkChange={(value) => setLanding({ ...landing, globalFAQTitle: value })}
                onRuChange={(value) => setLanding({ ...landing, globalFAQTitleRu: value })}
              />

              <div>
                <Label>Логотип</Label>
                <div className="mt-2">
                  <ImageUpload
                    value={landing.logoUrl || undefined}
                    onChange={(url) => setLanding({ ...landing, logoUrl: url || null })}
                    landingId={id}
                    label="Завантажити логотип"
                  />
                </div>
              </div>

              <ThemeSelector
                value={landing.themeId}
                onChange={(themeId) => {
                  // При удалении темы также очищаем fallback цвета
                  if (!themeId) {
                    setLanding({ 
                      ...landing, 
                      themeId: null,
                      themePrimaryColor: null,
                      themeAccentColor: null
                    });
                  } else {
                    setLanding({ ...landing, themeId });
                  }
                }}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Основний колір (якщо без теми)</Label>
                  <Input
                    type="color"
                    value={landing.themePrimaryColor || '#2563eb'}
                    onChange={(e) =>
                      setLanding({
                        ...landing,
                        themePrimaryColor: e.target.value,
                      })
                    }
                    className="h-12"
                  />
                </div>
                <div>
                  <Label>Акцентний колір (якщо без теми)</Label>
                  <Input
                    type="color"
                    value={landing.themeAccentColor || '#10b981'}
                    onChange={(e) =>
                      setLanding({
                        ...landing,
                        themeAccentColor: e.target.value,
                      })
                    }
                    className="h-12"
                  />
                </div>
              </div>

              {/* 18+ Попап підтвердження */}
              <div className="flex items-center justify-between rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 px-4 py-3">
                <div>
                  <Label className="font-semibold text-rose-700 dark:text-rose-400">🔞 Попап підтвердження 18+</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Перед входом на лендинг відвідувач повинен підтвердити свій вік
                  </p>
                </div>
                <Switch
                  checked={landing.ageVerification ?? false}
                  onCheckedChange={(checked) => setLanding({ ...landing, ageVerification: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO налаштування</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <BilingualField
                label="SEO Title"
                ukValue={landing.seoTitle || ''}
                ruValue={landing.seoTitleRu || ''}
                onUkChange={(value) => setLanding({ ...landing, seoTitle: value })}
                onRuChange={(value) => setLanding({ ...landing, seoTitleRu: value })}
              />

              <BilingualField
                label="SEO Description"
                ukValue={landing.seoDescription || ''}
                ruValue={landing.seoDescriptionRu || ''}
                onUkChange={(value) => setLanding({ ...landing, seoDescription: value })}
                onRuChange={(value) => setLanding({ ...landing, seoDescriptionRu: value })}
                type="textarea"
                textareaRows={3}
              />

              <div>
                <Label>OG Image</Label>
                <div className="mt-2">
                  <ImageUpload
                    value={landing.ogImage || undefined}
                    onChange={(url) => setLanding({ ...landing, ogImage: url || null })}
                    landingId={id}
                    label="Завантажити OG зображення"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Варіанти товару</CardTitle>
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/admin/variants', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          landingId: id,
                          order: (landing.oldVariants?.length || 0) + 1,
                          title: 'Новий варіант',
                          price: 0,
                          currency: 'UAH',
                        }),
                      });
                      if (response.ok) {
                        const newVariant = await response.json();
                        setLanding({
                          ...landing,
                          oldVariants: [...(landing.oldVariants || []), newVariant],
                        });
                        setSelectedVariantId(newVariant.id);
                        toast.success('Варіант створено');
                      }
                    } catch (error: any) {
                      toast.error(`Помилка: ${error.message}`);
                    }
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Додати варіант
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {landing.oldVariants && landing.oldVariants.length > 0 ? (
                <div className="space-y-4">
                  {selectedVariantId ? (() => {
                    const variant = landing.oldVariants.find((v: any) => v.id === selectedVariantId);
                    if (!variant) return <div>Завантаження...</div>;
                    
                    // Логируем для отладки
                    console.log('Rendering VariantEditor with variant:', {
                      id: variant.id,
                      economyText: variant.economyText,
                      economyTextRu: variant.economyTextRu,
                      faqLinkText: variant.faqLinkText,
                      faqLinkTextRu: variant.faqLinkTextRu,
                    });
                    
                    return (
                      <VariantEditor
                        key={`${variant.id}-${variant.economyText || ''}-${variant.faqLinkText || ''}`}
                        variant={variant}
                        landingId={id}
                        onBack={() => setSelectedVariantId(null)}
                        onSave={async (updatedVariant) => {
                          try {
                            // Убираем id из тела запроса, он используется только в URL
                            const { id, ...dataToSend } = updatedVariant;
                            console.log('Sending variant update:', { id, dataToSend });
                            const response = await fetch(`/api/admin/variants/${id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(dataToSend),
                            });
                            if (response.ok) {
                              // Перезагружаем вариант с полными данными
                              const fullResponse = await fetch(`/api/admin/variants/${updatedVariant.id}`);
                              if (fullResponse.ok) {
                                const fullVariant = await fullResponse.json();
                                setLanding({
                                  ...landing,
                                  oldVariants: landing.oldVariants.map((v: any) =>
                                    v.id === fullVariant.id ? fullVariant : v
                                  ),
                                });
                                toast.success('Збережено');
                              } else {
                                const errorData = await fullResponse.json();
                                toast.error(`Помилка завантаження: ${errorData.error || 'Невідома помилка'}`);
                              }
                            } else {
                              const errorData = await response.json();
                              toast.error(`Помилка збереження: ${errorData.error || 'Невідома помилка'}`);
                            }
                          } catch (error: any) {
                            console.error('Error saving variant:', error);
                            toast.error(`Помилка: ${error.message || 'Невідома помилка'}`);
                          }
                        }}
                        onDelete={async () => {
                          if (confirm('Видалити варіант?')) {
                            try {
                              const response = await fetch(`/api/admin/variants/${selectedVariantId}`, {
                                method: 'DELETE',
                              });
                              if (response.ok) {
                                setLanding({
                                  ...landing,
                                  oldVariants: landing.oldVariants.filter((v: any) => v.id !== selectedVariantId),
                                });
                                setSelectedVariantId(null);
                                toast.success('Варіант видалено');
                              }
                            } catch (error: any) {
                              toast.error(`Помилка: ${error.message}`);
                            }
                          }
                        }}
                        onDuplicate={(newVariant) => {
                          setLanding({
                            ...landing,
                            oldVariants: [...landing.oldVariants, newVariant],
                          });
                          setSelectedVariantId(newVariant.id);
                        }}
                      />
                    );
                  })() : (
                    <div className="space-y-2">
                      {landing.oldVariants.map((variant: any) => (
                        <Button
                          key={variant.id}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={async () => {
                            setSelectedVariantId(variant.id);
                            // Загружаем полные данные варианта
                            try {
                              const response = await fetch(`/api/admin/variants/${variant.id}`);
                              if (response.ok) {
                                const fullVariant = await response.json();
                                setLanding({
                                  ...landing,
                                  oldVariants: landing.oldVariants.map((v: any) =>
                                    v.id === fullVariant.id ? fullVariant : v
                                  ),
                                });
                              }
                            } catch (error: any) {
                              console.error('Error loading variant:', error);
                            }
                          }}
                        >
                          {variant.title || `Варіант ${variant.order}`}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Немає варіантів. Натисніть "Додати варіант" щоб створити перший.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>Налаштування форми замовлення</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                Налаштуйте вигляд та поля форми замовлення. Натисніть <strong>Зберегти</strong> у верхній панелі після змін.
              </p>
              <FormConfigEditor
                value={landing.formConfig || null}
                onChange={(config) => setLanding({ ...landing, formConfig: config })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== СЕКЦІЇ СТОРІНКИ ===== */}
        <TabsContent value="sections">
          <div className="space-y-6">
            {/* ---- Як замовити ---- */}
            <Card>
              <CardHeader>
                <CardTitle>Як замовити?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Секція відображається перед FAQ. Якщо кроків немає — секція прихована.
                </p>

                <BilingualField
                  label="Заголовок секції"
                  ukValue={(landing.howToOrder as any)?.title || ''}
                  ruValue={(landing.howToOrder as any)?.titleRu || ''}
                  onUkChange={(v) => setLanding({ ...landing, howToOrder: { ...(landing.howToOrder as any || {}), title: v } })}
                  onRuChange={(v) => setLanding({ ...landing, howToOrder: { ...(landing.howToOrder as any || {}), titleRu: v } })}
                  placeholder="Як замовити"
                />

                <BilingualField
                  label="Назва товару (виділяється кольором)"
                  ukValue={(landing.howToOrder as any)?.productName || ''}
                  ruValue={(landing.howToOrder as any)?.productNameRu || ''}
                  onUkChange={(v) => setLanding({ ...landing, howToOrder: { ...(landing.howToOrder as any || {}), productName: v } })}
                  onRuChange={(v) => setLanding({ ...landing, howToOrder: { ...(landing.howToOrder as any || {}), productNameRu: v } })}
                  placeholder="Назва товару"
                />

                {/* Steps */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Кроки</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const steps = [...((landing.howToOrder as any)?.steps || [])];
                        steps.push({ icon: 'clipboard', label: `Крок ${steps.length + 1}:`, labelRu: `Шаг ${steps.length + 1}:`, text: '', textRu: '' });
                        setLanding({ ...landing, howToOrder: { ...(landing.howToOrder as any || {}), steps } });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Додати крок
                    </Button>
                  </div>

                  {((landing.howToOrder as any)?.steps || []).map((step: any, idx: number) => (
                    <div key={idx} className="border rounded-xl p-4 space-y-3 bg-muted/20 relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-muted-foreground">Крок {idx + 1}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive h-7 px-2"
                          onClick={() => {
                            const steps = [...((landing.howToOrder as any)?.steps || [])];
                            steps.splice(idx, 1);
                            setLanding({ ...landing, howToOrder: { ...(landing.howToOrder as any || {}), steps } });
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      {/* Icon selector */}
                      <div>
                        <Label className="text-xs">Іконка</Label>
                        <select
                          className="mt-1 w-full border rounded-md px-3 py-1.5 text-sm bg-background"
                          value={step.icon || 'clipboard'}
                          onChange={(e) => {
                            const steps = [...((landing.howToOrder as any)?.steps || [])];
                            steps[idx] = { ...steps[idx], icon: e.target.value };
                            setLanding({ ...landing, howToOrder: { ...(landing.howToOrder as any || {}), steps } });
                          }}
                        >
                          <option value="clipboard">📋 Форма / Замовлення</option>
                          <option value="phone">📞 Телефон</option>
                          <option value="credit-card">💳 Оплата</option>
                          <option value="package">📦 Упаковка</option>
                          <option value="truck">🚚 Доставка</option>
                          <option value="check">✅ Перевірка</option>
                          <option value="cart">🛒 Кошик</option>
                          <option value="message">💬 Повідомлення</option>
                        </select>
                      </div>

                      <BilingualField
                        label="Підпис (наприклад: Крок 1:)"
                        ukValue={step.label || ''}
                        ruValue={step.labelRu || ''}
                        onUkChange={(v) => {
                          const steps = [...((landing.howToOrder as any)?.steps || [])];
                          steps[idx] = { ...steps[idx], label: v };
                          setLanding({ ...landing, howToOrder: { ...(landing.howToOrder as any || {}), steps } });
                        }}
                        onRuChange={(v) => {
                          const steps = [...((landing.howToOrder as any)?.steps || [])];
                          steps[idx] = { ...steps[idx], labelRu: v };
                          setLanding({ ...landing, howToOrder: { ...(landing.howToOrder as any || {}), steps } });
                        }}
                        placeholder="Крок 1:"
                      />

                      <BilingualField
                        label="Опис кроку"
                        ukValue={step.text || ''}
                        ruValue={step.textRu || ''}
                        onUkChange={(v) => {
                          const steps = [...((landing.howToOrder as any)?.steps || [])];
                          steps[idx] = { ...steps[idx], text: v };
                          setLanding({ ...landing, howToOrder: { ...(landing.howToOrder as any || {}), steps } });
                        }}
                        onRuChange={(v) => {
                          const steps = [...((landing.howToOrder as any)?.steps || [])];
                          steps[idx] = { ...steps[idx], textRu: v };
                          setLanding({ ...landing, howToOrder: { ...(landing.howToOrder as any || {}), steps } });
                        }}
                        placeholder="Опис кроку"
                      />
                    </div>
                  ))}

                  {(!(landing.howToOrder as any)?.steps || (landing.howToOrder as any)?.steps?.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4 border rounded-xl border-dashed">
                      Кроків немає. Натисніть "Додати крок".
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ---- Доставка та оплата ---- */}
            <Card>
              <CardHeader>
                <CardTitle>Доставка та оплата</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Відображається після секції "Як замовити". Якщо заголовок та текст не заповнені — секція прихована.
                </p>

                <BilingualField
                  label="Заголовок секції"
                  ukValue={(landing.delivery as any)?.title || ''}
                  ruValue={(landing.delivery as any)?.titleRu || ''}
                  onUkChange={(v) => setLanding({ ...landing, delivery: { ...(landing.delivery as any || {}), title: v } })}
                  onRuChange={(v) => setLanding({ ...landing, delivery: { ...(landing.delivery as any || {}), titleRu: v } })}
                  placeholder="Доставка та оплата"
                />

                <BilingualField
                  label="Текст про вибір сервісу доставки"
                  ukValue={(landing.delivery as any)?.shippingText || ''}
                  ruValue={(landing.delivery as any)?.shippingTextRu || ''}
                  onUkChange={(v) => setLanding({ ...landing, delivery: { ...(landing.delivery as any || {}), shippingText: v } })}
                  onRuChange={(v) => setLanding({ ...landing, delivery: { ...(landing.delivery as any || {}), shippingTextRu: v } })}
                  placeholder="Ви обираєте поштовий сервіс на свій вибір"
                />

                {/* Carriers */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Поштові сервіси</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const carriers = [...((landing.delivery as any)?.carriers || [])];
                        carriers.push({ name: '', logoUrl: '' });
                        setLanding({ ...landing, delivery: { ...(landing.delivery as any || {}), carriers } });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Додати
                    </Button>
                  </div>

                  {((landing.delivery as any)?.carriers || []).map((carrier: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-3 space-y-2 bg-muted/20">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Label className="text-xs">Назва</Label>
                          <Input
                            value={carrier.name || ''}
                            placeholder="Укрпошта"
                            onChange={(e) => {
                              const carriers = [...((landing.delivery as any)?.carriers || [])];
                              carriers[idx] = { ...carriers[idx], name: e.target.value };
                              setLanding({ ...landing, delivery: { ...(landing.delivery as any || {}), carriers } });
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs">URL логотипу (необов'язково)</Label>
                          <Input
                            value={carrier.logoUrl || ''}
                            placeholder="https://..."
                            onChange={(e) => {
                              const carriers = [...((landing.delivery as any)?.carriers || [])];
                              carriers[idx] = { ...carriers[idx], logoUrl: e.target.value };
                              setLanding({ ...landing, delivery: { ...(landing.delivery as any || {}), carriers } });
                            }}
                          />
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive mt-4 flex-shrink-0"
                          onClick={() => {
                            const carriers = [...((landing.delivery as any)?.carriers || [])];
                            carriers.splice(idx, 1);
                            setLanding({ ...landing, delivery: { ...(landing.delivery as any || {}), carriers } });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <BilingualField
                  label="Промо-текст (знижка на доставку тощо)"
                  ukValue={(landing.delivery as any)?.promoText || ''}
                  ruValue={(landing.delivery as any)?.promoTextRu || ''}
                  onUkChange={(v) => setLanding({ ...landing, delivery: { ...(landing.delivery as any || {}), promoText: v } })}
                  onRuChange={(v) => setLanding({ ...landing, delivery: { ...(landing.delivery as any || {}), promoTextRu: v } })}
                  placeholder="Оплачуйте доставку значно дешевше з УКРПОШТА"
                />

                <BilingualField
                  label="Умова оплати (блок праворуч)"
                  ukValue={(landing.delivery as any)?.paymentNote || ''}
                  ruValue={(landing.delivery as any)?.paymentNoteRu || ''}
                  onUkChange={(v) => setLanding({ ...landing, delivery: { ...(landing.delivery as any || {}), paymentNote: v } })}
                  onRuChange={(v) => setLanding({ ...landing, delivery: { ...(landing.delivery as any || {}), paymentNoteRu: v } })}
                  placeholder="Оплата готівкою на пошті при отриманні, без будь-яких передоплат"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faq">
          <FAQEditor
            faqs={landing.oldFaqs || []}
            landingId={id}
            onUpdate={(faqs) => setLanding({ ...landing, oldFaqs: faqs })}
          />
        </TabsContent>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Інформація про компанію / Футер</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <BilingualField
                label="Назва компанії"
                ukValue={landing.companyName || ''}
                ruValue={landing.companyNameRu || ''}
                onUkChange={(value) => setLanding({ ...landing, companyName: value })}
                onRuChange={(value) => setLanding({ ...landing, companyNameRu: value })}
              />

              <BilingualField
                label="Юридична інформація"
                ukValue={landing.legalText || ''}
                ruValue={landing.legalTextRu || ''}
                onUkChange={(value) => setLanding({ ...landing, legalText: value })}
                onRuChange={(value) => setLanding({ ...landing, legalTextRu: value })}
                type="rich"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Телефон</Label>
                  <Input
                    value={landing.phone || ''}
                    onChange={(e) => setLanding({ ...landing, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={landing.email || ''}
                    onChange={(e) => setLanding({ ...landing, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Соціальні мережі */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Соціальні мережі</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
                    { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
                    { key: 'youtube', label: 'YouTube URL', placeholder: 'https://youtube.com/...' },
                    { key: 'tiktok', label: 'TikTok URL', placeholder: 'https://tiktok.com/@...' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <Label className="text-sm text-muted-foreground">{label}</Label>
                      <Input
                        placeholder={placeholder}
                        value={(landing.socials as any)?.[key] || ''}
                        onChange={(e) => setLanding({
                          ...landing,
                          socials: { ...(landing.socials as any || {}), [key]: e.target.value || undefined },
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Копирайт */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Рік підставляється автоматично. Приклад: © Всі права захищені</p>
                <BilingualField
                  label="Текст копірайту"
                  ukValue={landing.copyrightText || ''}
                  ruValue={landing.copyrightTextRu || ''}
                  onUkChange={(value) => setLanding({ ...landing, copyrightText: value })}
                  onRuChange={(value) => setLanding({ ...landing, copyrightTextRu: value })}
                  placeholder="© Всі права захищені"
                />
              </div>

              {/* Попапи */}
              <div className="space-y-6 border-t pt-6">
                <Label className="text-base font-semibold">Сторінки (попапи)</Label>

                <BilingualField
                  label="Політика конфіденційності"
                  ukValue={landing.privacyPolicyText || ''}
                  ruValue={landing.privacyPolicyTextRu || ''}
                  onUkChange={(value) => setLanding({ ...landing, privacyPolicyText: value })}
                  onRuChange={(value) => setLanding({ ...landing, privacyPolicyTextRu: value })}
                  type="rich"
                />

                <BilingualField
                  label="Повернення та обмін товарів"
                  ukValue={landing.termsText || ''}
                  ruValue={landing.termsTextRu || ''}
                  onUkChange={(value) => setLanding({ ...landing, termsText: value })}
                  onRuChange={(value) => setLanding({ ...landing, termsTextRu: value })}
                  type="rich"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
