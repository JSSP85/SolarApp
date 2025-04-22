// src/components/charts/DimensionChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useInspection } from '../../context/InspectionContext';
import { dimensionColors } from '../../constants/dimensionData';
import { formatDimensionChartData } from '../../utils/chartDataFormatter';
import { getSampleCount } from '../../utils/samplePlanHelper';

/**
 * Componente para visualizar mediciones dimensionales en gráfico
 */
const DimensionChart = () => {
  const { state, dispatch } = useInspection();
  const { 
    chartViewMode, 
    selectedDimForChart, 
    dimensionMeasurements,
    sampleInfo,
    dimensions
  } = state;
  
  // Verificar si hay datos para mostrar
  if (!dimensions || dimensions.length === 0 || !dimensionMeasurements) {
    return (
      <div className="border rounded p-4 bg-white">
        <h3 className="font-bold mb-4">Dimensional Measurements Chart</h3>
        <p>No measurement data available.</p>
      </div>
    );
  }
  
  const sampleCount = getSampleCount(sampleInfo);
  
  // Preparar datos para el gráfico
  const chartData = formatDimensionChartData(dimensionMeasurements, sampleCount);
  
  // Cambiar modo de visualización
  const handleChartViewModeChange = (mode) => {
    dispatch({ type: 'SET_CHART_VIEW_MODE', payload: mode });
  };
  
  // Cambiar dimensión seleccionada
  const handleDimForChartChange = (dim) => {
    dispatch({ type: 'SET_SELECTED_DIM_FOR_CHART', payload: dim });
  };
  
  return (
    <div className="border rounded p-4 bg-white">
      <h3 className="font-bold mb-4">Dimensional Measurements Chart</h3>
      
      <div className="mb-2 mt-2">
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-wrap space-x-2">
            {dimensions.map((dim, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-1"
                  style={{ backgroundColor: dimensionColors[dim.code] || '#000' }}
                ></div>
                <span className="text-sm font-medium">
                  {dim.code}: {dim.description}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex border rounded overflow-hidden">
            <button 
              className={`px-3 py-1 text-sm ${chartViewMode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => handleChartViewModeChange('all')}
            >
              All Dimensions
            </button>
            <button 
              className={`px-3 py-1 text-sm ${chartViewMode === 'individual' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => handleChartViewModeChange('individual')}
            >
              Individual
            </button>
          </div>
        </div>
        
        {chartViewMode === 'individual' && (
          <div className="flex justify-center mb-3">
            <div className="flex border rounded overflow-hidden">
              {dimensions.map((dim) => (
                <button
                  key={dim.code}
                  className={`px-3 py-1 text-sm ${selectedDimForChart === dim.code ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                  onClick={() => handleDimForChartChange(dim.code)}
                >
                  Dimension {dim.code}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="h-64 bg-gray-50 border rounded">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="sample" 
                label={{ value: 'Sample', position: 'insideBottom', offset: -5 }} 
              />
              <YAxis 
                label={{ value: 'Value', angle: -90, position: 'insideLeft', offset: -5 }} 
                domain={chartViewMode === 'individual' ? ['auto', 'auto'] : [0, 'auto']}
              />
              <Tooltip />
              <Legend />
              
              {chartViewMode === 'all' ? 
                // Mostrar todas las dimensiones
                dimensions.map(dim => (
                  <Line
                    key={dim.code}
                    type="monotone"
                    dataKey={dim.code}
                    name={`${dim.code}: ${dim.description}`}
                    stroke={dimensionColors[dim.code] || '#000'}
                    activeDot={{ r: 8 }}
                  />
                )) : 
                // Mostrar solo la dimensión seleccionada
                <Line
                  type="monotone"
                  dataKey={selectedDimForChart}
                  name={`${selectedDimForChart}: ${dimensions.find(d => d.code === selectedDimForChart)?.description}`}
                  stroke={dimensionColors[selectedDimForChart] || '#000'}
                  activeDot={{ r: 8 }}
                />
              }
              
              {/* Líneas de referencia */}
              {chartViewMode === 'all' ? 
                // Líneas de referencia para todas las dimensiones
                dimensions.map(dim => (
                  <ReferenceLine
                    key={`ref-${dim.code}`}
                    y={dim.nominal}
                    stroke={dimensionColors[dim.code] || '#000'}
                    strokeDasharray="3 3"
                  />
                )) : 
                // Línea de referencia solo para la dimensión seleccionada
                <ReferenceLine
                  y={dimensions.find(d => d.code === selectedDimForChart)?.nominal}
                  stroke={dimensionColors[selectedDimForChart] || '#000'}
                  strokeDasharray="3 3"
                  label={{ 
                    value: `Nominal: ${dimensions.find(d => d.code === selectedDimForChart)?.nominal}`, 
                    position: 'right'
                  }}
                />
              }
              
              {/* Añadir líneas de tolerancia superior e inferior para vista individual */}
              {chartViewMode === 'individual' && (
                <>
                  <ReferenceLine
                    y={dimensions.find(d => d.code === selectedDimForChart)?.nominal + 
                       dimensions.find(d => d.code === selectedDimForChart)?.tolerancePlus}
                    stroke="red"
                    strokeDasharray="3 3"
                    label={{ 
                      value: `Upper: ${dimensions.find(d => d.code === selectedDimForChart)?.nominal + 
                              dimensions.find(d => d.code === selectedDimForChart)?.tolerancePlus}`, 
                      position: 'right' 
                    }}
                  />
                  <ReferenceLine
                    y={dimensions.find(d => d.code === selectedDimForChart)?.nominal - 
                       dimensions.find(d => d.code === selectedDimForChart)?.toleranceMinus}
                    stroke="red"
                    strokeDasharray="3 3"
                    label={{ 
                      value: `Lower: ${dimensions.find(d => d.code === selectedDimForChart)?.nominal - 
                              dimensions.find(d => d.code === selectedDimForChart)?.toleranceMinus}`, 
                      position: 'right' 
                    }}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DimensionChart;