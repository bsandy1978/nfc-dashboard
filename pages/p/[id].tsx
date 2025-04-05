// pages/p/[id].tsx

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

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/profile/${id}`);
        setProfile(res.data);

        const localOwner = localStorage.getItem(`nfc-owner-${id}`);
        if (localOwner === 'true') {
          setIsOwner(true);
        } else if (localOwner === null) {
          localStorage.setItem(`nfc-owner-${id}`, 'true');
          setIsOwner(true);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      await axios.post(`/api/profile/${id}`, profile);
      alert('Profile updated!');
    } catch (err) {
      alert('Save failed.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{isOwner ? 'Edit' : 'View'} Profile</h1>

      <div className="space-y-4">
        {['name', 'title', 'subtitle', 'email', 'linkedin', 'instagram', 'twitter', 'website', 'location', 'upi'].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium capitalize">{field}</label>
            {isOwner ? (
              <input
                name={field}
                value={profile[field as keyof UserProfile] || ''}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            ) : (
              <p className="text-gray-700">{profile[field as keyof UserProfile]}</p>
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