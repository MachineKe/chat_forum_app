import React from "react";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

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
  return (
    <div className={`flex min-h-screen w-full bg-white ${className}`} style={style}>
      <LeftSidebar {...leftSidebarProps} />
      <main className="flex-1 min-h-screen">{children}</main>
      <RightSidebar {...rightSidebarProps} />
    </div>
  );
};

export default Sidebar;
