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
  ListFilter
} from 'lucide-react';
import { getInspections, deleteInspection } from '../../firebase/inspectionService';
import { useInspection } from '../../context/InspectionContext';
import './DatabaseView.css'; // Asegúrate de que este archivo CSS existe

const DatabaseView = () => {
  const navigate = useNavigate();
  const { loadInspection, dispatch } = useInspection();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
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

  // Handle view report
  const handleViewReport = (inspectionId) => {
    try {
      // Attempt to navigate to report view
      navigate(`/report/${inspectionId}`);
    } catch (err) {
      console.error("Navigation error:", err);
      // Fallback if navigation fails
      alert(`Viewing report for inspection ${inspectionId}`);
    }
  };

  // Handle view details
  const handleViewDetails = (inspectionId) => {
    try {
      // Try to use the loadInspection function from context first
      if (typeof loadInspection === 'function') {
        // This will load the inspection into the current state
        loadInspection(inspectionId)
          .then(() => {
            // Change to the inspection tab to view the data
            dispatch({ type: 'SET_ACTIVE_TAB', payload: 'inspection' });
            setSuccessMessage("Inspection loaded successfully");
          })
          .catch(err => {
            console.error("Error loading inspection:", err);
            setError("Failed to load inspection details");
          });
      } else {
        // Fallback to navigation if loadInspection is not available
        navigate(`/inspection/${inspectionId}`);
      }
    } catch (err) {
      console.error("Error handling view details:", err);
      alert(`Viewing details for inspection ${inspectionId}`);
    }
  };

  return (
    <div className="database-container">
      {/* Tarjeta principal */}
      <div className="database-card">
        {/* Encabezado de la tarjeta */}
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
    </div>
  );
};

export default DatabaseView;