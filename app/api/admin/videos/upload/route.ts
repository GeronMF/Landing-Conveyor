import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, access } from 'fs/promises';
import { join } from 'path';
import { constants } from 'fs';
import { verifyAuth } from '@/lib/auth';
import { VIDEO_ROOT } from '@/lib/media-storage';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB для видео
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

export async function POST(request: NextRequest) {
  try {
    await verifyAuth();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds 100MB` },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: mp4, webm, ogg, mov' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Создаем путь: {MEDIA_STORAGE_ROOT}/video/{filename}
    const videoDir = VIDEO_ROOT;
    await mkdir(videoDir, { recursive: true });

    // Сохраняем с оригинальным именем (или с timestamp если конфликт)
    const originalName = file.name;
    const extension = originalName.split('.').pop();
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    
    // Проверяем, существует ли файл, и добавляем номер если нужно
    let filename = originalName;
    let counter = 1;
    while (true) {
      const filepath = join(videoDir, filename);
      try {
        await access(filepath, constants.F_OK);
        // Файл существует, добавляем номер
        filename = `${nameWithoutExt}-${counter}.${extension}`;
        counter++;
      } catch {
        // Файл не существует, можно использовать это имя
        break;
      }
    }

    const filepath = join(videoDir, filename);
    await writeFile(filepath, buffer);

    // Используем API endpoint для отдачи видео в production
    const url = `/api/video/${filename}`;

    return NextResponse.json({ url, filename });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Video upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
