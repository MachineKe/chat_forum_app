import React, { useRef, useState, useEffect } from "react";
import { MdPlayArrow, MdPause, MdVolumeUp, MdVolumeOff } from "react-icons/md";

/**
 * Reusable custom audio controls component.
 * Props:
 * - src: audio file URL (required)
 * - onPlay, onPause, onEnded: event callbacks (optional)
 * - style, className: for container styling (optional)
 * - color: progress/knob color (optional)
 * - background: bar background color (optional)
 * - height: height of the control bar (default 48)
 */
const CustomAudioControls = ({
  src,
  onPlay,
  onPause,
  onEnded,
  autoplay = false,
  style = {},
  className = "",
  color = "#222",
  background = "#f3f4f6",
  height = 48,
  ...rest
}) => {
  const audioRef = useRef();
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => {
      // Debug: check if timeupdate is firing
      // eslint-disable-next-line no-console
      setCurrent(audio.currentTime);
      // Fallback: set duration if not set
      if (
        (duration === 0 || !isFinite(duration) || duration === Infinity) &&
        audio.duration &&
        isFinite(audio.duration) &&
        audio.duration !== Infinity
      ) {
        setDuration(audio.duration);
      }
    };
    const setValidDuration = () => {
      if (
        audio.duration &&
        isFinite(audio.duration) &&
        audio.duration !== Infinity &&
        audio.duration > 0
      ) {
        setDuration(audio.duration);
      }
    };
    const handleLoaded = setValidDuration;
    const handlePlay = () => { setPlaying(true); if (onPlay) onPlay(); };
    const handlePause = () => { setPlaying(false); if (onPause) onPause(); };
    const handleEnded = () => { setPlaying(false); if (onEnded) onEnded(); };
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("durationchange", setValidDuration);

    // Autoplay support
    if (autoplay) {
      // Some browsers require muted for autoplay to work
      audio.autoplay = true;
      if (audio.muted !== true) audio.muted = false;
      // Try to play after loadedmetadata
      const tryPlay = () => {
        audio.play().catch(() => {});
      };
      audio.addEventListener("loadedmetadata", tryPlay);
      // If already loaded, try to play immediately
      if (audio.readyState >= 1) {
        audio.play().catch(() => {});
      }
      return () => {
        audio.removeEventListener("loadedmetadata", tryPlay);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("loadedmetadata", handleLoaded);
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("durationchange", setValidDuration);
      };
    }

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [src, onPlay, onPause, onEnded, autoplay]);

  // Play/pause toggle
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else audio.play();
  };

  // Mute/unmute toggle
  const toggleMute = () => {
    setMuted((m) => {
      if (audioRef.current) audioRef.current.muted = !m;
      return !m;
    });
  };

  // Seek bar interaction
  const handleSeek = (e) => {
    const bar = e.target;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percent * duration;
    setSeeking(true);
    if (audioRef.current) audioRef.current.currentTime = newTime;
    setTimeout(() => setSeeking(false), 100);
  };

  // Volume slider
  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
      if (v === 0) {
        setMuted(true);
        audioRef.current.muted = true;
      } else {
        setMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  // Format time (mm:ss)
  const format = (s) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${m}:${ss < 10 ? "0" : ""}${ss}`;
  };

  // Debug: log duration and current
  // eslint-disable-next-line no-console

  return (
    <div
      className={className}
      style={{
        ...style,
        width: "100%",
        background,
        display: "flex",
        alignItems: "center",
        borderRadius: 0,
        minHeight: height,
        maxHeight: height,
        padding: "0 12px",
        boxSizing: "border-box",
        gap: 12,
        userSelect: "none",
      }}
      {...rest}
    >
      <audio
        ref={audioRef}
        src={src}
        style={{
          width: 0,
          height: 0,
          position: "absolute",
          opacity: 0,
          pointerEvents: "none"
        }}
        autoPlay={autoplay}
      />
      <button
        onClick={togglePlay}
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
        aria-label={playing ? "Pause" : "Play"}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            togglePlay();
          }
        }}
      >
        {playing ? (
          <MdPause size={24} color="#222" />
        ) : (
          <MdPlayArrow size={24} color="#222" />
        )}
      </button>
      {duration && isFinite(duration) && duration !== Infinity ? (
        <>
          <span style={{ fontSize: 14, minWidth: 48, color: "#222" }}>
            {format(current)} / {format(duration)}
          </span>
          <div
            style={{
              flex: 1,
              height: 6,
              background: "#d1d5db",
              borderRadius: 3,
              position: "relative",
              cursor: "pointer",
              margin: "0 8px",
            }}
            onClick={handleSeek}
            tabIndex={0}
            aria-label="Seek"
            onKeyDown={e => {
              if (e.key === "ArrowLeft" && audioRef.current) {
                audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
              }
              if (e.key === "ArrowRight" && audioRef.current) {
                audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 5);
              }
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: 6,
                width: duration ? `${(current / duration) * 100}%` : "0%",
                background: "#222",
                borderRadius: 3,
                transition: seeking ? "none" : "width 0.1s linear",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: duration ? `calc(${(current / duration) * 100}% - 7px)` : "-7px",
                top: -4,
                width: 14,
                height: 14,
                background: "#222",
                borderRadius: "50%",
                boxShadow: "0 0 2px #888",
                pointerEvents: "none",
                display: duration ? "block" : "none",
              }}
            />
          </div>
        </>
      ) : (
        <span style={{ fontSize: 14, minWidth: 48, color: "#222" }}>
          {format(current)} / Live
        </span>
      )}
      <button
        onClick={toggleMute}
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
        aria-label={muted ? "Unmute" : "Mute"}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            toggleMute();
          }
        }}
      >
        {muted || volume === 0 ? (
          <MdVolumeOff size={22} color="#222" />
        ) : (
          <MdVolumeUp size={22} color="#222" />
        )}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={muted ? 0 : volume}
        onChange={handleVolume}
        style={{
          width: 60,
          accentColor: "#222",
          margin: "0 8px",
        }}
        aria-label="Volume"
      />
    </div>
  );
};

export default CustomAudioControls;
