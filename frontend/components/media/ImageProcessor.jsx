import React from "react";

/**
 * ImageProcessor - Responsive image component that covers its parent container.
 * Props:
 * - src: image URL or data URL
 * - alt: alt text
 * - className: additional classes
 * - style: additional styles
 * - aspectRatio: e.g. 16/9, 4/3, etc. (optional, for fixed aspect ratio)
 * - viewType: "card" | "detail" | "thumbnail" | ... (optional, for custom sizing)
 */
const aspectRatioMap = {
  card: 16 / 9,
  detail: 4 / 3,
  thumbnail: 1,
};

const ImageProcessor = ({
  src,
  alt = "",
  className = "",
  style = {},
  aspectRatio,
  viewType,
  ...props
}) => {
  // Remove barCount from being passed to DOM
  const { barCount, ...safeProps } = props;
  // Determine aspect ratio
  const ratio =
    aspectRatio ||
    (viewType && aspectRatioMap[viewType]) ||
    undefined;

  // If aspect ratio is set, use a wrapper to enforce it
  if (ratio) {
    return (
      <div
        className={`relative w-full h-0 overflow-hidden ${className}`}
        style={{
          paddingBottom: `${100 / ratio}%`,
          ...style,
        }}
        {...safeProps}
      >
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectFit: "cover" }}
        />
      </div>
    );
  }

  // Default: fill parent, cover area
  return (
    <img
      src={src}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      style={{ objectFit: "cover", ...style }}
      {...safeProps}
    />
  );
};

export default ImageProcessor;
