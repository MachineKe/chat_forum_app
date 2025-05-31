import { useState, useEffect, useRef } from "react";

/**
 * usePosts - Custom hook to fetch and create posts, with pagination support.
 * Returns: { posts, loading, error, createPost, fetchPosts, hasMore, setPosts }
 */
export default function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20; // Default page size

  // Track offset for pagination
  const offsetRef = useRef(0);

  // Fetch posts with pagination
  const fetchPosts = async ({ limit = pageSize, offset = 0, append = false } = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/posts?limit=${limit}&offset=${offset}`);
      const data = await res.json();
      if (!Array.isArray(data)) {
        setError("Failed to fetch posts");
        setLoading(false);
        return;
      }
      if (append) {
        setPosts(prev => [...prev, ...data]);
      } else {
        setPosts(data);
      }
      setHasMore(data.length === limit);
      setLoading(false);
    } catch {
      setError("Failed to fetch posts");
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    offsetRef.current = 0;
    fetchPosts({ limit: pageSize, offset: 0, append: false });
    // eslint-disable-next-line
  }, []);

  // Create a new post
  const createPost = async ({ user_id, content, media_id, media_title }) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          content,
          media_id: media_id || undefined,
          media_title: media_title || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create post");
        setLoading(false);
        return null;
      }
      // Prepend new post to posts array using full backend response
      setPosts(prev => [
        { ...data },
        ...prev,
      ]);
      setLoading(false);
      return data;
    } catch (err) {
      setError("Network error");
      setLoading(false);
      return null;
    }
  };

  // Load next page of posts (for infinite scroll)
  const loadMorePosts = async () => {
    if (loading || !hasMore) return;
    offsetRef.current += pageSize;
    await fetchPosts({ limit: pageSize, offset: offsetRef.current, append: true });
  };

  // Reset posts and offset (e.g., after creating a new post)
  const resetPosts = async () => {
    offsetRef.current = 0;
    await fetchPosts({ limit: pageSize, offset: 0, append: false });
  };

  return {
    posts,
    loading,
    error,
    createPost,
    fetchPosts,
    loadMorePosts,
    hasMore,
    setPosts,
    resetPosts,
  };
}
