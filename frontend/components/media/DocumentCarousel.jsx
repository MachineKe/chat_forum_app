/**
 * Usage Example:
 * <DocumentCarousel
 *   src="/path/to/document.pdf"
 *   name="Frontend Development Roadmap"
 *   className="max-w-2xl mx-auto"
 * />
 *
 * Props:
 *   src: PDF file URL (required)
 *   type: MIME type (default "application/pdf")
 *   name: Optional document name
 *   className: Optional CSS classes
 *   style: Optional inline styles
 *   initialPage: Page to show first (default 1)
 */

import React, { useState } from "react";
import DocumentViewer from "./DocumentViewer";

/**
 * DocumentCarousel - carousel for viewing pages of a single PDF document.
 * Props:
 *   src: PDF file URL
 *   type: MIME type (default "application/pdf")
 *   name: Optional document name
 *   className: Optional CSS classes
 *   style: Optional inline styles
 *   initialPage: Page to show first (default 1)
 */
const DocumentCarousel = ({
  src,
  type = "application/pdf",
  name,
  className = "",
  style = {},
  initialPage = 1,
}) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [transitioning, setTransitioning] = useState(false);
  const [pendingPage, setPendingPage] = useState(null);

  if (!src) return null;

  const handleLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    // Clamp currentPage if needed
    if (currentPage > numPages) setCurrentPage(numPages);
  };

  const goTo = (page) => {
    if (!numPages) return;
    if (page < 1 || page > numPages) return;
    if (page === currentPage) return;
    setTransitioning(true);
    setPendingPage(page);
    setTimeout(() => {
      setCurrentPage(page);
      setTransitioning(false);
      setPendingPage(null);
    }, 250);
  };

  const handlePrev = () => goTo(currentPage - 1);
  const handleNext = () => goTo(currentPage + 1);

  return (
    <div className={`w-full py-4 ${className}`} style={style}>
      <div className="relative w-full h-full bg-white rounded-xl shadow-lg flex flex-col justify-center items-center py-4 group overflow-visible z-10">
        <div
          className={`w-full h-full flex-1 flex items-center justify-center outline-none transition-opacity duration-300 ${transitioning ? "opacity-0" : "opacity-100"}`}
          tabIndex={0}
        >
          <DocumentViewer
            src={src}
            type={type}
            pageNumber={currentPage}
            onLoadSuccess={handleLoadSuccess}
            className="w-full h-full"
            style={{ borderRadius: 16, background: "white", width: "100%", height: "100%" }}
          />
        </div>
        {/* Carousel Navigation Buttons */}
        {numPages && numPages > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 rounded-full shadow-lg p-3 z-20 border border-gray-300 hover:bg-blue-100 transition-all opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto focus-within:opacity-100 focus-within:pointer-events-auto disabled:opacity-40 disabled:pointer-events-none text-2xl"
              style={{ left: 8, right: "auto" }}
              onClick={handlePrev}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              &#8592;
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 rounded-full shadow-lg p-3 z-20 border border-gray-300 hover:bg-blue-100 transition-all opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto focus-within:opacity-100 focus-within:pointer-events-auto disabled:opacity-40 disabled:pointer-events-none text-2xl"
              style={{ right: 8, left: "auto" }}
              onClick={handleNext}
              disabled={currentPage === numPages}
              aria-label="Next page"
            >
              &#8594;
            </button>
          </>
        )}
        {name && (
          <div className="text-center text-xs text-gray-500 mt-2">{name}</div>
        )}
      </div>
      {/* Page Indicator and Dots BELOW the PDF card */}
      {numPages && numPages > 1 && (
        <div className="flex flex-col items-center mt-2" style={{ background: "none", border: "none" }}>
          <span className="text-xs text-gray-700 bg-white bg-opacity-90 rounded px-2 py-1 shadow border border-gray-200 mb-1">
            {currentPage} / {numPages}
          </span>
          <div className="flex flex-row justify-center items-center gap-2" style={{ background: "none", border: "none" }}>
            {(() => {
              const dots = [];
              const maxDots = 7;
              if (numPages <= maxDots) {
                for (let i = 1; i <= numPages; i++) {
                  dots.push(
                    <span
                      key={i}
                      className="inline-block"
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: i === currentPage ? "#2563eb" : "#d1d5db",
                        margin: "0 3px",
                        cursor: "pointer",
                        border: "2px solid white",
                        boxShadow: i === currentPage ? "0 0 0 2px #2563eb44" : "none",
                        transition: "background 0.2s"
                      }}
                      onClick={() => goTo(i)}
                    />
                  );
                }
              } else {
                // Always show first dot
                dots.push(
                  <span
                    key={1}
                    className="inline-block"
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: 1 === currentPage ? "#2563eb" : "#d1d5db",
                      margin: "0 3px",
                      cursor: "pointer",
                      border: "2px solid white",
                      boxShadow: 1 === currentPage ? "0 0 0 2px #2563eb44" : "none",
                      transition: "background 0.2s"
                    }}
                    onClick={() => goTo(1)}
                  />
                );
                // Show left ellipsis if needed
                if (currentPage > 4) {
                  dots.push(
                    <span key="left-ellipsis" style={{ width: 10, height: 10, margin: "0 3px", color: "#aaa" }}>…</span>
                  );
                }
                // Show up to 3 dots before current
                for (let i = Math.max(2, currentPage - 2); i < currentPage; i++) {
                  dots.push(
                    <span
                      key={i}
                      className="inline-block"
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: i === currentPage ? "#2563eb" : "#d1d5db",
                        margin: "0 3px",
                        cursor: "pointer",
                        border: "2px solid white",
                        boxShadow: i === currentPage ? "0 0 0 2px #2563eb44" : "none",
                        transition: "background 0.2s"
                      }}
                      onClick={() => goTo(i)}
                    />
                  );
                }
                // Current page dot
                if (currentPage !== 1 && currentPage !== numPages) {
                  dots.push(
                    <span
                      key={currentPage}
                      className="inline-block"
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: "#2563eb",
                        margin: "0 3px",
                        cursor: "pointer",
                        border: "2px solid white",
                        boxShadow: "0 0 0 2px #2563eb44",
                        transition: "background 0.2s"
                      }}
                      onClick={() => goTo(currentPage)}
                    />
                  );
                }
                // Show up to 3 dots after current
                for (let i = currentPage + 1; i <= Math.min(numPages - 1, currentPage + 2); i++) {
                  dots.push(
                    <span
                      key={i}
                      className="inline-block"
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: i === currentPage ? "#2563eb" : "#d1d5db",
                        margin: "0 3px",
                        cursor: "pointer",
                        border: "2px solid white",
                        boxShadow: i === currentPage ? "0 0 0 2px #2563eb44" : "none",
                        transition: "background 0.2s"
                      }}
                      onClick={() => goTo(i)}
                    />
                  );
                }
                // Show right ellipsis if needed
                if (currentPage < numPages - 3) {
                  dots.push(
                    <span key="right-ellipsis" style={{ width: 10, height: 10, margin: "0 3px", color: "#aaa" }}>…</span>
                  );
                }
                // Always show last dot
                dots.push(
                  <span
                    key={numPages}
                    className="inline-block"
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: numPages === currentPage ? "#2563eb" : "#d1d5db",
                      margin: "0 3px",
                      cursor: "pointer",
                      border: "2px solid white",
                      boxShadow: numPages === currentPage ? "0 0 0 2px #2563eb44" : "none",
                      transition: "background 0.2s"
                    }}
                    onClick={() => goTo(numPages)}
                  />
                );
              }
              return dots;
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentCarousel;
