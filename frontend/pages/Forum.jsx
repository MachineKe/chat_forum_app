import React, { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import PostCard from "../components/PostCard";
import Button from "../components/Button";

const Forum = () => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [posts, setPosts] = useState([
    // Initial sample posts
    {
      id: 1,
      title: "Sample Post",
      content: "This is a sample forum post.",
      author: "Alice",
      createdAt: "2025-05-20",
    },
    {
      id: 2,
      title: "Another Post",
      content: "This is another example post.",
      author: "Bob",
      createdAt: "2025-05-19",
    },
  ]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // On mount, get user from localStorage and fetch user id from backend
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
  }, []);

  const handleNewPost = () => {
    setShowForm(true);
    setTitle("");
    setContent("");
    setError("");
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
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          title,
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
          title: data.title,
          content: data.content,
          author: username || "You",
          createdAt: data.created_at || new Date().toISOString().slice(0, 10),
        },
        ...posts,
      ]);
      setShowForm(false);
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Forum</h2>
        <div className="flex gap-2">
          <Button onClick={handleNewPost}>New Post</Button>
          <Button
            type="button"
            onClick={() => {
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            Logout
          </Button>
        </div>
      </div>
      {showForm && (
        <form className="mb-4 p-4 border rounded bg-gray-50" onSubmit={handleSubmit}>
          <div className="mb-2">
            <input
              className="w-full border px-2 py-1 rounded"
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-2">
            <textarea
              className="w-full border px-2 py-1 rounded"
              placeholder="Content"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Posting..." : "Post"}
            </Button>
            <Button type="button" onClick={() => setShowForm(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      )}
      <div>
        {posts.map(post => (
          <PostCard
            key={post.id}
            title={post.title}
            content={post.content}
            author={post.author}
            createdAt={post.createdAt}
          />
        ))}
      </div>
    </MainLayout>
  );
};

export default Forum;
