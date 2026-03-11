'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n/context';
import {
  Loader2, CheckCircle2, X, User, Phone, MapPin, MessageSquare, ShoppingCart, Star,
} from 'lucide-react';
import Image from 'next/image';

/* ─── типы ─────────────────────────────────────────── */
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

interface LeadFormProps {
  landingId: string;
  variantId?: string;
  variantTitle?: string;
  variantPrice?: number | string | null;
  variantOldPrice?: number | string | null;
  variantCurrency?: string;
  variantImage?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formConfig?: FormConfig | null;
}

/* ─── иконки полей ─────────────────────────────────── */
const fieldIcons: Record<string, React.ReactNode> = {
  name:    <User    className="w-4 h-4 text-muted-foreground" />,
  phone:   <Phone   className="w-4 h-4 text-muted-foreground" />,
  city:    <MapPin  className="w-4 h-4 text-muted-foreground" />,
  comment: <MessageSquare className="w-4 h-4 text-muted-foreground" />,
};

/* ─── дефолтные поля ───────────────────────────────── */
const DEFAULT_FIELDS: FormFieldConfig[] = [
  { name: 'name',    label: "Ім'я",    labelRu: 'Имя',          placeholder: "Ваше ім'я",             placeholderRu: 'Ваше имя',                required: true,  visible: true },
  { name: 'phone',   label: 'Телефон', labelRu: 'Телефон',      placeholder: '+380 (67) 123-45-67',   placeholderRu: '+7 (999) 123-45-67',      required: true,  visible: true },
  { name: 'city',    label: 'Місто',   labelRu: 'Город',        placeholder: 'Київ',                  placeholderRu: 'Москва',                  required: false, visible: true },
  { name: 'comment', label: 'Коментар',labelRu: 'Комментарий',  placeholder: 'Додаткова інформація',  placeholderRu: 'Дополнительная информация', required: false, visible: true },
];

/* ─── компонент ────────────────────────────────────── */
export function LeadForm({
  landingId,
  variantId,
  variantTitle,
  variantPrice,
  variantOldPrice,
  variantCurrency = 'UAH',
  variantImage,
  open,
  onOpenChange,
  formConfig,
}: LeadFormProps) {
  const { t, language } = useI18n();
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({
    name: '', phone: '', city: '', comment: '', honeypot: '',
  });

  const isRu = language === 'ru';

  // Resolve config values
  const title        = (isRu ? formConfig?.titleRu       : formConfig?.title)       || t.form.title;
  const subtitle     = (isRu ? formConfig?.subtitleRu    : formConfig?.subtitle)    || '';
  const buttonText   = (isRu ? formConfig?.buttonTextRu  : formConfig?.buttonText)  || t.common.sendRequest;
  const successTitle = (isRu ? formConfig?.successTitleRu: formConfig?.successTitle)|| (isRu ? 'Спасибо!' : 'Дякуємо!');
  const successText  = (isRu ? formConfig?.successTextRu : formConfig?.successText) || t.common.requestSentDesc;

  // Merge default fields with config
  const configFields = formConfig?.fields && formConfig.fields.length > 0
    ? formConfig.fields
    : DEFAULT_FIELDS;
  const visibleFields = configFields.filter((f) => f.visible !== false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.honeypot) return;
    setLoading(true);

    try {
      const urlParams = new URLSearchParams(window.location.search);

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landingId,
          variantId,
          name:        formData.name,
          phone:       formData.phone,
          city:        formData.city,
          comment:     formData.comment,
          honeypot:    formData.honeypot,
          utmSource:   urlParams.get('utm_source'),
          utmMedium:   urlParams.get('utm_medium'),
          utmCampaign: urlParams.get('utm_campaign'),
          utmContent:  urlParams.get('utm_content'),
          utmTerm:     urlParams.get('utm_term'),
          gclid:       urlParams.get('gclid'),
          fbclid:      urlParams.get('fbclid'),
          pageUrl:     window.location.href,
          referer:     document.referrer,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (typeof window !== 'undefined' && (window as any).dataLayer) {
          (window as any).dataLayer.push({ event: 'lead_submit', landing_slug: landingId, variant_id: variantId });
        }
        setSubmitted(true);
      } else {
        toast.error(t.common.error, { description: data.error || t.common.errorSending });
      }
    } catch {
      toast.error(t.common.error, { description: t.common.errorSending });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', phone: '', city: '', comment: '', honeypot: '' });
    }, 300);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-3xl max-h-[95vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col md:flex-row"
            initial={{ scale: 0.92, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          >
            {/* ── Левая панель — изображение товара (desktop) ── */}
            {variantImage && (
              <div className="hidden md:flex md:w-2/5 relative flex-col overflow-hidden">
                <Image
                  src={variantImage}
                  alt={variantTitle || ''}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
                {/* Градиентный оверлей снизу */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Инфо о товаре внизу */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  {variantTitle && (
                    <p className="font-bold text-base leading-tight mb-2 line-clamp-2">{variantTitle}</p>
                  )}
                  {variantPrice && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-white">
                        {Number(variantPrice).toLocaleString()} {variantCurrency}
                      </span>
                      {variantOldPrice && (
                        <span className="text-sm line-through text-white/60">
                          {Number(variantOldPrice).toLocaleString()} {variantCurrency}
                        </span>
                      )}
                    </div>
                  )}
                  {/* 5 звёзд */}
                  <div className="flex gap-0.5 mt-2">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Правая панель — форма ── */}
            <div className="flex-1 bg-white dark:bg-gray-950 flex flex-col overflow-hidden">
              {/* Шапка формы */}
              <div className="relative px-6 pt-6 pb-4" style={{ background: 'linear-gradient(to right, var(--th-btn-from), var(--th-btn-via), var(--th-btn-to))' }}>
                {/* Кнопка закрыть */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">{title}</h2>
                    {subtitle && (
                      <p className="text-sm text-white/75 mt-0.5">{subtitle}</p>
                    )}
                  </div>
                </div>

                {/* Мобильное: заголовок товара */}
                {variantTitle && (
                  <div className="md:hidden mt-3 pt-3 border-t border-white/20">
                    <p className="text-white/90 text-sm font-medium">{variantTitle}</p>
                    {variantPrice && (
                      <p className="text-white font-bold text-lg">
                        {Number(variantPrice).toLocaleString()} {variantCurrency}
                        {variantOldPrice && (
                          <span className="ml-2 text-sm line-through text-white/60">
                            {Number(variantOldPrice).toLocaleString()}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Прогресс-полоска */}
              <div className="h-0.5" style={{ background: 'linear-gradient(to right, var(--th-btn-from), var(--th-btn-via), var(--th-btn-to))' }} />

              {/* Тело */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    /* ── Успех ── */
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      className="flex flex-col items-center justify-center py-8 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-5 shadow-lg shadow-green-200 dark:shadow-green-900/30"
                      >
                        <CheckCircle2 className="w-10 h-10 text-white" />
                      </motion.div>

                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2"
                      >
                        {successTitle}
                      </motion.h3>

                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-muted-foreground max-w-xs"
                      >
                        {successText}
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-6"
                      >
                        <Button
                          onClick={handleClose}
                          className="text-white px-8"
                          style={{ background: 'linear-gradient(to right, var(--th-btn-from), var(--th-btn-to))' }}
                        >
                          Закрити
                        </Button>
                      </motion.div>
                    </motion.div>
                  ) : (
                    /* ── Форма ── */
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      {/* Honeypot */}
                      <input
                        type="text"
                        name="website"
                        value={formData.honeypot}
                        onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                        style={{ position: 'absolute', left: '-9999px' }}
                        tabIndex={-1}
                        autoComplete="off"
                      />

                      {visibleFields.map((field, idx) => {
                        const label       = (isRu ? field.labelRu       : field.label)       || field.name;
                        const placeholder = (isRu ? field.placeholderRu : field.placeholder) || '';
                        const isRequired  = field.required ?? false;

                        return (
                          <motion.div
                            key={field.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.06 }}
                          >
                            <label className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                              {fieldIcons[field.name]}
                              {label}
                              {isRequired && <span className="text-red-500 ml-0.5">*</span>}
                            </label>

                            {field.name === 'comment' ? (
                              <Textarea
                                id={field.name}
                                required={isRequired}
                                value={formData[field.name] || ''}
                                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                placeholder={placeholder}
                                rows={3}
                                className="border-2 focus:border-cyan-400 transition-colors resize-none rounded-xl"
                              />
                            ) : (
                              <div className="relative">
                                <Input
                                  id={field.name}
                                  type={field.name === 'phone' ? 'tel' : 'text'}
                                  required={isRequired}
                                  value={formData[field.name] || ''}
                                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                  placeholder={placeholder}
                                  className="h-11 border-2 focus:border-cyan-400 transition-colors rounded-xl pl-4"
                                />
                              </div>
                            )}
                          </motion.div>
                        );
                      })}

                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: visibleFields.length * 0.06 + 0.1 }}
                        className="pt-1"
                      >
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full h-12 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] text-white border-0"
                          style={{ background: 'linear-gradient(to right, var(--th-btn-from), var(--th-btn-via), var(--th-btn-to))' }}
                        >
                          <AnimatePresence mode="wait">
                            {loading ? (
                              <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {t.common.sending}
                              </motion.span>
                            ) : (
                              <motion.span key="submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5" />
                                {buttonText}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </Button>

                        <p className="text-[11px] text-muted-foreground text-center mt-2.5">
                          🔒 {isRu ? 'Ваши данные в безопасности' : 'Ваші дані в безпеці'}
                        </p>
                      </motion.div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
