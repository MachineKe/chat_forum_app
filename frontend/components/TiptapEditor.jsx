import React, { useEffect, useState } from "react";
import Avatar from "./Avatar";
import Card from "./Card";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";

const toolbarBtn =
  "w-8 h-8 flex items-center justify-center rounded transition-colors border-none outline-none focus:ring-2 focus:ring-blue-500";
const toolbarBtnActive =
  "bg-blue-600 text-white";
const toolbarBtnInactive =
  "bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white";

const iconStyle = { width: 18, height: 18, display: "block" };

const TiptapEditor = ({
  value,
  onChange,
  placeholder = "Add your comment here...",
  editable = true,
  minHeight = 100,
  onNext,
  onClose,
  actionLabel = "Next",
}) => {
  const [tab, setTab] = useState("write");
  // Placeholder user data
  const user = {
    name: "Mark Kiprotich",
    avatar: "https://ui-avatars.com/api/?name=Mark+Kiprotich&background=0D8ABC&color=fff",
    audience: "Public"
  };
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: true }),
      Image,
      Youtube,
    ],
    content: value,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
    // eslint-disable-next-line
  }, [value]);

  if (!editor) return null;

  return (
    <Card
      className="w-full p-0"
      style={{ marginBottom: 16, position: "relative" }}
    >
      {/* Header */}
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
      {/* Editor */}
      <div className="px-4 pb-2">
        <div className="relative min-h-[80px]">
          <EditorContent
            editor={editor}
            className="w-full min-h-[80px] text-lg text-gray-900 font-normal outline-none border-none focus:ring-0 bg-transparent px-0 py-2 borderless-editor"
            style={{
              border: "none",
              outline: "none",
              minHeight: 80,
              fontSize: 20,
              marginTop: 0,
              marginBottom: 0,
              background: "transparent",
              resize: "none",
              boxShadow: "none",
            }}
          />
          <style>
            {`
              .borderless-editor .ProseMirror {
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                background: transparent !important;
                padding: 0 !important;
                min-height: 80px;
              }
            `}
          </style>
          {placeholder && !editor.getText() && (
            <div
              className="absolute left-0 top-2 px-1 text-gray-400 pointer-events-none text-lg select-none"
              style={{
                zIndex: 1,
                fontSize: 20,
                lineHeight: "2.5rem",
                fontWeight: 400,
                userSelect: "none",
              }}
            >
              {placeholder}
            </div>
          )}
        </div>
        {/* "Tip" and emoji row */}
        <div className="flex items-center gap-2 mt-2 mb-2">
          <button className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-gray-700 text-sm font-medium hover:bg-gray-200">
            <span className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white rounded-full px-1.5 py-0.5 font-bold text-lg">Aa</span>
          </button>
          <button className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-gray-700 text-sm font-medium hover:bg-gray-200">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FFD600"/><circle cx="9" cy="10" r="1.5" fill="#333"/><circle cx="15" cy="10" r="1.5" fill="#333"/><path d="M8 15c1.333 1 2.667 1 4 0" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Tip
          </button>
          <button className="ml-auto text-gray-400 hover:text-gray-600 text-xl font-bold px-2 py-1 rounded-full transition-colors" title="More">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
          </button>
        </div>
        {/* Add to your post row */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-2 py-2 mt-2 mb-2 border border-gray-200">
          <span className="text-gray-500 text-sm">Add to your post</span>
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-200"
              title="Photo/Video"
              onClick={() => {
                // Create a hidden file input for image/video
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*,video/*";
                input.onchange = (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    if (file.type.startsWith("image/")) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        editor.chain().focus().setImage({ src: event.target.result }).run();
                      };
                      reader.readAsDataURL(file);
                    } else if (file.type.startsWith("video/")) {
                      const url = URL.createObjectURL(file);
                      editor.chain().focus().setVideo?.({ src: url }).run();
                      // If no setVideo, insert a link or alert
                      if (!editor.commands.setVideo) {
                        editor.chain().focus().insertContent(`<video controls src="${url}" style="max-width:100%"></video>`).run();
                      }
                    }
                  }
                };
                input.click();
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" fill="#34D399"/><circle cx="8.5" cy="8.5" r="1.5" fill="#fff"/><path d="M21 15l-5-5L5 21" stroke="#fff" strokeWidth="2"/></svg>
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
      </div>
      {/* Post button */}
      <div className="px-4 pb-4">
        <button
          className={`w-full py-2 rounded-lg font-semibold text-white transition-colors ${editor.getText().trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"}`}
          disabled={!editor.getText().trim()}
          onClick={() => {
            if (editor.getText().trim() && typeof onNext === "function") {
              console.log("Next button clicked, calling onNext");
              onNext();
            }
          }}
        >
          {actionLabel}
        </button>
      </div>
    </Card>
  );
};

export default TiptapEditor;
