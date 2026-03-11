import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

const themeSchema = z.object({
  name:         z.string().min(1),
  primaryColor: z.string(),
  accentColor:  z.string(),
  gradientFrom: z.string(),
  gradientVia:  z.string(),
  gradientTo:   z.string(),
  buttonFrom:   z.string().optional().nullable(),
  buttonVia:    z.string().optional().nullable(),
  buttonTo:     z.string().optional().nullable(),
  titleFrom:    z.string().optional().nullable(),
  titleVia:     z.string().optional().nullable(),
  titleTo:      z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    await verifyAuth();
    const themes = await db.theme.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(themes || []);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (error.message?.includes('does not exist') || error.message?.includes('Unknown table')) return NextResponse.json([]);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await verifyAuth();
    const body = await request.json();
    const data = themeSchema.parse(body);
    const theme = await db.theme.create({ data });
    return NextResponse.json(theme);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
