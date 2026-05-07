/**
 * Optional proxy for Claude — keeps API key off the browser.
 * Set ANTHROPIC_API_KEY in Netlify. Client should POST { "scope": "text..." }.
 */
exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  var key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return {
      statusCode: 501,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured on server' }),
    };
  }
  var payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }
  var scope = payload.scope || '';
  if (!String(scope).trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing scope' }) };
  }

  var res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      messages: [
        {
          role: 'user',
          content:
            'Parse this roofing insurance scope into JSON with keys lineItems[], supplements[], materialOrder.items[]. Each line item: code,desc,qty,unit,flag?. Scope:\n' +
            scope,
        },
      ],
    }),
  });
  var data = await res.json();
  return {
    statusCode: res.ok ? 200 : res.status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
};
