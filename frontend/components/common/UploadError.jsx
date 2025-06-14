import React from "react";

/**
 * UploadError - reusable error display with retry button.
 * Props:
 *   error: string (error message)
 *   onRetry: function (called when retry button is clicked)
 *   className: string (optional, for styling)
 */
export default function UploadError({ error, onRetry, className = "" }) {
  if (!error) return null;
  return (
    <div className={`mb-4 flex flex-col items-center ${className}`}>
      <span className="text-red-600 text-sm mb-2">{error}</span>
      {onRetry && (
        <button
          className="px-3 py-1 bg-red-500 text-white rounded mb-2"
          onClick={onRetry}
        >
          Retry Upload
        </button>
      )}
    </div>
  );
}
