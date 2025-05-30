import React, { useState, useRef } from "react";
import VideoPlayer from "./VideoPlayer";
import AudioPlayer from "./AudioPlayer";
import VideoViewer from "./VideoViewer";
import ImageViewer from "./ImageViewer";
import DocumentViewer from "./DocumentViewer";
import DocumentCarousel from "./DocumentCarousel";
import { useAutoPlayMedia } from "../hooks/useAutoPlayMedia";
import ImageProcessor from "./ImageProcessor";

let mediaPlayerIdCounter = 0;
function getUniqueMediaPlayerId() {
  return `media-player-${mediaPlayerIdCounter++}`;
}

function getMediaType(src, type) {
  // Always use the provided type prop if present
  if (type && typeof type === "string") {
    const t = type.toLowerCase();
    if (t === "audio" || t.startsWith("audio/")) return "audio";
    if (t === "video" || t.startsWith("video/")) return "video";
    if (t === "image" || t.startsWith("image/")) return "image";
    if (t === "pdf" || t === "document" || t === "application/pdf") return "document";
  }
  // fallback for legacy/unknown types
  if (!src) return "unknown";
  const ext = src.split(".").pop().toLowerCase();
  if (["mp4", "mov"].includes(ext)) return "video";
  if (["webm"].includes(ext)) return "audio"; // treat .webm as audio by default for this app
  if (["mp3", "wav", "ogg", "aac", "flac", "m4a"].includes(ext)) return "audio";
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) return "image";
  if (["pdf"].includes(ext)) return "document";
  return "unknown";
}

const MediaPlayer = ({
  src,
  type,
  poster,
  alt = "",
  controls = true,
  autoPlay = false,
  loop = false,
  className = "",
  style = {},
  title,
  media, // NEW: allow passing a media object directly
  ...rest
}) => {
  // Always use the latest title prop (do not store in state)
  const mediaTitle =
    typeof title !== "undefined"
      ? title
      : media && media.title
      ? media.title
      : undefined;

  const mediaType = getMediaType(src, type);
  const [viewerOpen, setViewerOpen] = useState(false);
  const idRef = useRef(getUniqueMediaPlayerId());
  const { mediaRef, containerRef, handlePlay } = useAutoPlayMedia(idRef.current);

  if (!src) return null;

  // Use mediaTitle in a custom title pane and above the media
  const TitlePane = () =>
    mediaTitle ? (
      <div className="text-base font-semibold text-gray-800 mb-2" data-testid="media-title-pane">
        {mediaType && mediaTitle
          ? `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} title: ${mediaTitle}`
          : mediaTitle}
      </div>
    ) : null;

  return (
    <div>
      <TitlePane />
      {mediaType === "video" && (
        <>
          <div
            ref={containerRef}
            style={{ width: "100%", aspectRatio: "16/9", background: "#000", borderRadius: 8, overflow: "hidden", position: "relative" }}
          >
            <VideoPlayer
              ref={mediaRef}
              src={src}
              poster={poster}
              controls={controls}
              autoPlay={false}
              loop={loop}
              muted={true}
              className={className}
              style={{ ...style, width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }}
              videoId={idRef.current}
              onClick={() => setViewerOpen(true)}
              onPlay={handlePlay}
              {...rest}
            />
          </div>
          <VideoViewer src={src} open={viewerOpen} onClose={() => setViewerOpen(false)} poster={poster} />
        </>
      )}
      {mediaType === "audio" && (
        <div ref={containerRef}>
          <AudioPlayer
            ref={mediaRef}
            src={src}
            controls={controls}
            autoPlay={false}
            loop={loop}
            muted={true}
            className={className}
            style={style}
            onPlay={handlePlay}
            {...rest}
          />
        </div>
      )}
      {mediaType === "image" && (
        <>
          <ImageProcessor
            src={src}
            alt={alt}
            className={className}
            style={{ ...style, cursor: "pointer" }}
            onClick={() => setViewerOpen(true)}
            {...rest}
          />
          <ImageViewer src={src} alt={alt} open={viewerOpen} onClose={() => setViewerOpen(false)} />
        </>
      )}
      {mediaType === "document" && (
        <DocumentCarousel
          src={src}
          type="application/pdf"
          className={className}
          style={style}
          {...rest}
        />
      )}
      {mediaType === "unknown" && <span>Unsupported media type</span>}
    </div>
  );
};

export default MediaPlayer;
