// pages/api/cors.js

export default function handler(req, res) {
  // Set CORS headers to allow any origin
  res.setHeader('Access-Control-Allow-Origin', 'https://www.okx.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Respond to the request
  res.status(200).json({ message: 'CORS-enabled response!' });
}
