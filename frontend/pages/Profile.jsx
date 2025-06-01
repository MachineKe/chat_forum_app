import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "../components/layout/Avatar";
import ProfileHeader from "../components/layout/ProfileHeader";
import Banner from "../components/layout/Banner";
import BackButton from "../components/layout/BackButton";

const mockAvatar = "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    full_name: "",
    email: "",
    avatar: "",
    banner: "",
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
              username: data.username || "",
              email: data.email || "",
              avatar: data.avatar || "",
              banner: data.banner || "",
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

  const handleBannerChange = async (file) => {
    if (file) {
      // Upload to backend
      const formData = new FormData();
      formData.append("banner", file);
      try {
        const res = await fetch("/api/auth/upload-banner", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          throw new Error("Failed to upload banner");
        }
        const data = await res.json();
        if (data.url) {
          setUser(prev => ({ ...prev, banner: data.url }));
        }
      } catch (err) {
        setUser(prev => ({ ...prev, banner: URL.createObjectURL(file) }));
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
          banner: user.banner,
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
        banner: updated.banner,
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
      <div className="flex flex-col items-center w-full pt-6">
        <div className="w-full max-w-2xl mx-auto">
          {/* Header with Back Button and border */}
          <div className="w-full flex items-center px-4 py-3 border-b bg-white">
            <BackButton label="Profile" />
          </div>
          {/* Profile Header with Banner */}
          <ProfileHeader
            avatar={user.avatar || mockAvatar}
            fullName={user.full_name}
            username={user.username}
            bio={user.bio}
            banner={user.banner}
            // Do not pass isOwnProfile or onEdit, so edit button is hidden in edit profile section
          />
          <div className="bg-white rounded-2xl shadow p-8 mt-4">
            <h2 className="text-2xl font-bold mb-6">Profile Management</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col items-center">
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
                  <label className="block mt-2">
                    <span className="text-sm font-medium text-gray-700">Change Avatar</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="block mt-1"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <div className="flex flex-col items-center">
                  {user.banner && (
                    <div className="w-full max-w-xs overflow-hidden">
                      <Banner
                        src={user.banner}
                        alt="Banner"
                        className="mb-2"
                        style={{ width: "100%", height: 96, maxWidth: "100%" }}
                      />
                    </div>
                  )}
                  <label className="block mt-2 w-full">
                    <span className="text-sm font-medium text-gray-700">Change Banner</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="block mt-1"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          handleBannerChange(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
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
        </div>
      </div>
    </div>
  );
};

export default Profile;
