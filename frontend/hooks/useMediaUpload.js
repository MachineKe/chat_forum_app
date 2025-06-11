import { useState, useCallback } from "react";

/**
 * useMediaUpload - reusable hook for uploading media files to the backend.
 * Returns: { uploadMedia, loading, error, retry }
 */
export default function useMediaUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastArgs, setLastArgs] = useState(null);

  // Upload function
  const uploadMedia = useCallback(async (file, extraFormData = {}) => {
    setLoading(true);
    setError(null);
    setLastArgs({ file, extraFormData });
    try {
      const formData = new FormData();
      formData.append("media", file);
      for (const [key, value] of Object.entries(extraFormData)) {
        formData.append(key, value);
      }
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/posts/upload-media`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Upload failed");
      }
      const data = await res.json();
      setLoading(false);
      setError(null);
      return { id: data.id, url: data.url, title: data.title, thumbnail: data.thumbnail };
    } catch (err) {
      setLoading(false);
      setError(err.message || "Upload failed");
      return null;
    }
  }, []);

  // Retry function
  const retry = useCallback(async () => {
    if (lastArgs) {
      return uploadMedia(lastArgs.file, lastArgs.extraFormData);
    }
    return null;
  }, [lastArgs, uploadMedia]);

  return { uploadMedia, loading, error, retry };
}
