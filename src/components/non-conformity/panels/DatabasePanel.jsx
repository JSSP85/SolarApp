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

  // ✅ CAMBIO CRÍTICO: Handle bulk actions with Firebase
  const handleBulkAction = async (action) => {
    if (selectedNCs.length === 0) return;
    
    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedNCs.length} selected NC(s)?`)) {
          try {
            // ✅ SOLUCION: Usar deleteNCFromFirebase en lugar de dispatch local
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
        // TODO: Implement export functionality
        break;
      case 'mark_resolved':
        try {
          // ✅ SOLUCION: Usar updateNCInFirebase en lugar de dispatch local
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
          // ✅ SOLUCION: Usar updateNCInFirebase en lugar de dispatch local
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
      'minor': 'nc-priority-minor',
      'low': 'nc-priority-low'
    };
    return classes[priority] || 'nc-priority-minor';
  };

  // ✅ CAMBIO CRÍTICO: Handle individual NC actions with Firebase
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
            // ✅ SOLUCION: Usar deleteNCFromFirebase en lugar de dispatch local
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

  // Toggle bulk actions visibility
  const toggleBulkActions = () => {
    setShowBulkActions(!showBulkActions);
    if (!showBulkActions) {
      setSelectedNCs([]);
    }
  };

  return (
    <div className="nc-database-panel">
      <div className="nc-panel-card">
        <div className="nc-panel-header">
          <h3 className="nc-panel-title">
            <span className="nc-panel-icon">🗄️</span>
            Non-Conformity Database
          </h3>
          <p className="nc-panel-subtitle">
            Complete database of all non-conformities with advanced search, filtering, and bulk operations
          </p>
        </div>

        {/* Search and Controls */}
        <div className="nc-database-controls">
          {/* Search Section */}
          <div className="nc-search-section">
            <div className="nc-search-input-group">
              <input
                type="text"
                className="nc-search-input"
                placeholder="Search NCs by number, description, project, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="nc-search-icon">🔍</span>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="nc-filters-section">
            <div className="nc-filters-row">
              <div className="nc-filter-group">
                <label className="nc-filter-label">Status:</label>
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
              </div>

              <div className="nc-filter-group">
                <label className="nc-filter-label">Priority:</label>
                <select
                  className="nc-filter-select"
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
                  className="nc-filter-select"
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
                  className="nc-filter-select"
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
                  className="nc-filter-select"
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
                    className="nc-filter-input"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </div>
                <div className="nc-filter-group">
                  <label className="nc-filter-label">To:</label>
                  <input
                    type="date"
                    className="nc-filter-input"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* View Controls */}
          <div className="nc-view-controls">
            <div className="nc-items-per-page">
              <label className="nc-filter-label">Show:</label>
              <select
                className="nc-filter-select nc-select-small"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="nc-view-mode-toggle">
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
              className={`nc-btn nc-btn-small ${showBulkActions ? 'nc-btn-warning' : 'nc-btn-secondary'}`}
              onClick={toggleBulkActions}
            >
              {showBulkActions ? '❌ Cancel Bulk' : '☑️ Bulk Actions'}
            </button>

            <button
              className="nc-btn nc-btn-ghost nc-btn-small"
              onClick={clearAllFilters}
            >
              🔄 Clear Filters
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="nc-results-summary">
          <div className="nc-results-text">
            Showing {filteredAndSortedNCs.length} of {ncList.length} non-conformities
            {searchTerm && ` for "${searchTerm}"`}
          </div>
          <div className="nc-results-meta">
            {selectedNCs.length > 0 && (
              <span className="nc-selected-count">{selectedNCs.length} selected</span>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && selectedNCs.length > 0 && (
          <div className="nc-bulk-actions">
            <span className="nc-bulk-text">{selectedNCs.length} item(s) selected</span>
            <div className="nc-bulk-buttons">
              <button
                className="nc-btn nc-btn-warning nc-btn-small"
                onClick={() => handleBulkAction('mark_progress')}
              >
                🔄 Mark In Progress
              </button>
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
                📊 Export Selected
              </button>
              <button
                className="nc-btn nc-btn-danger nc-btn-small"
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
            {/* Table View */}
            {viewMode === 'table' && (
              <div className="nc-table-container">
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
                        className="nc-sortable"
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
                        className="nc-sortable"
                        onClick={() => handleSort('project')}
                      >
                        Project
                        {sortConfig.key === 'project' && (
                          <span className="nc-sort-indicator">
                            {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                          </span>
                        )}
                      </th>
                      <th>Description</th>
                      <th 
                        className="nc-sortable"
                        onClick={() => handleSort('supplier')}
                      >
                        Supplier
                        {sortConfig.key === 'supplier' && (
                          <span className="nc-sort-indicator">
                            {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
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
                            {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="nc-sortable"
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
                        className="nc-sortable"
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
                        <td className="nc-table-nc-number">{nc.number}</td>
                        <td>{nc.project}</td>
                        <td className="nc-table-description">
                          <span title={nc.description}>
                            {nc.description?.substring(0, 60)}...
                          </span>
                        </td>
                        <td>{nc.supplier || 'N/A'}</td>
                        <td>
                          <span className={`nc-table-priority ${getPriorityBadgeClass(nc.priority)}`}>
                            {nc.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`nc-table-status ${getStatusBadgeClass(nc.status)}`}>
                            {nc.status}
                          </span>
                        </td>
                        <td>{nc.createdDate}</td>
                        <td>
                          <span className={`nc-days-open ${nc.daysOpen > 30 ? 'nc-days-warning' : ''}`}>
                            {nc.daysOpen || 0} days
                          </span>
                        </td>
                        <td className="nc-table-actions">
                          <div className="nc-action-buttons">
                            <button
                              className="nc-action-btn nc-action-view"
                              onClick={() => handleNCAction(nc, 'view')}
                              title="View NC Details"
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
                              title="Generate PDF Report"
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
                        <span className="nc-card-number">{nc.number}</span>
                      </div>
                      <div className="nc-card-badges">
                        <span className={`nc-card-priority ${getPriorityBadgeClass(nc.priority)}`}>
                          {nc.priority}
                        </span>
                        <span className={`nc-card-status ${getStatusBadgeClass(nc.status)}`}>
                          {nc.status}
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
                        <span className={nc.daysOpen > 30 ? 'nc-days-warning' : ''}>
                          {nc.daysOpen || 0} days
                        </span>
                      </div>
                      <div className="nc-card-description">
                        {nc.description?.substring(0, 120)}...
                      </div>
                    </div>
                    <div className="nc-card-actions">
                      <button
                        className="nc-card-btn nc-card-btn-view"
                        onClick={() => handleNCAction(nc, 'view')}
                      >
                        👁️ View
                      </button>
                      <button
                        className="nc-card-btn nc-card-btn-edit"
                        onClick={() => handleNCAction(nc, 'edit')}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="nc-card-btn nc-card-btn-pdf"
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
