// src/SolarApp.jsx
import React from 'react';
import { InspectionProvider } from './context/InspectionContext';
import Header from './components/layout/Header';
import TabNavigation from './components/layout/TabNavigation';
import SetupForm from './components/setup/SetupForm';
import InspectionPanel from './components/inspection/InspectionPanel';
import ReportView from './components/report/ReportView';
import { useInspection } from './context/InspectionContext';

/**
 * Componente de contenido que utiliza el contexto
 */
const SolarAppContent = () => {
  const { state } = useInspection();
  const { activeTab } = state;

  return (
    <div className="bg-gray-50 border rounded-lg overflow-hidden">
      <Header />
      <TabNavigation />
      
      <div className="bg-white p-4">
        {activeTab === 'setup' && <SetupForm />}
        {activeTab === 'inspection' && <InspectionPanel />}
        {activeTab === 'report' && <ReportView />}
      </div>
    </div>
  );
};

/**
 * Componente principal de la aplicación
 */
const SolarApp = () => {
  return (
    <InspectionProvider>
      <SolarAppContent />
    </InspectionProvider>
  );
};

export default SolarApp;