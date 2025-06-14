import React, { forwardRef, useRef, useState, useEffect } from "react";
import LoadingSpinner from "../common/LoadingSpinner";

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
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = ref || useRef();

  if (!src) return null;
  return (
    <div
      className={className}
      style={{ ...style, position: "relative", width: "100%" }}
    >
      {isLoading && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 10,
          background: "rgba(255,255,255,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <LoadingSpinner label="Loading video..." />
        </div>
      )}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls={controls}
        autoPlay={autoPlay}
        loop={loop}
        style={{ width: "100%", height: "auto", borderRadius: 8 }}
        width="100%"
        playsInline
        muted={true}
        onClick={onClick}
        onLoadedData={e => {
          setIsLoading(false);
          if (onLoadedData) onLoadedData(e);
        }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
});

export default VideoPlayer;
