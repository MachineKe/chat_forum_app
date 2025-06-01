import { Node, mergeAttributes } from "@tiptap/core";

// Custom Video extension for Tiptap
export const Video = Node.create({
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
export const Audio = Node.create({
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
export const PDFEmbed = Node.create({
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
