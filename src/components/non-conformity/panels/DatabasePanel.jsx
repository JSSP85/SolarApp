
// src/components/non-conformity/panels/DatabasePanel.jsx
import React, { useState, useMemo } from 'react';
import { useNonConformity } from '../../../context/NonConformityContext';
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
    setCurrentPage(1);
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

  // Filter and sort NCs
  const filteredAndSortedNCs = useMemo(() => {
    let filtered = ncList.filter(nc => {
      // Search filter
      const matchesSearch = !searchTerm || 
        nc.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nc.project?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nc.supplier?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = filters.status === 'all' || nc.status === filters.status;
      
      // Priority filter
      const matchesPriority = filters.priority === 'all' || nc.priority === filters.priority;
      
      // Project filter
      const matchesProject = filters.project === 'all' || nc.project === filters.project;
      
      // Supplier filter
      const matchesSupplier = filters.supplier === 'all' || nc.supplier === filters.supplier;

      // Date range filter
      let matchesDateRange = true;
      if (filters.dateRange !== 'all') {
        const ncDate = safeParseDate(nc.createdDate);
        const now = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            matchesDateRange = ncDate?.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDateRange = ncDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDateRange = ncDate >= monthAgo;
            break;
          case 'custom':
            if (filters.dateFrom && filters.dateTo) {
              const fromDate = safeParseDate(filters.dateFrom);
              const toDate = safeParseDate(filters.dateTo);
              matchesDateRange = ncDate >= fromDate && ncDate <= toDate;
            }
            break;
          default:
            matchesDateRange = true;
        }
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesSupplier && matchesDateRange;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // Handle different data types
      if (sortConfig.key === 'createdDate') {
        return safeDateCompare(aVal || '', bVal || '', sortConfig.direction);
      }
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal?.toLowerCase() || '';
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

  // ✅ MEJORADO: Handle bulk actions with Firebase
  const handleBulkAction = async (action) => {
    if (selectedNCs.length === 0) return;
    
    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedNCs.length} selected NC(s)?`)) {
          try {
            for (const ncId of selectedNCs) {
              await helpers.deleteNCFromFirebase(ncId);
            }
            setSelectedNCs([]);
            alert(`Successfully deleted ${selectedNCs.length} NC(s)`);
          } catch (error) {
            console.error('Error deleting NCs:', error);
            alert('Error deleting some NCs. Please try again.');
          }
        }
        break;
      case 'export':
        console.log('Exporting selected NCs:', selectedNCs);
        break;
      case 'mark_resolved':
        try {
          for (const ncId of selectedNCs) {
            await helpers.updateNCInFirebase(ncId, { 
              status: 'resolved',
              actualClosureDate: new Date().toLocaleDateString('en-GB')
            });
          }
          setSelectedNCs([]);
          alert(`Successfully marked ${selectedNCs.length} NC(s) as resolved`);
        } catch (error) {
          console.error('Error updating NCs:', error);
          alert('Error updating some NCs. Please try again.');
        }
        break;
      case 'mark_progress':
        try {
          for (const ncId of selectedNCs) {
            await helpers.updateNCInFirebase(ncId, { status: 'progress' });
          }
          setSelectedNCs([]);
          alert(`Successfully marked ${selectedNCs.length} NC(s) as in progress`);
        } catch (error) {
          console.error('Error updating NCs:', error);
          alert('Error updating some NCs. Please try again.');
        }
        break;
      default:
        break;
    }
  };

  // ✅ MEJORADO: Get status badge class with more colors
  const getStatusBadgeClass = (status) => {
    const classes = {
      'open': 'nc-status-open',
      'progress': 'nc-status-progress',
      'resolved': 'nc-status-resolved',
      'closed': 'nc-status-closed'
    };
    return classes[status] || 'nc-status-open';
  };

  // ✅ MEJORADO: Get priority badge class with 'low' option
  const getPriorityBadgeClass = (priority) => {
    const classes = {
      'critical': 'nc-priority-critical',
      'major': 'nc-priority-major',
      'minor': 'nc-priority-minor',
      'low': 'nc-priority-low'
    };
    return classes[priority] || 'nc-priority-minor';
  };

  // ✅ MEJORADO: Handle individual NC actions with Firebase
  const handleNCAction = async (nc, action) => {
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
          try {
            await helpers.deleteNCFromFirebase(nc.id);
            alert(`Successfully deleted NC ${nc.number}`);
          } catch (error) {
            console.error('Error deleting NC:', error);
            alert('Error deleting NC. Please try again.');
          }
        }
        break;
      case 'pdf':
        console.log('Generating PDF for NC:', nc.number);
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

  // Toggle bulk actions visibility
  const toggleBulkActions = () => {
    setShowBulkActions(!showBulkActions);
    if (!showBulkActions) {
      setSelectedNCs([]);
    }
  };

  return (
    <div className="nc-database-panel">
      {/* ✅ FONDO IGUAL AL DASHBOARD */}
      <div className="nc-panel-card nc-panel-card-enhanced">
        <div className="nc-panel-header">
          <h3 className="nc-panel-title">
            <span className="nc-panel-icon">🗄️</span>
            Non-Conformity Database
          </h3>
          <p className="nc-panel-subtitle">
            Complete database of all non-conformities with advanced search, filtering, and bulk operations
          </p>
        </div>

        {/* ✅ SEARCH Y CONTROLES MEJORADOS */}
        <div className="nc-database-controls">
          {/* Search Section */}
          <div className="nc-search-section">
            <div className="nc-search-input-group">
              <span className="nc-search-icon">🔍</span>
              <input
                type="text"
                className="nc-search-input nc-search-enhanced"
                placeholder="Search NCs by number, description, project, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* ✅ FILTROS MEJORADOS */}
          <div className="nc-filters-section">
            <div className="nc-filters-row">
              <div className="nc-filter-group">
                <label className="nc-filter-label">Status:</label>
                <select
                  className="nc-filter-select nc-select-enhanced"
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

              <div className="nc-filter-group">
                <label className="nc-filter-label">Priority:</label>
                <select
                  className="nc-filter-select nc-select-enhanced"
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="major">Major</option>
                  <option value="minor">Minor</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="nc-filter-group">
                <label className="nc-filter-label">Project:</label>
                <select
                  className="nc-filter-select nc-select-enhanced"
                  value={filters.project}
                  onChange={(e) => handleFilterChange('project', e.target.value)}
                >
                  <option value="all">All Projects</option>
                  {uniqueProjects.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              </div>

              <div className="nc-filter-group">
                <label className="nc-filter-label">Supplier:</label>
                <select
                  className="nc-filter-select nc-select-enhanced"
                  value={filters.supplier}
                  onChange={(e) => handleFilterChange('supplier', e.target.value)}
                >
                  <option value="all">All Suppliers</option>
                  {uniqueSuppliers.map(supplier => (
                    <option key={supplier} value={supplier}>{supplier}</option>
                  ))}
                </select>
              </div>

              <div className="nc-filter-group">
                <label className="nc-filter-label">Date Range:</label>
                <select
                  className="nc-filter-select nc-select-enhanced"
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <div className="nc-custom-date-range">
                <div className="nc-filter-group">
                  <label className="nc-filter-label">From:</label>
                  <input
                    type="date"
                    className="nc-filter-input nc-input-enhanced"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </div>
                <div className="nc-filter-group">
                  <label className="nc-filter-label">To:</label>
                  <input
                    type="date"
                    className="nc-filter-input nc-input-enhanced"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ✅ VIEW CONTROLS MEJORADOS */}
          <div className="nc-view-controls">
            <div className="nc-items-per-page">
              <label className="nc-filter-label">Show:</label>
              <select
                className="nc-filter-select nc-select-small nc-select-enhanced"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="nc-view-mode-toggle nc-toggle-enhanced">
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

            <button
              className={`nc-btn nc-btn-small nc-btn-enhanced ${showBulkActions ? 'nc-btn-warning' : 'nc-btn-secondary'}`}
              onClick={toggleBulkActions}
            >
              {showBulkActions ? '❌ Cancel Bulk' : '☑️ Bulk Actions'}
            </button>

            <button
              className="nc-btn nc-btn-ghost nc-btn-small nc-btn-enhanced"
              onClick={clearAllFilters}
            >
              🔄 Clear Filters
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="nc-results-summary nc-summary-enhanced">
          <div className="nc-results-text">
            Showing {filteredAndSortedNCs.length} of {ncList.length} non-conformities
            {searchTerm && ` for "${searchTerm}"`}
          </div>
          <div className="nc-results-meta">
            {selectedNCs.length > 0 && (
              <span className="nc-selected-count nc-count-enhanced">{selectedNCs.length} selected</span>
            )}
          </div>
        </div>

        {/* ✅ BULK ACTIONS MEJORADAS */}
        {showBulkActions && selectedNCs.length > 0 && (
          <div className="nc-bulk-actions nc-bulk-enhanced">
            <span className="nc-bulk-text">{selectedNCs.length} item(s) selected</span>
            <div className="nc-bulk-buttons">
              <button
                className="nc-btn nc-btn-warning nc-btn-small nc-btn-enhanced"
                onClick={() => handleBulkAction('mark_progress')}
              >
                🔄 Mark In Progress
              </button>
              <button
                className="nc-btn nc-btn-success nc-btn-small nc-btn-enhanced"
                onClick={() => handleBulkAction('mark_resolved')}
              >
                ✅ Mark Resolved
              </button>
              <button
                className="nc-btn nc-btn-secondary nc-btn-small nc-btn-enhanced"
                onClick={() => handleBulkAction('export')}
              >
                📊 Export Selected
              </button>
              <button
                className="nc-btn nc-btn-danger nc-btn-small nc-btn-enhanced"
                onClick={() => handleBulkAction('delete')}
              >
                🗑️ Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Data Display */}
        {filteredAndSortedNCs.length > 0 ? (
          <>
            {/* ✅ TABLE VIEW MEJORADA */}
            {viewMode === 'table' && (
              <div className="nc-table-container nc-table-enhanced">
                <table className="nc-table">
                  <thead>
                    <tr>
                      {showBulkActions && (
                        <th className="nc-checkbox-col">
                          <input
                            type="checkbox"
                            checked={selectedNCs.length === filteredAndSortedNCs.length}
                            onChange={handleSelectAll}
                          />
                        </th>
                      )}
                      <th 
                        className="nc-sortable nc-sortable-enhanced"
                        onClick={() => handleSort('number')}
                      >
                        NC Number
                        {sortConfig.key === 'number' && (
                          <span className="nc-sort-indicator">
                            {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="nc-sortable nc-sortable-enhanced"
                        onClick={() => handleSort('priority')}
                      >
                        Priority
                        {sortConfig.key === 'priority' && (
                          <span className="nc-sort-indicator">
                            {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="nc-sortable nc-sortable-enhanced"
                        onClick={() => handleSort('project')}
                      >
                        Project
                        {sortConfig.key === 'project' && (
                          <span className="nc-sort-indicator">
                            {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                          </span>
                        )}
                      </th>
                      <th>Supplier</th>
                      <th>Description</th>
                      <th 
                        className="nc-sortable nc-sortable-enhanced"
                        onClick={() => handleSort('status')}
                      >
                        Status
                        {sortConfig.key === 'status' && (
                          <span className="nc-sort-indicator">
                            {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="nc-sortable nc-sortable-enhanced"
                        onClick={() => handleSort('createdDate')}
                      >
                        Created
                        {sortConfig.key === 'createdDate' && (
                          <span className="nc-sort-indicator">
                            {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                          </span>
                        )}
                      </th>
                      <th>Days Open</th>
                      <th className="nc-actions-col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentNCs.map(nc => (
                      <tr key={nc.id} className={selectedNCs.includes(nc.id) ? 'nc-row-selected' : ''}>
                        {showBulkActions && (
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedNCs.includes(nc.id)}
                              onChange={() => handleRowSelect(nc.id)}
                            />
                          </td>
                        )}
                        <td className="nc-table-nc-number">
                          <span className="nc-number-badge">{nc.number}</span>
                        </td>
                        <td>
                          {/* ✅ BADGES MEJORADOS */}
                          <span className={`nc-table-priority nc-badge-enhanced ${getPriorityBadgeClass(nc.priority)}`}>
                            {nc.priority?.toUpperCase()}
                          </span>
                        </td>
                        <td className="nc-table-project">{nc.project}</td>
                        <td className="nc-table-supplier">{nc.supplier || 'N/A'}</td>
                        <td className="nc-table-description">
                          <span title={nc.description}>
                            {nc.description?.substring(0, 60)}...
                          </span>
                        </td>
                        <td>
                          {/* ✅ BADGES MEJORADOS */}
                          <span className={`nc-table-status nc-badge-enhanced ${getStatusBadgeClass(nc.status)}`}>
                            {nc.status?.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="nc-table-date">{nc.createdDate}</td>
                        <td className="nc-table-days">
                          <span className={`nc-days-badge ${nc.daysOpen > 30 ? 'nc-days-warning' : ''}`}>
                            {nc.daysOpen || 0} days
                          </span>
                        </td>
                        <td className="nc-table-actions">
                          {/* ✅ BOTONES MEJORADOS */}
                          <div className="nc-action-buttons nc-actions-enhanced">
                            <button
                              className="nc-action-btn nc-action-view nc-action-enhanced"
                              onClick={() => handleNCAction(nc, 'view')}
                              title="View NC Details"
                            >
                              👁️
                            </button>
                            <button
                              className="nc-action-btn nc-action-edit nc-action-enhanced"
                              onClick={() => handleNCAction(nc, 'edit')}
                              title="Edit NC"
                            >
                              ✏️
                            </button>
                            <button
                              className="nc-action-btn nc-action-pdf nc-action-enhanced"
                              onClick={() => handleNCAction(nc, 'pdf')}
                              title="Generate PDF Report"
                            >
                              📄
                            </button>
                            <button
                              className="nc-action-btn nc-action-delete nc-action-enhanced"
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

            {/* ✅ CARDS VIEW MEJORADAS */}
            {viewMode === 'cards' && (
              <div className="nc-cards-container nc-cards-enhanced">
                {currentNCs.map(nc => (
                  <div key={nc.id} className={`nc-card nc-card-enhanced ${selectedNCs.includes(nc.id) ? 'nc-card-selected' : ''}`}>
                    <div className="nc-card-header">
                      {showBulkActions && (
                        <div className="nc-card-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedNCs.includes(nc.id)}
                            onChange={() => handleRowSelect(nc.id)}
                          />
                        </div>
                      )}
                      <div className="nc-card-title">
                        <span className="nc-card-number nc-number-badge">{nc.number}</span>
                      </div>
                      <div className="nc-card-badges">
                        <span className={`nc-card-priority nc-badge-enhanced ${getPriorityBadgeClass(nc.priority)}`}>
                          {nc.priority?.toUpperCase()}
                        </span>
                        <span className={`nc-card-status nc-badge-enhanced ${getStatusBadgeClass(nc.status)}`}>
                          {nc.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="nc-card-content">
                      <div className="nc-card-field">
                        <strong>Project:</strong> {nc.project}
                      </div>
                      <div className="nc-card-field">
                        <strong>Supplier:</strong> {nc.supplier || 'N/A'}
                      </div>
                      <div className="nc-card-field">
                        <strong>Created:</strong> {nc.createdDate}
                      </div>
                      <div className="nc-card-field">
                        <strong>Days Open:</strong> 
                        <span className={`nc-days-badge ${nc.daysOpen > 30 ? 'nc-days-warning' : ''}`}>
                          {nc.daysOpen || 0} days
                        </span>
                      </div>
                      <div className="nc-card-description">
                        {nc.description?.substring(0, 120)}...
                      </div>
                    </div>
                    <div className="nc-card-actions">
                      <button
                        className="nc-card-btn nc-card-btn-view nc-card-btn-enhanced"
                        onClick={() => handleNCAction(nc, 'view')}
                      >
                        👁️ View
                      </button>
                      <button
                        className="nc-card-btn nc-card-btn-edit nc-card-btn-enhanced"
                        onClick={() => handleNCAction(nc, 'edit')}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="nc-card-btn nc-card-btn-pdf nc-card-btn-enhanced"
                        onClick={() => handleNCAction(nc, 'pdf')}
                      >
                        📄 PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ✅ PAGINACIÓN MEJORADA */}
            {totalPages > 1 && (
              <div className="nc-pagination nc-pagination-enhanced">
                <div className="nc-pagination-info">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedNCs.length)} of {filteredAndSortedNCs.length} entries
                </div>
                <div className="nc-pagination-controls">
                  <button
                    className="nc-pagination-btn nc-btn-enhanced"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage - 2 + i;
                    if (page < 1 || page > totalPages) return null;
                    return (
                      <button
                        key={page}
                        className={`nc-pagination-btn nc-btn-enhanced ${page === currentPage ? 'nc-pagination-active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    className="nc-pagination-btn nc-btn-enhanced"
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
          /* ✅ EMPTY STATE MEJORADO */
          <div className="nc-empty-state nc-empty-enhanced">
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
                  className="nc-btn nc-btn-ghost nc-btn-enhanced"
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </button>
              ) : (
                <button
                  className="nc-btn nc-btn-primary nc-btn-enhanced"
                  onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'create' })}
                >
                  <span className="nc-btn-icon">➕</span>
                  Create First NC
                </button>
              )}
            </div>
          </div>
        )}

        {/* ✅ DATABASE ACTIONS MEJORADAS */}
        <div className="nc-database-actions nc-actions-enhanced">
          <button
            className="nc-btn nc-btn-secondary nc-btn-enhanced"
            onClick={() => console.log('Exporting all filtered NCs...')}
          >
            <span className="nc-btn-icon">📊</span>
            Export Filtered Data
          </button>
          <button
            className="nc-btn nc-btn-ghost nc-btn-enhanced"
            onClick={() => helpers.refreshFromFirebase()}
          >
            <span className="nc-btn-icon">🔄</span>
            Refresh Data
          </button>
          <button
            className="nc-btn nc-btn-primary nc-btn-enhanced"
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'create' })}
          >
            <span className="nc-btn-icon">➕</span>
            Create New NC
          </button>
        </div>
      </div>

      {/* ✅ ESTILOS CSS INTEGRADOS */}
      <style jsx>{`
        /* 🎨 FONDO PRINCIPAL - IGUAL AL DASHBOARD */
        .nc-panel-card-enhanced {
          background: rgba(0, 95, 131, 0.75) !important;
          backdrop-filter: blur(15px) !important;
          -webkit-backdrop-filter: blur(15px) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          box-shadow: 0 8px 32px rgba(0, 95, 131, 0.3) !important;
        }

        /* 🏷️ HEADER - TEXTO BLANCO */
        .nc-database-panel .nc-panel-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
          background: transparent !important;
        }

        .nc-database-panel .nc-panel-title,
        .nc-database-panel .nc-panel-subtitle {
          color: white !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
        }

        /* 📊 SECCIONES INTERNAS - FONDO CLARO */
        .nc-database-controls,
        .nc-summary-enhanced,
        .nc-bulk-enhanced,
        .nc-table-enhanced,
        .nc-cards-enhanced,
        .nc-pagination-enhanced,
        .nc-empty-enhanced,
        .nc-actions-enhanced {
          background: rgba(255, 255, 255, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          border-radius: 12px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          margin-bottom: 1.5rem !important;
          padding: 1.5rem !important;
        }

        /* 🔍 SEARCH MEJORADO */
        .nc-search-enhanced {
          background: white !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 12px !important;
          padding: 1rem 1rem 1rem 3rem !important;
          font-size: 1rem !important;
          color: #374151 !important;
          width: 100% !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
        }

        .nc-search-enhanced:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          outline: none !important;
        }

        .nc-search-input-group {
          position: relative !important;
        }

        .nc-search-icon {
          position: absolute !important;
          left: 1rem !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          font-size: 1.25rem !important;
          color: #6b7280 !important;
          z-index: 2 !important;
        }

        /* 📋 SELECTS MEJORADOS */
        .nc-select-enhanced {
          background: white !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 8px !important;
          padding: 0.75rem 2.5rem 0.75rem 1rem !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          color: #374151 !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
          background-image: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'><path fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /></svg>") !important;
          background-repeat: no-repeat !important;
          background-position: right 0.75rem center !important;
          background-size: 1rem !important;
          appearance: none !important;
        }

        .nc-select-enhanced:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          outline: none !important;
        }

        .nc-select-enhanced:hover {
          border-color: #9ca3af !important;
        }

        /* 🏷️ LABELS MEJORADOS */
        .nc-filter-label {
          color: #374151 !important;
          font-size: 0.875rem !important;
          font-weight: 600 !important;
          margin-bottom: 0.5rem !important;
          display: block !important;
        }

        /* 🎨 BADGES MEJORADOS */
        .nc-badge-enhanced {
          display: inline-flex !important;
          align-items: center !important;
          padding: 0.375rem 0.75rem !important;
          border-radius: 6px !important;
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.025em !important;
          transition: all 0.2s ease !important;
        }

        /* Status Colors */
        .nc-status-open {
          background: linear-gradient(135deg, #fef3c7, #f59e0b) !important;
          color: #92400e !important;
          box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2) !important;
        }

        .nc-status-progress {
          background: linear-gradient(135deg, #dbeafe, #3b82f6) !important;
          color: #1e40af !important;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
        }

        .nc-status-resolved {
          background: linear-gradient(135deg, #d1fae5, #10b981) !important;
          color: #065f46 !important;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2) !important;
        }

        .nc-status-closed {
          background: linear-gradient(135deg, #f3f4f6, #6b7280) !important;
          color: #374151 !important;
          box-shadow: 0 2px 4px rgba(107, 114, 128, 0.2) !important;
        }

        /* Priority Colors */
        .nc-priority-critical {
          background: linear-gradient(135deg, #fee2e2, #ef4444) !important;
          color: #991b1b !important;
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3) !important;
          animation: pulse-critical 2s infinite !important;
        }

        .nc-priority-major {
          background: linear-gradient(135deg, #fed7aa, #f97316) !important;
          color: #9a3412 !important;
          box-shadow: 0 2px 4px rgba(249, 115, 22, 0.2) !important;
        }

        .nc-priority-minor {
          background: linear-gradient(135deg, #fef3c7, #eab308) !important;
          color: #a16207 !important;
          box-shadow: 0 2px 4px rgba(234, 179, 8, 0.2) !important;
        }

        .nc-priority-low {
          background: linear-gradient(135deg, #f0f9ff, #0ea5e9) !important;
          color: #0c4a6e !important;
          box-shadow: 0 2px 4px rgba(14, 165, 233, 0.2) !important;
        }

        @keyframes pulse-critical {
          0%, 100% { box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3); }
          50% { box-shadow: 0 4px 8px rgba(239, 68, 68, 0.5), 0 0 0 3px rgba(239, 68, 68, 0.1); }
        }

        /* 📊 TABLA MEJORADA */
        .nc-table {
          width: 100% !important;
          background: white !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
          border-collapse: separate !important;
          border-spacing: 0 !important;
        }

        .nc-table th {
          background: linear-gradient(135deg, #f8fafc, #e2e8f0) !important;
          color: #374151 !important;
          font-weight: 600 !important;
          font-size: 0.875rem !important;
          padding: 1rem !important;
          text-align: left !important;
          border-bottom: 2px solid #e5e7eb !important;
          position: sticky !important;
          top: 0 !important;
          z-index: 10 !important;
        }

        .nc-table td {
          padding: 1rem !important;
          border-bottom: 1px solid #f3f4f6 !important;
          color: #374151 !important;
          font-size: 0.875rem !important;
          vertical-align: middle !important;
        }

        .nc-table tr:hover {
          background: #f8fafc !important;
        }

        .nc-table tr.nc-row-selected {
          background: #eff6ff !important;
        }

        /* 🔗 HEADERS ORDENABLES */
        .nc-sortable-enhanced {
          cursor: pointer !important;
          user-select: none !important;
          transition: all 0.2s ease !important;
          position: relative !important;
        }

        .nc-sortable-enhanced:hover {
          background: #e2e8f0 !important;
          color: #1f2937 !important;
        }

        .nc-sort-indicator {
          color: #3b82f6 !important;
          font-weight: bold !important;
          margin-left: 0.25rem !important;
        }

        /* 🎯 BOTONES MEJORADOS */
        .nc-btn-enhanced {
          background: white !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 8px !important;
          padding: 0.75rem 1rem !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
        }

        .nc-btn-enhanced:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }

        .nc-action-enhanced {
          min-width: 40px !important;
          min-height: 40px !important;
          padding: 0.5rem !important;
          border-radius: 6px !important;
          font-size: 1rem !important;
        }

        .nc-action-view:hover {
          border-color: #3b82f6 !important;
          background: #eff6ff !important;
        }

        .nc-action-edit:hover {
          border-color: #f59e0b !important;
          background: #fffbeb !important;
        }

        .nc-action-pdf:hover {
          border-color: #10b981 !important;
          background: #f0fdf4 !important;
        }

        .nc-action-delete:hover {
          border-color: #ef4444 !important;
          background: #fef2f2 !important;
        }

        /* 📋 CARDS MEJORADAS */
        .nc-cards-enhanced {
          display: grid !important;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)) !important;
          gap: 1.5rem !important;
          padding: 0 !important;
        }

        .nc-card-enhanced {
          background: white !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 12px !important;
          overflow: hidden !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
        }

        .nc-card-enhanced:hover {
          border-color: #3b82f6 !important;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15) !important;
          transform: translateY(-2px) !important;
        }

        .nc-card-enhanced.nc-card-selected {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        .nc-card-header {
          background: linear-gradient(135deg, #f8fafc, #e2e8f0) !important;
          padding: 1rem !important;
          border-bottom: 1px solid #e5e7eb !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
        }

        .nc-card-btn-enhanced {
          padding: 0.5rem 1rem !important;
          border-radius: 6px !important;
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          border: 2px solid transparent !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          display: flex !important;
          align-items: center !important;
          gap: 0.25rem !important;
        }

        .nc-card-btn-view {
          background: #eff6ff !important;
          color: #1d4ed8 !important;
          border-color: #3b82f6 !important;
        }

        .nc-card-btn-edit {
          background: #fffbeb !important;
          color: #d97706 !important;
          border-color: #f59e0b !important;
        }

        .nc-card-btn-pdf {
          background: #f0fdf4 !important;
          color: #059669 !important;
          border-color: #10b981 !important;
        }

        /* 📄 PAGINACIÓN MEJORADA */
        .nc-pagination-enhanced {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          flex-wrap: wrap !important;
          gap: 1rem !important;
        }

        .nc-pagination-btn {
          padding: 0.5rem 1rem !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 6px !important;
          background: white !important;
          color: #374151 !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
        }

        .nc-pagination-btn:hover:not(:disabled) {
          border-color: #3b82f6 !important;
          background: #eff6ff !important;
          color: #1d4ed8 !important;
        }

        .nc-pagination-btn:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
        }

        .nc-pagination-btn.nc-pagination-active {
          background: #3b82f6 !important;
          color: white !important;
          border-color: #3b82f6 !important;
        }

        /* 🎭 BULK ACTIONS MEJORADAS */
        .nc-bulk-enhanced {
          background: linear-gradient(135deg, #1e40af, #3b82f6) !important;
          color: white !important;
          border: none !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
        }

        .nc-bulk-text {
          font-weight: 600 !important;
          font-size: 1rem !important;
        }

        .nc-bulk-buttons .nc-btn {
          background: rgba(255, 255, 255, 0.15) !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          backdrop-filter: blur(10px) !important;
        }

        .nc-bulk-buttons .nc-btn:hover {
          background: rgba(255, 255, 255, 0.25) !important;
          transform: translateY(-1px) !important;
        }

        /* 📊 EMPTY STATE MEJORADO */
        .nc-empty-enhanced {
          text-align: center !important;
          padding: 3rem 2rem !important;
        }

        .nc-empty-icon {
          font-size: 3rem !important;
          margin-bottom: 1rem !important;
          opacity: 0.7 !important;
        }

        .nc-empty-title {
          color: #1f2937 !important;
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          margin-bottom: 0.5rem !important;
        }

        .nc-empty-description {
          color: #6b7280 !important;
          margin-bottom: 1.5rem !important;
        }

        /* 🔧 OTROS ELEMENTOS */
        .nc-number-badge {
          background: #f3f4f6 !important;
          padding: 0.25rem 0.5rem !important;
          border-radius: 4px !important;
          font-weight: 600 !important;
          color: #1f2937 !important;
        }

        .nc-days-badge {
          padding: 0.25rem 0.5rem !important;
          border-radius: 4px !important;
          font-size: 0.75rem !important;
          font-weight: 500 !important;
          background: #f0f9ff !important;
          color: #0c4a6e !important;
        }

        .nc-days-warning {
          background: #fef3c7 !important;
          color: #92400e !important;
        }

        .nc-count-enhanced {
          background: #3b82f6 !important;
          color: white !important;
          padding: 0.25rem 0.75rem !important;
          border-radius: 12px !important;
          font-size: 0.75rem !important;
          font-weight: 600 !important;
        }

        /* 🎯 RESPONSIVE */
        @media (max-width: 768px) {
          .nc-cards-enhanced {
            grid-template-columns: 1fr !important;
          }
          
          .nc-filters-row {
            flex-direction: column !important;
            gap: 1rem !important;
          }
          
          .nc-pagination-enhanced {
            flex-direction: column !important;
            text-align: center !important;
          }
          
          .nc-table-container {
            overflow-x: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DatabasePanel;
