import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import UploadError from "./UploadError";

/**
 * UploadFeedback - shows upload progress and error feedback.
 * Props:
 * - loading: boolean (upload in progress)
 * - progress: number (0-100, optional)
 * - error: string (error message, optional)
 * - onRetry: function (retry handler, optional)
 * - className: string (optional)
 */
export default function UploadFeedback({ loading, progress, error, onRetry, className = "" }) {
  if (!loading && !error) return null;
  return (
    <div className={`w-full my-1 ${className}`}>
      {loading && <LoadingSpinner progress={progress} />}
      <UploadError error={error} onRetry={onRetry} />
    </div>
  );
}
