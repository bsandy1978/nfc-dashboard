import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface UserProfile {
  _id: string;
  name?: string;
  title?: string;
  subtitle?: string;
  avatar?: string;
  email?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  location?: string;
  upi?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Safe wrappers for localStorage to ensure these run only on the client
  const safeLocalStorageGetItem = (key: string): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  };

  const safeLocalStorageSetItem = (key: string, value: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  };

  // Helper to generate (or retrieve) a device ID
  const generateDeviceId = () => {
    const existing = safeLocalStorageGetItem("deviceId");
    if (existing) return existing;
    const newId = Math.random().toString(36).substring(2, 15);
    safeLocalStorageSetItem("deviceId", newId);
    return newId;
  };

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/profile/${id}`);
        setProfile(res.data);

        // Ownership check: first visitor becomes owner
        const ownerKey = `nfc-owner-${id}`;
        const localOwner = safeLocalStorageGetItem(ownerKey);
        if (localOwner === 'true') {
          setIsOwner(true);
        } else if (localOwner === null) {
          safeLocalStorageSetItem(ownerKey, 'true');
          setIsOwner(true);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setErrorMessage("Error fetching profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSave = async () => {
    if (!profile || !id) return;
    try {
      const deviceId = generateDeviceId();
      await axios.post(`/api/profile/${id}`, { ...profile, deviceId });
      alert('Profile updated!');
    } catch (err) {
      console.error('Save error:', err);
      alert('Save failed.');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (errorMessage) return <div className="p-6 text-red-500">{errorMessage}</div>;
  if (!profile) return <div className="p-6">Profile not found.</div>;

  // List of fields to display and edit
  const fields: (keyof UserProfile)[] = [
    'name', 'title', 'subtitle', 'email', 'linkedin',
    'instagram', 'twitter', 'website', 'location', 'upi'
  ];

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{isOwner ? 'Edit' : 'View'} Profile</h1>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium capitalize">{field}</label>
            {isOwner ? (
              <input
                name={field}
                value={profile[field] || ''}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            ) : (
              <p className="text-gray-700">{profile[field]}</p>
            )}
          </div>
        ))}
      </div>

      {isOwner && (
        <button
          onClick={handleSave}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Profile
        </button>
      )}
    </div>
  );
}