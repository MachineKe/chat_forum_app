import React from "react";

const TiptapToolbar = ({
  editor,
  setMediaModalOpen,
  setAttachmentModalOpen,
}) => {
  if (!editor) return null;

  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-lg px-2 py-2 mt-2 mb-2 border border-gray-200">
      <span className="text-gray-500 text-sm">Add to your post</span>
      <div className="flex items-center gap-2">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-200"
          title="Photo/Video"
          onClick={() => setMediaModalOpen(true)}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" fill="#34D399"/><circle cx="8.5" cy="8.5" r="1.5" fill="#fff"/><path d="M21 15l-5-5L5 21" stroke="#fff" strokeWidth="2"/></svg>
        </button>
        {/* Attachment Button */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 hover:bg-purple-200"
          title="Attach file (audio, PDF, etc.)"
          onClick={() => setAttachmentModalOpen(true)}
        >
          {/* Paperclip icon */}
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16.5 13.5V7a4.5 4.5 0 0 0-9 0v9a4.5 4.5 0 0 0 9 0V8.5" stroke="#7c3aed" strokeWidth="2" /><rect x="7" y="7" width="10" height="10" rx="5" fill="#ede9fe" /></svg>
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200"
          title="Tag people"
          onClick={() => {
            const tag = prompt("Enter the name to tag:");
            if (tag) {
              editor.chain().focus().insertContent(`<span style="color:#2563eb;font-weight:bold">@${tag}</span> `).run();
            }
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="8" cy="8" r="4" fill="#3B82F6"/><rect x="14" y="14" width="6" height="6" rx="3" fill="#3B82F6"/><rect x="2" y="14" width="10" height="6" rx="3" fill="#3B82F6"/></svg>
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-100 hover:bg-yellow-200"
          title="Feeling/Activity"
          onClick={() => {
            const feeling = prompt("How are you feeling? (e.g. 😊, 🚀, 💡)");
            if (feeling) {
              editor.chain().focus().insertContent(`${feeling} `).run();
            }
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FBBF24"/><circle cx="9" cy="10" r="1.5" fill="#fff"/><circle cx="15" cy="10" r="1.5" fill="#fff"/><path d="M8 15c1.333 1 2.667 1 4 0" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200"
          title="Live video"
          onClick={() => {
            alert("Live video feature coming soon!");
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="13" height="10" rx="2" fill="#EF4444"/><polygon points="17,9 22,12 17,15" fill="#fff"/></svg>
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
          title="More"
          onClick={() => {
            alert("More features coming soon!");
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        </button>
      </div>
    </div>
  );
};

export default TiptapToolbar;
