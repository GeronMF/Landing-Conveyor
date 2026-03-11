'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  landingId?: string;
  label?: string;
  accept?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  landingId,
  label = 'Завантажити зображення',
  accept = 'image/*',
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      console.log('Starting upload:', { fileName: file.name, fileSize: file.size, fileType: file.type, landingId });
      
      const formData = new FormData();
      formData.append('file', file);
      if (landingId) {
        formData.append('landingId', landingId);
      }

      console.log('Sending request to /api/admin/upload');
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status, response.ok);

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Upload failed:', data);
        throw new Error(data.error || 'Помилка завантаження');
      }

      const data = await response.json();
      console.log('Upload successful, URL:', data.url);
      onChange(data.url);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Помилка завантаження файлу');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {value ? (
        <div className="relative">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border bg-muted">
            {value.startsWith('http') || value.startsWith('/') ? (
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image load error:', value);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Image
                src={value}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized
                onError={(e) => {
                  console.error('Image load error:', value);
                }}
              />
            )}
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="mt-2"
            onClick={handleRemove}
          >
            <X className="w-4 h-4 mr-2" />
            Видалити
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
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
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">
                Перетягніть файл сюди або натисніть для вибору
              </p>
            </div>
          )}
        </div>
      )}
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
