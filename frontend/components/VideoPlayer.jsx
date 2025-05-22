import React, { useEffect, useRef, useState } from "react";
import { useVideoPlayerContext } from "./VideoPlayerContext";

const VideoPlayer = ({
  src,
  poster,
  controls = true,
  autoPlay = false,
  loop = false,
  className = "",
  style = {},
  videoId,
}) => {
  const videoRef = useRef(null);
  const observerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const { activeVideoId, register, unregister, requestPlay } = useVideoPlayerContext() || {};

  // Register/unregister video with context
  useEffect(() => {
    if (register && videoId) {
      register(videoId, videoRef);
      return () => unregister && unregister(videoId);
    }
  }, [register, unregister, videoId]);

  // Pause if not the active video
  useEffect(() => {
    if (!videoRef.current) return;
    if (activeVideoId && videoId !== activeVideoId) {
      videoRef.current.pause();
    }
  }, [activeVideoId, videoId]);

  // Intersection Observer for in-view detection and requestPlay
  useEffect(() => {
    if (!videoRef.current || !requestPlay || !videoId) return;
    observerRef.current = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            requestPlay(videoId);
          } else {
            setIsInView(false);
            if (videoRef.current) {
              videoRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.25 }
    );
    observerRef.current.observe(videoRef.current);
    return () => {
      if (observerRef.current && videoRef.current) {
        observerRef.current.unobserve(videoRef.current);
      }
    };
  }, [requestPlay, videoId]);

  // Play when in view and is the active video
  useEffect(() => {
    if (isInView && activeVideoId === videoId && videoRef.current) {
      videoRef.current.play().then(() => {
        console.log("Autoplayed video", videoId);
      }).catch((err) => {
        console.log("Autoplay error", videoId, err);
      });
    }
  }, [isInView, activeVideoId, videoId]);

  if (!src) return null;
  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      controls={controls}
      autoPlay={false}
      loop={loop}
      className={className}
      style={style}
      width="100%"
      playsInline
      muted={true}
      onClick={props => {
        if (typeof props.onClick === "function") props.onClick();
      }}
    >
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPlayer;
