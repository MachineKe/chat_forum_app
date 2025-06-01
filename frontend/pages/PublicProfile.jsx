import React from "react";
import PostCard from "../components/posts/PostCard";
import ProfileHeader from "../components/layout/ProfileHeader";
import BackButton from "../components/layout/BackButton";
import usePublicProfilePage from "../hooks/usePublicProfilePage";

const mockBanner =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";

const PublicProfile = () => {
  const {
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
  } = usePublicProfilePage();

  if (loading || !user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      <div className="flex flex-col items-center w-full pt-6">
        <div className="w-full">
          <div className="w-full flex items-center px-4 py-3 border-b bg-white sticky top-0 z-10">
            <BackButton label="Profile" />
          </div>
          <div className="w-full max-w-2xl mx-auto">
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
              isOwnProfile={isOwnProfile}
            />
          </div>
          {/* Tabs */}
          <div className="w-full max-w-2xl mx-auto">
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
      </div>
    </div>
  );
};

export default PublicProfile;
