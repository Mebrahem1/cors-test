// pages/api/cors.js

export default function handler(req, res) {
  // Set CORS headers to allow any origin
  res.setHeader('Access-Control-Allow-Origin', 'https://www.okx.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    // Respond OK to the preflight check
    res.status(204).end();
    return;
  }

  // Handle actual request
  res.status(200).json({ message: 'CORS-enabled response!' });
}
