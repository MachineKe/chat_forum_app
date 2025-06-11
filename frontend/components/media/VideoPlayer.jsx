import React, { forwardRef, useRef, useState, useEffect } from "react";

const VideoPlayer = forwardRef(({
  src,
  poster,
  controls = true,
  autoPlay = false,
  loop = false,
  className = "",
  style = {},
  videoId,
  onClick,
  onLoadedData
}, ref) => {
  const videoRef = ref || useRef();

  if (!src) return null;
  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      className={className}
      style={style}
      width="100%"
      playsInline
      muted={true}
      onClick={onClick}
      onLoadedData={onLoadedData}
    >
      Your browser does not support the video tag.
    </video>
  );
});

export default VideoPlayer;
