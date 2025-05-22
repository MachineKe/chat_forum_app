import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import TiptapEditor from "../components/TiptapEditor";
import PostSettingsCard from "../components/PostSettingsCard";
import Sidebar from "../components/Sidebar";
import Avatar from "../components/Avatar";

const Forum = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isEditorActive, setIsEditorActive] = useState(false);

  // On mount, get user from localStorage and fetch user id from backend, and fetch posts
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.email) {
      fetch(`/api/auth/user-by-email?email=${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setUserId(data.id);
            setUsername(data.username || data.email);
            console.log("Fetched user avatar:", data.avatar);
            let avatarUrl = data.avatar || "";
            if (avatarUrl && !avatarUrl.startsWith("http")) {
              avatarUrl = `http://localhost:5050/${avatarUrl.replace(/^\/?/, "")}`;
            }
            setUserAvatar(avatarUrl);
            if (data.full_name) {
              setFirstName(data.full_name.split(" ")[0]);
            } else if (data.username) {
              setFirstName(data.username.split(" ")[0]);
            } else if (data.email) {
              setFirstName(data.email.split("@")[0]);
            }
          }
        });
    }
    // Fetch posts from backend
    fetch("/api/posts")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          console.log("Fetched post IDs:", data.map(p => p.id));
          setPosts(data);
        }
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!userId) {
      setError("User not loaded. Please log in again.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          content,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create post");
        setLoading(false);
        return;
      }
      setPosts([
        {
          id: data.id,
          content: data.content,
          author: data.author || username || "You",
          createdAt: data.createdAt || new Date().toISOString().slice(0, 10),
        },
        ...posts,
      ]);
      setContent("");
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      <div className="max-w-7xl mx-auto flex flex-row justify-center gap-8 pt-6">
        {/* Left Sidebar */}
        <Sidebar title="EPRA" />
        {/* Center Feed */}
        <main className="flex-1 max-w-xl w-full">
          {/* Post Composer */}
          {showSettings ? (
            <PostSettingsCard
              key="post-settings"
              content={content}
              onBack={() => setShowSettings(false)}
              onPost={handleSubmit}
              loading={loading}
            />
          ) : (
            isEditorActive ? (
              <TiptapEditor
                key="tiptap-editor"
                value={content}
                onChange={setContent}
                placeholder="What's happening?"
                minHeight={80}
                onNext={() => setShowSettings(true)}
                onBlur={() => {
                  if (!content.trim()) setIsEditorActive(false);
                }}
                onClose={() => setIsEditorActive(false)}
              />
            ) : (
              <div
                className="flex items-center w-full min-h-[48px] px-4 py-2 bg-gray-100 rounded-full text-gray-700 text-base cursor-text border border-transparent hover:bg-gray-200 transition shadow-sm"
                style={{ lineHeight: "2.2rem" }}
                tabIndex={0}
                onFocus={() => setIsEditorActive(true)}
                onClick={() => setIsEditorActive(true)}
              >
                <Avatar
                  src={
                    userAvatar && userAvatar.length > 0
                      ? userAvatar
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(username || "User")}&background=0D8ABC&color=fff`
                  }
                  alt={username || "User"}
                  size={40}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                  profileUrl={
                    username
                      ? `${window.location.origin}/user/${username}`
                      : undefined
                  }
                />
                <span className="text-gray-400">
                  {`What's on your mind${firstName ? `, ${firstName}` : ""}?`}
                </span>
              </div>
            )
          )}
          {error && <div className="text-red-600 mb-2">{error}</div>}
          {/* Posts Feed */}
          <div className="mt-4 flex flex-col gap-4">
            {posts.map(post => (
              <PostCard
                key={post.id}
                id={post.id}
                content={post.content}
                author={post.author}
                username={post.username}
                avatar={post.avatar}
                createdAt={post.createdAt}
                commentCount={post.commentCount}
                viewCount={post.viewCount}
              />
            ))}
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
                <div className="text-xs text-gray-500">Trending in Kenya</div>
                <div className="font-semibold text-gray-900">Tundu Lissu</div>
                <div className="text-xs text-gray-500">22K posts</div>
              </div>
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

export default Forum;
