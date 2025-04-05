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
  ownerDeviceId?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/profiles/${id}`);
        const data: UserProfileData = res.data;
        setProfile(data);

        // Get or generate deviceId
        let deviceId = localStorage.getItem("deviceId");
        if (!deviceId) {
          deviceId = crypto.randomUUID();
          localStorage.setItem("deviceId", deviceId);
        }

        setIsOwner(data.ownerDeviceId === deviceId);
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
