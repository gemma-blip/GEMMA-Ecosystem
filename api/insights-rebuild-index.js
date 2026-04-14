// One-shot admin endpoint: rebuild articles/published-index.json by scanning the
// articles/published/ folder in Blob. Use this after migrating to the index-based
// approach, or if the index ever gets out of sync. Costs one list() call.

import { list } from '@vercel/blob';
import { writePublishedIndex } from './_lib-index.js';

async function verifyAdmin(req) {
  const jwtModule = await import('jsonwebtoken');
  const jwt = jwtModule.default || jwtModule;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('No token');
  jwt.verify(token, process.env.ADMIN_JWT_SECRET);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await verifyAdmin(req);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { blobs } = await list({
      prefix: 'articles/published/',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const jsonBlobs = (blobs || []).filter(b => b.pathname.endsWith('.json'));

    const articles = await Promise.all(
      jsonBlobs.map(async (blob) => {
        try {
          const r = await fetch(blob.downloadUrl || blob.url, {
            headers: { 'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
          });
          if (!r.ok) return null;
          return await r.json();
        } catch {
          return null;
        }
      })
    );

    const valid = articles
      .filter(Boolean)
      .sort((a, b) => new Date(b.publishedAt || b.generatedAt) - new Date(a.publishedAt || a.generatedAt));

    await writePublishedIndex(valid);

    return res.status(200).json({ rebuilt: true, count: valid.length });
  } catch (err) {
    console.error('Rebuild index error:', err);
    return res.status(500).json({ error: 'Rebuild failed', details: err.message });
  }
}
