// src/components/inspection/InspectionPanelFixed.jsx
import React from 'react';
import { useInspection } from '../../context/InspectionContext';
import { CheckCircle, ArrowRight, ArrowLeft, XCircle } from 'lucide-react';
import ISO2859StatusFixed from './ISO2859StatusFixed';
import DimensionInputFixed from './DimensionInputFixed';
import DimensionStatusFixed from './DimensionStatusFixed';
import DimensionChartFixed from '../charts/DimensionChartFixed';
import CoatingMeasurementFixed from './CoatingMeasurementFixed';
import VisualInspectionFixed from './VisualInspectionFixed';
import EquipmentManagerFixed from './EquipmentManagerFixed';

const InspectionPanelFixed = () => {
  const { state, dispatch } = useInspection();
  const { componentName } = state;
  
  const handleBackToSetup = () => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'setup' });
  };
  
  const handleViewReport = () => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'report' });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Dimension Inspection</h2>
        <div className="text-sm bg-gray-100 p-2 rounded">
          Component: {componentName || "Torque tube 140x100x3.5mm"}
        </div>
      </div>
      
      <div className="border rounded p-4 bg-white mb-4">
        <h3 className="font-bold mb-4">Inspection Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Inspector Name</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded" 
              placeholder="Enter inspector name"
              value={state.inspector || ''}
              onChange={(e) => dispatch({ 
                type: 'UPDATE_SETUP_FIELD', 
                payload: { field: 'inspector', value: e.target.value } 
              })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Inspection Date</label>
            <input 
              type="date" 
              className="w-full p-2 border rounded" 
              value={state.inspectionDate || ''}
              onChange={(e) => dispatch({ 
                type: 'UPDATE_SETUP_FIELD', 
                payload: { field: 'inspectionDate', value: e.target.value } 
              })}
            />
          </div>
        </div>
        
        <EquipmentManagerFixed />
      </div>
      
      <ISO2859StatusFixed />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="border rounded p-4 bg-white">
            <h3 className="font-bold mb-4">Technical Drawing</h3>
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <img src="/api/placeholder/400/300" alt="Component technical drawing" className="max-h-full" />
            </div>
          </div>
        </div>
        
        <DimensionInputFixed />
      </div>
      
      <DimensionStatusFixed />
      
      <DimensionChartFixed />
      
      <CoatingMeasurementFixed />
      
      <VisualInspectionFixed />
      
      <div className="flex justify-between pt-4">
        <button 
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={handleBackToSetup}
        >
          Back to Setup
        </button>
        <button 
          className="bg-green-600 text-white px-4 py-2 rounded flex items-center"
          onClick={handleViewReport}
        >
          Complete Inspection <CheckCircle className="ml-2" size={18} />
        </button>
      </div>
    </div>
  );
};

export default InspectionPanelFixed;