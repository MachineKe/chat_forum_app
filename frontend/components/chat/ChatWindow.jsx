import React, { useRef, useEffect, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatBubble from "../layout/ChatBubble";
import Input from "../layout/Input";
import Button from "../layout/Button";
import { FiPaperclip, FiMic, FiSend } from "react-icons/fi";
import RichMediaInputMini from "../common/RichMediaInputMini";

const ChatWindow = ({
  user,
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
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg.text}
            isOwn={msg.isOwn}
            sender={msg.isOwn ? "You" : user.name}
            time={msg.time}
            avatar={msg.avatar}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-8 py-4 bg-white rounded-b-2xl">
        <div style={{ maxHeight: "27vh", width: "100%", overflowY: "auto" }}>
          <RichMediaInputMini
            user={user}
            onSubmit={({ content, reset }) => {
              if (!content.trim()) return;
              onSendMessage(content);
              reset();
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
