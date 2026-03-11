import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { createCsCartOrder, buildOrderNotes } from '@/lib/cscart';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth();
    const { id } = await params;

    const lead = await db.lead.findUnique({
      where: { id },
      include: { landing: true, variant: true },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const deliveryMode = process.env.LEAD_DELIVERY_MODE;
    const hasCsCart = !!(process.env.CSCART_API_URL && process.env.CSCART_API_TOKEN);
    const hasWebhook = !!process.env.CSCART_WEBHOOK_URL;

    // Режим CS-Cart REST API — явный или автоопределённый
    if (deliveryMode === 'cscart_api' || (hasCsCart && !hasWebhook)) {
      const productId = lead.variant?.cscartProductId;

      if (!productId) {
        return NextResponse.json(
          { error: 'Variant has no cscartProductId configured. Set it in the variant editor.' },
          { status: 400 }
        );
      }

      const notes = buildOrderNotes({
        landingSlug: lead.landing.slug,
        variantTitle: lead.variant?.title,
        city: lead.city ?? undefined,
        comment: lead.comment ?? undefined,
        utmSource: lead.utmSource,
        utmMedium: lead.utmMedium,
        utmCampaign: lead.utmCampaign,
        gclid: lead.gclid,
        fbclid: lead.fbclid,
        pageUrl: lead.pageUrl,
      });

      const result = await createCsCartOrder({
        firstname: lead.name,
        phone: lead.phone,
        productId,
        notes,
      });

      await db.lead.update({
        where: { id: lead.id },
        data: {
          status: result.ok ? 'sent' : 'failed',
          csCartResponse: result.raw ?? { error: result.error },
        },
      });

      if (result.ok) {
        return NextResponse.json({ success: true, status: 'sent', orderId: result.orderId });
      }
      return NextResponse.json(
        { success: false, status: 'failed', error: result.error },
        { status: 500 }
      );
    }

    // Режим Webhook
    if (!hasWebhook) {
      console.error(`[Retry] leadId=${id}: no delivery mode configured. Set LEAD_DELIVERY_MODE=cscart_api and CSCART_API_URL/CSCART_API_TOKEN in .env`);
      return NextResponse.json(
        { error: 'No delivery mode configured. Check server environment variables.' },
        { status: 500 }
      );
    }

    const webhookPayload = {
      landing_slug: lead.landing.slug,
      landing_id: lead.landingId,
      variant_id: lead.variantId,
      variant_title: lead.variant?.title,
      price: lead.variant?.price ? Number(lead.variant.price) : null,
      old_price: lead.variant?.oldPrice ? Number(lead.variant.oldPrice) : null,
      currency: lead.variant?.currency,
      name: lead.name,
      phone: lead.phone,
      city: lead.city,
      comment: lead.comment,
      utm: {
        source: lead.utmSource,
        medium: lead.utmMedium,
        campaign: lead.utmCampaign,
        content: lead.utmContent,
        term: lead.utmTerm,
      },
      click_ids: { gclid: lead.gclid, fbclid: lead.fbclid },
      page_url: lead.pageUrl,
      created_at: lead.createdAt,
    };

    const response = await fetch(process.env.CSCART_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.CSCART_API_TOKEN && {
          Authorization: `Bearer ${process.env.CSCART_API_TOKEN}`,
        }),
      },
      body: JSON.stringify(webhookPayload),
    });

    const responseData = await response.json().catch(() => null);

    await db.lead.update({
      where: { id: lead.id },
      data: {
        status: response.ok ? 'sent' : 'failed',
        csCartResponse: responseData || { error: 'Request failed', status: response.status },
      },
    });

    if (response.ok) {
      return NextResponse.json({ success: true, status: 'sent' });
    }
    return NextResponse.json(
      { success: false, status: 'failed', response: responseData },
      { status: 500 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Retry error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
