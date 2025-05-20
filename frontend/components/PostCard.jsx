import React, { useState, useEffect } from "react";
import Button from "./Button";
import { Link } from "react-router-dom";
import TiptapEditor from "./TiptapEditor";

// Simple relative time formatter
function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // seconds
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) === 1 ? "" : "s"} ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) === 1 ? "" : "s"} ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
}

const PostCard = ({ id, content, author, createdAt, alwaysShowComments }) => {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(!!alwaysShowComments);
  const [commentContent, setCommentContent] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    if (showComments) {
      fetch(`/api/posts/${id}/comments`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setComments(data);
        });
    }
  }, [showComments, id, alwaysShowComments]);

  // Add or reply to a comment
  const handleAddComment = async (e, parentId = null, replyContent = null, setReplyLoading, setReplyError, setReplyContent) => {
    e.preventDefault();
    if (setReplyLoading) setReplyLoading(true);
    if (setReplyError) setReplyError("");
    else {
      setCommentLoading(true);
      setCommentError("");
    }
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.email) {
      if (setReplyError) setReplyError("You must be logged in to comment.");
      else setCommentError("You must be logged in to comment.");
      if (setReplyLoading) setReplyLoading(false);
      else setCommentLoading(false);
      return;
    }
    // Fetch user id
    let userId = null;
    let username = "";
    try {
      const res = await fetch(`/api/auth/user-by-email?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data && data.id) {
        userId = data.id;
        username = data.username || data.email;
      }
    } catch {
      if (setReplyError) setReplyError("Failed to fetch user info.");
      else setCommentError("Failed to fetch user info.");
      if (setReplyLoading) setReplyLoading(false);
      else setCommentLoading(false);
      return;
    }
    if (!userId) {
      if (setReplyError) setReplyError("User not found.");
      else setCommentError("User not found.");
      if (setReplyLoading) setReplyLoading(false);
      else setCommentLoading(false);
      return;
    }
    // Post comment
    try {
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          content: replyContent !== null ? replyContent : commentContent,
          parent_id: parentId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (setReplyError) setReplyError(data.error || "Failed to add comment");
        else setCommentError(data.error || "Failed to add comment");
        if (setReplyLoading) setReplyLoading(false);
        else setCommentLoading(false);
        return;
      }
      // Refetch comments after adding a new comment or reply to ensure correct nesting
      fetch(`/api/posts/${id}/comments`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setComments(data);
        });
      if (setReplyContent) setReplyContent("");
      else setCommentContent("");
    } catch {
      if (setReplyError) setReplyError("Network error");
      else setCommentError("Network error");
    }
    if (setReplyLoading) setReplyLoading(false);
    else setCommentLoading(false);
  };

  // Facebook-style card
  return (
    <Link
      to={`/post/${id}`}
      style={{ textDecoration: "none", color: "inherit" }}
      className="block group"
    >
      <div className="bg-white rounded-xl shadow border border-gray-200 mb-6 w-full group-hover:shadow-lg transition-shadow cursor-pointer">
        {/* Author row */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=0D8ABC&color=fff`}
            alt={author}
            className="w-10 h-10 rounded-full object-cover border border-gray-300"
          />
          <div className="flex-1">
            <div className="font-semibold text-gray-900">{author}</div>
            <div className="text-xs text-gray-500">{getRelativeTime(createdAt)}</div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2 py-1 rounded-full transition-colors" title="More" tabIndex={-1} onClick={e => e.preventDefault()}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
          </button>
        </div>
        {/* Post content */}
        <div className="px-4 pb-2">
          <div
            className="text-gray-900 text-base mb-2"
            style={{ minHeight: 32 }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
          {/* Optionally, render an image if present in content (not implemented here) */}
        </div>
        {/* Like/Comment counts row */}
        <div className="flex items-center justify-between px-4 pt-2 pb-1 text-gray-500 text-sm border-b">
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100">
              <svg width="16" height="16" fill="#1877f2" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </span>
            <span>327</span>
          </div>
          <div>
            <span>13 comments</span>
          </div>
        </div>
        {/* Reactions row */}
        <div className="flex items-center justify-center px-4 py-1 text-gray-500 text-sm gap-2">
          <button className="flex-1 flex flex-col items-center py-2 hover:bg-gray-100 rounded cursor-pointer transition" tabIndex={-1} onClick={e => e.preventDefault()}>
            <svg width="20" height="20" fill="none" stroke="#65676b" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 22h10a4 4 0 0 0 4-4v-5a4 4 0 0 0-4-4h-1.28a1 1 0 0 1-.95-.68l-.57-1.71A2 2 0 0 0 12.28 4H7a2 2 0 0 0-2 2v12a4 4 0 0 0 2 3.46V22z" fill="#e4e6eb"/></svg>
            <span className="text-xs mt-1">Like</span>
          </button>
          <button className="flex-1 flex flex-col items-center py-2 hover:bg-gray-100 rounded cursor-pointer transition" tabIndex={-1} onClick={e => e.preventDefault()}>
            <svg width="20" height="20" fill="none" stroke="#65676b" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="#e4e6eb"/></svg>
            <span className="text-xs mt-1">Comment</span>
          </button>
          <button className="flex-1 flex flex-col items-center py-2 hover:bg-gray-100 rounded cursor-pointer transition" tabIndex={-1} onClick={e => e.preventDefault()}>
            <svg width="20" height="20" fill="none" stroke="#65676b" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4v16l7-7 7 7V4z" fill="#e4e6eb"/></svg>
            <span className="text-xs mt-1">Share</span>
          </button>
        </div>
        {/* Comments section */}
        {showComments && (
          <div className="px-4 pb-4">
            <form className="mb-2 flex gap-2 items-start" onSubmit={handleAddComment}>
              <div className="flex-1">
                <TiptapEditor
                  value={commentContent}
                  onChange={setCommentContent}
                  placeholder="Add a comment..."
                  minHeight={40}
                />
              </div>
              <Button type="submit" disabled={commentLoading} style={{ height: 40 }}>
                {commentLoading ? "Posting..." : "Comment"}
              </Button>
            </form>
            {commentError && <div className="text-red-600 mb-2">{commentError}</div>}
            <div>
              {comments.length === 0 && (
                <div className="text-gray-400 text-sm">No comments yet.</div>
              )}
              {renderComments(comments, null, handleAddComment)}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

// Recursive comment rendering with reply form
function renderComments(comments, parentId, handleAddComment) {
  // Only render comments with matching parent_id
  const filtered = comments.filter(c => c.parent_id === parentId);
  if (filtered.length === 0) return null;
  return filtered.map(comment => (
    <Comment
      key={comment.id}
      comment={comment}
      comments={comments}
      handleAddComment={handleAddComment}
    />
  ));
}

// Comment component with its own reply state
function Comment({ comment, comments, handleAddComment }) {
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState("");
  return (
    <div className="border-t pt-2 mt-2 ml-4">
      <div
        className="text-sm"
        dangerouslySetInnerHTML={{ __html: comment.content }}
      />
      <div className="text-xs text-gray-500 flex justify-between">
        <span>By {comment.author}</span>
        <span>{getRelativeTime(comment.createdAt)}</span>
      </div>
      <form
        className="mb-2 flex gap-2 items-start"
        onSubmit={e =>
          handleAddComment(
            e,
            comment.id,
            replyContent,
            setReplyLoading,
            setReplyError,
            setReplyContent
          )
        }
      >
        <div className="flex-1">
          <TiptapEditor
            value={replyContent}
            onChange={setReplyContent}
            placeholder="Reply..."
            minHeight={40}
          />
        </div>
        <Button type="submit" disabled={replyLoading} style={{ height: 40 }}>
          {replyLoading ? "Posting..." : "Reply"}
        </Button>
        {replyError && <div className="text-red-600 mb-2">{replyError}</div>}
      </form>
      {renderComments(comments, comment.id, handleAddComment)}
    </div>
  );
}


export default PostCard;
