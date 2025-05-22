import React, { useState, useRef } from "react";
import VideoPlayer from "./VideoPlayer";
import AudioPlayer from "./AudioPlayer";
import VideoViewer from "./VideoViewer";
import ImageViewer from "./ImageViewer";

// Generate a unique id for each video instance
let mediaPlayerIdCounter = 0;
function getUniqueMediaPlayerId() {
  return `media-player-${mediaPlayerIdCounter++}`;
}

function getMediaType(src, type) {
  if (type) return type;
  if (!src) return "unknown";
  const ext = src.split(".").pop().toLowerCase();
  if (["mp4", "webm", "ogg", "mov"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "aac", "flac"].includes(ext)) return "audio";
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) return "image";
  return "unknown";
}

const MediaPlayer = ({ src, type, poster, alt = "", controls = true, autoPlay = false, loop = false, className = "", style = {} }) => {
  const mediaType = getMediaType(src, type);
  const [viewerOpen, setViewerOpen] = useState(false);
  const idRef = useRef(getUniqueMediaPlayerId());

  if (!src) return null;

  if (mediaType === "video") {
    return (
      <>
        <div style={{ width: "100%", aspectRatio: "16/9", background: "#000", borderRadius: 8, overflow: "hidden", position: "relative" }}>
          <VideoPlayer
            src={src}
            poster={poster}
            controls={controls}
            autoPlay={autoPlay}
            loop={loop}
            className={className}
            style={{ ...style, width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }}
            videoId={idRef.current}
            onClick={() => setViewerOpen(true)}
          />
        </div>
        <VideoViewer src={src} open={viewerOpen} onClose={() => setViewerOpen(false)} poster={poster} />
      </>
    );
  }

  if (mediaType === "audio") {
    return <AudioPlayer src={src} controls={controls} autoPlay={autoPlay} loop={loop} className={className} style={style} />;
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

  return <span>Unsupported media type</span>;
};

export default MediaPlayer;
