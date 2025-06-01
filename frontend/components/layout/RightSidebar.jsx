import React from "react";
import { rightSidebarConfig } from "./sidebarConfig";

/**
 * Reusable RightSidebar component.
 * Renders trending topics and who to follow widgets.
 */
const RightSidebar = ({
  className = "",
  style = {},
  children,
}) => {
  return (
    <aside
      className={`w-80 min-h-screen bg-white border-l border-gray-200 p-0 flex flex-col ${className}`}
      style={style}
    >
      <div className="flex flex-col gap-4 sticky top-6 h-[calc(100vh-3rem)] p-6">
        {/* Trending Topics Widget */}
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-4">
          <div className="font-bold text-lg mb-2">What's happening</div>
          <div className="flex flex-col gap-2">
            <div>
              <div className="text-xs text-gray-500">Business & finance · Trending</div>
              <div className="font-semibold text-gray-900">Market Cap</div>
              <div className="text-xs text-gray-500">27.8K posts</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Politics · Trending</div>
              <div className="font-semibold text-gray-900">President Ruto</div>
              <div className="text-xs text-gray-500">13.6K posts</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Trending in Kenya</div>
              <div className="font-semibold text-gray-900">Tundu Lissu</div>
              <div className="text-xs text-gray-500">22K posts</div>
            </div>
          </div>
        </div>
        {/* Who to Follow Widget */}
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-4">
          <div className="font-bold text-lg mb-2">Who to follow</div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Khwisero's Finest</div>
                <div className="text-xs text-gray-500">@Dredo_ltd</div>
              </div>
              <button className="bg-black text-white rounded-full px-4 py-1 text-sm font-semibold hover:bg-gray-900">Follow</button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Rocky</div>
                <div className="text-xs text-gray-500">@Rocky11960</div>
              </div>
              <button className="bg-black text-white rounded-full px-4 py-1 text-sm font-semibold hover:bg-gray-900">Follow</button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Mpakaunik</div>
                <div className="text-xs text-gray-500">@Mpakaunik</div>
              </div>
              <button className="bg-black text-white rounded-full px-4 py-1 text-sm font-semibold hover:bg-gray-900">Follow</button>
            </div>
          </div>
        </div>
        {children}
      </div>
    </aside>
  );
};

export default RightSidebar;
