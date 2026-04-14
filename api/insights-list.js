import { list } from '@vercel/blob';
import { readPublishedIndex } from './_lib-index.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { status } = req.query;

  if (!['pending', 'approved', 'published'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Use: pending, approved, published' });
  }

  // Fast path for published: read single index file (1 "simple" op, aggressive cache)
  if (status === 'published') {
    try {
      const articles = await readPublishedIndex();
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      return res.status(200).json(articles);
    } catch (err) {
      console.error('Published list error:', err);
      return res.status(200).json([]);
    }
  }

  // Admin path (pending / approved): still uses list() but called rarely
  try {
    const { blobs } = await list({
      prefix: `articles/${status}/`,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!blobs || blobs.length === 0) {
      return res.status(200).json([]);
    }

    const articles = await Promise.all(
      blobs
        .filter(blob => blob.pathname.endsWith('.json'))
        .map(async (blob) => {
          try {
            const response = await fetch(blob.downloadUrl || blob.url, {
              headers: { 'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
            });
            if (!response.ok) return null;
            return await response.json();
          } catch {
            return null;
          }
        })
    );

    const validArticles = articles
      .filter(Boolean)
      .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));

    return res.status(200).json(validArticles);
  } catch (err) {
    console.error('List error:', err);
    return res.status(500).json({ error: 'Failed to fetch articles', details: err.message });
  }
}
