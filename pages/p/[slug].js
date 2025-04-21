import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn } from 'next-auth/react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import {
  FaEdit,
  FaLock,
  FaUnlock,
  FaSpinner,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaGlobe,
  FaMapMarkerAlt,
  FaMoneyBill,
} from 'react-icons/fa';

export default function ProfilePage() {
  const router = useRouter();
  const { slug } = router.query;
  const { data: session } = useSession();
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

  const isOwner = session?.user?.email === profile.ownerEmail;

  useEffect(() => {
    if (slug) {
      fetchProfile();
    }
  }, [slug]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/profiles/${slug}`);
      setProfile(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await axios.put(`/api/profiles/${profile.id}`, profile);
      setProfile(response.data);
      setEditMode(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setIsAvatarUploading(true);
      const response = await axios.post(`/api/profiles/${profile.id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setProfile((prev) => ({
        ...prev,
        avatar: response.data.avatar,
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const handleInitialLogin = async () => {
    if (!session) {
      await signIn();
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/profiles/${profile.id}/claim`, {
        email: session.user.email,
      });
      setProfile(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to claim profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">{error}</div>
        <div>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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
                onClick={handleInitialLogin}
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
                    value={typeof window !== 'undefined' ? window.location.href : ''}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 