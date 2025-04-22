// src/components/inspection/DimensionalChartPanel.jsx
import React, { useState } from 'react';
import { List, BarChart2, ChartLine } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useInspection } from '../../context/InspectionContext';
import { getSampleCount } from '../../utils/samplePlanHelper';

const DimensionalChartPanel = () => {
  const { state, dispatch } = useInspection();
  const { 
    dimensions,
    dimensionMeasurements, 
    sampleInfo 
  } = state;
  
  // Estado local para la visualización de gráficos
  const [chartViewMode, setChartViewMode] = useState('all'); // 'all' o 'individual'
  const [selectedDimForChart, setSelectedDimForChart] = useState(
    dimensions && dimensions.length > 0 ? dimensions[0].code : ''
  );
  
  // Colores para dimensiones
  const dimensionColors = {
    A: "#8884d8", // Purple
    B: "#82ca9d", // Green
    C: "#ffc658"  // Yellow/Orange
  };
  
  // Preparar datos para gráficos
  const getDimensionChartData = () => {
    const sampleCount = getSampleCount(sampleInfo);
    const chartData = [];
    
    for (let i = 0; i < sampleCount; i++) {
      const sampleData = { sample: i + 1 };
      
      dimensions?.forEach(dim => {
        if (dimensionMeasurements?.[dim.code]?.[i]) {
          sampleData[dim.code] = parseFloat(dimensionMeasurements[dim.code][i]);
        }
      });
      
      chartData.push(sampleData);
    }
    
    return chartData;
  };
  
  // Cambiar entre vista de gráficos (todas las dimensiones o individual)
  const handleToggleChartView = (mode) => {
    setChartViewMode(mode);
  };
  
  // Seleccionar dimensión específica para gráfico individual
  const handleSelectDimForChart = (dimCode) => {
    setSelectedDimForChart(dimCode);
  };

  return (
    <div className="dashboard-card mt-4">
      {/* Reemplazado el card-header con un report-section-title */}
      <div className="card-body">
        <h3 className="report-section-title">
          <ChartLine size={18} className="mr-2" /> Dimensional Measurements Chart
        </h3>

        <div className="mb-3 flex items-center justify-between">
          <div className="flex flex-wrap gap-3">
            {dimensions?.map((dim, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-1"
                  style={{ backgroundColor: dimensionColors[dim.code] }}
                ></div>
                <span className="text-sm font-medium">
                  {dim.code}: {dim.description}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-1 text-sm rounded flex items-center ${chartViewMode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              onClick={() => handleToggleChartView('all')}
            >
              <List size={14} className="mr-1" /> All Dimensions
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded flex items-center ${chartViewMode === 'individual' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              onClick={() => handleToggleChartView('individual')}
            >
              <BarChart2 size={14} className="mr-1" /> Individual
            </button>
          </div>
        </div>
        
        {/* Selector de dimensión individual si está en modo individual */}
        {chartViewMode === 'individual' && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2 justify-center">
              {dimensions?.map((dim) => (
                <button
                  key={dim.code}
                  className={`px-3 py-1 text-sm rounded ${selectedDimForChart === dim.code ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  onClick={() => handleSelectDimForChart(dim.code)}
                >
                  Dimension {dim.code}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Vista de gráfico */}
        <div className="chart-container" style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={getDimensionChartData()}
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
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
              
              {/* Contenido del gráfico dependiendo del modo seleccionado */}
              {chartViewMode === 'all' ? 
                // Mostrar todas las dimensiones
                dimensions?.map(dim => (
                  <Line
                    key={dim.code}
                    type="monotone"
                    dataKey={dim.code}
                    name={`${dim.code}: ${dim.description}`}
                    stroke={dimensionColors[dim.code]}
                    activeDot={{ r: 8 }}
                  />
                )) : 
                // Mostrar solo la dimensión seleccionada
                <Line
                  type="monotone"
                  dataKey={selectedDimForChart}
                  name={`${selectedDimForChart}: ${dimensions.find(d => d.code === selectedDimForChart)?.description}`}
                  stroke={dimensionColors[selectedDimForChart]}
                  activeDot={{ r: 8 }}
                />
              }
              
              {/* Líneas de referencia */}
              {chartViewMode === 'individual' && dimensions && dimensions.length > 0 && (
                <>
                  <ReferenceLine
                    y={dimensions.find(d => d.code === selectedDimForChart)?.nominal}
                    stroke={dimensionColors[selectedDimForChart]}
                    strokeDasharray="3 3"
                    label={{ 
                      value: `Nominal: ${dimensions.find(d => d.code === selectedDimForChart)?.nominal}`, 
                      position: 'right' 
                    }}
                  />
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

export default DimensionalChartPanel;