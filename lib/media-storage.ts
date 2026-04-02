import { join, resolve } from 'path';

const DEFAULT_MEDIA_ROOT = '/home/topcinastore/storage';

export const MEDIA_ROOT = process.env.MEDIA_STORAGE_ROOT || DEFAULT_MEDIA_ROOT;
export const UPLOADS_ROOT = join(MEDIA_ROOT, 'uploads');
export const VIDEO_ROOT = join(MEDIA_ROOT, 'video');

export function resolveSafePath(baseDir: string, segments: string[]): string | null {
  const target = resolve(baseDir, ...segments);
  const base = resolve(baseDir);
  if (!target.startsWith(base)) return null;
  return target;
}

