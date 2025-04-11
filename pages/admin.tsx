import axios from 'axios';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [generatedSlug, setGeneratedSlug] = useState<string>('');
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  // Check for admin authorization
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // This would typically check a cookie or session
        // For demo purposes, we're using localStorage
        const adminToken = localStorage.getItem('adminToken');
        setIsAuthorized(adminToken === process.env.NEXT_PUBLIC_ADMIN_TOKEN);
      } catch (err) {
        console.error('Auth check error:', err);
        setIsAuthorized(false);
      }
    };
    
    checkAuth();
  }, []);

  // Improved error handling and link sanitization
  const generateSlug = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/slugs`, null, {
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if you implement authentication
          // 'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (res.data && res.data.slug) {
        setGeneratedSlug(res.data.slug);
        
        // Ensure the link is properly constructed and sanitized
        const baseUrl = window.location.origin;
        const sanitizedSlug = encodeURIComponent(res.data.slug);
        const fullLink = `${baseUrl}/p/${sanitizedSlug}`;
        
        setGeneratedLink(fullLink);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err: any) {
      const errorMessage = err.response?.status === 409
        ? 'Slug collision – please try again.'
        : (err.response?.data?.message || err.message || 'Error generating slug.');
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Login handler for demo purposes
  const handleLogin = () => {
    const password = prompt('Enter admin password:');
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      localStorage.setItem('adminToken', process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'demo-token');
      setIsAuthorized(true);
    } else {
      alert('Invalid password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthorized(false);
  };

  if (!isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Admin Login Required</h1>
        <p className="mb-4">You need to be an admin to access this page.</p>
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Login as Admin
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Slug Generator (Admin)</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:underline"
        >
          Logout
        </button>
      </div>
      
      <button
        onClick={generateSlug}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate New Link'}
      </button>
      
      {generatedSlug && (
        <div className="mt-4 bg-gray-100 p-4 rounded shadow">
          <p className="text-sm">Generated Slug:</p>
          <p className="font-mono text-lg text-blue-700">{generatedSlug}</p>
          <p className="mt-2 text-sm">Embed this link in the NFC card:</p>
          <a
            href={generatedLink}
            className="text-blue-600 underline break-all"
            target="_blank"
            rel="noopener noreferrer"
          >
            {generatedLink}
          </a>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedLink);
                alert('Link copied to clipboard!');
              }}
              className="bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded hover:bg-gray-300"
            >
              Copy Link
            </button>
            <button
              onClick={() => router.push(generatedLink)}
              className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded hover:bg-green-200"
            >
              View Page
            </button>
          </div>
        </div>
      )}
      
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}