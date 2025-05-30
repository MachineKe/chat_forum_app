import { useState, useEffect } from "react";

/**
 * usePosts - Custom hook to fetch and create posts.
 * Returns: { posts, loading, error, createPost }
 */
export default function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch posts on mount
  useEffect(() => {
    setLoading(true);
    fetch("/api/posts")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          setError("Failed to fetch posts");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch posts");
        setLoading(false);
      });
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

  return { posts, loading, error, createPost, setPosts };
}
