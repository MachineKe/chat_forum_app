import React, { useState } from "react";
import TiptapEditor from "@components/rich-text/TiptapEditor";
import renderMediaPreviewOnly from "@components/rich-text/TiptapMediaPreview";
import PlainText from "@components/rich-text/PlainText";
import ExcessContentManager from "@components/common/ExcessContentManager";
import Avatar from "@components/layout/Avatar";
import MediaPlayer from "@components/media/MediaPlayer";
import { resolveMediaUrl } from "@utils/api";
import LikeButton from "@components/layout/LikeButton";
import { FaThumbsUp } from "react-icons/fa";
import CommentInput from "@components/comments/CommentInput";

const mockAvatar = "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";

// Helper to format relative time
function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000); // seconds
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

/**
 * Comment - single comment with reply and like logic.
 * Props:
 * - comment: comment object
 * - replies: array of reply comments
 * - isExpanded: bool
 * - onExpand: function
 * - replyingToCommentId, setReplyingToCommentId: state for reply editor
 * - onReply: function
 * - fetchComments: function
 * - expandedReplies, setExpandedReplies: state for expanded replies
 * - navigate: router navigation
 * - grouped: grouped comments by parent_id
 * - user: current user
 */
const Comment = ({
  comment,
  replies,
  isExpanded,
  onExpand,
  replyingToCommentId,
  setReplyingToCommentId,
  onReply,
  fetchComments,
  expandedReplies,
  setExpandedReplies,
  navigate,
  grouped,
  user,
}) => {
  // Per-reply editor state
  const [isReplyEditorActive, setIsReplyEditorActive] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyMedia, setReplyMedia] = useState(null);
  const [replyMediaId, setReplyMediaId] = useState(null);
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
  const [liked, setLiked] = useState(comment.liked || false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Modal state for TiptapEditor (lifted to parent)
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [audioRecorderModalOpen, setAudioRecorderModalOpen] = useState(false);

  // Fetch like count and liked status on mount
  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/comments/${comment.id}/likes${userId ? `?user_id=${userId}` : ""}`)
      .then(res => res.json())
      .then(data => {
        setLikeCount(data.count || 0);
        setLiked(!!data.liked);
      });
  }, [comment.id]);

  const handleLike = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;
    if (!userId) {
      alert("You must be logged in to like comments.");
      return;
    }
    setLikeLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/comments/${comment.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (data.liked) {
        setLiked(true);
        setLikeCount((c) => c + 1);
      } else {
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      }
    } catch {
      // Optionally show error
    }
    setLikeLoading(false);
  };

  return (
    <div
      key={comment.id}
      className="flex items-start gap-3 px-4 py-4 mb-2"
    >
      <Avatar
        src={comment.avatar && comment.avatar.length > 0 ? comment.avatar : mockAvatar}
        alt={comment.author}
        size={40}
        className="w-10 h-10 rounded-full object-cover border border-gray-300"
        profileUrl={comment.username ? `/user/${comment.username}` : undefined}
        onClick={e => {
          if (comment.username) {
            e.preventDefault();
            navigate(`/user/${comment.username}`);
          }
        }}
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <a
            className="font-semibold text-gray-900 hover:underline cursor-pointer"
            href={comment.username ? `/user/${comment.username}` : undefined}
            onClick={e => {
              if (comment.username) {
                e.preventDefault();
                navigate(`/user/${comment.username}`);
              }
            }}
          >
            {comment.author}
          </a>
          <span className="text-gray-500 text-xs">
            @{comment.username ? comment.username : comment.author?.toLowerCase().replace(/\s/g, "")}
          </span>
        </div>
        <div className="text-gray-900 text-base mb-2">
          <ExcessContentManager content={comment.content} wordLimit={20} />
        </div>
        {/* Render media if present (robust extraction) */}
        {(() => {
          let mediaObj = comment.media;
          let mediaType = comment.media_type || null;
          let mediaPath = comment.media_path || null;

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

          if (mediaPath && mediaType) {
            return (
              <div className="mb-2">
                <MediaPlayer
                  src={resolveMediaUrl(mediaPath)}
                  type={mediaType}
                  title={comment.media_title || (mediaObj && mediaObj.title) || undefined}
                  thumbnail={
                    mediaObj && typeof mediaObj.thumbnail === "string" && mediaObj.thumbnail.trim().length > 0
                      ? mediaObj.thumbnail
                      : (typeof comment.thumbnail === "string" && comment.thumbnail.trim().length > 0
                        ? comment.thumbnail
                        : undefined)
                  }
                  style={{ maxWidth: "100%", borderRadius: 8, margin: "8px 0" }}
                />
              </div>
            );
          }
          return null;
        })()}
        <div className="flex items-center gap-4 text-gray-500 text-xs mt-1">
          <span>{formatRelativeTime(comment.createdAt)}</span>
          <LikeButton
            liked={liked}
            loading={likeLoading}
            onLike={handleLike}
            style={{ padding: 0 }}
            variant="link"
          />
          <button
            className="text-blue-600 font-medium hover:underline px-1 bg-transparent border-none cursor-pointer"
            tabIndex={0}
            onClick={() => {
              setReplyingToCommentId(comment.id);
              setReplyContent("");
              setReplyMediaId(null);
              setReplyMedia(null);
            }}
            style={{ padding: 0 }}
          >
            Reply
          </button>
        </div>
        {likeCount > 0 && (
          <div className="flex items-center gap-1 mt-1 ml-auto w-fit pr-2">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "#e4e6eb",
                borderRadius: "999px",
                padding: "2px 8px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#1877f2",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                marginLeft: "auto"
              }}
            >
              <FaThumbsUp size={15} style={{ marginRight: 3 }} color="#1877f2" />
              {likeCount}
            </span>
          </div>
        )}
        {replies.length > 0 && (
          <div className="mt-2 ml-2">
            {!isExpanded ? (
              <button
                className="text-blue-600 text-sm font-medium hover:underline bg-transparent border-none p-0 cursor-pointer"
                onClick={() =>
                  setExpandedReplies(prev => ({ ...prev, [comment.id]: true }))
                }
              >
                View all {replies.length} repl{replies.length === 1 ? "y" : "ies"}
              </button>
            ) : (
              <div>
                {replies.map(reply =>
                  <Comment
                    key={reply.id}
                    comment={reply}
                    replies={grouped[reply.id] || []}
                    isExpanded={expandedReplies[reply.id]}
                    onExpand={onExpand}
                    replyingToCommentId={replyingToCommentId}
                    setReplyingToCommentId={setReplyingToCommentId}
                    onReply={onReply}
                    fetchComments={fetchComments}
                    expandedReplies={expandedReplies}
                    setExpandedReplies={setExpandedReplies}
                    navigate={navigate}
                    grouped={grouped}
                    user={user}
                  />
                )}
              </div>
            )}
          </div>
        )}
        {replyingToCommentId === comment.id && (
          <div className="mt-2">
            <div style={{ minHeight: 120 }}>
              <CommentInput
                user={user}
                onSubmit={({ content, media_id, media_type, media_title, thumbnail, reset }) => {
                  if (onReply) {
                    onReply(comment.id, content, media_id, media_title, thumbnail, media_type);
                  }
                  setReplyContent("");
                  setReplyMediaId(null);
                  setReplyMedia(null);
                  setExpandedReplies(prev => ({ ...prev, [comment.id]: true }));
                  setReplyingToCommentId(null);
                  setIsReplyEditorActive(false);
                  if (fetchComments) fetchComments();
                  reset();
                }}
                placeholder="Reply..."
                actionLabel="Reply"
                minHeight={40}
                autoFocus={isReplyEditorActive}
                onCancel={() => {
                  setReplyingToCommentId(null);
                  setIsReplyEditorActive(false);
                  setReplyContent("");
                  setReplyMediaId(null);
                  setReplyMedia(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
      <button className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2 py-1 rounded-full transition-colors bg-transparent border-none" title="More">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
      </button>
    </div>
  );
};

export default Comment;
