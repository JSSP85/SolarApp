import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Trash2, 
  Eye, 
  FileText, 
  Calendar, 
  User, 
  Briefcase,
  Building,
  Box,
  Check, 
  AlertTriangle, 
  FileWarning, 
  ChevronLeft, 
  ChevronRight, 
  Database,
  Download,
  ListFilter,
  ArrowLeft,
  Info
} from 'lucide-react';
import { getInspections, deleteInspection } from '../../firebase/inspectionService';
import { useInspection } from '../../context/InspectionContext';
import { formatDate } from '../../utils/dateFormatter';
import StaticMapReport from '../report/StaticMapReport';
import ReportViewDashboard from '../report/ReportViewDashboard';
import { InspectionProvider } from '../../context/InspectionContext';
import './DatabaseView.css';

// Componente InspectionDetails (sin cambios)
const InspectionDetails = ({ inspectionData, onBack }) => {
  if (!inspectionData) {
    return (
      <div className="dashboard-card">
        <div className="card-body text-center text-gray-500">
          No inspection data available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botón de regreso */}
      {onBack && (
        <div className="flex items-center mb-4">
          <button 
            onClick={onBack}
            className="flex items-center text-gray-700 hover:text-blue-600 transition-colors database-back-btn"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to list
          </button>
        </div>
      )}
      
      <h2 className="text-xl font-bold mb-4">Inspection Details</h2>
      
      {/* Two-column container - COPIADO EXACTAMENTE DEL SETUP */}
      <div className="cards-grid-2">
        {/* LEFT COLUMN: Component Information */}
        <div className="dashboard-card">
          <div className="card-header" style={{background: 'linear-gradient(to right, #5a67d8, #6875f5)'}}>
            <h3 className="card-title" style={{color: 'white'}}>
              Component Information
            </h3>
          </div>
          
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Client</label>
              <input
                type="text"
                className="form-control"
                value={inspectionData.client || 'Valmont Solar'}
                readOnly
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input
                type="text"
                className="form-control"
                value={inspectionData.projectName || 'NEPI'}
                readOnly
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Component Family</label>
              <input
                type="text"
                className="form-control"
                value={inspectionData.componentFamily || 'NA'}
                readOnly
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Component Code</label>
              <input
                type="text"
                className="form-control"
                value={inspectionData.componentCode || 'NA'}
                readOnly
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Component Name</label>
              <input
                type="text"
                className="form-control"
                value={inspectionData.componentName || 'NA'}
                readOnly
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Surface Protection</label>
              <input
                type="text"
                className="form-control"
                value={inspectionData.surfaceProtection || 'NA'}
                readOnly
              />
            </div>
            
            {inspectionData.surfaceProtection === 'ISO1461' && (
              <div className="form-group">
                <label className="form-label">Material Thickness (mm)</label>
                <input
                  type="text"
                  className="form-control"
                  value={`${inspectionData.thickness || '2.0'} mm`}
                  readOnly
                />
              </div>
            )}
            
            {inspectionData.surfaceProtection === 'special coating' && (
              <div className="form-group">
                <label className="form-label">Special Coating Value (µm)</label>
                <input
                  type="text"
                  className="form-control"
                  value={`${inspectionData.specialCoating || '45'} µm`}
                  readOnly
                />
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Batch Quantity</label>
              <input
                type="text"
                className="form-control"
                value={inspectionData.batchQuantity || 'NA'}
                readOnly
              />
            </div>
            
            {inspectionData.sampleInfo && (
              <div style={{background: '#ebf8ff', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', marginTop: '16px', border: '1px solid #bee3f8'}}>
                <div style={{color: '#3182ce', marginRight: '8px'}}>
                  <Info size={18} />
                </div>
                <div>
                  <p style={{fontWeight: '500', color: '#2c5282', margin: '0 0 4px 0'}}>Sampling Plan:</p>
                  <p style={{color: '#3182ce', margin: '0'}}>{inspectionData.sampleInfo}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* RIGHT COLUMN: Inspection Information */}
        <div className="dashboard-card">
          <div className="card-header" style={{background: 'linear-gradient(to right, #667eea, #764ba2)'}}>
            <h3 className="card-title" style={{color: 'white'}}>
              Inspection Information
            </h3>
          </div>
          
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Inspector Name</label>
              <input
                type="text"
                className="form-control"
                value={inspectionData.inspector || 'NA'}
                readOnly
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Inspection Date</label>
              <input
                type="text"
                className="form-control"
                value={inspectionData.inspectionDate ? formatDate(inspectionData.inspectionDate) : new Date().toLocaleDateString()}
                readOnly
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Inspection Location</label>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Country"
                  value={inspectionData.inspectionCountry || 'Spain'}
                  readOnly
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="City"
                  value={inspectionData.inspectionCity || 'Madrid'}
                  readOnly
                />
              </div>
            </div>
            
            {/* Additional location details */}
            <div style={{marginTop: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
              <div className="form-group">
                <label className="form-label">Site Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={inspectionData.inspectionSite || 'NA'}
                  readOnly
                  style={{backgroundColor: '#ffffff'}}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Detailed Address</label>
                <textarea
                  className="form-control"
                  value={inspectionData.inspectionAddress || 'NA'}
                  readOnly
                  rows="2"
                  style={{backgroundColor: '#ffffff'}}
                />
              </div>
              
              {/* Mapa estático - IGUAL QUE EN SETUP */}
              <div style={{borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', marginTop: '8px'}}>
                <div style={{background: 'linear-gradient(to right, #667eea, #764ba2)', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span style={{color: 'white', fontWeight: '500', display: 'flex', alignItems: 'center'}}>
                    Inspection Location
                  </span>
                </div>
                
                {/* Usando el componente StaticMapReport */}
                <StaticMapReport coords={inspectionData.mapCoords} />
              </div>
            </div>
            
            {/* Status final */}
            <div className="form-group" style={{marginTop: '16px'}}>
              <label className="form-label">Final Result</label>
              <div style={{
                padding: '12px', 
                borderRadius: '8px', 
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: inspectionData.inspectionStatus === 'pass' ? '#d1fae5' : 
                                inspectionData.inspectionStatus === 'reject' ? '#fee2e2' : '#fef3c7',
                color: inspectionData.inspectionStatus === 'pass' ? '#065f46' : 
                       inspectionData.inspectionStatus === 'reject' ? '#b91c1c' : '#92400e',
                border: `1px solid ${inspectionData.inspectionStatus === 'pass' ? '#a7f3d0' : 
                                     inspectionData.inspectionStatus === 'reject' ? '#fecaca' : '#fde68a'}`
              }}>
                {inspectionData.inspectionStatus === 'pass' ? 'ACCEPTED' : 
                 inspectionData.inspectionStatus === 'reject' ? 'REJECTED' : 'IN PROGRESS'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// FUNCIÓN AUXILIAR para convertir datos de Firestore al formato esperado por el contexto
const convertFirestoreDataToContext = (firestoreData) => {
  console.log('🔄 Convirtiendo datos de Firestore:', firestoreData);
  
  // DEBUGGING: Ver la estructura de dimensionMeasurements
  if (firestoreData.dimensionMeasurements) {
    console.log('📊 dimensionMeasurements encontrado:', firestoreData.dimensionMeasurements);
    console.log('📊 Tipo:', typeof firestoreData.dimensionMeasurements);
    console.log('📊 Keys:', Object.keys(firestoreData.dimensionMeasurements));
    
    // Ver el contenido de cada dimensión
    Object.keys(firestoreData.dimensionMeasurements).forEach(dimCode => {
      console.log(`📊 Dimensión ${dimCode}:`, firestoreData.dimensionMeasurements[dimCode]);
    });
  } else {
    console.log('❌ dimensionMeasurements NO encontrado en datos de Firestore');
  }
  
  if (firestoreData.dimensions) {
    console.log('📏 dimensions encontrado:', firestoreData.dimensions);
    console.log('📏 Cantidad:', firestoreData.dimensions.length);
    firestoreData.dimensions.forEach((dim, index) => {
      console.log(`📏 Dimensión ${index}:`, dim);
    });
  }
  
  // ESTRATEGIA MEJORADA: Asegurar que dimensionMeasurements se preserve
  let finalDimensionMeasurements = {};
  
  if (firestoreData.dimensionMeasurements && typeof firestoreData.dimensionMeasurements === 'object') {
    finalDimensionMeasurements = { ...firestoreData.dimensionMeasurements };
    console.log('✅ dimensionMeasurements copiado correctamente');
  } else {
    console.log('⚠️ dimensionMeasurements no válido, inicializando vacío');
  }
  
  // Si los datos ya están en formato plano (directamente convertidos), usarlos tal como están
  if (firestoreData.dimensionMeasurements && firestoreData.dimensions) {
    console.log('✅ Datos ya en formato plano');
    
    const result = {
      ...firestoreData,
      // FORZAR campos críticos con verificación
      dimensionMeasurements: finalDimensionMeasurements,
      dimensions: firestoreData.dimensions || [],
      dimensionNonConformities: firestoreData.dimensionNonConformities || {},
      localCoatingMeasurements: firestoreData.localCoatingMeasurements || [],
      coatingRequirements: firestoreData.coatingRequirements || {},
      coatingStats: firestoreData.coatingStats || {},
      photos: firestoreData.photos || [],
      measurementEquipment: firestoreData.measurementEquipment || [],
      visualConformity: firestoreData.visualConformity || '',
      visualNotes: firestoreData.visualNotes || ''
    };
    
    // VERIFICACIÓN ADICIONAL
    console.log('🎯 Resultado final de conversión:', {
      componentName: result.componentName,
      dimensions: result.dimensions?.length || 0,
      dimensionMeasurements: Object.keys(result.dimensionMeasurements || {}).length,
      dimensionMeasurementsContent: result.dimensionMeasurements,
      sampleMeasurementsPerDim: result.dimensions?.length > 0 ? 
        result.dimensionMeasurements[result.dimensions[0]?.code]?.length || 0 : 0
    });
    
    // ALERTA si dimensionMeasurements está vacío
    if (Object.keys(result.dimensionMeasurements).length === 0) {
      console.error('❌ ALERTA: dimensionMeasurements está vacío en resultado final');
    }
    
    return result;
  }
  
  // Si los datos están en estructura anidada de Firestore, extraerlos
  const measurements = firestoreData.measurements || {};
  const dimensional = measurements.dimensional || {};
  const coating = measurements.coating || {};
  const visual = measurements.visual || {};
  
  console.log('📊 Extrayendo de estructura anidada:', {
    dimensional: dimensional,
    coating: coating,
    visual: visual
  });
  
  return {
    // Información básica
    id: firestoreData.id || '',
    client: firestoreData.client || firestoreData.componentInfo?.client || '',
    projectName: firestoreData.projectName || firestoreData.componentInfo?.projectName || '',
    componentFamily: firestoreData.componentFamily || firestoreData.componentInfo?.componentFamily || '',
    componentCode: firestoreData.componentCode || firestoreData.componentInfo?.componentCode || '',
    componentName: firestoreData.componentName || firestoreData.componentInfo?.componentName || '',
    surfaceProtection: firestoreData.surfaceProtection || firestoreData.componentInfo?.surfaceProtection || '',
    thickness: firestoreData.thickness || firestoreData.componentInfo?.thickness || '',
    specialCoating: firestoreData.specialCoating || firestoreData.componentInfo?.specialCoating || '',
    batchQuantity: firestoreData.batchQuantity || firestoreData.componentInfo?.batchQuantity || '',
    
    // Información de inspección
    inspector: firestoreData.inspector || firestoreData.inspectionInfo?.inspector || '',
    inspectionDate: firestoreData.inspectionDate || firestoreData.inspectionInfo?.inspectionDate || '',
    inspectionCountry: firestoreData.inspectionCountry || firestoreData.inspectionInfo?.inspectionCountry || '',
    inspectionCity: firestoreData.inspectionCity || firestoreData.inspectionInfo?.inspectionCity || '',
    inspectionSite: firestoreData.inspectionSite || firestoreData.inspectionInfo?.inspectionSite || '',
    inspectionAddress: firestoreData.inspectionAddress || firestoreData.inspectionInfo?.inspectionAddress || '',
    mapCoords: firestoreData.mapCoords || firestoreData.inspectionInfo?.coordinates || { lat: 40.416775, lng: -3.703790 },
    
    // Datos dimensionales
    dimensions: dimensional.dimensions || firestoreData.dimensions || [],
    dimensionMeasurements: dimensional.measurements || firestoreData.dimensionMeasurements || {},
    dimensionNonConformities: dimensional.nonConformities || firestoreData.dimensionNonConformities || {},
    completedDimensions: dimensional.completedDimensions || firestoreData.completedDimensions || {},
    
    // Datos de recubrimiento
    coatingRequirements: coating.requirements || firestoreData.coatingRequirements || {},
    meanCoating: coating.meanCoating || firestoreData.meanCoating || '',
    localCoatingMeasurements: coating.localMeasurements || firestoreData.localCoatingMeasurements || [],
    coatingStats: coating.stats || firestoreData.coatingStats || {},
    
    // Inspección visual
    visualConformity: visual.conformity || firestoreData.visualConformity || '',
    visualNotes: visual.notes || firestoreData.visualNotes || '',
    photos: visual.photos || firestoreData.photos || [],
    
    // Equipo de medición
    measurementEquipment: firestoreData.measurementEquipment || firestoreData.equipment || [],
    
    // Información de muestra
    sampleInfo: firestoreData.sampleInfo || firestoreData.sampleInfo?.sampleInfo || '',
    inspectionStep: firestoreData.inspectionStep || firestoreData.sampleInfo?.inspectionStep || 'first',
    
    // Resultados finales
    totalNonConformities: firestoreData.totalNonConformities || firestoreData.finalResults?.totalNonConformities || 0,
    inspectionStatus: firestoreData.inspectionStatus || firestoreData.finalResults?.inspectionStatus || 'in-progress'
  };
};

// InspectionReport CORREGIDO
const InspectionReport = ({ inspectionData, onBack }) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!inspectionData) {
    return (
      <div className="dashboard-card">
        <div className="card-body text-center text-gray-500">
          No inspection data available for report generation
        </div>
      </div>
    );
  }

  // Función para exportar a PDF CORREGIDA
  const handleExportPDF = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    
    try {
      console.log('🎯 Iniciando exportación PDF desde Database...');
      
      // Esperar un momento para asegurar que el contenedor esté renderizado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { exportToPDF, generateFilename } = await import('../../utils/pdfExportService');
      const filename = generateFilename(inspectionData);
      
      console.log('📄 Exportando con filename:', filename);
      
      await exportToPDF('database-report-container', {
        filename: filename,
        orientation: 'portrait',
        scale: 2,
        showNotification: true
      });
      
      console.log('✅ PDF exportado exitosamente');
      
    } catch (error) {
      console.error('❌ Error exporting PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="inspection-report-wrapper">
      {/* Barra de navegación superior */}
      <div className="database-report-header">
        <div className="flex items-center">
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center text-white hover:text-blue-200 transition-colors mr-4"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to list
            </button>
          )}
          
          <div>
            <h2 className="text-xl font-bold">Inspection Report Preview</h2>
            <div className="text-sm text-blue-100 opacity-90">
              Component: {inspectionData.componentName || inspectionData.componentCode || 'Unknown'}
            </div>
          </div>
        </div>
        
        {/* Botón de exportación a PDF */}
        <button 
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <Download size={18} />
              <span>Export PDF</span>
            </>
          )}
        </button>
      </div>
      
      {/* Provider anidado con datos corregidos */}
      <InspectionProvider>
        <InspectionReportContent inspectionData={inspectionData} />
      </InspectionProvider>
    </div>
  );
};

// Componente interno CORREGIDO que tiene acceso al contexto de inspección
const InspectionReportContent = ({ inspectionData }) => {
  const { dispatch, state } = useInspection();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  
  React.useEffect(() => {
    if (inspectionData) {
      console.log('🔍 Cargando datos para reporte:', inspectionData.componentName || inspectionData.componentCode);
      
      // CORREGIR: Convertir datos de Firestore al formato esperado por el contexto
      const contextData = convertFirestoreDataToContext(inspectionData);
      
      console.log('🚀 Datos convertidos para contexto:', {
        componentName: contextData.componentName,
        dimensions: contextData.dimensions?.length || 0,
        measurements: Object.keys(contextData.dimensionMeasurements || {}).length,
        photos: contextData.photos?.length || 0,
        sampleInfo: contextData.sampleInfo
      });
      
      // Cargar datos en el contexto
      dispatch({ type: 'LOAD_INSPECTION_DATA', payload: contextData });
      
      // Escalonado de re-renders para asegurar carga completa
      const timers = [];
      
      timers.push(setTimeout(() => {
        setRenderKey(prev => prev + 1);
        console.log('🔄 Re-render 1');
      }, 300));
      
      timers.push(setTimeout(() => {
        setRenderKey(prev => prev + 1);
        console.log('🔄 Re-render 2');
      }, 600));
      
      timers.push(setTimeout(() => {
        setDataLoaded(true);
        setRenderKey(prev => prev + 1);
        console.log('🔄 Re-render 3 - Data loaded');
      }, 1000));
      
      timers.push(setTimeout(() => {
        setRenderKey(prev => prev + 1);
        console.log('🔄 Re-render 4 - Final');
        
        // NUEVO: Marcar que terminamos de cargar desde database
        dispatch({ type: 'FINISH_LOADING_FROM_DATABASE' });
        console.log('🏁 Finalizando carga desde database');
        
        // DEBUG: Ver el estado final del contexto
        console.log('🎯 Estado final del contexto:', {
          dimensions: state.dimensions?.length || 0,
          dimensionMeasurements: Object.keys(state.dimensionMeasurements || {}).length,
          sampleInfo: state.sampleInfo
        });
      }, 1500));
      
      return () => {
        timers.forEach(clearTimeout);
      };
    }
  }, [inspectionData, dispatch]);
  
  // DEBUG adicional: Observar cambios en el estado
  React.useEffect(() => {
    if (dataLoaded) {
      console.log('🎪 Estado del contexto actualizado:', {
        componentName: state.componentName,
        dimensions: state.dimensions?.length || 0,
        dimensionMeasurements: state.dimensionMeasurements ? Object.keys(state.dimensionMeasurements).length : 0,
        sampleInfo: state.sampleInfo,
        firstDimension: state.dimensions?.[0],
        firstMeasurements: state.dimensions?.[0] ? state.dimensionMeasurements?.[state.dimensions[0].code] : null
      });
    }
  }, [state, dataLoaded]);
  
  if (!dataLoaded) {
    return (
      <div id="database-report-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <div>Loading report data...</div>
          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>
            Processing inspection data: {inspectionData.componentName || inspectionData.componentCode}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div id="database-report-container" key={renderKey} className="database-report-content">
      <ReportViewDashboard />
    </div>
  );
};

// Componente principal DatabaseView (resto del código sin cambios...)
const DatabaseView = () => {
  const navigate = useNavigate();
  const { loadInspection, dispatch } = useInspection();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // ESTADOS PARA MANEJAR LAS VISTAS
  const [currentView, setCurrentView] = useState('list');
  const [selectedInspection, setSelectedInspection] = useState(null);
  
  // Estados para navegación por mes/año
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return {
      month: now.getMonth(),
      year: now.getFullYear()
    };
  });
  
  // Nombres de los meses para visualización
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Load inspections on component mount and when month/year changes
  useEffect(() => {
    loadInspectionsByMonth();
  }, [currentDate.month, currentDate.year]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Function to load inspections filtered by the current month and year
  const loadInspectionsByMonth = async () => {
    setLoading(true);
    setError(null);
    try {
      // Calcular el primer y último día del mes
      const startDate = new Date(currentDate.year, currentDate.month, 1)
        .toISOString().split('T')[0];
        
      const endDate = new Date(currentDate.year, currentDate.month + 1, 0)
        .toISOString().split('T')[0];
      
      // Filtrar por mes y año
      const filters = {
        dateStart: startDate,
        dateEnd: endDate,
        status: selectedFilter !== 'all' ? selectedFilter : undefined,
        search: searchQuery || undefined
      };
      
      const data = await getInspections(filters);
      setInspections(data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading inspections:", err);
      setError("Failed to load inspections. Please try again.");
      setLoading(false);
    }
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newMonth = prev.month === 0 ? 11 : prev.month - 1;
      const newYear = prev.month === 0 ? prev.year - 1 : prev.year;
      return { month: newMonth, year: newYear };
    });
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newMonth = prev.month === 11 ? 0 : prev.month + 1;
      const newYear = prev.month === 11 ? prev.year + 1 : prev.year;
      return { month: newMonth, year: newYear };
    });
  };

  // Apply status and search filters
  const applyFilters = () => {
    loadInspectionsByMonth();
  };

  // Function to delete an inspection
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this inspection? This action cannot be undone.")) {
      try {
        setLoading(true);
        await deleteInspection(id);
        setSuccessMessage("Inspection deleted successfully");
        await loadInspectionsByMonth();
      } catch (err) {
        console.error("Error deleting inspection:", err);
        setError("Failed to delete inspection. Please try again.");
        setLoading(false);
      }
    }
  };

  // Function to export data as CSV
  const exportToCSV = () => {
    try {
      const headers = [
        'ID', 'Date', 'Client', 'Project', 'Component Name', 'Component Code', 
        'Batch', 'Inspector', 'Status'
      ];
      
      const rows = inspections.map(insp => [
        insp.id,
        getInspectionDate(insp),
        getClientName(insp),
        getProjectName(insp),
        getComponentName(insp),
        getComponentCode(insp),
        getBatchInfo(insp),
        getInspectorName(insp),
        getStatusText(getInspectionStatus(insp))
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `inspections_${monthNames[currentDate.month]}_${currentDate.year}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccessMessage("Export completed successfully");
    } catch (err) {
      console.error("Error exporting data:", err);
      setError("Failed to export data. Please try again.");
    }
  };

  // Helper functions to get data in a flexible way
  const getInspectionDate = (insp) => {
    return insp.inspectionDate || insp.inspectionInfo?.inspectionDate || 'N/A';
  };

  const getClientName = (insp) => {
    return insp.client || 
           insp.clientName || 
           insp.inspectionInfo?.client || 
           insp.componentInfo?.client || 
           'N/A';
  };

  const getComponentName = (insp) => {
    return insp.componentName || insp.componentInfo?.componentName || 'Unknown Component';
  };

  const getComponentCode = (insp) => {
    return insp.componentCode || insp.componentInfo?.componentCode || 'N/A';
  };

  const getInspectorName = (insp) => {
    return insp.inspector || insp.inspectionInfo?.inspector || 'Unknown';
  };

  const getProjectName = (insp) => {
    return insp.project || 
           insp.projectName || 
           insp.inspectionInfo?.project || 
           insp.componentInfo?.projectName || 
           'No Project';
  };

  const getBatchInfo = (insp) => {
    return insp.batchNumber || 
           insp.batchQuantity || 
           insp.batch || 
           insp.inspectionInfo?.batchNumber || 
           insp.inspectionInfo?.batchQuantity || 
           'N/A';
  };

  const getInspectionStatus = (insp) => {
    return insp.inspectionStatus || insp.finalResults?.inspectionStatus || 'in-progress';
  };

  // Get status display text
  const getStatusText = (status) => {
    switch(status) {
      case 'pass': return 'ACCEPTED';
      case 'reject': return 'REJECTED';
      case 'in-progress': return 'IN PROGRESS';
      default: return status ? status.toUpperCase() : 'UNKNOWN';
    }
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setTimeout(() => applyFilters(), 100);
  };

  // Handle search input change
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };

  // Handle view report CORREGIDO
  const handleViewReport = async (inspectionId) => {
    try {
      setLoading(true);
      
      // Buscar la inspección en la lista actual
      const inspection = inspections.find(insp => insp.id === inspectionId);
      
      if (inspection) {
        console.log('🎯 Cargando reporte para:', inspection.componentName || inspection.componentCode);
        setSelectedInspection(inspection);
        setCurrentView('report');
        setSuccessMessage("Inspection report loaded successfully");
      } else {
        // Si no está en la lista actual, intentar cargar desde Firebase
        if (typeof loadInspection === 'function') {
          const inspectionData = await loadInspection(inspectionId);
          setSelectedInspection(inspectionData);
          setCurrentView('report');
          setSuccessMessage("Inspection report loaded successfully");
        } else {
          throw new Error('Unable to load inspection report');
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error loading inspection report:", err);
      setError("Failed to load inspection report");
      setLoading(false);
    }
  };

  // Handle view details (sin cambios)
  const handleViewDetails = async (inspectionId) => {
    try {
      setLoading(true);
      
      // Buscar la inspección en la lista actual
      const inspection = inspections.find(insp => insp.id === inspectionId);
      
      if (inspection) {
        setSelectedInspection(inspection);
        setCurrentView('details');
        setSuccessMessage("Inspection details loaded successfully");
      } else {
        // Si no está en la lista actual, intentar cargar desde Firebase
        if (typeof loadInspection === 'function') {
          const inspectionData = await loadInspection(inspectionId);
          setSelectedInspection(inspectionData);
          setCurrentView('details');
          setSuccessMessage("Inspection details loaded successfully");
        } else {
          throw new Error('Unable to load inspection details');
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error loading inspection details:", err);
      setError("Failed to load inspection details");
      setLoading(false);
    }
  };

  // Función para volver a la lista
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedInspection(null);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="database-container">
      {/* Si estamos en la vista de detalles, mostrar InspectionDetails */}
      {currentView === 'details' && selectedInspection && (
        <InspectionDetails 
          inspectionData={selectedInspection}
          onBack={handleBackToList}
        />
      )}
      
      {/* Si estamos en la vista de reporte, mostrar InspectionReport */}
      {currentView === 'report' && selectedInspection && (
        <InspectionReport 
          inspectionData={selectedInspection}
          onBack={handleBackToList}
        />
      )}
      
      {/* Si estamos en la vista de lista, mostrar la interfaz normal */}
      {currentView === 'list' && (
        <div className="database-card">
          <div className="database-header">
            <h1 className="database-title">
              <Database size={24} />
              Inspection Database
            </h1>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div className="database-badge">
                Total Records: {inspections.length}
              </div>
              <button
                onClick={exportToCSV}
                className="database-export-btn"
                disabled={inspections.length === 0 || loading}
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="database-content">
            {/* Mensajes de notificación */}
            {successMessage && (
              <div className="database-alert database-alert-success">
                <Check size={18} />
                <span>{successMessage}</span>
              </div>
            )}
            
            {error && (
              <div className="database-alert database-alert-error">
                <AlertTriangle size={18} />
                <span>{error}</span>
              </div>
            )}
            
            {/* Navegación por mes */}
            <div className="database-month-nav">
              <button 
                onClick={goToPreviousMonth}
                className="database-month-btn"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="database-month-label">
                <Calendar size={18} />
                {monthNames[currentDate.month]} {currentDate.year}
              </div>
              
              <button 
                onClick={goToNextMonth}
                className="database-month-btn"
              >
                <ChevronRight size={20} />
              </button>
              
              {/* Búsqueda */}
              <form onSubmit={handleSearchSubmit} className="database-search-form">
                <div className="database-search-input">
                  <Search size={18} className="database-search-icon" />
                  <input
                    type="text"
                    placeholder="Search by component, inspector, or ID..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
                <button type="submit" className="database-search-btn">
                  Search
                </button>
              </form>
            </div>
            
            {/* Filtros de estado */}
            <div className="database-filters">
              <div className="database-filter-label">
                <ListFilter size={16} />
                Status:
              </div>
              <button
                className={`database-filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                All
              </button>
              <button
                className={`database-filter-btn database-filter-btn-accepted ${selectedFilter === 'pass' ? 'active' : ''}`}
                onClick={() => handleFilterChange('pass')}
              >
                <Check size={14} style={{marginRight: '0.25rem'}} /> Accepted
              </button>
              <button
                className={`database-filter-btn database-filter-btn-rejected ${selectedFilter === 'reject' ? 'active' : ''}`}
                onClick={() => handleFilterChange('reject')}
              >
                <AlertTriangle size={14} style={{marginRight: '0.25rem'}} /> Rejected
              </button>
              <button
                className={`database-filter-btn database-filter-btn-progress ${selectedFilter === 'in-progress' ? 'active' : ''}`}
                onClick={() => handleFilterChange('in-progress')}
              >
                <FileWarning size={14} style={{marginRight: '0.25rem'}} /> In Progress
              </button>
            </div>
            
            {/* Estado de carga */}
            {loading && (
              <div className="database-loading">
                <div className="database-loading-spinner"></div>
                <p style={{color: '#4b5563', fontWeight: '500'}}>Loading inspections...</p>
              </div>
            )}
            
            {/* Estado vacío */}
            {!loading && inspections.length === 0 && (
              <div className="database-empty-state">
                <Database className="database-empty-icon" />
                <h3 className="database-empty-title">No inspections found</h3>
                <p className="database-empty-description">There are no inspections for {monthNames[currentDate.month]} {currentDate.year}.</p>
                <p style={{color: '#6b7280'}}>Try changing your search criteria, filters, or navigate to a different month.</p>
              </div>
            )}
            
            {/* Tabla de inspecciones */}
            {!loading && inspections.length > 0 && (
              <div className="database-table-container">
                <table className="database-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Client</th>
                      <th>Project</th>
                      <th>Component</th>
                      <th>Batch</th>
                      <th>Inspector</th>
                      <th>Status</th>
                      <th style={{textAlign: 'right'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspections.map((inspection) => (
                      <tr key={inspection.id}>
                        <td>{getInspectionDate(inspection)}</td>
                        <td>
                          <div style={{display: 'flex', alignItems: 'center'}}>
                            <Building size={14} style={{color: '#9ca3af', marginRight: '0.25rem'}} />
                            <span>{getClientName(inspection)}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{display: 'flex', alignItems: 'center'}}>
                            <Briefcase size={14} style={{color: '#9ca3af', marginRight: '0.25rem'}} />
                            <span>{getProjectName(inspection)}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{fontWeight: '500', color: '#1f2937'}}>{getComponentName(inspection)}</div>
                          <div style={{fontSize: '0.75rem', color: '#6b7280'}}>{getComponentCode(inspection)}</div>
                        </td>
                        <td>
                          <div style={{display: 'flex', alignItems: 'center'}}>
                            <Box size={14} style={{color: '#9ca3af', marginRight: '0.25rem'}} />
                            <span>{getBatchInfo(inspection)}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{display: 'flex', alignItems: 'center'}}>
                            <User size={14} style={{color: '#9ca3af', marginRight: '0.25rem'}} />
                            <span>{getInspectorName(inspection)}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`database-status-badge ${
                            getInspectionStatus(inspection) === 'pass' ? 'database-status-badge-accepted' : 
                            getInspectionStatus(inspection) === 'reject' ? 'database-status-badge-rejected' : 
                            'database-status-badge-progress'
                          }`}>
                            {getStatusText(getInspectionStatus(inspection))}
                          </span>
                        </td>
                        <td>
                          <div className="database-action-buttons">
                            <button 
                              className="database-action-btn database-action-btn-view" 
                              title="View Report"
                              onClick={() => handleViewReport(inspection.id)}
                            >
                              <FileText size={18} />
                            </button>
                            <button 
                              className="database-action-btn database-action-btn-details" 
                              title="View Details"
                              onClick={() => handleViewDetails(inspection.id)}
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              className="database-action-btn database-action-btn-delete" 
                              title="Delete" 
                              onClick={() => handleDelete(inspection.id)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Estadísticas y resumen */}
            {!loading && inspections.length > 0 && (
              <div className="database-footer">
                <div style={{fontSize: '0.875rem', color: '#4b5563'}}>
                  Showing {inspections.length} inspections for {monthNames[currentDate.month]} {currentDate.year}
                </div>
                
                <div className="database-stats">
                  <div className="database-stat-badge">
                    <div className="database-stat-indicator database-stat-indicator-accepted"></div>
                    <span>
                      {inspections.filter(insp => getInspectionStatus(insp) === 'pass').length} Accepted
                    </span>
                  </div>
                  
                  <div className="database-stat-badge">
                    <div className="database-stat-indicator database-stat-indicator-rejected"></div>
                    <span>
                      {inspections.filter(insp => getInspectionStatus(insp) === 'reject').length} Rejected
                    </span>
                  </div>
                  
                  <div className="database-stat-badge">
                    <div className="database-stat-indicator database-stat-indicator-progress"></div>
                    <span>
                      {inspections.filter(insp => getInspectionStatus(insp) === 'in-progress').length} In Progress
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseView;