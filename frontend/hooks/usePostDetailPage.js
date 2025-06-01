import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// All business logic for PostDetail page
export default function usePostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [replyMediaId, setReplyMediaId] = useState(null);
  const [replyMediaType, setReplyMediaType] = useState(null);
  const [isReplyEditorActive, setIsReplyEditorActive] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    setLoading(true);
    fetch(`/api/posts/${id}`)
      .then(res => res.json())
      .then(data => {
        setPost(data);
        setLoading(false);
      });
    fetch(`/api/posts/${id}/comments`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setComments(data);
      });
  }, [id]);

  async function handleReply(editor, selectedMedia, mediaTitleToSend, thumbnailToSend) {
    let replyContent = reply;
    let replyMediaIdVal = replyMediaId;
    let replyMediaTypeVal = replyMediaType;
    if (editor && typeof editor.getHTML === "function") {
      replyContent = editor.getHTML();
    }
    if (selectedMedia && selectedMedia.id) {
      replyMediaIdVal = selectedMedia.id;
      replyMediaTypeVal = selectedMedia.type;
    }
    if (!replyContent.trim() && !replyMediaIdVal) return;
    if (!user || !user.email) {
      alert("You must be logged in to reply.");
      return;
    }
    let userId = null;
    try {
      const res = await fetch(`/api/auth/user-by-email?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data && data.id) {
        userId = data.id;
      }
    } catch {
      alert("Failed to fetch user info.");
      return;
    }
    if (!userId) {
      alert("User not found.");
      return;
    }
    let mediaTitle = mediaTitleToSend;
    if (!mediaTitle && replyContent) {
      const match = replyContent.match(/<(audio|video|img|embed)[^>]*title="([^"]+)"[^>]*>/i);
      if (match && match[2]) {
        mediaTitle = match[2];
      }
    }
    try {
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          content: replyContent,
          parent_id: null,
          media_id: replyMediaIdVal || undefined,
          media_type: replyMediaTypeVal || undefined,
          media_title: mediaTitle || undefined,
          thumbnail: thumbnailToSend || undefined
        }),
      });
      if (!res.ok) {
        alert("Failed to post reply.");
        return;
      }
      setReply("");
      setReplyMediaId(null);
      setReplyMediaType(null);
      setIsReplyEditorActive(false);
      fetchComments();
    } catch {
      alert("Network error.");
    }
  }

  async function handleCommentReply(parentId, content, mediaId, mediaTitle, thumbnail, mediaType) {
    if (!content.trim() && !mediaId) return;
    if (!user || !user.email) {
      alert("You must be logged in to reply.");
      return;
    }
    let userId = null;
    try {
      const res = await fetch(`/api/auth/user-by-email?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data && data.id) {
        userId = data.id;
      }
    } catch {
      alert("Failed to fetch user info.");
      return;
    }
    if (!userId) {
      alert("User not found.");
      return;
    }
    try {
      const payload = {
        user_id: userId,
        content,
        parent_id: parentId,
        media_id: mediaId || undefined,
        media_title: mediaTitle || undefined,
        thumbnail: thumbnail || undefined,
        media_type: mediaType || undefined
      };
      console.log("DEBUG: handleCommentReply payload", payload);
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        alert("Failed to post reply.");
        return;
      }
      fetchComments();
    } catch {
      alert("Network error.");
    }
  }

  function fetchComments() {
    fetch(`/api/posts/${id}/comments`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setComments(data);
      });
  }

  return {
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
  };
}
