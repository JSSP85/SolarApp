// src/components/layout/TabNavigationFixed.jsx
import React from 'react';
import { useInspection } from '../../context/InspectionContext';

const TabNavigationFixed = () => {
  const { state, dispatch } = useInspection();
  const { activeTab } = state;
  
  const handleTabChange = (tab) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };
  
  return (
    <div className="tab-navigation">
      <nav className="flex max-w-5xl mx-auto">
        <button
          className={`tab-button ${activeTab === 'setup' ? 'active' : ''}`}
          onClick={() => handleTabChange('setup')}
        >
          Setup
        </button>
        <button
          className={`tab-button ${activeTab === 'inspection' ? 'active' : ''}`}
          onClick={() => handleTabChange('inspection')}
        >
          Inspection
        </button>
        <button
          className={`tab-button ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => handleTabChange('report')}
        >
          Report
        </button>
      </nav>
    </div>
  );
};

export default TabNavigationFixed;