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

  // ✅ SOLUCIÓN: NO useEffect - el contexto ya carga los datos automáticamente

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
        case '3months':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'custom':
          // Custom date range handled separately
          break;
      }
      
      if (filters.dateRange !== 'custom') {
        filtered = filtered.filter(nc => {
          const ncDate = safeParseDate(nc.createdDate);
          return ncDate && safeDateCompare(ncDate, cutoffDate) >= 0;
        });
      }
    }
    
    // Apply custom date range
    if (filters.dateRange === 'custom' && (filters.dateFrom || filters.dateTo)) {
      filtered = filtered.filter(nc => {
        const ncDate = safeParseDate(nc.createdDate);
        if (!ncDate) return false;
        
        if (filters.dateFrom) {
          const fromDate = safeParseDate(filters.dateFrom);
          if (fromDate && safeDateCompare(ncDate, fromDate) < 0) return false;
        }
        
        if (filters.dateTo) {
          const toDate = safeParseDate(filters.dateTo);
          if (toDate && safeDateCompare(ncDate, toDate) > 0) return false;
        }
        
        return true;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // Handle different data types
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
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

        {/* Filters and Search */}
        <div className="nc-database-filters">
          <div className="nc-filters-row">
            {/* Search */}
            <div className="nc-search-container">
              <input
                type="text"
                className="nc-search-input"
                placeholder="Search NCs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="nc-search-icon">🔍</span>
            </div>

            {/* Status Filter */}
            <select
              className="nc-filter-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            {/* Priority Filter */}
            <select
              className="nc-filter-select"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
              <option value="low">Low</option>
            </select>

            {/* Project Filter */}
            <select
              className="nc-filter-select"
              value={filters.project}
              onChange={(e) => handleFilterChange('project', e.target.value)}
            >
              <option value="all">All Projects</option>
              {uniqueProjects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>

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
                      <th>Days Open</th>
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
                            {nc.daysOpen} days
                          </span>
                        </td>
                        <td className="nc-table-actions">
                          <div className="nc-action-buttons">
                            <button
                              className="nc-action-btn nc-action-view"
                              onClick={() => handleNCAction(nc, 'view')}
                              title="View NC"
                            >
                              👁️
                            </button>
                            <button
                              className="nc-action-btn nc-action-edit"
                              onClick={() => handleNCAction(nc, 'edit')}
                              title="Edit NC"
                            >
                              ✏️
                            </button>
                            <button
                              className="nc-action-btn nc-action-pdf"
                              onClick={() => handleNCAction(nc, 'pdf')}
                              title="Generate PDF"
                            >
                              📄
                            </button>
                            <button
                              className="nc-action-btn nc-action-delete"
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
                  <div key={nc.id} className={`nc-card ${selectedNCs.includes(nc.id) ? 'nc-card-selected' : ''}`}>
                    <div className="nc-card-header">
                      <div className="nc-card-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedNCs.includes(nc.id)}
                          onChange={() => handleRowSelect(nc.id)}
                        />
                      </div>
                      <div className="nc-card-number">{nc.number}</div>
                      <div className={`nc-card-priority ${getPriorityBadgeClass(nc.priority)}`}>
                        {nc.priority}
                      </div>
                    </div>
                    <div className="nc-card-body">
                      <div className="nc-card-project">{nc.project}</div>
                      <div className="nc-card-description">
                        {nc.description?.substring(0, 100)}...
                      </div>
                      <div className="nc-card-meta">
                        <span className="nc-card-date">{nc.createdDate}</span>
                        <span className={`nc-card-status ${getStatusBadgeClass(nc.status)}`}>
                          {nc.status}
                        </span>
                      </div>
                    </div>
                    <div className="nc-card-actions">
                      <button
                        className="nc-card-btn nc-card-btn-view"
                        onClick={() => handleNCAction(nc, 'view')}
                      >
                        View
                      </button>
                      <button
                        className="nc-card-btn nc-card-btn-edit"
                        onClick={() => handleNCAction(nc, 'edit')}
                      >
                        Edit
                      </button>
                      <button
                        className="nc-card-btn nc-card-btn-pdf"
                        onClick={() => handleNCAction(nc, 'pdf')}
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="nc-pagination">
                <div className="nc-pagination-info">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedNCs.length)} of {filteredAndSortedNCs.length} entries
                </div>
                <div className="nc-pagination-controls">
                  <button
                    className="nc-pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage - 2 + i;
                    if (page < 1 || page > totalPages) return null;
                    return (
                      <button
                        key={page}
                        className={`nc-pagination-btn ${page === currentPage ? 'nc-pagination-active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    className="nc-pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="nc-empty-state">
            <span className="nc-empty-icon">📋</span>
            <h4 className="nc-empty-title">
              {searchTerm || Object.values(filters).some(f => f !== 'all' && f !== '') 
                ? 'No matching results found'
                : 'No non-conformities yet'
              }
            </h4>
            <p className="nc-empty-description">
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
            onClick={() => helpers.refreshFromFirebase()}
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
