import React from "react";
import PostCard from "../components/posts/PostCard";
import CommentThread from "../components/comments/CommentThread";
import CommentInput from "../components/comments/CommentInput";
import PlainText from "../components/rich-text/PlainText";
import TiptapEditor from "../components/rich-text/TiptapEditor";
import BackButton from "../components/layout/BackButton";
import usePostDetailPage from "../hooks/usePostDetailPage";

const PostDetail = () => {
  const {
    post,
    comments,
    loading,
    reply,
    setReply,
    replyMediaId,
    setReplyMediaId,
    replyMediaType,
    setReplyMediaType,
    isReplyEditorActive,
    setIsReplyEditorActive,
    user,
    handleReply,
    handleCommentReply,
    fetchComments,
  } = usePostDetailPage();

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!post) return <div className="p-8 text-center">Post not found.</div>;

  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      <div className="flex-1 flex justify-center w-full pt-6">
        <div className="w-full">
          <div className="w-full flex items-center px-4 py-3 border-b sticky top-0 bg-white z-10">
            <BackButton label="Post" />
          </div>
          <PostCard
            id={post.id}
            content={post.content}
            author={post.author}
            avatar={post.avatar}
            createdAt={post.createdAt}
            commentCount={comments.length}
            viewCount={typeof post.viewCount === "number" ? post.viewCount : 0}
            username={post.username || post.authorUsername}
            alwaysShowComments={false}
            isSingleView={true}
            media={post.media}
            media_type={post.media_type}
            media_path={post.media_path}
            media_title={post.media_title}
            user={user}
          />
          <div className="flex justify-center px-4 py-4 border-b">
            <div className="w-full max-w-lg">
              <CommentInput
                user={{
                  name: user?.full_name || user?.username || user?.email || "User",
                  avatar:
                    user?.avatar && user?.avatar.length > 0
                      ? user.avatar
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "User")}&background=0D8ABC&color=fff`
                }}
                onSubmit={({ content, media_id, media_type, media_title, thumbnail, reset }) => {
                  // Use the same logic as handleReply, but unified
                  handleReply(
                    {
                      getHTML: () => content
                    },
                    { id: media_id, type: media_type },
                    media_title,
                    thumbnail
                  );
                  reset();
                }}
                placeholder="Write a comment..."
                actionLabel="Comment"
                minHeight={80}
                autoFocus={isReplyEditorActive}
                onCancel={() => setIsReplyEditorActive(false)}
              />
            </div>
          </div>
          <div className="w-full max-w-2xl mx-auto">
            <CommentThread
              comments={comments.map((c, idx) => {
                let mediaObj = c.media;
                let mediaType = c.media_type || null;
                let mediaPath = c.media_path || null;

                if (Array.isArray(mediaObj) && mediaObj.length > 0) {
                  mediaObj = mediaObj[0];
                }
                if (!mediaType && mediaObj) {
                  mediaType =
                    mediaObj.media_type ||
                    mediaObj.mediaType ||
                    mediaObj.type ||
                    null;
                }
                if (!mediaPath && mediaObj) {
                  mediaPath =
                    mediaObj.media_path ||
                    mediaObj.mediaPath ||
                    mediaObj.path ||
                    mediaObj.url ||
                    null;
                }

                const isRoot = !c.parent_id || c.parent_id === null || c.parent_id === undefined;
                const isPostComment = isRoot && (c.id === post.id || idx === 0);

                return {
                  ...c,
                  author: c.author || c.username || c.email || "User",
                  username: c.username || (c.author ? c.author.replace(/\s+/g, "").toLowerCase() : ""),
                  avatar:
                    c.avatar && c.avatar.length > 0
                      ? c.avatar
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          c.author || c.username || "User"
                        )}&background=0D8ABC&color=fff`,
                  media: isPostComment
                    ? c.media || post.media
                    : c.media,
                  media_type: isPostComment
                    ? c.media_type || post.media_type || mediaType
                    : c.media_type || mediaType,
                  media_path: isPostComment
                    ? c.media_path || post.media_path || mediaPath
                    : c.media_path || mediaPath
                };
              })}
              postId={post.id}
              onReply={(parentId, content, mediaId, mediaTitle, thumbnail, mediaType) => {
                // Ensure media_id is included in the payload
                handleCommentReply(parentId, content, mediaId, mediaTitle, thumbnail, mediaType);
              }}
              loading={loading}
              user={{
                name: user?.full_name || user?.username || user?.email || "User",
                username: user?.username || "",
                avatar:
                  user?.avatar && user?.avatar.length > 0
                    ? user.avatar
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "User")}&background=0D8ABC&color=fff`
              }}
              fetchComments={fetchComments}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
