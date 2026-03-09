import { list, get } from '@vercel/blob';

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

  try {
    const { blobs } = await list({
      prefix: `articles/${status}/`,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!blobs || blobs.length === 0) {
      if (status === 'published') {
        res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
      }
      return res.status(200).json([]);
    }

    const articles = await Promise.all(
      blobs
        .filter(blob => blob.pathname.endsWith('.json'))
        .map(async (blob) => {
          try {
            const blobData = await get(blob.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
            return JSON.parse(await blobData.text());
          } catch {
            return null;
          }
        })
    );

    const validArticles = articles
      .filter(Boolean)
      .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));

    if (status === 'published') {
      res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    }

    return res.status(200).json(validArticles);
  } catch (err) {
    console.error('List error:', err);
    return res.status(500).json({ error: 'Failed to fetch articles', details: err.message });
  }
}
