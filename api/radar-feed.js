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

  const apiKey = process.env.CRYPTOPANIC_API_KEY;
  const limit = req.query.limit || 10;

  if (!apiKey) {
    console.error('Missing CRYPTOPANIC_API_KEY env var');
    return res.status(500).json({ error: 'API configuration error', items: [] });
  }

  try {
    const response = await fetch(
      `https://cryptopanic.com/api/v1/posts/?auth_token=${apiKey}&limit=${limit}&kind=news&filter=trending`,
      {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`CryptoPanic API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Invalid response format from CryptoPanic');
    }

    // Transform CryptoPanic format to our schema
    const feed = data.results.map((item) => ({
      id: String(item.id),
      title: item.title,
      source: item.source?.title || 'Unknown',
      sourceUrl: item.source?.domain || '',
      newsUrl: item.url || '#',
      timestamp: item.created_at,
      time: formatRelativeTime(item.created_at),
      votes: {
        positive: item.votes?.positive || 0,
        negative: item.votes?.negative || 0,
      },
      currencies: item.currencies
        ? item.currencies.map(c => c.code).slice(0, 3)
        : [],
    }));

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(feed);
  } catch (err) {
    console.error('CryptoPanic error:', err);
    return res.status(500).json({ error: 'Feed unavailable', details: err.message, items: [] });
  }
}
