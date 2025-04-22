// src/components/inspection/CoatingStats.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { useInspection } from '../../context/InspectionContext';
import { formatCoatingChartData } from '../../utils/chartDataFormatter';

/**
 * Componente para mostrar estadísticas de recubrimiento
 */
const CoatingStats = ({ stats }) => {
  const { state } = useInspection();
  const { localCoatingMeasurements, coatingRequirements } = state;
  
  // Formatear datos para el gráfico
  const chartData = formatCoatingChartData(localCoatingMeasurements);
  
  return (
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
              <td className="border p-1">{stats.readings}</td>
              <td className="border p-1">{stats.mean} µm</td>
              <td className="border p-1">{stats.maximum} µm</td>
              <td className="border p-1">{stats.minimum} µm</td>
              <td className="border p-1">{stats.range} µm</td>
              <td className="border p-1">{stats.stdDeviation} µm</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {chartData.length > 0 && (
        <div className="mt-4">
          <div className="rounded border overflow-hidden">
            <div className="bg-gray-100 p-2 font-medium">Thickness (μm)</div>
            <div className="p-2 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
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
                  {coatingRequirements?.local && (
                    <ReferenceLine 
                      y={coatingRequirements.local} 
                      stroke="red" 
                      strokeDasharray="3 3" 
                      label={{ value: `Min: ${coatingRequirements.local}`, position: 'left' }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoatingStats;