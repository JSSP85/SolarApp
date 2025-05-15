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
    coatingStats,
    surfaceProtection  // Añadido para obtener el surface protection
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
        {/* Layout en grid - contenido principal y imagen de referencia */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '1.5rem',
          minHeight: '400px'
        }}>
          {/* Columna izquierda - Todo el contenido existente */}
          <div>
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
            
            {/* Coating Statistics - movido arriba del Sample Progress */}
            {coatingStats?.readings > 0 && (
              <div className="mb-4">
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
            )}
            
            {/* Sample Progress - cambiar a layout vertical */}
            <div className="mb-4">
              <label className="form-label">Sample Progress</label>
              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: 'white',
                maxWidth: '100%'
              }}>
                {Array.from({ length: sampleCount }).map((_, index) => {
                  const localValue = localCoatingMeasurements?.[index];
                  const status = getCoatingSampleStatus(index);
                  const isActive = index + 1 === currentCoatingSample;
                  
                  return (
                    <div 
                      key={index}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr',
                        borderBottom: index < sampleCount - 1 ? '1px solid #e2e8f0' : 'none'
                      }}
                    >
                      {/* Header de la muestra */}
                      <div style={{
                        padding: '0.75rem',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        color: '#374151',
                        backgroundColor: '#f8fafc',
                        borderRight: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        Sample {index + 1}
                      </div>
                      
                      {/* Valor de la muestra */}
                      <div 
                        style={{
                          padding: '0.75rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: status.includes('bg-gray-200') ? '#e5e7eb' :
                                        status.includes('bg-green-500') ? '#10b981' :
                                        status.includes('bg-red-500') ? '#ef4444' :
                                        status.includes('bg-blue-500') ? '#3b82f6' : 'white',
                          color: status.includes('text-white') ? 'white' : '#374151',
                          boxShadow: isActive ? 'inset 0 0 0 2px #93c5fd' : 'none'
                        }}
                        onClick={() => handleSelectCoatingSample(index)}
                        onMouseEnter={(e) => {
                          if (!status.includes('bg-blue-500') && !status.includes('bg-green-500') && !status.includes('bg-red-500')) {
                            e.target.style.backgroundColor = '#f1f5f9';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!status.includes('bg-blue-500') && !status.includes('bg-green-500') && !status.includes('bg-red-500')) {
                            e.target.style.backgroundColor = status.includes('bg-gray-200') ? '#e5e7eb' : 'white';
                          }
                        }}
                      >
                        {localValue || '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Gráfico sin título (título removido) */}
            {coatingStats?.readings > 0 && (
              <div className="mt-4">
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
            )}
          </div>
          
          {/* Columna derecha - Imagen de referencia mejorada */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            height: 'fit-content'
          }}>
            {/* Título con surface protection */}
            <h4 style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              Surface Protection
            </h4>
            <p style={{
              fontSize: '0.8rem',
              fontWeight: '500',
              color: '#5a67d8',
              marginBottom: '1.5rem',
              textAlign: 'center',
              backgroundColor: '#ebf4ff',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #c3dafe'
            }}>
              {surfaceProtection || 'Not specified'}
            </p>
            
            <img 
              src="/images/coatingphoto.jpg" 
              alt="Coating measurement reference" 
              style={{
                width: '100%',
                maxWidth: '280px',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            />
            <p style={{
              marginTop: '1rem',
              fontSize: '0.8rem',
              color: '#64748b',
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              Coating measurement reference
            </p>
          </div>
        </div>
      </div>
      
      {/* Estilos responsive para pantallas pequeñas */}
      <style jsx>{`
        @media (max-width: 768px) {
          .card-body > div:first-child {
            grid-template-columns: 1fr !important;
          }
          
          .card-body > div:first-child > div:last-child {
            order: -1;
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CoatingMeasurementPanel;
