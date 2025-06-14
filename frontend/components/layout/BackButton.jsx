import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import Button from "./Button";

/**
 * Reusable BackButton component.
 * - Uses the existing Button component.
 * - Preserves the design and functionality of the single post back button.
 * - Accepts optional onClick and className props.
 */
const BackButton = ({ onClick, className = "", label, ...props }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick =
    onClick ||
    (() => {
      const prevPath = location.pathname + location.search + location.hash;
      navigate(-1);
      setTimeout(() => {
        // If location did not change, fallback
        if (
          window.location.pathname + window.location.search + window.location.hash === prevPath
        ) {
          navigate("/forum", { replace: true });
        }
      }, 100);
    });

  return (
    <div className={`flex items-center ${className}`}>
      <Button
        onClick={handleClick}
        aria-label="Back"
        variant="icon"
        className={
          // Override Button's default style to match the original back button
          "mr-2 text-gray-700 hover:bg-gray-100 rounded-full p-2 cursor-pointer"
        }
        style={{
          background: "none",
          boxShadow: "none",
          padding: 0,
          minWidth: 0,
          minHeight: 0,
          ...props.style,
        }}
        {...props}
      >
        <FiChevronLeft size={24} />
      </Button>
      {label && (
        <span className="font-bold text-lg">{label}</span>
      )}
    </div>
  );
};

export default BackButton;
