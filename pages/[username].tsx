// /pages/u/[username].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaGlobe,
  FaMapMarkerAlt,
  FaMoneyBill,
} from "react-icons/fa";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

export default function UserPublicProfile() {
  const router = useRouter();
  const { username } = router.query;
  const [profile, setProfile] = useState<any>(null);
  const [isEditable, setIsEditable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    // Check or generate device UID
    let deviceId = localStorage.getItem("device_id");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("device_id", deviceId);
    }

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/u/${username}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
        // Check if this device already owns the profile
        const claimedId = localStorage.getItem(`claimed_${data.username}`);
        if (claimedId === deviceId) {
          setIsEditable(true);
        }
      })
      .catch((err) => {
        console.error("Error loading profile", err);
        setLoading(false);
      });
  }, [username]);

  const claimProfile = () => {
    const deviceId = localStorage.getItem("device_id");
    if (!deviceId || !profile?.username) return;
    localStorage.setItem(`claimed_${profile.username}`, deviceId);
    setIsEditable(true);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!profile) return <div className="p-4 text-red-600">❌ User not found</div>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 transition-colors">
      <div className="max-w-md mx-auto p-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl mt-6">
        <div className="flex flex-col items-center space-y-3">
          <img src={profile.avatar} alt="Avatar" className="w-28 h-28 rounded-full shadow border-4 border-white dark:border-gray-700" />
          <h1 className="text-xl font-bold text-center">{profile.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-300 text-center">{profile.title}</p>
          <p className="text-xs text-gray-400 text-center">{profile.subtitle}</p>

          {isEditable ? (
            <p className="mt-2 text-xs text-green-500">Edit access granted on this device.</p>
          ) : (
            <button
              onClick={claimProfile}
              className="mt-2 text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:brightness-110"
            >
              Claim and Edit This Profile
            </button>
          )}
        </div>

        <div className="mt-6 divide-y divide-gray-200 dark:divide-gray-700">
          <ContactRow icon={<EnvelopeIcon className="w-5 h-5 text-blue-500" />} label="Email" value={profile.email} link={`mailto:${profile.email}`} />
          <ContactRow icon={<FaInstagram className="text-pink-500 text-xl" />} label="Instagram" value={profile.instagram} link={`https://instagram.com/${profile.instagram.replace("@", "")}`} />
          <ContactRow icon={<FaLinkedin className="text-blue-700 text-xl" />} label="LinkedIn" value={profile.linkedin} link={`https://linkedin.com/in/${profile.linkedin}`} />
          <ContactRow icon={<FaTwitter className="text-sky-500 text-xl" />} label="Twitter" value={profile.twitter} link={`https://twitter.com/${profile.twitter.replace("@", "")}`} />
          <ContactRow icon={<FaGlobe className="text-gray-600 text-xl" />} label="Website" value={profile.website} link={profile.website} />
          <ContactRow icon={<FaMapMarkerAlt className="text-red-500 text-xl" />} label="Location" value={profile.location} link={`https://maps.google.com/?q=${profile.location}`} />
          <ContactRow icon={<FaMoneyBill className="text-green-500 text-xl" />} label="UPI" value={profile.upi} link={`upi://pay?pa=${profile.upi}`} />
        </div>
      </div>
    </main>
  );
}

function ContactRow({ icon, label, value, link }: { icon: React.ReactNode; label: string; value: string; link: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-3 px-2 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition">
      <div className="w-10 h-10 flex justify-center items-center bg-white dark:bg-gray-700 rounded-full shadow">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold mb-1">{label}</p>
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
          {value}
        </a>
      </div>
    </div>
  );
}