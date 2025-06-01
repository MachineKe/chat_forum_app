import React, { useRef, useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Set workerSrc for react-pdf to the local public directory to avoid CORS and import issues
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

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
        <Document
          file={src}
          onLoadSuccess={onLoadSuccess}
          loading={<div className="text-center text-gray-400">Loading PDF...</div>}
          error={<div className="text-center text-red-500">Failed to load PDF.</div>}
        >
          <Page
            pageNumber={pageNumber}
            width={containerWidth || 1}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
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
