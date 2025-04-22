// src/components/layout/Header.jsx
import React from 'react';

/**
 * Componente de encabezado de la aplicación
 */
const Header = () => {
  return (
    <header 
      style={{
        backgroundColor: "#005F83", 
        color: 'white', 
        padding: '1rem'
      }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span 
            className="text-xl font-bold" 
            style={{ color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
          >
            Componentes Inspections
          </span>
        </div>
        <div>
          <span 
            className="text-lg font-bold text-white" 
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '0.5rem',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            VALMONT SOLAR
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;