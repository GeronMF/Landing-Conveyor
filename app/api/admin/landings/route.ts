import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await verifyAuth();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');

    const landings = await db.landing.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { slug: { contains: search } },
                  { pageTitle: { contains: search } },
                ],
              }
            : {},
          status ? { status: status as any } : {},
        ],
      },
      select: {
        id: true,
        slug: true,
        status: true,
        pageTitle: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            oldVariants: true,
            leads: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(landings);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

const createLandingSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  pageTitle: z.string().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
});

export async function POST(request: NextRequest) {
  try {
    await verifyAuth();

    const body = await request.json();
    const data = createLandingSchema.parse(body);

    const existing = await db.landing.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    const landing = await db.landing.create({
      data,
    });

    return NextResponse.json(landing);
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
