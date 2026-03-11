'use client';

import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BilingualField } from './bilingual-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VariantVideoProps {
  variant: any;
  onUpdate: (data: any) => void;
}

export function VariantVideo({ variant, onUpdate }: VariantVideoProps) {
  const [desktopType, setDesktopType] = useState<'url' | 'html'>(
    variant.videoUrlDesktop ? 'url' : variant.videoHtmlDesktop ? 'html' : 'html'
  );
  const [mobileType, setMobileType] = useState<'url' | 'html'>(
    variant.videoUrlMobile ? 'url' : variant.videoHtmlMobile ? 'html' : 'html'
  );
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const desktopFileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = async (file: File, isMobile: boolean) => {
    if (!file) return;

    if (isMobile) {
      setUploadingMobile(true);
    } else {
      setUploadingDesktop(true);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/videos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка завантаження');
      }

      const data = await response.json();
      const videoUrl = data.url;
      
      // Определяем тип видео по расширению
      const extension = file.name.split('.').pop()?.toLowerCase();
      const videoType = extension === 'webm' ? 'video/webm' : 
                       extension === 'ogg' ? 'video/ogg' : 
                       extension === 'mov' ? 'video/quicktime' : 
                       'video/mp4';
      
      // Генерируем HTML код для видео с правильными атрибутами для iOS
      // Важно: все атрибуты должны быть в HTML, который сохраняется в БД, чтобы работало до гидрации
      const videoHtml = `<video style="object-fit: cover; width: 100%; height: 100%" preload="auto" playsinline webkit-playsinline autoplay loop muted>
  <source src="${videoUrl}" type="${videoType}">
</video>`;

      if (isMobile) {
        onUpdate({ videoHtmlMobile: videoHtml, videoUrlMobile: null });
        toast.success('Відео завантажено та додано для мобайлу');
      } else {
        onUpdate({ videoHtmlDesktop: videoHtml, videoUrlDesktop: null });
        toast.success('Відео завантажено та додано для десктопу');
      }
    } catch (error: any) {
      toast.error(error.message || 'Помилка завантаження відео');
    } finally {
      if (isMobile) {
        setUploadingMobile(false);
      } else {
        setUploadingDesktop(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="desktop">
        <TabsList>
          <TabsTrigger value="desktop">Desktop</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
        </TabsList>

        <TabsContent value="desktop" className="space-y-4 mt-4">
          <div>
            <Label>Тип відео</Label>
            <Select value={desktopType} onValueChange={(value: 'url' | 'html') => setDesktopType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="url">YouTube URL</SelectItem>
                <SelectItem value="html">Власний відеоскрипт (HTML)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {desktopType === 'url' ? (
            <div>
              <Label>YouTube URL</Label>
              <Input
                value={variant.videoUrlDesktop || ''}
                onChange={(e) => onUpdate({ videoUrlDesktop: e.target.value, videoHtmlDesktop: null })}
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>HTML код відео</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => desktopFileInputRef.current?.click()}
                  disabled={uploadingDesktop}
                >
                  {uploadingDesktop ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Завантаження...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Завантажити відео
                    </>
                  )}
                </Button>
                <input
                  ref={desktopFileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVideoUpload(file, false);
                  }}
                  className="hidden"
                />
              </div>
              <Textarea
                value={variant.videoHtmlDesktop || ''}
                onChange={(e) => onUpdate({ videoHtmlDesktop: e.target.value, videoUrlDesktop: null })}
                rows={6}
                placeholder='<video style="object-fit: cover; ..." preload="auto" playsinline autoplay loop muted>...</video>'
              />
              <p className="text-xs text-muted-foreground">
                Або завантажте відео файл вище, і HTML код згенерується автоматично
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="mobile" className="space-y-4 mt-4">
          <div>
            <Label>Тип відео</Label>
            <Select value={mobileType} onValueChange={(value: 'url' | 'html') => setMobileType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="url">YouTube URL</SelectItem>
                <SelectItem value="html">Власний відеоскрипт (HTML)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mobileType === 'url' ? (
            <div>
              <Label>YouTube URL</Label>
              <Input
                value={variant.videoUrlMobile || ''}
                onChange={(e) => onUpdate({ videoUrlMobile: e.target.value, videoHtmlMobile: null })}
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>HTML код відео</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => mobileFileInputRef.current?.click()}
                  disabled={uploadingMobile}
                >
                  {uploadingMobile ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Завантаження...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Завантажити відео
                    </>
                  )}
                </Button>
                <input
                  ref={mobileFileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVideoUpload(file, true);
                  }}
                  className="hidden"
                />
              </div>
              <Textarea
                value={variant.videoHtmlMobile || ''}
                onChange={(e) => onUpdate({ videoHtmlMobile: e.target.value, videoUrlMobile: null })}
                rows={6}
                placeholder='<video style="object-fit: cover; ..." preload="auto" playsinline autoplay loop muted>...</video>'
              />
              <p className="text-xs text-muted-foreground">
                Або завантажте відео файл вище, і HTML код згенерується автоматично
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <BilingualField
        label="Заголовок відео"
        ukValue={variant.videoTitle || ''}
        ruValue={variant.videoTitleRu || ''}
        onUkChange={(value) => onUpdate({ videoTitle: value })}
        onRuChange={(value) => onUpdate({ videoTitleRu: value })}
      />

      <BilingualField
        label="Підпис"
        ukValue={variant.videoText || ''}
        ruValue={variant.videoTextRu || ''}
        onUkChange={(value) => onUpdate({ videoText: value })}
        onRuChange={(value) => onUpdate({ videoTextRu: value })}
        type="rich"
      />
    </div>
  );
}
