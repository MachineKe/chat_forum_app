import React, { useState, useRef } from "react";
import LoadingSpinner from "@components/common/LoadingSpinner";
import VideoPlayer from "./VideoPlayer";
import AudioPlayer from "./AudioPlayer";
import VideoViewer from "./VideoViewer";
import ImageViewer from "./ImageViewer";
import DocumentViewer from "./DocumentViewer";
import DocumentCarousel from "./DocumentCarousel";
import { useAutoPlayMedia } from "../../hooks/useAutoPlayMedia";
import ImageProcessor from "./ImageProcessor";
import { resolveMediaUrl } from "../../utils/api";

let mediaPlayerIdCounter = 0;
function getUniqueMediaPlayerId() {
  return `media-player-${mediaPlayerIdCounter++}`;
}

function getMediaType(src, type) {
  // Force audio if path is in /uploads/audio/
  if (src && typeof src === "string" && src.startsWith(`${import.meta.env.VITE_BACKEND_URL}/uploads/audio/`)) {
    return "audio";
  }
  // Force video if path is in /uploads/videos/
  if (src && typeof src === "string" && src.startsWith(`${import.meta.env.VITE_BACKEND_URL}/uploads/videos/`)) {
    return "video";
  }
  // Special case: .webm can be video or audio, use type to decide
  if (src && typeof src === "string" && src.toLowerCase().endsWith(".webm")) {
    if (type && typeof type === "string") {
      const t = type.toLowerCase();
      if (t === "audio" || t.startsWith("audio/")) return "audio";
      // If type is not audio, always treat as video
      return "video";
    }
    // fallback: treat as video if no type
    return "video";
  }
  // Use the provided type prop as the single source of truth if present
  if (type && typeof type === "string") {
    const t = type.toLowerCase();
    // Map common MIME types to base types
    if (t === "video" || t.startsWith("video/")) return "video";
    if (t === "audio" || t.startsWith("audio/")) return "audio";
    if (t === "image" || t.startsWith("image/")) return "image";
    if (t === "pdf" || t === "document" || t === "application/pdf") return "document";
    // If type is not recognized, treat as unknown
    return "unknown";
  }
  // fallback for legacy/unknown types
  if (!src) return "unknown";
  const ext = src.split(".").pop().toLowerCase();
  if (["mp4", "mov"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "aac", "flac", "m4a"].includes(ext)) return "audio";
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) return "image";
  if (["pdf"].includes(ext)) return "document";
  return "unknown";
}

const MediaPlayer = ({
  src,
  type,
  poster,
  alt = "",
  controls = true,
  autoPlay = false,
  loop = false,
  className = "",
  style = {},
  title,
  media, // NEW: allow passing a media object directly
  thumbnail, // NEW: thumbnail for audio/video
  onMediaLoaded, // NEW: callback when media is loaded
  ...rest
}) => {
  // Always use the latest title prop (do not store in state)
  const mediaTitle =
    typeof title !== "undefined"
      ? title
      : media && media.title
      ? media.title
      : undefined;

  // Prefer explicit thumbnail prop, else from media object
  const mediaThumbnail =
    typeof thumbnail !== "undefined"
      ? resolveMediaUrl(thumbnail)
      : media && media.thumbnail
      ? resolveMediaUrl(media.thumbnail)
      : undefined;

  // Debug: log thumbnail prop and resolved mediaThumbnail
  if (typeof window !== "undefined") {
  }

  const mediaType = getMediaType(src, type);
  const [viewerOpen, setViewerOpen] = useState(false);
  const idRef = useRef(getUniqueMediaPlayerId());
  const { mediaRef, containerRef, handlePlay } = useAutoPlayMedia(idRef.current);

  if (!src) return null;

  // Use mediaTitle in a custom title pane and above the media
  const TitlePane = () =>
    mediaTitle ? (
      <div
        className="w-full flex items-center px-4 py-2 bg-gray-800"
        style={{
          color: "#fff",
          fontSize: "1rem",
          fontWeight: 400,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          minHeight: 36,
          marginBottom: 0,
          paddingBottom: 0,
          lineHeight: 1.2,
        }}
        data-testid="media-title-pane"
      >
        <span style={{ fontWeight: 400 }}>{mediaTitle}</span>
      </div>
    ) : null;

  // Compose style with sharp top corners if mediaTitle is present
  const mergedStyle = mediaTitle
    ? { ...style, borderTopLeftRadius: 0, borderTopRightRadius: 0 }
    : style;

  return (
    <div>
      <TitlePane />
      {mediaType === "video" && (
        (() => {
          const [isLoading, setIsLoading] = useState(true);
          const [hasError, setHasError] = useState(false);
          return (
            <>
              <div
                ref={containerRef}
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  background: "#000",
                  borderRadius: 8,
                  overflow: "hidden",
                  position: "relative",
                  ...(mediaTitle ? { borderTopLeftRadius: 0, borderTopRightRadius: 0 } : {})
                }}
              >
                {isLoading && !hasError && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2,
                      background: "rgba(0,0,0,0)",
                    }}
                  >
                    <LoadingSpinner label="Loading video..." />
                  </div>
                )}
                {hasError && (
                  <div className="text-red-500 text-sm">Failed to load video</div>
                )}
                <VideoPlayer
                  ref={mediaRef}
                  src={src}
                  poster={mediaThumbnail || poster}
                  controls={controls}
                  autoPlay={typeof rest.autoPlay !== "undefined" ? rest.autoPlay : autoPlay}
                  loop={loop}
                  muted={typeof rest.muted !== "undefined" ? rest.muted : false}
                  className={className}
                  style={{
                    ...mergedStyle,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    display: isLoading ? "none" : undefined,
                  }}
                  videoId={idRef.current}
                  onClick={() => setViewerOpen(true)}
                  onPlay={handlePlay}
                  onLoadedData={e => {
                    setIsLoading(false);
                    setHasError(false);
                    if (onMediaLoaded) onMediaLoaded(e);
                  }}
                  onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                  }}
                  {...rest}
                />
              </div>
              <VideoViewer src={src} open={viewerOpen} onClose={() => setViewerOpen(false)} poster={mediaThumbnail || poster} />
            </>
          );
        })()
      )}
      {mediaType === "audio" && (
        (() => {
          const [isLoading, setIsLoading] = useState(true);
          const [hasError, setHasError] = useState(false);
          return (
            <div
              ref={containerRef}
              style={{
                width: "100%",
                marginTop: 0,
                paddingTop: 0,
                borderTop: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                justifyContent: "flex-start",
                gap: 0,
                background: "transparent",
                minHeight: "unset",
                height: "auto",
              }}
            >
              {isLoading && !hasError && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                    background: "rgba(0,0,0,0)",
                  }}
                >
                  <LoadingSpinner label="Loading audio..." />
                </div>
              )}
              {hasError && (
                <div className="text-red-500 text-sm">Failed to load audio</div>
              )}
              <AudioPlayer
                ref={mediaRef}
                src={src}
                controls={controls}
                autoPlay={false}
                loop={loop}
                muted={false}
                className={className}
                style={{
                  ...mergedStyle,
                  width: "100%",
                  marginTop: 0,
                  paddingTop: 0,
                  borderTop: "none",
                  borderRadius: 8,
                  borderTopLeftRadius: mediaTitle ? 0 : 8,
                  borderTopRightRadius: mediaTitle ? 0 : 8,
                  minHeight: 0,
                  height: "auto",
                  display: isLoading ? "none" : undefined,
                }}
                onPlay={handlePlay}
                thumbnail={mediaThumbnail}
                title={mediaTitle}
                onLoadedData={e => {
                  setIsLoading(false);
                  setHasError(false);
                  if (onMediaLoaded) onMediaLoaded(e);
                }}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
                {...rest}
              />
            </div>
          );
        })()
      )}
      {mediaType === "image" && (
        (() => {
          const [isLoading, setIsLoading] = useState(true);
          const [hasError, setHasError] = useState(false);
          return (
            <>
              <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
                {isLoading && !hasError && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2,
                      background: "rgba(0,0,0,0)",
                    }}
                  >
                    <LoadingSpinner label="Loading image..." />
                  </div>
                )}
                {hasError && (
                  <div className="text-red-500 text-sm">Failed to load image</div>
                )}
                <ImageProcessor
                  src={src}
                  alt={alt}
                  className={className}
                  style={{
                    ...mergedStyle,
                    cursor: "pointer",
                    borderRadius: 8,
                    borderTopLeftRadius: mediaTitle ? 0 : 8,
                    borderTopRightRadius: mediaTitle ? 0 : 8,
                    marginTop: 0,
                    paddingTop: 0,
                    display: isLoading ? "none" : undefined,
                  }}
                  onClick={() => setViewerOpen(true)}
                  onLoad={e => {
                    setIsLoading(false);
                    setHasError(false);
                    if (onMediaLoaded) onMediaLoaded(e);
                  }}
                  onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                  }}
                  {...rest}
                />
              </div>
              <ImageViewer
                src={src}
                alt={alt}
                open={viewerOpen}
                onClose={() => setViewerOpen(false)}
                style={{
                  borderRadius: 8,
                  borderTopLeftRadius: mediaTitle ? 0 : 8,
                  borderTopRightRadius: mediaTitle ? 0 : 8,
                }}
              />
            </>
          );
        })()
      )}
      {mediaType === "document" && (
        (() => {
          const [isLoading, setIsLoading] = useState(true);
          const [hasError, setHasError] = useState(false);
          return (
            <div style={{ position: "relative", width: "100%" }}>
              {isLoading && !hasError && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                    background: "rgba(0,0,0,0)",
                  }}
                >
                  <LoadingSpinner label="Loading PDF..." />
                </div>
              )}
              {hasError && (
                <div className="text-red-500 text-sm">Failed to load PDF</div>
              )}
              <DocumentCarousel
                src={src}
                type="application/pdf"
                className={className}
                style={{
                  ...mergedStyle,
                  display: isLoading ? "none" : undefined,
                }}
                onLoad={() => {
                  setIsLoading(false);
                  setHasError(false);
                }}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
                {...rest}
              />
            </div>
          );
        })()
      )}
      {mediaType === "unknown" && <span>Unsupported media type</span>}
    </div>
  );
};

export default MediaPlayer;
