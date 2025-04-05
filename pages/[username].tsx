import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function PublicDashboard() {
  const router = useRouter();
  const { username } = router.query;

  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/u/${username}`);
        if (!res.ok) throw new Error("Profile not found");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError("Could not load profile");
      }
    };

    fetchProfile();

    // Check device's localStorage for ownership
    const claimedUser = localStorage.getItem("owner_username");
    if (claimedUser === username) {
      setIsOwner(true);
    }
  }, [username]);

  const claimOwnership = () => {
    localStorage.setItem("owner_username", username as string);
    setIsOwner(true);
    alert("Ownership claimed. You can now edit this profile.");
  };

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!profile) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
      <h1 className="text-xl font-bold text-center mb-2">{profile.name}</h1>
      <p className="text-sm text-center text-gray-500">{profile.title}</p>
      <p className="text-xs text-center text-gray-400 mb-4">{profile.subtitle}</p>

      {isOwner ? (
        <>
          <button onClick={() => setEditMode(!editMode)} className="mb-4 bg-blue-500 text-white px-4 py-1 rounded">
            {editMode ? "Finish Editing" : "Edit Profile"}
          </button>
        </>
      ) : (
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">Are you the owner of this card?</p>
          <button onClick={claimOwnership} className="mt-2 bg-green-600 text-white px-4 py-1 rounded">
            Yes, Claim Ownership
          </button>
        </div>
      )}

      <div className="space-y-2">
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Website:</strong> <a href={profile.website} className="text-blue-500">{profile.website}</a></p>
        <p><strong>Location:</strong> {profile.location}</p>
        <p><strong>UPI:</strong> {profile.upi}</p>
      </div>

      {editMode && isOwner && (
        <div className="mt-4">
          {/* Add editable input fields */}
          <input
            type="text"
            defaultValue={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="block w-full border rounded px-2 py-1 my-1"
          />
          {/* Repeat similar inputs for title, email, etc. */}
        </div>
      )}
    </div>
  );
}