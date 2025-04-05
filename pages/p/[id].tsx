// pages/p/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Home from '../index';

interface UserProfileData {
  _id: string;
  username?: string;
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

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/profile/${id}`);
        const data = res.data;
        setProfile(data);

        // Ownership locking logic
        const localKey = `nfc-owner-${id}`;
        const claimed = localStorage.getItem(localKey);

        if (claimed === 'true') {
          setIsOwner(true);
        } else if (claimed === null) {
          localStorage.setItem(localKey, 'true'); // First visit on this device
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
  if (!profile) return <div className="p-10 text-center text-red-500">Profile not found.</div>;

  return <Home initialData={profile} initialEditMode={isOwner} />;
}