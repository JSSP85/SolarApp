// src/components/inspection/InspectionPanel.jsx
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import ActionButton from '../common/ActionButton';
import InspectionHeader from './InspectionHeader';
import ISO2859Status from './ISO2859Status';
import DimensionInput from './DimensionInput';
import DimensionStatus from './DimensionStatus';
import CoatingMeasurement from './CoatingMeasurement';
import VisualInspection from './VisualInspection';
import EquipmentManager from './EquipmentManager';
import DimensionChart from '../charts/DimensionChart'; // Añadir esta línea

/**
 * Panel principal de inspección
 */
const InspectionPanel = () => {
  const { state, dispatch } = useInspection();
  
  const handleViewReport = () => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'report' });
  };
  
  const handleBackToSetup = () => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'setup' });
  };
  
  return (
    <div className="space-y-6">
      <InspectionHeader />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="border rounded p-4 bg-white">
            <h3 className="font-bold mb-4">Technical Drawing</h3>
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <img src="/api/placeholder/400/300" alt="Component technical drawing" className="max-h-full" />
            </div>
          </div>
        </div>
        
        <div className="border rounded p-4 bg-white">
          <h3 className="font-bold mb-4">Measurement Input</h3>
          <ISO2859Status />
          <DimensionInput />
        </div>
      </div>
      
      <DimensionStatus />
      
      {/* Añadir el componente DimensionChart aquí */}
      <DimensionChart />
      
      <CoatingMeasurement />
      
      <VisualInspection />
      
      <EquipmentManager />
      
      <div className="flex justify-between pt-4">
        <ActionButton 
          onClick={handleBackToSetup}
          variant="secondary"
        >
          Back to Setup
        </ActionButton>
        <ActionButton 
          onClick={handleViewReport}
          variant="success"
          icon={<CheckCircle size={18} />}
        >
          Complete Inspection
        </ActionButton>
      </div>
    </div>
  );
};

export default InspectionPanel;