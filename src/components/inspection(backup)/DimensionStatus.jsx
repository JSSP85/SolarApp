// src/components/inspection/DimensionStatus.jsx
import React from 'react';
import { useInspection } from '../../context/InspectionContext';
import { getSampleCount } from '../../utils/samplePlanHelper';
import { getDimensionStatusClass } from '../../utils/dimensionCalculations';
import StatusBadge from '../common/StatusBadge';
import SampleIndicators from '../common/SampleIndicators';

/**
 * Componente que muestra el estado de todas las dimensiones
 */
const DimensionStatus = () => {
  const { state, dispatch } = useInspection();
  const { 
    dimensionMeasurements, 
    currentDimension,
    selectedHistoryDim,
    dimensionNonConformities,
    totalSamplesChecked,
    completedDimensions,
    sampleInfo,
    dimensions
  } = state;
  
  if (!dimensions || dimensions.length === 0) {
    return <div className="border rounded p-4 bg-white mt-4">No dimensions available</div>;
  }
  
  // Obtener recuento de muestras
  const sampleCount = getSampleCount(sampleInfo);
  
  // Manejar clic en una dimensión para ver su historial
  const handleViewHistory = (dimIndex) => {
    dispatch({ 
      type: 'TOGGLE_DIMENSION_HISTORY', 
      payload: dimIndex
    });
  };
  
  // Manejar selección de una muestra específica
  const handleSelectSample = (dimIndex, sampleIndex) => {
    dispatch({ 
      type: 'SET_DIMENSION_SAMPLE', 
      payload: { dimension: dimIndex, sample: sampleIndex + 1 }
    });
  };
  
  // Obtener clase de estado para una muestra
  const getSampleStatusClass = (dimCode) => (index) => {
    const dimension = dimensions.find(d => d.code === dimCode);
    const value = dimensionMeasurements[dimCode]?.[index];
    return getDimensionStatusClass(dimension, value);
  };
  
  return (
    <div className="border rounded p-4 bg-white mt-4">
      <h3 className="font-bold mb-4">Dimension Status</h3>
      <div className="space-y-2">
        {dimensions.map((dim, dimIndex) => {
          const nonConformCount = dimensionNonConformities[dim.code] || 0;
          const samplesChecked = totalSamplesChecked[dim.code] || 0;
          const isComplete = completedDimensions[dim.code];
          
          return (
            <div key={dimIndex} className="border p-3 rounded">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button 
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 
                      ${dimIndex === currentDimension ? 'bg-blue-500 text-white' : 
                        isComplete && nonConformCount === 0 ? 'bg-green-500 text-white' : 
                        isComplete && nonConformCount > 0 ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleViewHistory(dimIndex)}
                  >
                    {dim.code}
                  </button>
                  <div>
                    <div className="font-medium">{dim.description}</div>
                    <div className="text-xs text-gray-600">
                      {dim.nominal} mm ({dim.tolerancePlus > 0 ? '+' : ''}{dim.tolerancePlus}, {dim.toleranceMinus > 0 ? '+' : ''}{dim.toleranceMinus})
                    </div>
                  </div>
                </div>
                <div>
                  <StatusBadge 
                    status={
                      isComplete 
                        ? nonConformCount === 0 ? 'conforming' : 'non-conforming'
                        : 'in-progress'
                    }
                    text={
                      isComplete 
                        ? nonConformCount === 0 ? 'CONFORMING' : 'NON-CONFORMING'
                        : 'IN PROGRESS'
                    }
                    className="text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mt-1 text-xs text-gray-600">
                <div>
                  Non-conformities: <span className={nonConformCount > 0 ? 'text-red-600 font-bold' : ''}>{nonConformCount}</span>
                </div>
                <div>
                  Samples: {samplesChecked}/{sampleCount}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedHistoryDim !== null && selectedHistoryDim < dimensions.length && (
        <div className="mt-3 p-2 bg-gray-50 rounded border">
          <h5 className="text-sm font-medium mb-1">
            Samples for {dimensions[selectedHistoryDim].code}
          </h5>
          <SampleIndicators
            count={sampleCount}
            currentIndex={-1} // No current sample when viewing history
            values={dimensionMeasurements[dimensions[selectedHistoryDim].code]}
            getStatusClass={getSampleStatusClass(dimensions[selectedHistoryDim].code)}
            onSelectSample={(index) => handleSelectSample(selectedHistoryDim, index)}
          />
        </div>
      )}
    </div>
  );
};

export default DimensionStatus;