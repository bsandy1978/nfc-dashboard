import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaUsers, FaLink, FaSignOutAlt } from 'react-icons/fa';

export default function Navigation() {
  const { data: session } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.isAdmin;

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  if (!session) return null;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-800">
                NFC Dashboard
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  router.pathname === '/dashboard'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Dashboard
              </Link>
              {isAdmin && (
                <>
                  <Link
                    href="/admin/users"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      router.pathname === '/admin/users'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <FaUsers className="mr-2" />
                    Users
                  </Link>
                  <Link
                    href="/admin/nfc-links"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      router.pathname === '/admin/nfc-links'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <FaLink className="mr-2" />
                    NFC Links
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 