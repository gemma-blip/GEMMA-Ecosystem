const jwt = require('jsonwebtoken');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1] || req.body?.token;

  if (!token) {
    return res.status(401).json({ valid: false, error: 'No token provided' });
  }

  const secret = process.env.ADMIN_JWT_SECRET;

  try {
    const decoded = jwt.verify(token, secret);
    return res.status(200).json({ valid: true, exp: decoded.exp });
  } catch (err) {
    return res.status(401).json({ valid: false, error: 'Invalid or expired token' });
  }
};
