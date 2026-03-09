import { scryptSync, timingSafeEqual } from 'crypto';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');

function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;

  const computed = scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(computed, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const envHash = process.env.ADMIN_PASSWORD_HASH;
  const secret = process.env.ADMIN_JWT_SECRET;

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const password = body?.password;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (!envHash || !secret) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const valid = verifyPassword(password, envHash);

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
    return res.status(500).json({
      error: 'Authentication failed',
      msg: String(err),
      hashLen: envHash?.length,
      hasColon: envHash?.includes(':')
    });
  }
}
