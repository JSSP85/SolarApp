// src/components/shared/TextArea.jsx
import React from 'react';

export const TextArea = ({
  value,
  onChange,
  placeholder = "",
  disabled = false,
  className = "",
  id,
  name,
  rows = 3,
  readOnly = false
}) => {
  const baseClasses = "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed" : "";
  const readOnlyClasses = readOnly ? "bg-gray-50" : "";
  
  return (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      readOnly={readOnly}
      className={`${baseClasses} ${disabledClasses} ${readOnlyClasses} ${className}`}
    />
  );
};

export default TextArea;