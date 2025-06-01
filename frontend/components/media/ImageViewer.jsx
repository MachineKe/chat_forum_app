import React from "react";
import ImageProcessor from "@components/media/ImageProcessor";

const overlayStyle = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(0,0,0,0.7)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const modalStyle = {
  background: "transparent",
  border: "none",
  boxShadow: "none",
  maxWidth: "90vw",
  maxHeight: "90vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const closeBtnStyle = {
  position: "absolute",
  top: 24,
  right: 32,
  fontSize: 32,
  color: "#fff",
  background: "rgba(0,0,0,0.3)",
  border: "none",
  borderRadius: "50%",
  width: 48,
  height: 48,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  zIndex: 1001
};

function ImageViewer({ src, alt = "", open, onClose }) {
  if (!open) return null;
  return (
    <div style={overlayStyle} onClick={onClose}>
      <button style={closeBtnStyle} onClick={onClose} aria-label="Close image viewer">
        &times;
      </button>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <ImageProcessor
          src={src}
          alt={alt}
          style={{
            maxWidth: "90vw",
            maxHeight: "80vh",
            borderRadius: 12,
            boxShadow: "0 4px 32px rgba(0,0,0,0.4)"
          }}
        />
      </div>
    </div>
  );
}

export default ImageViewer;
