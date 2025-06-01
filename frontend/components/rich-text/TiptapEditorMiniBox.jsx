import React from "react";
import { EditorContent } from "@tiptap/react";
import TiptapToolbar from "@components/rich-text/TiptapToolbar";
import TiptapMediaMetaInput from "@components/rich-text/TiptapMediaMetaInput";
import TiptapPostButton from "@components/rich-text/TiptapPostButton";
import Modal from "@components/layout/Modal";
import Camera from "@components/media/Camera";
import AudioRecorder from "@components/media/AudioRecorder";
import useTiptapEditor from "@hooks/useTiptapEditor";

/**
 * TiptapEditorMiniBox - fully isolated mini rich text editor for chat input.
 * Handles its own modals, toolbar, media meta, and compact preview.
 */
import { IoClose } from "react-icons/io5";

export default function TiptapEditorMiniBox({
  value,
  onChange,
  placeholder = "Type a message",
  editable = true,
  minHeight = 48,
  onNext,
  actionLabel = "Send",
  user,
  onMediaUpload,
  onRestorePlain,
  ...rest
}) {
  const tiptap = useTiptapEditor({
    value,
    onChange,
    editable,
    onMediaUpload,
  });

  if (!tiptap.editor) return null;

  return (
    <>
      <div
        className="tiptap-editor-mini"
        style={{
          minHeight: tiptap.selectedMedia?.src || tiptap.selectedThumbnail ? minHeight : undefined,
          maxHeight: tiptap.selectedMedia?.src || tiptap.selectedThumbnail ? "27vh" : undefined,
          height: "auto",
          fontSize: "1rem",
          padding: "0.25rem 0.5rem",
          overflow: "hidden",
          borderRadius: "1rem",
          border: "1px solid #e5e7eb",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          position: "relative"
        }}
      >
        {typeof onRestorePlain === "function" && (
          <button
            type="button"
            className="absolute z-20"
            style={{
              top: 6,
              right: 6,
              background: "#fff",
              borderRadius: "50%",
              boxShadow: "0 1px 4px 0 rgba(0,0,0,0.04)",
              padding: 2,
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #e5e7eb",
              cursor: "pointer",
              lineHeight: 1,
              fontSize: 22,
            }}
            aria-label="Restore plain text input"
            onClick={onRestorePlain}
          >
            <IoClose />
          </button>
        )}
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
          {/* Toolbar and media title input row */}
          <div className="flex items-center gap-2 mb-1 mt-1 w-full flex-nowrap">
            <TiptapToolbar
              editor={tiptap.editor}
              setMediaModalOpen={tiptap.setMediaModalOpen}
              setAttachmentModalOpen={tiptap.setAttachmentModalOpen}
              mini={true}
            />
            {tiptap.selectedMedia && tiptap.selectedMedia.src && (
              <input
                type="text"
                className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-200 flex-grow min-w-0"
                placeholder="Media title"
                value={tiptap.mediaTitleInput}
                style={{ fontSize: 12, maxWidth: 140 }}
                onChange={e => tiptap.setMediaTitleInput(e.target.value)}
                onFocus={() => {
                  tiptap.setMediaTitleInput(tiptap.selectedMedia?.title || "");
                }}
                onBlur={e => {
                  const newTitle = e.target.value;
                  if (tiptap.selectedMedia) {
                    tiptap.setSelectedMedia({ ...tiptap.selectedMedia, title: newTitle });
                    if (tiptap.editor && tiptap.editor.state && tiptap.selectedMedia.src) {
                      const { state, view } = tiptap.editor;
                      let tr = state.tr;
                      let found = false;
                      state.doc.descendants((node, pos) => {
                        if (
                          ["audio", "video", "image", "pdfembed"].includes(node.type.name) &&
                          node.attrs &&
                          node.attrs.src === tiptap.selectedMedia.src &&
                          !found
                        ) {
                          tr = tr.setNodeMarkup(pos, undefined, {
                            ...node.attrs,
                            title: newTitle
                          });
                          found = true;
                          return false;
                        }
                        return true;
                      });
                      if (found) {
                        view.dispatch(tr);
                        tiptap.editor.commands.focus('end');
                      }
                    }
                  }
                }}
              />
            )}
            <div className="flex-shrink-0 ml-auto">
              <TiptapPostButton
                editor={tiptap.editor}
                selectedMedia={tiptap.selectedMedia}
                mediaTitleInput={tiptap.mediaTitleInput}
                onNext={async (...args) => {
                  if (onNext) await onNext(...args);
                  // Clear mini editor state after send
                  tiptap.editor.commands.clearContent(true);
                  tiptap.setSelectedMedia(null);
                  tiptap.setSelectedThumbnail(null);
                  tiptap.setMediaTitleInput("");
                }}
                actionLabel={actionLabel}
                mini
              />
            </div>
          </div>
          {/* Media meta and preview row */}
          {(tiptap.selectedMedia?.src || tiptap.selectedThumbnail) && (
            <div className="flex flex-row items-end gap-2 w-full pb-2">
              <div className="flex flex-1 items-center gap-3 flex-nowrap" style={{ minHeight: 40 }}>
                <div className="flex-grow min-w-0 flex items-center gap-2">
                  <TiptapMediaMetaInput
                    selectedMedia={tiptap.selectedMedia}
                    setSelectedMedia={tiptap.setSelectedMedia}
                    mediaTitleInput={tiptap.mediaTitleInput}
                    setMediaTitleInput={tiptap.setMediaTitleInput}
                    selectedThumbnail={tiptap.selectedThumbnail}
                    setSelectedThumbnail={tiptap.setSelectedThumbnail}
                    editor={tiptap.editor}
                    mini
                    hideTitleInput
                  />
                </div>
                {/* Always render thumbnail preview first if present */}
                {tiptap.selectedThumbnail && (
                  <div className="relative flex-shrink-0" style={{ width: 40, height: 40, border: "2px solid #3b82f6", borderRadius: 8 }}>
                    <img
                      src={URL.createObjectURL(tiptap.selectedThumbnail)}
                      alt="Thumbnail preview"
                      className="rounded-xl object-cover"
                      style={{ width: 40, height: 40 }}
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-red-500"
                      style={{ fontSize: 14, lineHeight: 1 }}
                      onClick={e => {
                        e.stopPropagation();
                        tiptap.setSelectedThumbnail(null);
                      }}
                      aria-label="Remove thumbnail"
                    >
                      ×
                    </button>
                  </div>
                )}
                {/* Then render media preview if present */}
                {tiptap.selectedMedia && tiptap.selectedMedia.src && (
                  <div className="relative flex-shrink-0" style={{ width: 40, height: 40 }}>
                    {(() => {
                      const type = tiptap.selectedMedia.type;
                      const src = tiptap.selectedMedia.src;
                      if (type === "image") {
                        return (
                          <img
                            src={src}
                            alt="preview"
                            className="rounded-xl object-cover"
                            style={{ width: 40, height: 40 }}
                          />
                        );
                      } else if (type === "video") {
                        return (
                          <video
                            src={src}
                            className="rounded-xl object-cover"
                            style={{ width: 40, height: 40 }}
                            controls={false}
                            muted
                          />
                        );
                      } else if (type === "pdf") {
                        return (
                          <div className="flex items-center justify-center bg-gray-100 rounded-xl text-xs text-gray-500 font-semibold" style={{ width: 40, height: 40 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="8" fill="#F3F4F6"/><path d="M7 7h10v10H7V7z" fill="#fff"/><text x="12" y="16" textAnchor="middle" fontSize="8" fill="#6B7280" fontWeight="bold">PDF</text></svg>
                          </div>
                        );
                      } else if (type === "audio") {
                        return (
                          <div className="flex items-center justify-center bg-gray-100 rounded-xl" style={{ width: 40, height: 40 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="8" fill="#F3F4F6"/><path d="M9 17V7a1 1 0 0 1 2 0v10a1 1 0 0 1-2 0zm4 0V7a1 1 0 0 1 2 0v10a1 1 0 0 1-2 0z" fill="#6B7280"/></svg>
                          </div>
                        );
                      } else {
                        return (
                          <div className="flex items-center justify-center bg-gray-100 rounded-xl" style={{ width: 40, height: 40 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="8" fill="#F3F4F6"/><path d="M8 7h8v10H8V7z" fill="#fff"/><rect x="10" y="11" width="4" height="2" rx="1" fill="#6B7280"/></svg>
                          </div>
                        );
                      }
                    })()}
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-red-500"
                      style={{ fontSize: 14, lineHeight: 1 }}
                      onClick={e => {
                        e.stopPropagation();
                        tiptap.setSelectedMedia(null);
                        tiptap.setSelectedThumbnail(null);
                        tiptap.setMediaTitleInput("");
                        if (tiptap.editor) {
                          // Remove all media nodes from the editor content
                          const { state, view } = tiptap.editor;
                          let tr = state.tr;
                          let found = false;
                          state.doc.descendants((node, pos) => {
                            if (
                              ["audio", "video", "image", "pdfembed"].includes(node.type.name)
                            ) {
                              tr = tr.delete(pos, pos + node.nodeSize);
                              found = true;
                              return false;
                            }
                            return true;
                          });
                          if (found) {
                            view.dispatch(tr);
                            tiptap.editor.commands.focus('end');
                          }
                        }
                        if (typeof onMediaUpload === "function") {
                          onMediaUpload(null, null, null, "");
                        }
                      }}
                      aria-label="Remove media"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Modals */}
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
              setTimeout(() => tiptap.setShowCamera(true), 100);
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
      <Modal open={tiptap.audioRecorderModalOpen} onClose={() => tiptap.setAudioRecorderModalOpen(false)} showClose={true}>
        <div className="p-6 bg-white rounded-lg shadow-lg min-w-[300px] flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Record Audio</h2>
          <AudioRecorder
            onSelect={async ({ blob, title }) => {
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
              if (tiptap.editor) {
                tiptap.editor.chain().focus().insertContent(`<audio src="${uploadedUrl}" controls title="${title || "Recorded Audio"}"></audio>`).run();
              }
            }}
            onCancel={() => tiptap.setAudioRecorderModalOpen(false)}
          />
        </div>
      </Modal>
      <Modal open={tiptap.showCamera && !tiptap.mediaModalOpen} onClose={() => tiptap.setShowCamera(false)} showClose={true}>
        <Camera
          standalone={false}
          onCapture={dataUrl => {
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
}
