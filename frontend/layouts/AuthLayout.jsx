import React from "react";
import ImageProcessor from "../components/media/ImageProcessor";

const AuthLayout = ({ children }) => (
  <div className="min-h-screen flex">
    {/* Left: Form */}
    <div className="flex-1 flex items-start justify-center bg-white">
      <div className="w-full max-w-md mt-24 bg-white rounded-2xl shadow-2xl p-10">
        {children}
      </div>
    </div>
    {/* Right: Branding */}
    <div className="hidden md:flex flex-1 items-center justify-center bg-[#181f4a] relative overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="none" stroke="#fff" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      {/* Branding content */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center mb-6">
          <ImageProcessor
            src="/epra-forum-logo.png"
            alt="Logo"
            className="h-20 w-20 mr-6"
            withFrame={true}
            frameClassName="bg-white/80 border border-gray-200 rounded-xl shadow-sm p-2"
          />
          {/* <span className="text-white text-4xl font-extrabold tracking-wide">EPRA Forum</span> */}
        </div>
        <div className="text-gray-200 text-center text-base max-w-xs">
          Don’t miss what’s happening<br />
          People on EPRA Forum are the first to know.
        </div>
      </div>
    </div>
  </div>
);

export default AuthLayout;
