// src/components/shared/FormField.jsx
import React from 'react';

export const FormField = ({ 
  label, 
  required = false, 
  children, 
  hint,
  className = "",
  error = null
}) => (
  <div className={`mb-4 ${className}`}>
    {label && (
      <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    {children}
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

export default FormField;