import React from "react";

function LikeButton({
  liked = false,
  likeCount,
  onLike,
  loading = false,
  className = "",
  style = {},
  children,
  variant = "link", // "link" (default) or "button"
  ...props
}) {
  const baseLink =
    "text-blue-600 font-medium hover:underline px-1 bg-transparent border-none cursor-pointer transition";
  const baseButton =
    "flex flex-col items-center py-2 rounded cursor-pointer transition bg-transparent border-none";
  return (
    <button
      className={
        (variant === "button" ? baseButton : baseLink) +
        (className ? " " + className : "")
      }
      style={style}
      tabIndex={0}
      disabled={loading}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        if (onLike && !loading) onLike(e);
      }}
      {...props}
    >
      {children ? (
        children
      ) : liked ? (
        <span style={{ color: "#2563eb", fontWeight: 600 }}>Liked</span>
      ) : (
        <span>Like</span>
      )}
      {variant === "link" && typeof likeCount === "number" && (
        <span style={{ marginLeft: 4, color: "#6b7280", fontWeight: 400 }}>
          {likeCount}
        </span>
      )}
    </button>
  );
}

export default LikeButton;
