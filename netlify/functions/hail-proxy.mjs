/**
 * HailTrace proxy — keeps X-APP-ID and API key on the server.
 *
 * ESM (.mjs) is intentional: Netlify Node 22 ambiguity makes mixing CJS/ESM in
 * the same .js file brittle. Hail responses are returned inline only; per
 * HailTrace TOS the client MUST NOT persist hail shapes.
 *
 * Env vars (set in Netlify → Site settings → Environment variables):
 *   HAILTRACE_APP_ID   — required, sent as X-APP-ID header
 *   HAILTRACE_API_KEY  — optional, sent as Authorization: Bearer <key>
 *   HAILTRACE_BASE_URL — optional, defaults to https://api.hailtrace.com
 *   HAILTRACE_PATH     — optional, defaults to /v1/hail-history
 *
 * Client POSTs JSON: { address?: string, lat?: number, lng?: number, days?: number }
 */
export const handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: 'Method Not Allowed' };
  }

  const appId = process.env.HAILTRACE_APP_ID;
  if (!appId) {
    return json(501, { error: 'HAILTRACE_APP_ID not configured on server' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return json(400, { error: 'Invalid JSON body' });
  }

  const address = (payload.address || '').toString().trim();
  const lat = Number.isFinite(payload.lat) ? payload.lat : null;
  const lng = Number.isFinite(payload.lng) ? payload.lng : null;
  const days = Number.isFinite(payload.days) ? Math.max(1, Math.min(365 * 2, payload.days)) : 730;

  if (!address && (lat === null || lng === null)) {
    return json(400, { error: 'Provide either address or lat+lng' });
  }

  const base = (process.env.HAILTRACE_BASE_URL || 'https://api.hailtrace.com').replace(/\/+$/, '');
  const path = process.env.HAILTRACE_PATH || '/v1/hail-history';
  const params = new URLSearchParams();
  if (address) params.set('address', address);
  if (lat !== null) params.set('lat', String(lat));
  if (lng !== null) params.set('lng', String(lng));
  params.set('days', String(days));

  const url = `${base}${path}?${params.toString()}`;
  const headers = {
    Accept: 'application/json',
    'X-APP-ID': appId,
  };
  if (process.env.HAILTRACE_API_KEY) {
    headers.Authorization = `Bearer ${process.env.HAILTRACE_API_KEY}`;
  }

  try {
    const res = await fetch(url, { headers });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    return json(res.ok ? 200 : res.status, data);
  } catch (err) {
    return json(502, { error: 'Upstream HailTrace request failed', detail: String(err && err.message || err) });
  }
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify(body),
  };
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}
