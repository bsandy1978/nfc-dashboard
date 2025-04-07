// pages/p/[slug].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface UserProfile {
  slug: string;
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
  ownerDeviceId: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { slug } = router.query;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  useEffect(() => {
    if (!slug || typeof slug !== 'string') return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/profile/slug/${slug}`);
        setProfile(res.data);

        // Ownership check: first visitor becomes owner.
        const ownerKey = `nfc-owner-${slug}`;
        const localOwner = localStorage.getItem(ownerKey);
        if (localOwner === 'true') {
          setIsOwner(true);
        } else if (localOwner === null) {
          localStorage.setItem(ownerKey, 'true');
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
  }, [slug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSave = async () => {
    if (!profile || !slug) return;
    try {
      const deviceId = localStorage.getItem("deviceId") || "";
      const res = await axios.post(`${API_BASE_URL}/api/profile/slug/${slug}`, {
        ...profile,
        deviceId,
      });      
      alert('Profile updated!');
      setProfile(res.data);
    } catch (err: any) {
      alert('Error saving profile: ' + err.message);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (errorMessage) return <div className="p-6 text-red-500">{errorMessage}</div>;
  if (!profile) return <div className="p-6">Profile not found.</div>;

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