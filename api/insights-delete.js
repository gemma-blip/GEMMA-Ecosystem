import { del, list } from '@vercel/blob';
import jwt from 'jsonwebtoken';

function verifyAdmin(req) {
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
    verifyAdmin(req);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  const { articleId, status } = body;

  if (!articleId) {
    return res.status(400).json({ error: 'articleId is required' });
  }

  const folder = status || 'pending';
  if (!['pending', 'approved', 'published'].includes(folder)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const { blobs } = await list({
      prefix: `articles/${folder}/${articleId}`,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!blobs || blobs.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    await del(blobs[0].url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.status(200).json({ deleted: true, articleId });
  } catch (err) {
    console.error('Delete error:', err);
    return res.status(500).json({ error: 'Delete failed', details: err.message });
  }
}
