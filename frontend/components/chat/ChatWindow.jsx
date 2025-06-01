import React, { useRef, useEffect, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatBubble from "../layout/ChatBubble";
import Input from "../layout/Input";
import Button from "../layout/Button";
import { FiPaperclip, FiMic, FiSend } from "react-icons/fi";
import RichMediaInputMini from "../common/RichMediaInputMini";
import MediaPlayer from "../media/MediaPlayer";

const ChatWindow = ({
  user,
  loggedInUser,
  messages,
  onSendMessage,
  onAttach,
  onRecord,
  onVideoCall,
}) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <section className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl shadow-lg h-full min-h-0">
      <ChatHeader user={user} onVideoCall={onVideoCall} className="rounded-t-2xl" />
      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6 space-y-2">
        {(Array.isArray(messages) ? messages : []).map((msg) => {
          const isOwn = msg.sender_id === loggedInUser?.id;
          // Relative time formatter
          function getRelativeTime(date) {
            if (!date) return "";
            const now = new Date();
            const d = new Date(date);
            const diff = Math.floor((now - d) / 1000);
            if (diff < 60) return "just now";
            if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
            if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
            return d.toLocaleDateString();
          }
          const showBubble = msg.content && msg.content.trim() !== "";
          const showMedia = (msg.media_path || msg.media_src) && msg.media_type;
          // Arrange: avatar | (media, text, meta) in a column
          return (
            <div key={msg.id} className={`mb-6 flex ${isOwn ? "justify-end" : "justify-start"}`}>
              {!isOwn && (
                <img
                  src={user?.avatar || ""}
                  alt={user?.full_name || user?.name || "User"}
                  className="w-10 h-10 rounded-full object-cover mr-4 mt-1 flex-shrink-0"
                  style={{ alignSelf: "flex-start" }}
                />
              )}
              <div className="flex flex-col items-start max-w-md w-full">
                {showMedia && (
                  <div className="w-full mb-2">
                    <MediaPlayer
                      src={msg.media_path || msg.media_src}
                      type={msg.media_type}
                      title={msg.media_title}
                      thumbnail={msg.thumbnail}
                      className="rounded-xl"
                      style={{ width: "100%", maxWidth: 420, minWidth: 180, minHeight: 80 }}
                      mini
                    />
                  </div>
                )}
                {showBubble && (
                  <div className="w-full mb-2">
                    <ChatBubble
                      message={msg.content}
                      isOwn={isOwn}
                      sender={null}
                      time={null}
                      avatar={null}
                    />
                  </div>
                )}
                {(showBubble || showMedia) && (
                  <div className={`flex items-center gap-2 text-xs text-gray-400 mt-1 ml-1 ${isOwn ? "self-end" : "self-start"}`}>
                    <span>{isOwn ? "You" : user?.full_name || user?.name || "User"}</span>
                    <span>, {getRelativeTime(msg.created_at)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-8 py-4 bg-white rounded-b-2xl">
        <div style={{ maxHeight: "27vh", width: "100%", overflowY: "auto" }}>
          <RichMediaInputMini
            user={loggedInUser}
            onSubmit={payload => {
              // Strip HTML tags from content
              const html = payload.content || "";
              const tempDiv = document.createElement("div");
              tempDiv.innerHTML = html;
              const plainText = tempDiv.textContent || tempDiv.innerText || "";
              if (!plainText.trim() && !payload.media_id && !payload.media_src) return;
              onSendMessage(null, { ...payload, content: plainText });
              payload.reset();
            }}
            placeholder="Type a message"
            actionLabel="Send"
            minHeight={48}
          />
        </div>
      </div>
    </section>
  );
};

export default ChatWindow;
