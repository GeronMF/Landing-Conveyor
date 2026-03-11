import { createCsCartOrder, buildOrderNotes } from '@/lib/cscart';
import { db } from '@/lib/db';

type Destination = 'cs_cart' | 'keycrm';

interface DispatchResult {
  ok: boolean;
  destination: Destination;
  externalOrderId?: string | number | null;
  raw?: any;
  error?: string;
}

type LeadWithRelations = Awaited<
  ReturnType<typeof db.lead.findUnique>
>;

async function sendToCsCart(lead: NonNullable<LeadWithRelations>): Promise<DispatchResult> {
  const productId = lead.variant?.cscartProductId;

  if (!productId) {
    console.warn(`Lead ${lead.id}: variant has no cscartProductId, skipping CS-Cart order`);
    return {
      ok: false,
      destination: 'cs_cart',
      error: 'Variant has no cscartProductId configured',
    };
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

  return {
    ok: result.ok,
    destination: 'cs_cart',
    externalOrderId: result.orderId ?? null,
    raw: result.raw,
    error: result.error,
  };
}

async function sendToKeyCrm(lead: NonNullable<LeadWithRelations>): Promise<DispatchResult> {
  const landing = lead.landing as any;
  const variant = lead.variant as any;

  const apiKey: string | undefined = landing.keycrmApiKey || process.env.KEYCRM_API_KEY;
  const sourceId: number | undefined = landing.keycrmSourceId ?? (process.env.KEYCRM_DEFAULT_SOURCE_ID ? Number(process.env.KEYCRM_DEFAULT_SOURCE_ID) : undefined);
  const managerId: number | undefined = landing.keycrmManagerId ?? (process.env.KEYCRM_DEFAULT_MANAGER_ID ? Number(process.env.KEYCRM_DEFAULT_MANAGER_ID) : undefined);
  const sku: string | undefined = variant?.keycrmOfferSku || undefined;

  if (!apiKey) {
    const error = `Lead ${lead.id}: KeyCRM API key not configured (landing.keycrmApiKey or KEYCRM_API_KEY)`;
    console.error(error);
    return { ok: false, destination: 'keycrm', error };
  }

  if (!sku) {
    const error = `Lead ${lead.id}: keycrmOfferSku is not configured on variant`;
    console.error(error);
    return { ok: false, destination: 'keycrm', error };
  }

  if (!sourceId) {
    const error = `Lead ${lead.id}: keycrmSourceId not configured (landing.keycrmSourceId or KEYCRM_DEFAULT_SOURCE_ID)`;
    console.error(error);
    return { ok: false, destination: 'keycrm', error };
  }

  const price = variant?.price ? Number(variant.price) : 0;
  const variantName: string = variant?.title || landing.pageTitle || landing.slug;

  const body = {
    source_id: sourceId,
    ...(managerId ? { manager_id: managerId } : {}),
    buyer: {
      full_name: lead.name,
      phone: lead.phone,
    },
    buyer_comment: lead.comment || undefined,
    products: [
      {
        sku,
        price,
        quantity: 1,
        name: variantName,
      },
    ],
  };

  try {
    const response = await fetch('https://openapi.keycrm.app/v1/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        (data && (data.message || data.error)) ||
        `KeyCRM HTTP ${response.status}`;
      console.error(
        `KeyCRM error for lead ${lead.id}:`,
        errorMessage,
        data || '',
      );

      return {
        ok: false,
        destination: 'keycrm',
        raw: data,
        error: errorMessage,
      };
    }

    const externalOrderId = data?.id ?? data?.order_id ?? null;

    return {
      ok: true,
      destination: 'keycrm',
      externalOrderId,
      raw: data,
    };
  } catch (err: any) {
    console.error(
      `KeyCRM network error for lead ${lead.id}:`,
      err?.message || err,
    );
    return {
      ok: false,
      destination: 'keycrm',
      error: err?.message || 'KeyCRM network error',
    };
  }
}

export async function dispatchLead(
  lead: NonNullable<LeadWithRelations>,
): Promise<DispatchResult> {
  const landing: any = lead.landing;
  const destination: Destination =
    landing.orderDestination === 'keycrm' ? 'keycrm' : 'cs_cart';

  if (destination === 'keycrm') {
    return sendToKeyCrm(lead);
  }

  return sendToCsCart(lead);
}

