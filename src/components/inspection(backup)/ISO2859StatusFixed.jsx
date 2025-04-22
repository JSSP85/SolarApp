// src/components/inspection/ISO2859StatusFixed.jsx
import React from 'react';
import { useInspection } from '../../context/InspectionContext';
import { getSampleLetter, getSampleCount } from '../../utils/samplePlanHelper';

const ISO2859StatusFixed = () => {
  const { state } = useInspection();
  const { 
    inspectionStatus, 
    inspectionStep, 
    totalNonConformities, 
    sampleInfo, 
    totalSamplesChecked,
    dimensions
  } = state;
  
  // Funciones de utilidad
  const getTotalRequiredSamples = () => {
    const sampleLetter = getSampleLetter(sampleInfo);
    const stepData = state.iso2859Table?.[sampleLetter]?.[inspectionStep];
    
    if (!stepData) return 0;
    return stepData.size * (dimensions?.length || 0);
  };
  
  const getTotalSamplesChecked = () => {
    return Object.values(totalSamplesChecked).reduce((sum, count) => sum + count, 0);
  };
  
  const getInspectionProgress = () => {
    const totalRequired = getTotalRequiredSamples();
    const totalChecked = getTotalSamplesChecked();
    
    if (totalRequired === 0) return 0;
    return (totalChecked / totalRequired) * 100;
  };
  
  return (
    <div className="border rounded p-4 bg-white mb-4">
      <h3 className="font-bold mb-4">ISO 2859-1 Inspection Status</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-medium text-lg">Overall Status: </span>
            <span className={`px-3 py-1 rounded-full ml-2 font-bold ${
              inspectionStatus === 'pass' ? 'bg-green-100 text-green-700' : 
              inspectionStatus === 'reject' ? 'bg-red-100 text-red-700' : 
              'bg-blue-100 text-blue-700'
            }`}>
              {inspectionStatus === 'pass' ? 'ACCEPTED' : 
               inspectionStatus === 'reject' ? 'REJECTED' : 
              'IN PROGRESS'}
            </span>
          </div>
          <div>
            <span className="font-medium">Current Step: </span>
            <span className="font-bold">{inspectionStep.charAt(0).toUpperCase() + inspectionStep.slice(1)}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Total Non-conformities: </span>
            <span className={totalNonConformities > 0 ? 'text-red-600 font-bold' : 'font-bold'}>
              {totalNonConformities}
            </span>
          </div>
          
          <div>
            <span className="font-medium">Sample Letter: </span>
            <span className="font-bold">{getSampleLetter(sampleInfo)}</span>
          </div>
          
          <div>
            <span className="font-medium">Samples Checked: </span>
            <span className="font-bold">{getTotalSamplesChecked()}</span>
            <span className="text-gray-500"> of </span>
            <span className="font-bold">{getTotalRequiredSamples()}</span>
          </div>
          
          <div>
            <span className="font-medium">Acceptance Number: </span>
            <span className="font-bold">
              {(state.iso2859Table?.[getSampleLetter(sampleInfo)]?.[inspectionStep]?.ac === '#' ? 
                'N/A (First Step)' : 
                state.iso2859Table?.[getSampleLetter(sampleInfo)]?.[inspectionStep]?.ac)}
            </span>
            <span className="font-medium ml-2">Rejection Number: </span>
            <span className="font-bold">{state.iso2859Table?.[getSampleLetter(sampleInfo)]?.[inspectionStep]?.re}</span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${
              inspectionStatus === 'pass' ? 'bg-green-600' : 
              inspectionStatus === 'reject' ? 'bg-red-600' : 
              'bg-blue-600'
            }`}
            style={{ width: `${Math.min(100, getInspectionProgress())}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ISO2859StatusFixed;