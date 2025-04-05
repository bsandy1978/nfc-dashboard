import React, { useEffect, useState, useRef } from "react";
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
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { QRCodeCanvas } from "qrcode.react";

interface UserProfileData {
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
  deviceId: string;  // Unique ID for the device (used for identification)
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
  const [editMode, setEditMode] = useState<boolean>(initialEditMode);
  const [isAvatarUploading, setIsAvatarUploading] = useState<boolean>(false);
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [appointmentConfirmed, setAppointmentConfirmed] = useState<AppointmentData | null>(null);
  const [appointmentError, setAppointmentError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate and store a unique device ID (only once per device)
  const [deviceId] = useState(() => {
    const storedDeviceId = localStorage.getItem("deviceId");
    if (storedDeviceId) {
      return storedDeviceId;
    } else {
      const newDeviceId = crypto.randomUUID();
      localStorage.setItem("deviceId", newDeviceId);
      return newDeviceId;
    }
  });

  // Load saved profile from localStorage or set initial user profile
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
      deviceId: deviceId,  // Store the deviceId as part of the user profile
    }
  );

  useEffect(() => {
    // Persist profile changes in localStorage
    localStorage.setItem("userProfile", JSON.stringify(user));
  }, [user]);

  // Toggle dark mode on <html> element
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Theme background classes
  const themeClasses: Record<typeof theme, string> = {
    default: "bg-gradient-to-b from-gray-100 to-blue-100 dark:from-gray-900 dark:to-gray-800",
    ocean: "bg-gradient-to-b from-blue-200 to-blue-500 dark:from-blue-800 dark:to-blue-900",
    forest: "bg-gradient-to-b from-green-200 to-green-500 dark:from-green-800 dark:to-green-900",
    sunset: "bg-gradient-to-b from-yellow-200 to-pink-500 dark:from-yellow-800 dark:to-pink-900",
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
    link.download = `${user.name.replace(/ /g, "_")}.vcf`;
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

  // Save profile to backend API
  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...user,
          deviceId: user.deviceId || deviceId,  // Use deviceId for uniqueness
        }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        console.warn("No JSON response body. Possibly successful with empty response.");
      }

      if (!res.ok) {
        throw new Error((data as any).error || "Failed to save profile");
      }

      console.log("✅ Profile saved:", data);
      alert("Profile saved successfully!");
    } catch (error: any) {
      console.error("❌ Error saving profile:", error);
      alert("Error saving profile: " + error.message);
    }
  };

  // Modify the Edit/Save button handler
  const handleEditButtonClick = () => {
    if (editMode) {
      // Save changes via API when leaving edit mode
      handleSaveProfile();
      setEditMode(false);
    } else {
      setEditMode(true);
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
        body: JSON.stringify({
          name: appointment.name,
          email: appointment.email,
          date: appointment.date,
          time: appointment.time,
        }),
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

  return (
    <main className={`min-h-screen ${themeClasses[theme]} transition-colors text-gray-800 dark:text-gray-100`}>
      <div className="max-w-md mx-auto p-4">
        {/* Top Controls */}
        <div className="mb-4 flex flex-row justify-between items-center">
          <div className="flex items-center space-x-2">
            <label htmlFor="themeSelect" className="text-sm font-semibold">
              Theme:
            </label>
            <select
              id="themeSelect"
              value={theme}
              onChange={(e) => setTheme(e.target.value as "default" | "ocean" | "forest" | "sunset")}
              className="p-1 rounded border dark:bg-gray-800 dark:text-white"
              aria-label="Select Theme"
            >
              <option value="default">Default</option>
              <option value="ocean">Ocean</option>
              <option value="forest">Forest</option>
              <option value="sunset">Sunset</option>
            </select>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle Dark Mode"
            className="text-2xl hover:text-yellow-500 dark:hover:text-yellow-300 transition duration-300"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 ring-1 ring-blue-100 dark:ring-blue-900">
          <div className="flex flex-col items-center space-y-2">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.avatar}
                alt="Avatar"
                className={`w-28 h-28 rounded-full border-4 border-white dark:border-gray-700 shadow-xl cursor-pointer hover:scale-105 transition duration-300 ${
                  isAvatarUploading ? "opacity-50" : ""
                }`}
                onClick={() => fileInputRef.current?.click()}
                title="Click to change avatar"
              />
              {isAvatarUploading && (
                <FaSpinner className="absolute inset-0 m-auto text-3xl animate-spin" />
              )}
            </div>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleAvatarUpload} />

            {/* Profile Details */}
            {editMode ? (
              <>
                <input
                  className="text-lg font-semibold bg-transparent border-b text-center dark:text-white focus:outline-none"
                  value={user.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  aria-label="Name"
                />
                <input
                  className="text-sm text-gray-600 dark:text-gray-300 bg-transparent border-b text-center focus:outline-none"
                  value={user.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  aria-label="Title"
                />
                <input
                  className="text-xs text-gray-500 dark:text-gray-400 bg-transparent border-b text-center focus:outline-none"
                  value={user.subtitle}
                  onChange={(e) => handleChange("subtitle", e.target.value)}
                  aria-label="Subtitle"
                />
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold text-center dark:text-white drop-shadow-sm">{user.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-300 text-center">{user.title}</p>
                <p className="text-xs text-gray-400 text-center">{user.subtitle}</p>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex w-full gap-2 mt-3">
              {initialEditMode && (
                <button
                  onClick={handleEditButtonClick}
                  title="Edit Profile"
                  className="flex-1 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-md flex justify-center items-center gap-1 shadow-md hover:shadow-xl hover:scale-105 transition duration-300"
                >
                  <FaEdit className="text-lg" /> {editMode ? "Save" : "Edit Profile"}
                </button>
              )}
              <button
                onClick={handleDownloadVCF}
                title="Download Contact as VCF"
                className="flex-1 border border-blue-500 text-blue-500 px-3 py-2 rounded-md flex items-center justify-center shadow-md hover:shadow-xl hover:bg-blue-50 transition duration-300"
              >
                <FaDownload className="text-lg" />
              </button>
              <button
                onClick={handleShare}
                title="Share Virtual Card"
                className="flex-1 border border-green-500 text-green-500 px-3 py-2 rounded-md flex items-center justify-center shadow-md hover:shadow-xl hover:bg-green-50 transition duration-300"
              >
                <FaShareAlt className="text-lg" />
              </button>
            </div>

            {/* QR Code */}
            {showQRCode && (
              <div className="mt-4">
                <p className="text-sm font-semibold dark:text-white mb-2">Scan to download vCard</p>
                <QRCodeCanvas
                  value={`BEGIN:VCARD
VERSION:3.0
FN:${user.name}
TITLE:${user.title}
EMAIL:${user.email}
URL:${user.website}
END:VCARD`}
                  size={128}
                />
              </div>
            )}
            <button onClick={() => setShowQRCode(!showQRCode)} className="mt-2 text-xs text-blue-500 hover:underline" aria-label="Toggle QR Code">
              {showQRCode ? "Hide QR Code" : "Show QR Code"}
            </button>
          </div>

          {/* Contact Details */}
          <div className="mt-6 divide-y divide-gray-200 dark:divide-gray-700">
            <ContactRow
              icon={<EnvelopeIcon className="w-6 h-6 text-blue-500 dark:text-blue-400" title="Email" />}
              label="Email"
              value={user.email}
              onChange={(val) => handleChange("email", val)}
              edit={editMode}
              link={`mailto:${user.email}`}
            />
            <ContactRow
              icon={<FaInstagram className="text-2xl text-pink-600 dark:text-pink-400" title="Instagram" />}
              label="Instagram"
              value={user.instagram}
              onChange={(val) => handleChange("instagram", val)}
              edit={editMode}
              link={`https://instagram.com/${user.instagram.replace("@", "")}`}
            />
            <ContactRow
              icon={<FaLinkedin className="text-2xl text-blue-700 dark:text-blue-400" title="LinkedIn" />}
              label="LinkedIn"
              value={user.linkedin}
              onChange={(val) => handleChange("linkedin", val)}
              edit={editMode}
              link={`https://linkedin.com/in/${user.linkedin}`}
            />
            <ContactRow
              icon={<FaTwitter className="text-2xl text-sky-400 dark:text-sky-300" title="Twitter" />}
              label="Twitter"
              value={user.twitter}
              onChange={(val) => handleChange("twitter", val)}
              edit={editMode}
              link={`https://twitter.com/${user.twitter.replace("@", "")}`}
            />
            <ContactRow
              icon={<FaGlobe className="text-2xl text-gray-500 dark:text-gray-300" title="Website" />}
              label="Website"
              value={user.website}
              onChange={(val) => handleChange("website", val)}
              edit={editMode}
              link={user.website.startsWith("http") ? user.website : `https://${user.website}`}
            />
            <ContactRow
              icon={<FaMapMarkerAlt className="text-2xl text-red-500 dark:text-red-400" title="Location" />}
              label="Location"
              value={user.location}
              onChange={(val) => handleChange("location", val)}
              edit={editMode}
              link={`https://maps.google.com/?q=${user.location}`}
            />
            <ContactRow
              icon={<FaMoneyBill className="text-2xl text-green-500 dark:text-green-400" title="UPI" />}
              label="UPI"
              value={user.upi}
              onChange={(val) => handleChange("upi", val)}
              edit={editMode}
              link={`upi://pay?pa=${user.upi}`}
            />
          </div>

          {/* Appointment Section */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-md font-semibold mb-2 text-gray-700 dark:text-gray-200">Schedule a Call</h3>
            {appointmentConfirmed ? (
              <div className="p-3 bg-green-50 dark:bg-green-900 rounded-md">
                <p className="text-sm font-semibold text-green-700 dark:text-green-200">
                  Appointment booked for {appointmentConfirmed.date} at {appointmentConfirmed.time}!
                </p>
                <a
                  href={generateGoogleCalendarLink(appointmentConfirmed)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-blue-500 hover:underline"
                >
                  Add to Google Calendar
                </a>
                <button onClick={() => setAppointmentConfirmed(null)} className="ml-2 text-xs text-red-500 hover:underline">
                  Dismiss
                </button>
              </div>
            ) : appointmentRequestSent ? (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded-md">
                <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-200">
                  Appointment request sent to {pendingAppointment.email}. Please check your email and then click "I Confirm Appointment".
                </p>
                <button
                  onClick={handleAppointmentConfirmation}
                  className="mt-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm py-2 rounded-md hover:brightness-110 transition duration-300"
                >
                  I Confirm Appointment
                </button>
              </div>
            ) : (
              <form onSubmit={handleAppointmentSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={appointment.name}
                  onChange={(e) => setAppointment({ ...appointment, name: e.target.value })}
                  className="w-full text-sm p-2 border rounded-md dark:bg-gray-900"
                  required
                  aria-label="Your Name"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={appointment.email}
                  onChange={(e) => setAppointment({ ...appointment, email: e.target.value })}
                  className="w-full text-sm p-2 border rounded-md dark:bg-gray-900"
                  required
                  aria-label="Your Email"
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={appointment.date}
                    onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
                    className="w-1/2 text-sm p-2 border rounded-md dark:bg-gray-900"
                    required
                    aria-label="Select Date"
                  />
                  <input
                    type="time"
                    value={appointment.time}
                    onChange={(e) => setAppointment({ ...appointment, time: e.target.value })}
                    className="w-1/2 text-sm p-2 border rounded-md dark:bg-gray-900"
                    required
                    aria-label="Select Time"
                  />
                </div>
                {appointmentError && <p className="text-xs text-red-500">{appointmentError}</p>}
                <button type="submit" className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm py-2 rounded-md hover:brightness-110 transition duration-300">
                  Book Appointment
                </button>
              </form>
            )}
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
    <div className="flex items-center gap-3 py-3 group hover:bg-blue-50 dark:hover:bg-blue-900 transition rounded-lg px-3">
      <div className="text-2xl w-10 h-10 flex justify-center items-center rounded-full bg-white dark:bg-gray-700 shadow-md group-hover:shadow-[0_0_10px_rgba(0,0,0,0.5)] transition duration-300">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold dark:text-white mb-1">{label}</p>
        {edit ? (
          <input
            className="text-xs bg-transparent border-b w-full dark:text-white focus:outline-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={label}
          />
        ) : (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
            {value}
          </a>
        )}
      </div>
    </div>
  );
}