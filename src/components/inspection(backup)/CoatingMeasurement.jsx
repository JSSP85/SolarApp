// src/components/inspection/CoatingMeasurement.jsx
import React, { useRef } from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { getSampleCount } from '../../utils/samplePlanHelper';
import { isCoatingValueValid } from '../../utils/coatingCalculations';
import SampleIndicators from '../common/SampleIndicators';
import CoatingStats from './CoatingStats';

/**
 * Componente para mediciones de recubrimiento
 */
const CoatingMeasurement = () => {
  const { state, dispatch } = useInspection();
  const inputRef = useRef(null);
  
  const { 
    currentCoatingSample,
    localCoatingMeasurements,
    meanCoating,
    coatingStats,
    coatingRequirements,
    sampleInfo
  } = state;
  
  // Obtener recuento de muestras
  const sampleCount = getSampleCount(sampleInfo);
  
  // Manejar avance a la siguiente muestra
  const handleNextSample = () => {
    const currentValue = inputRef.current?.value;
    
    dispatch({
      type: 'NEXT_COATING_SAMPLE',
      payload: { value: currentValue }
    });
  };
  
  // Manejar retroceso a la muestra anterior
  const handlePrevSample = () => {
    const currentValue = inputRef.current?.value;
    
    dispatch({
      type: 'PREV_COATING_SAMPLE',
      payload: { value: currentValue }
    });
  };
  
  // Manejar cambios en la entrada
  const handleInputChange = (e) => {
    dispatch({
      type: 'UPDATE_COATING_MEASUREMENT',
      payload: { 
        sampleIndex: currentCoatingSample - 1, 
        value: e.target.value 
      }
    });
  };
  
  // Manejar selección de una muestra
  const handleSelectSample = (index) => {
    // Guardar valor actual primero
    const currentValue = inputRef.current?.value;
    if (currentValue) {
      dispatch({
        type: 'UPDATE_COATING_MEASUREMENT',
        payload: { 
          sampleIndex: currentCoatingSample - 1, 
          value: currentValue 
        }
      });
    }
    
    dispatch({
      type: 'SET_COATING_SAMPLE',
      payload: index + 1
    });
  };
  
  // Obtener clase de estado para una muestra de recubrimiento
  const getCoatingSampleStatus = (sampleIndex) => {
    const localValue = localCoatingMeasurements[sampleIndex];
    
    // Si el valor no está completado, no está completo
    if (!localValue || localValue === '') 
      return sampleIndex + 1 === currentCoatingSample ? 'bg-blue-500 text-white' : 'bg-gray-200';
    
    // Si el valor es inválido, marcar como fallido
    if (!isCoatingValueValid('local', localValue, coatingRequirements))
      return 'bg-red-500 text-white';
    
    // Todo bien
    return 'bg-green-500 text-white';
  };
  
  // Verificar si hay requisitos de recubrimiento disponibles
  if (!coatingRequirements) {
    return (
      <div className="border rounded p-4 bg-white mt-4">
        <h3 className="font-bold mb-4">Coating Measurement</h3>
        <p>Surface protection must be selected to enable coating measurements.</p>
      </div>
    );
  }
  
  return (
    <div className="border rounded p-4 bg-white mt-4">
      <h3 className="font-bold mb-4">Coating Measurement</h3>
      
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <span className="text-sm font-medium mr-2">Mean Coating (Auto-calculated):</span>
          <span className="font-bold">{meanCoating || '-'} µm</span>
          <div className="ml-2 text-xs bg-blue-100 text-blue-700 p-1 rounded flex items-center">
            <Info size={14} className="mr-1" />
            Calculated as average of all Local Coating measurements
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Minimum required: {coatingRequirements.mean} µm
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <div className="mb-2">
            <span className="text-sm font-medium">Minimum required (Local): {coatingRequirements.local} µm</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className={`p-2 rounded ${currentCoatingSample > 1 ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              onClick={handlePrevSample}
              disabled={currentCoatingSample <= 1}
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Local Coating - Sample {currentCoatingSample} of {sampleCount}
              </label>
              <div className="flex">
                <input 
                  ref={inputRef}
                  id="local-coating-input"
                  type="number" 
                  className="flex-1 p-1 border rounded-l w-20" 
                  placeholder="Enter local coating measurement"
                  value={localCoatingMeasurements[currentCoatingSample - 1] || ''}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleNextSample();
                    }
                  }}
                  step="0.1"
                  min="0"
                />
                <button 
                  className="bg-green-600 text-white px-3 py-2 rounded-r"
                  onClick={handleNextSample}
                  disabled={currentCoatingSample >= sampleCount}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium mb-2">Sample Progress</h4>
        <SampleIndicators
          count={sampleCount}
          currentIndex={currentCoatingSample - 1}
          values={localCoatingMeasurements}
          getStatusClass={getCoatingSampleStatus}
          onSelectSample={handleSelectSample}
        />
      </div>
      
      {coatingStats?.readings > 0 && (
        <CoatingStats stats={coatingStats} />
      )}
    </div>
  );
};

export default CoatingMeasurement;