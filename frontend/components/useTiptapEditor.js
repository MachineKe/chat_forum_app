import { useEffect, useState, useRef, useCallback } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { Video, Audio, PDFEmbed } from "./TiptapExtensions";

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
}) {
  // State
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [mediaTitleInput, setMediaTitleInput] = useState("");
  const [tab, setTab] = useState("write");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedMediaNode, setSelectedMediaNode] = useState(null);
  const [selectedMediaTitle, setSelectedMediaTitle] = useState("");
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [audioRecorderModalOpen, setAudioRecorderModalOpen] = useState(false);
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

  // ... (move all business logic handlers from TiptapEditor.jsx here, e.g., handleFileChange, handleCameraCapture, handleAttachmentFileChange, handleAudioRecordingSelect, handleCameraRecord)

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
    // ...handlers to be added
  };
}
