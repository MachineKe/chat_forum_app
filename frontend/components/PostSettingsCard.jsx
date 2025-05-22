import React, { useState } from "react";
import Card from "./Card";

const PostSettingsCard = ({ content, onBack, onPost, loading }) => {
  const [boost, setBoost] = useState(false);

  return (
    <Card className="w-full p-0 mb-4">
      {/* Header */}
      <div className="flex items-center border-b px-4 py-3">
        <button
          className="mr-2 text-gray-600 hover:bg-gray-100 rounded-full p-1"
          onClick={onBack}
          aria-label="Back"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 text-center font-semibold text-lg text-gray-900">Post settings</div>
        <div className="w-8" /> {/* Spacer for symmetry */}
      </div>
      {/* Post preview */}
      <div className="px-4 pt-4 pb-2">
        <div className="font-semibold text-gray-900 mb-1">Post preview</div>
        <div className="bg-gray-100 rounded-lg p-4 text-gray-900 mb-2 border border-gray-200 min-h-[40px]" style={{ fontSize: 16 }} dangerouslySetInnerHTML={{ __html: content }} />
      </div>
      {/* Schedule post row */}
      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border-t border-b-0 border-gray-200 mx-4 mt-0 mb-0">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" fill="#E5E7EB"/><path d="M8 2v4M16 2v4M3 10h18" stroke="#9CA3AF" strokeWidth="2"/><rect x="7" y="14" width="4" height="4" rx="1" fill="#3B82F6"/></svg>
        <span className="text-gray-500 text-sm">schedule post</span>
      </div>
      {/* Save As Draft */}
      <div className="flex items-center px-4 py-3 border-t">
        <span className="mr-3">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="4" fill="#f3f4f6"/>
            <path d="M12 8v4l3 3" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <div className="flex-1">
          <div className="font-medium text-gray-900">Save As Draft</div>
          <div className="text-xs text-gray-500">Save this post as draft to publish it later</div>
        </div>
        <label className="inline-flex items-center cursor-pointer ml-2">
          <input
            type="checkbox"
            className="sr-only"
            checked={boost}
            onChange={() => setBoost(!boost)}
          />
          <div className={`w-10 h-6 bg-gray-200 rounded-full p-1 flex items-center transition-colors ${boost ? "bg-blue-500" : ""}`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${boost ? "translate-x-4" : ""}`}></div>
          </div>
        </label>
      </div>
      {/* Post button */}
      <div className="px-4 py-4">
        <button
          className="w-full py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          onClick={onPost}
          disabled={loading}
        >
          {loading ? "Saving..." : "Post"}
        </button>
      </div>
    </Card>
  );
};

export default PostSettingsCard;
