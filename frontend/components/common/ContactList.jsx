import React from "react";
import Avatar from "@components/layout/Avatar";
import useContacts from "@hooks/useContacts";

/**
 * ContactList - Reusable list of users/contacts.
 * @param {function} onSelect - Callback when a user is selected.
 * @param {string} selectedId - Currently selected user id.
 * @param {function} onClose - Callback to close the list/modal.
 * @param {boolean} show - Whether to show the list/modal.
 * @param {Object} loggedInUser - The currently logged-in user.
 */
const ContactList = ({ onSelect, selectedId, onClose, show = false, loggedInUser }) => {
  const { users, loading } = useContacts(loggedInUser);
  if (!show) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="rounded-2xl shadow-lg p-6 w-96 max-h-[80vh] flex flex-col"
        style={{ background: "none" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Select Contact</h3>
          <button
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold px-2"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {loading && (
            <div className="text-gray-400 text-center mt-8">Loading contacts...</div>
          )}
          {!loading && users.length === 0 && (
            <div className="text-gray-400 text-center mt-8">No contacts found</div>
          )}
          {users.map(user => (
            <button
              key={user.id}
              className={`flex items-center gap-4 w-full px-2 py-3 rounded-xl mb-2 transition ${
                user.id === selectedId
                  ? "bg-blue-50 ring-2 ring-blue-400"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => {
                onSelect(user);
                onClose();
              }}
            >
              <div className="relative">
                <Avatar src={user.avatar} alt={user.name} size={48} />
                {user.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900">{user.full_name || user.name}</div>
                <div className="text-xs text-gray-500">{user.bio || user.role}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactList;
