import React from "react";
import Avatar from "../layout/Avatar";

const PlainText = ({ user = { name: "User", avatar: "" }, placeholder, onClick }) => {
  const avatarUrl =
    user && user.avatar
      ? user.avatar
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user && user.name ? user.name : "User"
        )}&background=0D8ABC&color=fff`;
  const displayName = user && user.name ? user.name : "User";
  return (
    <div
      className="flex items-center bg-white rounded-full shadow px-4 py-3 cursor-pointer border border-gray-200 hover:shadow-md transition"
      style={{ minHeight: 48 }}
      onClick={onClick}
    >
      <Avatar
        src={avatarUrl}
        alt={displayName}
        size={40}
        className="mr-3"
      />
      <span className="text-gray-400 text-base">
        {placeholder || `What's on your mind, ${displayName.split(" ")[0]}?`}
      </span>
    </div>
  );
};

export default PlainText;
