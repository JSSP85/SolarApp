// src/components/non-conformity/panels/DatabasePanel.jsx
import React, { useState, useMemo } from 'react';
import { useNonConformity } from '../../../context/NonConformityContext';
// ✅ AGREGAR IMPORT DE UTILIDADES DE FECHA SEGURAS
import { safeParseDate, safeDateCompare } from '../../../utils/dateUtils';

const DatabasePanel = () => {
  const { state, dispatch, helpers } = useNonConformity();
  const { ncList } = state;
  
  // Local state for database management
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    project: 'all',
    supplier: 'all',
    dateRange: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'createdDate',
    direction: 'desc'
  });
  const [selectedNCs, setSelectedNCs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table', 'cards'

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle row selection
  const handleRowSelect = (ncId) => {
    setSelectedNCs(prev => {
      if (prev.includes(ncId)) {
        return prev.filter(id => id !== ncId);
      } else {
        return [...prev, ncId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedNCs.length === filteredAndSortedNCs.length) {
      setSelectedNCs([]);
    } else {
      setSelectedNCs(filteredAndSortedNCs.map(nc => nc.id));
    }
  };

  // Filter and sort NCs - ✅ CON CORRECCIONES DE FECHAS SEGURAS
  const filteredAndSortedNCs = useMemo(() => {
    let filtered = [...ncList];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(nc => 
        nc.number.toLowerCase().includes(searchLower) ||
        nc.project.toLowerCase().includes(searchLower) ||
        (nc.supplier && nc.supplier.toLowerCase().includes(searchLower)) ||
        nc.description.toLowerCase().includes(searchLower) ||
        (nc.component && nc.component.toLowerCase().includes(searchLower)) ||
        nc.createdBy.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(nc => nc.status === filters.status);
    }
    
    // Apply priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(nc => nc.priority === filters.priority);
    }
    
    // Apply project filter
    if (filters.project !== 'all') {
      filtered = filtered.filter(nc => nc.project === filters.project);
    }
    
    // Apply supplier filter
    if (filters.supplier !== 'all') {
      filtered = filtered.filter(nc => nc.supplier === filters.supplier);
    }
    
    // Apply date range filter - ✅ CON FECHAS SEGURAS
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      // ✅ CAMBIO: USAR FUNCIÓN SEGURA PARA FECHAS
      filtered = filtered.filter(nc => {
        const createdDate = safeParseDate(nc.createdDate);
        return createdDate >= cutoffDate;
      });
    }
    
    // Apply custom date range - ✅ CON FECHAS SEGURAS
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      // ✅ CAMBIO: USAR FUNCIÓN SEGURA PARA FECHAS
      filtered = filtered.filter(nc => {
        const createdDate = safeParseDate(nc.createdDate);
        return createdDate >= fromDate;
      });
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      // ✅ CAMBIO: USAR FUNCIÓN SEGURA PARA FECHAS
      filtered = filtered.filter(nc => {
        const createdDate = safeParseDate(nc.createdDate);
        return createdDate <= toDate;
      });
    }
    
    // Apply sorting - ✅ CON ORDENAMIENTO SEGURO
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // ✅ CAMBIO: MANEJO SEGURO DE FECHAS
      if (sortConfig.key === 'createdDate' || sortConfig.key === 'actualClosureDate') {
        return safeDateCompare(aVal || '', bVal || '', sortConfig.direction);
      }
      
      // Handle numeric sorting
      if (sortConfig.key === 'daysOpen') {
        aVal = aVal || 0;
        bVal = bVal || 0;
      }
      
      if (aVal < bVal) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return filtered;
  }, [ncList, searchTerm, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedNCs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNCs = filteredAndSortedNCs.slice(startIndex, endIndex);

  // Get unique values for filter options
  const uniqueProjects = [...new Set(ncList.map(nc => nc.project))];
  const uniqueSuppliers = [...new Set(ncList.map(nc => nc.supplier).filter(Boolean))];

  // Handle bulk actions
  const handleBulkAction = (action) => {
    if (selectedNCs.length === 0) return;
    
    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedNCs.length} selected NC(s)?`)) {
          selectedNCs.forEach(ncId => {
            dispatch({ type: 'DELETE_NC', payload: ncId });
          });
          setSelectedNCs([]);
        }
        break;
      case 'export':
        console.log('Exporting selected NCs:', selectedNCs);
        // TODO: Implement export functionality
        break;
      case 'mark_resolved':
        selectedNCs.forEach(ncId => {
          dispatch({
            type: 'UPDATE_NC',
            payload: {
              id: ncId,
              updates: { 
                status: 'resolved',
                actualClosureDate: new Date().toLocaleDateString('en-GB')
              }
            }
          });
        });
        setSelectedNCs([]);
        break;
      default:
        break;
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    const classes = {
      'open': 'nc-status-open',
      'progress': 'nc-status-progress',
      'resolved': 'nc-status-resolved',
      'closed': 'nc-status-closed'
    };
    return classes[status] || 'nc-status-open';
  };

  // Get priority badge class
  const getPriorityBadgeClass = (priority) => {
    const classes = {
      'critical': 'nc-priority-critical',
      'major': 'nc-priority-major',
      'minor': 'nc-priority-minor'
    };
    return classes[priority] || 'nc-priority-minor';
  };

  // Handle individual NC actions
  const handleNCAction = (nc, action) => {
    switch (action) {
      case 'view':
        dispatch({ type: 'SET_CURRENT_NC', payload: nc });
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'tracking' });
        break;
      case 'edit':
        dispatch({ type: 'SET_CURRENT_NC', payload: nc });
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'create' });
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete NC ${nc.number}?`)) {
          dispatch({ type: 'DELETE_NC', payload: nc.id });
        }
        break;
      case 'pdf':
        console.log('Generating PDF for NC:', nc.number);
        // TODO: Implement PDF generation
        break;
      default:
        break;
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      project: 'all',
      supplier: 'all',
      dateRange: 'all',
      dateFrom: '',
      dateTo: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="nc-database-panel">
      <div className="nc-panel-card">
        <div className="nc-panel-header">
          <h3 className="nc-panel-title">
            <span className="nc-panel-icon">🗄️</span>
            Non-Conformity Database
          </h3>
          <div className="nc-database-summary">
            <span className="nc-summary-item">
              <strong>{filteredAndSortedNCs.length}</strong> of <strong>{ncList.length}</strong> NCs
            </span>
            {selectedNCs.length > 0 && (
              <span className="nc-summary-item nc-selected">
                <strong>{selectedNCs.length}</strong> selected
              </span>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="nc-database-filters">
          <div className="nc-filters-row">
            {/* Search */}
            <div className="nc-form-group nc-search-group">
              <input
                type="text"
                className="nc-form-input nc-search-input"
                placeholder="Search NCs by number, project, supplier, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="nc-form-group">
              <select
                className="nc-form-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="nc-form-group">
              <select
                className="nc-form-select"
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="all">All Priority</option>
                <option value="critical">Critical</option>
                <option value="major">Major</option>
                <option value="minor">Minor</option>
              </select>
            </div>

            {/* Project Filter */}
            <div className="nc-form-group">
              <select
                className="nc-form-select"
                value={filters.project}
                onChange={(e) => handleFilterChange('project', e.target.value)}
              >
                <option value="all">All Projects</option>
                {uniqueProjects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="nc-form-group">
              <select
                className="nc-form-select"
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>

          {/* Custom Date Range */}
          <div className="nc-filters-row">
            <div className="nc-form-group">
              <label className="nc-form-label">From Date:</label>
              <input
                type="date"
                className="nc-form-input"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            <div className="nc-form-group">
              <label className="nc-form-label">To Date:</label>
              <input
                type="date"
                className="nc-form-input"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            {/* View Mode Toggle */}
            <div className="nc-view-toggle">
              <button
                className={`nc-btn nc-btn-small ${viewMode === 'table' ? 'nc-btn-primary' : 'nc-btn-ghost'}`}
                onClick={() => setViewMode('table')}
              >
                📋 Table
              </button>
              <button
                className={`nc-btn nc-btn-small ${viewMode === 'cards' ? 'nc-btn-primary' : 'nc-btn-ghost'}`}
                onClick={() => setViewMode('cards')}
              >
                📄 Cards
              </button>
            </div>

            {/* Clear Filters */}
            <button
              className="nc-btn nc-btn-ghost nc-btn-small"
              onClick={clearAllFilters}
            >
              🔄 Clear Filters
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNCs.length > 0 && (
          <div className="nc-bulk-actions">
            <span className="nc-bulk-text">{selectedNCs.length} item(s) selected</span>
            <div className="nc-bulk-buttons">
              <button
                className="nc-btn nc-btn-success nc-btn-small"
                onClick={() => handleBulkAction('mark_resolved')}
              >
                ✅ Mark Resolved
              </button>
              <button
                className="nc-btn nc-btn-secondary nc-btn-small"
                onClick={() => handleBulkAction('export')}
              >
                📊 Export
              </button>
              <button
                className="nc-btn nc-btn-danger nc-btn-small"
                onClick={() => handleBulkAction('delete')}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        )}

        {/* Data Display */}
        {filteredAndSortedNCs.length > 0 ? (
          <>
            {/* Table View */}
            {viewMode === 'table' && (
              <div className="nc-table-container">
                <table className="nc-table">
                  <thead>
                    <tr>
                      <th className="nc-checkbox-col">
                        <input
                          type="checkbox"
                          checked={selectedNCs.length === filteredAndSortedNCs.length}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th 
                        className="nc-sortable"
                        onClick={() => handleSort('number')}
                      >
                        NC Number
                        {sortConfig.key === 'number' && (
                          <span className="nc-sort-indicator">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="nc-sortable"
                        onClick={() => handleSort('priority')}
                      >
                        Priority
                        {sortConfig.key === 'priority' && (
                          <span className="nc-sort-indicator">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="nc-sortable"
                        onClick={() => handleSort('project')}
                      >
                        Project
                        {sortConfig.key === 'project' && (
                          <span className="nc-sort-indicator">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th>Supplier</th>
                      <th>Component</th>
                      <th 
                        className="nc-sortable"
                        onClick={() => handleSort('status')}
                      >
                        Status
                        {sortConfig.key === 'status' && (
                          <span className="nc-sort-indicator">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="nc-sortable"
                        onClick={() => handleSort('createdDate')}
                      >
                        Created
                        {sortConfig.key === 'createdDate' && (
                          <span className="nc-sort-indicator">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="nc-sortable"
                        onClick={() => handleSort('daysOpen')}
                      >
                        Days Open
                        {sortConfig.key === 'daysOpen' && (
                          <span className="nc-sort-indicator">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentNCs.map(nc => (
                      <tr key={nc.id} className={selectedNCs.includes(nc.id) ? 'nc-row-selected' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedNCs.includes(nc.id)}
                            onChange={() => handleRowSelect(nc.id)}
                          />
                        </td>
                        <td className="nc-table-number">
                          <strong>{nc.number}</strong>
                        </td>
                        <td>
                          <span className={`nc-status-badge ${getPriorityBadgeClass(nc.priority)}`}>
                            {nc.priority.toUpperCase()}
                          </span>
                        </td>
                        <td className="nc-table-project">{nc.project}</td>
                        <td className="nc-table-supplier">{nc.supplier || 'N/A'}</td>
                        <td className="nc-table-component">
                          {nc.component ? (
                            <span title={nc.component}>
                              {nc.component.length > 30 
                                ? `${nc.component.substring(0, 30)}...`
                                : nc.component
                              }
                            </span>
                          ) : 'N/A'}
                        </td>
                        <td>
                          <span className={`nc-status-badge ${getStatusBadgeClass(nc.status)}`}>
                            {nc.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="nc-table-date">{nc.createdDate}</td>
                        <td className="nc-table-days">
                          <span className={nc.daysOpen > 10 ? 'nc-days-warning' : ''}>
                            {nc.daysOpen || 0}
                          </span>
                        </td>
                        <td>
                          <div className="nc-table-actions">
                            <button
                              className="nc-btn nc-btn-ghost nc-btn-small"
                              onClick={() => handleNCAction(nc, 'view')}
                              title="View Details"
                            >
                              👁️
                            </button>
                            <button
                              className="nc-btn nc-btn-ghost nc-btn-small"
                              onClick={() => handleNCAction(nc, 'edit')}
                              title="Edit NC"
                            >
                              ✏️
                            </button>
                            <button
                              className="nc-btn nc-btn-ghost nc-btn-small"
                              onClick={() => handleNCAction(nc, 'pdf')}
                              title="Generate PDF"
                            >
                              📄
                            </button>
                            <button
                              className="nc-btn nc-btn-ghost nc-btn-small nc-btn-danger"
                              onClick={() => handleNCAction(nc, 'delete')}
                              title="Delete NC"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Cards View */}
            {viewMode === 'cards' && (
              <div className="nc-cards-container">
                {currentNCs.map(nc => (
                  <div key={nc.id} className="nc-card">
                    <div className="nc-card-header">
                      <div className="nc-card-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedNCs.includes(nc.id)}
                          onChange={() => handleRowSelect(nc.id)}
                        />
                      </div>
                      <div className="nc-card-number">{nc.number}</div>
                      <div className="nc-card-badges">
                        <span className={`nc-status-badge ${getPriorityBadgeClass(nc.priority)}`}>
                          {nc.priority.toUpperCase()}
                        </span>
                        <span className={`nc-status-badge ${getStatusBadgeClass(nc.status)}`}>
                          {nc.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="nc-card-content">
                      <h4 className="nc-card-title">{nc.project}</h4>
                      <p className="nc-card-description">
                        {nc.description.length > 100 
                          ? `${nc.description.substring(0, 100)}...`
                          : nc.description
                        }
                      </p>
                      <div className="nc-card-details">
                        <span><strong>Supplier:</strong> {nc.supplier || 'N/A'}</span>
                        <span><strong>Created:</strong> {nc.createdDate}</span>
                        <span><strong>Days Open:</strong> {nc.daysOpen || 0}</span>
                      </div>
                    </div>
                    <div className="nc-card-actions">
                      <button
                        className="nc-btn nc-btn-primary nc-btn-small"
                        onClick={() => handleNCAction(nc, 'view')}
                      >
                        👁️ View
                      </button>
                      <button
                        className="nc-btn nc-btn-secondary nc-btn-small"
                        onClick={() => handleNCAction(nc, 'edit')}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="nc-btn nc-btn-ghost nc-btn-small"
                        onClick={() => handleNCAction(nc, 'pdf')}
                      >
                        📄 PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="nc-pagination">
              <div className="nc-pagination-info">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedNCs.length)} of {filteredAndSortedNCs.length} NCs
              </div>
              
              <div className="nc-pagination-controls">
                <select
                  className="nc-form-select nc-select-small"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                
                <div className="nc-pagination-buttons">
                  <button
                    className="nc-btn nc-btn-ghost nc-btn-small"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>
                  
                  <span className="nc-pagination-current">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    className="nc-btn nc-btn-ghost nc-btn-small"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="nc-empty-state">
            <span className="nc-empty-icon">🔍</span>
            <h4>No Non-Conformities Found</h4>
            <p>
              {searchTerm || Object.values(filters).some(f => f !== 'all' && f !== '')
                ? 'No NCs match your current search and filter criteria.'
                : 'No non-conformities have been created yet.'
              }
            </p>
            <div className="nc-empty-actions">
              {searchTerm || Object.values(filters).some(f => f !== 'all' && f !== '') ? (
                <button
                  className="nc-btn nc-btn-ghost"
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </button>
              ) : (
                <button
                  className="nc-btn nc-btn-primary"
                  onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'create' })}
                >
                  <span className="nc-btn-icon">➕</span>
                  Create First NC
                </button>
              )}
            </div>
          </div>
        )}

        {/* Database Actions */}
        <div className="nc-database-actions">
          <button
            className="nc-btn nc-btn-secondary"
            onClick={() => console.log('Exporting all filtered NCs...')}
          >
            <span className="nc-btn-icon">📊</span>
            Export Filtered Data
          </button>
          <button
            className="nc-btn nc-btn-ghost"
            onClick={() => window.location.reload()}
          >
            <span className="nc-btn-icon">🔄</span>
            Refresh Data
          </button>
          <button
            className="nc-btn nc-btn-primary"
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'create' })}
          >
            <span className="nc-btn-icon">➕</span>
            Create New NC
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabasePanel;