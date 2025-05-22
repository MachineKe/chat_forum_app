import React from "react";

/**
 * PlainTextEditor - a reusable textarea component for plain text editing.
 * Props:
 * - value: string (required)
 * - onChange: function (required)
 * - placeholder: string
 * - minRows: number (default 3)
 * - maxRows: number
 * - className: string
 * - style: object
 * - disabled: boolean
 */
const PlainTextEditor = ({
  value,
  onChange,
  placeholder = "Enter text...",
  minRows = 3,
  maxRows,
  className = "",
  style = {},
  disabled = false,
  ...props
}) => (
  <textarea
    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y ${className}`}
    style={style}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    rows={minRows}
    maxLength={maxRows}
    disabled={disabled}
    {...props}
  />
);

export default PlainTextEditor;
