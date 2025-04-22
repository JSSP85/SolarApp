// src/SolarAppFixed.jsx
import React from 'react';
import { useInspection } from './context/InspectionContext';
import HeaderFixed from './components/layout/HeaderFixed';
import TabNavigationFixed from './components/layout/TabNavigationFixed';
import SetupForm from './components/setup/SetupForm';
import InspectionPanelFixed from './components/inspection/InspectionPanelFixed';
import ReportViewFixed from './components/report/ReportViewFixed';

const SolarAppFixed = () => {
  const { state } = useInspection();
  const { activeTab } = state;

  return (
    <div className="bg-gray-50" style={{ backgroundColor: '#e7ecf3', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto pb-10">
        <HeaderFixed />
        <TabNavigationFixed />
        
        <div className="app-container mx-4 my-6 p-6">
          {activeTab === 'setup' && <SetupForm />}
          {activeTab === 'inspection' && <InspectionPanelFixed />}
          {activeTab === 'report' && <ReportViewFixed />}
        </div>
      </div>
    </div>
  );
};

export default SolarAppFixed;