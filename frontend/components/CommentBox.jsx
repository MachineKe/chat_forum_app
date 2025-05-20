import React from "react";

const CommentBox = ({ value, onChange, onSubmit, placeholder }) => (
  <form
    className="flex items-center space-x-2 mt-2"
    onSubmit={e => {
      e.preventDefault();
      onSubmit && onSubmit();
    }}
  >
    <input
      className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={onChange}
      placeholder={placeholder || "Write a comment..."}
    />
    <button
      type="submit"
      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Post
    </button>
  </form>
);

export default CommentBox;
