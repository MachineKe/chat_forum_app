import React from "react";

// Add variant prop to allow icon-only buttons without default styles
const Button = ({ children, className = "", variant, ...props }) => (
  <button
    className={
      variant === "icon"
        ? className
        : `px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition ${className}`
    }
    {...props}
  >
    {children}
  </button>
);

export default Button;
