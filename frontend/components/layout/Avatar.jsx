import React from "react";
import { useNavigate } from "react-router-dom";
import { resolveMediaUrl } from "../../utils/api";

/**
 * Avatar component for displaying user profile images.
 * Props:
 * - src: image URL
 * - alt: alt text
 * - size: number (default 40) - size in px
 * - className: additional classes
 */
const Avatar = ({ src, alt, size = 40, className = "", profileUrl, onAvatarClick }) => {
  const navigate = useNavigate();
  return (
    <img
      src={resolveMediaUrl(src)}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover border border-gray-300${profileUrl || onAvatarClick ? " cursor-pointer" : ""} ${className}`}
      style={{ width: size, height: size, pointerEvents: "auto", zIndex: 1000 }}
      loading="lazy"
      onClick={e => {
        if (profileUrl) {
          e.preventDefault();
          e.stopPropagation();
          navigate(profileUrl);
        } else if (onAvatarClick) {
          onAvatarClick(e);
        }
      }}
      tabIndex={profileUrl || onAvatarClick ? 0 : undefined}
      role={profileUrl || onAvatarClick ? "button" : undefined}
      aria-label={profileUrl || onAvatarClick ? "View user profile" : undefined}
    />
  );
};

// Static utility for redirecting to a user's public profile
Avatar.redirectToProfile = function (username) {
  // Deprecated: use profileUrl prop for client-side navigation
};

export default Avatar;
