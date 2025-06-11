import React from "react";
import Avatar from "@components/layout/Avatar";
import MediaPlayer from "@components/media/MediaPlayer";
import { resolveMediaUrl } from "@utils/api";

/**
 * ChatBubble - Message bubble with sender, time, and proper styling.
 * @param {string} message - Message text (HTML).
 * @param {boolean} isOwn - If the message is from the current user.
 * @param {string} sender - Sender's name.
 * @param {string} time - Time string.
 * @param {string} avatar - Sender's avatar URL (for non-own messages).
 * @param {string} media_src - Media file URL (optional).
 * @param {string} media_type - Media type: "image", "audio", "video", "pdf" (optional).
 * @param {string} media_title - Media title (optional).
 * @param {string} thumbnail - Thumbnail image URL (optional).
 */
const ChatBubble = ({
  message,
  isOwn,
  sender,
  time,
  avatar,
  media_src,
  media_type,
  media_title,
  thumbnail,
}) => (
  <div className={`flex items-start ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
    {!isOwn && avatar && (
      <div className="flex-shrink-0 mr-3 mt-1">
        <Avatar src={avatar} alt={sender} size={40} />
      </div>
    )}
    <div className="flex flex-col items-start max-w-md">
      {/* Media preview above the message card */}
      {media_src && media_type && (
        <div className="mb-2 w-full">
          <MediaPlayer
            src={resolveMediaUrl(media_src)}
            type={media_type}
            title={media_title}
            thumbnail={thumbnail}
            className="rounded-xl"
            style={{ maxWidth: 320 }}
            mini
          />
        </div>
      )}
      <div
        className={`px-5 py-3 rounded-2xl text-base shadow-sm ${
          isOwn
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-gray-100 text-gray-900 rounded-bl-md"
        }`}
        style={{ borderRadius: isOwn ? "18px 18px 6px 18px" : "18px 18px 18px 6px" }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: (typeof message === "string"
              ? message.replace(/<(audio|video|img|embed)[^>]*>.*?<\/\1>|<(audio|video|img|embed)[^>]*\/?>/gis, "")
              : message),
          }}
        />
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400 mt-2 ml-1">
        {sender && <span>{sender}</span>}
        {time && <span>{sender ? "," : ""} {time}</span>}
      </div>
    </div>
  </div>
);

export default ChatBubble;
