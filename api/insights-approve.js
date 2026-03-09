const { put, del, list } = require('@vercel/blob');
const jwt = require('jsonwebtoken');

function verifyAdmin(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('No token');
  jwt.verify(token, process.env.ADMIN_JWT_SECRET);
}

module.exports = async function handler(req, res) {
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

  const { articleId } = req.body;

  if (!articleId) {
    return res.status(400).json({ error: 'articleId is required' });
  }

  try {
    // Find the pending article blob
    const { blobs } = await list({
      prefix: `articles/pending/${articleId}`,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!blobs || blobs.length === 0) {
      return res.status(404).json({ error: 'Pending article not found' });
    }

    // Fetch article data
    const response = await fetch(blobs[0].url);
    const article = await response.json();

    // Update status
    article.status = 'approved';
    article.approvedAt = new Date().toISOString();

    // Write to approved folder
    await put(`articles/approved/${articleId}.json`, JSON.stringify(article, null, 2), {
      access: 'public',
      contentType: 'application/json',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Delete from pending
    await del(blobs[0].url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.status(200).json({ status: 'approved', articleId });
  } catch (err) {
    console.error('Approve error:', err);
    return res.status(500).json({ error: 'Approval failed', details: err.message });
  }
};
