import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { FaSave } from 'react-icons/fa';

export default function CreateProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    social: {},
    isPublic: true
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/api/auth/signin');
    }
  }, [session, status]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: e.target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSocialChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      social: { ...prev.social, [platform]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/profiles`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${session.user.backendToken}`
          }
        }
      );
      router.push(`/profile/${response.data.data.id}`);
    } catch (err) {
      console.error('Profile creation error:', err);
      setError(err.response?.data?.error || 'Failed to create profile. Please try again.');
      setLoading(false);
    }
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Create Your Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Social Links</h3>
            {['twitter', 'facebook', 'linkedin', 'instagram'].map((platform) => (
              <div key={platform}>
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {platform}
                </label>
                <input
                  type="url"
                  value={formData.social[platform] || ''}
                  onChange={(e) => handleSocialChange(platform, e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Make profile public
            </label>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            <FaSave />
            {loading ? 'Creating...' : 'Create Profile'}
          </button>
        </form>
      </div>
    </div>
  );
} 