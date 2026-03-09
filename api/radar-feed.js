function formatRelativeTime(dateString, lang) {
  const now = new Date();
  const date = new Date(dateString);
  const diffSeconds = Math.floor((now - date) / 1000);
  const diffDays = Math.floor(diffSeconds / 86400);

  if (lang === 'pt') {
    if (diffDays === 0) return 'hoje';
    if (diffDays === 1) return 'ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem. atrás`;
    return `${Math.floor(diffDays / 30)} mês(es) atrás`;
  }

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const feed = await fetchFilteredNews();

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).json(feed);
  } catch (err) {
    console.error('Radar feed error:', err);
    return res.status(500).json({ error: 'Feed unavailable', details: err.message });
  }
}

async function fetchFilteredNews() {
  // Fetch more articles to filter down to the best 5
  // CryptoCompare categories: BTC, Blockchain, Regulation, Mining, Trading, etc.
  const categories = ['BTC', 'Blockchain', 'Regulation', 'Trading', 'Technology'];

  const response = await fetch(
    `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=popular&limit=50&categories=${categories.join(',')}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GEMMA-Ecosystem/1.0',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`CryptoCompare API returned ${response.status}`);
  }

  const data = await response.json();

  if (!data.Data || !Array.isArray(data.Data)) {
    throw new Error('Invalid response from CryptoCompare');
  }

  // Keywords that indicate relevance to Brazil, Crypto regulation, Blockchain innovation
  const priorityKeywords = [
    'brazil', 'brasil', 'latin america', 'south america',
    'regulation', 'tax', 'compliance', 'institutional',
    'blockchain', 'defi', 'tokenization', 'rwa', 'cbdc',
    'bitcoin', 'ethereum', 'stablecoin',
    'adoption', 'innovation', 'infrastructure',
  ];

  // Score and rank articles by relevance
  const scored = data.Data.map((item) => {
    const text = `${item.title} ${item.body || ''}`.toLowerCase();
    let score = 0;

    // Priority keyword matches
    for (const kw of priorityKeywords) {
      if (text.includes(kw)) score += 2;
    }

    // Boost for Brazil/Latin America mentions
    if (text.includes('brazil') || text.includes('brasil') || text.includes('latin america')) {
      score += 10;
    }

    // Boost for institutional/regulatory content (matches GEMMA's focus)
    if (text.includes('institutional') || text.includes('regulation') || text.includes('compliance')) {
      score += 5;
    }

    // Boost for recent articles (within last 7 days)
    const ageHours = (Date.now() - item.published_on * 1000) / (1000 * 60 * 60);
    if (ageHours < 24) score += 3;
    else if (ageHours < 168) score += 1;

    return { item, score };
  });

  // Sort by score descending, take top 5
  scored.sort((a, b) => b.score - a.score);
  const top5 = scored.slice(0, 5);

  return top5.map(({ item }) => {
    const publishedDate = new Date(item.published_on * 1000);
    return {
      id: String(item.id),
      title: item.title,
      source: item.source_info?.name || item.source || 'Unknown',
      newsUrl: item.guid || item.url || '#',
      timestamp: publishedDate.toISOString(),
      time: formatRelativeTime(publishedDate.toISOString(), 'en'),
      date: publishedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
  });
}
