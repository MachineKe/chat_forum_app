import React, { useState, useEffect, useRef } from "react";
import Button from "./Button";
import Avatar from "./Avatar";
import Card from "./Card";
import { Link, useNavigate } from "react-router-dom";
import TiptapEditor from "./TiptapEditor";
import { FaRegThumbsUp, FaRegComment, FaShare } from "react-icons/fa";
import { FiMoreHorizontal } from "react-icons/fi";
import { redirectTo } from "../utils/redirect";
import LikeButton from "./LikeButton";

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

const PostCard = ({ id, content, author, avatar, createdAt, alwaysShowComments, commentCount, viewCount, username, isSingleView }) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(!!alwaysShowComments);
  const [commentContent, setCommentContent] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [localViewCount, setLocalViewCount] = useState(viewCount || 0);
  const cardRef = useRef(null);
  const hasCountedView = useRef(false);

  // Increment view count only when card enters viewport (once)
  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasCountedView.current) {
            hasCountedView.current = true;
            fetch(`/api/posts/${id}/view`, { method: "POST" })
              .then(res => res.json())
              .then(data => {
                if (typeof data.viewCount === "number") setLocalViewCount(data.viewCount);
              });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [id]);

  // Get current user id
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    // Fetch like count and liked status
    if (userId) {
      fetch(`/api/posts/${id}/likes?user_id=${userId}`)
        .then(res => res.json())
        .then(data => {
          setLikeCount(data.count || 0);
          setLiked(!!data.liked);
        });
    } else {
      fetch(`/api/posts/${id}/likes`)
        .then(res => res.json())
        .then(data => {
          setLikeCount(data.count || 0);
          setLiked(false);
        });
    }
  }, [id, userId]);

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

  // Like button handler
  const handleLike = async (e) => {
    if (!userId) {
      alert("You must be logged in to like posts.");
      return;
    }
    setLikeLoading(true);
    try {
      await fetch(`/api/posts/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      // Always fetch the latest like count and liked status after toggling
      const res2 = await fetch(`/api/posts/${id}/likes?user_id=${userId}`);
      const data2 = await res2.json();
      setLikeCount(data2.count || 0);
      setLiked(!!data2.liked);
    } catch {
      // Optionally show error
    }
    setLikeLoading(false);
  };

  // Comment button handler
  const handleComment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/post/${id}`);
  };

  // Share button handler
  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = window.location.origin + `/post/${id}`;
    navigator.clipboard.writeText(url);
    alert("Post link copied to clipboard!");
  };

  // Facebook-style card
  const cardContent = (
    <Card
      ref={cardRef}
      className="mb-6 w-full group-hover:shadow-lg transition-shadow cursor-pointer rounded-xl bg-white border border-gray-200"
    >
      {/* Author row */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        {(() => {
          if (username && typeof username === "string" && username.trim().length > 0) {
            return (
              <Avatar
                src={avatar && avatar.length > 0
                  ? avatar
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=0D8ABC&color=fff`}
                alt={author}
                size={40}
                className="avatar-profile-link"
                profileUrl={`${window.location.origin}/user/${username}`}
              />
            );
          } else {
            return (
              <Avatar
                src={avatar && avatar.length > 0
                  ? avatar
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=0D8ABC&color=fff`}
                alt={author}
                size={40}
              />
            );
          }
        })()}
        <div className="flex-1">
          <a
            className="font-semibold text-gray-900 hover:underline cursor-pointer"
            href={username && typeof username === "string" && username.trim().length > 0
              ? `${window.location.origin}/user/${username}`
              : undefined}
            onClick={e => {
              if (username && typeof username === "string" && username.trim().length > 0) {
                e.preventDefault();
                window.location.assign(`${window.location.origin}/user/${username}`);
              }
            }}
          >
            {author}
          </a>
          <div className="text-xs text-gray-500">{getRelativeTime(createdAt)}</div>
          <div className="text-xs text-gray-400">Post ID: {id}</div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2 py-1 rounded-full transition-colors" title="More" tabIndex={-1} onClick={e => e.preventDefault()}>
          <FiMoreHorizontal size={20} />
        </button>
      </div>
      {/* Post content */}
      <div className="px-4 pb-2">
        <div className="text-gray-900 text-base mb-2" style={{ minHeight: 32 }}>
          {renderTextBeforeMedia(content)}
        </div>
      </div>
      {/* Like/Comment/View counts row */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1 text-gray-500 text-sm border-b">
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100">
            <FaRegThumbsUp size={16} color="#1877f2" />
          </span>
          <span>{likeCount}</span>
        </div>
        <div>
          <span>{typeof commentCount === "number" ? commentCount : comments.length} comments</span>
        </div>
        <div>
          <span>{typeof localViewCount === "number" ? localViewCount : 0} views</span>
        </div>
      </div>
      {/* Reactions row */}
      <div className="flex items-center justify-center px-4 py-1 text-gray-500 text-sm gap-2">
        <LikeButton
          liked={liked}
          likeCount={likeCount}
          loading={likeLoading}
          onLike={handleLike}
          variant="button"
          className={`flex-1 flex flex-col items-center py-2 rounded cursor-pointer transition ${liked ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"}`}
          tabIndex={-1}
          style={{ background: "none", border: "none" }}
        >
          <FaRegThumbsUp size={20} color={liked ? "#1877f2" : "#65676b"} />
          <span className="text-xs mt-1">{liked ? "Liked" : "Like"}</span>
        </LikeButton>
        <button
          className="flex-1 flex flex-col items-center py-2 hover:bg-gray-100 rounded cursor-pointer transition"
          tabIndex={-1}
          onClick={handleComment}
        >
          <FaRegComment size={20} color="#65676b" />
          <span className="text-xs mt-1">Comment</span>
        </button>
        <button
          className="flex-1 flex flex-col items-center py-2 hover:bg-gray-100 rounded cursor-pointer transition"
          tabIndex={-1}
          onClick={handleShare}
        >
          <FaShare size={20} color="#65676b" />
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
    </Card>
  );

  if (isSingleView) {
    return <div className="block group">{cardContent}</div>;
  }
  // In all posts view, make the card itself clickable except for the avatar
  return (
    <div
      className="block group"
      style={{ cursor: "pointer" }}
      tabIndex={0}
      onClick={e => {
        // Prevent navigation if the avatar was clicked
        if (
          e.target.closest(".avatar-profile-link") ||
          (e.target.classList && e.target.classList.contains("avatar-profile-link"))
        ) {
          return;
        }
        navigate(`/post/${id}`);
      }}
    >
      {React.cloneElement(cardContent, {
        // Add a class to the avatar for detection
        children: React.Children.map(cardContent.props.children, child => {
          if (!child) return child;
          if (
            child.type === "div" &&
            child.props.className &&
            child.props.className.includes("flex items-center gap-3")
          ) {
            // Add a class to the avatar for detection
            const avatar = React.Children.toArray(child.props.children)[0];
            if (React.isValidElement(avatar) && avatar.type === Avatar) {
              return React.cloneElement(child, {
                children: [
                  React.cloneElement(avatar, {
                    className: (avatar.props.className || "") + " avatar-profile-link"
                  }),
                  ...React.Children.toArray(child.props.children).slice(1)
                ]
              });
            }
          }
          return child;
        })
      })}
    </div>
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

  // Use Avatar.tsx for comment author
  // Try to get username from comment.username, fallback to slugified author
  const commentUsername =
    comment.username ||
    (comment.author ? comment.author.replace(/\s+/g, "").toLowerCase() : undefined);
  const profileUrl =
    commentUsername && typeof commentUsername === "string" && commentUsername.trim().length > 0
      ? `${window.location.origin}/user/${commentUsername}`
      : undefined;

  return (
    <div className="border-t pt-2 mt-2 ml-4 flex gap-2 items-start">
      <Avatar
        src={comment.avatar && comment.avatar.length > 0
          ? comment.avatar
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author)}&background=0D8ABC&color=fff`}
        alt={comment.author}
        size={32}
        profileUrl={profileUrl}
        className="avatar-profile-link"
      />
      <div className="flex-1">
        <div
          className="text-sm"
          dangerouslySetInnerHTML={{ __html: comment.content }}
        />
        <div className="text-xs text-gray-500 flex justify-between">
          <a
            className="hover:underline cursor-pointer"
            href={profileUrl}
            onClick={e => {
              if (profileUrl) {
                e.preventDefault();
                window.location.assign(profileUrl);
              }
            }}
          >
            By {comment.author}
          </a>
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
              actionLabel="Reply"
            />
          </div>
          <Button type="submit" disabled={replyLoading} style={{ height: 40 }}>
            {replyLoading ? "Posting..." : "Reply"}
          </Button>
          {replyError && <div className="text-red-600 mb-2">{replyError}</div>}
        </form>
        {renderComments(comments, comment.id, handleAddComment)}
      </div>
    </div>
  );
}

function renderTextBeforeMedia(html) {
  try {
    if (typeof window === "undefined" || typeof window.DOMParser === "undefined") {
      return <span dangerouslySetInnerHTML={{ __html: html }} />;
    }
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const nodes = Array.from(doc.body.childNodes);

    // Separate text and media nodes
    const textNodes = [];
    const mediaNodes = [];
    nodes.forEach((node, i) => {
      if (
        node.nodeType === 3 || // Text node
        (node.nodeType === 1 && node.tagName !== "IMG" && node.tagName !== "VIDEO")
      ) {
        textNodes.push(node);
      } else if (node.nodeType === 1 && (node.tagName === "IMG" || node.tagName === "VIDEO")) {
        mediaNodes.push(node);
      }
    });

    // Helper to convert DOM node to React element
    function domToReact(node, key) {
      if (node.nodeType === 3) {
        return node.textContent;
      }
      if (node.nodeType === 1) {
        if (node.tagName === "IMG") {
          const src = node.getAttribute("src");
          return (
            <MediaPlayer
              key={key}
              src={src}
              type="image"
              alt=""
              style={{ maxWidth: "100%", borderRadius: 8, margin: "8px 0" }}
            />
          );
        }
        if (node.tagName === "VIDEO") {
          const src = node.getAttribute("src");
          return (
            <MediaPlayer
              key={key}
              src={src}
              type="video"
              style={{ maxWidth: "100%", borderRadius: 8, margin: "8px 0" }}
            />
          );
        }
        if (node.tagName === "AUDIO") {
          const src = node.getAttribute("src");
          return (
            <MediaPlayer
              key={key}
              src={src}
              type="audio"
              style={{ maxWidth: "100%", borderRadius: 8, margin: "8px 0" }}
            />
          );
        }
        // Handle void elements (e.g., hr, br, input, etc.)
        const voidTags = ["HR", "BR", "INPUT", "IMG", "AREA", "BASE", "COL", "EMBED", "LINK", "META", "PARAM", "SOURCE", "TRACK", "WBR"];
        if (voidTags.includes(node.tagName)) {
          return React.createElement(
            node.tagName.toLowerCase(),
            { key, ...Object.fromEntries(Array.from(node.attributes).map(attr => [attr.name, attr.value])) }
          );
        }
        // For other elements, recursively render children
        return React.createElement(
          node.tagName.toLowerCase(),
          { key, ...Object.fromEntries(Array.from(node.attributes).map(attr => [attr.name, attr.value])) },
          Array.from(node.childNodes).map((child, idx) => domToReact(child, `${key}-${idx}`))
        );
      }
      return null;
    }

    return (
      <>
        {textNodes.map((node, i) => domToReact(node, `text-${i}`))}
        {mediaNodes.map((node, i) => domToReact(node, `media-${i}`))}
      </>
    );
  } catch (err) {
    // Fallback to raw HTML if parsing fails
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  }
}

export default PostCard;
