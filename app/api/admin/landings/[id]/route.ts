import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id } = await params;

    const landing = await db.landing.findUnique({
      where: { id },
      include: {
        theme: true,
        oldVariants: {
          orderBy: { order: 'asc' },
          include: {
            oldImages: { orderBy: { order: 'asc' } },
            oldBenefits: { orderBy: { order: 'asc' } },
            oldSpecifications: { orderBy: { order: 'asc' } },
            oldSizeTables: {
              orderBy: { order: 'asc' },
              include: {
                rows: { orderBy: { order: 'asc' } },
              },
            },
            oldReviews: { orderBy: { order: 'asc' } },
          },
        },
        oldFaqs: { orderBy: { order: 'asc' } },
      },
    });

    if (!landing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(landing);
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

// Схемы валидации для JSON полей
const heroImageSchema = z.object({
  url: z.string(),
  alt: z.string().optional(),
});

const variantSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  color: z.string().optional(),
  images: z.array(z.string()).optional(),
});

const faqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});

const companyInfoSchema = z.object({
  companyName: z.string().optional(),
  edrpou: z.string().optional(),
  legalAddress: z.string().optional(),
  email: z.string().optional(),
  workingHours: z.string().optional(),
  phone: z.string().optional(),
  links: z.array(z.object({
    title: z.string(),
    url: z.string(),
  })).optional(),
});

const updateLandingSchema = z.object({
  slug: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
  pageTitle: z.string().optional().nullable(),
  pageTitleRu: z.string().optional().nullable(),
  introText: z.string().optional().nullable(),
  introTextRu: z.string().optional().nullable(),
  globalFAQTitle: z.string().optional(),
  globalFAQTitleRu: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoTitleRu: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoDescriptionRu: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  themeId: z.string().optional().nullable(),
  themePrimaryColor: z.string().optional().nullable(),
  themeAccentColor: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  companyNameRu: z.string().optional().nullable(),
  legalText: z.string().optional().nullable(),
  legalTextRu: z.string().optional().nullable(),
  privacyPolicyText: z.string().optional().nullable(),
  privacyPolicyTextRu: z.string().optional().nullable(),
  termsText: z.string().optional().nullable(),
  termsTextRu: z.string().optional().nullable(),
  copyrightText: z.string().optional().nullable(),
  copyrightTextRu: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  socials: z.record(z.string()).optional().nullable(),
  links: z.record(z.string()).optional().nullable(),
  orderDestination: z.enum(['cs_cart', 'keycrm']).optional(),
  keycrmApiKey: z.string().optional().nullable(),
  keycrmSourceId: z.number().int().optional().nullable(),
  keycrmManagerId: z.number().int().optional().nullable(),
  // JSON поля (для обратной совместимости)
  heroImages: z.array(heroImageSchema).optional().nullable(),
  variantsJson: z.array(variantSchema).optional().nullable(),
  faqsJson: z.array(faqSchema).optional().nullable(),
  companyInfo: companyInfoSchema.optional().nullable(),
  formConfig: z.any().optional().nullable(),
  ageVerification: z.boolean().optional(),
  howToOrder: z.any().optional().nullable(),
  delivery: z.any().optional().nullable(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id } = await params;

    const body = await request.json();
    const data = updateLandingSchema.parse(body);

    const landing = await db.landing.update({
      where: { id },
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
    // Prisma unique constraint violation (slug already taken)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Цей slug вже зайнятий. Оберіть інший.' },
        { status: 409 }
      );
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

    await db.landing.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
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
