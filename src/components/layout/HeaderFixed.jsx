// src/components/layout/HeaderFixed.jsx
import React from 'react';

const HeaderFixed = () => {
  return (
    <header className="app-header">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-xl font-bold">Componentes Inspections</span>
        </div>
        <div>
          <span className="text-lg font-bold bg-white text-gray-800 px-3 py-1 rounded shadow-sm">VALMONT SOLAR</span>
        </div>
      </div>
    </header>
  );
};

export default HeaderFixed;