import React, { useState } from 'react';
import { Calendar, Filter, Download, RefreshCw, X } from 'lucide-react';

const DashboardFilters = ({ onFiltersChange, onExport, onRefresh, isLoading }) => {
  const [filters, setFilters] = useState({
    dateRange: '12months',
    supplier: '',
    componentFamily: '',
    status: '',
    inspector: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);

  const dateRangeOptions = [
    { value: '1month', label: 'Last Month' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '12months', label: 'Last 12 Months' },
    { value: 'all', label: 'All Time' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pass', label: 'Passed' },
    { value: 'reject', label: 'Failed' },
    { value: 'in-progress', label: 'In Progress' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      dateRange: '12months',
      supplier: '',
      componentFamily: '',
      status: '',
      inspector: ''
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== '12months'
  );

  return (
    <div className="dashboard-filters">
      <div className="filters-header">
        <div className="filters-actions">
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            <span>Filters</span>
            {hasActiveFilters && <span className="active-indicator"></span>}
          </button>
          
          <button 
            className="refresh-btn"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
          
          <button 
            className="export-btn"
            onClick={onExport}
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            {/* Date Range */}
            <div className="filter-group">
              <label className="filter-label">
                <Calendar size={14} />
                Date Range
              </label>
              <select 
                className="filter-select"
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier */}
            <div className="filter-group">
              <label className="filter-label">Supplier</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Filter by supplier..."
                value={filters.supplier}
                onChange={(e) => handleFilterChange('supplier', e.target.value)}
              />
            </div>

            {/* Component Family */}
            <div className="filter-group">
              <label className="filter-label">Component Family</label>
              <input
                type="text"
                className="filter-input"
                placeholder="e.g., Steel, Hardware..."
                value={filters.componentFamily}
                onChange={(e) => handleFilterChange('componentFamily', e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="filter-group">
              <label className="filter-label">Status</label>
              <select 
                className="filter-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Inspector */}
            <div className="filter-group">
              <label className="filter-label">Inspector</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Filter by inspector..."
                value={filters.inspector}
                onChange={(e) => handleFilterChange('inspector', e.target.value)}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="filters-actions-bottom">
              <button 
                className="clear-filters-btn"
                onClick={clearFilters}
              >
                <X size={14} />
                Clear Filters
              </button>
              <span className="active-filters-count">
                {Object.values(filters).filter(v => v !== '' && v !== '12months').length} filter(s) active
              </span>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .dashboard-filters {
          background: rgba(15, 23, 42, 0.7);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .filters-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .filter-toggle-btn, .refresh-btn, .export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(59, 130, 246, 0.1);
          color: #60a5fa;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .filter-toggle-btn {
          position: relative;
        }

        .active-indicator {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #f59e0b;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .refresh-btn {
          background: rgba(16, 185, 129, 0.1);
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.2);
        }

        .export-btn {
          background: rgba(139, 92, 246, 0.1);
          color: #a78bfa;
          border-color: rgba(139, 92, 246, 0.2);
        }

        .filter-toggle-btn:hover, .refresh-btn:hover, .export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .filters-panel {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          animation: slideDown 0.3s ease-out;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: #cbd5e1;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .filter-input, .filter-select {
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(30, 41, 59, 0.6);
          color: #f1f5f9;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .filter-input:focus, .filter-select:focus {
          outline: none;
          border-color: #60a5fa;
          box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
          background: rgba(30, 41, 59, 0.8);
        }

        .filter-input::placeholder {
          color: #64748b;
        }

        .filters-actions-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .clear-filters-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.85rem;
        }

        .clear-filters-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-1px);
        }

        .active-filters-count {
          font-size: 0.8rem;
          color: #94a3b8;
          font-style: italic;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .filters-actions {
            flex-wrap: wrap;
            gap: 8px;
          }

          .filter-toggle-btn, .refresh-btn, .export-btn {
            padding: 8px 12px;
            font-size: 0.85rem;
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }

          .filters-actions-bottom {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardFilters;