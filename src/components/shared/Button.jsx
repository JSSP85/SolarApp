// src/components/shared/Button.jsx
import React from 'react';

export const Button = ({
  children,
  onClick,
  variant = "primary",
  icon,
  iconPosition = "right",
  disabled = false,
  className = "",
  type = "button",
  size = "medium"
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return disabled
          ? "bg-blue-300 text-white cursor-not-allowed"
          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg";
      case "secondary":
        return disabled
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50";
      case "danger":
        return disabled
          ? "bg-red-300 text-white cursor-not-allowed"
          : "bg-red-600 text-white hover:bg-red-700";
      case "success":
        return disabled
          ? "bg-green-300 text-white cursor-not-allowed"
          : "bg-green-600 text-white hover:bg-green-700";
      case "warning":
        return disabled
          ? "bg-yellow-300 text-white cursor-not-allowed"
          : "bg-yellow-600 text-white hover:bg-yellow-700";
      default:
        return disabled
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "px-3 py-1 text-sm";
      case "large":
        return "px-6 py-3 text-lg";
      case "medium":
      default:
        return "px-4 py-2";
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg shadow-sm flex items-center font-medium transition-all ${getVariantClasses()} ${getSizeClasses()} ${className}`}
    >
      {icon && iconPosition === "left" && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}
    </button>
  );
};

export default Button;