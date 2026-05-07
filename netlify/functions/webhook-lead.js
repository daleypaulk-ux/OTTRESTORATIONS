/**
 * Website lead webhook — Phase 3 hook.
 * Set env WEBHOOK_LEAD_SECRET in Netlify; same value in app Settings (client checks local only for display).
 * Production: persist leads to a database; this handler only validates and acks.
 */
exports.handler = async function (event) {
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'OPTIONS') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }

  var secret = process.env.WEBHOOK_LEAD_SECRET;
  var got = event.headers['x-webhook-secret'] || event.headers['X-Webhook-Secret'] || '';
  if (secret && got !== secret) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      body: JSON.stringify({ ok: false, error: 'Invalid or missing x-webhook-secret' }),
    };
  }

  var body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      body: JSON.stringify({ ok: false, error: 'Invalid JSON body' }),
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify({
      ok: true,
      received: body,
      message:
        'Acknowledged. Wire this function to your database to create customers; the static CRM cannot see server logs.',
    }),
  };
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-webhook-secret, X-Webhook-Secret',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}
