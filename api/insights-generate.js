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

IMPORTANT: Format your response EXACTLY like this:
<article_title>Your Article Title Here</article_title>
<article_content>
Your full article content here in markdown format...
</article_content>

Do NOT wrap the output in JSON or code blocks. Use the XML tags above.`;

const TOPIC_PROMPTS = {
  'flag-theory': {
    pt: 'Escreva um artigo original e detalhado em português sobre a Teoria das Bandeiras (Flag Theory) aplicada a investidores de criptoativos. Aborde estratégias de diversificação jurisdicional, residência fiscal, e como estruturar patrimônio digital internacionalmente.',
    en: 'Write an original, detailed article in English about Flag Theory applied to crypto investors. Cover jurisdictional diversification strategies, tax residency, and how to structure digital assets internationally.'
  },
  'tax-planning': {
    pt: 'Escreva um artigo original e detalhado em português sobre planejamento tributário internacional para detentores de criptoativos. Aborde estruturas offshore/onshore, tratados de dupla tributação, e conformidade regulatória no Brasil e Europa.',
    en: 'Write an original, detailed article in English about international tax planning for crypto asset holders. Cover offshore/onshore structures, double taxation treaties, and regulatory compliance in Brazil and Europe.'
  },
  'blockchain-innovation': {
    pt: 'Escreva um artigo original e detalhado em português sobre as inovações mais recentes em tecnologia blockchain. Aborde DeFi institucional, tokenização de ativos reais (RWA), e avanços em escalabilidade e interoperabilidade.',
    en: 'Write an original, detailed article in English about the latest blockchain technology innovations. Cover institutional DeFi, real-world asset tokenization (RWA), and advances in scalability and interoperability.'
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
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: TOPIC_PROMPTS[topic][language] }
      ]
    });

    const responseText = message.content[0].text;

    // Parse XML-style tags from Claude's response
    let articleTitle, articleContent;

    const titleMatch = responseText.match(/<article_title>([\s\S]*?)<\/article_title>/);
    // Handle both closed and unclosed content tag (Claude may hit token limit)
    const contentMatch = responseText.match(/<article_content>([\s\S]*?)(?:<\/article_content>|$)/);

    if (titleMatch && contentMatch) {
      articleTitle = titleMatch[1].trim();
      // Clean any remaining XML tags from content
      articleContent = contentMatch[1]
        .replace(/<\/?article_\w+>/g, '')
        .trim();
    } else if (titleMatch) {
      // Title found but no content tag — extract everything after title tag
      articleTitle = titleMatch[1].trim();
      articleContent = responseText
        .replace(/<article_title>[\s\S]*?<\/article_title>/, '')
        .replace(/<\/?article_\w+>/g, '')
        .trim();
    } else {
      // No XML tags — use heading-based fallback
      const cleanText = responseText.replace(/<\/?article_\w+>/g, '');
      const lines = cleanText.split('\n').filter(l => l.trim());
      const headingLine = lines.find(l => l.startsWith('#'));
      if (headingLine) {
        articleTitle = headingLine.replace(/^#+\s*/, '').trim();
        articleContent = cleanText.replace(headingLine, '').trim();
      } else {
        articleTitle = lines[0]?.trim() || 'Untitled Article';
        articleContent = lines.slice(1).join('\n').trim();
      }
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
      access: 'private',
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
