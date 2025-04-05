import React, { useEffect, useRef, useState } from "react";
import {
  FaMoon, FaSun, FaDownload, FaEdit, FaInstagram, FaLinkedin, FaTwitter,
  FaGlobe, FaMapMarkerAlt, FaMoneyBill, FaShareAlt, FaSpinner,
} from "react-icons/fa";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { QRCodeCanvas } from "qrcode.react";

interface UserProfileData {
  username?: string;
  name: string;
  title: string;
  subtitle: string;
  avatar: string;
  email: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  website: string;
  location: string;
  upi: string;
  ownerDeviceId?: string;
}

interface AppointmentData {
  name: string;
  email: string;
  date: string;
  time: string;
}

export default function Home() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [darkMode, setDarkMode] = useState(false);
  const [theme, setTheme] = useState<"default" | "ocean" | "forest" | "sunset">("default");
  const [editMode, setEditMode] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [user, setUser] = useState<Partial<UserProfileData>>({});
  const [showQRCode, setShowQRCode] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

  const [appointment, setAppointment] = useState<AppointmentData>({ name: "", email: "", date: "", time: "" });
  const [appointmentError, setAppointmentError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deviceId] = useState(() => {
    const stored = localStorage.getItem("deviceId");
    if (stored) return stored;
    const id = crypto.randomUUID();
    localStorage.setItem("deviceId", id);
    return id;
  });

  const generateUsername = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15) + Math.floor(Math.random() * 1000);

  // Fetch profile from backend
  useEffect(() => {
    const pathname = window.location.pathname;
    const slug = pathname.split("/").pop(); // e.g., "vignesh"

    fetch(`${API_BASE_URL}/api/profiles/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setIsOwner(data.ownerDeviceId === deviceId);
        setEditMode(data.ownerDeviceId === deviceId);
      })
      .catch(() => {
        // Default view for new profile
        setUser({
          name: "Alex Doe",
          title: "Networking Expert",
          subtitle: "Hair stylist from Los Angeles, CA",
          avatar: "https://i.pravatar.cc/150?img=65",
          email: "email@email.com",
          instagram: "@arley",
          linkedin: "arley",
          twitter: "@alexdoe",
          website: "https://www.alexdoe.com",
          location: "Los Angeles, CA",
          upi: "alex@upi",
        });
        setIsOwner(true);
        setEditMode(true);
      });
  }, []);

  const handleChange = (field: keyof UserProfileData, value: string) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAvatarUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser((prev) => ({ ...prev, avatar: reader.result as string }));
        setIsAvatarUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...user,
          username: user.username || generateUsername(user.name || "user"),
          deviceId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      alert("Profile saved!");
      setIsOwner(true);
    } catch (err: any) {
      alert("Error saving: " + err.message);
    }
  };

  const handleEditButtonClick = () => {
    if (!isOwner) {
      alert("You are not the owner.");
      return;
    }
    if (editMode) {
      handleSaveProfile();
      setEditMode(false);
    } else {
      setEditMode(true);
    }
  };
  const themeClasses: Record<typeof theme, string> = {
    default: "bg-gradient-to-b from-gray-100 to-blue-100 dark:from-gray-900 dark:to-gray-800",
    ocean: "bg-gradient-to-b from-blue-200 to-blue-500 dark:from-blue-800 dark:to-blue-900",
    forest: "bg-gradient-to-b from-green-200 to-green-500 dark:from-green-800 dark:to-green-900",
    sunset: "bg-gradient-to-b from-yellow-200 to-pink-500 dark:from-yellow-800 dark:to-pink-900",
  };

  const handleDownloadVCF = () => {
    const vcf = `BEGIN:VCARD\nVERSION:3.0\nFN:${user.name}\nTITLE:${user.title}\nEMAIL:${user.email}\nURL:${user.website}\nEND:VCARD`;
    const blob = new Blob([vcf], { type: "text/vcard" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${user.name?.replace(/ /g, "_")}.vcf`;
    link.click();
  };

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const apptDate = new Date(`${appointment.date}T${appointment.time}`);
    if (apptDate <= new Date()) {
      setAppointmentError("Please choose a future date/time");
      return;
    }

    // Send to your backend...
    alert("Appointment booked!");
    setAppointment({ name: "", email: "", date: "", time: "" });
  };

  return (
    <main className={`min-h-screen ${themeClasses[theme]} text-gray-900 dark:text-white`}>
      <div className="max-w-md mx-auto p-4">
        {/* Header controls */}
        <div className="flex justify-between items-center mb-4">
          <select value={theme} onChange={(e) => setTheme(e.target.value as any)} className="p-1 rounded">
            <option value="default">Default</option>
            <option value="ocean">Ocean</option>
            <option value="forest">Forest</option>
            <option value="sunset">Sunset</option>
          </select>
          <button onClick={() => setDarkMode(!darkMode)}>{darkMode ? <FaSun /> : <FaMoon />}</button>
        </div>

        {/* Profile card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex flex-col items-center">
            <img
              src={user.avatar}
              onClick={() => isOwner && fileInputRef.current?.click()}
              className="w-24 h-24 rounded-full border shadow cursor-pointer"
            />
            <input type="file" hidden ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" />

            {editMode ? (
              <>
                <input value={user.name} onChange={(e) => handleChange("name", e.target.value)} className="text-xl font-bold text-center bg-transparent border-b" />
                <input value={user.title} onChange={(e) => handleChange("title", e.target.value)} className="text-sm text-center bg-transparent border-b" />
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold mt-2">{user.name}</h1>
                <p className="text-sm">{user.title}</p>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-4 flex justify-center gap-3">
            {isOwner ? (
              <button onClick={handleEditButtonClick} className="bg-blue-600 text-white px-3 py-1 rounded">
                <FaEdit /> {editMode ? "Save" : "Edit"}
              </button>
            ) : (
              <span className="text-xs text-red-500">View-only mode</span>
            )}
            <button onClick={handleDownloadVCF} className="border px-3 py-1 rounded"><FaDownload /></button>
            <button onClick={() => setShowQRCode(!showQRCode)} className="border px-3 py-1 rounded">QR</button>
          </div>

          {showQRCode && (
            <div className="flex justify-center mt-4">
              <QRCodeCanvas
                value={`BEGIN:VCARD\nVERSION:3.0\nFN:${user.name}\nEMAIL:${user.email}\nURL:${user.website}\nEND:VCARD`}
              />
            </div>
          )}

          {/* Contact fields */}
          <div className="mt-6 space-y-2">
            <ContactRow icon={<EnvelopeIcon className="w-5 h-5" />} label="Email" value={user.email} onChange={(val) => handleChange("email", val)} edit={editMode} link={`mailto:${user.email}`} />
            <ContactRow icon={<FaInstagram />} label="Instagram" value={user.instagram} onChange={(val) => handleChange("instagram", val)} edit={editMode} link={`https://instagram.com/${user.instagram?.replace("@", "")}`} />
            <ContactRow icon={<FaLinkedin />} label="LinkedIn" value={user.linkedin} onChange={(val) => handleChange("linkedin", val)} edit={editMode} link={`https://linkedin.com/in/${user.linkedin}`} />
            <ContactRow icon={<FaGlobe />} label="Website" value={user.website} onChange={(val) => handleChange("website", val)} edit={editMode} link={user.website} />
          </div>

          {/* Appointment form */}
          <form onSubmit={handleAppointmentSubmit} className="mt-6 space-y-2 border-t pt-4">
            <h3 className="text-sm font-semibold">Book Appointment</h3>
            <input value={appointment.name} onChange={(e) => setAppointment({ ...appointment, name: e.target.value })} placeholder="Name" className="w-full p-1 border rounded" />
            <input value={appointment.email} onChange={(e) => setAppointment({ ...appointment, email: e.target.value })} placeholder="Email" type="email" className="w-full p-1 border rounded" />
            <div className="flex gap-2">
              <input value={appointment.date} onChange={(e) => setAppointment({ ...appointment, date: e.target.value })} type="date" className="w-1/2 p-1 border rounded" />
              <input value={appointment.time} onChange={(e) => setAppointment({ ...appointment, time: e.target.value })} type="time" className="w-1/2 p-1 border rounded" />
            </div>
            {appointmentError && <p className="text-xs text-red-500">{appointmentError}</p>}
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Book</button>
          </form>
        </div>
      </div>
    </main>
  );
}

// ContactRow reusable component
type ContactRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (val: string) => void;
  edit: boolean;
  link: string;
};

function ContactRow({ icon, label, value, onChange, edit, link }: ContactRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-lg">{icon}</div>
      <div className="flex-1">
        <p className="text-xs font-medium">{label}</p>
        {edit ? (
          <input className="text-sm w-full bg-transparent border-b" value={value} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
            {value}
          </a>
        )}
      </div>
    </div>
  );
}
