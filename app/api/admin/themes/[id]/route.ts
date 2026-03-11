import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

const updateThemeSchema = z.object({
  name:         z.string().min(1).optional(),
  primaryColor: z.string().optional(),
  accentColor:  z.string().optional(),
  gradientFrom: z.string().optional(),
  gradientVia:  z.string().optional(),
  gradientTo:   z.string().optional(),
  buttonFrom:   z.string().optional().nullable(),
  buttonVia:    z.string().optional().nullable(),
  buttonTo:     z.string().optional().nullable(),
  titleFrom:    z.string().optional().nullable(),
  titleVia:     z.string().optional().nullable(),
  titleTo:      z.string().optional().nullable(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id } = await params;

    const body = await request.json();
    const data = updateThemeSchema.parse(body);

    const theme = await db.theme.update({
      where: { id },
      data,
    });

    return NextResponse.json(theme);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id } = await params;

    // Проверяем, не пытаются ли удалить стандартную тему
    const theme = await db.theme.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!theme) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }

    if (theme.name === 'Стандартна') {
      return NextResponse.json(
        { error: 'Не можна видалити стандартну тему' },
        { status: 400 }
      );
    }

    // Проверяем, используется ли тема в лендингах
    const landingsWithTheme = await db.landing.count({
      where: { themeId: id },
    });

    if (landingsWithTheme > 0) {
      // Удаляем связь с лендингами (устанавливаем themeId = null)
      await db.landing.updateMany({
        where: { themeId: id },
        data: { themeId: null },
      });
    }

    await db.theme.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting theme:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
