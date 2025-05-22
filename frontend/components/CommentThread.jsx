import React, { useState, useRef } from "react";
import TiptapEditor from "./TiptapEditor";
import Avatar from "./Avatar";

const mockAvatar = "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";

/**
 * CommentThread - reusable threaded comments component.
 * Props:
 * - comments: array of comment objects
 * - postId: string or number
 * - onReply: function(parentId, content)
 * - loading: boolean
 * - fetchComments: function to refresh comments
 */
const CommentThread = ({
  comments = [],
  postId,
  onReply,
  loading = false,
  fetchComments,
}) => {
  // Log comments to check if username is present
  console.log("CommentThread received comments:", comments);
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [commentReplyContent, setCommentReplyContent] = useState("");
  const [isCommentReplyEditorActive, setIsCommentReplyEditorActive] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});

  // Group comments by parent_id
  const grouped = {};
  comments.forEach(c => {
    const pid = c.parent_id || "root";
    if (!grouped[pid]) grouped[pid] = [];
    grouped[pid].push(c);
  });

  // Helper to render a comment and its replies
  function renderComment(comment) {
    const replies = grouped[comment.id] || [];
    const isExpanded = expandedReplies[comment.id];

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
          profileUrl={
            comment.username
              ? `${window.location.origin}/user/${comment.username}`
              : undefined
          }
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <a
              className="font-semibold text-gray-900 hover:underline cursor-pointer"
              href={
                comment.username
                  ? `${window.location.origin}/user/${comment.username}`
                  : undefined
              }
              onClick={e => {
                if (comment.username) {
                  e.preventDefault();
                  window.location.assign(`${window.location.origin}/user/${comment.username}`);
                }
              }}
            >
              {comment.author}
            </a>
            <span className="text-gray-500 text-xs">
              @{comment.username ? comment.username : comment.author?.toLowerCase().replace(/\s/g, "")}
            </span>
            <span className="text-gray-400 text-xs">· 1h</span>
          </div>
          <div className="text-gray-900 text-base mb-2" dangerouslySetInnerHTML={{ __html: comment.content }} />
          <div className="flex items-center gap-4 text-gray-500 text-xs mt-1">
            <span>57m</span>
            <button
              className="text-blue-600 font-medium hover:underline px-1 bg-transparent border-none cursor-pointer"
              tabIndex={0}
              onClick={() => {}}
              style={{ padding: 0 }}
            >
              Like
            </button>
            <button
              className="text-blue-600 font-medium hover:underline px-1 bg-transparent border-none cursor-pointer"
              tabIndex={0}
              onClick={() => {
                setReplyingToCommentId(comment.id);
                setIsCommentReplyEditorActive(false);
                setCommentReplyContent("");
              }}
              style={{ padding: 0 }}
            >
              Reply
            </button>
          </div>
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
                  {replies.map(renderComment)}
                </div>
              )}
            </div>
          )}
          {replyingToCommentId === comment.id && (
            <div className="mt-2">
              {isCommentReplyEditorActive ? (
                <TiptapEditor
                  value={commentReplyContent}
                  onChange={setCommentReplyContent}
                  placeholder="Reply..."
                  minHeight={40}
                  actionLabel="Reply"
                  onNext={() => {
                    if (onReply) onReply(comment.id, commentReplyContent);
                    setCommentReplyContent("");
                    setReplyingToCommentId(null);
                    setIsCommentReplyEditorActive(false);
                    if (fetchComments) fetchComments();
                  }}
                  onClose={() => {
                    setReplyingToCommentId(null);
                    setIsCommentReplyEditorActive(false);
                    setCommentReplyContent("");
                  }}
                />
              ) : (
                <div
                  className="w-full min-h-[32px] px-3 py-2 bg-gray-100 rounded-lg text-gray-700 text-base cursor-text border border-gray-300 hover:bg-gray-200 transition"
                  style={{ lineHeight: "2.2rem" }}
                  tabIndex={0}
                  onFocus={() => setIsCommentReplyEditorActive(true)}
                  onClick={() => setIsCommentReplyEditorActive(true)}
                >
                  {commentReplyContent ? commentReplyContent : <span className="text-gray-400">Reply...</span>}
                </div>
              )}
            </div>
          )}
        </div>
        <button className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2 py-1 rounded-full transition-colors bg-transparent border-none" title="More">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        </button>
      </div>
    );
  }

  // Only render root comments
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 mt-4 p-2">
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No replies yet.</div>
      ) : (
        (grouped["root"] || []).map(renderComment)
      )}
    </div>
  );
};

export default CommentThread;
