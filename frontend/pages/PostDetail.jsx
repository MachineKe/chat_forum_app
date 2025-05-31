import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import PostCard from "../components/PostCard";
import CommentThread from "../components/CommentThread";
import PlainText from "../components/PlainText";
import TiptapEditor from "../components/TiptapEditor";
import BackButton from "../components/BackButton";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [replyMediaId, setReplyMediaId] = useState(null);
  const [replyMediaType, setReplyMediaType] = useState(null);
  const [isReplyEditorActive, setIsReplyEditorActive] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMediaIds, setReplyMediaIds] = useState({});
  const [replyMediaTypes, setReplyMediaTypes] = useState({});

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
    // Accepts: editor, selectedMedia, mediaTitleToSend, thumbnailToSend (from TiptapEditor)
    // Fallback for legacy calls
    if (arguments.length === 0) return;
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
    // Extract media title from reply HTML if not provided
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
      if (typeof fetchComments === "function") {
        fetchComments();
      } else {
        fetch(`/api/posts/${id}/comments`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setComments(data);
          });
      }
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
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          content,
          parent_id: parentId,
          media_id: mediaId || undefined,
          media_title: mediaTitle || undefined,
          thumbnail: thumbnail || undefined,
          media_type: mediaType || undefined
        }),
      });
      let errorText = "";
      if (!res.ok) {
        try {
          errorText = await res.text();
        } catch {}
        console.error("Reply post failed:", res.status, errorText);
        alert("Failed to post reply. " + (errorText ? `Server: ${errorText}` : ""));
        return;
      }
      fetch(`/api/posts/${id}/comments`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setComments(data);
        });
    } catch (err) {
      console.error("Network error in handleCommentReply:", err);
      alert("Network error.");
    }
  }

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
              {isReplyEditorActive ? (
                <TiptapEditor
                  key={`reply-editor-${reply === "" ? Date.now() : "active"}`}
                  value={reply}
                  onChange={setReply}
                  onNext={handleReply}
                  placeholder="Write a comment..."
                  minHeight={80}
                  actionLabel="Comment"
                  user={{
                    name: user?.full_name || user?.username || user?.email || "User",
                    avatar:
                      user?.avatar && user?.avatar.length > 0
                        ? user.avatar
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "User")}&background=0D8ABC&color=fff`
                  }}
                  onMediaUpload={(id, type) => {
                    setReplyMediaId(id);
                    setReplyMediaType(type);
                  }}
                  onClose={() => {
                    setReply("");
                    setReplyMediaId(null);
                    setReplyMediaType(null);
                    setIsReplyEditorActive(false);
                  }}
                />
              ) : (
                <PlainText
                  user={{
                    name: user?.full_name || user?.username || user?.email || "User",
                    avatar:
                      user?.avatar && user?.avatar.length > 0
                        ? user.avatar
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "User")}&background=0D8ABC&color=fff`
                  }}
                  placeholder="Write a comment..."
                  onClick={() => setIsReplyEditorActive(true)}
                />
              )}
            </div>
          </div>
          <div className="w-full max-w-2xl mx-auto">
            <CommentThread
              comments={comments.map((c, idx) => {
                // Robustly extract media meta for every comment
                let mediaObj = c.media;
                let mediaType = c.media_type || null;
                let mediaPath = c.media_path || null;

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

                // If this is the root comment and matches the post, merge post media fields
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
              onReply={handleCommentReply}
              loading={loading}
              user={{
                name: user?.full_name || user?.username || user?.email || "User",
                username: user?.username || "",
                avatar:
                  user?.avatar && user?.avatar.length > 0
                    ? user.avatar
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "User")}&background=0D8ABC&color=fff`
              }}
              fetchComments={() => {
                fetch(`/api/posts/${id}/comments`)
                  .then(res => res.json())
                  .then(data => {
                    if (Array.isArray(data)) setComments(data);
                  });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
