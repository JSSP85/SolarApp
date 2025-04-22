// src/DashboardApp.jsx
import React from 'react';
import { useInspection } from './context/InspectionContext';
import SidebarNav from './components/layout/SidebarNav';
import ContentHeader from './components/layout/ContentHeader';
import SetupForm from './components/setup/SetupForm'; 
import { InspectionPanelSistem } from './components/inspection'; // Cambiado para usar el nuevo componente
import ReportViewDashboard from './components/report/ReportViewDashboard';

const DashboardApp = () => {
  const { state } = useInspection();
  const { activeTab } = state;

  // También actualizamos los títulos al inglés
  const getPageTitle = () => {
    switch (activeTab) {
      case 'setup':
        return 'Inspection Setup';
      case 'inspection':
        return 'Component Inspection';
      case 'report':
        return 'Inspection Report';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="app-container">
        <SidebarNav />
        
        <div className="main-content">
          <ContentHeader title={getPageTitle()} />
          
          <div className="p-4">
            {activeTab === 'setup' && <SetupForm />}
            {activeTab === 'inspection' && <InspectionPanelSistem />} {/* Cambiado a InspectionPanelSistem */}
            {activeTab === 'report' && <ReportViewDashboard />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardApp;