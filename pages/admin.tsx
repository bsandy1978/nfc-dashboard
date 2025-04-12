import axios from 'axios';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';
import { GoogleLogin } from '@react-oauth/google';
import { FaPlus, FaTrash, FaCopy, FaQrcode } from 'react-icons/fa';

interface DashboardData {
  id: string;
  name: string;
  description: string;
  slug: string;
  createdAt: string;
  ownerEmail: string | null;
  accessCount: number;
}

export default function AdminPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [dashboards, setDashboards] = useState<DashboardData[]>([]);
  const [newDashboard, setNewDashboard] = useState({ name: '', description: '' });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboards();
    }
  }, [status]);

  const fetchDashboards = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dashboards`, {
        headers: {
          'Authorization': session?.user?.email ? `Bearer ${session.user.email}` : undefined
        }
      });
      setDashboards(response.data);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      setError('Failed to fetch dashboards. Please try again.');
    }
  };

  const handleCreateDashboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/dashboards`, newDashboard, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session?.user?.email ? `Bearer ${session.user.email}` : undefined
        }
      });
      
      if (response.data) {
        setDashboards([...dashboards, response.data]);
        setNewDashboard({ name: '', description: '' });
        setShowCreateForm(false);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error creating dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDashboard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dashboard?')) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/api/dashboards/${id}`, {
        headers: {
          'Authorization': session?.user?.email ? `Bearer ${session.user.email}` : undefined
        }
      });
      setDashboards(dashboards.filter(d => d.id !== id));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error deleting dashboard');
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
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <FaPlus /> {showCreateForm ? 'Cancel' : 'Create New Dashboard'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Dashboard</h2>
          <form onSubmit={handleCreateDashboard}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Dashboard Name
              </label>
              <input
                type="text"
                id="name"
                value={newDashboard.name}
                onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                value={newDashboard.description}
                onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows={3}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Dashboard'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dashboards.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No dashboards found. Create a new dashboard to get started.
                </td>
              </tr>
            ) : (
              dashboards.map((dashboard) => (
                <tr key={dashboard.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{dashboard.name}</td>
                  <td className="px-6 py-4">{dashboard.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{dashboard.ownerEmail || 'Unclaimed'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{dashboard.accessCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => copyToClipboard(`${window.location.origin}/p/${dashboard.slug}`)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Copy Link"
                    >
                      <FaCopy />
                    </button>
                    <button
                      onClick={() => window.open(`${window.location.origin}/p/${dashboard.slug}`, '_blank')}
                      className="text-green-600 hover:text-green-900"
                      title="View QR Code"
                    >
                      <FaQrcode />
                    </button>
                    <button
                      onClick={() => handleDeleteDashboard(dashboard.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Dashboard"
                    >
                      <FaTrash />
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