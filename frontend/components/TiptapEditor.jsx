import React, { useEffect, useState, useRef } from "react";
import Avatar from "./Avatar";
import Card from "./Card";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { Node, mergeAttributes } from "@tiptap/core";
import Modal from "./Modal";
import Camera from "./Camera";
import AudioRecorder from "./AudioRecorder";

// Custom Video extension for Tiptap
const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      controls: { default: true },
      style: { default: "max-width:100%" },
      title: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: "video" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes(HTMLAttributes)];
  },
});

// Custom Audio extension for Tiptap
const Audio = Node.create({
  name: "audio",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      controls: { default: true },
      style: { default: "max-width:100%" },
      title: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: "audio" }];
  },
  renderHTML({ HTMLAttributes }) {
    // Explicitly include title attribute if present
    const attrs = { ...HTMLAttributes };
    if (attrs.title === undefined) delete attrs.title;
    return ["audio", mergeAttributes(attrs)];
  },
  addNodeView() {
    return ({ node, HTMLAttributes }) => {
      const audio = document.createElement("audio");
      audio.setAttribute("controls", "");
      // Convert style string to object if needed
      if (HTMLAttributes.style && typeof HTMLAttributes.style === "string") {
        audio.style.cssText = HTMLAttributes.style;
      } else {
        audio.setAttribute("style", "max-width:100%");
      }
      if (node.attrs.src) {
        audio.src = node.attrs.src;
      }
      return audio;
    };
  },
});

// Custom PDF Embed extension for Tiptap
const PDFEmbed = Node.create({
  name: "pdfembed",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      type: { default: "application/pdf" },
      style: { default: "width:100%;min-height:400px;border-radius:8px;margin:8px 0;" },
    };
  },
  parseHTML() {
    return [{ tag: "embed[type='application/pdf']" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["embed", mergeAttributes({ type: "application/pdf" }, HTMLAttributes)];
  },
  addNodeView() {
    return ({ node, HTMLAttributes }) => {
      const embed = document.createElement("embed");
      embed.setAttribute("type", "application/pdf");
      // Convert style string to object if needed
      if (HTMLAttributes.style && typeof HTMLAttributes.style === "string") {
        embed.style.cssText = HTMLAttributes.style;
      } else {
        embed.setAttribute("style", "width:100%;min-height:400px;border-radius:8px;margin:8px 0;");
      }
      if (node.attrs.src) {
        embed.src = node.attrs.src;
      }
      return embed;
    };
  },
});

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
  user = { name: "User", avatar: "", audience: "Public" },
  onMediaUpload, // NEW PROP
  mediaPreview, // NEW PROP: React node to render as media preview
}) => {
  // Local state for media title input
  const [mediaTitleInput, setMediaTitleInput] = useState("");
  // Initialize editor FIRST before any hook or logic that uses it
  // Debounce utility
  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  // Debounced onChange for editor updates
  const debouncedOnChange = useRef(debounce(onChange, 300)).current;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: true }),
      Image,
      Youtube,
      Video, // Add custom video extension
      Audio, // Add custom audio extension
      PDFEmbed, // Add custom PDF embed extension
    ],
    content: value,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      debouncedOnChange(html);
    },
  });

  const [tab, setTab] = useState("write");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);

  // Media node selection and title editing
  const [selectedMediaNode, setSelectedMediaNode] = useState(null);
  const [selectedMediaTitle, setSelectedMediaTitle] = useState("");

  // Listen for selection changes in the editor
  useEffect(() => {
    if (!editor) return;

    const handler = () => {
      const { state } = editor;
      const { selection } = state;
      let node = null;
      let title = "";
      if (selection.node && ["audio", "video", "image", "pdfembed"].includes(selection.node.type.name)) {
        node = selection.node;
        title = node.attrs.title || "";
      } else if (selection.$from && selection.$from.parent && ["audio", "video", "image", "pdfembed"].includes(selection.$from.parent.type.name)) {
        // For image/pdfembed, which may be inline or block
        node = selection.$from.parent;
        title = node.attrs.title || "";
      } else {
        node = null;
        title = "";
      }
      setSelectedMediaNode(node);
      setSelectedMediaTitle(title);
    };

    editor.on("selectionUpdate", handler);
    return () => {
      editor.off("selectionUpdate", handler);
    };
  }, [editor]);

  // NEW: Attachment modal and audio recorder state
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [audioRecorderModalOpen, setAudioRecorderModalOpen] = useState(false);
  const attachmentFileInputRef = useRef(null);
  const [mediaTitle, setMediaTitle] = useState("");

  // Handler for file selection in attachment modal
  const handleAttachmentFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("media", file);
    if (mediaTitle) formData.append("title", mediaTitle);
    if (mediaTitle && mediaTitle.trim()) {
      formData.append("title", mediaTitle.trim());
    }
    fetch("/api/posts/upload-media", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          // Use user-provided title if available, else backend, else empty
          const fileTitle = mediaTitle && mediaTitle.trim() ? mediaTitle.trim() : (data.title || "");
          let titleAttr = fileTitle ? ' title="' + fileTitle.replace(/"/g, "") + '"' : "";
          // Treat .webm as audio for attachments
          if (file.name && file.name.toLowerCase().endsWith(".webm")) {
            editor.commands.focus('end');
            editor.chain().insertContent('<audio controls src="' + data.url + '" style="max-width:100%"' + titleAttr + '></audio>').focus('end').run();
            setSelectedMedia({ src: data.url, type: "audio", title: fileTitle });
            if (data.id && typeof onMediaUpload === "function") {
              onMediaUpload(data.id, "audio");
            }
          } else if (file.type.startsWith("audio/")) {
            editor.commands.focus('end');
            editor.chain().insertContent('<audio controls src="' + data.url + '" style="max-width:100%"' + titleAttr + '></audio>').focus('end').run();
            setSelectedMedia({ src: data.url, type: "audio", title: fileTitle });
            if (data.id && typeof onMediaUpload === "function") {
              onMediaUpload(data.id, "audio");
            }
          } else if (file.type === "application/pdf") {
            editor.commands.focus('end');
            editor.chain().insertContent('<embed src="' + data.url + '" type="application/pdf" style="width:100%;min-height:400px;border-radius:8px;margin:8px 0;"' + titleAttr + ' />').focus('end').run();
            setSelectedMedia({ src: data.url, type: "pdf", title: fileTitle });
            if (data.id && typeof onMediaUpload === "function") {
              onMediaUpload(data.id, "pdf");
            }
          } else if (file.type.startsWith("video/")) {
            editor.commands.focus('end');
            editor.chain().insertContent('<video controls src="' + data.url + '" style="max-width:100%"' + titleAttr + '></video>').focus('end').run();
            setSelectedMedia({ src: data.url, type: "video", title: fileTitle });
            if (data.id && typeof onMediaUpload === "function") {
              onMediaUpload(data.id, "video");
            }
          } else if (file.type.startsWith("image/")) {
            editor.commands.focus('end');
            editor.chain().insertContent('<img src="' + data.url + '"' + titleAttr + ' />').focus('end').run();
            setSelectedMedia({ src: data.url, type: "image", title: fileTitle });
            if (data.id && typeof onMediaUpload === "function") {
              onMediaUpload(data.id, "image");
            }
          } else {
            editor.chain().focus().insertContent('<a href="' + data.url + '" target="_blank" rel="noopener noreferrer"' + titleAttr + '>' + file.name + '</a>').run();
            if (data.id && typeof onMediaUpload === "function") {
              onMediaUpload(data.id, file.type.split("/")[0]);
            }
          }

          // After inserting, update the title attribute on the first media node if a title was provided
          if (fileTitle) {
            setTimeout(() => {
              if (editor && editor.state) {
                const { state, view } = editor;
                let tr = state.tr;
                let found = false;
                state.doc.descendants((node, pos) => {
                  if (["audio", "video", "image", "pdfembed"].includes(node.type.name) && !found) {
                    tr = tr.setNodeMarkup(pos, undefined, {
                      ...node.attrs,
                      title: fileTitle
                    });
                    found = true;
                    return false; // stop after first
                  }
                  return true;
                });
                if (found) {
                  view.dispatch(tr);
                  editor.commands.focus('end');
                }
              }
            }, 0);
          }
        } else {
          alert("File upload failed.");
        }
      })
      .catch(() => {
        alert("File upload failed.");
      });
    setAudioRecorderModalOpen(false);
    setAttachmentModalOpen(false);
    setMediaTitle("");
    e.target.value = "";
  };

  // Handler for "Use this recording" in AudioRecorder
  const handleAudioRecordingSelect = (audioObj) => {
    if (!audioObj || !audioObj.blob) return;
    const formData = new FormData();
    formData.append("media", audioObj.blob, "recording.webm");
    if (mediaTitle) formData.append("title", mediaTitle);
    if (audioObj.title) {
      formData.append("title", audioObj.title);
    }
    fetch("/api/posts/upload-media", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          editor.commands.focus('end');
          const audioTitle = data.title || audioObj.title || "";
          editor.chain().insertContent(`<audio controls src="${data.url}" style="max-width:100%"${audioTitle ? ` title="${audioTitle.replace(/"/g, "")}"` : ""}></audio>`).focus('end').run();
          setSelectedMedia({ src: data.url, type: "audio", title: audioTitle });
          if (data.id && typeof onMediaUpload === "function") {
            onMediaUpload(data.id, "audio");
          }
          setAudioRecorderModalOpen(false);
          setAttachmentModalOpen(false);
        } else {
          alert("Audio upload failed.");
        }
      })
      .catch(() => {
        alert("Audio upload failed.");
      });
  };

  // Prevent resetting content on every keystroke (which causes media to disappear)
  // Only update editor content if value prop changes from outside (e.g., after post submit)
  const lastValueRef = useRef(value);
  useEffect(() => {
    if (
      editor &&
      value !== lastValueRef.current &&
      value !== editor.getHTML() &&
      !editor.isFocused // Only update if editor is not focused (i.e., external change)
    ) {
      editor.commands.setContent(value || "");
      lastValueRef.current = value;
    }
    // eslint-disable-next-line
  }, [value, editor]);

  // Handle file input (image/video)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (file.type.startsWith("image/")) {
        // Upload image to backend
        const formData = new FormData();
        formData.append("media", file);
        if (mediaTitle) formData.append("title", mediaTitle);
        fetch("/api/posts/upload-media", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.url) {
              editor.commands.focus('end');
              editor.chain().insertContent(`<img src="${data.url}" />`).focus('end').run();
              setSelectedMedia({ src: data.url, type: "image" });
              if (data.id && typeof onMediaUpload === "function") {
                onMediaUpload(data.id, "image");
              }
            } else {
              alert("Image upload failed.");
            }
          })
          .catch(() => {
            alert("Image upload failed.");
          });
      } else if (file.type.startsWith("video/")) {
        // Upload video to backend
        const formData = new FormData();
        formData.append("media", file);
        if (mediaTitle) formData.append("title", mediaTitle);
        fetch("/api/posts/upload-media", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.url) {
              editor.commands.focus('end');
              editor.chain().insertContent(`<video controls src="${data.url}" style="max-width:100%"></video>`).focus('end').run();
              setSelectedMedia({ src: data.url, type: "video" });
              if (data.id && typeof onMediaUpload === "function") {
                onMediaUpload(data.id, "video");
              }
            } else {
              alert("Video upload failed.");
            }
          })
          .catch(() => {
            alert("Video upload failed.");
          });
      }
      setMediaModalOpen(false);
      setShowCamera(false);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  // Handle camera capture (image)
  const handleCameraCapture = (dataUrl) => {
    // Upload captured image to backend
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "captured-image.png", { type: "image/png" });
        const formData = new FormData();
        formData.append("media", file);
        if (mediaTitle) formData.append("title", mediaTitle);
        fetch("/api/posts/upload-media", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.url) {
              editor.commands.focus('end');
              editor.chain().insertContent(`<img src="${data.url}" />`).focus('end').run();
              setSelectedMedia({ src: data.url, type: "image" });
              if (data.id && typeof onMediaUpload === "function") {
                onMediaUpload(data.id, "image");
              }
            } else {
              alert("Image upload failed.");
            }
          })
          .catch(() => {
            alert("Image upload failed.");
          });
      });
    setMediaModalOpen(false);
    setShowCamera(false);
  };

  // Handle camera record (video)
  const handleCameraRecord = (videoUrl) => {
    // Upload captured video to backend
    fetch(videoUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "captured-video.webm", { type: "video/webm" });
        const formData = new FormData();
        formData.append("media", file);
        if (mediaTitle) formData.append("title", mediaTitle);
        fetch("/api/posts/upload-media", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.url) {
              editor.commands.focus('end');
              editor.chain().insertContent(`<video controls src="${data.url}" style="max-width:100%"></video>`).focus('end').run();
              setSelectedMedia({ src: data.url, type: "video" });
              if (data.id && typeof onMediaUpload === "function") {
                onMediaUpload(data.id, "video");
              }
            } else {
              alert("Video upload failed.");
            }
          })
          .catch(() => {
            alert("Video upload failed.");
          });
      });
    setMediaModalOpen(false);
    setShowCamera(false);
  };

  if (!editor) return null;

  // Post title state
  const [postTitle, setPostTitle] = useState("");

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
              /* Hide default media previews in the editor */
              .ProseMirror img,
              .ProseMirror video,
              .ProseMirror audio,
              .ProseMirror embed {
                display: none !important;
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
        {/* Media title input below editor content but above media preview */}
        {selectedMedia && (
          <div className="mb-2">
            <input
              type="text"
              className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter media title"
              value={mediaTitleInput}
              onChange={e => setMediaTitleInput(e.target.value)}
              onFocus={() => {
                // When focusing, set input to current selectedMedia title
                setMediaTitleInput(selectedMedia.title || "");
              }}
              onBlur={e => {
                const newTitle = e.target.value;
                setSelectedMedia({ ...selectedMedia, title: newTitle });
                // Use Tiptap's transaction API to update the title attribute of the correct media node
                if (editor && editor.state && selectedMedia && selectedMedia.src) {
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
                        title: newTitle
                      });
                      found = true;
                      return false; // stop after first match
                    }
                    return true;
                  });
                  if (found) {
                    view.dispatch(tr);
                    // Force focus to ensure state is synced
                    editor.commands.focus('end');
                    setTimeout(() => {
                      /* HTML after media title update (debug removed) */
                    }, 0);
                  } else {
                    /* No matching media node found for src (debug removed) */
                  }
                }
              }}
            />
          </div>
        )}
        {/* Custom MediaPlayer preview */}
        {mediaPreview ? (
          <div className="my-4">{mediaPreview}</div>
        ) : selectedMedia ? (
          <div className="my-4">
            <MediaPlayer
              src={selectedMedia.src}
              type={selectedMedia.type}
              title={selectedMedia.title}
              alt=""
              style={{ maxWidth: "100%", borderRadius: 8, margin: "8px 0" }}
            />
          </div>
        ) : null}
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
      </div>
      {/* Media Modal */}
      <Modal open={mediaModalOpen} onClose={() => { setMediaModalOpen(false); setShowCamera(false); }} showClose={false}>
        {!showCamera ? (
          <div>
            <h3 className="text-lg font-semibold mb-4">Insert Photo/Video</h3>
            <div className="flex flex-col gap-4">
              <button
                className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setShowCamera(true)}
              >
                Use Camera
              </button>
              <button
                className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                Select from Device
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        ) : (
          <div>
            <Camera
              onCapture={handleCameraCapture}
              onRecord={handleCameraRecord}
              onClose={() => setShowCamera(false)}
            />
            <button
              className="mt-4 w-full py-2 px-4 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              onClick={() => setShowCamera(false)}
            >
              Back
            </button>
          </div>
        )}
      </Modal>

      {/* Attachment Modal */}
      <Modal open={attachmentModalOpen} onClose={() => { setAttachmentModalOpen(false); }} showClose={false}>
        <div>
          <h3 className="text-lg font-semibold mb-4">Attach File or Record Audio</h3>
          <div className="flex flex-col gap-4">
            <button
              className="w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700"
              onClick={() => {
                setAttachmentModalOpen(false);
                setAudioRecorderModalOpen(true);
              }}
            >
              Record Audio
            </button>
            <button
              className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              onClick={() => attachmentFileInputRef.current && attachmentFileInputRef.current.click()}
            >
              Select File from Device
            </button>
            <input
              ref={attachmentFileInputRef}
              type="file"
              accept="audio/*,application/pdf,*"
              className="hidden"
              onChange={handleAttachmentFileChange}
            />
          </div>
        </div>
      </Modal>
      {/* Audio Recorder Modal */}
      <Modal open={audioRecorderModalOpen} onClose={() => setAudioRecorderModalOpen(false)} showClose={false}>
        <div>
          <h3 className="text-lg font-semibold mb-4">Record Audio</h3>
          <AudioRecorder
            onSelect={handleAudioRecordingSelect}
          />
          <button
            className="mt-4 w-full py-2 px-4 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            onClick={() => setAudioRecorderModalOpen(false)}
          >
            Back
          </button>
        </div>
      </Modal>

      {/* Post button */}
      <div className="px-4 pb-4">
        <button
          className={`w-full py-2 rounded-lg font-semibold text-white transition-colors ${
            (editor.getText().trim() || hasMedia(editor.getHTML()))
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
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
              onNext(editor, selectedMedia, mediaTitleToSend);
              // Do NOT clear the editor here; let the parent clear after successful post
            }
          }}
        >
          {actionLabel}
        </button>
      </div>
    </Card>
  );
};

// MediaPlayer-based preview renderer
import MediaPlayer from "./MediaPlayer";

// Helper to check for media tags in HTML
function hasMedia(html) {
  if (!html) return false;
  return /<(img|video|audio|embed)\b/i.test(html);
}

function renderMediaPreviewOnly(html) {
  try {
    if (typeof window === "undefined" || typeof window.DOMParser === "undefined") {
      return null;
    }
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const nodes = Array.from(doc.body.childNodes);

    // Only collect media nodes (img, video, audio, embed)
    const mediaNodes = [];
    nodes.forEach((node) => {
      if (
        node.nodeType === 1 &&
        (node.tagName === "IMG" ||
          node.tagName === "VIDEO" ||
          node.tagName === "AUDIO" ||
          node.tagName === "EMBED")
      ) {
        mediaNodes.push(node);
      }
    });

    // Helper to convert DOM node to React element
    function domToReact(node, key) {
      if (node.nodeType === 1) {
        if (node.tagName === "IMG") {
          const src = node.getAttribute("src");
          return (
            <MediaPlayer
              key={key}
              src={src}
              type="image"
              alt=""
              style={{ maxWidth: "100%", borderRadius: 8, margin: "8px 0" }}
            />
          );
        }
        if (node.tagName === "VIDEO") {
          const src = node.getAttribute("src");
          return (
            <MediaPlayer
              key={key}
              src={src}
              type="video"
              style={{ maxWidth: "100%", borderRadius: 8, margin: "8px 0" }}
            />
          );
        }
        if (node.tagName === "AUDIO") {
          const src = node.getAttribute("src");
          return (
            <MediaPlayer
              key={key}
              src={src}
              type="audio"
              style={{ maxWidth: "100%", borderRadius: 8, margin: "8px 0" }}
            />
          );
        }
        if (node.tagName === "EMBED") {
          // PDF or other document
          const src = node.getAttribute("src");
          const type = node.getAttribute("type");
          return (
            <MediaPlayer
              key={key}
              src={src}
              type={type === "application/pdf" ? "pdf" : "document"}
              style={{ maxWidth: "100%", borderRadius: 8, margin: "8px 0" }}
            />
          );
        }
      }
      return null;
    }

    return (
      <>
        {mediaNodes.map((node, i) => domToReact(node, `media-${i}`))}
      </>
    );
  } catch (err) {
    // Fallback: show nothing if parsing fails
    return null;
  }
}

export default TiptapEditor;
export { renderMediaPreviewOnly };
