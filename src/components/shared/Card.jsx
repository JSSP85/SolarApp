// src/components/shared/Card.jsx
import React from 'react';

export const Card = ({ 
  title, 
  children, 
  className = "", 
  headerClassName = "",
  headerRight = null,
  noPadding = false
}) => (
  <div className={`bg-white rounded-lg shadow border overflow-hidden mb-4 ${className}`}>
    {title && (
      <div className={`p-4 border-b flex justify-between items-center ${headerClassName || "bg-gradient-to-r from-blue-600 to-blue-700"}`}>
        <h3 className="text-lg font-medium text-white">{title}</h3>
        {headerRight && (
          <div className="flex items-center">
            {headerRight}
          </div>
        )}
      </div>
    )}
    <div className={noPadding ? "" : "p-4"}>
      {children}
    </div>
  </div>
);

export default Card;