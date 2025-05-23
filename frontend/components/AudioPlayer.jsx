import React, { forwardRef } from "react";

const AudioPlayer = forwardRef(({ src, controls = true, autoPlay = false, loop = false, className = "", style = {} }, ref) => {
  if (!src) return null;
  return (
    <audio
      ref={ref}
      src={src}
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      className={className}
      style={style}
    >
      Your browser does not support the audio element.
    </audio>
  );
});

export default AudioPlayer;
