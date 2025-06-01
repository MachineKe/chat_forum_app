import React, { useState } from "react";

/**
 * ExcessContentManager
 * Reveals only the first few words/phrases of content, with a "Show more"/"Show less" toggle.
 * 
 * Props:
 * - content: string | ReactNode (the content to display)
 * - wordLimit: number (default: 20) - number of words to show before truncating
 * - showLessLabel: string (default: "Show less")
 * - showMoreLabel: string (default: "Show more")
 * - className: string (optional) - for styling
 */
const ExcessContentManager = ({
  content,
  wordLimit = 20,
  showLessLabel = "Show less",
  showMoreLabel = "Show more",
  className = "",
}) => {
  const [expanded, setExpanded] = useState(false);

  // If content is not a string, just render as is (no truncation)
  if (typeof content !== "string") {
    return <div className={className}>{content}</div>;
  }

  const words = content.split(/\s+/);
  const isExcess = words.length > wordLimit;
  const preview = words.slice(0, wordLimit).join(" ");
  const rest = words.slice(wordLimit).join(" ");

  return (
    <div className={className}>
      {isExcess ? (
        <>
          {expanded ? (
            <>
              {content}
              <button
                className="ml-2 text-blue-600 hover:underline bg-transparent border-none cursor-pointer text-sm"
                onClick={e => {
                  e.stopPropagation();
                  setExpanded(false);
                }}
                type="button"
              >
                {showLessLabel}
              </button>
            </>
          ) : (
            <>
              {preview}
              {"... "}
              <button
                className="ml-2 text-blue-600 hover:underline bg-transparent border-none cursor-pointer text-sm"
                onClick={e => {
                  e.stopPropagation();
                  setExpanded(true);
                }}
                type="button"
              >
                {showMoreLabel}
              </button>
            </>
          )}
        </>
      ) : (
        content
      )}
    </div>
  );
};

export default ExcessContentManager;
