import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import TiptapEditor from "../components/TiptapEditor";
import PostSettingsCard from "../components/PostSettingsCard";
import Sidebar from "../components/Sidebar";
import Avatar from "../components/Avatar";
import PlainText from "../components/PlainText";
import { MediaPlayerProvider } from "../components/MediaPlayerContext";
import useUser from "../hooks/useUser";
import usePosts from "../hooks/usePosts";

const Forum = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [mediaId, setMediaId] = useState(null);
  const [mediaType, setMediaType] = useState(null);

  // Use custom hooks for user and posts
  const {
    userId,
    username,
    firstName,
    fullName,
    userAvatar,
    loading: userLoading,
    error: userError,
  } = useUser();

  const {
    posts,
    loading: postsLoading,
    error: postsError,
    createPost,
    setPosts,
  } = usePosts();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMediaUpload = (id, type) => {
    setMediaId(id);
    setMediaType(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!userId) {
      setError("User not loaded. Please log in again.");
      setLoading(false);
      return;
    }
    const data = await createPost({
      user_id: userId,
      content,
      media_id: mediaId || undefined,
      media_type: mediaType || undefined,
    });
    if (!data) {
      setError("Failed to create post");
      setLoading(false);
      return;
    }
    setContent("");
    setMediaId(null);
    setMediaType(null);
    setShowSettings(false);
    setIsEditorActive(false);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      <MediaPlayerProvider>
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
                user={{
                  name: fullName || username || "User",
                  avatar:
                    userAvatar && userAvatar.length > 0
                      ? userAvatar
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(username || "User")}&background=0D8ABC&color=fff`
                }}
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
                  user={{
                    name: fullName || username || "User",
                    avatar:
                      userAvatar && userAvatar.length > 0
                        ? userAvatar
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(username || "User")}&background=0D8ABC&color=fff`
                  }}
                  onMediaUpload={handleMediaUpload} // NEW PROP
                />
              ) : (
                <PlainText
                  user={{
                    name: firstName || username || "User",
                    avatar:
                      userAvatar && userAvatar.length > 0
                        ? userAvatar
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(username || "User")}&background=0D8ABC&color=fff`
                  }}
                  placeholder={`What's on your mind${firstName ? `, ${firstName}` : ""}?`}
                  onClick={() => setIsEditorActive(true)}
                />
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
                  media={post.media}
                  user={{
                    full_name: fullName,
                    username,
                    avatar: userAvatar
                  }}
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
      </MediaPlayerProvider>
    </div>
  );
};

export default Forum;
