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
    // Return empty feed instead of 500 so the UI keeps rendering gracefully
    res.setHeader('Cache-Control', 'public, s-maxage=60');
    return res.status(200).json([]);
  }
}

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

async function fetchCuratedNews() {
  const apiKey = process.env.CRYPTOPANIC_API_KEY;
  if (!apiKey) throw new Error('CRYPTOPANIC_API_KEY missing');

  // CryptoPanic v1 API — fetch a pool of recent posts to curate from
  const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${apiKey}&public=true&kind=news&regions=en&filter=hot`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json', 'User-Agent': 'GEMMA-Ecosystem/1.0' },
  });

  if (!response.ok) throw new Error(`CryptoPanic API returned ${response.status}`);
  const data = await response.json();
  if (!data.results || !Array.isArray(data.results)) throw new Error('Invalid response');

  // Normalize to common shape
  const pool = data.results.map(item => ({
    id: item.id,
    title: item.title || '',
    body: item.description || '',
    source: item.source?.title || item.source?.domain || 'Unknown',
    sourceDomain: (item.source?.domain || '').toLowerCase(),
    url: item.url || item.original_url || '#',
    published_on: Math.floor(new Date(item.published_at || item.created_at || Date.now()).getTime() / 1000),
  }));

  // Priority keywords for scoring
  const highPriority = ['brazil', 'brasil', 'latin america', 'south america', 'regulation', 'institutional', 'compliance', 'tax', 'cbdc'];
  const medPriority = ['blockchain', 'defi', 'tokenization', 'rwa', 'stablecoin', 'adoption', 'innovation', 'bitcoin', 'ethereum'];

  // Preferred quality sources (diverse and credible)
  const preferredSources = ['cointelegraph', 'coindesk', 'decrypt', 'bloomberg', 'bitcoin.com', 'bitcoinist', 'theblock', 'ambcrypto', 'newsbtc', 'cryptopolitan', 'reuters', 'ft.com', 'wsj'];

  const scored = pool.map((item) => {
    const text = `${item.title} ${item.body}`.toLowerCase();
    const sourceName = `${item.source} ${item.sourceDomain}`.toLowerCase();
    let score = 0;

    for (const kw of highPriority) {
      if (text.includes(kw)) score += 5;
    }
    for (const kw of medPriority) {
      if (text.includes(kw)) score += 1;
    }
    if (preferredSources.some(s => sourceName.includes(s))) {
      score += 8;
    }
    if (sourceName.includes('bitcoin world')) {
      score -= 10;
    }

    const ageHours = (Date.now() - item.published_on * 1000) / (1000 * 60 * 60);
    if (ageHours < 48) score += 2;
    else if (ageHours < 168) score += 1;

    return { item, score, source: sourceName };
  });

  scored.sort((a, b) => b.score - a.score);

  // Select top 5 with max 1 article per source for diversity
  const selected = [];
  const sourceCounts = {};
  const MAX_PER_SOURCE = 1;

  for (const entry of scored) {
    if (selected.length >= 5) break;
    const src = entry.source;
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    if (sourceCounts[src] <= MAX_PER_SOURCE) {
      selected.push(entry.item);
    }
  }

  if (selected.length < 5) {
    for (const entry of scored) {
      if (selected.length >= 5) break;
      if (!selected.includes(entry.item)) {
        selected.push(entry.item);
      }
    }
  }

  // Translate titles to Portuguese
  const englishTitles = selected.map(item => item.title);
  const ptTitles = await translateTitles(englishTitles);

  return selected.map((item, index) => {
    const publishedDate = new Date(item.published_on * 1000);
    return {
      id: String(item.id),
      title: {
        en: item.title,
        pt: ptTitles?.[index] || item.title,
      },
      source: item.source || 'Unknown',
      newsUrl: item.url,
      timestamp: publishedDate.toISOString(),
      date: {
        pt: publishedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }),
        en: publishedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      },
    };
  });
}
