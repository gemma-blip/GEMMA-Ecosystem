import { put } from '@vercel/blob';

async function verifyAdmin(req) {
  const jwtModule = await import('jsonwebtoken');
  const jwt = jwtModule.default || jwtModule;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('No token');
  jwt.verify(token, process.env.ADMIN_JWT_SECRET);
}

const SYSTEM_PROMPT = `You are an expert editorial AI for the GEMMA Ecosystem, a Brazilian crypto-corporate consortium.
You write professional, well-researched articles about international tax planning, Flag Theory, and blockchain innovations.
Your articles should be authoritative, citing real frameworks and jurisdictions when relevant.
Always write in a professional tone suitable for institutional investors and legal professionals.
Structure articles with a clear title, introduction, 3-4 main sections, and conclusion.
Format the output as JSON with "title" and "content" fields. The content should use markdown formatting.`;

const TOPIC_PROMPTS = {
  'flag-theory': {
    pt: 'Escreva um artigo original e detalhado em português sobre a Teoria das Bandeiras (Flag Theory) aplicada a investidores de criptoativos. Aborde estratégias de diversificação jurisdicional, residência fiscal, e como estruturar patrimônio digital internacionalmente. Retorne JSON com campos "title" (string) e "content" (string markdown).',
    en: 'Write an original, detailed article in English about Flag Theory applied to crypto investors. Cover jurisdictional diversification strategies, tax residency, and how to structure digital assets internationally. Return JSON with "title" (string) and "content" (markdown string) fields.'
  },
  'tax-planning': {
    pt: 'Escreva um artigo original e detalhado em português sobre planejamento tributário internacional para detentores de criptoativos. Aborde estruturas offshore/onshore, tratados de dupla tributação, e conformidade regulatória no Brasil e Europa. Retorne JSON com campos "title" (string) e "content" (string markdown).',
    en: 'Write an original, detailed article in English about international tax planning for crypto asset holders. Cover offshore/onshore structures, double taxation treaties, and regulatory compliance in Brazil and Europe. Return JSON with "title" (string) and "content" (markdown string) fields.'
  },
  'blockchain-innovation': {
    pt: 'Escreva um artigo original e detalhado em português sobre as inovações mais recentes em tecnologia blockchain. Aborde DeFi institucional, tokenização de ativos reais (RWA), e avanços em escalabilidade e interoperabilidade. Retorne JSON com campos "title" (string) e "content" (string markdown).',
    en: 'Write an original, detailed article in English about the latest blockchain technology innovations. Cover institutional DeFi, real-world asset tokenization (RWA), and advances in scalability and interoperability. Return JSON with "title" (string) and "content" (markdown string) fields.'
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await verifyAdmin(req);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  const { topic, language } = body;

  if (!TOPIC_PROMPTS[topic]) {
    return res.status(400).json({ error: 'Invalid topic. Use: flag-theory, tax-planning, blockchain-innovation' });
  }
  if (!['pt', 'en'].includes(language)) {
    return res.status(400).json({ error: 'Invalid language. Use: pt, en' });
  }

  try {
    const AnthropicModule = await import('@anthropic-ai/sdk');
    const Anthropic = AnthropicModule.default || AnthropicModule;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: TOPIC_PROMPTS[topic][language] }
      ]
    });

    const responseText = message.content[0].text;

    // Parse JSON from Claude's response
    let articleTitle, articleContent;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        articleTitle = parsed.title;
        articleContent = parsed.content;
      } else {
        const lines = responseText.split('\n');
        articleTitle = lines[0].replace(/^#\s*/, '').trim();
        articleContent = lines.slice(1).join('\n').trim();
      }
    } catch {
      const lines = responseText.split('\n');
      articleTitle = lines[0].replace(/^#\s*/, '').trim();
      articleContent = lines.slice(1).join('\n').trim();
    }

    // Create article object
    const articleId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const articleData = {
      id: articleId,
      topic,
      language,
      title: { [language]: articleTitle },
      content: { [language]: articleContent },
      status: 'pending',
      generatedAt: new Date().toISOString(),
      approvedAt: null,
      publishedAt: null,
    };

    // Save to Vercel Blob Storage
    await put(`articles/pending/${articleId}.json`, JSON.stringify(articleData, null, 2), {
      access: 'public',
      contentType: 'application/json',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.status(200).json({
      id: articleId,
      title: articleTitle,
      preview: articleContent.slice(0, 300) + '...',
      status: 'pending',
    });
  } catch (err) {
    console.error('Generation error:', err);
    return res.status(500).json({ error: 'Article generation failed', details: err.message });
  }
}
