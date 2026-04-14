// Global Crypto Radar — aggregates multiple trusted RSS feeds, scores for
// relevance (Brazil / regulation / institutional bias), and returns the top 5
// with Portuguese translations of the headlines.

const FEEDS = [
  { source: 'Cointelegraph', url: 'https://cointelegraph.com/rss' },
  { source: 'Decrypt', url: 'https://decrypt.co/feed' },
  { source: 'CryptoSlate', url: 'https://cryptoslate.com/feed/' },
  { source: 'Bitcoin.com News', url: 'https://news.bitcoin.com/feed/' },
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const feed = await fetchCuratedNews();
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).json(feed);
  } catch (err) {
    console.error('Radar feed error:', err);
    res.setHeader('Cache-Control', 'public, s-maxage=60');
    return res.status(200).json([]);
  }
}

// --- RSS parsing helpers ------------------------------------------------

function stripCdata(s) {
  if (!s) return '';
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function stripHtml(s) {
  return stripCdata(s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}

function extractTag(block, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = block.match(re);
  return m ? m[1] : '';
}

function parseRss(xml, source) {
  const items = [];
  const itemRegex = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < 25) {
    const block = match[1];
    const title = stripHtml(extractTag(block, 'title'));
    const link = stripHtml(extractTag(block, 'link'));
    const pubDate = stripHtml(extractTag(block, 'pubDate'));
    const description = stripHtml(extractTag(block, 'description'));
    if (!title || !link) continue;
    const ts = pubDate ? new Date(pubDate).getTime() : Date.now();
    items.push({
      id: `${source}-${link}`,
      title,
      body: description,
      source,
      url: link,
      published_on: Math.floor((isNaN(ts) ? Date.now() : ts) / 1000),
    });
  }
  return items;
}

async function fetchFeed(feed) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(feed.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (GEMMA-Ecosystem/1.0; +https://gemma.com.br)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRss(xml, feed.source);
  } catch (err) {
    console.error(`Feed ${feed.source} failed:`, err.message);
    return [];
  }
}

// --- Translation ---------------------------------------------------------

async function translateTitles(titles) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `Translate the following news headlines from English to Brazilian Portuguese. Keep them concise and journalistic. Return ONLY the translations, one per line, in the same order. Do not number them.

${titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const lines = text.split('\n').map(l => l.replace(/^\d+[\.\)]\s*/, '').trim()).filter(Boolean);
    return lines.length === titles.length ? lines : null;
  } catch {
    return null;
  }
}

// --- Curation ------------------------------------------------------------

async function fetchCuratedNews() {
  const results = await Promise.all(FEEDS.map(fetchFeed));
  const pool = results.flat();
  if (pool.length === 0) throw new Error('All feeds empty');

  const highPriority = ['brazil', 'brasil', 'latin america', 'south america', 'regulation', 'institutional', 'compliance', 'tax', 'cbdc', 'sec', 'etf'];
  const medPriority = ['blockchain', 'defi', 'tokenization', 'rwa', 'stablecoin', 'adoption', 'innovation', 'bitcoin', 'ethereum'];

  const scored = pool.map(item => {
    const text = `${item.title} ${item.body}`.toLowerCase();
    let score = 0;
    for (const kw of highPriority) if (text.includes(kw)) score += 5;
    for (const kw of medPriority) if (text.includes(kw)) score += 1;
    const ageHours = (Date.now() - item.published_on * 1000) / (1000 * 60 * 60);
    if (ageHours < 24) score += 3;
    else if (ageHours < 72) score += 2;
    else if (ageHours < 168) score += 1;
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Top 5, max 1 per source
  const selected = [];
  const sourceCounts = {};
  for (const entry of scored) {
    if (selected.length >= 5) break;
    const src = entry.item.source;
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    if (sourceCounts[src] <= 1) selected.push(entry.item);
  }
  if (selected.length < 5) {
    for (const entry of scored) {
      if (selected.length >= 5) break;
      if (!selected.includes(entry.item)) selected.push(entry.item);
    }
  }

  const englishTitles = selected.map(i => i.title);
  const ptTitles = await translateTitles(englishTitles);

  return selected.map((item, index) => {
    const d = new Date(item.published_on * 1000);
    return {
      id: String(item.id),
      title: { en: item.title, pt: ptTitles?.[index] || item.title },
      source: item.source,
      newsUrl: item.url,
      timestamp: d.toISOString(),
      date: {
        pt: d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }),
        en: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      },
    };
  });
}
