import { useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      // Redirect to dashboard if already logged in
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      // Prompt for Google login if not authenticated
      signIn('google', { callbackUrl: '/dashboard' });
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">NFC Dashboard</h1>
        <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
          Create your personalized digital business card with NFC technology.
        </p>
        
        {status === 'loading' ? (
          <div className="animate-pulse">
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-48 mx-auto"></div>
          </div>
        ) : status === 'unauthenticated' ? (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">Please sign in to continue.</p>
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="bg-white text-gray-800 px-6 py-3 rounded-md shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors"
            >
              Sign in with Google
            </button>
          </div>
        ) : (
          <div className="animate-pulse">
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-48 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}