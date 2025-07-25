import React from "react";
import Avatar from "@components/layout/Avatar";
import { FiMoreHorizontal, FiEdit2 } from "react-icons/fi";

/**
 * ChatList - Sidebar for chat users with search.
 * @param {Object[]} users - List of chat users (with latest message preview).
 * @param {string} search - Search query.
 * @param {function} setSearch - Set search query.
 * @param {string} selectedId - Currently selected user id.
 * @param {function} onSelect - Callback when user is selected.
 */
const ChatList = ({
  users = [],
  search = "",
  setSearch = () => {},
  selectedUserId,
  onSelectUser,
  onNewMessage,
  loading = false,
}) => (
  <aside className="w-80 bg-white rounded-2xl shadow-lg p-6 flex flex-col flex-1 min-h-0 h-full">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold">Chats</h2>
      <div className="flex items-center gap-2">
        <button
          className="text-gray-400 hover:text-blue-500 p-1 rounded-full"
          title="New message"
          aria-label="New message"
          onClick={onNewMessage}
        >
          <FiEdit2 size={22} />
        </button>
        <button className="text-gray-400 hover:text-gray-600">
          <FiMoreHorizontal size={24} />
        </button>
      </div>
    </div>
    <input
      type="text"
      placeholder="Search..."
      className="mb-4 px-5 py-2 rounded-full border bg-gray-50 focus:outline-none shadow-inner"
      value={search}
      onChange={e => setSearch(e.target.value)}
    />
    <div className="flex-1 min-h-0 overflow-y-auto pr-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
      {loading ? (
        <div className="text-gray-400 text-center mt-8">Loading chats...</div>
      ) : users.length === 0 ? (
        <div className="text-gray-400 text-center mt-8">No chats found</div>
      ) : users.map(user => (
        <button
          key={user.id}
          className={`flex items-center gap-4 w-full px-2 py-3 rounded-xl mb-2 transition ${
            user.id === selectedUserId
              ? "bg-blue-50 ring-2 ring-blue-400 ml-[1px] mt-[1px]"
              : "hover:bg-gray-100 ml-[1px] mt-[1px]"
          }`}
          onClick={() => onSelectUser(user.id)}
        >
          <div className="relative">
            <Avatar src={user.avatar} alt={user.full_name || user.name} size={56} />
            {user.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="flex-1 text-left flex flex-col">
            <div className="font-semibold text-gray-900">{user.full_name || user.name}</div>
            <div className="text-xs flex items-center">
              <span className="text-gray-500 truncate max-w-[120px]">{user.lastMessage || user.bio || user.role}</span>
              {user.lastMessageTime && (
                <span className="text-gray-400 ml-2 whitespace-nowrap flex-shrink-0">{getRelativeTime(user.lastMessageTime)}</span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  </aside>
);

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

export default ChatList;
