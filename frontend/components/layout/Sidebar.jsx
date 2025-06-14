import React from "react";
import { useLocation, Link } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import { useAuth } from "@hooks/useAuth.jsx";

/**
 * Sidebar layout component.
 * Renders LeftSidebar, main content (children), and RightSidebar.
 * Both sidebars are reusable and their logic is defined in their own components.
 */
const Sidebar = ({
  className = "",
  style = {},
  children,
  leftSidebarProps = {},
  rightSidebarProps = {},
}) => {
  const location = useLocation();
  const isChatPage = location.pathname === "/chat";
  const { user } = useAuth();
  return (
    <div className={`flex min-h-screen w-full bg-white ${className}`} style={style}>
      {user ? (
        <LeftSidebar {...leftSidebarProps} />
      ) : (
        <div className="w-64 flex items-start justify-start p-6">
          <Link to="/" className="block">
            <img
              src="/epra-forum-logo-2.png"
              alt="Logo"
              className="h-10 w-auto"
              style={{ objectFit: "contain" }}
            />
          </Link>
        </div>
      )}
      <main className="flex-1 min-h-screen">{children}</main>
      {!isChatPage && <RightSidebar {...rightSidebarProps} />}
    </div>
  );
};

export default Sidebar;
