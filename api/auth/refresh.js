// POST /api/auth/refresh
// Uses a stored refresh token to silently get a new access token.
// Called automatically whenever the 1-hour access token expires.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { refresh_token } = req.body ?? {};
  if (!refresh_token) return res.status(400).json({ error: 'Missing refresh_token' });

  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token,
      client_id:     clientId,
      client_secret: clientSecret,
      grant_type:    'refresh_token',
    }),
  });

  const data = await tokenRes.json();

  if (!tokenRes.ok) {
    console.error('Google refresh error:', data);
    return res.status(401).json({ error: data.error_description ?? 'Refresh failed' });
  }

  return res.status(200).json({
    access_token: data.access_token,
    expires_in:   data.expires_in,
  });
}
