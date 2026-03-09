function formatRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffSeconds = Math.floor((now - date) / 1000);

  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const limit = parseInt(req.query.limit) || 10;

  try {
    const feed = await fetchCryptoCompareNews(limit);

    if (feed.length > 0) {
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      return res.status(200).json(feed);
    }

    const fallbackFeed = await fetchCoinGeckoNews(limit);
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(fallbackFeed);

  } catch (err) {
    console.error('Radar feed error:', err);
    return res.status(500).json({ error: 'Feed unavailable', details: err.message, items: [] });
  }
}

async function fetchCryptoCompareNews(limit) {
  const response = await fetch(
    `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=popular&limit=${limit}`,
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

  return data.Data.map((item) => ({
    id: String(item.id),
    title: item.title,
    source: item.source_info?.name || item.source || 'Unknown',
    sourceUrl: item.source_info?.url || '',
    newsUrl: item.guid || item.url || '#',
    timestamp: new Date(item.published_on * 1000).toISOString(),
    time: formatRelativeTime(new Date(item.published_on * 1000).toISOString()),
    imageUrl: item.imageurl || null,
    categories: item.categories ? item.categories.split('|').slice(0, 3) : [],
    currencies: item.tags ? item.tags.split('|').slice(0, 3).map(t => t.toUpperCase()) : [],
  }));
}

async function fetchCoinGeckoNews(limit) {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/news?per_page=${limit}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GEMMA-Ecosystem/1.0',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`CoinGecko News API returned ${response.status}`);
  }

  const data = await response.json();

  if (!data.data || !Array.isArray(data.data)) {
    return [];
  }

  return data.data.map((item) => ({
    id: String(item.id || Math.random().toString(36).slice(2)),
    title: item.title,
    source: item.author || 'CoinGecko',
    sourceUrl: '',
    newsUrl: item.url || '#',
    timestamp: item.updated_at || new Date().toISOString(),
    time: formatRelativeTime(item.updated_at || new Date().toISOString()),
    currencies: [],
  }));
}
