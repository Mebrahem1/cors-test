// pages/api/cors.js

export default function handler(req, res) {
  const origin = req.headers.origin;

  // Set CORS headers dynamically based on the request's origin
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Handle actual requests
  res.status(200).json({ message: 'CORS-enabled response for specific origin!' });
}
