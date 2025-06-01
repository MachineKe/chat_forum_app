import React from "react";
import ReactDOM from "react-dom";

/**
 * Modal - A reusable modal overlay using React Portal.
 * Props:
 * - open: boolean (controls visibility)
 * - onClose: function (called when overlay or close is clicked)
 * - children: modal content (should include all card styling)
 * - showClose: boolean (show close button, default true)
 * - className: additional classes for modal content wrapper
 */
const Modal = ({ open, onClose, children, showClose = true, className = "" }) => {
  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className={`relative ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {showClose && (
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 z-10"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ✖️
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
