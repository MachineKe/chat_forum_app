import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TiptapEditor from "../components/TiptapEditor";
import { FaRegThumbsUp, FaRegComment, FaShare } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import PostCard from "../components/PostCard";
import CommentThread from "../components/CommentThread";
import ExpandingCommentInput from "../components/ExpandingCommentInput";

const mockAvatar = "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [isReplyActive, setIsReplyActive] = useState(false);
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [commentReplyContent, setCommentReplyContent] = useState("");
  const [isCommentReplyEditorActive, setIsCommentReplyEditorActive] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [showCommentEditor, setShowCommentEditor] = useState(false);

  // Like state
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Ref for comment input
  const commentInputRef = useRef(null);

  // Get curren
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

  const hasCountedView = useRef(false);

  useEffect(() => {
    setLoading(true);
    if (hasCountedView.current) {
      // Prevent double increment in React Strict Mode
      fetch(`/api/posts/${id}`)
        .then(res => res.json())
        .then(data => {
          setPost(data);
          setLoading(false);
        });
      return;
    }
    hasCountedView.current = true;
    // Increment view count only once per mount
    fetch(`/api/posts/${id}/view`, { method: "POST" })
      .then(() => {
        fetch(`/api/posts/${id}`)
          .then(res => res.json())
          .then(data => {
            setPost(data);
            setLoading(false);
          });
      });
  }, [id]);

  // Always fetch comments on mount and when id changes
  useEffect(() => {
    fetch(`/api/posts/${id}/comments`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          console.log("Fetched comments for post", id, data);
          setComments(data);
        }
      });
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!post) return <div className="p-8 text-center">Post not found.</div>;

  // Debug: log post object to inspect available fields
  console.log("Single post view post object:", post);

  // Real view count
  const viewCount = typeof post.viewCount === "number" ? post.viewCount : 0;

  // Add this function to handle posting a reply
  async function handleReply() {
    if (!reply.trim()) return;
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.email) {
      alert("You must be logged in to reply.");
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
      alert("Failed to fetch user info.");
      return;
    }
    if (!userId) {
      alert("User not found.");
      return;
    }
    // Post reply (top-level comment)
    try {
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          content: reply,
          parent_id: null,
        }),
      });
      if (!res.ok) {
        alert("Failed to post reply.");
        return;
      }
      setReply("");
      // Refresh comments
      fetch(`/api/posts/${id}/comments`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setComments(data);
        });
    } catch {
      alert("Network error.");
    }
  }

  // Handle replying to a comment (nested reply)
  async function handleCommentReply(parentId, content) {
    if (!content.trim()) return;
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.email) {
      alert("You must be logged in to reply.");
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
      alert("Failed to fetch user info.");
      return;
    }
    if (!userId) {
      alert("User not found.");
      return;
    }
    // Post reply (nested comment)
    try {
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          content,
          parent_id: parentId,
        }),
      });
      if (!res.ok) {
        alert("Failed to post reply.");
        return;
      }
      setCommentReplyContent("");
      setReplyingToCommentId(null);
      setIsCommentReplyEditorActive(false);
      // Refresh comments
      fetch(`/api/posts/${id}/comments`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setComments(data);
        });
    } catch {
      alert("Network error.");
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      <div className="max-w-7xl mx-auto flex flex-row justify-center gap-8 pt-6">
        {/* Left Sidebar */}
        <Sidebar title="EPRA" />
        {/* Center Single Post */}
        <main className="flex-1 max-w-xl w-full">
          {/* Top bar */}
          <div className="w-full flex items-center px-4 py-3 border-b sticky top-0 bg-white z-10">
            <button
              className="mr-2 text-gray-700 hover:bg-gray-100 rounded-full p-2"
              onClick={() => navigate(-1)}
              aria-label="Back"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="font-bold text-lg">Post</div>
          </div>
          {/* Post card */}
          {console.log("Post object in PostDetail:", post)}
          <PostCard
            id={post.id}
            content={post.content}
            author={post.author}
            avatar={post.avatar}
            createdAt={post.createdAt}
            commentCount={comments.length}
            viewCount={viewCount}
            username={post.username || post.authorUsername}
            alwaysShowComments={false}
            isSingleView={true}
          />
          {/* Reply input */}
          <div className="flex justify-center px-4 py-4 border-b">
            <div className="w-full max-w-lg">
              <ExpandingCommentInput
                value={reply}
                onChange={setReply}
                onSubmit={handleReply}
                placeholder="Write a comment..."
                minHeight={80}
                actionLabel="Comment"
              />
            </div>
          </div>
          {/* Comments section */}
          <CommentThread
            comments={comments}
            postId={post.id}
            onReply={handleCommentReply}
            loading={loading}
            fetchComments={() => {
              fetch(`/api/posts/${id}/comments`)
                .then(res => res.json())
                .then(data => {
                  if (Array.isArray(data)) setComments(data);
                });
            }}
          />
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
                <div className="font-semibold text-gray-900">Khwisero's Finest</div>
                <div className="text-xs text-gray-500">@Dredo_ltd</div>
              </div>
              <button className="bg-black text-white rounded-full px-4 py-1 text-sm font-semibold hover:bg-gray-900">Follow</button>
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
          return (
            <img
              key={key}
              src={node.getAttribute("src")}
              alt=""
              style={{ maxWidth: "100%", borderRadius: 8, margin: "8px 0" }}
            />
          );
        }
        if (node.tagName === "VIDEO") {
          return (
            <video
              key={key}
              src={node.getAttribute("src")}
              controls
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

export default PostDetail;
