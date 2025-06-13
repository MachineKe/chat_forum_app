import React, { useEffect, useRef, useState } from "react";
import LoadingSpinner from "../common/LoadingSpinner";
import * as pdfjsLib from "pdfjs-dist/build/pdf";

// Set workerSrc to the public worker file for Vite/React compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

const FADE_DURATION = 250; // ms

const DocumentViewer = ({
  src,
  pageNumber = 1,
  className = "",
  style = {},
  onLoadSuccess,
  onError,
  onPageRender,
  minHeight = "400px",
  hideLoading = false,
  ...rest
}) => {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [fade, setFade] = useState(true);
  const [pendingPage, setPendingPage] = useState(pageNumber);
  const [shouldRender, setShouldRender] = useState(true);
  const prevPageRef = useRef(pageNumber);

  // Load PDF document
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPdfDoc(null);

    const load = async () => {
      try {
        if (!src) {
          setError("No PDF source provided");
          setLoading(false);
          return;
        }
        const loadingTask = pdfjsLib.getDocument(src);
        const doc = await loadingTask.promise;
        if (!cancelled) {
          setPdfDoc(doc);
          setLoading(false);
          if (onLoadSuccess) onLoadSuccess({ numPages: doc.numPages });
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load PDF");
          setLoading(false);
          if (onError) onError(err);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Handle page transition: fade out, then render, then fade in
  useEffect(() => {
    if (prevPageRef.current !== pageNumber) {
      setFade(false);
      setShouldRender(false); // Don't render new page yet
      setPendingPage(pageNumber);
      const timeout = setTimeout(() => {
        prevPageRef.current = pageNumber;
        setShouldRender(true); // Now render new page
        setFade(true);
      }, FADE_DURATION);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  // Render the requested page only after fade-out is complete
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !shouldRender) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pendingPage);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        if (!cancelled) {
          setLoading(false);
          if (onPageRender) onPageRender(viewport.height);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to render page");
          setLoading(false);
          if (onError) onError(err);
        }
      }
    };

    renderPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc, pendingPage, onPageRender, onError, shouldRender]);

  if (error) {
    return (
      <div className={`relative w-full rounded-lg bg-white overflow-hidden flex items-center justify-center ${className}`} style={{ minHeight, ...style }}>
        <span className="text-red-600 text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full rounded-lg bg-white overflow-hidden flex items-center justify-center ${className}`}
      style={{ minHeight, ...style }}
    >
      {loading && !hideLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <LoadingSpinner label="Loading page..." />
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "auto",
          borderRadius: 16,
          background: "white",
          display: loading ? "none" : "block",
          opacity: fade ? 1 : 0,
          transition: `opacity ${FADE_DURATION}ms`
        }}
        {...rest}
      />
    </div>
  );
};

export default DocumentViewer;
