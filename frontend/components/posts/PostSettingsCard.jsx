import React, { useState } from "react";
import Card from "@components/layout/Card";
import MediaPlayer from "@components/media/MediaPlayer";
import { resolveMediaUrl, fixMediaSrcs } from "@utils/api";

function renderTextBeforeMedia(html) {
  try {
    if (typeof window === "undefined" || typeof window.DOMParser === "undefined") {
      return <span dangerouslySetInnerHTML={{ __html: html }} />;
    }
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const nodes = Array.from(doc.body.childNodes);

    // Separate text and media nodes
    const textNodes = [];
    const mediaNodes = [];
    nodes.forEach((node, i) => {
      if (
        node.nodeType === 3 || // Text node
        (node.nodeType === 1 && node.tagName !== "IMG" && node.tagName !== "VIDEO")
      ) {
        textNodes.push(node);
      } else if (node.nodeType === 1 && (node.tagName === "IMG" || node.tagName === "VIDEO")) {
        mediaNodes.push(node);
      }
    });

    // Helper to convert DOM node to React element
    function domToReact(node, key) {
      if (node.nodeType === 3) {
        return node.textContent;
      }
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
        // Handle void elements (e.g., hr, br, input, etc.)
        const voidTags = ["HR", "BR", "INPUT", "IMG", "AREA", "BASE", "COL", "EMBED", "LINK", "META", "PARAM", "SOURCE", "TRACK", "WBR"];
        // Helper to convert style string to object
        function styleStringToObject(styleString) {
          if (!styleString) return undefined;
          return styleString.split(";").filter(Boolean).reduce((acc, item) => {
            const [prop, value] = item.split(":");
            if (prop && value) {
              // Convert kebab-case to camelCase
              const camelProp = prop.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
              acc[camelProp] = value.trim();
            }
            return acc;
          }, {});
        }
        // Build props object, converting style if present
        function buildProps(node, key) {
          const props = { key };
          for (const attr of Array.from(node.attributes)) {
            if (attr.name === "style") {
              const styleObj = styleStringToObject(attr.value);
              if (styleObj) props.style = styleObj;
            } else {
              props[attr.name] = attr.value;
            }
          }
          return props;
        }
        if (voidTags.includes(node.tagName)) {
          // Special handling for <embed> to ensure style is always an object
          if (node.tagName === "EMBED") {
            const props = buildProps(node, key);
            if (props.style && typeof props.style === "string") {
              props.style = styleStringToObject(props.style);
            }
            return React.createElement(
              node.tagName.toLowerCase(),
              props
            );
          }
          return React.createElement(
            node.tagName.toLowerCase(),
            buildProps(node, key)
          );
        }
        // For other elements, recursively render children
        return React.createElement(
          node.tagName.toLowerCase(),
          buildProps(node, key),
          Array.from(node.childNodes).map((child, idx) => domToReact(child, `${key}-${idx}`))
        );
      }
      return null;
    }

    return (
      <>
        {textNodes.map((node, i) => domToReact(node, `text-${i}`))}
        {mediaNodes.map((node, i) => domToReact(node, `media-${i}`))}
      </>
    );
  } catch (err) {
    // Fallback to raw HTML if parsing fails
    return <span dangerouslySetInnerHTML={{ __html: fixMediaSrcs(html) }} />;
  }
}

function extractFirstMediaFromHtml(html) {
  if (typeof window === "undefined" || typeof window.DOMParser === "undefined") return null;
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const node = Array.from(doc.body.querySelectorAll("img,video,audio,embed"))[0];
  if (!node) return null;
  const title = node.getAttribute("title") || "";
  if (node.tagName === "IMG") return { url: node.getAttribute("src"), type: "image", title };
  if (node.tagName === "VIDEO") return { url: node.getAttribute("src"), type: "video", title };
  if (node.tagName === "AUDIO") return { url: node.getAttribute("src"), type: "audio", title };
  if (node.tagName === "EMBED") {
    const type = node.getAttribute("type");
    return { url: node.getAttribute("src"), type: type === "application/pdf" ? "pdf" : "document", title };
  }
  return null;
}

const PostSettingsCard = ({ content, media, onBack, onPost, loading, user = { name: "User", avatar: "" } }) => {
  const [boost, setBoost] = useState(false);

  // Use media prop if present, otherwise extract from content
  const previewMedia = media || extractFirstMediaFromHtml(content);

  return (
    <Card className="w-full p-0 mb-4">
      {/* Header */}
      <div className="flex items-center border-b px-4 py-3">
        <button
          className="text-gray-600 hover:bg-gray-100 rounded-full p-1 mr-2"
          onClick={onBack}
          aria-label="Back"
          style={{ lineHeight: 0 }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 text-center mr-2 font-semibold text-lg text-gray-900">Post settings</div>
        <div className="w-8" /> {/* Spacer for symmetry */}
      </div>
      {/* Post preview */}
      <div className="px-4 pt-4 pb-2">
        <div className="font-semibold text-gray-900 mb-1">Post preview</div>
        <div className="p-0 text-gray-900 mb-2 min-h-[40px]" style={{ fontSize: 16 }}>
          {/* Show only plain text content */}
          {typeof content === "string"
            ? content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
            : ""}
        </div>
        {previewMedia && (
          <div className="my-4">
            <MediaPlayer
              src={resolveMediaUrl(previewMedia.url)}
              type={previewMedia.type}
              title={previewMedia.title}
              thumbnail={previewMedia.thumbnail}
              alt=""
              style={{ maxWidth: "100%", borderRadius: 8, margin: "8px 0" }}
            />
          </div>
        )}
      </div>
      {/* Schedule post row */}
      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border-t border-b-0 border-gray-200 mx-4 mt-0 mb-0">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" fill="#E5E7EB"/><path d="M8 2v4M16 2v4M3 10h18" stroke="#9CA3AF" strokeWidth="2"/><rect x="7" y="14" width="4" height="4" rx="1" fill="#3B82F6"/></svg>
        <span className="text-gray-500 text-sm">schedule post</span>
      </div>
      {/* Save As Draft */}
      <div className="flex items-center px-4 py-3 border-t">
        <span className="mr-3">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="4" fill="#f3f4f6"/>
            <path d="M12 8v4l3 3" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <div className="flex-1">
          <div className="font-medium text-gray-900">Save As Draft</div>
          <div className="text-xs text-gray-500">Save this post as draft to publish it later</div>
        </div>
        <label className="inline-flex items-center cursor-pointer ml-2">
          <input
            type="checkbox"
            className="sr-only"
            checked={boost}
            onChange={() => setBoost(!boost)}
          />
          <div className={`w-10 h-6 bg-gray-200 rounded-full p-1 flex items-center transition-colors ${boost ? "bg-blue-500" : ""}`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${boost ? "translate-x-4" : ""}`}></div>
          </div>
        </label>
      </div>
      {/* Post button */}
      <div className="px-4 py-4">
        <button
          className="w-full py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          onClick={onPost}
          disabled={loading}
        >
          {loading ? "Saving..." : "Post"}
        </button>
      </div>
    </Card>
  );
};

export default PostSettingsCard;
