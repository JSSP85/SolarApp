// src/SolarAppModern.jsx
import React from 'react';
import { useInspection } from './context/InspectionContext';
import HeaderFixed from './components/layout/HeaderFixed';
import TabNavigationFixed from './components/layout/TabNavigationFixed';
import SetupForm from './components/setup/SetupForm';
import InspectionPanelFixed from './components/inspection/InspectionPanelFixed';
import ReportViewModern from './components/report/ReportViewModern';

const SolarAppModern = () => {
  const { state } = useInspection();
  const { activeTab } = state;

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      minHeight: '100vh'
    }}>
      <div className="max-w-7xl mx-auto pb-10">
        <HeaderFixed />
        <TabNavigationFixed />
        
        <div className="app-container mx-4 my-6">
          {activeTab === 'setup' && <SetupForm />}
          {activeTab === 'inspection' && <InspectionPanelFixed />}
          {activeTab === 'report' && <ReportViewModern />}
        </div>
      </div>
    </div>
  );
};

export default SolarAppModern;