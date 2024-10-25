// pages/api/cors.js

export default function handler(req, res) {
  const origin = req.headers.origin;

  // Set CORS headers dynamically based on the request's origin
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  // Allow specific headers requested by the client
  res.setHeader(
    'Access-Control-Allow-Headers', 
    'Content-Type, Authorization, app-type, devid, x-cdn, x-client-signature, x-client-signature-version, x-id-group, x-locale, x-request-timestamp, x-site-info, x-utc, x-zkdex-env'
  );

  // Handle preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Handle actual requests
  res.status(200).json({ message: 'CORS-enabled response for specific origin with credentials allowed!' });
}
