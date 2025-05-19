// src/components/report/ReportViewDashboard.jsx
import React from 'react';
import { Layers, BarChart2, CheckCircle, MapPin, Info, Settings } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { getSampleCount, getSampleLetter } from '../../utils/samplePlanHelper';
import { formatDate } from '../../utils/dateFormatter';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
  ComposedChart, Bar, LabelList, Cell
} from 'recharts';
import StaticMapReport from './StaticMapReport';
import ReportTechnicalDrawing from './ReportTechnicalDrawing';
import ReportExportOptions from './ReportExportOptions'; // Import the new component
import '../../styles/inspection-photos.css'; // Importar el CSS global para fotos

// Componente para los mini gráficos dimensionales con tamaño reducido
const DimensionMiniChart = ({ dimension, measurements, index }) => {
  // Preparar datos para el gráfico sin limitar el número de muestras
  const prepareChartData = () => {
    if (!measurements || !dimension) return [];
    
    // Usar todas las muestras disponibles sin límite
    return measurements
      .map((value, i) => {
        const parsedValue = value ? parseFloat(value) : null;
        return {
          sample: i + 1, // Ahora usamos el número de muestra en lugar del valor
          value: parsedValue,
          status: parsedValue ? (
            parsedValue >= (dimension.nominal - dimension.toleranceMinus) && 
            parsedValue <= (dimension.nominal + dimension.tolerancePlus)
          ) : null
        };
      })
      .filter(item => item.value !== null);
  };
  
  const chartData = prepareChartData();
  if (chartData.length === 0) return null;
  
  // Determinar los límites Y basados en el valor nominal y las tolerancias
  const nominal = dimension.nominal;
  const minAllowed = nominal - dimension.toleranceMinus;
  const maxAllowed = nominal + dimension.tolerancePlus;
  
  // Calcular margen para la escala Y
  const margin = Math.max(dimension.tolerancePlus, dimension.toleranceMinus) * 0.5;
  const yMin = minAllowed - margin;
  const yMax = maxAllowed + margin;
  
  // Generar paleta de colores basada en tendencias profesionales
  // Usamos colores distintos para cada cota para fácil diferenciación
  const colorPalettes = [
    ['#4364D3', '#7698FA', '#C5D3FF'], // Azul profesional
    ['#219653', '#6FCF97', '#D5F2E3'], // Verde sofisticado
    ['#9857D3', '#BC8EE9', '#E6D8F8'], // Púrpura elegante
    ['#F2994A', '#F9BC86', '#FEEBD9'], // Ámbar cálido
    ['#2F80ED', '#56CCF2', '#D0F0FD'], // Azul claro vibrante
    ['#6B7280', '#9CA3AF', '#E5E7EB']  // Gris neutral
  ];
  
  // Seleccionar paleta basada en el índice (repetir si hay más dimensiones que paletas)
  const colorIndex = index % colorPalettes.length;
  const [primaryColor, secondaryColor, lightColor] = colorPalettes[colorIndex];
  
  // Calcular estadísticas para mostrar
  const values = chartData.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length; 
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100" style={{background: 'rgba(255, 255, 255, 0.9)'}}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-sm font-bold" style={{ color: primaryColor }}>{dimension.code}</h4>
          <p className="text-xs text-gray-500 truncate" style={{ maxWidth: '120px' }}>{dimension.description}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium">{nominal.toFixed(1)}</p>
          <p className="text-xs text-gray-400">{`${dimension.tolerancePlus > 0 ? '+' : ''}${dimension.tolerancePlus}, ${dimension.toleranceMinus > 0 ? '+' : ''}${dimension.toleranceMinus}`}</p>
        </div>
      </div>
      
      <div style={{ height: '80px', position: 'relative', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '4px' }}>
        {/* Añadir stats dentro del área del gráfico */}
        <div 
          style={{ 
            position: 'absolute', 
            top: '6px', 
            right: '8px', 
            background: 'rgba(255,255,255,0.95)', 
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '9px',
            border: '1px solid rgba(0,0,0,0.05)',
            zIndex: 10,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <span style={{ color: primaryColor, fontWeight: 'bold' }}>
            Prom: {mean.toFixed(1)}
          </span>
          <span style={{ color: '#6B7280', margin: '0 4px' }}>|</span>
          <span style={{ color: '#3B82F6' }}>
            Min: {min.toFixed(1)}
          </span>
          <span style={{ color: '#6B7280', margin: '0 4px' }}>|</span>
          <span style={{ color: '#3B82F6' }}>
            Max: {max.toFixed(1)}
          </span>
        </div>
        
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 15, right: 10, bottom: 15, left: 10 }}
            className="dimension-chart"
          >
            <defs>
              <linearGradient id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={lightColor} stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="sample" 
              tick={{ fontSize: 8 }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              tickFormatter={value => `M${value}`}
            />
            <YAxis 
              domain={[yMin, yMax]} 
              tick={{ fontSize: 8 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={value => value.toFixed(1)}
              hide={true}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '4px', 
                fontSize: '10px',
                padding: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
              }}
              formatter={(value) => [value?.toFixed(2) || '0', 'Valor']}
              labelFormatter={(value) => `Muestra ${value}`}
            />
            <CartesianGrid vertical={false} strokeDasharray="2 2" stroke="#F3F4F6" />
            
            {/* Área para resaltar la zona de tolerancia */}
            <Area 
              type="monotone" 
              dataKey="value" 
              fill={`url(#colorGradient${index})`} 
              stroke="none"
              activeDot={false}
            />
            
            {/* Línea de valor nominal */}
            <ReferenceLine 
              y={nominal} 
              stroke={primaryColor} 
              strokeDasharray="3 3" 
              strokeWidth={1.5}
            />
            
            {/* Líneas de tolerancia */}
            <ReferenceLine 
              y={minAllowed} 
              stroke="#E5E7EB" 
              strokeDasharray="3 3" 
              strokeWidth={1}
            />
            <ReferenceLine 
              y={maxAllowed} 
              stroke="#E5E7EB" 
              strokeDasharray="3 3" 
              strokeWidth={1}
            />
            
            {/* Línea de valores medidos */}
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={primaryColor} 
              strokeWidth={2.5} 
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (!cx || !cy || !payload) return null;
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={4} 
                    fill={payload.status ? primaryColor : "#EF4444"} 
                    stroke="#FFFFFF" 
                    strokeWidth={1.5} 
                  />
                );
              }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "#FFFFFF" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Componente para el gráfico de coating
const CoatingChart = ({ measurements, requirements }) => {
  // Preparar datos para el gráfico
  const prepareChartData = () => {
    if (!measurements) return [];
    
    // Tomar solo valores válidos
    return measurements
      .filter(value => value !== '' && value !== null)
      .map((value, index) => ({
        reading: index + 1,
        thickness: parseFloat(value),
        status: requirements?.local ? parseFloat(value) >= requirements.local : true
      }));
  };
  
  const chartData = prepareChartData();
  if (chartData.length === 0) return null;
  
  // Calcular estadísticas
  const values = chartData.map(d => d.thickness);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Calcular límites para el gráfico
  const minLimit = Math.max(0, min - 5);
  const maxLimit = max + 5;

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100" style={{background: 'rgba(255, 255, 255, 0.9)'}}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-sm font-bold text-blue-600">Coating Thickness</h4>
          <p className="text-xs text-gray-500">Local measurements (µm)</p>
        </div>
        <div className="text-right flex items-center">
          <div className="bg-gray-50 rounded px-2 py-1 mr-2">
            <p className="text-xs font-medium">Mean: <span className="text-blue-600">{mean.toFixed(1)}</span></p>
          </div>
          <Info size={14} className="text-gray-400" />
        </div>
      </div>
      
      <div style={{ height: '150px', position: 'relative', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '4px' }}>
        {/* Añadir stats dentro del área del gráfico */}
        <div 
          style={{ 
            position: 'absolute', 
            top: '6px', 
            right: '8px', 
            background: 'rgba(255,255,255,0.95)', 
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '9px',
            border: '1px solid rgba(0,0,0,0.05)',
            zIndex: 10,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <span style={{ color: '#EF4444', fontWeight: 'bold' }}>
            Req: {requirements?.local || 'N/A'}
          </span>
          <span style={{ color: '#6B7280', margin: '0 4px' }}>|</span>
          <span style={{ color: '#3B82F6' }}>
            Min: {min.toFixed(1)}
          </span>
          <span style={{ color: '#6B7280', margin: '0 4px' }}>|</span>
          <span style={{ color: '#3B82F6' }}>
            Max: {max.toFixed(1)}
          </span>
        </div>
        
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 15, right: 5, bottom: 5, left: 5 }}
          >
            <defs>
              <linearGradient id="coatingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#93C5FD" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="reading" 
              tick={{ fontSize: 9 }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              domain={[minLimit, maxLimit]} 
              tick={{ fontSize: 8 }}
              tickLine={false}
              axisLine={false}
              label={{ 
                value: 'µm', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 9, fill: '#9CA3AF' } 
              }}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '4px', 
                fontSize: '10px',
                padding: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
              }}
              formatter={(value) => [value?.toFixed(1) + ' µm' || '0 µm', 'Thickness']}
              labelFormatter={(label) => label ? `Reading ${label}` : 'Reading'}
            />
            <CartesianGrid vertical={false} strokeDasharray="2 2" stroke="#F3F4F6" />
            
            {/* Área para resaltar la zona válida */}
            <Area 
              type="monotone" 
              dataKey="thickness" 
              fill="url(#coatingGradient)" 
              stroke="none"
              activeDot={false}
            />
            
            {/* Línea de requerimiento mínimo local */}
            {requirements?.local && (
              <ReferenceLine 
                y={requirements.local} 
                stroke="#EF4444" 
                strokeDasharray="3 3" 
                label={{ 
                  value: `Min: ${requirements.local} µm`,
                  position: 'right',
                  fill: '#EF4444',
                  fontSize: 9
                }}
              />
            )}
            
            {/* Línea de media */}
            <ReferenceLine 
              y={mean} 
              stroke="#3B82F6" 
              strokeDasharray="3 3" 
              label={{ 
                value: `Avg: ${mean.toFixed(1)} µm`,
                position: 'right',
                fill: '#3B82F6',
                fontSize: 9
              }}
            />
            
            {/* Barras de mediciones */}
            <Bar 
              dataKey="thickness" 
              barSize={10} 
              radius={[5, 5, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`coating-cell-${index}`} 
                  fill={entry.status ? '#3B82F6' : '#EF4444'} 
                />
              ))}
              <LabelList dataKey="thickness" position="top" style={{ fontSize: 8, fill: '#6B7280' }} formatter={(value) => value.toFixed(1)} />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Componente principal
const ReportViewDashboard = () => {
  const { state } = useInspection();
  
  const {
    componentName,
    componentFamily,
    componentCode,
    inspector,
    inspectionDate,
    batchQuantity,
    sampleInfo,
    inspectionStatus,
    dimensions,
    dimensionMeasurements,
    dimensionNonConformities,
    coatingRequirements,
    meanCoating,
    localCoatingMeasurements,
    visualConformity,
    visualNotes,
    photos,
    measurementEquipment,
    projectName,
    client,
    surfaceProtection,
    specialCoating,
    thickness,
    inspectionCountry,
    inspectionCity,
    inspectionSite,
    inspectionAddress,
    mapCoords
  } = state;
  
  const renderStatusBadge = (status) => {
    if (status === 'pass') {
      return <span className="badge badge-success">ACCEPTED</span>;
    } else if (status === 'reject') {
      return <span className="badge badge-danger">REJECTED</span>;
    }
    return <span className="badge badge-warning">IN PROGRESS</span>;
  };
  
  const getTotalNonConformities = () => {
    return Object.values(dimensionNonConformities || {}).reduce((sum, count) => sum + count, 0);
  };
  
  return (
    <div id="report-container">
      <div className="flex justify-between items-center mb-4 no-print">
        <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
        <ReportExportOptions 
          reportData={state} 
          reportContainerId="report-container"
        />
      </div>
      
      {/* PÁGINA 1: INFORMACIÓN GENERAL */}
      <div className="pdf-page-section" data-page="1">
        {/* INSPECTION OVERVIEW CON LAYOUT SIMILAR AL SETUP */}
        <div className="dashboard-card mb-4">
          <div className="card-header" style={{background: 'linear-gradient(to right, #667eea, #764ba2)'}}>
            <div className="flex justify-between items-center">
              <h3 className="card-title text-white">Inspection Overview</h3>
              <div>
                {renderStatusBadge(inspectionStatus)}
              </div>
            </div>
          </div>
          
          <div className="card-body">
            {/* Two-column container similar al Setup */}
            <div className="cards-grid-2">
              {/* LEFT COLUMN: Component Information */}
              <div className="dashboard-card">
                <div className="card-header" style={{background: 'linear-gradient(to right, #5a67d8, #6875f5)'}}>
                  <h3 className="card-title text-white">
                    Component Information
                  </h3>
                </div>
                
                <div className="card-body">
                  <div className="grid gap-4">
                    
   <div className="report-info-item">
      <span className="report-info-label">Client</span>
      <span className="report-info-value">{client || "Valmont Solar"}</span>
    </div>
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Project Name</span>
                      <span className="report-info-value">{projectName || "NEPI"}</span>
                    </div>
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Component Family</span>
                      <span className="report-info-value">{componentFamily || "TORQUE TUBES"}</span>
                    </div>
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Component Code</span>
                      <span className="report-info-value">{componentCode || "ttg45720"}</span>
                    </div>
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Component Name</span>
                      <span className="report-info-value">{componentName || "Torque tube 140x100x3.5mm"}</span>
                    </div>
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Surface Protection</span>
                      <span className="report-info-value">{surfaceProtection || "Z275 - According to EN 10346:2015"}</span>
                    </div>
                    
                    {surfaceProtection === 'ISO1461' && (
                      <div className="report-info-item">
                        <span className="report-info-label">Material Thickness</span>
                        <span className="report-info-value">{thickness || "2.0"} mm</span>
                      </div>
                    )}
                    
                    {surfaceProtection === 'special coating' && (
                      <div className="report-info-item">
                        <span className="report-info-label">Special Coating Value</span>
                        <span className="report-info-value">{specialCoating || "45"} µm</span>
                      </div>
                    )}
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Batch Quantity</span>
                      <span className="report-info-value">{batchQuantity || "280"}</span>
                    </div>
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Sampling Info</span>
                      <span className="report-info-value">{sampleInfo || "Letter: G - Sample: 3"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* RIGHT COLUMN: Inspection Information */}
              <div className="dashboard-card">
                <div className="card-header" style={{background: 'linear-gradient(to right, #667eea, #764ba2)'}}>
                  <h3 className="card-title text-white">
                    Inspection Information
                  </h3>
                </div>
                
                <div className="card-body">
                  <div className="grid gap-4">
                    <div className="report-info-item">
                      <span className="report-info-label">Inspector Name</span>
                      <span className="report-info-value">{inspector || "John Smith"}</span>
                    </div>
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Inspection Date</span>
                      <span className="report-info-value">
                        {inspectionDate ? formatDate(inspectionDate) : new Date().toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Inspection Location</span>
                      <span className="report-info-value">
                        {inspectionCity && inspectionCountry ? `${inspectionCity}, ${inspectionCountry}` : "Madrid, Spain"}
                      </span>
                    </div>
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Site Name</span>
                      <span className="report-info-value">{inspectionSite || "Factory 3"}</span>
                    </div>
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Address</span>
                      <span className="report-info-value">{inspectionAddress || "Calle Mayor 123, Madrid"}</span>
                    </div>
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Final Result</span>
                      <span className="report-info-value">
                        {renderStatusBadge(inspectionStatus)}
                        <span className="ml-2 text-sm text-gray-500">
                          Non-Conformities: <span className={getTotalNonConformities() > 0 ? "text-red-600 font-bold" : ""}>
                            {getTotalNonConformities()}
                          </span>
                        </span>
                      </span>
                    </div>
                    
                    {/* Mapa estático */}
                    <div>
                      <span className="report-info-label">Location Map</span>
                      <StaticMapReport coords={mapCoords} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Equipment Section para la primera página */}
        <div className="report-section">
          <h3 className="report-section-title" style={{ color: '#3D4A5C', background: 'rgba(249, 250, 251, 0.8)', padding: '0.5rem', borderRadius: '0.25rem' }}>
            <Settings size={18} style={{ marginRight: '0.5rem' }} /> Measurement Equipment
          </h3>
          <div className="dashboard-card">
            <div className="card-body">
              {measurementEquipment && measurementEquipment.length > 0 ? (
                <div className="space-y-1">
                  {measurementEquipment.map((equip, index) => (
                    <p key={index}>
                      <span className="font-medium">Tool {index + 1}:</span> {equip.toolType || "Coating Meter"} - {equip.toolId || `CM-${789 + index}`}
                    </p>
                  ))}
                </div>
              ) : (
                <p>No measurement equipment recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PÁGINA 2: DIBUJO TÉCNICO Y MEDICIONES DIMENSIONALES */}
      <div className="pdf-page-section" data-page="2">
        {/* Utilizamos el componente especializado ReportTechnicalDrawing */}
        <ReportTechnicalDrawing />
        
        <div className="report-section">
          <h3 className="report-section-title" style={{ color: '#3D4A5C', background: 'rgba(249, 250, 251, 0.8)', padding: '0.5rem', borderRadius: '0.25rem' }}>
            <Layers size={18} style={{ marginRight: '0.5rem' }} /> Dimensional Measurements
          </h3>
          
          {dimensions && dimensions.length > 0 ? (
            <>
              <div className="dashboard-card">
                <div className="card-body p-0">
                  <div>
                    <table className="data-table w-full" style={{ fontSize: '0.75rem' }}>
                      <thead>
                        <tr>
                          <th className="text-center">Sample</th>
                          {dimensions.map((dim) => (
                            <th key={dim.code} className="text-center">
                              <div>{dim.code}: {dim.description}</div>
                              <div className="text-xs">
                                {dim.nominal} mm ({dim.tolerancePlus > 0 ? '+' : ''}{dim.tolerancePlus}, {dim.toleranceMinus > 0 ? '+' : ''}{dim.toleranceMinus})
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: getSampleCount(sampleInfo) || 3 }).map((_, sampleIndex) => (
                          <tr key={sampleIndex}>
                            <td className="font-medium text-center">Sample {sampleIndex + 1}</td>
                            {dimensions.map((dim) => {
                              const value = dimensionMeasurements?.[dim.code]?.[sampleIndex] || "-";
                              const isValid = value !== "-" && (
                                parseFloat(value) >= (dim.nominal - dim.toleranceMinus) &&
                                parseFloat(value) <= (dim.nominal + dim.tolerancePlus)
                              );
                              
                              return (
                                <td 
                                  key={dim.code} 
                                  className={`text-center ${value !== "-" && !isValid ? 'text-red-600 font-medium bg-red-50' : ''}`}
                                >
                                  {value}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              {/* Mini Gráficos Dimensionales - MEJORADOS */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-500">Dimensional Analysis Charts</h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px',
                  width: '100%'
                }}>
                  {dimensions.map((dim, index) => (
                    <div key={dim.code} style={{width: '100%'}}>
                      <DimensionMiniChart 
                        dimension={dim} 
                        measurements={dimensionMeasurements?.[dim.code]} 
                        index={index}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="dashboard-card">
              <div className="card-body text-center text-gray-500">
                No dimensional data available.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PÁGINA 3: COATING Y INSPECCIÓN VISUAL */}
      <div className="pdf-page-section" data-page="3">
        <div className="report-section">
          <h3 className="report-section-title" style={{ color: '#3D4A5C', background: 'rgba(249, 250, 251, 0.8)', padding: '0.5rem', borderRadius: '0.25rem' }}>
            <BarChart2 size={18} style={{ marginRight: '0.5rem' }} /> Coating Measurements
          </h3>
          <div className="dashboard-card">
            <div className="card-body">
              {/* Tabla de recubrimiento */}
              <table className="data-table mb-4">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Measured</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-medium">Mean</td>
                    <td>{coatingRequirements?.mean || "-"} µm</td>
                    <td>{meanCoating || "-"} µm</td>
                    <td>
                      {meanCoating && coatingRequirements?.mean && parseFloat(meanCoating) >= coatingRequirements.mean ? (
                        <span className="badge badge-success">PASS</span>
                      ) : meanCoating ? (
                        <span className="badge badge-danger">FAIL</span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
              
              {/* Gráfico de recubrimiento - MEJORADO */}
              {localCoatingMeasurements && localCoatingMeasurements.filter(v => v).length > 0 && (
                <CoatingChart 
                  measurements={localCoatingMeasurements} 
                  requirements={coatingRequirements}
                />
              )}
            </div>
          </div>
        </div>
        
        <div className="report-section">
          <h3 className="report-section-title" style={{ color: '#3D4A5C', background: 'rgba(249, 250, 251, 0.8)', padding: '0.5rem', borderRadius: '0.25rem' }}>
            <CheckCircle size={18} style={{ marginRight: '0.5rem' }} /> Visual Inspection
          </h3>
          <div className="dashboard-card">
            <div className="card-body">
              <div className="mb-4">
                <span className="report-info-label">Result</span>
                <div className="mt-2">
                  {visualConformity === 'conforming' ? (
                    <span className="badge badge-success">CONFORMING</span>
                  ) : visualConformity === 'non-conforming' ? (
                    <span className="badge badge-danger">NON-CONFORMING</span>
                  ) : (
                    <span className="badge badge-warning">NOT EVALUATED</span>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <span className="report-info-label">Notes</span>
                <p className="mt-2">{visualNotes || "No visual defects observed."}</p>
              </div>
              
              {/* MODIFICADO: Galería de fotos usando las clases del CSS global */}
              {(photos && photos.length > 0) && (
                <div className="mt-4">
                  <span className="report-info-label">Photos</span>
                  <div className="inspection-photo-grid-pdf">
                    {photos.map((photo, index) => (
                      <div key={index} className="inspection-photo-item-pdf">
                        <div className="inspection-photo-container">
                          <img 
                            src={photo.src} 
                            alt={`Inspection photo ${index + 1}`} 
                            className="inspection-photo-img"
                          />
                          <div className="inspection-photo-caption">
                            Photo {index + 1}
                            {photo.dimensions && ` • ${photo.dimensions}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="report-footer p-4">
            <div>
              <p className="font-bold">VALMONT SOLAR</p>
            </div>
            <div>
              <p className="font-medium">
                Final Result: {renderStatusBadge(inspectionStatus)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estilos para tabla transpuesta */}
      <style jsx global>{`
        /* Estilos para tabla transpuesta */
        .data-table {
          table-layout: fixed;
          width: 100%;
          border-collapse: collapse;
        }
        
        .data-table th, .data-table td {
          padding: 4px;
          font-size: 0.75rem;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .data-table th {
          background-color: #f3f4f6;
        }
        
        .data-table tr:nth-child(even) td {
          background-color: #f9fafb;
        }
        
        /* Estilos para gráficos densos */
        .dimension-chart .recharts-dot {
          r: 2;
        }
        
        .dimension-chart .recharts-line-curve {
          stroke-width: 1.5;
        }
        
        /* Estilos para títulos de sección */
        .report-section-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          padding-bottom: 0.625rem;
          border-bottom: 1px solid #e5e7eb;
          background-color: rgba(249, 250, 251, 0.8);
          padding: 0.5rem;
          border-radius: 0.25rem;
          color: #3D4A5C;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        @media print {
          body {
            font-size: 10pt;
            margin: 0;
            padding: 0;
          }
          
          .dashboard-card {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .btn, .card-options {
            display: none !important;
          }
          
          .report-section {
            margin-bottom: 10mm;
            page-break-inside: avoid;
          }
          
          .report-section-title {
            font-size: 12pt;
            color: #000 !important;
            border-bottom: 1px solid #000;
          }
          
          .data-table th, .data-table td {
            padding: 2mm;
            font-size: 8pt;
          }
          
          .grid-cols-3 {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          
          img {
            max-width: 50mm !important;
          }
        }
        
        /* Clases para manejo de páginas PDF */
        .pdf-page-section {
          page-break-before: always;
          page-break-after: always;
          break-before: page;
          break-after: page;
          min-height: 100vh;
          padding: 20px;
          background: white;
        }
        
        .pdf-page-section:first-child {
          page-break-before: avoid;
          break-before: avoid;
        }
        
        /* Evitar que ciertos elementos se corten */
        .dashboard-card,
        .inspection-photo-container,
        .dimension-mini-chart {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Grid específico para fotos en PDF */
        .inspection-photo-grid-pdf {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        
        .inspection-photo-item-pdf {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Ocultar controles en PDF */
        .no-print {
          display: block;
        }
        
        /* Estilos para impresión específicos */
        @media print {
          .no-print {
            display: none !important;
          }
          
          .pdf-page-section {
            page-break-before: always;
            page-break-after: always;
            min-height: 100vh;
          }
          
          .pdf-page-section:first-child {
            page-break-before: avoid;
          }
          
          body {
            font-size: 10pt;
            margin: 0;
            padding: 0;
          }
          
          .dashboard-card {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .report-section {
            margin-bottom: 10mm;
            page-break-inside: avoid;
          }
          
          .report-section-title {
            font-size: 12pt;
            color: #000 !important;
            border-bottom: 1px solid #000;
          }
          
          .data-table th, .data-table td {
            padding: 2mm;
            font-size: 8pt;
          }
          
          .inspection-photo-grid-pdf {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          .inspection-photo-item-pdf img {
            max-width: 80mm !important;
            max-height: 60mm !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportViewDashboard;
