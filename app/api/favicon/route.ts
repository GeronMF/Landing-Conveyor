import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Универсальная выдача favicon, чтобы и в standalone, и при проксировании всегда отдавалось корректно.
export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'favicon.png');
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'favicon.png not found' }, { status: 404 });
    }

    const buf = await readFile(filePath);
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'favicon serve error' }, { status: 500 });
  }
}

