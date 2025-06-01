import React from "react";
import Avatar from "@components/layout/Avatar";

const PostPrompt = ({ user, onClick }) => (
  <div
    className="flex items-center bg-white rounded-full shadow px-4 py-3 cursor-pointer border border-gray-200 hover:shadow-md transition"
    style={{ minHeight: 48 }}
    onClick={onClick}
  >
    <Avatar
      src={user.avatar}
      alt={user.name}
      size={40}
      className="mr-3"
    />
    <span className="text-gray-400 text-base">
      {`What's on your mind, ${user.name.split(" ")[0]}?`}
    </span>
  </div>
);

export default PostPrompt;
