import React, { useState, useEffect } from "react";
import PostCard from "../components/PostCard";
import TiptapEditor from "../components/TiptapEditor";

const Forum = () => {
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
          }
        });
    }
    // Fetch posts from backend
    fetch("/api/posts")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
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
        <aside className="w-64 hidden lg:flex flex-col gap-2">
          <div className="flex flex-col gap-2 sticky top-6">
            <div className="text-2xl font-bold mb-4 px-4 text-blue-700 tracking-widest">EPRA</div>
            <nav className="flex flex-col gap-1">
              {[
                { icon: "🏠", label: "Home" },
                { icon: "🔍", label: "Explore" },
                { icon: "🔔", label: "Notifications" },
                { icon: "✉️", label: "Messages" },
                { icon: "🔖", label: "Bookmarks" },
                { icon: "💼", label: "Jobs" },
                { icon: "👥", label: "Communities" },
                { icon: "☰", label: "More" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="flex items-center gap-3 px-4 py-2 rounded-full hover:bg-gray-200 text-lg font-medium text-gray-700 transition"
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
            <button className="mt-4 bg-black text-white font-bold rounded-full py-3 text-lg hover:bg-gray-900 transition">Post</button>
            <div className="mt-auto flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-200 cursor-pointer">
              <img
                src="https://ui-avatars.com/api/?name=Mark+Kiprotich&background=0D8ABC&color=fff"
                alt="Mark Kiprotich"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold text-gray-900 text-sm">Mark Kiprotich</div>
                <div className="text-xs text-gray-500">@mark_kiprotich_</div>
              </div>
            </div>
          </div>
        </aside>
        {/* Center Feed */}
        <main className="flex-1 max-w-xl w-full">
          {/* Post Composer */}
          {showSettings ? (
            <PostSettingsCard
              content={content}
              onBack={() => setShowSettings(false)}
              onPost={handleSubmit}
              loading={loading}
            />
          ) : (
            <TiptapEditor
              value={content}
              onChange={setContent}
              placeholder="What's happening?"
              minHeight={80}
              onNext={() => setShowSettings(true)}
            />
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
                createdAt={post.createdAt}
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
