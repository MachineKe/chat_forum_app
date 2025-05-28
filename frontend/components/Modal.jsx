import React from "react";
import ReactDOM from "react-dom";

/**
 * Modal - A reusable modal component using React Portal.
 * Props:
 * - open: boolean (controls visibility)
 * - onClose: function (called when overlay or close is clicked)
 * - children: modal content
 * - className: additional classes for modal content
 */
const Modal = ({ open, onClose, children, className = "" }) => {
  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative ${className}`}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
          aria-label="Close"
        >
          ✖️
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
