// pages/p/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Home from '../index'; // Using your existing UI as a base

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  const [profile, setProfile] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/profile/${id}`);
        setProfile(res.data);

        const key = `nfc-owner-${id}`;
        const localOwner = localStorage.getItem(key);
        if (localOwner === 'true') {
          setIsOwner(true);
        } else if (localOwner === null) {
          // First-time viewer
          localStorage.setItem(key, 'true');
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

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
  if (!profile) return <div className="p-10 text-center text-red-500">Profile not found.</div>;

  return <Home initialData={profile} initialEditMode={isOwner} />;
}