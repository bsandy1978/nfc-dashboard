// pages/p/[slug].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import {
  FaMoon,
  FaSun,
  FaDownload,
  FaEdit,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaGlobe,
  FaMapMarkerAlt,
  FaMoneyBill,
  FaShareAlt,
  FaSpinner,
  FaLock,
  FaUnlock,
} from "react-icons/fa";
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { useSession, signIn } from 'next-auth/react';

interface UserProfile {
  id: string;
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
  ownerEmail: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { slug } = router.query;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { data: session, status } = useSession();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // Fetch profile data when slug is available
  useEffect(() => {
    if (!slug) return;

    const fetchProfile = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const response = await axios.get(`${API_BASE_URL}/api/profiles/${slug}`);
        if (response.data) {
          setProfile(response.data);
          
          // Check if the current user is the owner
          if (session?.user?.email === response.data.ownerEmail) {
            setIsOwner(true);
          }
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        if (error.response?.status === 404) {
          setErrorMessage("Profile not found. It may have been deleted or the link is incorrect.");
        } else {
          setErrorMessage("Failed to load profile. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [slug, session?.user?.email, API_BASE_URL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };

  const handleSave = async () => {
    if (!profile || !isOwner) return;
    
    setLoading(true);
    setErrorMessage("");
    
    try {
      const response = await axios.put(`${API_BASE_URL}/api/profiles/${slug}`, profile, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session?.user?.email ? `Bearer ${session.user.email}` : undefined
        }
      });
      
      if (response.data) {
        setProfile(response.data);
        setEditMode(false);
        alert("Profile updated successfully!");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setErrorMessage(error.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile || !isOwner) return;
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsAvatarUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await axios.post(`${API_BASE_URL}/api/profiles/${slug}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': session?.user?.email ? `Bearer ${session.user.email}` : undefined
        }
      });
      
      if (response.data && response.data.avatar) {
        setProfile({
          ...profile,
          avatar: response.data.avatar
        });
      }
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      setErrorMessage(error.response?.data?.message || "Failed to upload avatar. Please try again.");
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const handleClaimOwnership = async () => {
    if (!session?.user?.email) {
      signIn('google', { callbackUrl: window.location.href });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/profiles/${slug}/claim`, null, {
        headers: {
          'Authorization': `Bearer ${session.user.email}`
        }
      });
      
      if (response.data) {
        setProfile(response.data);
        setIsOwner(true);
        alert("Successfully claimed ownership of this profile!");
      }
    } catch (error: any) {
      console.error("Error claiming ownership:", error);
      setErrorMessage(error.response?.data?.message || "Failed to claim ownership. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{errorMessage}</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
          <p>The profile you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{profile.name || "Profile"}</h1>
            {!isOwner && !profile.ownerEmail && (
              <button
                onClick={handleClaimOwnership}
                className="text-blue-500 hover:text-blue-700 flex items-center gap-2"
              >
                <FaLock /> Claim Ownership
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => setEditMode(!editMode)}
                className="text-blue-500 hover:text-blue-700 flex items-center gap-2"
              >
                {editMode ? (
                  <>
                    <FaUnlock /> Cancel
                  </>
                ) : (
                  <>
                    <FaEdit /> Edit
                  </>
                )}
              </button>
            )}
          </div>
          
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img
                src={profile.avatar || "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {isOwner && editMode && (
                <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  {isAvatarUploading ? <FaSpinner className="animate-spin" /> : "Change"}
                </label>
              )}
            </div>
            
            {editMode ? (
              <>
                <input
                  type="text"
                  name="name"
                  value={profile.name || ""}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="mt-4 w-full p-2 border rounded"
                />
                <input
                  type="text"
                  name="title"
                  value={profile.title || ""}
                  onChange={handleChange}
                  placeholder="Your Title"
                  className="mt-2 w-full p-2 border rounded"
                />
                <input
                  type="text"
                  name="subtitle"
                  value={profile.subtitle || ""}
                  onChange={handleChange}
                  placeholder="Your Subtitle"
                  className="mt-2 w-full p-2 border rounded"
                />
                <button
                  onClick={handleSave}
                  className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <h2 className="mt-4 text-xl font-semibold">{profile.name}</h2>
                <p className="text-gray-600">{profile.title}</p>
                <p className="text-sm text-gray-500">{profile.subtitle}</p>
              </>
            )}
          </div>

          <div className="space-y-4">
            {profile.email && (
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-500 mr-2" />
                {editMode ? (
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="flex-1 p-2 border rounded"
                  />
                ) : (
                  <a href={`mailto:${profile.email}`} className="text-blue-500 hover:underline">
                    {profile.email}
                  </a>
                )}
              </div>
            )}
            
            {profile.instagram && (
              <div className="flex items-center">
                <FaInstagram className="h-5 w-5 text-pink-500 mr-2" />
                {editMode ? (
                  <input
                    type="text"
                    name="instagram"
                    value={profile.instagram}
                    onChange={handleChange}
                    className="flex-1 p-2 border rounded"
                  />
                ) : (
                  <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {profile.instagram}
                  </a>
                )}
              </div>
            )}
            
            {profile.linkedin && (
              <div className="flex items-center">
                <FaLinkedin className="h-5 w-5 text-blue-700 mr-2" />
                {editMode ? (
                  <input
                    type="text"
                    name="linkedin"
                    value={profile.linkedin}
                    onChange={handleChange}
                    className="flex-1 p-2 border rounded"
                  />
                ) : (
                  <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {profile.linkedin}
                  </a>
                )}
              </div>
            )}
            
            {profile.twitter && (
              <div className="flex items-center">
                <FaTwitter className="h-5 w-5 text-sky-400 mr-2" />
                {editMode ? (
                  <input
                    type="text"
                    name="twitter"
                    value={profile.twitter}
                    onChange={handleChange}
                    className="flex-1 p-2 border rounded"
                  />
                ) : (
                  <a href={`https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {profile.twitter}
                  </a>
                )}
              </div>
            )}
            
            {profile.website && (
              <div className="flex items-center">
                <FaGlobe className="h-5 w-5 text-gray-500 mr-2" />
                {editMode ? (
                  <input
                    type="text"
                    name="website"
                    value={profile.website}
                    onChange={handleChange}
                    className="flex-1 p-2 border rounded"
                  />
                ) : (
                  <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {profile.website}
                  </a>
                )}
              </div>
            )}
            
            {profile.location && (
              <div className="flex items-center">
                <FaMapMarkerAlt className="h-5 w-5 text-red-500 mr-2" />
                {editMode ? (
                  <input
                    type="text"
                    name="location"
                    value={profile.location}
                    onChange={handleChange}
                    className="flex-1 p-2 border rounded"
                  />
                ) : (
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(profile.location)}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {profile.location}
                  </a>
                )}
              </div>
            )}
            
            {profile.upi && (
              <div className="flex items-center">
                <FaMoneyBill className="h-5 w-5 text-green-500 mr-2" />
                {editMode ? (
                  <input
                    type="text"
                    name="upi"
                    value={profile.upi}
                    onChange={handleChange}
                    className="flex-1 p-2 border rounded"
                  />
                ) : (
                  <a href={`upi://pay?pa=${profile.upi}`} className="text-blue-500 hover:underline">
                    {profile.upi}
                  </a>
                )}
              </div>
            )}
          </div>

          {isOwner && (
            <div className="mt-6 pt-4 border-t">
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="text-blue-500 hover:text-blue-700"
              >
                {showQRCode ? "Hide QR Code" : "Show QR Code"}
              </button>
              
              {showQRCode && (
                <div className="mt-4 flex flex-col items-center">
                  <QRCodeCanvas
                    value={window.location.href}
                    size={200}
                  />
                  <p className="mt-2 text-sm text-gray-500">Scan to view this profile</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
