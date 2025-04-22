// src/components/inspection/DimensionInputFixed.jsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { getSampleCount } from '../../utils/samplePlanHelper';

const DimensionInputFixed = () => {
  const { state, dispatch } = useInspection();
  const { 
    dimensions, 
    currentDimension, 
    currentDimSample, 
    dimensionMeasurements, 
    inspectionStep,
    totalNonConformities,
    sampleInfo,
    iso2859Table,
    showStepNotification,
    stepNotificationMessage
  } = state;
  
  // Obtener la letra de muestra basado en el sampleInfo
  const getSampleLetter = () => {
    if (!sampleInfo) return 'G';
    const match = sampleInfo.match(/Letter: ([A-Z])/);
    return match ? match[1] : 'G';
  };
  
  // Función para avanzar a la siguiente muestra
  const handleNextSample = () => {
    // Obtener el valor actual del input
    const inputValue = document.querySelector('#dimension-input')?.value;
    
    // Enviar acción para avanzar a la siguiente muestra
    dispatch({ 
      type: 'NEXT_DIMENSION_SAMPLE', 
      payload: { value: inputValue } 
    });
  };
  
  // Función para actualizar el valor de medición
  const handleInputChange = (e) => {
    if (currentDimension < dimensions?.length) {
      const dimCode = dimensions[currentDimension].code;
      dispatch({
        type: 'UPDATE_DIMENSION_MEASUREMENT',
        payload: {
          dimension: dimCode,
          sampleIndex: currentDimSample - 1,
          value: e.target.value
        }
      });
    }
  };
  
  // Manejar navegación entre steps
  const handleStepChange = (step) => {
    dispatch({ type: 'SET_INSPECTION_STEP', payload: step });
    dispatch({ type: 'RESET_MEASUREMENTS_FOR_NEW_STEP' });
  };
  
  // Verificar si podemos ir al siguiente paso
  const isReadyForNextStep = () => {
    const sampleLetter = getSampleLetter();
    const stepData = iso2859Table?.[sampleLetter]?.[inspectionStep];
    
    if (!stepData) return false;
    
    // Lógica para determinar si estamos listos para el paso siguiente
    // (Simplificada para este ejemplo)
    return true;
  };
  
  // Obtener siguiente paso
  const getNextStep = (currentStep) => {
    const steps = ['first', 'second', 'third', 'fourth', 'fifth'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      return steps[currentIndex + 1];
    }
    return null;
  };
  
  return (
    <div className="border rounded p-4 bg-white">
      <h3 className="font-bold mb-4">Measurement Input</h3>
      
      <div className="mb-4">
        <div className="flex border-b">
          {['first', 'second', 'third', 'fourth', 'fifth'].map((step) => {
            const isCurrentStep = inspectionStep === step;
            const isNextAvailableStep = getNextStep(inspectionStep) === step && isReadyForNextStep();
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
                onClick={() => isEnabled && handleStepChange(step)}
              >
                Step {step.charAt(0).toUpperCase() + step.slice(1)}
              </button>
            );
          })}
        </div>
      </div>
      
      {showStepNotification && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded text-yellow-800">
          <div className="flex justify-between items-center">
            <div>{stepNotificationMessage}</div>
            <button 
              className="text-yellow-800 hover:text-yellow-900"
              onClick={() => dispatch({ type: 'HIDE_STEP_NOTIFICATION' })}
            >
              <span>✕</span>
            </button>
          </div>
          
          {isReadyForNextStep() && (
            <div className="mt-2">
              <button 
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                onClick={() => {
                  const nextStep = getNextStep(inspectionStep);
                  if (nextStep) {
                    handleStepChange(nextStep);
                  }
                }}
              >
                Continue to Step {getNextStep(inspectionStep)?.charAt(0).toUpperCase() + getNextStep(inspectionStep)?.slice(1)}
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {currentDimension < dimensions?.length && (
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <div className="flex items-center">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white mr-2">
                {dimensions[currentDimension].code}
              </span>
              <div>
                <span className="font-medium">Current Dimension:</span> {dimensions[currentDimension].nominal} mm ({dimensions[currentDimension].tolerancePlus > 0 ? '+' : ''}{dimensions[currentDimension].tolerancePlus}, {dimensions[currentDimension].toleranceMinus > 0 ? '+' : ''}{dimensions[currentDimension].toleranceMinus})
                <div className="text-sm text-gray-600">{dimensions[currentDimension].description}</div>
              </div>
            </div>
            
            <div className="mt-2 text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
              <div className="flex justify-between">
                <span className="font-medium">Ac: {iso2859Table?.[getSampleLetter()]?.[inspectionStep]?.ac === '#' ? 'N/A' : iso2859Table?.[getSampleLetter()]?.[inspectionStep]?.ac}</span>
                <span className="font-medium">Re: {iso2859Table?.[getSampleLetter()]?.[inspectionStep]?.re}</span>
                <span className="font-medium">Total Non-conf: <span className={totalNonConformities > 0 ? 'text-red-600 font-bold' : ''}>{totalNonConformities}</span></span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <button 
            className={`p-2 rounded ${currentDimSample > 1 ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            onClick={() => currentDimSample > 1 && dispatch({ type: 'PREV_DIMENSION_SAMPLE' })}
            disabled={currentDimSample <= 1}
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Sample {currentDimSample} of {getSampleCount(sampleInfo)}
            </label>
            <div className="flex">
              <input 
                id="dimension-input"
                type="number" 
                className="flex-1 p-1 border rounded-l w-20" 
                placeholder="Enter measurement"
                value={currentDimension < dimensions?.length ? dimensionMeasurements?.[dimensions[currentDimension].code]?.[currentDimSample - 1] || '' : ''}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleNextSample();
                  }
                }}
                step="0.1"
              />
              <button 
                className="bg-green-600 text-white px-3 py-2 rounded-r"
                onClick={handleNextSample}
                disabled={currentDimension >= (dimensions?.length || 0)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DimensionInputFixed;