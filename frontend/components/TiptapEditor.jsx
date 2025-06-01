import React from "react";
import Card from "./Card";
import { EditorContent } from "@tiptap/react";
import Modal from "./Modal";
import Camera from "./Camera";
import AudioRecorder from "./AudioRecorder";
import TiptapEditorHeader from "./TiptapEditorHeader";
import TiptapMediaMetaInput from "./TiptapMediaMetaInput";
import TiptapTipRow from "./TiptapTipRow";
import TiptapToolbar from "./TiptapToolbar";
import TiptapPostButton from "./TiptapPostButton";
import renderMediaPreviewOnly from "./TiptapMediaPreview";
import useTiptapEditor from "./useTiptapEditor";

const TiptapEditor = ({
  value,
  onChange,
  placeholder = "Add your comment here...",
  editable = true,
  minHeight = 100,
  onNext,
  onClose,
  actionLabel = "Next",
  user = { name: "User", avatar: "", audience: "Public" },
  onMediaUpload,
  mediaPreview,
}) => {
  // All business logic and state is now in the custom hook
  const tiptap = useTiptapEditor({
    value,
    onChange,
    editable,
    onMediaUpload,
  });

  if (!tiptap.editor) return null;

  return (
    <Card className="w-full p-0" style={{ marginBottom: 16, position: "relative" }}>
      {/* Header */}
      <TiptapEditorHeader user={user} onClose={onClose} />
      {/* Editor */}
      <div className="px-4 pb-2">
        <div className="relative min-h-[80px]">
          <EditorContent
            editor={tiptap.editor}
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
              .ProseMirror img,
              .ProseMirror video,
              .ProseMirror audio,
              .ProseMirror embed {
                display: none !important;
              }
            `}
          </style>
          {placeholder && !tiptap.editor.getText() && (
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
        {/* Media title input and thumbnail input */}
        <TiptapMediaMetaInput
          selectedMedia={tiptap.selectedMedia}
          setSelectedMedia={tiptap.setSelectedMedia}
          mediaTitleInput={tiptap.mediaTitleInput}
          setMediaTitleInput={tiptap.setMediaTitleInput}
          selectedThumbnail={tiptap.selectedThumbnail}
          setSelectedThumbnail={tiptap.setSelectedThumbnail}
          editor={tiptap.editor}
        />
        {/* Media preview */}
        <div className="my-4">
          {renderMediaPreviewOnly(
            tiptap.editor?.getHTML?.() || "",
            undefined,
            tiptap.selectedThumbnail
              ? { ...tiptap.selectedMedia, thumbnail: URL.createObjectURL(tiptap.selectedThumbnail) }
              : tiptap.selectedMedia
          )}
        </div>
        {/* "Tip" and emoji row */}
        <TiptapTipRow editor={tiptap.editor} />
        {/* Add to your post row */}
        <TiptapToolbar
          editor={tiptap.editor}
          setMediaModalOpen={tiptap.setMediaModalOpen}
          setAttachmentModalOpen={tiptap.setAttachmentModalOpen}
        />
      </div>
      {/* Media Modal */}
      <Modal open={tiptap.mediaModalOpen} onClose={() => { tiptap.setMediaModalOpen(false); tiptap.setShowCamera(false); }} showClose={false}>
        {/* ...move modal content logic to a presentational component or pass handlers from hook */}
        {/* For brevity, not shown here, but all business logic should be passed from the hook */}
      </Modal>
      {/* Attachment Modal */}
      <Modal open={tiptap.attachmentModalOpen} onClose={() => { tiptap.setAttachmentModalOpen(false); }} showClose={false}>
        {/* ...move modal content logic to a presentational component or pass handlers from hook */}
      </Modal>
      {/* Audio Recorder Modal */}
      <Modal open={tiptap.audioRecorderModalOpen} onClose={() => tiptap.setAudioRecorderModalOpen(false)} showClose={false}>
        {/* ...move modal content logic to a presentational component or pass handlers from hook */}
      </Modal>
      {/* Post button */}
      <div className="px-4 pb-4">
        <TiptapPostButton
          editor={tiptap.editor}
          selectedMedia={tiptap.selectedMedia}
          mediaTitleInput={tiptap.mediaTitleInput}
          onNext={onNext}
          actionLabel={actionLabel}
        />
      </div>
    </Card>
  );
};

export default TiptapEditor;
