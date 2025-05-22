import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";

/**
 * RichTextEditor - a reusable rich text editor component using Tiptap.
 * Props:
 * - value: string (required)
 * - onChange: function (required)
 * - placeholder: string
 * - editable: boolean
 * - minHeight: number (default 100)
 * - className: string
 * - style: object
 * - toolbar: boolean (default true)
 */
const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Enter rich text...",
  editable = true,
  minHeight = 100,
  className = "",
  style = {},
  toolbar = true,
  ...props
}) => {
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
    <div className={`w-full ${className}`} style={style} {...props}>
      {toolbar && (
        <div className="flex items-center gap-2 mb-2">
          {/* Example toolbar: bold, italic, underline, link, image, youtube */}
          <button
            type="button"
            className={`px-2 py-1 rounded ${editor.isActive("bold") ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            aria-label="Bold"
          >
            <b>B</b>
          </button>
          <button
            type="button"
            className={`px-2 py-1 rounded ${editor.isActive("italic") ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Italic"
          >
            <i>I</i>
          </button>
          <button
            type="button"
            className={`px-2 py-1 rounded ${editor.isActive("strike") ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            aria-label="Strike"
          >
            <s>S</s>
          </button>
          <button
            type="button"
            className={`px-2 py-1 rounded ${editor.isActive("link") ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
            onClick={() => {
              const url = window.prompt("Enter URL");
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            aria-label="Link"
          >
            🔗
          </button>
          <button
            type="button"
            className="px-2 py-1 rounded bg-gray-100 text-gray-700"
            onClick={() => {
              const url = window.prompt("Enter image URL");
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }}
            aria-label="Image"
          >
            🖼️
          </button>
          <button
            type="button"
            className="px-2 py-1 rounded bg-gray-100 text-gray-700"
            onClick={() => {
              const url = window.prompt("Enter YouTube URL");
              if (url) {
                editor.chain().focus().setYoutubeVideo({ src: url }).run();
              }
            }}
            aria-label="YouTube"
          >
            ▶️
          </button>
        </div>
      )}
      <EditorContent
        editor={editor}
        className="w-full min-h-[80px] text-lg text-gray-900 font-normal outline-none border border-gray-200 rounded px-2 py-2 bg-white"
        style={{
          minHeight,
          fontSize: 16,
          background: "white",
          resize: "vertical",
        }}
        placeholder={placeholder}
      />
      <style>
        {`
          .ProseMirror:focus {
            outline: none;
          }
        `}
      </style>
      {placeholder && !editor.getText() && (
        <div
          className="absolute left-0 top-2 px-1 text-gray-400 pointer-events-none text-lg select-none"
          style={{
            zIndex: 1,
            fontSize: 16,
            lineHeight: "2.5rem",
            fontWeight: 400,
            userSelect: "none",
          }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
