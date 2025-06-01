import React from "react";
import Avatar from "../layout/Avatar";

const TiptapEditorHeader = ({ user, onClose }) => (
  <div className="flex items-center justify-between px-4 pt-4 pb-2">
    <div className="flex items-center gap-3">
      <Avatar
        src={user.avatar}
        alt={user.name}
        size={40}
      />
      <div>
        <div className="font-semibold text-gray-900">{user.name}</div>
        <button className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 hover:bg-gray-200">
          <svg width="14" height="14" fill="currentColor" className="inline" viewBox="0 0 20 20"><path d="M10 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-1v1a4 4 0 0 1-8 0v-1H5a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v1h4V6a2 2 0 0 0-2-2zm-5 5a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H5zm5 7a2 2 0 0 0 2-2v-1H8v1a2 2 0 0 0 2 2z"/></svg>
          {user.audience}
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" className="inline" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
        </button>
      </div>
    </div>
    <button
      className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2 py-1 rounded-full transition-colors"
      title="Close"
      onClick={onClose}
    >
      ×
    </button>
  </div>
);

export default TiptapEditorHeader;
