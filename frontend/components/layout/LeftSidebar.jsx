import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { leftSidebarRoutes } from "./sidebarConfig";
import { useAuth } from "@hooks/useAuth.jsx";

/**
 * Reusable LeftSidebar component.
 * Handles logo, navigation, post button, and user profile section.
 */
const LeftSidebar = ({
  className = "",
  style = {},
  children,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Only show logo if logged out
  if (!user) {
    return (
      <aside
        className={`w-64 min-h-screen bg-white border-r border-gray-200 p-0 flex flex-col ${className}`}
        style={style}
      >
        <div className="flex flex-col items-center justify-center h-full p-6">
          <Link to="/" className="px-4 flex items-center justify-center">
            <img
              src="/epra-forum-logo-2.png"
              alt="EPRA Logo"
              className="h-12 w-auto object-contain"
              style={{ maxWidth: 160 }}
              onError={e => {
                e.target.onerror = null;
                e.target.style.display = "none";
                const parent = e.target.parentNode;
                if (parent && !parent.querySelector(".logo-placeholder")) {
                  const div = document.createElement("div");
                  div.className = "logo-placeholder flex items-center justify-center bg-gray-200 text-gray-600 font-bold rounded h-12 w-32";
                  div.innerText = "LOGO";
                  parent.appendChild(div);
                }
              }}
            />
          </Link>
        </div>
      </aside>
    );
  }


  const userInfo = {
    full_name: user.full_name || user.username || "User",
    username: user.username || (user.email ? user.email.split("@")[0] : "user"),
    avatar: user.avatar || "",
  };

  const avatar =
    userInfo.avatar && userInfo.avatar.length > 0
      ? userInfo.avatar.startsWith("http")
        ? userInfo.avatar
        : `${import.meta.env.VITE_BACKEND_URL}/${userInfo.avatar.replace(/^\/?/, "")}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.full_name)}&background=0D8ABC&color=fff`;

  return (
    <aside
      className={`w-64 min-h-screen bg-white border-r border-gray-200 p-0 flex flex-col ${className}`}
      style={style}
    >
      <div className="flex flex-col gap-2 sticky top-6 h-[calc(100vh-3rem)] p-6">
        {/* EPRA Logo */}
        <Link to="/" className="mb-4 px-4 flex items-center justify-center">
          <img
            src="/epra-forum-logo-2.png"
            alt="EPRA Logo"
            className="h-12 w-auto object-contain"
            style={{ maxWidth: 160 }}
          />
        </Link>
        {/* Emoji Nav */}
        <nav className="flex flex-col gap-1">
          {leftSidebarRoutes.map((item) =>
            item.to && item.to !== "#" ? (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center gap-3 px-4 py-2 rounded-full hover:bg-gray-200 text-lg font-medium text-gray-700 transition"
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                className="flex items-center gap-3 px-4 py-2 rounded-full hover:bg-gray-200 text-lg font-medium text-gray-700 transition"
                type="button"
                tabIndex={-1}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </button>
            )
          )}
        </nav>
        {/* Post Button */}
        <button
          className="mt-4 bg-black text-white font-bold rounded-full py-3 text-lg hover:bg-gray-900 transition"
          style={{ width: "90%" }}
          onClick={() => navigate("/forum")}
        >
          Post
        </button>
        {/* Spacer */}
        <div className="flex-1" />
        {/* User Profile Section with Options Menu */}
        <UserProfileCard
          user={userInfo}
          avatar={avatar}
          onProfileClick={() => navigate(`/user/${userInfo.username}`)}
          onLogout={() => {
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
        />
        {children}
      </div>
    </aside>
  );
};

/**
 * UserProfileCard - Profile card with 3-dot options menu for logout.
 */
function UserProfileCard({ user, avatar, onProfileClick, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cardRef = useRef(null);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        cardRef.current &&
        !cardRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <div className="relative mt-auto">
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-200 cursor-pointer"
        onClick={onProfileClick}
        tabIndex={0}
        role="button"
        aria-label="Open public profile"
        ref={cardRef}
        style={{ zIndex: 10 }}
      >
        <img
          src={avatar}
          alt={user.full_name}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div>
          <div className="font-semibold text-gray-900 text-sm">{user.full_name}</div>
          <div className="text-xs text-gray-500">@{user.username}</div>
        </div>
        {/* 3-dot options button */}
        <button
          className="ml-auto p-2 rounded-full hover:bg-gray-300 focus:outline-none"
          onClick={e => {
            e.stopPropagation();
            setMenuOpen(v => !v);
          }}
          aria-label="Open options"
          tabIndex={0}
          type="button"
        >
          {/* SVG for 3 dots */}
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
            <circle cx="4" cy="10" r="1.5" fill="#555" />
            <circle cx="10" cy="10" r="1.5" fill="#555" />
            <circle cx="16" cy="10" r="1.5" fill="#555" />
          </svg>
        </button>
      </div>
      {/* Popover menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute left-1/2 -translate-x-1/2 bottom-14 z-50 bg-white rounded-2xl shadow-lg border border-gray-200 py-2 px-4 min-w-[220px] flex flex-col"
          style={{
            boxShadow:
              "0 4px 16px 0 rgba(0,0,0,0.10), 0 1.5px 4px 0 rgba(0,0,0,0.08)",
          }}
        >
          <div className="text-sm py-2 px-1 hover:bg-gray-100 rounded cursor-pointer">
            Add an existing account
          </div>
          <div
            className="text-sm py-2 px-1 hover:bg-gray-100 rounded cursor-pointer font-semibold text-red-600"
            onClick={onLogout}
            tabIndex={0}
            role="button"
            aria-label="Log out"
          >
            Log out @{user.username}
          </div>
          {/* Pointer arrow */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "-10px",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "12px solid transparent",
              borderRight: "12px solid transparent",
              borderTop: "12px solid white",
              filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.08))",
              zIndex: 51,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default LeftSidebar;
