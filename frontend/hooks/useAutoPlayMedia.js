import { useEffect, useRef, useState } from "react";
import { useMediaPlayerContext } from "../components/MediaPlayerContext";

/**
 * useAutoPlayMedia
 * - Handles Facebook-like auto-play/pause for media in a feed.
 * - Only one media (video/audio) plays at a time.
 * - Auto-plays when in view, pauses when out of view.
 * - Clicking play overrides auto-play.
 * 
 * @param {string} mediaId - Unique ID for this media instance.
 * @returns {object} { mediaRef, containerRef, handlePlay }
 */
export function useAutoPlayMedia(mediaId) {
  const mediaRef = useRef(null);
  const containerRef = useRef(null);
  const { currentlyPlayingId, setCurrentlyPlayingId } = useMediaPlayerContext() || {};
  const [isIntersecting, setIsIntersecting] = useState(false);
  const prevIntersectingRef = useRef(false);

  // IntersectionObserver for scroll-sensitive playback
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.75 }
    );
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  // Auto play/pause based on visibility and current video
  useEffect(() => {
    if (!mediaRef.current) return;

    // Only set as current when isIntersecting transitions from false to true
    if (
      isIntersecting &&
      !prevIntersectingRef.current &&
      currentlyPlayingId !== mediaId
    ) {
      setCurrentlyPlayingId && setCurrentlyPlayingId(mediaId);
    }
    prevIntersectingRef.current = isIntersecting;

    // Play if this is the current and in view, else pause
    if (currentlyPlayingId === mediaId && isIntersecting) {
      mediaRef.current.play && mediaRef.current.play().catch(() => {});
    } else {
      mediaRef.current.pause && mediaRef.current.pause();
    }
  }, [isIntersecting, currentlyPlayingId, mediaId, setCurrentlyPlayingId]);

  // Click-to-play handler
  const handlePlay = () => {
    setCurrentlyPlayingId && setCurrentlyPlayingId(mediaId);
  };

  return { mediaRef, containerRef, handlePlay };
}
