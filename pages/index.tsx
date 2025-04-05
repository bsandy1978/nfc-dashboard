import React, { useEffect, useState, useRef } from "react";
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
}

interface AppointmentData {
  name: string;
  email: string;
  date: string;
  time: string;
}

interface HomeProps {
  initialData?: Partial<UserProfileData>;
  initialEditMode?: boolean;
}

export default function Home({ initialData, initialEditMode = true }: HomeProps) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [darkMode, setDarkMode] = useState(false);
  const [theme, setTheme] = useState<"default" | "ocean" | "forest" | "sunset">("default");
  const [editMode, setEditMode] = useState(initialEditMode);
  const [isOwner, setIsOwner] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [appointmentConfirmed, setAppointmentConfirmed] = useState<AppointmentData | null>(null);
  const [appointmentError, setAppointmentError] = useState("");
  const [appointmentRequestSent, setAppointmentRequestSent] = useState(false);
  const [pendingAppointment, setPendingAppointment] = useState<AppointmentData>({ name: "", email: "", date: "", time: "" });
  const [appointment, setAppointment] = useState<AppointmentData>({ name: "", email: "", date: "", time: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<Partial<UserProfileData>>(initialData ?? {
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

  const generateUsername = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15) + Math.floor(Math.random() * 1000);
  };

  useEffect(() => {
    console.log("Current username:", user.username);
  }, [user?.username]);

  useEffect(() => {
    if (!user?.username && user.name) {
      const newUsername = generateUsername(user.name);
      setUser((prev) => ({ ...prev, username: newUsername }));
    }
  }, [user?.username, user.name]);

  useEffect(() => {
    if (!user?.username) return;
    const ownerKey = `${user.username}_owner`;
    const existingOwner = localStorage.getItem(ownerKey);

    if (existingOwner === "true") {
      setIsOwner(true);
      setEditMode(true);
    } else {
      if (!existingOwner) {
        localStorage.setItem(ownerKey, "true");
        setIsOwner(true);
        setEditMode(true);
      } else {
        setIsOwner(false);
        setEditMode(false);
      }
    }
  }, [user?.username]);

  useEffect(() => {
    localStorage.setItem("userProfile", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const themeClasses: Record<typeof theme, string> = {
    default: "bg-gradient-to-b from-gray-100 to-blue-100 dark:from-gray-900 dark:to-gray-800",
    ocean: "bg-gradient-to-b from-blue-200 to-blue-500 dark:from-blue-800 dark:to-blue-900",
    forest: "bg-gradient-to-b from-green-200 to-green-500 dark:from-green-800 dark:to-green-900",
    sunset: "bg-gradient-to-b from-yellow-200 to-pink-500 dark:from-yellow-800 dark:to-pink-900",
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

  const handleChange = (field: keyof UserProfileData, value: string) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, username: user.username || generateUsername(user.name || "") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");
      alert("Profile saved successfully!");
    } catch (err: any) {
      alert("Error saving profile: " + err.message);
    }
  };

  const handleEditButtonClick = () => {
    if (!isOwner) {
      alert("You are not the owner of this profile. This is view-only mode.");
      return;
    }
    if (editMode) {
      handleSaveProfile();
      setEditMode(false);
    } else {
      setEditMode(true);
    }
  };
  const handleDownloadVCF = () => {
    const vcf = `BEGIN:VCARD
VERSION:3.0
FN:${user.name}
TITLE:${user.title}
EMAIL:${user.email}
URL:${user.website}
END:VCARD`.trim();
    const blob = new Blob([vcf], { type: "text/vcard" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${user.name?.replace(/ /g, "_")}.vcf`;
    link.click();
  };

  const handleShare = async () => {
    const shareData = {
      title: "My Virtual Card",
      text: `Check out ${user.name}'s virtual card!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error(err);
      alert("Sharing failed!");
    }
  };

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppointmentError("");
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    if (appointmentDateTime <= new Date()) {
      setAppointmentError("Please choose a future date and time for your appointment.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointment),
      });

      if (!res.ok) {
        const data = await res.json();
        setAppointmentError(data.message || "Failed to create appointment.");
        return;
      }

      alert("Appointment request sent!");
      setAppointment({ name: "", email: "", date: "", time: "" });
    } catch (error) {
      console.error("Appointment submission error:", error);
      setAppointmentError("An error occurred. Please try again.");
    }
  };

  const handleAppointmentConfirmation = () => {
    setAppointmentConfirmed({ ...pendingAppointment });
    setAppointmentRequestSent(false);
    setPendingAppointment({ name: "", email: "", date: "", time: "" });
  };

  const generateGoogleCalendarLink = (appt: AppointmentData) => {
    const startDateTime = new Date(`${appt.date}T${appt.time}`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);
    const pad = (num: number) => (num < 10 ? "0" + num : num);
    const formatDate = (date: Date) =>
      date.getFullYear().toString() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      "T" +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      "00Z";
    const start = formatDate(startDateTime);
    const end = formatDate(endDateTime);
    const details = encodeURIComponent("Appointment booked via Virtual Card");
    const text = encodeURIComponent(`Appointment with ${user.name}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}`;
  };

  return (
    <main className={`min-h-screen ${themeClasses[theme]} transition-colors text-gray-800 dark:text-gray-100`}>
      <div className="max-w-md mx-auto p-4">
        {/* Top Controls */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <label htmlFor="themeSelect" className="text-sm font-semibold">Theme:</label>
            <select
              id="themeSelect"
              value={theme}
              onChange={(e) => setTheme(e.target.value as typeof theme)}
              className="p-1 rounded border dark:bg-gray-800 dark:text-white"
            >
              <option value="default">Default</option>
              <option value="ocean">Ocean</option>
              <option value="forest">Forest</option>
              <option value="sunset">Sunset</option>
            </select>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="text-2xl transition">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 ring-1 ring-blue-100 dark:ring-blue-900">
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <img
                src={user.avatar}
                alt="Avatar"
                className={`w-28 h-28 rounded-full border-4 border-white dark:border-gray-700 shadow-xl cursor-pointer hover:scale-105 transition duration-300 ${isAvatarUploading ? "opacity-50" : ""}`}
                onClick={() => isOwner && fileInputRef.current?.click()}
              />
              {isAvatarUploading && <FaSpinner className="absolute inset-0 m-auto text-3xl animate-spin" />}
            </div>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleAvatarUpload} />

            {editMode ? (
              <>
                <input className="text-lg font-semibold text-center bg-transparent border-b dark:text-white" value={user.name} onChange={(e) => handleChange("name", e.target.value)} />
                <input className="text-sm text-center bg-transparent border-b dark:text-gray-300" value={user.title} onChange={(e) => handleChange("title", e.target.value)} />
                <input className="text-xs text-center bg-transparent border-b dark:text-gray-400" value={user.subtitle} onChange={(e) => handleChange("subtitle", e.target.value)} />
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold text-center dark:text-white">{user.name}</h1>
                <p className="text-sm text-center dark:text-gray-300">{user.title}</p>
                <p className="text-xs text-center dark:text-gray-400">{user.subtitle}</p>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex w-full gap-2 mt-3">
              {isOwner ? (
                <button onClick={handleEditButtonClick} className="flex-1 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-md flex justify-center items-center gap-1">
                  <FaEdit className="text-lg" /> {editMode ? "Save" : "Edit Profile"}
                </button>
              ) : (
                <p className="text-xs text-red-500 text-center italic">View-only mode</p>
              )}
              <button onClick={handleDownloadVCF} className="flex-1 border border-blue-500 text-blue-500 px-3 py-2 rounded-md flex items-center justify-center">
                <FaDownload />
              </button>
              <button onClick={handleShare} className="flex-1 border border-green-500 text-green-500 px-3 py-2 rounded-md flex items-center justify-center">
                <FaShareAlt />
              </button>
            </div>

            {showQRCode && (
              <div className="mt-4">
                <p className="text-sm font-semibold dark:text-white mb-2">Scan to download vCard</p>
                <QRCodeCanvas
                  value={`BEGIN:VCARD\nVERSION:3.0\nFN:${user.name}\nTITLE:${user.title}\nEMAIL:${user.email}\nURL:${user.website}\nEND:VCARD`}
                  size={128}
                />
              </div>
            )}
            <button onClick={() => setShowQRCode(!showQRCode)} className="mt-2 text-xs text-blue-500 hover:underline">
              {showQRCode ? "Hide QR Code" : "Show QR Code"}
            </button>
          </div>

          {/* Contact Info */}
          <div className="mt-6 divide-y divide-gray-200 dark:divide-gray-700">
            <ContactRow icon={<EnvelopeIcon className="w-6 h-6 text-blue-500" />} label="Email" value={user.email} onChange={(val) => handleChange("email", val)} edit={editMode} link={`mailto:${user.email}`} />
            <ContactRow icon={<FaInstagram className="text-2xl text-pink-600" />} label="Instagram" value={user.instagram} onChange={(val) => handleChange("instagram", val)} edit={editMode} link={`https://instagram.com/${user.instagram?.replace("@", "")}`} />
            <ContactRow icon={<FaLinkedin className="text-2xl text-blue-700" />} label="LinkedIn" value={user.linkedin} onChange={(val) => handleChange("linkedin", val)} edit={editMode} link={`https://linkedin.com/in/${user.linkedin}`} />
            <ContactRow icon={<FaTwitter className="text-2xl text-sky-400" />} label="Twitter" value={user.twitter} onChange={(val) => handleChange("twitter", val)} edit={editMode} link={`https://twitter.com/${user.twitter?.replace("@", "")}`} />
            <ContactRow icon={<FaGlobe className="text-2xl text-gray-500" />} label="Website" value={user.website} onChange={(val) => handleChange("website", val)} edit={editMode} link={`https://${user.website}`} />
            <ContactRow icon={<FaMapMarkerAlt className="text-2xl text-red-500" />} label="Location" value={user.location} onChange={(val) => handleChange("location", val)} edit={editMode} link={`https://maps.google.com/?q=${user.location}`} />
            <ContactRow icon={<FaMoneyBill className="text-2xl text-green-500" />} label="UPI" value={user.upi} onChange={(val) => handleChange("upi", val)} edit={editMode} link={`upi://pay?pa=${user.upi}`} />
          </div>

          {/* Appointment Form */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-md font-semibold mb-2">Schedule a Call</h3>
            <form onSubmit={handleAppointmentSubmit} className="space-y-3">
              <input type="text" placeholder="Your Name" value={appointment.name} onChange={(e) => setAppointment({ ...appointment, name: e.target.value })} className="w-full text-sm p-2 border rounded-md" required />
              <input type="email" placeholder="Your Email" value={appointment.email} onChange={(e) => setAppointment({ ...appointment, email: e.target.value })} className="w-full text-sm p-2 border rounded-md" required />
              <div className="flex gap-2">
                <input type="date" value={appointment.date} onChange={(e) => setAppointment({ ...appointment, date: e.target.value })} className="w-1/2 text-sm p-2 border rounded-md" required />
                <input type="time" value={appointment.time} onChange={(e) => setAppointment({ ...appointment, time: e.target.value })} className="w-1/2 text-sm p-2 border rounded-md" required />
              </div>
              {appointmentError && <p className="text-xs text-red-500">{appointmentError}</p>}
              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm py-2 rounded-md">Book Appointment</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

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
    <div className="flex items-center gap-3 py-3 group hover:bg-blue-50 transition px-3">
      <div className="text-2xl w-10 h-10 flex justify-center items-center rounded-full bg-white shadow-md">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold mb-1">{label}</p>
        {edit ? (
          <input className="text-xs bg-transparent border-b w-full focus:outline-none" value={value} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
            {value}
          </a>
        )}
      </div>
    </div>
  );
}
