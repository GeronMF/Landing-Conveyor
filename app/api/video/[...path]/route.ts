import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { VIDEO_ROOT, resolveSafePath } from '@/lib/media-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filePath = resolveSafePath(VIDEO_ROOT, path);

    if (!filePath) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
    }

    // Проверяем, что файл существует
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Получаем размер файла
    let fileSize: number;
    try {
      const stats = await stat(filePath);
      fileSize = stats.size;
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const extension = path[path.length - 1].split('.').pop()?.toLowerCase();
    const contentType = {
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'ogg': 'video/ogg',
      'mov': 'video/quicktime',
    }[extension || ''] || 'video/mp4';

    // Обрабатываем Range-запросы (требуется для iOS Safari)
    const rangeHeader = request.headers.get('range');
    if (rangeHeader) {
      // Парсим Range: bytes=start-end
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const fileBuffer = await readFile(filePath);
      const chunk = fileBuffer.slice(start, end + 1);

      return new NextResponse(chunk, {
        status: 206, // Partial Content - обязательно для Range-запросов
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunkSize),
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Полный файл (без Range) - обязательно с Content-Length для iOS
    const fileBuffer = await readFile(filePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Length': String(fileSize), // Обязательно для iOS Safari
        'Accept-Ranges': 'bytes',
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Video serve error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
