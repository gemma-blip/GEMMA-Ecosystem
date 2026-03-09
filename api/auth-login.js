import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const hash = process.env.ADMIN_PASSWORD_HASH;
  const secret = process.env.ADMIN_JWT_SECRET;

  if (!hash || !secret) {
    console.error('Missing ADMIN_PASSWORD_HASH or ADMIN_JWT_SECRET env vars');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const valid = await bcrypt.compare(password, hash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { admin: true, iat: Math.floor(Date.now() / 1000) },
      secret,
      { expiresIn: '24h' }
    );

    return res.status(200).json({ token, expiresIn: '24h' });
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
