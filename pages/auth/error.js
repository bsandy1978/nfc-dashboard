import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AuthError() {
  const router = useRouter();
  const { error } = router.query;

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  const getErrorMessage = (errorCode) => {
    if (!errorCode) return 'An unknown error occurred';
    
    const code = Array.isArray(errorCode) ? errorCode[0] : errorCode;
    
    switch (code) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'OAuthSignin':
        return 'Error in constructing an authorization URL.';
      case 'OAuthCallback':
        return 'Error in handling the response from an OAuth provider.';
      case 'OAuthCreateAccount':
        return 'Could not create OAuth provider user in the database.';
      case 'EmailCreateAccount':
        return 'Could not create email provider user in the database.';
      case 'Callback':
        return 'Error in the OAuth callback handler.';
      case 'OAuthAccountNotLinked':
        return 'Email on the account already exists with different credentials.';
      case 'EmailSignin':
        return 'Check your email address.';
      case 'CredentialsSignin':
        return 'Sign in failed. Check the details you provided are correct.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      default:
        return 'An unknown error occurred';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {getErrorMessage(error)}
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error Code: {error}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Please try again or contact support if the problem persists.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
                Return to home page
              </Link>
            </div>
            <div className="text-sm">
              <Link href="/api/auth/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
                Try signing in again
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 