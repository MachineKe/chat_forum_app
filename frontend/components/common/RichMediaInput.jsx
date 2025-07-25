import React from "react";
import TiptapEditor from "../rich-text/TiptapEditor";
import PlainText from "../rich-text/PlainText";

/**
 * RichMediaInput - unified input for posts, comments, messages, etc.
 * Props:
 * - user: user object (name, avatar)
 * - onSubmit: ({ content, media_id, media_type, media_title, thumbnail, reset }) => void
 * - loading: boolean
 * - placeholder: string
 * - actionLabel: string
 * - minHeight: number
 * - autoFocus: boolean
 * - onCancel: function
 * - initialValue, initialMediaId, initialMediaType, initialMediaTitle: for editing
 */
export default function RichMediaInput({
  user,
  onSubmit,
  loading = false,
  placeholder = "Write something...",
  actionLabel = "Send",
  minHeight = 80,
  autoFocus = false,
  onCancel,
  initialValue = "",
  initialMediaId = null,
  initialMediaType = null,
  initialMediaTitle = "",
}) {
  const [content, setContent] = React.useState(initialValue);
  const [mediaId, setMediaId] = React.useState(initialMediaId);
  const [mediaType, setMediaType] = React.useState(initialMediaType);
  const [mediaTitle, setMediaTitle] = React.useState(initialMediaTitle);
  const [mediaSrc, setMediaSrc] = React.useState(null);
  const [isEditorActive, setIsEditorActive] = React.useState(autoFocus);

  // Reset state on cancel or submit
  const reset = () => {
    setContent("");
    setMediaId(null);
    setMediaType(null);
    setMediaTitle("");
    setIsEditorActive(false);
    if (onCancel) onCancel();
  };

  const handleMediaUpload = (id, type, url, title) => {
    setMediaId(id);
    setMediaType(type);
    setMediaTitle(title || "");
    setMediaSrc(url || null);
  };

  const handleNext = (editorInstance, _selectedMedia, _mediaTitleToSend, thumbnail) => {
    let html = content;
    let titleToSend = mediaTitle;
    if (editorInstance && typeof editorInstance.getHTML === "function") {
      html = editorInstance.getHTML();
      // Try to extract title from HTML if not set
      if (!titleToSend && html) {
        const match = html.match(/<(audio|video|img|embed)[^>]*title="([^"]+)"[^>]*>/i);
        if (match && match[2]) {
          titleToSend = match[2];
        }
      }
    }
    if (!html.trim() && !mediaId) return;
    if (onSubmit) {
      onSubmit({
        content: html,
        media_id: mediaId,
        media_type: mediaType,
        media_title: titleToSend,
        media_src: mediaSrc,
        thumbnail,
        reset,
      });
    }
  };

  return (
    <div style={{ minHeight }}>
      {isEditorActive ? (
        <TiptapEditor
          value={content}
          onChange={setContent}
          onNext={handleNext}
          placeholder={placeholder}
          minHeight={minHeight}
          actionLabel={actionLabel}
          user={user}
          onMediaUpload={handleMediaUpload}
          onClose={reset}
        />
      ) : (
        <PlainText
          user={user}
          placeholder={placeholder}
          onClick={() => setIsEditorActive(true)}
        />
      )}
    </div>
  );
}
