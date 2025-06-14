import React from "react";
import { useNavigate } from "react-router-dom";

const LoggedOutFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#1da1f2] text-white z-50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between py-3 px-4">
        <div className="text-center sm:text-left mb-2 sm:mb-0">
          <div className="font-bold text-lg">Don’t miss what’s happening</div>
          <div className="text-sm text-white/90">People on EPRA Forum are the first to know.</div>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-1 rounded-full border border-white text-white bg-transparent font-semibold hover:bg-white/10 transition"
            onClick={() => navigate("/login")}
          >
            Log in
          </button>
          <button
            className="px-4 py-1 rounded-full bg-white text-[#1da1f2] font-bold hover:bg-gray-100 transition"
            onClick={() => navigate("/register")}
          >
            Sign up
          </button>
        </div>
      </div>
    </footer>
  );
};

export default LoggedOutFooter;
