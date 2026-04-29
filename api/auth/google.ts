import type { VercelRequest, VercelResponse } from '@vercel/node';

// POST /api/auth/google
// Exchanges a Google authorization code for access + refresh tokens.
// The client secret lives here (server-side only) — never in the browser bundle.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS — allow requests from the same origin
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code } = req.body ?? {};
  if (!code) return res.status(400).json({ error: 'Missing authorization code' });

  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET env vars');
    return res.status(500).json({ error: 'Server not configured' });
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     clientId,
      client_secret: clientSecret,
      redirect_uri:  'postmessage',   // GIS popup flow uses this special value
      grant_type:    'authorization_code',
    }),
  });

  const data = await tokenRes.json();

  if (!tokenRes.ok) {
    console.error('Google token exchange error:', data);
    return res.status(400).json({ error: data.error_description ?? 'Token exchange failed' });
  }

  // Return access + refresh tokens to the client.
  // Client stores refresh token in localStorage; access token is short-lived.
  return res.status(200).json({
    access_token:  data.access_token,
    refresh_token: data.refresh_token,   // long-lived, never expires unless revoked
    expires_in:    data.expires_in,      // seconds until access_token expires (typically 3600)
  });
}
