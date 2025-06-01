import React from "react";
import { IoSend } from "react-icons/io5";

const TiptapPostButton = ({
  editor,
  selectedMedia,
  mediaTitleInput,
  onNext,
  actionLabel = "Next",
  mini = false
}) => {
  // Helper to check for media tags in HTML
  function hasMedia(html) {
    if (!html) return false;
    return /<(img|video|audio|embed)\b/i.test(html);
  }

  return (
    <button
      className={
        mini
          ? "p-0 m-0 bg-transparent border-none shadow-none flex items-center justify-center"
          : `w-full py-2 rounded-lg font-semibold text-white transition-colors ${
              (editor.getText().trim() || hasMedia(editor.getHTML()))
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed"
            }`
      }
      style={mini ? { background: "transparent", boxShadow: "none", border: "none" } : {}}
      disabled={!(editor.getText().trim() || hasMedia(editor.getHTML()))}
      onClick={() => {
        // Always update the media node's title with the latest input before posting
        if (selectedMedia && typeof mediaTitleInput !== "undefined" && editor && selectedMedia.src) {
          const { state, view } = editor;
          let tr = state.tr;
          let found = false;
          state.doc.descendants((node, pos) => {
            if (
              ["audio", "video", "image", "pdfembed"].includes(node.type.name) &&
              node.attrs &&
              node.attrs.src === selectedMedia.src &&
              !found
            ) {
              tr = tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                title: mediaTitleInput
              });
              found = true;
              return false;
            }
            return true;
          });
          if (found) {
            view.dispatch(tr);
            editor.commands.focus('end');
          }
        }
        // After updating, get the latest HTML and extract the media title
        if ((editor.getText().trim() || hasMedia(editor.getHTML())) && typeof onNext === "function") {
          let mediaTitleToSend = mediaTitleInput && mediaTitleInput.trim() ? mediaTitleInput.trim() : undefined;
          if (!mediaTitleToSend) {
            const html = editor.getHTML();
            if (html) {
              const match = html.match(/<(audio|video|img|embed)[^>]*title="([^"]+)"[^>]*>/i);
              if (match && match[2]) {
                mediaTitleToSend = match[2];
              }
            }
          }
          // Always pass the selected thumbnail if present
          let thumbnailToSend = undefined;
          // Only use backend URL for thumbnail, never blob URL
          if (selectedMedia && selectedMedia.thumbnail && !selectedMedia.thumbnail.startsWith("blob:")) {
            thumbnailToSend = selectedMedia.thumbnail;
          } else {
            thumbnailToSend = undefined;
          }
          onNext(editor, selectedMedia, mediaTitleToSend, thumbnailToSend);
          // Do NOT clear the editor here; let the parent clear after successful post
        }
      }}
    >
      {mini ? (
        <IoSend
          size={28}
          className={
            (editor.getText().trim() || hasMedia(editor.getHTML()))
              ? "text-blue-600"
              : "text-gray-400"
          }
        />
      ) : actionLabel}
    </button>
  );
};

export default TiptapPostButton;
