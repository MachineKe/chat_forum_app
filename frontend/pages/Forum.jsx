import React from "react";
import PostCard from "../components/posts/PostCard";
import TiptapEditor from "../components/rich-text/TiptapEditor";
import PostInput from "../components/posts/PostInput";
import PostSettingsCard from "../components/posts/PostSettingsCard";
import Sidebar from "../components/layout/Sidebar";
import PlainText from "../components/rich-text/PlainText";
import { MediaPlayerProvider } from "../components/media/MediaPlayerContext";
import useForumPage from "../hooks/useForumPage";

const Forum = () => {
  const forum = useForumPage();

  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      <MediaPlayerProvider>
        <div className="flex flex-col items-center w-full pt-6">
          <div className="w-full max-w-2xl mx-auto">
            {/* Post Composer */}
            {forum.showSettings ? (
              <PostSettingsCard
                key="post-settings"
                content={forum.content}
                media={
                  forum.selectedMedia
                    ? {
                        url: forum.selectedMedia.src,
                        type: forum.selectedMedia.type === "pdf" ? "document" : forum.selectedMedia.type,
                        title: forum.selectedMedia.title,
                        thumbnail: forum.selectedMedia.thumbnail
                      }
                    : null
                }
                media_title={forum.mediaTitle}
                onBack={() => forum.setShowSettings(false)}
                onPost={() => forum.handleSubmit({
                  content: forum.content,
                  media_id: forum.selectedMedia?.id,
                  media_type: forum.selectedMedia?.type,
                  media_title: forum.selectedMedia?.title,
                  media_url: forum.selectedMedia?.src,
                  thumbnail: forum.selectedMedia?.thumbnail
                })}
                loading={forum.loading}
                user={{
                  name: forum.fullName || forum.username || "User",
                  avatar:
                    forum.userAvatar && forum.userAvatar.length > 0
                      ? forum.userAvatar
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(forum.username || "User")}&background=0D8ABC&color=fff`
                }}
              />
            ) : (
              <PostInput
                user={{
                  name: forum.fullName || forum.username || "User",
                  avatar:
                    forum.userAvatar && forum.userAvatar.length > 0
                      ? forum.userAvatar
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(forum.username || "User")}&background=0D8ABC&color=fff`
                }}
                onSubmit={({ content, media_id, media_type, media_title, media_src, thumbnail, reset, ...rest }) => {
                  forum.setContent(content);
                  forum.setSelectedMedia({
                    id: media_id,
                    type: media_type,
                    src: media_src,
                    title: media_title,
                    thumbnail,
                    ...rest // pass through any extra metadata (e.g. file, duration, etc.)
                  });
                  forum.setMediaTitle(media_title || "");
                  forum.setMediaId(media_id);
                  forum.setShowSettings(true);
                  reset();
                }}
                placeholder="What's happening?"
                actionLabel="Next"
                minHeight={80}
                autoFocus={forum.isEditorActive}
                onCancel={() => forum.setIsEditorActive(false)}
              />
            )}
            {forum.error && <div className="text-red-600 mb-2">{forum.error}</div>}
            {/* Posts Feed */}
            <div className="mt-4 flex flex-col gap-4 w-full">
              {forum.posts.map(post => (
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
                    full_name: forum.fullName,
                    username: forum.username,
                    avatar: forum.userAvatar
                  }}
                />
              ))}
              {/* Infinite scroll sentinel */}
              <div
                id="load-more-sentinel"
                style={{ height: 300, background: "#f0f4f8" }}
              />
              {forum.postsLoading && <div className="text-center py-4 text-gray-500">Loading more posts...</div>}
              {!forum.hasMore && forum.posts.length > 0 && (
                <div className="text-center py-4 text-gray-400">No more posts</div>
              )}
            </div>
          </div>
        </div>
      </MediaPlayerProvider>
    </div>
  );
};

export default Forum;
