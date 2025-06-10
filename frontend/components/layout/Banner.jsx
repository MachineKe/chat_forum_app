import React from "react";
import { resolveMediaUrl } from "../../utils/api";

/**
 * Banner component for displaying a user's banner image.
 * Props:
 * - src: image URL
 * - alt: alt text
 * - className: additional CSS classes
 * - style: additional inline styles
 */
const Banner = ({ src, alt = "Banner", className = "", style = {} }) => (
  <img
    src={resolveMediaUrl(src)}
    alt={alt}
    className={`object-cover rounded ${className}`}
    style={{
      width: "100%",
      height: 64,
      background: "#eee",
      display: "block",
      objectFit: "cover",
      ...style,
    }}
  />
);

export default Banner;
