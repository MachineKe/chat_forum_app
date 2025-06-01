import React from "react";
import Avatar from "@components/layout/Avatar";
import { FiPhone, FiVideo, FiMoreHorizontal } from "react-icons/fi";

/**
 * ChatHeader - Header for the chat area.
 * @param {Object} user - The selected chat user.
 */
const ChatHeader = ({ user }) => {
  if (!user) {
    return (
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white rounded-t-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-200" />
          <div>
            <div className="font-semibold text-lg text-gray-400 flex items-center gap-2">
              No user selected
            </div>
            <div className="text-sm text-gray-300">Select a user to start chatting</div>
          </div>
        </div>
      </header>
    );
  }
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white rounded-t-2xl">
      <div className="flex items-center gap-4">
      <Avatar src={user.avatar} alt={user.full_name || user.name} size={56} />
      <div>
        <div className="font-semibold text-lg text-gray-900 flex items-center gap-2">
          {user.full_name || user.name}
          {user.online && (
            <span className="w-3 h-3 bg-green-500 border-2 border-white rounded-full inline-block" />
          )}
        </div>
        <div className="text-sm text-gray-500">{user.bio || user.role}</div>
      </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-blue-500" title="Call">
          <FiPhone size={24} />
        </button>
        <button className="text-gray-400 hover:text-blue-500" title="Video Call">
          <FiVideo size={24} />
        </button>
        <button className="text-gray-400 hover:text-blue-500" title="More">
          <FiMoreHorizontal size={24} />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
