import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { verifyAuth } from '@/lib/auth';

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024;
const ALLOWED_TYPES = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(',');

export async function POST(request: NextRequest) {
  try {
    await verifyAuth();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const landingId = formData.get('landingId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${process.env.MAX_FILE_SIZE_MB || 10}MB` },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: ' + ALLOWED_TYPES.join(', ') },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Создаем путь: public/uploads/{landingId}/{filename}
    const baseDir = landingId 
      ? join(process.cwd(), 'public', 'uploads', landingId)
      : join(process.cwd(), 'public', 'uploads');
    
    await mkdir(baseDir, { recursive: true });

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${extension}`;

    const filepath = join(baseDir, filename);
    await writeFile(filepath, buffer);

    // Используем API endpoint для отдачи файлов в production
    const url = landingId 
      ? `/api/uploads/${landingId}/${filename}`
      : `/api/uploads/${filename}`;

    return NextResponse.json({ url });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
