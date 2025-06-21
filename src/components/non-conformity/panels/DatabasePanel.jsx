// src/components/non-conformity/panels/DatabasePanel.jsx
import React, { useState, useMemo } from 'react';
import { useNonConformity } from '../../../context/NonConformityContext';

const DatabasePanel = () => {
  const { state, dispatch, helpers } = useNonConformity();
  const { ncList } = state;
  
  // Local state for database management
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    project: 'all',
    supplier: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'createdDate',
    direction: 'desc'
  });
  const [selectedNCs, setSelectedNCs] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle row selection
  const handleRowSelect = (ncId) => {
    setSelectedNCs(prev => 
      prev.includes(ncId) 
        ? prev.filter(id => id !== ncId)
        : [...prev, ncId]
    );
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
      const matchesSearch = !searchTerm || 
        nc.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nc.project?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nc.supplier?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filters.status === 'all' || nc.status === filters.status;
      const matchesPriority = filters.priority === 'all' || nc.priority === filters.priority;
      const matchesProject = filters.project === 'all' || nc.project === filters.project;
      const matchesSupplier = filters.supplier === 'all' || nc.supplier === filters.supplier;

      return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesSupplier;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // Handle different data types
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
      supplier: 'all'
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
          <p className="nc-panel-subtitle">
            Complete database of all non-conformities with advanced search and filtering
          </p>
        </div>

        {/* Search and Filters */}
        <div className="nc-database-controls">
          <div className="nc-search-section">
            <div className="nc-search-input-group">
              <input
                type="text"
                className="nc-search-input"
                placeholder="Search NCs by number, description, project, or supplier..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <span className="nc-search-icon">🔍</span>
            </div>
          </div>

          <div className="nc-filters-section">
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
          </div>

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
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedNCs.includes(nc.id)}
                            onChange={() => handleRowSelect(nc.id)}
                          />
                        </td>
                        <td className="nc-table-nc-number">{nc.number}</td>
                        <td>{nc.project}</td>
                        <td className="nc-table-description">
                          {nc.description?.substring(0, 60)}...
                        </td>
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
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedNCs.length)} of {filteredAndSortedNCs.length} results
                </div>
                <div className="nc-pagination-controls">
                  <button
                    className="nc-btn nc-btn-ghost nc-btn-small"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                      return (
                        <button
                          key={page}
                          className={`nc-btn nc-btn-small ${page === currentPage ? 'nc-btn-primary' : 'nc-btn-ghost'}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 3 || page === currentPage + 3) {
                      return <span key={page} className="nc-pagination-ellipsis">...</span>;
                    }
                    return null;
                  })}
                  
                  <button
                    className="nc-btn nc-btn-ghost nc-btn-small"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="nc-empty-state">
            <span className="nc-empty-icon">🔍</span>
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
