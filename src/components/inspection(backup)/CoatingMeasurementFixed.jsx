// src/components/inspection/CoatingMeasurementFixed.jsx
import React from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { getSampleCount } from '../../utils/samplePlanHelper';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const CoatingMeasurementFixed = () => {
  const { state, dispatch } = useInspection();
  const { 
    coatingRequirements, 
    meanCoating, 
    localCoatingMeasurements, 
    sampleInfo,
    currentCoatingSample,
    coatingStats
  } = state;
  
  const sampleCount = getSampleCount(sampleInfo);
  
  // Función para obtener el estado visual de una muestra de revestimiento
  const getCoatingSampleStatus = (sampleIndex) => {
    const localValue = localCoatingMeasurements?.[sampleIndex];
    
    // Si el valor no está rellenado, no está completo
    if (!localValue || localValue === '') 
      return sampleIndex + 1 === currentCoatingSample ? 'bg-blue-500 text-white' : 'bg-gray-200';
    
    // Si el valor es inválido, marcar como fallado
    if (parseFloat(localValue) < (coatingRequirements?.local || 0))
      return 'bg-red-500 text-white';
    
    // Todo bien
    return 'bg-green-500 text-white';
  };
  
  // Actualizar medición de revestimiento
  const handleUpdateLocalCoating = (index, value) => {
    dispatch({
      type: 'UPDATE_COATING_MEASUREMENT',
      payload: { sampleIndex: index, value: value }
    });
  };
  
  // Avanzar a la siguiente muestra
  const handleNextCoatingSample = () => {
    const inputValue = document.querySelector('#local-coating-input')?.value;
    dispatch({
      type: 'NEXT_COATING_SAMPLE',
      payload: { value: inputValue }
    });
  };
  
  // Retroceder a la muestra anterior
  const handlePrevCoatingSample = () => {
    const inputValue = document.querySelector('#local-coating-input')?.value;
    dispatch({
      type: 'PREV_COATING_SAMPLE',
      payload: { value: inputValue }
    });
  };
  
  // Seleccionar muestra específica
  const handleSelectCoatingSample = (index) => {
    const currentValue = document.querySelector('#local-coating-input')?.value;
    
    // Guardar valor actual primero
    if (currentValue) {
      handleUpdateLocalCoating(currentCoatingSample - 1, currentValue);
    }
    
    dispatch({
      type: 'SET_COATING_SAMPLE',
      payload: index + 1
    });
  };
  
  // Preparar datos para gráfico de línea
  const getCoatingLineChartData = () => {
    return localCoatingMeasurements
      .filter(value => value !== '')
      .map((value, index) => ({
        reading: index + 1,
        thickness: parseFloat(value)
      }));
  };
  
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
          Minimum required: {coatingRequirements?.mean || '-'} µm
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <div className="mb-2">
            <span className="text-sm font-medium">Minimum required (Local): {coatingRequirements?.local || '-'} µm</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className={`p-2 rounded ${currentCoatingSample > 1 ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              onClick={handlePrevCoatingSample}
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
                  id="local-coating-input"
                  type="number" 
                  className="flex-1 p-1 border rounded-l w-20" 
                  placeholder="Enter local coating measurement"
                  value={localCoatingMeasurements?.[currentCoatingSample - 1] || ''}
                  onChange={(e) => handleUpdateLocalCoating(currentCoatingSample - 1, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleNextCoatingSample();
                    }
                  }}
                  step="0.1"
                  min="0"
                />
                <button 
                  className="bg-green-600 text-white px-3 py-2 rounded-r"
                  onClick={handleNextCoatingSample}
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
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: sampleCount }).map((_, index) => {
            const localValue = localCoatingMeasurements?.[index];
            
            return (
              <button
                key={index}
                className={`flex flex-col items-center p-1 rounded text-xs
                  ${getCoatingSampleStatus(index)} 
                  ${index + 1 === currentCoatingSample ? 'ring-2 ring-blue-400' : ''}`}
                onClick={() => handleSelectCoatingSample(index)}
              >
                <span className="font-bold">{index + 1}</span>
                {localValue && (
                  <span className="text-xs">
                    {localValue}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {coatingStats?.readings > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Coating Statistics</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-1 text-left"># Readings</th>
                  <th className="border p-1 text-left">Mean</th>
                  <th className="border p-1 text-left">Maximum</th>
                  <th className="border p-1 text-left">Minimum</th>
                  <th className="border p-1 text-left">Range</th>
                  <th className="border p-1 text-left">Std Deviation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-1">{coatingStats.readings}</td>
                  <td className="border p-1">{coatingStats.mean} µm</td>
                  <td className="border p-1">{coatingStats.maximum} µm</td>
                  <td className="border p-1">{coatingStats.minimum} µm</td>
                  <td className="border p-1">{coatingStats.range} µm</td>
                  <td className="border p-1">{coatingStats.stdDeviation} µm</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Gráfico de revestimiento */}
          <div className="mt-4">
            <div className="rounded border overflow-hidden">
              <div className="bg-gray-100 p-2 font-medium">Thickness (μm)</div>
              <div className="p-2 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getCoatingLineChartData()}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="reading" 
                      label={{ value: 'Reading #', position: 'insideBottom', offset: -5 }} 
                    />
                    <YAxis
                      label={{ value: 'Thickness (μm)', angle: -90, position: 'insideLeft' }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="thickness"
                      stroke="#0047AB"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                    <ReferenceLine y={coatingRequirements?.local || 0} stroke="red" strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoatingMeasurementFixed;