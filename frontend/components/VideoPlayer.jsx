import React, { forwardRef } from "react";

const VideoPlayer = forwardRef(({
  src,
  poster,
  controls = true,
  autoPlay = false,
  loop = false,
  className = "",
  style = {},
  videoId,
  onClick
}, ref) => {
  if (!src) return null;
  return (
    <video
      ref={ref}
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
    >
      Your browser does not support the video tag.
    </video>
  );
});

export default VideoPlayer;
