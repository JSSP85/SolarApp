// src/components/report/DimensionalReport.jsx
import React from 'react';
import { useInspection } from '../../context/InspectionContext';
import { getSampleCount, getSampleLetter } from '../../utils/samplePlanHelper';
import { isDimensionValueValid } from '../../utils/dimensionCalculations';

/**
 * Componente para mostrar reporte de mediciones dimensionales por step
 */
const DimensionalReport = () => {
  const { state } = useInspection();
  const { 
    dimensionMeasurements, 
    sampleInfo, 
    inspectionStep,
    dimensions,
    totalNonConformities
  } = state;
  
  if (!dimensions || dimensions.length === 0) {
    return <div>No dimensional data available.</div>;
  }
  
  const sampleCount = getSampleCount(sampleInfo);
  const steps = ['first', 'second', 'third', 'fourth', 'fifth'];
  
  // Función para verificar si un step tiene datos
  const hasDataForStep = (stepIndex) => {
    return dimensions.some(dim => {
      const startIndex = stepIndex * sampleCount;
      const endIndex = startIndex + sampleCount;
      return dimensionMeasurements[dim.code]?.slice(startIndex, endIndex).some(value => value !== '');
    });
  };
  
  // Función para contar no conformidades para un step específico
  const countStepNonConformities = (dimCode, stepIndex) => {
    const dimension = dimensions.find(d => d.code === dimCode);
    if (!dimension) return 0;
    
    const startIndex = stepIndex * sampleCount;
    const stepMeasurements = dimensionMeasurements[dimCode]?.slice(startIndex, startIndex + sampleCount) || [];
    let stepNonConformities = 0;
    
    stepMeasurements.forEach(value => {
      if (value && value !== '') {
        if (!isDimensionValueValid(dimension, value)) {
          stepNonConformities++;
        }
      }
    });
    
    return stepNonConformities;
  };
  
  return (
    <div className="mb-6">
      <h3 className="font-bold mb-2">Dimensional Measurements</h3>
      
      {/* Mostrar mediciones por step */}
      {steps.map((step, stepIndex) => {
        // Verificar si este step tiene datos
        if (!hasDataForStep(stepIndex)) return null;
        
        return (
          <div key={step} className="mb-4">
            <h4 className="font-medium mb-2 bg-gray-100 p-2 rounded">
              Step {step.charAt(0).toUpperCase() + step.slice(1)} Measurements
            </h4>
            <div className="overflow-x-auto">
              {sampleCount > 8 ? (
                // Vista compacta para muchas muestras
                <div className="space-y-4">
                  {dimensions.map((dim, index) => {
                    // Obtener solo las mediciones para este step
                    const startIndex = stepIndex * sampleCount;
                    const stepMeasurements = dimensionMeasurements[dim.code]?.slice(startIndex, startIndex + sampleCount) || [];
                    
                    // Contar no conformidades para este step específico
                    const stepNonConformities = countStepNonConformities(dim.code, stepIndex);
                    
                    // Si no hay datos para esta dimensión en este step, no mostrar
                    if (stepMeasurements.every(m => m === '')) return null;
                    
                    return (
                      <div key={index} className="border rounded overflow-hidden">
                        <div className="bg-gray-100 p-1 font-medium text-sm">
                          Dimension {dim.code}: {dim.nominal} mm ({dim.tolerancePlus > 0 ? '+' : ''}{dim.tolerancePlus}, {dim.toleranceMinus > 0 ? '+' : ''}{dim.toleranceMinus}) - {dim.description}
                        </div>
                        <div className="p-1">
                          <div className="grid grid-cols-8 gap-1 text-xs">
                            {stepMeasurements.map((value, i) => (
                              <div key={i} className="text-center">
                                <div className="font-medium text-xs">{i+1}</div>
                                <div className={`border p-0.5 rounded ${!isDimensionValueValid(dim, value) && value ? 'bg-red-50 text-red-800' : 'bg-gray-50'}`}>
                                  {value || "-"}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-1 text-right text-sm">
                            <span className="font-medium">Conformity:</span> 
                            <span className={`ml-1 ${stepNonConformities === 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {stepNonConformities === 0 ? 'CONFORMING' : 'NON-CONFORMING'}
                            </span>
                            {stepNonConformities > 0 && (
                              <span className="ml-1 text-red-600 font-bold">
                                ({stepNonConformities} non-conformities)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Vista de tabla estándar para pocas muestras
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-1 text-left">Dim</th>
                      <th className="border p-1 text-left">Nominal</th>
                      {Array.from({ length: sampleCount }).map((_, i) => (
                        <th key={i} className="border p-1 text-center">{i+1}</th>
                      ))}
                      <th className="border p-1 text-left">Conformity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dimensions.map((dim, index) => {
                      // Obtener solo las mediciones para este step
                      const startIndex = stepIndex * sampleCount;
                      const stepMeasurements = dimensionMeasurements[dim.code]?.slice(startIndex, startIndex + sampleCount) || [];
                      
                      // Contar no conformidades para este step específico
                      const stepNonConformities = countStepNonConformities(dim.code, stepIndex);
                      
                      // Si no hay datos para esta dimensión en este step, no mostrar
                      if (stepMeasurements.every(m => m === '')) return null;
                      
                      return (
                        <tr key={index}>
                          <td className="border p-1">{dim.code}</td>
                          <td className="border p-1 text-xs">
                            {dim.nominal} ({dim.tolerancePlus > 0 ? '+' : ''}{dim.tolerancePlus}, {dim.toleranceMinus > 0 ? '+' : ''}{dim.toleranceMinus})
                          </td>
                          {stepMeasurements.map((value, i) => (
                            <td key={i} className={`border p-1 text-center ${!isDimensionValueValid(dim, value) && value ? 'bg-red-50 text-red-800' : ''}`}>
                              {value || "-"}
                            </td>
                          ))}
                          <td className="border p-1">
                            <span className={`font-medium ${stepNonConformities === 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {stepNonConformities === 0 ? 'CONFORMING' : 'NON-CONFORMING'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      })}
      
      <div className="mt-4 p-3 bg-gray-50 rounded border">
        <h4 className="font-medium mb-2">ISO 2859-1 Inspection Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span className="font-medium">Total Non-conformities:</span> 
              <span className={`${totalNonConformities > 0 ? 'text-red-600 font-bold' : 'font-bold'}`}>
                {totalNonConformities}
              </span>
            </p>
          </div>
          <div>
            <p><span className="font-medium">Sample Letter:</span> {getSampleLetter(sampleInfo)}</p>
          </div>
          <div>
            <p><span className="font-medium">Current Step:</span> {inspectionStep.charAt(0).toUpperCase() + inspectionStep.slice(1)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DimensionalReport;