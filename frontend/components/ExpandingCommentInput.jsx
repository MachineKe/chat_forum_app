import React, { useState, useRef } from "react";
import TiptapEditor from "./TiptapEditor";

/**
 * ExpandingCommentInput
 * - Default: plain text placeholder view (not editable)
 * - On focus/click: expands to rich text editor (TiptapEditor)
 * - On close: returns to plain text view
 * Props:
 * - value: string
 * - onChange: function
 * - onSubmit: function
 * - placeholder: string
 * - minHeight: number
 * - actionLabel: string
 * - disabled: boolean
 */
const ExpandingCommentInput = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Write a comment...",
  minHeight = 80,
  actionLabel = "Comment",
  disabled = false,
}) => {
  const [active, setActive] = useState(false);
  const inputRef = useRef(null);

  return (
    <div className="w-full">
      {active ? (
        <TiptapEditor
          ref={inputRef}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          minHeight={minHeight}
          actionLabel={actionLabel}
          onNext={() => {
            if (onSubmit) onSubmit();
            setActive(false);
          }}
          onClose={() => setActive(false)}
          disabled={disabled}
        />
      ) : (
        <div
          className="w-full min-h-[48px] px-4 py-3 bg-gray-100 rounded-2xl text-gray-700 text-base cursor-text border border-gray-200 hover:bg-gray-200 transition flex items-center"
          style={{ lineHeight: "2.2rem" }}
          tabIndex={0}
          onFocus={() => setActive(true)}
          onClick={() => setActive(true)}
        >
          <span className="text-gray-400">{placeholder}</span>
        </div>
      )}
    </div>
  );
};

export default ExpandingCommentInput;
