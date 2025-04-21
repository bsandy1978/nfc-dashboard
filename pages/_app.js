import '../styles/globals.css';
import Head from 'next/head';
import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  // Handle global errors
  useEffect(() => {
    const handleError = (event) => {
      console.error('Global error caught:', event.error);
      // You could send this to an error tracking service
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <SessionProvider session={session}>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
        <Head>
          <title>NFC Dashboard - Digital Business Cards</title>
          <meta name="description" content="Create and share your digital business card" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Component {...pageProps} />
      </GoogleOAuthProvider>
    </SessionProvider>
  );
} 