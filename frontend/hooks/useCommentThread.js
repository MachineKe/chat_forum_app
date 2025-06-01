import { useState } from "react";
import { useNavigate } from "react-router-dom";

// All business logic for CommentThread component
export default function useCommentThread({ comments }) {
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const navigate = useNavigate();

  // Group comments by parent_id
  const grouped = {};
  comments.forEach(c => {
    const pid = c.parent_id || "root";
    if (!grouped[pid]) grouped[pid] = [];
    grouped[pid].push(c);
  });

  return {
    replyingToCommentId,
    setReplyingToCommentId,
    expandedReplies,
    setExpandedReplies,
    grouped,
    navigate,
  };
}
