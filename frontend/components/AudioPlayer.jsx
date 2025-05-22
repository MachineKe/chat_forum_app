import React from "react";

const AudioPlayer = ({ src, controls = true, autoPlay = false, loop = false, className = "", style = {} }) => {
  if (!src) return null;
  return (
    <audio
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
};

export default AudioPlayer;
