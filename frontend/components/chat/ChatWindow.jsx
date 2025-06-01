import React, { useRef, useEffect, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatBubble from "../layout/ChatBubble";
import Input from "../layout/Input";
import Button from "../layout/Button";
import { FiPaperclip, FiMic, FiSend } from "react-icons/fi";
import RichMediaInputMini from "../common/RichMediaInputMini";

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
    <section className="flex-1 flex flex-col min-w-[500px] bg-white rounded-2xl shadow-lg h-[90vh] min-h-[90vh]">
      <ChatHeader user={user} onVideoCall={onVideoCall} className="rounded-t-2xl" />
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-2" style={{ minHeight: 0 }}>
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
          return (
            <ChatBubble
              key={msg.id}
              message={msg.content}
              isOwn={isOwn}
              sender={isOwn ? "You" : user?.full_name || user?.name || "User"}
              time={getRelativeTime(msg.created_at)}
              avatar={isOwn ? (loggedInUser?.avatar || "") : (user?.avatar || "")}
            />
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
