// src/components/database/DatabaseReportView.jsx
import React, { useState, useEffect } from 'react';
import { Layers, BarChart2, CheckCircle, MapPin, Info, Settings, Package } from 'lucide-react';
import { getSampleCount, getSampleLetter } from '../../utils/samplePlanHelper';
import { formatDate } from '../../utils/dateFormatter';
import { fetchDimensions } from '../../utils/googleSheetsService';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
  ComposedChart, Bar, LabelList, Cell
} from 'recharts';
import StaticMapReport from '../report/StaticMapReport';
import ReportTechnicalDrawing from '../report/ReportTechnicalDrawing';
import './DatabaseView.css';
import '../../styles/inspection-photos.css';
import './DatabaseReportView.css';

// Componente para los mini gráficos dimensionales
const DimensionMiniChart = ({ dimension, measurements, index }) => {
  const prepareChartData = () => {
    if (!measurements || !dimension) return [];
    
    return measurements
      .map((value, i) => {
        const parsedValue = value ? parseFloat(value) : null;
        return {
          sample: i + 1,
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
  
  const nominal = dimension.nominal;
  const minAllowed = nominal - dimension.toleranceMinus;
  const maxAllowed = nominal + dimension.tolerancePlus;
  
  const margin = Math.max(dimension.tolerancePlus, dimension.toleranceMinus) * 0.5;
  const yMin = minAllowed - margin;
  const yMax = maxAllowed + margin;
  
  const colorPalettes = [
    ['#4364D3', '#7698FA', '#C5D3FF'],
    ['#219653', '#6FCF97', '#D5F2E3'],
    ['#9857D3', '#BC8EE9', '#E6D8F8'],
    ['#F2994A', '#F9BC86', '#FEEBD9'],
    ['#2F80ED', '#56CCF2', '#D0F0FD'],
    ['#6B7280', '#9CA3AF', '#E5E7EB']
  ];
  
  const colorIndex = index % colorPalettes.length;
  const [primaryColor, secondaryColor, lightColor] = colorPalettes[colorIndex];
  
  const values = chartData.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length; 
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <div className="dimension-mini-chart">
      <div className="chart-header">
        <div>
          <h4 className="chart-title" style={{ color: primaryColor }}>{dimension.code}</h4>
          <p className="chart-subtitle">{dimension.description}</p>
        </div>
        <div className="chart-info">
          <p className="nominal-value">{nominal.toFixed(1)}</p>
          <p className="tolerance-value">{`${dimension.tolerancePlus > 0 ? '+' : ''}${dimension.tolerancePlus}, ${dimension.toleranceMinus > 0 ? '+' : ''}${dimension.toleranceMinus}`}</p>
        </div>
      </div>
      
      <div className="chart-container">
        <div className="chart-stats">
          <span style={{ color: primaryColor, fontWeight: 'bold' }}>
            Avg: {mean.toFixed(1)}
          </span>
          <span className="stat-separator">|</span>
          <span className="stat-value">
            Min: {min.toFixed(1)}
          </span>
          <span className="stat-separator">|</span>
          <span className="stat-value">
            Max: {max.toFixed(1)}
          </span>
        </div>
        
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 15, right: 10, bottom: 15, left: 10 }}
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
              tickFormatter={value => `S${value}`}
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
              formatter={(value) => [value?.toFixed(2) || '0', 'Value']}
              labelFormatter={(value) => `Sample ${value}`}
            />
            <CartesianGrid vertical={false} strokeDasharray="2 2" stroke="#F3F4F6" />
            
            <Area 
              type="monotone" 
              dataKey="value" 
              fill={`url(#colorGradient${index})`} 
              stroke="none"
              activeDot={false}
            />
            
            <ReferenceLine 
              y={nominal} 
              stroke={primaryColor} 
              strokeDasharray="3 3" 
              strokeWidth={1.5}
            />
            
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
  const prepareChartData = () => {
    if (!measurements) return [];
    
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
  
  const values = chartData.map(d => d.thickness);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  const minLimit = Math.max(0, min - 5);
  const maxLimit = max + 5;

  return (
    <div className="coating-chart">
      <div className="chart-header">
        <div>
          <h4 className="chart-title coating-title">Coating Thickness</h4>
          <p className="chart-subtitle">Local measurements (µm)</p>
        </div>
        <div className="chart-info with-icon">
          <div className="mean-badge">
            <p className="mean-label">Mean: <span className="mean-value">{mean.toFixed(1)}</span></p>
          </div>
          <Info size={14} className="info-icon" />
        </div>
      </div>
      
      <div className="chart-container coating-container">
        <div className="chart-stats coating-stats">
          <span className="req-value">
            Req: {requirements?.local || 'N/A'}
          </span>
          <span className="stat-separator">|</span>
          <span className="stat-value">
            Min: {min.toFixed(1)}
          </span>
          <span className="stat-separator">|</span>
          <span className="stat-value">
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
            
            <Area 
              type="monotone" 
              dataKey="thickness" 
              fill="url(#coatingGradient)" 
              stroke="none"
              activeDot={false}
            />
            
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
const DatabaseReportView = ({ inspectionData }) => {
  const [dimensions, setDimensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [technicalDrawingData, setTechnicalDrawingData] = useState(null);

  // Extraer todos los datos necesarios
  const {
    componentName,
    componentFamily,
    componentCode,
    inspector,
    inspectionDate,
    batchQuantity,
    sampleInfo,
    inspectionStatus,
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
    mapCoords,
    supplierName
  } = inspectionData;

  // Cargar dimensiones cuando se monta el componente
  useEffect(() => {
    const loadDimensions = async () => {
      if (componentCode && (!dimensions || dimensions.length === 0)) {
        try {
          console.log('Cargando dimensiones para:', componentCode);
          const fetchedDimensions = await fetchDimensions(componentCode);
          
          if (fetchedDimensions && fetchedDimensions.length > 0) {
            console.log('Dimensiones cargadas:', fetchedDimensions);
            setDimensions(fetchedDimensions);
          } else {
            console.log('No se encontraron dimensiones para el componente');
          }
        } catch (error) {
          console.error('Error cargando dimensiones:', error);
        }
      }
      setLoading(false);
    };

    loadDimensions();
  }, [componentCode, dimensions]);

  // Configurar datos para el dibujo técnico
  useEffect(() => {
    if (componentCode && componentName) {
      setTechnicalDrawingData({
        componentCode,
        componentName
      });
    }
  }, [componentCode, componentName]);

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

  if (loading) {
    return (
      <div className="database-loading">
        <div className="database-loading-spinner"></div>
        <p>Loading report data...</p>
      </div>
    );
  }
  
  return (
    <div className="database-report-wrapper">
      {/* PÁGINA 1: INFORMACIÓN GENERAL */}
      <div className="pdf-page-section" data-page="1">
        <div className="dashboard-card mb-4">
          <div className="card-header report-header">
            <div className="header-content">
              <h3 className="card-title">Inspection Overview</h3>
              <div>
                {renderStatusBadge(inspectionStatus)}
              </div>
            </div>
          </div>
          
          <div className="card-body">
            <div className="cards-grid-2">
              {/* Component Information */}
              <div className="dashboard-card">
                <div className="card-header component-header">
                  <h3 className="card-title">Component Information</h3>
                </div>
                
                <div className="card-body">
                  <div className="info-grid">
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
                      <span className="report-info-value">{componentFamily || "NA"}</span>
                    </div>
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Component Code</span>
                      <span className="report-info-value">{componentCode || "NA"}</span>
                    </div>
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Component Name</span>
                      <span className="report-info-value">{componentName || "NA"}</span>
                    </div>
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Surface Protection</span>
                      <span className="report-info-value">{surfaceProtection || "NA"}</span>
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
                      <span className="report-info-value">{batchQuantity || "NA"}</span>
                    </div>
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Sampling Info</span>
                      <span className="report-info-value">{sampleInfo || "NA"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Inspection Information */}
              <div className="dashboard-card">
                <div className="card-header inspection-header">
                  <h3 className="card-title">Inspection Information</h3>
                </div>
                
                <div className="card-body">
                  <div className="info-grid">
                    <div className="report-info-item">
                      <span className="report-info-label">Inspector Name</span>
                      <span className="report-info-value">{inspector || "NA"}</span>
                    </div>
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Inspection Date</span>
                      <span className="report-info-value">
                        {inspectionDate ? formatDate(inspectionDate) : new Date().toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Supplier Name</span>
                      <span className="report-info-value">{supplierName || "NA"}</span>
                    </div>

                    <div className="report-info-item">
                      <span className="report-info-label">Inspection Location</span>
                      <span className="report-info-value">
                        {inspectionCity && inspectionCountry ? `${inspectionCity}, ${inspectionCountry}` : "NA"}
                      </span>
                    </div>
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Site Name</span>
                      <span className="report-info-value">{inspectionSite || "NA"}</span>
                    </div>
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Address</span>
                      <span className="report-info-value">{inspectionAddress || "NA"}</span>
                    </div>
                    
                    <div className="report-info-item">
                      <span className="report-info-label">Final Result</span>
                      <span className="report-info-value">
                        {renderStatusBadge(inspectionStatus)}
                        <span className="non-conformities-count">
                          Non-Conformities: <span className={getTotalNonConformities() > 0 ? "count-danger" : ""}>
                            {getTotalNonConformities()}
                          </span>
                        </span>
                      </span>
                    </div>
                    
                    {/* Mapa estático */}
                    <div className="map-container">
                      <span className="report-info-label">Location Map</span>
                      <StaticMapReport coords={mapCoords} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Equipment Section */}
        <div className="report-section">
          <h3 className="report-section-title">
            <Settings size={18} /> Measurement Equipment
          </h3>
          <div className="dashboard-card">
            <div className="card-body">
              {measurementEquipment && measurementEquipment.length > 0 ? (
                <div className="equipment-list">
                  {measurementEquipment.map((equip, index) => (
                    <p key={index} className="equipment-item">
                      <span className="equipment-label">Tool {index + 1}:</span> 
                      {equip.toolType || "Coating Meter"} - {equip.toolId || `CM-${789 + index}`}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="no-equipment">No measurement equipment recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PÁGINA 2: DIBUJO TÉCNICO Y MEDICIONES DIMENSIONALES */}
      <div className="pdf-page-section" data-page="2">
        {/* Technical Drawing */}
        {technicalDrawingData && (
          <div className="report-section">
            <h3 className="report-section-title">
              <Package size={18} /> Technical Drawing
            </h3>
            <div className="dashboard-card">
              <div className="card-body">
                <ReportTechnicalDrawing 
                  componentCode={technicalDrawingData.componentCode}
                  componentName={technicalDrawingData.componentName}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Dimensional Measurements */}
        <div className="report-section">
          <h3 className="report-section-title">
            <Layers size={18} /> Dimensional Measurements
          </h3>
          
          {dimensions && dimensions.length > 0 && dimensionMeasurements ? (
            <>
              <div className="dashboard-card">
                <div className="card-body p-0">
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th className="sample-header">Sample</th>
                          {dimensions.map((dim) => (
                            <th key={dim.code} className="dimension-header">
                              <div className="dim-code">{dim.code}: {dim.description}</div>
                              <div className="dim-specs">
                                {dim.nominal} mm ({dim.tolerancePlus > 0 ? '+' : ''}{dim.tolerancePlus}, {dim.toleranceMinus > 0 ? '+' : ''}{dim.toleranceMinus})
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: getSampleCount(sampleInfo) || 3 }).map((_, sampleIndex) => (
                          <tr key={sampleIndex}>
                            <td className="sample-cell">Sample {sampleIndex + 1}</td>
                            {dimensions.map((dim) => {
                              const value = dimensionMeasurements?.[dim.code]?.[sampleIndex] || "-";
                              const isValid = value !== "-" && (
                                parseFloat(value) >= (dim.nominal - dim.toleranceMinus) &&
                                parseFloat(value) <= (dim.nominal + dim.tolerancePlus)
                              );
                              
                              return (
                                <td 
                                  key={dim.code} 
                                  className={`measurement-cell ${value !== "-" && !isValid ? 'invalid-value' : ''}`}
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
              
              {/* Mini Gráficos Dimensionales */}
              <div className="dimension-charts-section">
                <h4 className="charts-section-title">Dimensional Analysis Charts</h4>
                <div className="dimension-charts-grid">
                  {dimensions.map((dim, index) => (
                    <DimensionMiniChart 
                      key={dim.code}
                      dimension={dim} 
                      measurements={dimensionMeasurements?.[dim.code]} 
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="dashboard-card">
              <div className="card-body no-data">
                No dimensional data available.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PÁGINA 3: COATING Y INSPECCIÓN VISUAL */}
      <div className="pdf-page-section" data-page="3">
        <div className="report-section">
          <h3 className="report-section-title">
            <BarChart2 size={18} /> Coating Measurements
          </h3>
          <div className="dashboard-card">
            <div className="card-body">
              {/* Tabla de recubrimiento */}
              <table className="data-table coating-table">
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
                    <td className="type-cell">Mean</td>
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
              
              {/* Gráfico de recubrimiento */}
              {localCoatingMeasurements && localCoatingMeasurements.filter(v => v).length > 0 && (
                <CoatingChart 
                  measurements={localCoatingMeasurements} 
                  requirements={coatingRequirements}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Visual Inspection */}
        <div className="report-section">
          <h3 className="report-section-title">
            <CheckCircle size={18} /> Visual Inspection
          </h3>
          <div className="dashboard-card">
            <div className="card-body">
              <div className="visual-result">
                <span className="report-info-label">Result</span>
                <div className="result-badge">
                  {visualConformity === 'conforming' ? (
                    <span className="badge badge-success">CONFORMING</span>
                  ) : visualConformity === 'non-conforming' ? (
                    <span className="badge badge-danger">NON-CONFORMING</span>
                  ) : (
                    <span className="badge badge-warning">NOT EVALUATED</span>
                  )}
                </div>
              </div>
              
              <div className="visual-notes">
                <span className="report-info-label">Notes</span>
                <p className="notes-content">{visualNotes || "No visual defects observed."}</p>
              </div>
              
              {/* Galería de fotos */}
              {(photos && photos.length > 0) && (
                <div className="photos-section">
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
        
        {/* Footer */}
        <div className="dashboard-card">
          <div className="report-footer">
            <div>
              <p className="company-name">VALMONT SOLAR</p>
            </div>
            <div>
              <p className="final-result">
                Final Result: {renderStatusBadge(inspectionStatus)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseReportView;