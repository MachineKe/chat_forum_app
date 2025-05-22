import React, { createContext, useContext, useState, useRef } from "react";

const VideoPlayerContext = createContext();

export function VideoPlayerProvider({ children }) {
  const [activeVideoId, setActiveVideoId] = useState(null);
  // Store refs to all video elements
  const videoRefs = useRef({});

  // Register a video element by id
  const register = (id, ref) => {
    videoRefs.current[id] = ref;
  };

  // Unregister a video element by id
  const unregister = (id) => {
    delete videoRefs.current[id];
  };

  // Request to play a video by id
  const requestPlay = (id) => {
    // Pause all other videos
    Object.entries(videoRefs.current).forEach(([vid, ref]) => {
      if (vid !== id && ref && ref.current) {
        ref.current.pause();
      }
    });
    setActiveVideoId(id);
  };

  return (
    <VideoPlayerContext.Provider value={{ activeVideoId, register, unregister, requestPlay }}>
      {children}
    </VideoPlayerContext.Provider>
  );
}

export function useVideoPlayerContext() {
  return useContext(VideoPlayerContext);
}
