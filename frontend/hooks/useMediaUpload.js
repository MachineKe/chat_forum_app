import { useState, useCallback } from "react";

/**
 * useMediaUpload - reusable hook for uploading media files to the backend.
 * Returns: { uploadMedia, loading, error, retry }
 */
export default function useMediaUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [lastArgs, setLastArgs] = useState(null);

  // Upload function
  const uploadMedia = useCallback(async (file, extraFormData = {}) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    setLastArgs({ file, extraFormData });
    try {
      const formData = new FormData();
      formData.append("media", file);
      for (const [key, value] of Object.entries(extraFormData)) {
        formData.append(key, value);
      }
      // Use XMLHttpRequest for progress
      const xhr = new XMLHttpRequest();
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/posts/upload-media`;
      const promise = new Promise((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => {
          setLoading(false);
          setProgress(null);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              setError(null);
              resolve({ id: data.id, url: data.url, title: data.title, thumbnail: data.thumbnail });
            } catch (e) {
              setError("Upload failed (bad response)");
              reject(new Error("Upload failed (bad response)"));
            }
          } else {
            let errMsg = "Upload failed";
            try {
              const errData = JSON.parse(xhr.responseText);
              errMsg = errData.error || errMsg;
            } catch {}
            setError(errMsg);
            reject(new Error(errMsg));
          }
        };
        xhr.onerror = () => {
          setLoading(false);
          setProgress(null);
          setError("Upload failed (network error)");
          reject(new Error("Upload failed (network error)"));
        };
      });
      xhr.open("POST", url);
      xhr.send(formData);
      const result = await promise;
      return result;
    } catch (err) {
      setLoading(false);
      setProgress(null);
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

  return { uploadMedia, loading, error, retry, progress };
}
