import React from "react";

/**
 * LoadingSpinner - reusable loading spinner with optional label.
 * Props:
 *   label: string (optional, shown below spinner)
 *   className: string (optional, for styling)
 */
export default function LoadingSpinner({ label = "Uploading...", progress, className = "" }) {
  return (
    <div className={`mb-4 flex flex-col items-center ${className}`}>
      <div
        className="loader mb-2"
        style={{
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #3498db",
          borderRadius: "50%",
          width: 32,
          height: 32,
          animation: "spin 1s linear infinite",
        }}
      />
      <span className="text-gray-500 text-sm">{label}</span>
      {typeof progress === "number" && (
        <span className="text-xs text-gray-400 mt-1">{progress}%</span>
      )}
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
