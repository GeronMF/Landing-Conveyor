/**
 * CS-Cart integration
 *
 * Режим 1 — PHP webhook (РЕКОМЕНДОВАН если нет REST API через Nginx):
 *   CSCART_PHP_WEBHOOK_URL  = https://rozprodai.com/create_order.php
 *   CSCART_PHP_WEBHOOK_SECRET = your_secret_key
 *
 * Режим 2 — REST API (требует HTTP_AUTHORIZATION в Nginx fastcgi_params):
 *   CSCART_API_URL   = https://rozprodai.com
 *   CSCART_API_TOKEN = email:api_key
 */

export interface CsCartOrderPayload {
  firstname: string;
  phone: string;
  productId: string;
  notes?: string;
}

export interface CsCartOrderResult {
  ok: boolean;
  orderId?: number;
  raw?: any;
  error?: string;
}

/**
 * Создаёт заказ в CS-Cart.
 * Автоматически выбирает режим:
 *   1. PHP webhook (CSCART_PHP_WEBHOOK_URL + CSCART_PHP_WEBHOOK_SECRET)
 *   2. REST API    (CSCART_API_URL + CSCART_API_TOKEN)
 */
export async function createCsCartOrder(
  payload: CsCartOrderPayload
): Promise<CsCartOrderResult> {
  // --- Режим 1: PHP webhook ---
  const phpWebhookUrl    = process.env.CSCART_PHP_WEBHOOK_URL;
  const phpWebhookSecret = process.env.CSCART_PHP_WEBHOOK_SECRET;

  if (phpWebhookUrl && phpWebhookSecret) {
    return createOrderViaPhpWebhook(payload, phpWebhookUrl, phpWebhookSecret);
  }

  // --- Режим 2: REST API ---
  const apiUrl   = process.env.CSCART_API_URL;
  const apiToken = process.env.CSCART_API_TOKEN;

  if (apiUrl && apiToken) {
    return createOrderViaRestApi(payload, apiUrl, apiToken);
  }

  return { ok: false, error: 'CS-Cart not configured. Set CSCART_PHP_WEBHOOK_URL or CSCART_API_URL.' };
}

/**
 * Режим 1: PHP скрипт на сервере CS-Cart (без REST API)
 */
async function createOrderViaPhpWebhook(
  payload: CsCartOrderPayload,
  webhookUrl: string,
  secret: string
): Promise<CsCartOrderResult> {
  const url = `${webhookUrl}?secret=${encodeURIComponent(secret)}`;

  const body = {
    firstname: payload.firstname,
    phone:     payload.phone,
    products:  [{ product_id: parseInt(payload.productId, 10), amount: 1 }],
    notes:     payload.notes || '',
  };

  try {
    const response = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    const raw = await response.json().catch(() => null);

    if (response.ok && raw?.order_id) {
      return { ok: true, orderId: raw.order_id, raw };
    }

    return {
      ok:    false,
      raw,
      error: raw?.error || `PHP webhook HTTP ${response.status}`,
    };
  } catch (err: any) {
    return { ok: false, error: err.message || 'PHP webhook network error' };
  }
}

/**
 * Режим 2: CS-Cart REST API (требует HTTP_AUTHORIZATION в Nginx)
 */
async function createOrderViaRestApi(
  payload: CsCartOrderPayload,
  apiUrl: string,
  apiToken: string
): Promise<CsCartOrderResult> {
  const authHeader = 'Basic ' + Buffer.from(apiToken).toString('base64');

  const orderBody = {
    status:    'O',
    firstname: payload.firstname,
    phone:     payload.phone,
    b_country: 'UA',
    s_country: 'UA',
    products:  [{ product_id: parseInt(payload.productId, 10), amount: 1 }],
    ...(payload.notes ? { notes: payload.notes } : {}),
  };

  try {
    const response = await fetch(`${apiUrl}/api/orders/`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body:    JSON.stringify(orderBody),
    });

    const raw = await response.json().catch(() => null);

    if (response.ok && raw?.order_id) {
      return { ok: true, orderId: raw.order_id, raw };
    }

    return {
      ok:    false,
      raw,
      error: raw?.message || raw?.error || `HTTP ${response.status}`,
    };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Network error' };
  }
}

/**
 * Формирует строку notes для заказа из данных лида
 */
export function buildOrderNotes(data: {
  landingSlug?: string;
  variantTitle?: string;
  city?: string;
  comment?: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  pageUrl?: string | null;
}): string {
  const parts: string[] = [];

  if (data.landingSlug) parts.push(`Лендинг: ${data.landingSlug}`);
  if (data.variantTitle) parts.push(`Варіант: ${data.variantTitle}`);
  if (data.city) parts.push(`Місто: ${data.city}`);
  if (data.comment) parts.push(`Коментар: ${data.comment}`);

  const utmParts: string[] = [];
  if (data.utmSource) utmParts.push(`source=${data.utmSource}`);
  if (data.utmMedium) utmParts.push(`medium=${data.utmMedium}`);
  if (data.utmCampaign) utmParts.push(`campaign=${data.utmCampaign}`);
  if (utmParts.length > 0) parts.push(`UTM: ${utmParts.join(', ')}`);

  if (data.gclid) parts.push(`gclid=${data.gclid}`);
  if (data.fbclid) parts.push(`fbclid=${data.fbclid}`);
  if (data.pageUrl) parts.push(`URL: ${data.pageUrl}`);

  return parts.join(' | ');
}
