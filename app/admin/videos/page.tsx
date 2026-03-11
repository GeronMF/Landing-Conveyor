'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Trash2, Copy, Check, Loader2, Video } from 'lucide-react';
import { toast } from 'sonner';

interface VideoFile {
  filename: string;
  url: string;
  size: number;
  sizeMB: string;
  modified: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/videos');
      if (!response.ok) throw new Error('Failed to load videos');
      const data = await response.json();
      setVideos(data);
    } catch (error: any) {
      toast.error('Помилка завантаження списку відео');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    setUploading(true);

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
      toast.success('Відео успішно завантажено!');
      await loadVideos();
    } catch (error: any) {
      toast.error(error.message || 'Помилка завантаження відео');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Видалити відео "${filename}"?`)) return;

    try {
      const response = await fetch(`/api/admin/videos/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Відео видалено');
      await loadVideos();
    } catch (error: any) {
      toast.error('Помилка видалення відео');
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success('Шлях скопійовано!');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const copyVideoCode = (url: string) => {
    const code = `<video style="object-fit: cover; width: 100%; height: 100%" preload="auto" playsinline autoplay loop muted>
  <source src="${url}" type="video/mp4">
</video>`;
    navigator.clipboard.writeText(code);
    toast.success('Код відео скопійовано!');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Управління відео</h1>
        <p className="text-muted-foreground">
          Завантажуйте та керуйте відео файлами для використання в лендингах
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Завантажити відео</CardTitle>
          <CardDescription>
            Підтримуються формати: MP4, WebM, OGG, MOV (макс. 100MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleFileSelect(file);
            }}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => document.getElementById('video-upload')?.click()}
          >
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Завантаження...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium">Завантажити відео</p>
                <p className="text-xs text-muted-foreground">
                  Перетягніть файл сюди або натисніть для вибору
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Завантажені відео</CardTitle>
          <CardDescription>
            {videos.length === 0 ? 'Немає завантажених відео' : `${videos.length} відео`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : videos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Завантажте перше відео вище
            </p>
          ) : (
            <div className="space-y-4">
              {videos.map((video) => (
                <div
                  key={video.filename}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <Video className="w-8 h-8 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{video.filename}</p>
                    <p className="text-sm text-muted-foreground">
                      {video.sizeMB} MB • {new Date(video.modified).toLocaleDateString('uk-UA')}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {video.url}
                      </code>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(video.url)}
                    >
                      {copiedUrl === video.url ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyVideoCode(video.url)}
                    >
                      Код
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(video.filename)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
