import React, { forwardRef, useEffect, useRef, useState } from "react";

/**
 * AudioPlayer with animated random bar spectrum visualization (fixed size, transparent container).
 * - Bars animate with new random heights at a regular interval while audio is playing.
 * - Visualization uses a fixed width and height (default 80px tall).
 * - Container background is transparent.
 */
const AudioPlayer = forwardRef(
  (
    {
      src,
      controls = true,
      autoPlay = false,
      loop = false,
      muted = false,
      className = "",
      style = {},
      barColor = "#4fc3f7",
      backgroundColor = "#06232e",
      height = 80,
      barCount = 48,
      onPlay,
      showNativeControls = true, // NEW: control native audio element rendering
    },
    ref
  ) => {
    const audioRef = ref || useRef();
    const canvasRef = useRef();
    const animationRef = useRef();
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [barHeights, setBarHeights] = useState(
      Array.from({ length: barCount }, () => Math.random() * height)
    );

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
      const audio = audioRef && audioRef.current ? audioRef.current : null;
      if (!audio) return;
      const onTimeUpdate = () => setCurrentTime(audio.currentTime);
      const onLoadedMetadata = () => setDuration(audio.duration || 0);
      const onPlayHandler = (e) => {
        setIsPlaying(true);
        if (onPlay) onPlay(e);
      };
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
    }, [audioRef, src, onPlay]);

    // Regenerate bar heights if height or barCount changes
    useEffect(() => {
      setBarHeights(
        Array.from({ length: barCount }, () => Math.random() * height)
      );
    }, [height, barCount]);

    // Seek on bar click
    const handleSeek = (e) => {
      if (!canvasRef.current || !audioRef.current || !duration) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      audioRef.current.currentTime = percent * duration;
    };

    if (!src) return null;
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
          gap: 8,
          padding: 0,
        }}
      >
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
        {showNativeControls && (
          <audio
            ref={audioRef}
            src={src}
            controls={controls}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            style={{
              width: "100%",
              margin: 0,
              padding: 0,
              borderRadius: 8,
              background: "#fff",
              boxSizing: "border-box",
              outline: "none",
              border: "none",
              minHeight: 40,
              maxHeight: 56,
              display: "block",
            }}
            {...(src && src.toLowerCase().endsWith(".webm") ? { type: "audio/webm" } : {})}
          >
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
    );
  }
);

export default AudioPlayer;
