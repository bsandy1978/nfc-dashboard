import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { FaEdit, FaSave, FaTrash, FaPlus, FaUserPlus } from 'react-icons/fa';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newDashboard, setNewDashboard] = useState({ name: '', description: '', theme: 'default' });
  const [isCreating, setIsCreating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (session?.user?.email) {
      // Check if user email is in admin list
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
      setIsAdmin(adminEmails.includes(session.user.email));
    }
  }, [session]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn('google', { callbackUrl: '/dashboard' });
    }
  }, [status]);

  // Fetch user's dashboards
  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboards();
    }
  }, [status]);

  const fetchDashboards = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/dashboards`, {
        withCredentials: true
      });
      setDashboards(response.data);
    } catch (err) {
      console.error('Error fetching dashboards:', err);
      setError('Failed to load your dashboards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDashboard = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/dashboards`, newDashboard, {
        withCredentials: true
      });
      
      setDashboards([...dashboards, response.data]);
      setNewDashboard({ name: '', description: '', theme: 'default' });
      setIsCreating(false);
    } catch (err) {
      console.error('Error creating dashboard:', err);
      setError('Failed to create dashboard. Please try again.');
    }
  };

  const handleDeleteDashboard = async (id) => {
    if (!confirm('Are you sure you want to delete this dashboard?')) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/api/dashboards/${id}`, {
        withCredentials: true
      });
      
      setDashboards(dashboards.filter(dashboard => dashboard._id !== id));
    } catch (err) {
      console.error('Error deleting dashboard:', err);
      setError('Failed to delete dashboard. Please try again.');
    }
  };

  const handleEditDashboard = (id) => {
    router.push(`/dashboard/edit/${id}`);
  };

  const handleViewDashboard = (id) => {
    router.push(`/p/${id}`);
  };

  const handleClaimDashboard = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/profiles/${id}/claim`, {}, {
        headers: {
          'Authorization': `Bearer ${session?.user?.email}`
        }
      });
      
      // Refresh dashboards after claiming
      fetchDashboards();
    } catch (err) {
      console.error('Error claiming dashboard:', err);
      setError('Failed to claim dashboard. Please try again.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Please log in to continue.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Dashboards</h1>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            <FaPlus />
            Create Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isCreating && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Create New Dashboard</h2>
            <form onSubmit={handleCreateDashboard}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newDashboard.name}
                  onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={newDashboard.description}
                  onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Theme</label>
                <select
                  value={newDashboard.theme}
                  onChange={(e) => setNewDashboard({ ...newDashboard, theme: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="default">Default</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  <FaSave />
                  Create
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : dashboards.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">You don't have any dashboards yet.</p>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mx-auto"
            >
              <FaPlus />
              Create Your First Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards.map((dashboard) => (
              <div key={dashboard._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{dashboard.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{dashboard.description || 'No description'}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Created: {new Date(dashboard.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDashboard(dashboard._id)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditDashboard(dashboard._id)}
                        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        <FaEdit />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteDashboard(dashboard._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 