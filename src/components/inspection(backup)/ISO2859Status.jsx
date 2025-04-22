// src/components/inspection/ISO2859Status.jsx
import React from 'react';
import { XCircle } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import StatusBadge from '../common/StatusBadge';
import { iso2859Table } from '../../constants/iso2859Tables';
import { getSampleLetter, getSampleCount } from '../../utils/samplePlanHelper';

/**
 * Componente de estado de inspección ISO 2859-1
 */
const ISO2859Status = () => {
  const { state, dispatch } = useInspection();
  const { 
    inspectionStep, 
    inspectionStatus, 
    totalNonConformities,
    totalSamplesChecked,
    showStepNotification,
    stepNotificationMessage,
    sampleInfo,
    dimensions
  } = state;
  
  // Obtener letra y recuento de muestra
  const sampleLetter = getSampleLetter(sampleInfo);
  
  // Obtener muestras totales requeridas
  const getTotalRequiredSamples = () => {
    const stepData = iso2859Table[sampleLetter]?.[inspectionStep];
    if (!stepData) return 0;
    return stepData.size * (dimensions?.length || 0);
  };
  
  // Obtener muestras totales verificadas
  const getTotalSamplesChecked = () => {
    return Object.values(totalSamplesChecked).reduce((sum, count) => sum + count, 0);
  };
  
  // Obtener porcentaje de progreso
  const getInspectionProgress = () => {
    const totalRequired = getTotalRequiredSamples();
    const totalChecked = getTotalSamplesChecked();
    
    if (totalRequired === 0) return 0;
    return (totalChecked / totalRequired) * 100;
  };
  
  // Verificar si está listo para el siguiente paso
  const isReadyForNextStep = () => {
    if (!iso2859Table[sampleLetter]) return false;
    
    if (!inspectionStep || inspectionStep === 'fifth') return false;
    
    const stepData = iso2859Table[sampleLetter][inspectionStep];
    if (!stepData) return false;
    
    // Necesitamos haber completado todas las muestras requeridas
    const totalSamplesCompleted = getTotalSamplesChecked();
    const minSamplesRequired = getTotalRequiredSamples();
    
    if (totalSamplesCompleted < minSamplesRequired) return false;
    
    // Si ya pasamos o fallamos, no hay necesidad de pasar al siguiente paso
    if (inspectionStatus === 'pass' || inspectionStatus === 'reject') return false;
    
    // Si ac es '#', siempre pasamos al siguiente paso (primer paso especial)
    if (stepData.ac === '#') return true;
    
    // Solo ir al siguiente paso si estamos entre ac y re
    return totalNonConformities > stepData.ac && totalNonConformities < stepData.re;
  };
  
  // Obtener siguiente paso
  const getNextStep = () => {
    const steps = ['first', 'second', 'third', 'fourth', 'fifth'];
    const currentIndex = steps.indexOf(inspectionStep);
    if (currentIndex < steps.length - 1) {
      return steps[currentIndex + 1];
    }
    return null;
  };
  
  // Manejar cambio de paso
  const handleNextStep = () => {
    const nextStep = getNextStep();
    if (nextStep) {
      dispatch({ type: 'SET_INSPECTION_STEP', payload: nextStep });
      dispatch({ type: 'RESET_MEASUREMENTS_FOR_NEW_STEP' });
    }
  };
  
  // Ocultar notificación
  const handleHideNotification = () => {
    dispatch({ type: 'HIDE_STEP_NOTIFICATION' });
  };
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center">
        <div>
          <span className="font-medium text-lg">Overall Status: </span>
          <StatusBadge 
            status={inspectionStatus} 
            text={
              inspectionStatus === 'pass' ? 'ACCEPTED' : 
              inspectionStatus === 'reject' ? 'REJECTED' : 
              'IN PROGRESS'
            }
          />
        </div>
        <div>
          <span className="font-medium">Current Step: </span>
          <span className="font-bold">{inspectionStep.charAt(0).toUpperCase() + inspectionStep.slice(1)}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div>
          <span className="font-medium">Total Non-conformities: </span>
          <span className={totalNonConformities > 0 ? 'text-red-600 font-bold' : 'font-bold'}>
            {totalNonConformities}
          </span>
        </div>
        
        <div>
          <span className="font-medium">Sample Letter: </span>
          <span className="font-bold">{sampleLetter}</span>
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
            {(iso2859Table[sampleLetter]?.[inspectionStep]?.ac === '#' ? 
              'N/A (First Step)' : 
              iso2859Table[sampleLetter]?.[inspectionStep]?.ac)}
          </span>
          <span className="font-medium ml-2">Rejection Number: </span>
          <span className="font-bold">{iso2859Table[sampleLetter]?.[inspectionStep]?.re}</span>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
        <div 
          className={`h-2.5 rounded-full ${
            inspectionStatus === 'pass' ? 'bg-green-600' : 
            inspectionStatus === 'reject' ? 'bg-red-600' : 
            'bg-blue-600'
          }`}
          style={{ width: `${Math.min(100, getInspectionProgress())}%` }}
        ></div>
      </div>
      
      {showStepNotification && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded text-yellow-800 mt-4">
          <div className="flex justify-between items-center">
            <div>{stepNotificationMessage}</div>
            <button 
              className="text-yellow-800 hover:text-yellow-900"
              onClick={handleHideNotification}
            >
              <XCircle size={18} />
            </button>
          </div>
          
          {isReadyForNextStep() && (
            <div className="mt-2">
              <button 
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                onClick={handleNextStep}
              >
                Continue to Step {getNextStep()?.charAt(0).toUpperCase() + getNextStep()?.slice(1)}
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="mb-4 mt-4">
        <div className="flex border-b">
          {['first', 'second', 'third', 'fourth', 'fifth'].map((step) => {
            const isCurrentStep = inspectionStep === step;
            const isNextAvailableStep = getNextStep() === step && isReadyForNextStep();
            const isEnabled = isCurrentStep || isNextAvailableStep;
            
            return (
              <button
                key={step}
                className={`px-4 py-2 font-medium ${
                  isCurrentStep ? 'border-b-2 border-blue-500 text-blue-600' : 
                  isNextAvailableStep ? 'text-blue-600' : 
                  'text-gray-400 cursor-not-allowed'
                }`}
                disabled={!isEnabled}
                onClick={() => {
                  if (isNextAvailableStep) {
                    dispatch({ type: 'SET_INSPECTION_STEP', payload: step });
                    dispatch({ type: 'RESET_MEASUREMENTS_FOR_NEW_STEP' });
                    dispatch({ type: 'HIDE_STEP_NOTIFICATION' });
                  }
                }}
              >
                Step {step.charAt(0).toUpperCase() + step.slice(1)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ISO2859Status;