// src/components/database/DatabaseView.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  FileText, 
  Calendar, 
  User, 
  Check, 
  AlertTriangle, 
  FileWarning, 
  ChevronLeft, 
  ChevronRight, 
  Database,
  Download,
  BarChart2,
  ListFilter,
  ArrowUpRight
} from 'lucide-react';
import { getInspections, deleteInspection } from '../../firebase/inspectionService';
import { useNavigate } from 'react-router-dom';

const DatabaseView = () => {
  const navigate = useNavigate(); // Para navegación entre rutas
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
        'ID', 'Date', 'Component Name', 'Component Code', 'Inspector', 'Status'
      ];
      
      const rows = inspections.map(insp => [
        insp.id,
        getInspectionDate(insp),
        getComponentName(insp),
        getComponentCode(insp),
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
    return insp.project || insp.projectName || insp.componentInfo?.projectName || 'No Project';
  };

  const getInspectionStatus = (insp) => {
    return insp.inspectionStatus || insp.finalResults?.inspectionStatus || 'in-progress';
  };

  // Get status display class
  const getStatusClass = (status) => {
    switch(status) {
      case 'pass': return 'bg-green-100 text-green-800 border border-green-200';
      case 'reject': return 'bg-red-100 text-red-800 border border-red-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
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
    // Navigate to the report view with the inspection ID
    navigate(`/report/${inspectionId}`);
  };

  // Handle view details
  const handleViewDetails = (inspectionId) => {
    // Navigate to the inspection details view
    navigate(`/inspection/${inspectionId}`);
  };

  return (
    <div className="p-6">
      {/* Tarjeta principal con título incorporado */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Encabezado de la tarjeta con título */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-700 to-blue-500 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center">
            <Database className="mr-3" size={24} />
            Inspection Database
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm bg-blue-800 bg-opacity-30 px-3 py-1.5 rounded-full text-white font-medium">
              Total Records: {inspections.length}
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center px-3 py-2 bg-white text-blue-700 rounded-md border border-blue-100 hover:bg-blue-50 transition-all duration-200 hover:shadow transform hover:-translate-y-0.5"
              disabled={inspections.length === 0 || loading}
            >
              <Download size={16} className="mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Contenedor principal con fondo claro */}
        <div className="bg-gray-50 p-6">
          {/* Mensajes de notificación */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md shadow-sm animate-fadeIn flex items-start">
              <Check size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md shadow-sm animate-fadeIn flex items-start">
              <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {/* Cabecera de filtros y navegación por mes */}
          <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-6">
            {/* Navegación por mes/año */}
            <div className="flex items-center mb-4 lg:mb-0 w-full lg:w-auto">
              <button 
                onClick={goToPreviousMonth}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                title="Previous Month"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              
              <div className="px-4 py-2 flex items-center">
                <Calendar size={18} className="text-blue-600 mr-2" />
                <span className="font-semibold text-lg text-gray-700">
                  {monthNames[currentDate.month]} {currentDate.year}
                </span>
              </div>
              
              <button 
                onClick={goToNextMonth}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                title="Next Month"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>
            
            {/* Búsqueda */}
            <form onSubmit={handleSearchSubmit} className="w-full lg:w-auto flex">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-l-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Search by component, inspector, or ID..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2.5 rounded-r-md hover:bg-blue-700 transition-colors duration-200"
              >
                Search
              </button>
            </form>
          </div>
          
          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center text-gray-700 font-medium mr-2">
              <ListFilter size={16} className="mr-2 text-blue-600" />
              <span>Status:</span>
            </div>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${selectedFilter === 'all' ? 'bg-blue-100 text-blue-800 border border-blue-200 shadow-sm' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
              onClick={() => handleFilterChange('all')}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center transition-all duration-200 transform hover:scale-105 ${selectedFilter === 'pass' ? 'bg-green-100 text-green-800 border border-green-200 shadow-sm' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
              onClick={() => handleFilterChange('pass')}
            >
              <Check size={14} className="mr-1" /> Accepted
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center transition-all duration-200 transform hover:scale-105 ${selectedFilter === 'reject' ? 'bg-red-100 text-red-800 border border-red-200 shadow-sm' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
              onClick={() => handleFilterChange('reject')}
            >
              <AlertTriangle size={14} className="mr-1" /> Rejected
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center transition-all duration-200 transform hover:scale-105 ${selectedFilter === 'in-progress' ? 'bg-blue-100 text-blue-800 border border-blue-200 shadow-sm' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
              onClick={() => handleFilterChange('in-progress')}
            >
              <FileWarning size={14} className="mr-1" /> In Progress
            </button>
          </div>
          
          {/* Loading state */}
          {loading && (
            <div className="flex flex-col justify-center items-center p-16">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Loading inspections...</p>
            </div>
          )}
          
          {/* Empty state */}
          {!loading && inspections.length === 0 && (
            <div className="bg-white p-12 rounded-lg text-center shadow-sm">
              <div className="text-gray-500 mb-4">
                <Database className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-medium text-gray-800 mb-3">No inspections found</h3>
                <p className="text-gray-600 mb-4">There are no inspections for {monthNames[currentDate.month]} {currentDate.year}.</p>
                <p className="text-gray-600">Try changing your search criteria, filters, or navigate to a different month.</p>
              </div>
            </div>
          )}
          
          {/* Inspection Table */}
          {!loading && inspections.length > 0 && (
            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Component
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Inspector
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Project
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inspections.map((inspection) => (
                    <tr 
                      key={inspection.id} 
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getInspectionDate(inspection)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getComponentName(inspection)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getComponentCode(inspection)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User size={14} className="text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {getInspectorName(inspection)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getProjectName(inspection)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(getInspectionStatus(inspection))}`}>
                          {getStatusText(getInspectionStatus(inspection))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button 
                            className="text-blue-600 hover:text-blue-900 transition-colors duration-150 flex items-center hover:bg-blue-50 p-1.5 rounded" 
                            title="View Report"
                            onClick={() => handleViewReport(inspection.id)}
                          >
                            <FileText size={18} />
                          </button>
                          <button 
                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150 flex items-center hover:bg-indigo-50 p-1.5 rounded" 
                            title="View Details"
                            onClick={() => handleViewDetails(inspection.id)}
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900 transition-colors duration-150 flex items-center hover:bg-red-50 p-1.5 rounded" 
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
          
          {/* Summary footer con estadísticas */}
          {!loading && inspections.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-600">
                Showing {inspections.length} inspections for {monthNames[currentDate.month]} {currentDate.year}
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm font-medium">
                    {inspections.filter(insp => getInspectionStatus(insp) === 'pass').length} Accepted
                  </span>
                </div>
                
                <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm font-medium">
                    {inspections.filter(insp => getInspectionStatus(insp) === 'reject').length} Rejected
                  </span>
                </div>
                
                <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm font-medium">
                    {inspections.filter(insp => getInspectionStatus(insp) === 'in-progress').length} In Progress
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Footer de navegación por mes */}
          <div className="flex items-center justify-between bg-white px-6 py-4 border-t border-gray-200 rounded-b-lg mt-6">
            <button
              className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-150"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft size={18} className="mr-1" />
              {monthNames[(currentDate.month === 0 ? 11 : currentDate.month - 1)]} {currentDate.month === 0 ? currentDate.year - 1 : currentDate.year}
            </button>
            
            <div className="hidden sm:block text-sm text-gray-700">
              <button
                onClick={() => {
                  const now = new Date();
                  setCurrentDate({
                    month: now.getMonth(),
                    year: now.getFullYear()
                  });
                }}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors font-medium"
              >
                Current Month
              </button>
            </div>
            
            <button
              className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-150"
              onClick={goToNextMonth}
            >
              {monthNames[(currentDate.month === 11 ? 0 : currentDate.month + 1)]} {currentDate.month === 11 ? currentDate.year + 1 : currentDate.year}
              <ChevronRight size={18} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Estilos para animaciones */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DatabaseView;