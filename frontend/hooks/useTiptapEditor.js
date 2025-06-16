import { useEffect, useState, useRef, useCallback } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { Video, Audio, PDFEmbed } from "@components/rich-text/TiptapExtensions";
import useMediaUpload from "@hooks/useMediaUpload";

// Helper to check for media tags in HTML
function hasMedia(html) {
  if (!html) return false;
  return /<(img|video|audio|embed)\b/i.test(html);
}

// Debounce utility
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function useTiptapEditor({
  value,
  onChange,
  editable = true,
  onMediaUpload,
  mediaModalOpen: controlledMediaModalOpen,
  setMediaModalOpen: setControlledMediaModalOpen,
  attachmentModalOpen: controlledAttachmentModalOpen,
  setAttachmentModalOpen: setControlledAttachmentModalOpen,
  audioRecorderModalOpen: controlledAudioRecorderModalOpen,
  setAudioRecorderModalOpen: setControlledAudioRecorderModalOpen,
}) {
  // State
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [mediaTitleInput, setMediaTitleInputState] = useState("");
  // Custom setter to sync with selectedMedia and onMediaUpload
  const setMediaTitleInput = (title) => {
    setMediaTitleInputState(title);
    setSelectedMedia((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, title };
      if (typeof onMediaUpload === "function") {
        onMediaUpload(prev.id, prev.type, prev.src, title);
      }
      return updated;
    });
  };
  const [tab, setTab] = useState("write");
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Allow modal state to be controlled by parent if provided
  const [internalMediaModalOpen, setInternalMediaModalOpen] = useState(false);
  const [internalAttachmentModalOpen, setInternalAttachmentModalOpen] = useState(false);
  const [internalAudioRecorderModalOpen, setInternalAudioRecorderModalOpen] = useState(false);

  const mediaModalOpen = typeof controlledMediaModalOpen === "boolean" ? controlledMediaModalOpen : internalMediaModalOpen;
  const setMediaModalOpen = typeof setControlledMediaModalOpen === "function" ? setControlledMediaModalOpen : setInternalMediaModalOpen;
  const attachmentModalOpen = typeof controlledAttachmentModalOpen === "boolean" ? controlledAttachmentModalOpen : internalAttachmentModalOpen;
  const setAttachmentModalOpen = typeof setControlledAttachmentModalOpen === "function" ? setControlledAttachmentModalOpen : setInternalAttachmentModalOpen;
  const audioRecorderModalOpen = typeof controlledAudioRecorderModalOpen === "boolean" ? controlledAudioRecorderModalOpen : internalAudioRecorderModalOpen;
  const setAudioRecorderModalOpen = typeof setControlledAudioRecorderModalOpen === "function" ? setControlledAudioRecorderModalOpen : setInternalAudioRecorderModalOpen;

  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedMediaNode, setSelectedMediaNode] = useState(null);
  const [selectedMediaTitle, setSelectedMediaTitle] = useState("");
  const attachmentFileInputRef = useRef(null);
  const [mediaTitle, setMediaTitle] = useState("");
  const [postTitle, setPostTitle] = useState("");

  // Debounced onChange for editor updates
  const debouncedOnChange = useRef(debounce(onChange, 300)).current;

  // Editor instance
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: true }),
      Image,
      Youtube,
      Video,
      Audio,
      PDFEmbed,
    ],
    content: value,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      debouncedOnChange(html);
    },
  });

  // Selection change handler
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

  // Sync editor content with value prop
  const lastValueRef = useRef(value);
  useEffect(() => {
    if (
      editor &&
      value !== lastValueRef.current &&
      value !== editor.getHTML() &&
      !editor.isFocused
    ) {
      editor.commands.setContent(value || "");
      lastValueRef.current = value;
    }
  }, [value, editor]);

  // Reset local states when value is cleared
  useEffect(() => {
    if ((value === "" || value === null) && editor) {
      setSelectedMedia(null);
      setSelectedThumbnail(null);
      setMediaTitleInput("");
      setMediaTitle("");
    }
  }, [value, editor]);

  // Clear selectedMedia if editor content is empty
  useEffect(() => {
    if (!editor) return;
    const html = editor.getHTML();
    const isEmpty = !editor.getText().trim() && !hasMedia(html);
    if (isEmpty) {
      setSelectedMedia(null);
      setSelectedThumbnail(null);
      setMediaTitleInput("");
      setMediaTitle("");
    }
  }, [editor && editor.getHTML()]);

  // Sync selectedMedia with editor content if media node is present but selectedMedia is null
  useEffect(() => {
    if (!editor) return;
    const html = editor.getHTML();
    if (!selectedMedia && hasMedia(html)) {
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const node = Array.from(doc.body.childNodes).find(
        n =>
          n.nodeType === 1 &&
          ["IMG", "VIDEO", "AUDIO", "EMBED"].includes(n.tagName)
      );
      if (node) {
        let type = node.tagName.toLowerCase();
        if (type === "img") type = "image";
        if (type === "embed") type = "pdf";
        setSelectedMedia({
          src: node.getAttribute("src"),
          type,
          title: node.getAttribute("title") || "",
          thumbnail: node.getAttribute("thumbnail") || undefined,
        });
      }
    }
  }, [editor, selectedMedia]);

  // All handlers (file uploads, camera, etc.) should be defined here and returned

  // Media upload hook
  const { uploadMedia, loading: uploadLoading, error: uploadError, retry: retryUpload, progress: uploadProgress } = useMediaUpload();

  // Handle file input for media (image/video)
  async function handleFileChange(file) {
    if (!file) return;
    const type = file.type.startsWith("image") ? "image" : file.type.startsWith("video") ? "video" : undefined;

    // Upload file to backend and get permanent URL
    let uploadedUrl = null;
    let uploadedId = null;
    let uploadResult = await uploadMedia(file);
    if (uploadResult && uploadResult.url && uploadResult.id) {
      uploadedUrl = uploadResult.url;
      uploadedId = uploadResult.id;
    } else {
      // fallback to blob url if upload fails
      uploadedUrl = URL.createObjectURL(file);
      uploadedId = null;
    }

    // Always show preview (even if upload fails, for user feedback)
    setSelectedMedia({
      src: uploadedUrl,
      type,
      title: file.name,
      file,
      id: uploadedId,
    });

    // Only call onMediaUpload if upload succeeded (i.e., we have a permanent URL and ID)
    if (uploadedId && uploadedUrl && typeof onMediaUpload === "function") {
      onMediaUpload(uploadedId, type, uploadedUrl, file.name);
      // Only close modal if upload succeeded
      setMediaModalOpen(false);
    } else if (!uploadedId) {
      // Show error: cannot persist blob URL
      alert("Video upload failed. Please try again. The preview is temporary and cannot be saved.");
    }

    // Insert media into the editor for preview (even if upload failed)
    if (editor) {
      if (type === "image") {
        editor.chain().focus().insertContent(`<img src="${uploadedUrl}" alt="${file.name}" title="${file.name}" />`).run();
      } else if (type === "video") {
        editor.chain().focus().insertContent(`<video src="${uploadedUrl}" controls title="${file.name}"></video>`).run();
      }
    }
  }

  // Handle file input for attachments (audio/pdf)
  async function handleAttachmentFileChange(file) {
    if (!file) return;
    const type = file.type.startsWith("audio") ? "audio" : file.type === "application/pdf" ? "pdf" : undefined;

    // Upload file to backend and get permanent URL
    let uploadedUrl = null;
    let uploadedId = null;
    let uploadResult = await uploadMedia(file);
    if (uploadResult && uploadResult.url && uploadResult.id) {
      uploadedUrl = uploadResult.url;
      uploadedId = uploadResult.id;
    } else {
      // fallback to blob url if upload fails
      uploadedUrl = URL.createObjectURL(file);
      uploadedId = null;
    }

    // Always show preview (even if upload fails, for user feedback)
    setSelectedMedia({
      src: uploadedUrl,
      type,
      title: file.name,
      file,
      id: uploadedId,
    });

    // Only call onMediaUpload if upload succeeded (i.e., we have a permanent URL and ID)
    if (uploadedId && uploadedUrl && typeof onMediaUpload === "function") {
      onMediaUpload(uploadedId, type, uploadedUrl, file.name);
      // Only close modal if upload succeeded
      setAttachmentModalOpen(false);
    } else if (!uploadedId) {
      // Show error: cannot persist blob URL
      alert("Audio upload failed. Please try again. The preview is temporary and cannot be saved.");
    }

    // Insert media into the editor for preview (even if upload failed)
    if (editor) {
      if (type === "audio") {
        editor.chain().focus().insertContent(`<audio src="${uploadedUrl}" controls title="${file.name}"></audio>`).run();
      } else if (type === "pdf") {
        editor.chain().focus().insertContent(`<embed src="${uploadedUrl}" type="application/pdf" style="width:100%;min-height:400px;border-radius:8px;margin:8px 0;" title="${file.name}" />`).run();
      }
    }
  }

  // Handle audio recording
  function handleAudioRecordingSelect(audioBlob) {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    setSelectedMedia({
      src: url,
      type: "audio",
      title: "Recorded Audio",
      file: audioBlob,
    });
    setAudioRecorderModalOpen(false);
  }

  return {
    editor,
    selectedThumbnail,
    setSelectedThumbnail,
    mediaTitleInput,
    setMediaTitleInput,
    tab,
    setTab,
    selectedMedia,
    setSelectedMedia,
    mediaModalOpen,
    setMediaModalOpen,
    showCamera,
    setShowCamera,
    fileInputRef,
    selectedMediaNode,
    selectedMediaTitle,
    attachmentModalOpen,
    setAttachmentModalOpen,
    audioRecorderModalOpen,
    setAudioRecorderModalOpen,
    attachmentFileInputRef,
    mediaTitle,
    setMediaTitle,
    postTitle,
    setPostTitle,
    handleFileChange,
    handleAttachmentFileChange,
    handleAudioRecordingSelect,
    uploadLoading,
    uploadError,
    retryUpload,
    uploadProgress,
  };
}
