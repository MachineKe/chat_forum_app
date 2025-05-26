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

  async function handleReply() {
    if (!reply.trim() && !replyMediaId) return;
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
          content: reply,
          parent_id: null,
          media_id: replyMediaId || undefined,
          media_type: replyMediaType || undefined
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
      fetch(`/api/posts/${id}/comments`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setComments(data);
        });
    } catch {
      alert("Network error.");
    }
  }

  async function handleCommentReply(parentId, content, mediaId, mediaType) {
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
          media_type: mediaType || replyMediaTypes[parentId] || undefined
        }),
      });
      if (!res.ok) {
        alert("Failed to post reply.");
        return;
      }
      fetch(`/api/posts/${id}/comments`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setComments(data);
        });
    } catch {
      alert("Network error.");
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!post) return <div className="p-8 text-center">Post not found.</div>;

  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      <div className="max-w-7xl mx-auto flex flex-row justify-center gap-8 pt-6">
        <Sidebar title="EPRA" />
        <main className="flex-1 max-w-xl w-full">
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
            user={user}
          />
          <div className="flex justify-center px-4 py-4 border-b">
            <div className="w-full max-w-lg">
              {isReplyEditorActive ? (
                <TiptapEditor
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
        </main>
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

export default PostDetail;
