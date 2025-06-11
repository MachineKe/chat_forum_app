import React, { useRef, useEffect, useState, forwardRef } from "react";
import { MdPlayArrow, MdPause, MdVolumeUp, MdVolumeOff } from "react-icons/md";

/**
 * AudioPlayer with animated random bar spectrum visualization (fixed size, transparent container).
 * - Bars animate with new random heights at a regular interval while audio is playing.
 * - Visualization uses a fixed width and height (default 80px tall).
 * - Container background is transparent.
 */
const AudioPlayer = forwardRef(({
  src,
  autoPlay = false,
  loop = false,
  muted = false,
  className = "",
  style = {},
  barColor = "#4fc3f7",
  backgroundColor = "#06232e",
  height = 80,
  barCount = 48,
  thumbnail,
  title,
  onLoadedData,
  ...restProps
}, ref) => {
  const localAudioRef = useRef();
  const audioRef = ref || localAudioRef;
  const canvasRef = useRef();
  const animationRef = useRef();
  const seekBarRef = useRef();
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [barHeights, setBarHeights] = useState(
    Array.from({ length: barCount }, () => Math.random() * height)
  );
  const [dragging, setDragging] = useState(false);

  // Animate bar heights while playing
  useEffect(() => {
    if (!isPlaying) return;
    let running = true;
    function animate() {
      if (!running) return;
      setBarHeights(
        Array.from({ length: barCount }, () => Math.random() * height)
      );
      animationRef.current = setTimeout(animate, 80); // ~12.5 FPS
    }
    animate();
    return () => {
      running = false;
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isPlaying, barCount, height]);

  // Draw the animated bar spectrum and handle responsive resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    function draw() {
      const width = parent ? parent.offsetWidth : 500;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;
      const barWidth = w / barCount;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < barCount; i++) {
        ctx.fillStyle = barColor;
        ctx.fillRect(i * barWidth + 2, h - barHeights[i], barWidth - 4, barHeights[i]);
      }
    }
    draw();

    // Responsive: redraw on resize
    let resizeObserver;
    if (parent && window.ResizeObserver) {
      resizeObserver = new window.ResizeObserver(draw);
      resizeObserver.observe(parent);
    } else {
      // fallback: redraw on window resize
      window.addEventListener("resize", draw);
    }
    return () => {
      if (resizeObserver && parent) resizeObserver.unobserve(parent);
      else window.removeEventListener("resize", draw);
    };
  }, [barHeights, barCount, backgroundColor, barColor, height]);

  // Sync currentTime, duration, and play state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);

    // Workaround for webm duration bug: seek to end if duration is 0 or Infinity
    const onLoadedMetadata = () => {
      let d = audio.duration || 0;
      if (!isFinite(d) || d === 0) {
        // Try to force duration calculation
        const fixDuration = () => {
          if (isFinite(audio.duration) && audio.duration > 0) {
            setDuration(audio.duration);
            audio.currentTime = 0;
            audio.removeEventListener("timeupdate", fixDuration);
          }
        };
        audio.addEventListener("timeupdate", fixDuration);
        audio.currentTime = 1e10;
      } else {
        setDuration(d);
      }
    };

    const onPlayHandler = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlayHandler);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlayHandler);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onPause);
    };
  }, [src]);

  // Autoplay logic for native audio
  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.muted = isMuted;
      const playPromise = audioRef.current.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.catch(() => {});
      }
    }
  }, [autoPlay, isMuted, src]);

  // Regenerate bar heights if height or barCount changes
  useEffect(() => {
    setBarHeights(
      Array.from({ length: barCount }, () => Math.random() * height)
    );
  }, [height, barCount]);

  // Seek on visualization canvas click
  const handleSeek = (e) => {
    if (!canvasRef.current || !audioRef.current || !duration) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  // Seek on seek bar click or drag
  const getSeekPercent = (clientX) => {
    if (!seekBarRef.current) return 0;
    const rect = seekBarRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    return Math.max(0, Math.min(1, x / rect.width));
  };

  const handleSeekBarClick = (e) => {
    if (!seekBarRef.current || !audioRef.current || !duration) return;
    e.stopPropagation();
    const percent = getSeekPercent(e.clientX);
    audioRef.current.currentTime = percent * duration;
  };

  const handleSeekBarMouseDown = (e) => {
    if (!seekBarRef.current || !audioRef.current || !duration) return;
    e.stopPropagation();
    setDragging(true);
    const percent = getSeekPercent(e.clientX);
    audioRef.current.currentTime = percent * duration;
    window.addEventListener("mousemove", handleSeekBarMouseMove);
    window.addEventListener("mouseup", handleSeekBarMouseUp);
  };

  const handleSeekBarMouseMove = (e) => {
    if (!seekBarRef.current || !audioRef.current || !duration) return;
    const percent = getSeekPercent(e.clientX);
    audioRef.current.currentTime = percent * duration;
  };

  const handleSeekBarMouseUp = (e) => {
    setDragging(false);
    window.removeEventListener("mousemove", handleSeekBarMouseMove);
    window.removeEventListener("mouseup", handleSeekBarMouseUp);
  };

  // Touch events for mobile
  const handleSeekBarTouchStart = (e) => {
    if (!seekBarRef.current || !audioRef.current || !duration) return;
    setDragging(true);
    const touch = e.touches[0];
    const percent = getSeekPercent(touch.clientX);
    audioRef.current.currentTime = percent * duration;
    window.addEventListener("touchmove", handleSeekBarTouchMove);
    window.addEventListener("touchend", handleSeekBarTouchEnd);
    window.addEventListener("touchcancel", handleSeekBarTouchEnd);
  };

  const handleSeekBarTouchMove = (e) => {
    if (!seekBarRef.current || !audioRef.current || !duration) return;
    const touch = e.touches[0];
    const percent = getSeekPercent(touch.clientX);
    audioRef.current.currentTime = percent * duration;
  };

  const handleSeekBarTouchEnd = (e) => {
    setDragging(false);
    window.removeEventListener("touchmove", handleSeekBarTouchMove);
    window.removeEventListener("touchend", handleSeekBarTouchEnd);
    window.removeEventListener("touchcancel", handleSeekBarTouchEnd);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  function formatTime(s) {
    if (!isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${m}:${ss < 10 ? "0" : ""}${ss}`;
  }

  if (!src) return null;
  const hasThumbnail = !!(thumbnail && typeof thumbnail === "string" && thumbnail.trim() !== "");

  // Prevent barCount from being passed to <audio>
  const { barCount: _barCount, ...audioProps } = restProps;

  return (
    <div
      className={className}
      style={{
        ...style,
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        gap: 0,
        padding: 0,
      }}
      {...restProps}
    >
      {hasThumbnail ? (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#222",
            borderRadius: style.borderRadius !== undefined ? style.borderRadius : 8,
            borderTopLeftRadius: style.borderTopLeftRadius !== undefined ? style.borderTopLeftRadius : 8,
            borderTopRightRadius: style.borderTopRightRadius !== undefined ? style.borderTopRightRadius : 8,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            minHeight: 120,
            padding: 16,
            marginBottom: 0,
            paddingBottom: 0,
          }}
        >
          <img
            src={thumbnail}
            alt={title || "Audio thumbnail"}
            style={{
              maxWidth: "100%",
              maxHeight: 180,
              borderRadius: 8,
              objectFit: "cover",
              marginBottom: 0,
            }}
          />
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            cursor: duration ? "pointer" : "default",
            marginBottom: 0,
            paddingBottom: 0,
          }}
        >
          <canvas
            ref={canvasRef}
            // width and height set dynamically in useEffect for responsiveness
            style={{
              width: "100%",
              height,
              display: "block",
              background: backgroundColor,
              borderRadius: style.borderRadius !== undefined ? style.borderRadius : 8,
              borderTopLeftRadius: style.borderTopLeftRadius !== undefined ? style.borderTopLeftRadius : 8,
              borderTopRightRadius: style.borderTopRightRadius !== undefined ? style.borderTopRightRadius : 8,
            }}
            onClick={handleSeek}
          />
        </div>
      )}
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          background: "#fff",
          borderRadius: 0,
          margin: 0,
          padding: "0 8px",
          minHeight: 48,
          maxHeight: 56,
          boxSizing: "border-box",
          gap: 8,
        }}
      >
        <audio
          ref={audioRef}
          src={src}
          autoPlay={autoPlay}
          loop={loop}
          muted={isMuted}
          style={{ display: "none" }}
          onLoadedData={onLoadedData}
          {...audioProps}
        />
        <button
          onClick={e => { e.stopPropagation(); togglePlay(); }}
          style={{
            border: "none",
            background: "none",
            padding: 0,
            margin: 0,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            outline: "none",
            color: "#222",
          }}
          aria-label={isPlaying ? "Pause" : "Play"}
          tabIndex={0}
        >
          {isPlaying ? (
            <MdPause size={28} color="#222" />
          ) : (
            <MdPlayArrow size={28} color="#222" />
          )}
        </button>
        <span style={{ fontSize: 14, minWidth: 56, color: "#222", fontVariantNumeric: "tabular-nums" }}>
          {formatTime(currentTime)}
        </span>
        <div
          ref={seekBarRef}
          style={{
            flex: 1,
            height: 24, // Increased hit area for easier interaction
            background: "transparent",
            position: "relative",
            cursor: "pointer",
            margin: "0 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            touchAction: "none"
          }}
          onClick={handleSeekBarClick}
          onMouseDown={handleSeekBarMouseDown}
          onTouchStart={handleSeekBarTouchStart}
          tabIndex={0}
          aria-label="Seek"
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              height: 6,
              width: "100%",
              background: "#d1d5db",
              borderRadius: 3,
              pointerEvents: "none"
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              height: 6,
              width: duration ? `${(currentTime / duration) * 100}%` : "0%",
              background: "#222",
              borderRadius: 3,
              transition: "width 0.1s linear",
              pointerEvents: "none"
            }}
          />
        </div>
        <span style={{ fontSize: 14, minWidth: 56, color: "#222", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
          {formatTime(duration)}
        </span>
        <button
          onClick={e => { e.stopPropagation(); toggleMute(); }}
          style={{
            border: "none",
            background: "none",
            padding: 0,
            margin: 0,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            outline: "none",
            color: "#222",
          }}
          aria-label={isMuted ? "Unmute" : "Mute"}
          tabIndex={0}
        >
          {isMuted ? (
            <MdVolumeOff size={22} color="#222" />
          ) : (
            <MdVolumeUp size={22} color="#222" />
          )}
        </button>
      </div>
    </div>
  );
});

export default AudioPlayer;
