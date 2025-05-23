import React, { createContext, useContext, useState } from "react";

const MediaPlayerContext = createContext();

export function MediaPlayerProvider({ children }) {
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);

  return (
    <MediaPlayerContext.Provider value={{ currentlyPlayingId, setCurrentlyPlayingId }}>
      {children}
    </MediaPlayerContext.Provider>
  );
}

export function useMediaPlayerContext() {
  return useContext(MediaPlayerContext);
}
