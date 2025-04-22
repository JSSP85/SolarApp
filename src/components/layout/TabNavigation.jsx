// src/components/layout/TabNavigation.jsx
import React from 'react';
import { useInspection } from '../../context/InspectionContext';

/**
 * Componente de navegación por pestañas para las secciones principales
 */
const TabNavigation = () => {
  const { state, dispatch } = useInspection();
  const { activeTab } = state;
  
  const handleTabChange = (tab) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };
  
  return (
    <div 
      className="border-b" 
      style={{ 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        backdropFilter: 'blur(10px)' 
      }}
    >
      <nav className="flex max-w-5xl mx-auto">
        <button
          className={`px-4 py-3 font-medium ${
            activeTab === 'setup' 
              ? 'border-b-2 border-white text-white bg-black bg-opacity-20' 
              : 'text-white text-opacity-70 hover:bg-white hover:bg-opacity-10'
          }`}
          onClick={() => handleTabChange('setup')}
        >
          Setup
        </button>
        <button
          className={`px-4 py-3 font-medium ${
            activeTab === 'inspection' 
              ? 'border-b-2 border-white text-white bg-black bg-opacity-20' 
              : 'text-white text-opacity-70 hover:bg-white hover:bg-opacity-10'
          }`}
          onClick={() => handleTabChange('inspection')}
        >
          Inspection
        </button>
        <button
          className={`px-4 py-3 font-medium ${
            activeTab === 'report' 
              ? 'border-b-2 border-white text-white bg-black bg-opacity-20' 
              : 'text-white text-opacity-70 hover:bg-white hover:bg-opacity-10'
          }`}
          onClick={() => handleTabChange('report')}
        >
          Report
        </button>
      </nav>
    </div>
  );
};

export default TabNavigation;