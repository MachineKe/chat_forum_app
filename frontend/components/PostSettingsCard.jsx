import React, { useState } from "react";

const PostSettingsCard = ({ content, onBack, onPost, loading }) => {
  const [boost, setBoost] = useState(false);

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-0 mb-4">
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
        <div className="text-sm text-gray-500 mb-1">Post preview</div>
        <div className="bg-gray-50 rounded p-3 text-gray-900 mb-2" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
      {/* Who can see your post */}
      <div className="flex items-center px-4 py-3 border-t">
        <span className="mr-3">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="#555" strokeWidth="2" fill="#f3f4f6"/>
            <path d="M12 7a5 5 0 0 1 5 5v1h1a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-1v1a5 5 0 0 1-10 0v-1H5a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h1v-1a5 5 0 0 1 5-5z" fill="#e5e7eb"/>
          </svg>
        </span>
        <div className="flex-1">
          <div className="font-medium text-gray-900">Who can see your post</div>
          <div className="text-sm text-gray-500">Public</div>
        </div>
        <span className="text-gray-400">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </span>
      </div>
      {/* Boost post */}
      <div className="flex items-center px-4 py-3 border-t">
        <span className="mr-3">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="4" fill="#e5e7eb"/>
            <path d="M12 8v4l3 3" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <div className="flex-1">
          <div className="font-medium text-gray-900">Boost post</div>
          <div className="text-xs text-gray-500">You'll choose settings after you click Post. You can only boost public posts.</div>
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
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
};

export default PostSettingsCard;
