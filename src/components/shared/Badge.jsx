// src/components/shared/Badge.jsx
import React from 'react';

export const Badge = ({ 
  children, 
  variant = "info", 
  className = "",
  size = "medium"
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "bg-green-100 text-green-700";
      case "danger":
        return "bg-red-100 text-red-700";
      case "warning":
        return "bg-yellow-100 text-yellow-700";
      case "info":
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "px-2 py-0.5 text-xs";
      case "large":
        return "px-4 py-1.5 text-sm";
      case "medium":
      default:
        return "px-3 py-1 text-xs";
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full font-bold ${getVariantClasses()} ${getSizeClasses()} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;