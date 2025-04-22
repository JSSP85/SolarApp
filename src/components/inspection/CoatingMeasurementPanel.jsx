// src/components/inspection/CoatingMeasurementPanel.jsx
import React from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useInspection } from '../../context/InspectionContext';
import { getSampleCount } from '../../utils/samplePlanHelper';
import VoiceRecognitionButton from '../common/VoiceRecognitionButton';

const CoatingMeasurementPanel = () => {
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
  
  // Actualizar medición de revestimiento
  const handleCoatingInputChange = (value) => {
    // Si es un objeto (evento), tomar el valor; si es un string (de reconocimiento de voz), usarlo directamente
    const newValue = typeof value === 'object' ? value.target.value : value;
    
    dispatch({
      type: 'UPDATE_COATING_MEASUREMENT',
      payload: { 
        sampleIndex: currentCoatingSample - 1, 
        value: newValue 
      }
    });
  };
  
  // Función para manejar entrada por voz
  const handleVoiceResult = (recognizedValue) => {
    console.log("Valor de recubrimiento reconocido por voz:", recognizedValue);
    handleCoatingInputChange(recognizedValue);
  };
  
  // Ir a la siguiente muestra de revestimiento
  const handleNextCoatingSample = () => {
    const inputValue = document.querySelector('#local-coating-input')?.value;
    dispatch({
      type: 'NEXT_COATING_SAMPLE',
      payload: { value: inputValue }
    });
  };
  
  // Ir a la muestra anterior de revestimiento
  const handlePrevCoatingSample = () => {
    const inputValue = document.querySelector('#local-coating-input')?.value;
    dispatch({
      type: 'PREV_COATING_SAMPLE',
      payload: { value: inputValue }
    });
  };
  
  // Seleccionar muestra de revestimiento específica
  const handleSelectCoatingSample = (index) => {
    const currentValue = document.querySelector('#local-coating-input')?.value;
    
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
  
  // Obtener estado visual de muestra de revestimiento
  const getCoatingSampleStatus = (sampleIndex) => {
    const localValue = localCoatingMeasurements?.[sampleIndex];
    
    // Si el valor no está rellenado, no está completo
    if (!localValue || localValue === '') 
      return sampleIndex + 1 === currentCoatingSample ? 'bg-blue-500 text-white' : 'bg-gray-200';
    
    // Si el valor es inválido, marcar como fallado
    if (coatingRequirements?.local && parseFloat(localValue) < coatingRequirements.local)
      return 'bg-red-500 text-white';
    
    // Todo bien
    return 'bg-green-500 text-white';
  };
  
  // Preparar datos para gráfico de línea
  const getCoatingChartData = () => {
    return localCoatingMeasurements
      .filter(value => value !== '')
      .map((value, index) => ({
        reading: index + 1,
        thickness: parseFloat(value)
      }));
  };

  return (
    <div className="dashboard-card mt-4">
      <div className="card-header" style={{background: 'linear-gradient(to right, #5a67d8, #6875f5)'}}>
        <h3 className="card-title text-white">Coating Measurement</h3>
      </div>
      <div className="card-body">
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="font-medium mr-2">Mean Coating (Auto-calculated):</span>
            <span className="font-bold">{meanCoating || '-'} µm</span>
            <div className="ml-2 badge badge-info flex items-center">
              <Info size={14} className="mr-1" />
              Based on local measurements
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Minimum required: {coatingRequirements?.mean || '-'} µm
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <button 
            className={`btn ${currentCoatingSample > 1 ? 'btn-secondary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            onClick={handlePrevCoatingSample}
            disabled={currentCoatingSample <= 1}
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1">
            <label className="form-label">
              Local Coating - Sample {currentCoatingSample} of {sampleCount}
            </label>
            <div className="flex">
              <input 
                id="local-coating-input"
                type="number" 
                className="form-control rounded-r-none" 
                placeholder="Enter local coating measurement"
                value={localCoatingMeasurements?.[currentCoatingSample - 1] || ''}
                onChange={handleCoatingInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleNextCoatingSample();
                  }
                }}
                step="0.1"
                min="0"
              />
              
              {/* Botón de reconocimiento de voz */}
              <div className="flex items-center bg-gray-50 px-2 border-t border-b">
                <VoiceRecognitionButton onResultRecognized={handleVoiceResult} />
              </div>
              
              <button 
                className="btn btn-primary rounded-l-none"
                onClick={handleNextCoatingSample}
                disabled={currentCoatingSample >= sampleCount}
              >
                Next
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="form-label">Sample Progress</label>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: sampleCount }).map((_, index) => {
              const localValue = localCoatingMeasurements?.[index];
              
              return (
                <button
                  key={index}
                  className={`p-2 rounded text-xs flex flex-col items-center ${getCoatingSampleStatus(index)} 
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
          <>
            <div className="mt-4">
              <label className="form-label">Coating Statistics</label>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
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
            </div>
            
            <div className="mt-4">
              <label className="form-label">Coating Thickness Chart</label>
              <div className="chart-container" style={{ height: "200px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getCoatingChartData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
          </>
        )}
      </div>
    </div>
  );
};

export default CoatingMeasurementPanel;