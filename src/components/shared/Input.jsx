// src/components/shared/Input.jsx
import React from 'react';

export const Input = ({ 
  type = "text", 
  value, 
  onChange,
  placeholder = "",
  disabled = false,
  className = "",
  min,
  max,
  step,
  onKeyDown,
  id,
  readOnly = false,
  name,
  autoComplete,
  ariaLabel
}) => {
  const baseClasses = "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed" : "";
  const readOnlyClasses = readOnly ? "bg-gray-50" : "";
  
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      onKeyDown={onKeyDown}
      readOnly={readOnly}
      name={name}
      autoComplete={autoComplete}
      aria-label={ariaLabel}
      className={`${baseClasses} ${disabledClasses} ${readOnlyClasses} ${className}`}
    />
  );
};

export default Input;