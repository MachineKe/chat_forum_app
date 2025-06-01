import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "@hooks/useUser";
import usePosts from "@hooks/usePosts";

// All business logic for Forum page
export default function useForumPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [mediaId, setMediaId] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [mediaTitle, setMediaTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // User and posts hooks
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
    loadMorePosts,
    hasMore,
  } = usePosts();

  const handleMediaUpload = (id, type) => {
    setMediaId(id);
    setMediaType(type);
  };

  const handleSubmit = async (eOrPayload) => {
    let payload;
    if (eOrPayload && typeof eOrPayload.preventDefault === "function") {
      // Called from form submit event
      eOrPayload.preventDefault();
      if (!content.trim() && !selectedMedia) return;
      payload = {
        user_id: userId,
        content,
        media_id: mediaId || undefined,
        media_title: mediaTitle || "",
        media_url: selectedMedia && selectedMedia.src ? selectedMedia.src : undefined,
        thumbnail: selectedMedia && selectedMedia.thumbnail ? selectedMedia.thumbnail : undefined
      };
    } else {
      // Called directly with payload
      payload = {
        user_id: userId,
        ...(eOrPayload || {})
      };
      if (!payload.content?.trim() && !payload.media_id) return;
    }
    setLoading(true);
    setError("");
    if (!userId) {
      setError("User not loaded. Please log in again.");
      setLoading(false);
      return;
    }
    const data = await createPost(payload);
    if (!data) {
      setError("Failed to create post");
      setLoading(false);
      return;
    }
    if (!data.media_title || data.media_title === "") {
      data.media_title = payload.media_title || "";
    }
    setContent("");
    setMediaId(null);
    setMediaType(null);
    setShowSettings(false);
    setIsEditorActive(false);
    setSelectedMedia(null);
    // Refetch posts to ensure latest data from backend (including media_title)
    fetch("/api/posts")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPosts(data);
      });
    setLoading(false);
  };

  // Infinite scroll: observe sentinel
  useEffect(() => {
    const sentinel = document.getElementById("load-more-sentinel");
    if (!sentinel) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !postsLoading) {
          loadMorePosts();
        }
      },
      { root: null, rootMargin: "0px 0px -50% 0px", threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line
  }, [hasMore, postsLoading, posts.length]);

  return {
    content,
    setContent,
    showSettings,
    setShowSettings,
    isEditorActive,
    setIsEditorActive,
    mediaId,
    setMediaId,
    selectedMedia,
    setSelectedMedia,
    mediaType,
    setMediaType,
    mediaTitle,
    setMediaTitle,
    error,
    setError,
    loading,
    setLoading,
    userId,
    username,
    firstName,
    fullName,
    userAvatar,
    userLoading,
    userError,
    posts,
    postsLoading,
    postsError,
    createPost,
    setPosts,
    loadMorePosts,
    hasMore,
    handleMediaUpload,
    handleSubmit,
    navigate,
  };
}
