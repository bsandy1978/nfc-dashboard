import axios from 'axios';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';
import { GoogleLogin } from '@react-oauth/google';

interface SlugData {
  slug: string;
  createdAt: string;
  lastAccessed: string;
  accessCount: number;
}

export default function AdminPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [slugs, setSlugs] = useState<SlugData[]>([]);
  const [generatedSlug, setGeneratedSlug] = useState<string>('');
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSlugs();
    }
  }, [status]);

  const fetchSlugs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/slugs`, {
        headers: {
          'Authorization': session?.user?.email ? `Bearer ${session.user.email}` : undefined
        }
      });
      setSlugs(response.data);
    } catch (error) {
      console.error('Error fetching slugs:', error);
      setError('Failed to fetch slugs. Please try again.');
    }
  };

  const generateSlug = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/slugs`, null, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session?.user?.email ? `Bearer ${session.user.email}` : undefined
        }
      });
      
      if (response.data && response.data.slug) {
        setGeneratedSlug(response.data.slug);
        const baseUrl = window.location.origin;
        const sanitizedSlug = encodeURIComponent(response.data.slug);
        const fullLink = `${baseUrl}/p/${sanitizedSlug}`;
        setGeneratedLink(fullLink);
        // Refresh the slugs list
        fetchSlugs();
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error generating slug');
    } finally {
      setLoading(false);
    }
  };

  const deleteSlug = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete the slug "${slug}"?`)) {
      return;
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/api/slugs/${slug}`, {
        headers: {
          'Authorization': session?.user?.email ? `Bearer ${session.user.email}` : undefined
        }
      });
      // Refresh the slugs list
      fetchSlugs();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error deleting slug');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        setError('Failed to copy to clipboard');
      });
  };

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl mb-4">Admin Dashboard</h1>
        <p className="mb-4">Please sign in to access the admin features</p>
        <GoogleLogin
          onSuccess={(response) => {
            signIn('google', { 
              callbackUrl: window.location.href,
              redirect: true
            });
          }}
          onError={() => {
            setError('Login failed');
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">Logged in as: {session.user?.email}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>

      <div className="mb-8">
        <button
          onClick={generateSlug}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate New Slug'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {generatedLink && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Generated Link:</p>
          <div className="flex items-center mt-2">
            <a href={generatedLink} className="underline break-all" target="_blank" rel="noopener noreferrer">
              {generatedLink}
            </a>
            <button 
              onClick={() => copyToClipboard(generatedLink)}
              className="ml-2 bg-green-200 text-green-800 px-2 py-1 rounded text-sm"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Accessed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {slugs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No slugs found. Generate a new slug to get started.
                </td>
              </tr>
            ) : (
              slugs.map((slug) => (
                <tr key={slug.slug}>
                  <td className="px-6 py-4 whitespace-nowrap">{slug.slug}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(slug.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(slug.lastAccessed).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{slug.accessCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => deleteSlug(slug.slug)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}