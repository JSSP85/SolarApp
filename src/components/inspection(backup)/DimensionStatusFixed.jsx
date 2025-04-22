// src/components/inspection/DimensionStatusFixed.jsx
import React from 'react';
import { useInspection } from '../../context/InspectionContext';
import { getSampleCount } from '../../utils/samplePlanHelper';

const DimensionStatusFixed = () => {
  const { state, dispatch } = useInspection();
  const { 
    dimensions, 
    currentDimension, 
    dimensionNonConformities, 
    totalSamplesChecked, 
    completedDimensions, 
    selectedHistoryDim,
    dimensionMeasurements,
    currentDimSample,
    sampleInfo
  } = state;
  
  const sampleCount = getSampleCount(sampleInfo);
  
  // Función para determinar el estado visual de una muestra dimensional
  const getDimensionSampleStatus = (dimCode, sampleIndex) => {
    const value = dimensionMeasurements?.[dimCode]?.[sampleIndex];
    
    if (!value || value === '') return 'bg-gray-200'; // No rellenado aún
    
    // Verificar si el valor está dentro de tolerancias
    const dimension = dimensions.find(d => d.code === dimCode);
    if (!dimension) return 'bg-gray-200';
    
    const numValue = parseFloat(value);
    const min = dimension.nominal - dimension.toleranceMinus;
    const max = dimension.nominal + dimension.tolerancePlus;
    
    return (numValue >= min && numValue <= max) ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
  };
  
  // Ver historial de dimensión
  const handleViewDimensionHistory = (dimIndex) => {
    dispatch({ 
      type: 'TOGGLE_DIMENSION_HISTORY', 
      payload: dimIndex 
    });
  };
  
  // Seleccionar dimensión y muestra específica
  const handleSelectDimensionSample = (dimIndex, sampleIndex) => {
    dispatch({ 
      type: 'SET_DIMENSION_SAMPLE', 
      payload: { 
        dimension: dimIndex, 
        sample: sampleIndex + 1 
      } 
    });
  };
  
  if (!dimensions || dimensions.length === 0) {
    return (
      <div className="mt-6">
        <h4 className="font-medium mb-2">Dimension Status</h4>
        <p>No dimension data available.</p>
      </div>
    );
  }
  
  return (
    <div className="border rounded p-4 bg-white mt-4">
      <h4 className="font-medium mb-2">Dimension Status</h4>
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
                    onClick={() => handleViewDimensionHistory(dimIndex)}
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
                  <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isComplete && nonConformCount === 0 ? 'bg-green-100 text-green-700' : 
                    isComplete && nonConformCount > 0 ? 'bg-red-100 text-red-700' : 
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {isComplete ? (nonConformCount === 0 ? 'CONFORMING' : 'NON-CONFORMING') : 'IN PROGRESS'}
                  </div>
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
      
      {selectedHistoryDim !== null && dimensions[selectedHistoryDim] && (
        <div className="mt-3 p-2 bg-gray-50 rounded border">
          <h5 className="text-sm font-medium mb-1">
            Samples for {dimensions[selectedHistoryDim].code}
          </h5>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: sampleCount }).map((_, index) => {
              const dimCode = dimensions[selectedHistoryDim].code;
              const value = dimensionMeasurements?.[dimCode]?.[index];
              
              return (
                <button
                  key={index}
                  className={`p-1 rounded text-xs flex flex-col items-center ${getDimensionSampleStatus(dimCode, index)}`}
                  onClick={() => handleSelectDimensionSample(selectedHistoryDim, index)}
                >
                  <span className="font-bold">{index + 1}</span>
                  <span className="text-xs">{value || "-"}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {selectedHistoryDim === null && currentDimension < dimensions.length && (
        <div className="mt-2">
          <h5 className="text-sm font-medium mb-1">
            Samples for {dimensions[currentDimension].code}
          </h5>
          <div className="p-2 bg-gray-50 rounded border">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: sampleCount }).map((_, index) => {
                const dimCode = dimensions[currentDimension].code;
                const value = dimensionMeasurements?.[dimCode]?.[index];
                
                return (
                  <button
                    key={index}
                    className={`flex flex-col items-center p-1 rounded text-xs
                      ${getDimensionSampleStatus(dimCode, index)} 
                      ${index + 1 === currentDimSample ? 'ring-2 ring-blue-400' : ''}`}
                    onClick={() => handleSelectDimensionSample(currentDimension, index)}
                  >
                    <span className="font-bold">{index + 1}</span>
                    {value && (
                      <span className="text-xs">
                        {value}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DimensionStatusFixed;