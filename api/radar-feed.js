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
    return res.status(500).json({ error: 'Feed unavailable', details: err.message });
  }
}

async function fetchCuratedNews() {
  // Fetch a large pool to curate from
  const response = await fetch(
    'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=popular&limit=100',
    {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'User-Agent': 'GEMMA-Ecosystem/1.0' },
    }
  );

  if (!response.ok) throw new Error(`CryptoCompare API returned ${response.status}`);
  const data = await response.json();
  if (!data.Data || !Array.isArray(data.Data)) throw new Error('Invalid response');

  // Priority keywords for scoring
  const highPriority = ['brazil', 'brasil', 'latin america', 'south america', 'regulation', 'institutional', 'compliance', 'tax', 'cbdc'];
  const medPriority = ['blockchain', 'defi', 'tokenization', 'rwa', 'stablecoin', 'adoption', 'innovation', 'bitcoin', 'ethereum'];

  // Preferred quality sources (diverse and credible)
  const preferredSources = ['cointelegraph', 'coindesk', 'decrypt', 'bloomberg', 'bitcoin.com', 'bitcoinist', 'theblock', 'amb crypto', 'newsBTC', 'cryptopolitan'];

  const scored = data.Data.map((item) => {
    const text = `${item.title} ${item.body || ''}`.toLowerCase();
    const sourceName = (item.source_info?.name || item.source || '').toLowerCase();
    let score = 0;

    // High priority keywords (Brazil, regulation, institutional)
    for (const kw of highPriority) {
      if (text.includes(kw)) score += 5;
    }

    // Medium priority keywords
    for (const kw of medPriority) {
      if (text.includes(kw)) score += 1;
    }

    // Boost preferred credible sources
    if (preferredSources.some(s => sourceName.includes(s))) {
      score += 8;
    }

    // Penalize "Bitcoin World" to ensure diversity (they flood the feed)
    if (sourceName.includes('bitcoin world')) {
      score -= 10;
    }

    // Slight recency boost (within 7 days)
    const ageHours = (Date.now() - item.published_on * 1000) / (1000 * 60 * 60);
    if (ageHours < 48) score += 2;
    else if (ageHours < 168) score += 1;

    return { item, score, source: sourceName };
  });

  // Sort by score
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

  // If we don't have enough (due to source limit), fill from remaining
  if (selected.length < 5) {
    for (const entry of scored) {
      if (selected.length >= 5) break;
      if (!selected.includes(entry.item)) {
        selected.push(entry.item);
      }
    }
  }

  return selected.map((item) => {
    const publishedDate = new Date(item.published_on * 1000);
    return {
      id: String(item.id),
      title: item.title,
      source: item.source_info?.name || item.source || 'Unknown',
      newsUrl: item.guid || item.url || '#',
      timestamp: publishedDate.toISOString(),
      date: {
        pt: publishedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }),
        en: publishedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      },
    };
  });
}
