import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { FaEdit, FaSave, FaTimes, FaUserPlus } from 'react-icons/fa';

interface ProfileData {
  _id: string;
  name: string;
  bio: string;
  location: string;
  website: string;
  social: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
  isPublic: boolean;
  isClaimed: boolean;
  googleId: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { slug } = router.query;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }
    if (slug) {
      fetchProfile();
    }
  }, [session, status, slug, router]);

  const fetchProfile = async () => {
    if (!session?.backendToken) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/profiles/${slug}`, {
        headers: {
          Authorization: `Bearer ${session.backendToken}`
        }
      });
      
      if (response.data?.data) {
        setProfile(response.data.data);
        setFormData(response.data.data);
        setIsOwner(response.data.isOwner);
      } else {
        setError('Invalid profile data received');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social: { ...prev.social, [platform]: value }
    }));
  };

  const handleSave = async () => {
    if (!session?.backendToken || !profile?._id) {
      setError('Authentication required');
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/profiles/${profile._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${session.backendToken}`
          }
        }
      );
      
      if (response.data?.data) {
        setProfile(response.data.data);
        setIsEditing(false);
        setError('');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleClaim = async () => {
    if (!session?.backendToken || !profile?._id) {
      setError('Authentication required');
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/profiles/${profile._id}/claim`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.backendToken}`
          }
        }
      );
      
      if (response.data?.data) {
        setProfile(response.data.data);
        setIsOwner(true);
        setError('');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Error claiming profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to claim profile');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>;
  
  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
    Error: {error}
  </div>;
  
  if (!profile) return <div className="text-center p-8">Profile not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{profile.name}</h1>
          {isOwner ? (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {isEditing ? <FaTimes /> : <FaEdit />}
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          ) : (
            <div className="text-sm text-gray-500">
              {profile.isClaimed ? 'This profile is claimed' : 'You can claim this profile'}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                pattern="https?://.+"
                title="Please enter a valid URL starting with http:// or https://"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Social Links</h3>
              {Object.entries(profile.social || {}).map(([platform, url]) => (
                <div key={platform}>
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {platform}
                  </label>
                  <input
                    type="url"
                    value={formData.social?.[platform] || ''}
                    onChange={(e) => handleSocialChange(platform, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    pattern="https?://.+"
                    title="Please enter a valid URL starting with http:// or https://"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <FaSave />
              Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">{profile.bio}</p>
            <div className="flex items-center gap-2 text-gray-600">
              <span>📍</span>
              <span>{profile.location}</span>
            </div>
            {profile.website && (
              <div className="flex items-center gap-2">
                <span>🌐</span>
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {profile.website}
                </a>
              </div>
            )}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Social Links</h3>
              <div className="flex flex-wrap gap-4">
                {Object.entries(profile.social || {}).map(([platform, url]) => (
                  url && (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline capitalize"
                    >
                      {platform}
                    </a>
                  )
                ))}
              </div>
            </div>
            {!profile.isClaimed && !isOwner && (
              <button
                onClick={handleClaim}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                <FaUserPlus />
                Claim This Profile
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 