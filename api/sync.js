import { put, list } from '@vercel/blob';

const BLOB_NAME = 'harmony-data.json';

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

// Fetch current blob data (returns {} if none yet)
async function getExisting() {
  try {
    const { blobs } = await list({ prefix: 'harmony-data' });
    if (!blobs.length) return {};
    const res = await fetch(blobs[0].url);
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — return current cloud state
  if (req.method === 'GET') {
    const data = await getExisting();
    return res.status(200).json(data);
  }

  // POST — merge incoming data with cloud state and save
  if (req.method === 'POST') {
    const incoming = req.body ?? {};
    const existing = await getExisting();

    const merged = {
      bills:    mergeArrays(incoming.bills,   existing.bills),
      chores:   mergeArrays(incoming.chores,  existing.chores),
      events:   mergeArrays(incoming.events,  existing.events),
      lists:    mergeArrays(incoming.lists,   existing.lists),
      members:  mergeArrays(incoming.members, existing.members),
      updatedAt: Date.now(),
    };

    await put(BLOB_NAME, JSON.stringify(merged), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
    });

    return res.status(200).json(merged);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
