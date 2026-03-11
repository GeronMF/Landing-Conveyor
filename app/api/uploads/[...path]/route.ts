import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filePath = join(process.cwd(), 'public', 'uploads', ...path);

    // Проверяем, что файл существует и находится в public/uploads
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Проверяем, что путь не выходит за пределы public/uploads
    const resolvedPath = filePath.replace(/\\/g, '/');
    const publicPath = join(process.cwd(), 'public', 'uploads').replace(/\\/g, '/');
    if (!resolvedPath.startsWith(publicPath)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
    }

    const file = await readFile(filePath);
    const extension = path[path.length - 1].split('.').pop()?.toLowerCase();
    
    const contentType = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
    }[extension || ''] || 'application/octet-stream';

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('File serve error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
