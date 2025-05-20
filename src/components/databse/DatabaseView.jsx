// src/components/database/DatabaseView.jsx
import React, { useState, useEffect } from 'react';
import { useInspection } from '../../context/InspectionContext';
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
  Download
} from 'lucide-react';
import { deleteInspection } from '../../firebase/inspectionService';

const DatabaseView = () => {
  const { getAllInspections } = useInspection();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  // Load inspections on component mount
  useEffect(() => {
    loadInspections();
  }, []);

  // Load inspections when filters change
  useEffect(() => {
    applyFilters();
  }, [selectedFilter, dateRange, searchQuery]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Function to load all inspections
  const loadInspections = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllInspections();
      setInspections(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setLoading(false);
    } catch (err) {
      console.error("Error loading inspections:", err);
      setError("Failed to load inspections. Please try again.");
      setLoading(false);
    }
  };

  // Function to apply filters
  const applyFilters = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create filters object for backend
      const filters = {
        status: selectedFilter !== 'all' ? selectedFilter : undefined,
        dateStart: dateRange.start || undefined,
        dateEnd: dateRange.end || undefined,
        search: searchQuery || undefined
      };
      
      // Get filtered inspections
      const data = await getAllInspections(filters);
      
      setInspections(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setCurrentPage(1); // Reset to first page when filters change
      setLoading(false);
    } catch (err) {
      console.error("Error applying filters:", err);
      setError("Failed to filter inspections. Please try again.");
      setLoading(false);
    }
  };

  // Function to delete an inspection
  const handleDelete = async (id) => {
    // Use a more elaborate confirmation dialog
    if (window.confirm("Are you sure you want to delete this inspection? This action cannot be undone.")) {
      try {
        setLoading(true);
        await deleteInspection(id);
        
        // Show success message
        setSuccessMessage("Inspection deleted successfully");
        
        // Reload inspections
        await loadInspections();
      } catch (err) {
        console.error("Error deleting inspection:", err);
        setError("Failed to delete inspection. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Function to export data as CSV
  const exportToCSV = () => {
    try {
      // Create CSV header
      const headers = [
        'ID', 
        'Date', 
        'Component Name', 
        'Component Code', 
        'Inspector', 
        'Status'
      ];
      
      // Create CSV rows from inspections
      const rows = inspections.map(insp => [
        insp.id,
        insp.inspectionDate,
        insp.componentName || 'Unknown',
        insp.componentCode || 'N/A',
        insp.inspector || 'Unknown',
        getStatusText(insp.inspectionStatus)
      ]);
      
      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `inspections_export_${new Date().toISOString().slice(0,10)}.csv`);
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

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return inspections.slice(startIndex, endIndex);
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  // Handle search input change
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle date range change
  const handleDateChange = (field, value) => {
    setDateRange({
      ...dateRange,
      [field]: value
    });
  };

  // Handle pagination
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle view report
  const handleViewReport = (inspectionId) => {
    // In a real implementation, this would navigate to the report view
    // For now, we'll just show an alert
    alert(`Viewing report for inspection ${inspectionId}`);
  };

  // Handle view details
  const handleViewDetails = (inspectionId) => {
    // In a real implementation, this would navigate to the detail view
    // For now, we'll just show an alert
    alert(`Viewing details for inspection ${inspectionId}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow">
      {/* Header section with export button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Database className="mr-2 text-blue-600" size={24} />
          Inspection Database
        </h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Total Records: {inspections.length}
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center px-3 py-2 bg-green-50 text-green-700 rounded-md border border-green-200 hover:bg-green-100 transition-colors"
            disabled={inspections.length === 0 || loading}
          >
            <Download size={16} className="mr-1" />
            Export CSV
          </button>
        </div>
      </div>
      
      {/* Success message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by component, inspector, or ID..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        
        <div className="flex space-x-2">
          <div className="flex items-center space-x-2">
            <Calendar size={18} className="text-gray-400" />
            <input
              type="date"
              className="border border-gray-300 rounded-md p-2 text-sm"
              value={dateRange.start}
              onChange={(e) => handleDateChange('start', e.target.value)}
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              className="border border-gray-300 rounded-md p-2 text-sm"
              value={dateRange.end}
              onChange={(e) => handleDateChange('end', e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium ${selectedFilter === 'all' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
          onClick={() => handleFilterChange('all')}
        >
          All
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${selectedFilter === 'pass' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
          onClick={() => handleFilterChange('pass')}
        >
          <Check size={14} className="mr-1" /> Accepted
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${selectedFilter === 'reject' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
          onClick={() => handleFilterChange('reject')}
        >
          <AlertTriangle size={14} className="mr-1" /> Rejected
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${selectedFilter === 'in-progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
          onClick={() => handleFilterChange('in-progress')}
        >
          <FileWarning size={14} className="mr-1" /> In Progress
        </button>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && inspections.length === 0 && (
        <div className="bg-gray-50 p-12 rounded-lg text-center">
          <div className="text-gray-500 mb-4">
            <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-800 mb-1">No inspections found</h3>
            <p>Try changing your search criteria or filters</p>
          </div>
        </div>
      )}
      
      {/* Inspection Table */}
      {!loading && inspections.length > 0 && (
        <>
          <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Component
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getCurrentPageItems().map((inspection) => (
                  <tr key={inspection.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inspection.inspectionDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{inspection.componentName || 'Unknown Component'}</div>
                      <div className="text-xs text-gray-500">{inspection.componentCode || 'No Code'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User size={14} className="text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{inspection.inspector || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inspection.project || inspection.client || 'No Project'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(inspection.inspectionStatus)}`}>
                        {getStatusText(inspection.inspectionStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900" 
                          title="View Report"
                          onClick={() => handleViewReport(inspection.id)}
                        >
                          <FileText size={18} />
                        </button>
                        <button 
                          className="text-indigo-600 hover:text-indigo-900" 
                          title="View Details"
                          onClick={() => handleViewDetails(inspection.id)}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900" 
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
          
          {/* Pagination */}
          <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 sm:px-6 mt-4">
            <div className="flex-1 flex justify-between sm:hidden">
              <button 
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button 
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, inspections.length)}
                  </span>{' '}
                  of <span className="font-medium">{inspections.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  {/* Page numbers */}
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        currentPage === index + 1
                          ? 'border-blue-500 bg-blue-50 text-blue-600 z-10'
                          : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                      onClick={() => goToPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={18} />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DatabaseView;