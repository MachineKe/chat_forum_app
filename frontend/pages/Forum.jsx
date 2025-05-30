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
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [mediaTitle, setMediaTitle] = useState("");

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
    // Debug: log mediaTitle before sending
    console.log("handleSubmit: mediaTitle =", mediaTitle);
    // Use mediaTitle from state (set on Next)
    const data = await createPost({
      user_id: userId,
      content,
      media_id: mediaId || undefined,
      media_title: mediaTitle || ""
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
    setSelectedMedia(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      <MediaPlayerProvider>
        <div className="flex flex-col items-center w-full pt-6">
          <div className="w-full max-w-2xl mx-auto">
            {/* Post Composer */}
            {showSettings ? (
              <PostSettingsCard
                key="post-settings"
                content={content}
                media={
                  selectedMedia
                    ? { url: selectedMedia.src, type: selectedMedia.type }
                    : null
                }
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
                  onNext={(media, mediaTitleFromContent) => {
                    setContent(editorContent => editorContent); // no-op, but ensures state is not reset
                    setSelectedMedia(media);
                    setMediaTitle(mediaTitleFromContent || "");
                    setShowSettings(true);
                  }}
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
                  onMediaUpload={handleMediaUpload}
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
            <div className="mt-4 flex flex-col gap-4 w-full">
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
                  media_title={post.media_title}
                  user={{
                    full_name: fullName,
                    username,
                    avatar: userAvatar
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </MediaPlayerProvider>
    </div>
  );
};

export default Forum;
