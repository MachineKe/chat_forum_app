import React from "react";

const PostCard = ({ title, content, author, createdAt, onClick }) => (
  <div
    className="bg-white rounded-lg shadow p-4 mb-4 cursor-pointer hover:bg-gray-50 transition"
    onClick={onClick}
  >
    <h2 className="text-lg font-semibold mb-1">{title}</h2>
    <p className="text-gray-700 mb-2">{content}</p>
    <div className="text-xs text-gray-500 flex justify-between">
      <span>By {author}</span>
      <span>{createdAt}</span>
    </div>
  </div>
);

export default PostCard;
