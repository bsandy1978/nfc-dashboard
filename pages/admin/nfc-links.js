import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { FaPlus, FaTrash, FaCheck, FaTimes, FaQrcode, FaCopy, FaEdit } from 'react-icons/fa';
import { QRCodeCanvas } from 'qrcode.react';
import Navigation from '../../components/Navigation';

export default function NfcLinks() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  const [nfcLinks, setNfcLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [newSlug, setNewSlug] = useState('');

  // Check if user is admin
  useEffect(() => {
    if (session?.user?.email) {
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
      const isUserAdmin = adminEmails.includes(session.user.email);
      setIsAdmin(isUserAdmin);
      
      // Only redirect if not admin and not loading
      if (!isUserAdmin && status !== 'loading') {
        router.push('/dashboard');
      }
    }
  }, [session, status, router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Fetch NFC links if admin
  useEffect(() => {
    if (status === 'authenticated' && isAdmin) {
      fetchNfcLinks();
    }
  }, [status, isAdmin]);

  const fetchNfcLinks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/nfc-links`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.email}`
        }
      });
      
      if (response.data?.success) {
        setNfcLinks(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching NFC links:', err);
      setError('Failed to load NFC links. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    try {
      setGenerating(true);
      const response = await axios.post(`${API_BASE_URL}/api/nfc-links`, {}, {
        headers: {
          'Authorization': `Bearer ${session?.user?.email}`
        }
      });
      
      if (response.data?.success) {
        setNfcLinks([response.data.data, ...nfcLinks]);
      }
    } catch (err) {
      console.error('Error generating NFC link:', err);
      setError('Failed to generate NFC link. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeactivateLink = async (slug) => {
    if (!confirm('Are you sure you want to deactivate this NFC link?')) return;
    
    try {
      const response = await axios.put(`${API_BASE_URL}/api/nfc-links/${slug}/deactivate`, {}, {
        headers: {
          'Authorization': `Bearer ${session?.user?.email}`
        }
      });
      
      if (response.data?.success) {
        setNfcLinks(nfcLinks.map(link => 
          link.slug === slug ? { ...link, isActive: false } : link
        ));
      }
    } catch (err) {
      console.error('Error deactivating NFC link:', err);
      setError('Failed to deactivate NFC link. Please try again.');
    }
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  const handleShowQRCode = (link) => {
    setSelectedLink(link);
    setShowQRCode(true);
  };

  const createLink = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/nfc-links`, { slug: newSlug }, {
        headers: {
          'Authorization': `Bearer ${session?.user?.email}`
        }
      });

      if (response.data?.success) {
        setNewSlug('');
        setNfcLinks([response.data.data, ...nfcLinks]);
      }
    } catch (error) {
      console.error('Error creating link:', error);
      setError('Failed to create NFC link');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-4">Please sign in to continue.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">You do not have permission to access this page.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">NFC Links Management</h1>
            <button
              onClick={handleGenerateLink}
              disabled={generating}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {generating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              ) : (
                <FaPlus />
              )}
              Generate New Link
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={createLink} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="Enter slug (e.g., meeting-room-1)"
                className="flex-1 p-2 border rounded"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
              >
                <FaPlus /> Create Link
              </button>
            </div>
          </form>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : nfcLinks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No NFC links found.</p>
              <button
                onClick={handleGenerateLink}
                disabled={generating}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mx-auto disabled:opacity-50"
              >
                {generating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <FaPlus />
                )}
                Generate Your First NFC Link
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Slug</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Link</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assigned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {nfcLinks.map((link) => (
                    <tr key={link.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{link.slug}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <span className="truncate max-w-xs">{link.link}</span>
                          <button
                            onClick={() => handleCopyLink(link.link)}
                            className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Copy link"
                          >
                            <FaCopy />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          link.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {link.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {link.isAssigned ? (
                          <div>
                            <div className="flex items-center">
                              <FaCheck className="text-green-500 mr-1" />
                              <span>{link.assignedTo}</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(link.assignedAt).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <FaTimes className="mr-1" />
                            <span>Unassigned</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(link.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleShowQRCode(link.link)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Show QR Code"
                          >
                            <FaQrcode />
                          </button>
                          {link.isActive && (
                            <button
                              onClick={() => handleDeactivateLink(link.slug)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Deactivate"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && selectedLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">QR Code for NFC Card</h2>
            <div className="flex justify-center mb-4">
              <QRCodeCanvas value={selectedLink} size={200} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
              Scan this QR code to write to your NFC card
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowQRCode(false)}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 