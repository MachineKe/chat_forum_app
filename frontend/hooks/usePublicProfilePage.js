import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// All business logic for PublicProfile page
export default function usePublicProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [replies, setReplies] = useState([]);
  const [likes, setLikes] = useState([]);
  const [activeTab, setActiveTab] = useState("Posts");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch user by username
    fetch(`/api/auth/profile?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
        if (data && data.id) {
          // Fetch posts by user id
          fetch(`/api/posts?user_id=${data.id}`)
            .then((res) => res.json())
            .then((postsData) => {
              if (Array.isArray(postsData)) setPosts(postsData);
            });
          // Fetch posts user has commented on (Replies tab)
          fetch(`/api/posts?commented_by=${encodeURIComponent(username)}`)
            .then((res) => res.json())
            .then((repliesData) => {
              if (Array.isArray(repliesData)) setReplies(repliesData);
            });
          // Fetch liked posts by user
          fetch(`/api/posts?liked_by=${encodeURIComponent(username)}`)
            .then((res) => res.json())
            .then((likesData) => {
              if (Array.isArray(likesData)) setLikes(likesData);
            });
        }
      });
  }, [username]);

  // Fallback avatar logic
  const avatar =
    user && user.avatar && user.avatar.length > 0
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `http://localhost:5050/${user.avatar.replace(/^\/?/, "")}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          (user && (user.full_name || user.username)) || "User"
        )}&background=0D8ABC&color=fff`;

  // Is this the logged-in user's own profile?
  const isOwnProfile = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user"));
      return stored && user && stored.username === user.username;
    } catch {
      return false;
    }
  })();

  return {
    user,
    posts,
    replies,
    likes,
    activeTab,
    setActiveTab,
    loading,
    navigate,
    avatar,
    isOwnProfile,
  };
}
