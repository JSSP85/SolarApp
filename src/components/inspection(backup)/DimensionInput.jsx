// src/components/inspection/DimensionInput.jsx
import React, { useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { getSampleCount } from '../../utils/samplePlanHelper';
import { getDimensionStatusClass } from '../../utils/dimensionCalculations';
import SampleIndicators from '../common/SampleIndicators';

/**
 * Componente para entrada de mediciones dimensionales
 */
const DimensionInput = () => {
  const { state, dispatch } = useInspection();
  const inputRef = useRef(null);
  
  const { 
    currentDimension, 
    currentDimSample,
    dimensionMeasurements,
    sampleInfo,
    dimensions
  } = state;
  
  // Obtener recuento de muestras
  const sampleCount = getSampleCount(sampleInfo);
  
  // Dimensión actual
  const currentDim = dimensions?.[currentDimension];
  
  // Manejar paso a la siguiente muestra
  const handleNextSample = () => {
    if (!currentDim) return;
    
    const currentValue = inputRef.current?.value;
    
    dispatch({
      type: 'NEXT_DIMENSION_SAMPLE',
      payload: { value: currentValue }
    });
  };
  
  // Manejar paso a la muestra anterior
  const handlePrevSample = () => {
    dispatch({ type: 'PREV_DIMENSION_SAMPLE' });
  };
  
  // Manejar cambio en la entrada
  const handleInputChange = (value) => {
    if (currentDim) {
      dispatch({
        type: 'UPDATE_DIMENSION_MEASUREMENT',
        payload: {
          dimension: currentDim.code,
          sampleIndex: currentDimSample - 1,
          value
        }
      });
    }
  };
  
  // Manejar selección de una muestra
  const handleSelectSample = (index) => {
    dispatch({
      type: 'SET_DIMENSION_SAMPLE',
      payload: { dimension: currentDimension, sample: index + 1 }
    });
  };
  
  if (!currentDim) return <div>No dimensions available</div>;
  
  // Obtener clase de estado para una muestra
  const getSampleStatusClass = (index) => {
    const value = dimensionMeasurements[currentDim.code]?.[index];
    return getDimensionStatusClass(currentDim, value);
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <div className="flex items-center">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white mr-2">
            {currentDim.code}
          </span>
          <div>
            <span className="font-medium">Current Dimension:</span> {currentDim.nominal} mm ({currentDim.tolerancePlus > 0 ? '+' : ''}{currentDim.tolerancePlus}, {currentDim.toleranceMinus > 0 ? '+' : ''}{currentDim.toleranceMinus})
            <div className="text-sm text-gray-600">{currentDim.description}</div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button 
          className={`p-2 rounded ${currentDimSample > 1 ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          onClick={handlePrevSample}
          disabled={currentDimSample <= 1}
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">
            Sample {currentDimSample} of {sampleCount}
          </label>
          <div className="flex">
            <input 
              ref={inputRef}
              id="dimension-input"
              type="number" 
              className="flex-1 p-1 border rounded-l w-20" 
              placeholder="Enter measurement"
              value={dimensionMeasurements[currentDim.code]?.[currentDimSample - 1] || ''}
              onChange={(e) => handleInputChange(e.target.value)}
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
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-2">
        <h5 className="text-sm font-medium mb-1">
          Samples for {currentDim.code}
        </h5>
        <div className="p-2 bg-gray-50 rounded border">
          <SampleIndicators
            count={sampleCount}
            currentIndex={currentDimSample - 1}
            values={dimensionMeasurements[currentDim.code]}
            getStatusClass={getSampleStatusClass}
            onSelectSample={handleSelectSample}
          />
        </div>
      </div>
    </div>
  );
};

export default DimensionInput;