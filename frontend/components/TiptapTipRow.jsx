import React from "react";

const TiptapTipRow = ({ editor }) => (
  <div className="flex items-center gap-2 mt-2 mb-2">
    <button className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-gray-700 text-sm font-medium hover:bg-gray-200">
      <span className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white rounded-full px-1.5 py-0.5 font-bold text-lg">Aa</span>
    </button>
    <button className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-gray-700 text-sm font-medium hover:bg-gray-200">
      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FFD600"/><circle cx="9" cy="10" r="1.5" fill="#333"/><circle cx="15" cy="10" r="1.5" fill="#333"/><path d="M8 15c1.333 1 2.667 1 4 0" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/></svg>
      Tip
    </button>
    <button className="ml-auto text-gray-400 hover:text-gray-600 text-xl font-bold px-2 py-1 rounded-full transition-colors" title="More">
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
    </button>
  </div>
);

export default TiptapTipRow;
