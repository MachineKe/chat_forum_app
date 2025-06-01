import React from "react";
import Card from "../layout/Card";
import { EditorContent } from "@tiptap/react";
import Modal from "../layout/Modal";
import Camera from "../media/Camera";
import AudioRecorder from "../media/AudioRecorder";
import TiptapEditorHeader from "./TiptapEditorHeader";
import TiptapMediaMetaInput from "./TiptapMediaMetaInput";
import TiptapTipRow from "./TiptapTipRow";
import TiptapToolbar from "./TiptapToolbar";
import TiptapPostButton from "./TiptapPostButton";
import renderMediaPreviewOnly from "./TiptapMediaPreview";
import useTiptapEditor from "../../hooks/useTiptapEditor";

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
        <div className="p-6 rounded-lg shadow-lg min-w-[300px] flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Add Photo or Video</h2>
          <input
            id="tiptap-media-file-input"
            type="file"
            accept="image/*,video/*"
            className="mb-4 hidden"
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                tiptap.handleFileChange(e.target.files[0]);
              }
            }}
          />
          <button
            className="mb-2 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => {
              tiptap.setMediaModalOpen(false);
              setTimeout(() => tiptap.setShowCamera(true), 100); // ensure media modal closes first
            }}
          >
            Open Camera
          </button>
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={() => {
              document.getElementById('tiptap-media-file-input').click();
            }}
          >
            Choose File
          </button>
        </div>
      </Modal>
      {/* Attachment Modal */}
      <Modal open={tiptap.attachmentModalOpen} onClose={() => { tiptap.setAttachmentModalOpen(false); }} showClose={false}>
        <div className="p-6 rounded-lg shadow-lg min-w-[300px] flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Attach File (Audio, PDF, etc.)</h2>
          <input
            id="tiptap-attachment-file-input"
            type="file"
            accept="audio/*,application/pdf"
            className="mb-4 hidden"
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                tiptap.handleAttachmentFileChange(e.target.files[0]);
              }
            }}
          />
          <button
            className="mb-2 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => {
              tiptap.setAttachmentModalOpen(false);
              setTimeout(() => tiptap.setAudioRecorderModalOpen(true), 100);
            }}
          >
            Record Audio
          </button>
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={() => {
              document.getElementById('tiptap-attachment-file-input').click();
            }}
          >
            Choose File
          </button>
        </div>
      </Modal>
      {/* Audio Recorder Modal */}
      <Modal open={tiptap.audioRecorderModalOpen} onClose={() => tiptap.setAudioRecorderModalOpen(false)} showClose={true}>
        <div className="p-6 bg-white rounded-lg shadow-lg min-w-[300px] flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Record Audio</h2>
          <AudioRecorder
            onSelect={async ({ blob, title }) => {
              // Upload audio to backend and insert permanent URL
              let uploadedUrl = null;
              let uploadedId = null;
              try {
                const formData = new FormData();
                formData.append("media", blob, "recorded-audio.webm");
                const res = await fetch("/api/posts/upload-media", {
                  method: "POST",
                  body: formData,
                });
                if (!res.ok) throw new Error("Upload failed");
                const data = await res.json();
                uploadedUrl = data.url;
                uploadedId = data.id;
              } catch (err) {
                uploadedUrl = URL.createObjectURL(blob);
                uploadedId = null;
              }
              tiptap.setSelectedMedia({
                src: uploadedUrl,
                type: "audio",
                title: title || "Recorded Audio",
                file: blob,
                id: uploadedId,
              });
              if (onMediaUpload) {
                onMediaUpload(uploadedId, "audio", uploadedUrl, title || "Recorded Audio");
              }
              tiptap.setAudioRecorderModalOpen(false);
              // Insert audio into the editor
              if (tiptap.editor) {
                tiptap.editor.chain().focus().insertContent(`<audio src="${uploadedUrl}" controls title="${title || "Recorded Audio"}"></audio>`).run();
              }
            }}
            onCancel={() => tiptap.setAudioRecorderModalOpen(false)}
          />
        </div>
      </Modal>
      {/* Camera Modal */}
      <Modal open={tiptap.showCamera && !tiptap.mediaModalOpen} onClose={() => tiptap.setShowCamera(false)} showClose={true}>
        <Camera
          standalone={false}
          onCapture={dataUrl => {
            // Convert dataUrl to Blob/File for handleFileChange
            function dataURLtoFile(dataurl, filename) {
              const arr = dataurl.split(',');
              const mime = arr[0].match(/:(.*?);/)[1];
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              return new File([u8arr], filename, { type: mime });
            }
            if (dataUrl) {
              const file = dataURLtoFile(dataUrl, "captured-photo.png");
              tiptap.handleFileChange(file);
            }
            tiptap.setShowCamera(false);
          }}
          onRecord={videoBlob => {
            if (videoBlob) {
              tiptap.handleFileChange(new File([videoBlob], "recorded-video.webm", { type: "video/webm" }));
            }
            tiptap.setShowCamera(false);
          }}
          onClose={() => tiptap.setShowCamera(false)}
        />
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
