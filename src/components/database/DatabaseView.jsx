// src/components/database/DatabaseView.jsx
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
import ReportViewDashboard from '../report/ReportViewDashboard'; // NUEVA IMPORTACIÓN
import { InspectionProvider } from '../../context/InspectionContext'; // NUEVA IMPORTACIÓN
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

// NUEVO COMPONENTE: InspectionReport
const InspectionReport = ({ inspectionData, onBack }) => {
  if (!inspectionData) {
    return (
      <div className="dashboard-card">
        <div className="card-body text-center text-gray-500">
          No inspection data available for report generation
        </div>
      </div>
    );
  }

  return (
    <div className="inspection-report-wrapper">
      {/* Barra de navegación superior */}
      <div className="database-report-header">
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center text-gray-700 hover:text-blue-600 transition-colors database-back-btn"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to list
          </button>
        )}
        
        <h2 className="text-xl font-bold">Inspection Report Preview</h2>
        
        <div className="flex items-center text-sm text-gray-500">
          This is a preview of the report that would be exported as PDF
        </div>
      </div>
      
      {/* Contenedor del reporte usando InspectionProvider para que tenga acceso al contexto */}
      <InspectionProvider>
        <InspectionReportContent inspectionData={inspectionData} />
      </InspectionProvider>
    </div>
  );
};

// Componente interno que tiene acceso al contexto de inspección
const InspectionReportContent = ({ inspectionData }) => {
const { dispatch, state } = useInspection();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  
  React.useEffect(() => {
    if (inspectionData) {
      console.log('Loading inspection data:', inspectionData);
      
      const dataToLoad = {
        ...inspectionData,
        dimensionMeasurements: inspectionData.dimensionMeasurements || {},
        dimensions: inspectionData.dimensions || [],
        localCoatingMeasurements: inspectionData.localCoatingMeasurements || [],
        coatingStats: inspectionData.coatingStats || {},
        photos: inspectionData.photos || [],
        visualConformity: inspectionData.visualConformity || null,
        visualNotes: inspectionData.visualNotes || '',
        sampleInfo: inspectionData.sampleInfo || '',
        componentName: inspectionData.componentName || '',
        inspector: inspectionData.inspector || ''
      };
      
      console.log('Data being loaded into context:', dataToLoad);
      
      // Cargar datos
      dispatch({ type: 'LOAD_INSPECTION_DATA', payload: dataToLoad });
      
      // Verificar que los datos críticos estén disponibles antes de renderizar
      const checkDataReady = () => {
        const currentState = state;
        const isDataReady = 
          currentState.dimensions && 
          currentState.dimensions.length > 0 && 
          currentState.sampleInfo && 
          currentState.sampleInfo.trim() !== '';
        
        if (isDataReady) {
          setDataLoaded(true);
          setRenderKey(prev => prev + 1);
        } else {
          // Reintentar después de un tiempo
          setTimeout(checkDataReady, 100);
        }
      };
      
      // Comenzar la verificación después de un pequeño delay
      setTimeout(checkDataReady, 200);
    }
  }, [inspectionData, dispatch, state]);
  
  if (!dataLoaded) {
    return (
      <div id="database-report-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading report data...</div>
        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>
          Waiting for dimensions and sample info...
        </div>
      </div>
    );
  }
  
  return (
    <div id="database-report-container" key={renderKey}>
      <ReportViewDashboard />
    </div>
  );
};

// Componente principal DatabaseView (ACTUALIZADO)
const DatabaseView = () => {
  const navigate = useNavigate();
  const { loadInspection, dispatch } = useInspection();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // ESTADOS PARA MANEJAR LAS VISTAS (ACTUALIZADO)
  const [currentView, setCurrentView] = useState('list'); // 'list', 'details', 'report'
  const [selectedInspection, setSelectedInspection] = useState(null);
  
  // Estados para navegación por mes/año
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return {
      month: now.getMonth(), // 0-11
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

  // FUNCIÓN MODIFICADA: Handle view report
  const handleViewReport = async (inspectionId) => {
    try {
      setLoading(true);
      
      // Buscar la inspección en la lista actual
      const inspection = inspections.find(insp => insp.id === inspectionId);
      
      if (inspection) {
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
      
      {/* NUEVA VISTA: Si estamos en la vista de reporte, mostrar InspectionReport */}
      {currentView === 'report' && selectedInspection && (
        <InspectionReport 
          inspectionData={selectedInspection}
          onBack={handleBackToList}
        />
      )}
      
      {/* Si estamos en la vista de lista, mostrar la interfaz normal */}
      {currentView === 'list' && (
        <div className="database-card">
          {/* Resto del contenido sin cambios... */}
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
            
            {/* Tabla de inspecciones con columnas ampliadas */}
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