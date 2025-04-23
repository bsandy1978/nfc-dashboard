import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { FaEdit, FaSave, FaTrash, FaPlus } from 'react-icons/fa';
import Navigation from '../components/Navigation';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newDashboard, setNewDashboard] = useState({ name: '', description: '', theme: 'default' });
  const [isCreating, setIsCreating] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Check if user is admin
  useEffect(() => {
    if (status === 'authenticated' && !session?.user?.isAdmin) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  // Fetch dashboards
  useEffect(() => {
    if (session?.user?.isAdmin) {
      fetchDashboards();
    }
  }, [session]);

  const fetchDashboards = async () => {
    if (!session?.user?.backendToken) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/dashboards`, {
        headers: {
          Authorization: `Bearer ${session.user.backendToken}`
        }
      });
      
      if (response.data?.data) {
        setDashboards(response.data.data);
        setError('');
      } else {
        setError('Invalid dashboard data received');
      }
    } catch (err) {
      console.error('Error fetching dashboards:', err);
      setError(err.response?.data?.error || 'Failed to fetch dashboards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDashboard = async (e) => {
    e.preventDefault();
    if (!session?.user?.backendToken) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/dashboards`,
        newDashboard,
        {
          headers: {
            Authorization: `Bearer ${session.user.backendToken}`
          }
        }
      );
      
      if (response.data?.data) {
        setDashboards([...dashboards, response.data.data]);
        setNewDashboard({ name: '', description: '', theme: 'default' });
        setIsCreating(false);
        setError('');
      } else {
        setError('Invalid dashboard data received');
      }
    } catch (err) {
      console.error('Error creating dashboard:', err);
      setError(err.response?.data?.error || 'Failed to create dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDashboard = async (id) => {
    if (!session?.user?.backendToken) {
      setError('Authentication required');
      return;
    }

    if (!confirm('Are you sure you want to delete this dashboard?')) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/dashboards/${id}`, {
        headers: {
          Authorization: `Bearer ${session.user.backendToken}`
        }
      });
      
      setDashboards(dashboards.filter(dashboard => dashboard._id !== id));
      setError('');
    } catch (err) {
      console.error('Error deleting dashboard:', err);
      setError(err.response?.data?.error || 'Failed to delete dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
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

  if (!session?.user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaPlus className="mr-2" />
              Create Dashboard
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {isCreating && (
            <form onSubmit={handleCreateDashboard} className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newDashboard.name}
                    onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newDashboard.description}
                    onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                    Theme
                  </label>
                  <select
                    id="theme"
                    value={newDashboard.theme}
                    onChange={(e) => setNewDashboard({ ...newDashboard, theme: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="default">Default</option>
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FaSave className="mr-2" />
                    Create
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {dashboards.map((dashboard) => (
                <li key={dashboard._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {dashboard.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">{dashboard.description}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {dashboard.theme}
                        </span>
                        <button
                          onClick={() => handleDeleteDashboard(dashboard._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Owner: {dashboard.owner.name}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Created {new Date(dashboard.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 