import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { dispatchLead } from '@/lib/order-dispatcher';

const createLeadSchema = z.object({
  landingId: z.string(),
  variantId: z.string().optional(),
  name: z.string().min(2),
  phone: z.string().min(10),
  city: z.string().optional(),
  comment: z.string().optional(),
  utmSource: z.string().optional().nullable(),
  utmMedium: z.string().optional().nullable(),
  utmCampaign: z.string().optional().nullable(),
  utmContent: z.string().optional().nullable(),
  utmTerm: z.string().optional().nullable(),
  gclid: z.string().optional().nullable(),
  fbclid: z.string().optional().nullable(),
  pageUrl: z.string().optional(),
  referer: z.string().optional(),
  honeypot: z.string().optional(),
});

const ipRateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = ipRateLimits.get(ip);

  if (!limit || now > limit.resetAt) {
    ipRateLimits.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (limit.count >= 5) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const data = createLeadSchema.parse(body);

    // Honeypot anti-spam
    if (data.honeypot) {
      return NextResponse.json({ success: true });
    }

    const userAgent = request.headers.get('user-agent') || '';

    // 1. Создаём лид в БД со статусом new
    const lead = await db.lead.create({
      data: {
        landingId: data.landingId,
        variantId: data.variantId,
        name: data.name,
        phone: data.phone,
        city: data.city,
        comment: data.comment,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        utmContent: data.utmContent,
        utmTerm: data.utmTerm,
        gclid: data.gclid,
        fbclid: data.fbclid,
        pageUrl: data.pageUrl,
        referer: data.referer,
        userAgent,
        ip,
        status: 'new',
      },
      include: {
        landing: true,
        variant: true,
      },
    });

    const result = await dispatchLead(lead);

    await db.lead.update({
      where: { id: lead.id },
      data: {
        status: result.ok ? 'sent' : 'failed',
        csCartResponse: result.raw ?? (result.error ? { error: result.error } : undefined),
      },
    });

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Lead creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
