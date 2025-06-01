import { useEffect, useRef, useState } from "react";
import { useMediaPlayerContext } from "../components/media/MediaPlayerContext";

let mediaPlayerIdCounter = 0;
function getUniqueMediaPlayerId() {
  return `media-player-${mediaPlayerIdCounter++}`;
}

export function useMediaPlayerStatus(mediaType) {
  const idRef = useRef(getUniqueMediaPlayerId());
  const mediaRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const { currentlyPlayingId, register, unregister, requestPlay } = useMediaPlayerContext() || {};

  // Register/unregister
  useEffect(() => {
    if (register && idRef.current && mediaRef.current) {
      register(idRef.current, mediaRef);
    }
    return () => {
      if (unregister && idRef.current) {
        unregister(idRef.current);
      }
    };
  }, [register, unregister]);

  // IntersectionObserver
  useEffect(() => {
    let target = mediaType === "video" ? wrapperRef.current : mediaRef.current;
    if (!target) return;
    let observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (requestPlay && idRef.current && currentlyPlayingId !== idRef.current) {
              requestPlay(idRef.current);
            }
          } else {
            setIsInView(false);
            if (mediaRef.current) {
              mediaRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.01 }
    );
    observer.observe(target);
    return () => {
      if (observer && target) {
        observer.unobserve(target);
      }
    };
  }, [mediaType, requestPlay]);

  // Play/pause logic
  useEffect(() => {
    if (!(mediaType === "video" || mediaType === "audio")) return;
    const el = mediaRef.current;
    if (!el) return;
    if (isInView && currentlyPlayingId === idRef.current) {
      const playMedia = () => {
        el.play().catch(() => {});
      };
      if (el.readyState >= 3) {
        playMedia();
      } else {
        const onCanPlay = () => {
          playMedia();
          el.removeEventListener("canplay", onCanPlay);
        };
        el.addEventListener("canplay", onCanPlay);
        return () => el.removeEventListener("canplay", onCanPlay);
      }
    } else {
      el.pause();
    }
  }, [isInView, currentlyPlayingId, mediaType]);

  return {
    id: idRef.current,
    mediaRef,
    wrapperRef,
    isInView,
    isPlaying: isInView && currentlyPlayingId === idRef.current,
  };
}
