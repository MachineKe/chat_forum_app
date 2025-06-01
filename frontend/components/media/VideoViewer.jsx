import React from "react";
import VideoPlayer from "./VideoPlayer";

const VideoViewer = ({ src, open, onClose, poster }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      onClick={onClose}
      style={{ cursor: "zoom-out" }}
    >
      <div
        className="relative"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: "90vw", maxHeight: "90vh" }}
      >
        <button
          className="absolute top-2 right-2 text-white text-2xl bg-black bg-opacity-50 rounded-full px-2 py-1"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div
          style={{
            width: "80vw",
            maxWidth: "90vw",
            aspectRatio: "16/9",
            background: "#000",
            borderRadius: 12,
            boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <VideoPlayer
            src={src}
            poster={poster}
            controls
            autoPlay
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              background: "#000"
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoViewer;
