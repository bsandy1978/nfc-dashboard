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
} from "react-icons/fa";
import { EnvelopeIcon } from '@heroicons/react/24/outline';

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
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return;

    const fetchProfile = async () => {
      try {
        const url = `${API_BASE_URL}/api/profile/slug/${slug}`;
        console.log("Fetching profile from:", url);
        const res = await axios.get(url);
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
        console.error("Profile fetch error:", err);
        setErrorMessage("Error fetching profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [slug, API_BASE_URL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSave = async () => {
    if (!profile || !slug) return;
    try {
      const deviceId = localStorage.getItem("deviceId") || "";
      const url = `${API_BASE_URL}/api/profile/slug/${slug}`;
      console.log("Saving profile to:", url);
      const res = await axios.post(url, {
        ...profile,
        deviceId,
      });
      alert("Profile updated!");
      setProfile(res.data);
    } catch (err: any) {
      alert("Error saving profile: " + err.message);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (errorMessage) return <div className="p-6 text-red-500">{errorMessage}</div>;
  if (!profile) return <div className="p-6">Profile not found.</div>;

  const fields: (keyof UserProfile)[] = [
    "name",
    "title",
    "subtitle",
    "email",
    "linkedin",
    "instagram",
    "twitter",
    "website",
    "location",
    "upi",
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors text-gray-800 dark:text-gray-100">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{isOwner ? "Edit" : "View"} Profile</h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 ring-1 ring-blue-100 dark:ring-blue-900">
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <img
                src={profile.avatar || "https://i.pravatar.cc/150?img=65"}
                alt="Avatar"
                className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-700 shadow-xl cursor-pointer hover:scale-105 transition duration-300"
                onClick={() =>
                  isOwner && document.getElementById("fileInput")?.click()
                }
              />
              {/* You can add a spinner here if needed */}
            </div>
            <input
              type="file"
              id="fileInput"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setProfile({ ...profile, avatar: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />

            {isOwner ? (
              <>
                <input
                  name="name"
                  value={profile.name || ""}
                  onChange={handleChange}
                  className="text-lg font-semibold text-center bg-transparent border-b dark:text-white"
                />
                <input
                  name="title"
                  value={profile.title || ""}
                  onChange={handleChange}
                  className="text-sm text-center bg-transparent border-b dark:text-gray-300"
                />
                <input
                  name="subtitle"
                  value={profile.subtitle || ""}
                  onChange={handleChange}
                  className="text-xs text-center bg-transparent border-b dark:text-gray-400"
                />
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold text-center dark:text-white">{profile.name}</h1>
                <p className="text-sm text-center dark:text-gray-300">{profile.title}</p>
                <p className="text-xs text-center dark:text-gray-400">{profile.subtitle}</p>
              </>
            )}

            <div className="flex w-full gap-2 mt-3">
              {isOwner && (
                <button
                  onClick={handleSave}
                  className="flex-1 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-md flex justify-center items-center gap-1"
                >
                  <FaEdit className="text-lg" /> Edit/Save Profile
                </button>
              )}
              <button
                onClick={() => {
                  const vcf = `BEGIN:VCARD
VERSION:3.0
FN:${profile.name}
TITLE:${profile.title}
EMAIL:${profile.email}
URL:${profile.website}
END:VCARD`.trim();
                  const blob = new Blob([vcf], { type: "text/vcard" });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = `${profile.name?.replace(/ /g, "_")}.vcf`;
                  link.click();
                }}
                className="flex-1 border border-blue-500 text-blue-500 px-3 py-2 rounded-md flex items-center justify-center"
              >
                <FaDownload />
              </button>
              <button
                onClick={() => {
                  const shareData = {
                    title: "My Virtual Card",
                    text: `Check out ${profile.name}'s virtual card!`,
                    url: window.location.href,
                  };
                  if (navigator.share) {
                    navigator.share(shareData).catch(() =>
                      alert("Sharing failed!")
                    );
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }
                }}
                className="flex-1 border border-green-500 text-green-500 px-3 py-2 rounded-md flex items-center justify-center"
              >
                <FaShareAlt />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold dark:text-white mb-2">Scan to download vCard</p>
              <QRCodeCanvas
                value={`BEGIN:VCARD\nVERSION:3.0\nFN:${profile.name}\nTITLE:${profile.title}\nEMAIL:${profile.email}\nURL:${profile.website}\nEND:VCARD`}
                size={128}
              />
            </div>
          </div>

          <div className="mt-6 divide-y divide-gray-200 dark:divide-gray-700">
            {[
              { label: "Email", field: "email", buildLink: (val: string) => `mailto:${val}` },
              { label: "Instagram", field: "instagram", buildLink: (val: string) => `https://instagram.com/${val.replace("@", "")}` },
              { label: "LinkedIn", field: "linkedin", buildLink: (val: string) => `https://linkedin.com/in/${val}` },
              { label: "Twitter", field: "twitter", buildLink: (val: string) => `https://twitter.com/${val.replace("@", "")}` },
              { label: "Website", field: "website", buildLink: (val: string) => `https://${val}` },
              { label: "Location", field: "location", buildLink: (val: string) => `https://maps.google.com/?q=${val}` },
              { label: "UPI", field: "upi", buildLink: (val: string) => `upi://pay?pa=${val}` },
            ].map((item) => {
              const value = profile[item.field as keyof UserProfile] || "";
              const link = item.buildLink(value);
              return (
                <div key={item.field} className="flex items-center gap-3 py-3 group hover:bg-blue-50 dark:hover:bg-gray-700 transition px-3">
                  <div className="text-2xl w-10 h-10 flex justify-center items-center rounded-full bg-white dark:bg-gray-800 shadow-md">
                    {/* Icon placeholder: you can replace with your specific icons */}
                    <span className="text-xl">{item.label.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-1">{item.label}</p>
                    {isOwner ? (
                      <input
                        name={item.field}
                        value={value}
                        onChange={(e) =>
                          handleChange(
                            item.field as keyof UserProfile,
                            (e.target as HTMLInputElement).value
                          )
                        }
                        className="text-xs bg-transparent border-b w-full focus:outline-none dark:text-white"
                      />
                    ) : (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline break-all"
                      >
                        {value}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t pt-4">
            <h3 className="text-md font-semibold mb-2 dark:text-white">Schedule a Call</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                alert("Appointment functionality not implemented in this demo.");
              }}
              className="space-y-3"
            >
              <input
                type="text"
                placeholder="Your Name"
                className="w-full text-sm p-2 border rounded-md dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:border-gray-700"
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full text-sm p-2 border rounded-md dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:border-gray-700"
                required
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  className="w-1/2 text-sm p-2 border rounded-md dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                  required
                />
                <input
                  type="time"
                  className="w-1/2 text-sm p-2 border rounded-md dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm py-2 rounded-md"
              >
                Book Appointment
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}