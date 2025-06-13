import React, { useRef, useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";

 // Set workerSrc for react-pdf to the local public directory as an ES module
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
if (typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.log("pdfjs workerSrc set to:", pdfjs.GlobalWorkerOptions.workerSrc);
  window.onerror = function (msg, url, line, col, error) {
    // eslint-disable-next-line no-console
    console.error("Global error:", msg, url, line, col, error);
  };
}

/**
 * DocumentViewer - renders a specific page of a PDF using react-pdf, responsive to parent width.
 *
 * Props:
 *   src (string): URL to the document file
 *   type (string): MIME type, e.g. "application/pdf"
 *   pageNumber (number): Page number to render (1-based)
 *   className (string): Optional CSS classes
 *   style (object): Optional inline styles
 *   onLoadSuccess (function): Callback when PDF loads, receives { numPages }
 */
const DocumentViewer = ({
  src,
  type = "application/pdf",
  pageNumber = 1,
  className = "",
  style = {},
  onLoadSuccess,
  hideLoading = false,
}) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Set initial width
    setContainerWidth(containerRef.current.offsetWidth);

    // Listen for resize
    const resizeObserver = new window.ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!src) return null;

  // Only PDF supported for now
  if (type === "application/pdf" || src.toLowerCase().endsWith(".pdf")) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          width: "100%",
          borderRadius: 8,
          ...style,
        }}
      >
        {isLoading && !hasError && !hideLoading && (
          <div className="flex items-center justify-center w-full h-64 absolute top-0 left-0 z-10 bg-white bg-opacity-80">
            <span className="text-gray-400">Loading PDF...</span>
          </div>
        )}
        <Document
          file={src}
          onLoadSuccess={info => {
            setIsLoading(false);
            setHasError(false);
            if (typeof window !== "undefined") {
              // eslint-disable-next-line no-console
              console.log("PDF onLoadSuccess", info);
            }
            if (onLoadSuccess) onLoadSuccess(info);
          }}
          onLoadError={err => {
            setIsLoading(false);
            setHasError(true);
            if (typeof window !== "undefined") {
              // eslint-disable-next-line no-console
              console.error("PDF onLoadError", err);
            }
            if (typeof onError === "function") onError(err);
          }}
          loading={null}
          error={null}
        >
          <Page
            pageNumber={pageNumber}
            width={containerWidth || 1}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
        {hasError && (
          <div className="text-center text-red-500">Failed to load PDF.</div>
        )}
      </div>
    );
  }

  // Fallback for unsupported types
  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
      View Document
    </a>
  );
};

export default DocumentViewer;
