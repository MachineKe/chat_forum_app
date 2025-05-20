import React from "react";
import MainLayout from "../layouts/MainLayout";
import CommentBox from "../components/CommentBox";

const PostDetail = () => {
  // Placeholder for post detail logic and comments
  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-xl font-bold mb-2">Sample Post Title</h2>
        <p className="text-gray-700 mb-2">This is the content of the post.</p>
        <div className="text-xs text-gray-500 mb-4">By Alice on 2025-05-20</div>
        {/* Optional: Likes/upvotes UI */}
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Comments</h3>
        {/* Map comments here */}
        <div className="mb-2">
          <div className="bg-gray-100 rounded p-2">
            <span className="font-medium">Bob:</span> Nice post!
          </div>
        </div>
        <div className="mb-2">
          <div className="bg-gray-100 rounded p-2">
            <span className="font-medium">Charlie:</span> Thanks for sharing.
          </div>
        </div>
      </div>
      <CommentBox />
    </MainLayout>
  );
};

export default PostDetail;
