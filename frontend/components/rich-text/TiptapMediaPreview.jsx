import React from "react";
import MediaPlayer from "@components/media/MediaPlayer";

// Helper to render only media nodes from Tiptap HTML
function renderMediaPreviewOnly(html, overrideTitle, selectedMedia) {
  try {
    if (typeof window === "undefined" || typeof window.DOMParser === "undefined") {
      return <span dangerouslySetInnerHTML={{ __html: html }} />;
    }
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const nodes = Array.from(doc.body.childNodes);

    // Only render media nodes (img, video, audio, embed)
    const mediaNodes = nodes.filter(
      node =>
        node.nodeType === 1 &&
        ["IMG", "VIDEO", "AUDIO", "EMBED"].includes(node.tagName)
    );

    // Helper to convert DOM node to React element
    function domToReact(node, key) {
      if (node.nodeType === 1) {
        // Extract thumbnail from node attribute if present, else fallback to selectedMedia.thumbnail
        let thumbnail = node.getAttribute && node.getAttribute("thumbnail");
        if (!thumbnail && selectedMedia && selectedMedia.thumbnail) {
          thumbnail = selectedMedia.thumbnail;
        }
        if (node.tagName === "IMG") {
          const src = node.getAttribute("src");
          const title = overrideTitle !== undefined ? overrideTitle : (node.getAttribute("title") || "");
          return (
            <MediaPlayer
              key={key}
              src={src}
              type="image"
              title={title}
              alt=""
              thumbnail={thumbnail}
              style={{ maxWidth: "100%", borderRadius: 8, margin: "8px 0" }}
            />
          );
        }
        if (node.tagName === "VIDEO") {
          const src = node.getAttribute("src");
          const title = overrideTitle !== undefined ? overrideTitle : (node.getAttribute("title") || "");
          return (
            <MediaPlayer
              key={key}
              src={src}
              type="video"
              title={title}
              autoPlay={true}
              muted={false}
              thumbnail={thumbnail}
              style={{ maxWidth: "100%", borderRadius: 8, margin: "8px 0" }}
            />
          );
        }
        if (node.tagName === "AUDIO") {
          const src = node.getAttribute("src");
          const title = overrideTitle !== undefined ? overrideTitle : (node.getAttribute("title") || "");
          return (
            <MediaPlayer
              key={key}
              src={src}
              type="audio"
              title={title}
              thumbnail={thumbnail}
              style={{ maxWidth: "100%", borderRadius: 8, margin: "8px 0" }}
            />
          );
        }
        if (node.tagName === "EMBED") {
          const src = node.getAttribute("src");
          const type = node.getAttribute("type");
          const title = overrideTitle !== undefined ? overrideTitle : (node.getAttribute("title") || "");
          return (
            <MediaPlayer
              key={key}
              src={src}
              type={type === "application/pdf" ? "pdf" : "document"}
              title={title}
              thumbnail={thumbnail}
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
    // Fallback to raw HTML if parsing fails
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  }
}

export default renderMediaPreviewOnly;
