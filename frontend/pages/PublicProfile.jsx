import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import Sidebar from "../components/Sidebar";
import Avatar from "../components/Avatar";
import ProfileHeader from "../components/ProfileHeader";
import BackButton from "../components/BackButton";

const mockBanner =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [replies, setReplies] = useState([]);
  const [likes, setLikes] = useState([]);
  const [activeTab, setActiveTab] = useState("Posts");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  if (loading || !user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // Fallbacks
  const avatar =
    user.avatar && user.avatar.length > 0
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `http://localhost:5050/${user.avatar.replace(/^\/?/, "")}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.full_name || user.username || "User"
        )}&background=0D8ABC&color=fff`;

  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      <div className="max-w-7xl mx-auto flex flex-row justify-center gap-8 pt-6">
        {/* Left Sidebar */}
        <Sidebar title="EPRA" />
        {/* Center Profile */}
        <main className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-xl">
            <div className="w-full flex items-center px-4 py-3 border-b bg-white sticky top-0 z-10">
              <BackButton label="Profile" />
            </div>
            <ProfileHeader
              avatar={avatar}
              fullName={user.full_name}
              username={user.username}
              bio={user.bio || "Entrepreneur, Founder & developer @beyondsoftwares"}
              banner={user.banner || mockBanner}
              details={[
                user.location && { icon: "📍", label: "Location", value: user.location },
                user.website && {
                  icon: null,
                  label: "Website",
                  value: (
                    <a
                      href={user.website}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {user.website.replace(/^https?:\/\//, "")}
                    </a>
                  ),
                },
                user.birth_date && { icon: "🎂", label: "Birthday", value: `Born ${user.birth_date}` },
                user.joined && { icon: "📅", label: "Joined", value: `Joined ${user.joined}` },
                {
                  icon: null,
                  label: "Following",
                  value: (
                    <span>
                      <span className="font-bold">{typeof user.following === "number" ? user.following : 0}</span> Following
                    </span>
                  ),
                },
                {
                  icon: null,
                  label: "Followers",
                  value: (
                    <span>
                      <span className="font-bold">{typeof user.followers === "number" ? user.followers : 0}</span> Followers
                    </span>
                  ),
                },
              ].filter(Boolean)}
              onEdit={() => navigate("/profile")}
              isOwnProfile={
              (() => {
                try {
                  const stored = JSON.parse(localStorage.getItem("user"));
                  return stored && stored.username === user.username;
                } catch {
                  return false;
                }
              })()
            }
            />
            {/* Tabs */}
            <div className="border-b flex gap-8 px-6">
              {["Posts", "Replies", "Highlights", "Articles", "Media", "Likes"].map((tab) => (
                <button
                  key={tab}
                  className={`py-3 font-semibold ${
                    activeTab === tab
                      ? "border-b-2 border-black text-black"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Tab Content */}
            <div className="px-6 py-4">
              {activeTab === "Posts" && (
                posts.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">No posts yet.</div>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      id={post.id}
                      content={post.content}
                      author={post.author}
                      avatar={post.avatar}
                      createdAt={post.createdAt}
                      commentCount={post.commentCount}
                      viewCount={post.viewCount}
                      media={post.media}
                      media_type={post.media_type}
                      media_path={post.media_path}
                      user={user}
                    />
                  ))
                )
              )}
              {activeTab === "Replies" && (
                replies.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">No replies yet.</div>
                ) : (
                  replies.map((reply) => (
                    <PostCard
                      key={reply.id}
                      id={reply.id}
                      content={reply.content}
                      author={reply.author}
                      avatar={reply.avatar}
                      createdAt={reply.createdAt}
                      commentCount={reply.commentCount}
                      viewCount={reply.viewCount}
                      media={reply.media}
                      media_type={reply.media_type}
                      media_path={reply.media_path}
                      user={user}
                    />
                  ))
                )
              )}
              {activeTab === "Highlights" && (
                <div className="text-gray-400 text-center py-8">No highlights yet.</div>
              )}
              {activeTab === "Articles" && (
                <div className="text-gray-400 text-center py-8">No articles yet.</div>
              )}
              {activeTab === "Media" && (
                posts.filter(
                  (p) =>
                    /<img|<video/i.test(p.content) ||
                    p.media ||
                    p.media_type ||
                    p.media_path
                ).length === 0 ? (
                  <div className="text-gray-400 text-center py-8">No media posts yet.</div>
                ) : (
                  posts
                    .filter(
                      (p) =>
                        /<img|<video/i.test(p.content) ||
                        p.media ||
                        p.media_type ||
                        p.media_path
                    )
                    .map((post) => (
                      <PostCard
                        key={post.id}
                        id={post.id}
                        content={post.content}
                        author={post.author}
                        avatar={post.avatar}
                        createdAt={post.createdAt}
                        commentCount={post.commentCount}
                        viewCount={post.viewCount}
                        media={post.media}
                        media_type={post.media_type}
                        media_path={post.media_path}
                        user={user}
                      />
                    ))
                )
              )}
              {activeTab === "Likes" && (
                likes.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">No liked posts yet.</div>
                ) : (
                  likes.map((post) => (
                    <PostCard
                      key={post.id}
                      id={post.id}
                      content={post.content}
                      author={post.author}
                      avatar={post.avatar}
                      createdAt={post.createdAt}
                      commentCount={post.commentCount}
                      viewCount={post.viewCount}
                      media={post.media}
                      media_type={post.media_type}
                      media_path={post.media_path}
                      user={user}
                    />
                  ))
                )
              )}
            </div>
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

export default PublicProfile;
