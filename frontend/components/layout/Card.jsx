import React from "react";

/**
 * Card component for consistent container styling.
 * Props:
 * - className: additional classes
 * - style: inline styles
 * - children: content inside the card
 */
const Card = ({ className = "", style = {}, children, ...props }) => (
  <div
    className={`bg-white rounded-2xl shadow-lg border border-gray-200 ${className}`}
    style={style}
    {...props}
  >
    {children}
  </div>
);

export default Card;
