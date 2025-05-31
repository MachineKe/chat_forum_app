import React, { useState, useRef } from "react";
import TiptapEditor, { renderMediaPreviewOnly } from "./TiptapEditor";

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
import PlainText from "./PlainText";
import ExcessContentManager from "./ExcessContentManager";
import Avatar from "./Avatar";
import MediaPlayer from "./MediaPlayer";
import LikeButton from "./LikeButton";
import { FaThumbsUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

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
  user,
}) => {
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});

  // Group comments by parent_id
  const grouped = {};
  comments.forEach(c => {
    const pid = c.parent_id || "root";
    if (!grouped[pid]) grouped[pid] = [];
    grouped[pid].push(c);
  });

  // Dedicated Comment component to render a comment and its replies
  function Comment({
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
  }) {
    // Per-reply editor state
    const [isReplyEditorActive, setIsReplyEditorActive] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [replyMedia, setReplyMedia] = useState(null);
    const [replyMediaId, setReplyMediaId] = useState(null);
    const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
    const [liked, setLiked] = useState(comment.liked || false);
    const [likeLoading, setLikeLoading] = useState(false);
    const navigate = useNavigate();

    // Fetch like count and liked status on mount
    React.useEffect(() => {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;
      fetch(`/api/comments/${comment.id}/likes${userId ? `?user_id=${userId}` : ""}`)
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
        const res = await fetch(`/api/comments/${comment.id}/like`, {
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
            // Robust extraction: handle media as object, array, or direct fields
            let mediaObj = comment.media;
            let mediaType = comment.media_type || null;
            let mediaPath = comment.media_path || null;

            // If media is an array, use the first item
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
                    src={mediaPath}
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
                    />
                  )}
                </div>
              )}
            </div>
          )}
          {replyingToCommentId === comment.id && (
            <div className="mt-2">
              <div style={{ minHeight: 120 }}>
                {isReplyEditorActive ? (
                  <TiptapEditor
                    value={replyContent}
                    onChange={setReplyContent}
                    placeholder="Reply..."
                    minHeight={40}
                    actionLabel="Reply"
                    user={user}
                    onMediaUpload={(id, type, url, title) => {
                      setReplyMediaId(id);
                      setReplyMedia({ id, type, url, title: title || "" });
                    }}
                    onNext={(editorInstance, _selectedMedia, _mediaTitleToSend, thumbnail) => {
                      // Ensure latest media title input is written to the editor node before extracting HTML
                      if (
                        editorInstance &&
                        editorInstance.state &&
                        replyMedia &&
                        typeof replyMedia.title !== "undefined" &&
                        replyMedia.src
                      ) {
                        const { state, view } = editorInstance;
                        let tr = state.tr;
                        let found = false;
                        state.doc.descendants((node, pos) => {
                          if (
                            ["audio", "video", "image", "pdfembed"].includes(node.type.name) &&
                            node.attrs &&
                            node.attrs.src === replyMedia.src &&
                            !found
                          ) {
                            tr = tr.setNodeMarkup(pos, undefined, {
                              ...node.attrs,
                              title: replyMedia.title
                            });
                            found = true;
                            return false;
                          }
                          return true;
                        });
                        if (found) {
                          view.dispatch(tr);
                          editorInstance.commands.focus('end');
                        }
                      }
                      // Now extract HTML and media title
                      const html = editorInstance ? editorInstance.getHTML() : replyContent;
                      let mediaTitleToSend = undefined;
                      if (html) {
                        const match = html.match(/<(audio|video|img|embed)[^>]*title="([^"]+)"[^>]*>/i);
                        if (match && match[2]) {
                          mediaTitleToSend = match[2];
                        }
                      }
                      // Fallback: if replyMedia.title is present and mediaTitleToSend is still undefined, use it
                      if (!mediaTitleToSend && replyMedia && typeof replyMedia.title === "string" && replyMedia.title.trim().length > 0) {
                        mediaTitleToSend = replyMedia.title;
                      }
                      if (onReply) onReply(comment.id, html, replyMediaId, mediaTitleToSend, thumbnail, replyMedia && replyMedia.type);
                      setReplyContent("");
                      setReplyMediaId(null);
                      setReplyMedia(null);
                      // Expand replies for this comment after submitting
                      setExpandedReplies(prev => ({ ...prev, [comment.id]: true }));
                      setReplyingToCommentId(null);
                      setIsReplyEditorActive(false);
                      if (fetchComments) fetchComments();
                    }}
                    onClose={() => {
                      setReplyingToCommentId(null);
                      setIsReplyEditorActive(false);
                      setReplyContent("");
                      setReplyMediaId(null);
                      setReplyMedia(null);
                    }}
                    onFocus={() => setIsReplyEditorActive(true)}
                    className=""
                    mediaPreview={renderMediaPreviewOnly(replyContent, replyMedia && replyMedia.title ? replyMedia.title : undefined)}
                  />
                ) : (
                  <PlainText
                    user={user}
                    placeholder="Reply..."
                    onClick={() => setIsReplyEditorActive(true)}
                  />
                )}
              </div>
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
        (grouped["root"] || []).map(comment =>
          <Comment
            key={comment.id}
            comment={comment}
            replies={grouped[comment.id] || []}
            isExpanded={expandedReplies[comment.id]}
            onExpand={() => setExpandedReplies(prev => ({ ...prev, [comment.id]: true }))}
            replyingToCommentId={replyingToCommentId}
            setReplyingToCommentId={setReplyingToCommentId}
            onReply={onReply}
            fetchComments={fetchComments}
            expandedReplies={expandedReplies}
            setExpandedReplies={setExpandedReplies}
          />
        )
      )}
    </div>
  );
};

/**
 * Render HTML content with MediaPlayer for images/videos/audio.
 * Similar to PostSettingsCard and TiptapEditor.
 */
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
        (node.nodeType === 1 && node.tagName !== "IMG" && node.tagName !== "VIDEO" && node.tagName !== "AUDIO")
      ) {
        textNodes.push(node);
      } else if (node.nodeType === 1 && (node.tagName === "IMG" || node.tagName === "VIDEO" || node.tagName === "AUDIO")) {
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
          const title = node.getAttribute("title") || "";
          return (
            <MediaPlayer
              key={key}
              src={src}
              type="image"
              title={title}
              alt=""
              style={{ maxWidth: "100%", borderRadius: 8, margin: "8px 0" }}
            />
          );
        }
        if (node.tagName === "VIDEO") {
          const src = node.getAttribute("src");
          const title = node.getAttribute("title") || "";
          return (
            <MediaPlayer
              key={key}
              src={src}
              type="video"
              title={title}
              style={{ maxWidth: "100%", borderRadius: 8, margin: "8px 0" }}
            />
          );
        }
        if (node.tagName === "AUDIO") {
          const src = node.getAttribute("src");
          const title = node.getAttribute("title") || "";
          return (
            <MediaPlayer
              key={key}
              src={src}
              type="audio"
              title={title}
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

export default CommentThread;
