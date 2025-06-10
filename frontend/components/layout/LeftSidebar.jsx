import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { leftSidebarRoutes } from "./sidebarConfig";

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
  // Get user from localStorage (safe fallback)
  let user = { full_name: "Guest", username: "guest", avatar: "" };
  try {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (stored) {
      user = {
        full_name: stored.full_name || stored.username || "User",
        username: stored.username || (stored.email ? stored.email.split("@")[0] : "user"),
        avatar: stored.avatar || "",
      };
    }
  } catch {}

  const avatar =
    user.avatar && user.avatar.length > 0
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `http://localhost:5050/${user.avatar.replace(/^\/?/, "")}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=0D8ABC&color=fff`;

  return (
    <aside
      className={`w-64 min-h-screen bg-white border-r border-gray-200 p-0 flex flex-col ${className}`}
      style={style}
    >
      <div className="flex flex-col gap-2 sticky top-6 h-[calc(100vh-3rem)] p-6">
        {/* EPRA Logo */}
        <Link to="/" className="mb-4 px-4 flex items-center justify-center">
          <img
            src="/epra logo.png"
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
        {/* User Profile Section */}
        <div
          className="mt-auto flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-200 cursor-pointer"
          onClick={() => navigate(`/user/${user.username}`)}
          tabIndex={0}
          role="button"
          aria-label="Open public profile"
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
        </div>
        {children}
      </div>
    </aside>
  );
};

export default LeftSidebar;
