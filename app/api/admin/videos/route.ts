import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await verifyAuth();

    const videoDir = join(process.cwd(), 'public', 'video');

    try {
      const files = await readdir(videoDir);
      
      const videos = await Promise.all(
        files
          .filter((file) => /\.(mp4|webm|ogg|mov)$/i.test(file))
          .map(async (filename) => {
            const filepath = join(videoDir, filename);
            const stats = await stat(filepath);
            return {
              filename,
              url: `/video/${filename}`,
              size: stats.size,
              sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
              modified: stats.mtime,
            };
          })
      );

      // Сортируем по дате изменения (новые сначала)
      videos.sort((a, b) => b.modified.getTime() - a.modified.getTime());

      return NextResponse.json(videos);
    } catch (error: any) {
      // Если папка не существует, возвращаем пустой массив
      if (error.code === 'ENOENT') {
        return NextResponse.json([]);
      }
      throw error;
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get videos error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
