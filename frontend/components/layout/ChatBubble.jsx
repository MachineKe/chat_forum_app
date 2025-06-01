import React from "react";
import Avatar from "@components/layout/Avatar";

/**
 * ChatBubble - Message bubble with sender, time, and proper styling.
 * @param {string} message - Message text.
 * @param {boolean} isOwn - If the message is from the current user.
 * @param {string} sender - Sender's name.
 * @param {string} time - Time string.
 * @param {string} avatar - Sender's avatar URL (for non-own messages).
 */
const ChatBubble = ({ message, isOwn, sender, time, avatar }) => (
  <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
    {!isOwn && avatar && (
      <div className="flex-shrink-0 mr-2 self-end">
        <Avatar src={avatar} alt={sender} size={32} />
      </div>
    )}
    <div className="flex flex-col items-start max-w-md">
      <div
        className={`px-5 py-3 rounded-2xl text-base shadow-sm ${
          isOwn
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-gray-100 text-gray-900 rounded-bl-md"
        }`}
        style={{ borderRadius: isOwn ? "18px 18px 6px 18px" : "18px 18px 18px 6px" }}
      >
        {message}
      </div>
      <div className="text-xs text-gray-400 mt-1 ml-1">
        {sender && <span>{sender}</span>}
        {sender && time && <span>, </span>}
        {time}
      </div>
    </div>
  </div>
);

export default ChatBubble;
