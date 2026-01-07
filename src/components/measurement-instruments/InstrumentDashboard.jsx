// src/components/measurement-instruments/InstrumentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Package, TrendingUp, TrendingDown, AlertCircle, Eye, Edit, Printer, QrCode } from 'lucide-react';
import { getAllInstruments } from '../../firebase/instrumentsService';
import * as XLSX from 'xlsx';

const InstrumentDashboard = ({ stats, onRefresh }) => {
  const [instruments, setInstruments] = useState([]);
  const [filteredInstruments, setFilteredInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  useEffect(() => {
    loadInstruments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, categoryFilter, statusFilter, locationFilter, instruments]);

  const loadInstruments = async () => {
    try {
      setLoading(true);
      const data = await getAllInstruments();
      setInstruments(data);
      setFilteredInstruments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading instruments:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...instruments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(inst =>
        inst.instrument_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.instrument_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(inst => inst.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inst => inst.calibration_status === statusFilter);
    }

    // Location filter
    if (locationFilter !== 'all') {
      if (locationFilter === 'person') {
        filtered = filtered.filter(inst => inst.location_type === 'person');
      } else if (locationFilter === 'cabinet') {
        filtered = filtered.filter(inst => inst.location_type === 'cabinet');
      } else if (['A', 'B', 'C', 'D'].includes(locationFilter)) {
        filtered = filtered.filter(inst => inst.cabinet === locationFilter);
      }
    }

    setFilteredInstruments(filtered);
  };

  const exportToExcel = () => {
    const exportData = filteredInstruments.map(inst => ({
      'Number': inst.instrument_number,
      'Instrument Name': inst.instrument_name,
      'Type': inst.measurement_type,
      'Manufacturer': inst.manufacturer,
      'Model': inst.model,
      'Serial Number': inst.serial_number,
      'Category': inst.category,
      'Department': inst.department,
      'Location': inst.location_type === 'person' ? inst.assigned_to : `Cabinet ${inst.cabinet}`,
      'Calibration Date': inst.current_calibration_date ? new Date(inst.current_calibration_date).toLocaleDateString() : 'N/A',
      'Expiration Date': inst.current_expiration_date ? new Date(inst.current_expiration_date).toLocaleDateString() : 'N/A',
      'Days Remaining': inst.days_until_expiration || 'N/A',
      'Status': getStatusText(inst.calibration_status)
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Instruments');

    // Auto-width columns
    const maxWidth = exportData.reduce((w, r) => Math.max(w, r['Instrument Name']?.length || 0), 10);
    ws['!cols'] = [
      { wch: 10 }, // Number
      { wch: Math.min(maxWidth, 40) }, // Instrument Name
      { wch: 15 }, // Type
      { wch: 20 }, // Manufacturer
      { wch: 15 }, // Model
      { wch: 15 }, // Serial Number
      { wch: 8 },  // Category
      { wch: 15 }, // Department
      { wch: 20 }, // Location
      { wch: 15 }, // Calibration Date
      { wch: 15 }, // Expiration Date
      { wch: 12 }, // Days Remaining
      { wch: 15 }  // Status
    ];

    const fileName = `measurement_instruments_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'valid': return 'Valid';
      case 'expiring_soon': return 'Expiring Soon';
      case 'expired': return 'Expired';
      case 'not_required': return 'Not Required';
      default: return 'Unknown';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'valid': return 'mims-badge valid';
      case 'expiring_soon': return 'mims-badge expiring_soon';
      case 'expired': return 'mims-badge expired';
      case 'not_required': return 'mims-badge not_required';
      default: return 'mims-badge';
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'A': return 'mims-badge category-a';
      case 'B': return 'mims-badge category-b';
      case 'C': return 'mims-badge category-c';
      default: return 'mims-badge';
    }
  };

  const getDaysDisplay = (days, status) => {
    if (status === 'not_required') return 'N/A';
    if (days === null) return 'N/A';
    if (days < 0) return `${Math.abs(days)} days overdue`;
    return `${days} days`;
  };

  return (
    <div className="mims-panel-container">
      {/* Stats Cards */}
      <div className="mims-stats-container">
        <div className="mims-stat-card">
          <div className="mims-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
            <Package size={24} style={{ color: '#3b82f6' }} />
          </div>
          <div className="mims-stat-value">{stats.total_instruments}</div>
          <div className="mims-stat-label">Total Instruments</div>
        </div>

        <div className="mims-stat-card">
          <div className="mims-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <TrendingUp size={24} style={{ color: '#10b981' }} />
          </div>
          <div className="mims-stat-value">{stats.valid}</div>
          <div className="mims-stat-label">Valid Calibrations</div>
        </div>

        <div className="mims-stat-card alert">
          <div className="mims-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <AlertCircle size={24} style={{ color: '#f59e0b' }} />
          </div>
          <div className="mims-stat-value">{stats.expiring_soon}</div>
          <div className="mims-stat-label">Expiring Soon</div>
        </div>

        <div className="mims-stat-card">
          <div className="mims-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <TrendingDown size={24} style={{ color: '#ef4444' }} />
          </div>
          <div className="mims-stat-value">{stats.expired}</div>
          <div className="mims-stat-label">Expired</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mims-panel-card">
        <div className="mims-panel-header" style={{ paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="mims-panel-title">
              <Package size={24} />
              Instruments Registry
            </div>
            <button
              onClick={exportToExcel}
              className="mims-btn mims-btn-secondary"
            >
              <Download size={18} />
              Export to Excel
            </button>
          </div>

          {/* Search Box */}
          <div className="mims-search-box">
            <Search className="mims-search-icon" size={20} />
            <input
              type="text"
              className="mims-search-input"
              placeholder="Search by number or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="mims-filter-row">
            <div className="mims-filter-item">
              <Filter size={18} />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="A">Category A</option>
                <option value="B">Category B</option>
                <option value="C">Category C</option>
              </select>
            </div>

            <div className="mims-filter-item">
              <Filter size={18} />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="valid">Valid</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="expired">Expired</option>
                <option value="not_required">Not Required</option>
              </select>
            </div>

            <div className="mims-filter-item">
              <Filter size={18} />
              <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                <option value="all">All Locations</option>
                <option value="person">With Person</option>
                <option value="cabinet">In Cabinet</option>
                <option value="A">Cabinet A</option>
                <option value="B">Cabinet B</option>
                <option value="C">Cabinet C</option>
                <option value="D">Cabinet D</option>
              </select>
            </div>
          </div>

          <div style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Showing {filteredInstruments.length} of {instruments.length} instruments
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="mims-loading-state">
            <div className="mims-spinner"></div>
            <p>Loading instruments...</p>
          </div>
        ) : filteredInstruments.length === 0 ? (
          <div className="mims-empty-state">
            <Package size={64} />
            <h3>No instruments found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="mims-table-container">
            <table className="mims-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Instrument Name</th>
                  <th>Manufacturer / Model</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Expiration</th>
                  <th>Days Remaining</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstruments.map((inst) => (
                  <tr key={inst.id}>
                    <td>
                      <span style={{
                        background: '#f1f5f9',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '4px',
                        fontWeight: 600,
                        fontFamily: 'monospace'
                      }}>
                        {inst.instrument_number}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{inst.instrument_name}</td>
                    <td>
                      <div>{inst.manufacturer}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{inst.model}</div>
                    </td>
                    <td>
                      <span className={getCategoryBadgeClass(inst.category)}>
                        {inst.category}
                      </span>
                    </td>
                    <td>{inst.department || 'N/A'}</td>
                    <td>
                      {inst.location_type === 'person' ? (
                        <div>
                          <div style={{ fontWeight: 500 }}>{inst.assigned_to}</div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>👤 Person</div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontWeight: 500 }}>Cabinet {inst.cabinet}</div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>🗄️ Storage</div>
                        </div>
                      )}
                    </td>
                    <td>
                      {inst.current_expiration_date
                        ? new Date(inst.current_expiration_date).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td>
                      <span style={{
                        color: inst.calibration_status === 'expired' ? '#ef4444' :
                          inst.calibration_status === 'expiring_soon' ? '#f59e0b' : '#6b7280'
                      }}>
                        {getDaysDisplay(inst.days_until_expiration, inst.calibration_status)}
                      </span>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(inst.calibration_status)}>
                        {getStatusText(inst.calibration_status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstrumentDashboard;
