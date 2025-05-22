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
        <VideoPlayer src={src} poster={poster} controls autoPlay style={{ maxHeight: "80vh", maxWidth: "80vw" }} />
      </div>
    </div>
  );
};

export default VideoViewer;
