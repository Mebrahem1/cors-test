export async function getServerSideProps(context) {
  return {
    redirect: {
      destination: '/another-page', // or external URL like 'https://example.com'
      permanent: false, // Set to `true` for a permanent 301 redirect
    },
  };
}

export default function RedirectPage() {
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
  return null; // This component won’t render as we’re redirecting server-side
}
