import React from "react";

const ChatBubble = ({ message, isOwn }) => (
  <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
    <div
      className={`max-w-xs px-4 py-2 rounded-lg shadow ${
        isOwn
          ? "bg-blue-500 text-white rounded-br-none"
          : "bg-gray-200 text-gray-900 rounded-bl-none"
      }`}
    >
      {message}
    </div>
  </div>
);

export default ChatBubble;
