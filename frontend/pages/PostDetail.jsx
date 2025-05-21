import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TiptapEditor from "../components/TiptapEditor";

const mockAvatar = "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [isReplyActive, setIsReplyActive] = useState(false);

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

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!post) return <div className="p-8 text-center">Post not found.</div>;

  // Placeholder counts
  const likeCount = 3400, commentCount = 11000, shareCount = 71000, viewCount = "16.4M";

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

  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      <div className="max-w-7xl mx-auto flex flex-row justify-center gap-8 pt-6">
        {/* Left Sidebar */}
        <aside className="w-64 hidden lg:flex flex-col gap-2">
          <div className="flex flex-col gap-2 sticky top-6">
            <div className="text-2xl font-bold mb-4 px-4 text-blue-700 tracking-widest">EPRA</div>
            <nav className="flex flex-col gap-1">
              {[
                { icon: "🏠", label: "Home" },
                { icon: "🔍", label: "Explore" },
                { icon: "🔔", label: "Notifications" },
                { icon: "✉️", label: "Messages" },
                { icon: "🔖", label: "Bookmarks" },
                { icon: "💼", label: "Jobs" },
                { icon: "👥", label: "Communities" },
                { icon: "☰", label: "More" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="flex items-center gap-3 px-4 py-2 rounded-full hover:bg-gray-200 text-lg font-medium text-gray-700 transition"
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
            <button className="mt-4 bg-black text-white font-bold rounded-full py-3 text-lg hover:bg-gray-900 transition">Post</button>
            <div className="mt-auto flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-200 cursor-pointer">
              <img
                src={mockAvatar}
                alt="Mark Kiprotich"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold text-gray-900 text-sm">Mark Kiprotich</div>
                <div className="text-xs text-gray-500">@mark_kiprotich_</div>
              </div>
            </div>
          </div>
        </aside>
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
          <div className="w-full bg-white">
            {/* Author row */}
            <div className="flex items-center gap-3 px-4 pt-4">
              <img
                src={mockAvatar}
                alt={post.author}
                className="w-12 h-12 rounded-full object-cover border border-gray-300"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-900">{post.author}</span>
                  <span className="ml-1 text-blue-600" title="Verified">
                    <svg width="18" height="18" fill="#1d9bf0" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1d9bf0"/><path d="M9.5 12.5l2 2 3-3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <span className="text-gray-500 text-sm">@{post.author?.toLowerCase().replace(/\s/g, "")}</span>
                </div>
              </div>
              <button className="bg-black text-white rounded-full px-4 py-1 font-semibold text-sm mr-2">Subscribe</button>
              <button className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2 py-1 rounded-full transition-colors" title="More">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
              </button>
            </div>
            {/* Post content */}
            <div className="px-4 pt-2">
              {/* Optionally, render image/video here */}
              <div
                className="text-gray-900 text-lg mb-2"
                style={{ minHeight: 32 }}
              >
                {renderTextBeforeMedia(post.content)}
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
                <span>1:46 AM · May 20, 2025</span>
                <span>·</span>
                <span className="font-bold">{viewCount} Views</span>
              </div>
            </div>
            {/* Actions row */}
            <div className="flex items-center justify-between px-4 py-3 text-gray-500 text-sm border-b mt-2">
              <div className="flex items-center gap-2">
                <svg width="18" height="18" fill="none" stroke="#65676b" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>{commentCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="18" height="18" fill="none" stroke="#65676b" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 22h10a4 4 0 0 0 4-4v-5a4 4 0 0 0-4-4h-1.28a1 1 0 0 1-.95-.68l-.57-1.71A2 2 0 0 0 12.28 4H7a2 2 0 0 0-2 2v12a4 4 0 0 0 2 3.46V22z" fill="#e4e6eb"/></svg>
                <span>{likeCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="18" height="18" fill="none" stroke="#65676b" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4v16l7-7 7 7V4z" fill="#e4e6eb"/></svg>
                <span>{shareCount.toLocaleString()}</span>
              </div>
            </div>
            {/* Reply input */}
            <div className="flex items-start gap-3 px-4 py-4 border-b">
              <img
                src={mockAvatar}
                alt="You"
                className="w-10 h-10 rounded-full object-cover border border-gray-300"
              />
              <div className="flex-1">
                {isReplyActive ? (
                  <>
                    <TiptapEditor
                      value={reply}
                      onChange={setReply}
                      placeholder="Post your reply"
                      minHeight={40}
                      onBlur={() => {
                        if (!reply.trim()) setIsReplyActive(false);
                      }}
                      onClose={() => setIsReplyActive(false)}
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <button className="p-2 rounded-full hover:bg-gray-100">
                        <svg width="20" height="20" fill="none" stroke="#65676b" strokeWidth="2" viewBox="0 0 24 24"><circle cx="10" cy="10" r="6" /><path d="M14 14l6 6" /></svg>
                      </button>
                      <button className="p-2 rounded-full hover:bg-gray-100">
                        <svg width="20" height="20" fill="none" stroke="#65676b" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" /></svg>
                      </button>
                      <button className="p-2 rounded-full hover:bg-gray-100">
                        <svg width="20" height="20" fill="none" stroke="#65676b" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20v-6M12 4v2m0 0a8 8 0 1 1-8 8" /></svg>
                      </button>
                      <button className="p-2 rounded-full hover:bg-gray-100">
                        <svg width="20" height="20" fill="none" stroke="#65676b" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
                      </button>
                      <button
                        className="ml-auto bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors"
                        onClick={handleReply}
                      >
                        Reply
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    className="w-full min-h-[40px] px-4 py-2 bg-gray-100 rounded-lg text-gray-700 text-base cursor-text border border-gray-200 hover:bg-gray-200 transition"
                    style={{ lineHeight: "2.2rem" }}
                    tabIndex={0}
                    onFocus={() => setIsReplyActive(true)}
                    onClick={() => setIsReplyActive(true)}
                  >
                    {reply ? reply : <span className="text-gray-400">Post your reply</span>}
                  </div>
                )}
              </div>
            </div>
            {/* Replies/comments */}
            <div>
              {comments.length === 0 && (
                <div className="text-gray-400 text-center py-8">No replies yet.</div>
              )}
              {comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-3 px-4 py-4 border-b">
                  <img
                    src={mockAvatar}
                    alt={comment.author}
                    className="w-10 h-10 rounded-full object-cover border border-gray-300"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{comment.author}</span>
                      <span className="text-gray-500 text-xs">@{comment.author?.toLowerCase().replace(/\s/g, "")}</span>
                      <span className="text-gray-400 text-xs">· 1h</span>
                    </div>
                    <div className="text-gray-900 text-base mb-2">
                      {renderTextBeforeMedia(comment.content)}
                    </div>
                    <div className="flex items-center gap-6 text-gray-500 text-xs mt-1">
                      <span className="flex items-center gap-1">
                        <svg width="16" height="16" fill="none" stroke="#65676b" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        16
                      </span>
                      <span className="flex items-center gap-1">
                        <svg width="16" height="16" fill="none" stroke="#65676b" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 22h10a4 4 0 0 0 4-4v-5a4 4 0 0 0-4-4h-1.28a1 1 0 0 1-.95-.68l-.57-1.71A2 2 0 0 0 12.28 4H7a2 2 0 0 0-2 2v12a4 4 0 0 0 2 3.46V22z" fill="#e4e6eb"/></svg>
                        11
                      </span>
                      <span className="flex items-center gap-1">
                        <svg width="16" height="16" fill="none" stroke="#65676b" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4v16l7-7 7 7V4z" fill="#e4e6eb"/></svg>
                        103
                      </span>
                      <span className="flex items-center gap-1">
                        <svg width="16" height="16" fill="none" stroke="#65676b" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
                        54K
                      </span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2 py-1 rounded-full transition-colors" title="More">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
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
                <div className="text-xs text-gray-500">Trending in Kenya</div>
                <div className="font-semibold text-gray-900">Tundu Lissu</div>
                <div className="text-xs text-gray-500">22K posts</div>
              </div>
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
