// ✅ Full updated index.tsx with View-Only Mode for Non-Owners
import React, { useEffect, useState, useRef } from "react";
import {
  FaMoon, FaSun, FaDownload, FaEdit, FaInstagram,
  FaLinkedin, FaTwitter, FaGlobe, FaMapMarkerAlt,
  FaMoneyBill, FaShareAlt, FaSpinner,
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
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [theme, setTheme] = useState<"default" | "ocean" | "forest" | "sunset">("default");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState<boolean>(false);
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [appointmentConfirmed, setAppointmentConfirmed] = useState<AppointmentData | null>(null);
  const [appointmentError, setAppointmentError] = useState<string>("");
  const [appointmentRequestSent, setAppointmentRequestSent] = useState<boolean>(false);
  const [pendingAppointment, setPendingAppointment] = useState<AppointmentData>({ name: "", email: "", date: "", time: "" });
  const [appointment, setAppointment] = useState<AppointmentData>({ name: "", email: "", date: "", time: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUsername = (name: string) => {
    if (!name) return "user" + Math.floor(Math.random() * 10000);
    return name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15) + Math.floor(Math.random() * 1000);
  };

  const [user, setUser] = useState<Partial<UserProfileData>>(
    initialData ?? {
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
    }
  );

  useEffect(() => {
    if (!user?.username && user.name) {
      const newUsername = generateUsername(user.name);
      setUser((prev) => ({ ...prev, username: newUsername }));
    }
  }, [user?.username, user.name]);

  useEffect(() => {
    if (!user?.username) return;

    const key = `${user.username}_owner`;
    const storedOwner = localStorage.getItem(key);

    if (storedOwner === "true") {
      setIsOwner(true);
      setEditMode(true);
    } else {
      if (!storedOwner) {
        localStorage.setItem(key, "true");
        setIsOwner(true);
        setEditMode(true);
      } else {
        setIsOwner(false);
        setEditMode(false);
      }
    }
  }, [user?.username]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleDownloadVCF = () => {
    const vcf = `BEGIN:VCARD\nVERSION:3.0\nFN:${user.name}\nTITLE:${user.title}\nEMAIL:${user.email}\nURL:${user.website}\nEND:VCARD`;
    const blob = new Blob([vcf], { type: "text/vcard" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${user.name?.replace(/ /g, "_")}.vcf`;
    link.click();
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
        body: JSON.stringify({
          ...user,
          username: user.username || generateUsername(user.name || ""),
        }),
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
      alert("This profile is in view-only mode. You are not the owner.");
      return;
    }

    if (editMode) {
      handleSaveProfile();
      setEditMode(false);
    } else {
      setEditMode(true);
    }
  };

  return (
    <main className={`min-h-screen ${theme} transition-colors text-gray-800 dark:text-gray-100`}>
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-xl font-bold mb-2">{user.name}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">{user.title}</p>

        {isOwner && (
          <button
            onClick={handleEditButtonClick}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            {editMode ? "Save Profile" : "Edit Profile"}
          </button>
        )}
      </div>
    </main>
  );
}
