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
  withFrame = false,
  frameClassName = "bg-white/80 border border-gray-200 rounded-xl shadow-sm p-2",
  ...props
}) => {
  // Remove barCount from being passed to DOM
  const { barCount, ...safeProps } = props;
  // Determine aspect ratio
  const ratio =
    aspectRatio ||
    (viewType && aspectRatioMap[viewType]) ||
    undefined;

  // Frame wrapper
  const wrapWithFrame = (element) =>
    withFrame ? (
      <div className={frameClassName} style={{ display: "inline-block" }}>
        {element}
      </div>
    ) : (
      element
    );

  // If aspect ratio is set, use a wrapper to enforce it
  if (ratio) {
    return wrapWithFrame(
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
          onLoad={props.onLoad}
        />
      </div>
    );
  }

  // Default: fill parent, cover area
  return wrapWithFrame(
    <img
      src={src}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      style={{ objectFit: "cover", ...style }}
      onLoad={props.onLoad}
      {...safeProps}
    />
  );
};

export default ImageProcessor;
