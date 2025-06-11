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
import useCommentThread from "@hooks/useCommentThread";
import Comment from "@components/comments/Comment";

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
  const {
    replyingToCommentId,
    setReplyingToCommentId,
    expandedReplies,
    setExpandedReplies,
    grouped,
    navigate,
  } = useCommentThread({ comments });

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
            navigate={navigate}
            user={user}
            grouped={grouped}
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
              src={resolveMediaUrl(src)}
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
              src={resolveMediaUrl(src)}
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
              src={resolveMediaUrl(src)}
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
