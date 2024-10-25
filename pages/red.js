export async function getServerSideProps(context) {
  return {
    redirect: {
      destination: '/another-page', // or external URL like 'https://example.com'
      permanent: false, // Set to `true` for a permanent 301 redirect
    },
  };
}

export default function RedirectPage() {
  return null; // This component won’t render as we’re redirecting server-side
}
