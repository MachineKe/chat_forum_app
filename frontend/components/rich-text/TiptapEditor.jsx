import React from "react";
import Card from "@components/layout/Card";
import { EditorContent } from "@tiptap/react";
import Modal from "@components/layout/Modal";
import Camera from "@components/media/Camera";
import AudioRecorder from "@components/media/AudioRecorder";
import TiptapEditorHeader from "@components/rich-text/TiptapEditorHeader";
import TiptapMediaMetaInput from "@components/rich-text/TiptapMediaMetaInput";
import TiptapTipRow from "@components/rich-text/TiptapTipRow";
import TiptapToolbar from "@components/rich-text/TiptapToolbar";
import TiptapPostButton from "@components/rich-text/TiptapPostButton";
import renderMediaPreviewOnly from "@components/rich-text/TiptapMediaPreview";
import useTiptapEditor from "@hooks/useTiptapEditor";

// ... (imports remain unchanged)

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
  hideUser = false,
  hideClose = false,
  compactToolbar = false,
  mini = false,
  ...rest
}) => {
  // All business logic and state is now in the custom hook
  const tiptap = useTiptapEditor({
    value,
    onChange,
    editable,
    onMediaUpload,
  });

  if (!tiptap.editor) return null;

  // Editor UI (mini or full)
  const editorUI = (mini || compactToolbar) ? (
    <div className="w-full p-0" style={{ marginBottom: 0, position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Editor */}
      <div className="flex-1 flex flex-col px-0 pb-0" style={{ minHeight: 0, height: "100%" }}>
        <div className="relative flex-1 min-h-[48px]">
          <EditorContent
            editor={tiptap.editor}
            className="w-full min-h-[48px] text-base text-gray-900 font-normal outline-none border-none focus:ring-0 bg-transparent px-0 py-2 borderless-editor"
            style={{
              border: "none",
              outline: "none",
              minHeight: 48,
              fontSize: 16,
              marginTop: 0,
              marginBottom: 0,
              background: "transparent",
              resize: "none",
              boxShadow: "none",
              height: "100%",
              maxHeight: "100%",
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
                min-height: 48px;
                max-height: 100%;
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
              className="absolute left-0 top-2 px-1 text-gray-400 pointer-events-none text-base select-none"
              style={{
                zIndex: 1,
                fontSize: 16,
                lineHeight: "2rem",
                fontWeight: 400,
                userSelect: "none",
              }}
            >
              {placeholder}
            </div>
          )}
        </div>
        {/* Minimal toolbar: only emoji, attach, and send */}
        <TiptapToolbar
          editor={tiptap.editor}
          setMediaModalOpen={tiptap.setMediaModalOpen}
          setAttachmentModalOpen={tiptap.setAttachmentModalOpen}
          mini={true}
        />
        {/* Media meta input and preview, but compact */}
        <TiptapMediaMetaInput
          selectedMedia={tiptap.selectedMedia}
          setSelectedMedia={tiptap.setSelectedMedia}
          mediaTitleInput={tiptap.mediaTitleInput}
          setMediaTitleInput={tiptap.setMediaTitleInput}
          selectedThumbnail={tiptap.selectedThumbnail}
          setSelectedThumbnail={tiptap.setSelectedThumbnail}
          editor={tiptap.editor}
          mini
        />
        {/* Mini media preview */}
        {tiptap.selectedMedia && tiptap.selectedMedia.src && (
          <div className="relative mt-2 mb-1" style={{ width: 56, height: 56 }}>
            {(() => {
              const type = tiptap.selectedMedia.type;
              const src = tiptap.selectedMedia.src;
              if (type === "image") {
                return (
                  <img
                    src={src}
                    alt="preview"
                    className="rounded-xl object-cover w-14 h-14"
                    style={{ width: 56, height: 56 }}
                  />
                );
              } else if (type === "video") {
                return (
                  <video
                    src={src}
                    className="rounded-xl object-cover w-14 h-14"
                    style={{ width: 56, height: 56 }}
                    controls={false}
                    muted
                  />
                );
              } else if (type === "pdf") {
                return (
                  <div className="flex items-center justify-center bg-gray-100 rounded-xl w-14 h-14 text-xs text-gray-500 font-semibold" style={{ width: 56, height: 56 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="8" fill="#F3F4F6"/><path d="M7 7h10v10H7V7z" fill="#fff"/><text x="12" y="16" textAnchor="middle" fontSize="10" fill="#6B7280" fontWeight="bold">PDF</text></svg>
                  </div>
                );
              } else if (type === "audio") {
                return (
                  <div className="flex items-center justify-center bg-gray-100 rounded-xl w-14 h-14" style={{ width: 56, height: 56 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="8" fill="#F3F4F6"/><path d="M9 17V7a1 1 0 0 1 2 0v10a1 1 0 0 1-2 0zm4 0V7a1 1 0 0 1 2 0v10a1 1 0 0 1-2 0z" fill="#6B7280"/></svg>
                  </div>
                );
              } else {
                return (
                  <div className="flex items-center justify-center bg-gray-100 rounded-xl w-14 h-14" style={{ width: 56, height: 56 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="8" fill="#F3F4F6"/><path d="M8 7h8v10H8V7z" fill="#fff"/><rect x="10" y="11" width="4" height="2" rx="1" fill="#6B7280"/></svg>
                  </div>
                );
              }
            })()}
            <button
              type="button"
              className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-red-500"
              style={{ fontSize: 18, lineHeight: 1 }}
              onClick={() => {
                tiptap.setSelectedMedia(null);
                tiptap.setSelectedThumbnail(null);
                tiptap.setMediaTitleInput("");
              }}
              aria-label="Remove media"
            >
              ×
            </button>
          </div>
        )}
      </div>
      {/* Send button */}
      <div className="flex justify-end px-2 pb-2">
        <TiptapPostButton
          editor={tiptap.editor}
          selectedMedia={tiptap.selectedMedia}
          mediaTitleInput={tiptap.mediaTitleInput}
          onNext={onNext}
          actionLabel={actionLabel}
          mini
        />
      </div>
    </div>
  ) : (
    <Card className="w-full p-0" style={{ marginBottom: 16, position: "relative" }}>
      {/* Header */}
      {!hideUser && <TiptapEditorHeader user={user} onClose={hideClose ? undefined : onClose} />}
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
        {/* Submit button */}
        <div className="flex justify-end px-2 pb-4">
          <TiptapPostButton
            editor={tiptap.editor}
            selectedMedia={tiptap.selectedMedia}
            mediaTitleInput={tiptap.mediaTitleInput}
            onNext={onNext}
            actionLabel={actionLabel}
          />
        </div>
      </div>
    </Card>
  );

  // Always render modals so they work in both mini and full mode
  return (
    <>
      {editorUI}
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
    </>
  );

  // Always render modals so they work in both mini and full mode
  return (
    <>
      {editorUI}
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
    </>
  );
};

export default TiptapEditor;
