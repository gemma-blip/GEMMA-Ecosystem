import { createRequire } from 'module';
import { createHmac, timingSafeEqual } from 'crypto';

const require = createRequire(import.meta.url);

// Try to load bcryptjs - check version for debugging
let bcrypt;
let bcryptVersion = 'unknown';
try {
  bcrypt = require('bcryptjs');
  const pkg = require('bcryptjs/package.json');
  bcryptVersion = pkg.version;
} catch (e) {
  bcrypt = null;
}

const jwt = require('jsonwebtoken');

// Fallback: HMAC-based password verification
// If bcryptjs fails, we use HMAC-SHA256 with the JWT secret as key
function hmacVerify(password, storedHash, secret) {
  const hmac = createHmac('sha256', secret);
  hmac.update(password);
  const computed = hmac.digest('hex');

  // If stored hash starts with $2, it's bcrypt — can't verify with HMAC
  if (storedHash.startsWith('$2')) return null;

  const a = Buffer.from(computed, 'utf8');
  const b = Buffer.from(storedHash, 'utf8');
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

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const password = body?.password;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const hash = process.env.ADMIN_PASSWORD_HASH;
    const secret = process.env.ADMIN_JWT_SECRET;

    if (!hash || !secret) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    let valid = false;

    // Try bcryptjs first
    if (bcrypt) {
      try {
        valid = await bcrypt.compare(password, hash);
      } catch (bcryptErr) {
        console.error(`bcryptjs v${bcryptVersion} failed:`, bcryptErr.message);
        // bcrypt failed - return error with version info for debugging
        return res.status(500).json({
          error: 'Authentication failed',
          bcryptVersion,
          bcryptError: bcryptErr.message
        });
      }
    } else {
      return res.status(500).json({ error: 'bcryptjs not available' });
    }

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
    return res.status(500).json({ error: 'Authentication failed', debug: String(err) });
  }
}
