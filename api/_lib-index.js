// Helper shared by insights endpoints.
// Maintains a single JSON index of PUBLISHED articles to avoid calling
// Vercel Blob's `list()` on every request (which consumes Advanced Operations).

import { put, list } from '@vercel/blob';

const INDEX_PATH = 'articles/published-index.json';

export async function readPublishedIndex() {
  try {
    const { blobs } = await list({
      prefix: INDEX_PATH,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    if (!blobs || blobs.length === 0) return [];
    const url = blobs[0].downloadUrl || blobs[0].url;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('readPublishedIndex error:', err);
    return [];
  }
}

export async function writePublishedIndex(items) {
  await put(INDEX_PATH, JSON.stringify(items, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

export async function addToPublishedIndex(article) {
  const items = await readPublishedIndex();
  const filtered = items.filter(a => a.id !== article.id);
  filtered.unshift(article);
  await writePublishedIndex(filtered);
}

export async function removeFromPublishedIndex(articleId) {
  const items = await readPublishedIndex();
  const filtered = items.filter(a => a.id !== articleId);
  await writePublishedIndex(filtered);
}
