import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

const createVariantSchema = z.object({
  landingId: z.string(),
  order: z.number().default(0),
  title: z.string().min(1),
  titleRu: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  subtitleRu: z.string().optional().nullable(),
  offerText: z.string().optional().nullable(),
  offerTextRu: z.string().optional().nullable(),
  badgeText: z.string().optional().nullable(),
  badgeTextRu: z.string().optional().nullable(),
  price: z.number(),
  oldPrice: z.number().optional().nullable(),
  currency: z.string().default('UAH'),
  ctaPrimaryText: z.string().default('Замовити зараз'),
  ctaPrimaryTextRu: z.string().optional().nullable(),
  ctaSecondaryPhoneText: z.string().optional().nullable(),
  ctaSecondaryPhoneTextRu: z.string().optional().nullable(),
  primaryPhone: z.string().optional().nullable(),
  economyText: z.string().optional().nullable(),
  economyTextRu: z.string().optional().nullable(),
  faqLinkText: z.string().optional().nullable(),
  faqLinkTextRu: z.string().optional().nullable(),
  heroImageUrl: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  videoUrlDesktop: z.string().optional().nullable(),
  videoHtmlDesktop: z.string().optional().nullable(),
  videoUrlMobile: z.string().optional().nullable(),
  videoHtmlMobile: z.string().optional().nullable(),
  videoTitle: z.string().optional().nullable(),
  videoTitleRu: z.string().optional().nullable(),
  videoText: z.string().optional().nullable(),
  videoTextRu: z.string().optional().nullable(),
  repeatOfferBlocks: z.number().default(2),
});

export async function POST(request: NextRequest) {
  try {
    await verifyAuth();

    const body = await request.json();
    const data = createVariantSchema.parse(body);

    const variant = await db.variant.create({
      data,
    });

    return NextResponse.json(variant);
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
