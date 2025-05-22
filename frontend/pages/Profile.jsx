import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Avatar from "../components/Avatar";

const mockAvatar = "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    full_name: "",
    email: "",
    avatar: "",
    bio: "",
  });
  const [password, setPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch user profile from backend using email from localStorage
    const stored = JSON.parse(localStorage.getItem("user"));
    const email = stored?.email;
    if (email) {
      fetch(`/api/auth/profile?email=${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setUser({
              id: data.id,
              full_name: data.full_name || "",
              email: data.email || "",
              avatar: data.avatar || "",
              bio: data.bio || "",
            });
            // Update localStorage with id for future use
            localStorage.setItem("user", JSON.stringify(data));
          }
        });
    }
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      // Upload to backend
      const formData = new FormData();
      formData.append("avatar", file);
      try {
        const res = await fetch("/api/auth/upload-avatar", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          throw new Error("Failed to upload avatar");
        }
        const data = await res.json();
        if (data.url) {
          setUser({ ...user, avatar: data.url });
        }
      } catch (err) {
        // fallback to preview if upload fails
        setUser({ ...user, avatar: URL.createObjectURL(file) });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      // Use user.id from state
      const user_id = user.id;
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          full_name: user.full_name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update profile.");
        setLoading(false);
        return;
      }
      const updated = await res.json();
      localStorage.setItem("user", JSON.stringify(updated));
      setUser({
        id: updated.id,
        full_name: updated.full_name,
        email: updated.email,
        avatar: updated.avatar,
        bio: updated.bio || "",
      });
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError("Failed to update profile.");
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      // Simulate API call
      await new Promise((res) => setTimeout(res, 1000));
      setSuccess("Password updated successfully.");
      setPassword("");
    } catch (err) {
      setError("Failed to update password.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      <div className="max-w-7xl mx-auto flex flex-row justify-center gap-8 pt-6">
        {/* Left Sidebar */}
        <Sidebar title="EPRA" />
        {/* Center Profile Management */}
        <main className="flex-1 max-w-xl w-full">
          <div className="bg-white rounded-2xl shadow p-8 mt-4">
            <h2 className="text-2xl font-bold mb-6">Profile Management</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar
                  src={user.avatar || mockAvatar}
                  alt="Avatar"
                  size={80}
                  className="w-20 h-20 rounded-full object-cover border"
                  profileUrl={
                    user.username
                      ? `${window.location.origin}/user/${user.username}`
                      : undefined
                  }
                />
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Change Avatar</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="block mt-1"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={user.full_name}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  name="bio"
                  value={user.bio}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded px-3 py-2"
                  rows={3}
                  maxLength={255}
                  placeholder="Tell us about yourself"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              {success && <div className="text-green-600">{success}</div>}
              {error && <div className="text-red-600">{error}</div>}
            </form>
            <hr className="my-8" />
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="mt-1 block w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gray-800 text-white py-2 rounded font-semibold hover:bg-gray-900 transition-colors"
                disabled={loading}
              >
                {loading ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>
        </main>
        {/* Right Sidebar */}
        <aside className="w-80 hidden xl:flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-4 sticky top-6">
            <div className="font-bold text-lg mb-2">What's happening</div>
            <div className="flex flex-col gap-2">
              <div>
                <div className="text-xs text-gray-500">Business & finance · Trending</div>
                <div className="font-semibold text-gray-900">Market Cap</div>
                <div className="text-xs text-gray-500">27.8K posts</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Politics · Trending</div>
                <div className="font-semibold text-gray-900">President Ruto</div>
                <div className="text-xs text-gray-500">13.6K posts</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Khwisero's Finest</div>
                <div className="text-xs text-gray-500">@Dredo_ltd</div>
              </div>
              <button className="bg-black text-white rounded-full px-4 py-1 text-sm font-semibold hover:bg-gray-900">Follow</button>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-4">
            <div className="font-bold text-lg mb-2">Who to follow</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Khwisero's Finest</div>
                  <div className="text-xs text-gray-500">@Dredo_ltd</div>
                </div>
                <button className="bg-black text-white rounded-full px-4 py-1 text-sm font-semibold hover:bg-gray-900">Follow</button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Rocky</div>
                  <div className="text-xs text-gray-500">@Rocky11960</div>
                </div>
                <button className="bg-black text-white rounded-full px-4 py-1 text-sm font-semibold hover:bg-gray-900">Follow</button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Mpakaunik</div>
                  <div className="text-xs text-gray-500">@Mpakaunik</div>
                </div>
                <button className="bg-black text-white rounded-full px-4 py-1 text-sm font-semibold hover:bg-gray-900">Follow</button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Profile;
