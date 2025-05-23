import React, { useState, useRef } from "react";
import VideoPlayer from "./VideoPlayer";
import AudioPlayer from "./AudioPlayer";
import VideoViewer from "./VideoViewer";
import ImageViewer from "./ImageViewer";
import DocumentViewer from "./DocumentViewer";
import DocumentCarousel from "./DocumentCarousel";
import { useAutoPlayMedia } from "../hooks/useAutoPlayMedia";

let mediaPlayerIdCounter = 0;
function getUniqueMediaPlayerId() {
  return `media-player-${mediaPlayerIdCounter++}`;
}

function getMediaType(src, type) {
  if (type) {
    if (type === "pdf") return "document";
    if (type === "audio" || type === "video" || type === "image" || type === "document") return type;
    // fallback for legacy/unknown types
  }
  if (!src) return "unknown";
  const ext = src.split(".").pop().toLowerCase();
  if (["mp4", "webm", "ogg", "mov"].includes(ext)) return "video";
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
}) => {
  const mediaType = getMediaType(src, type);
  const [viewerOpen, setViewerOpen] = useState(false);
  const idRef = useRef(getUniqueMediaPlayerId());
  const { mediaRef, containerRef, handlePlay } = useAutoPlayMedia(idRef.current);

  if (!src) return null;

  if (mediaType === "video") {
    return (
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
          />
        </div>
        <VideoViewer src={src} open={viewerOpen} onClose={() => setViewerOpen(false)} poster={poster} />
      </>
    );
  }

  if (mediaType === "audio") {
    return (
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
        />
      </div>
    );
  }

  if (mediaType === "image") {
    return (
      <>
        <img
          src={src}
          alt={alt}
          className={className}
          style={{ ...style, cursor: "pointer" }}
          onClick={() => setViewerOpen(true)}
        />
        <ImageViewer src={src} alt={alt} open={viewerOpen} onClose={() => setViewerOpen(false)} />
      </>
    );
  }

  if (mediaType === "document") {
    return (
      <DocumentCarousel
        src={src}
        type="application/pdf"
        className={className}
        style={style}
      />
    );
  }

  return <span>Unsupported media type</span>;
};

export default MediaPlayer;
