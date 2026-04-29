import { kv } from '@vercel/kv';

const KV_KEY = 'harmony:data';

// Merge two arrays by id — newer updated_date wins
function mergeArrays(local = [], server = []) {
  const map = new Map();
  for (const item of server) map.set(item.id, item);
  for (const item of local) {
    const s = map.get(item.id);
    if (!s || (item.updated_date ?? '') > (s.updated_date ?? '')) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — return current cloud state
  if (req.method === 'GET') {
    const data = await kv.get(KV_KEY);
    return res.status(200).json(data ?? {});
  }

  // POST — merge incoming data with cloud state and save
  if (req.method === 'POST') {
    const incoming = req.body ?? {};
    const existing = (await kv.get(KV_KEY)) ?? {};

    const merged = {
      bills:    mergeArrays(incoming.bills,    existing.bills),
      chores:   mergeArrays(incoming.chores,   existing.chores),
      events:   mergeArrays(incoming.events,   existing.events),
      lists:    mergeArrays(incoming.lists,    existing.lists),
      members:  mergeArrays(incoming.members,  existing.members),
      updatedAt: Date.now(),
    };

    await kv.set(KV_KEY, merged);
    return res.status(200).json(merged);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
