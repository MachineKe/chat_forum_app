import React from "react";
import Avatar from "@components/layout/Avatar";
import { FiMoreHorizontal } from "react-icons/fi";

/**
 * ChatList - Sidebar for chat users with search.
 * @param {Object[]} users - List of chat users.
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
}) => (
  <aside className="w-80 bg-white rounded-2xl shadow-lg p-6 flex flex-col h-[90vh] min-h-[90vh]">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold">Chats</h2>
      <button className="text-gray-400 hover:text-gray-600">
        <FiMoreHorizontal size={24} />
      </button>
    </div>
    <input
      type="text"
      placeholder="Search..."
      className="mb-4 px-5 py-2 rounded-full border bg-gray-50 focus:outline-none shadow-inner"
      value={search}
      onChange={e => setSearch(e.target.value)}
    />
    <div className="flex-1 overflow-y-auto pr-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
      {users.length === 0 && (
        <div className="text-gray-400 text-center mt-8">No chats found</div>
      )}
      {users.map(user => (
        <button
          key={user.id}
          className={`flex items-center gap-4 w-full px-2 py-3 rounded-xl mb-2 transition ${
            user.id === selectedUserId
              ? "bg-blue-50 ring-2 ring-blue-400"
              : "hover:bg-gray-100"
          }`}
          onClick={() => onSelectUser(user.id)}
        >
          <div className="relative">
            <Avatar src={user.avatar} alt={user.name} size={56} />
            {user.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold text-gray-900">{user.name}</div>
            <div className="text-xs text-gray-500">{user.role}</div>
          </div>
          <div className="text-xs text-gray-400">{user.lastMessageTime || user.lastActive}</div>
        </button>
      ))}
    </div>
  </aside>
);

export default ChatList;
