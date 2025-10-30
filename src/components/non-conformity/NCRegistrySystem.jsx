// src/components/non-conformity/NCRegistrySystem.jsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  addNCToRegistry,
  updateNCInRegistry,
  deleteNCFromRegistry,
  getAllNCs,
  getNextNCNumber
} from '../../firebase/ncRegistryService';
import NCStatisticsCharts from './NCStatisticsCharts';
import BackButton from '../common/BackButton';
import '../../styles/non-conformity.css';

// ================================================================
// ✅ OPTIONS - FUERA DEL COMPONENTE PRINCIPAL
// ================================================================
const statusOptions = [
  { value: 'open', label: '🔴 Open' },
  { value: 'in_progress', label: '🟡 In Progress' },
  { value: 'closed', label: '🟢 Closed' },
  { value: 'cancelled', label: '⚫ Cancelled' }
];

const ncClassOptions = [
  { value: 'critical', label: '🚨 CRITICAL' },
  { value: 'major', label: '🔴 MAJOR' },
  { value: 'minor', label: '🟡 MINOR' }
];

const detectionPhaseOptions = [
  { value: 'production', label: 'Production' },
  { value: 'on_site', label: 'On Site' },
  { value: 'by_client', label: 'NC BY CLIENT' },
  { value: 'incoming_goods', label: 'Incoming Goods' },
  { value: 'installation', label: 'Installation' },
  { value: 'malpractice', label: 'Malpractice' },
  { value: 'logistics', label: 'Logistics' }
];

const monthOptions = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

// ================================================================
// ✅ NC FORM COMPONENT - FUERA Y ANTES DEL COMPONENTE PRINCIPAL
// ================================================================
const NCForm = memo(({ nc, onChange }) => {
  return (
    <div className="nc-form-container">
      <div className="nc-form-section">
        <h3 className="nc-section-title">Basic Information</h3>
        
        <div className="nc-form-grid">
          <div className="nc-form-group">
            <label className="nc-form-label">NC Number *</label>
            <input
              type="text"
              value={nc.number || ''}
              onChange={(e) => onChange({ ...nc, number: e.target.value })}
              className="nc-form-input"
              placeholder="562"
            />
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Year</label>
            <input
              type="number"
              value={nc.year || ''}
              onChange={(e) => onChange({ ...nc, year: parseInt(e.target.value) || 0 })}
              className="nc-form-input"
            />
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Month</label>
            <select
              value={nc.month || ''}
              onChange={(e) => onChange({ ...nc, month: e.target.value })}
              className="nc-form-select"
            >
              <option value="">Select...</option>
              {monthOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Status *</label>
            <select
              value={nc.status || ''}
              onChange={(e) => onChange({ ...nc, status: e.target.value })}
              className="nc-form-select"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">NC Issuer</label>
            <input
              type="text"
              value={nc.ncIssuer || ''}
              onChange={(e) => onChange({ ...nc, ncIssuer: e.target.value })}
              className="nc-form-input"
            />
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Date of Detection</label>
            <input
              type="date"
              value={nc.dateOfDetection || ''}
              onChange={(e) => onChange({ ...nc, dateOfDetection: e.target.value })}
              className="nc-form-input"
            />
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Detection Phase</label>
            <select
              value={nc.detectionPhase || ''}
              onChange={(e) => onChange({ ...nc, detectionPhase: e.target.value })}
              className="nc-form-select"
            >
              <option value="">Select...</option>
              {detectionPhaseOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Order Number</label>
            <input
              type="text"
              value={nc.orderNumber || ''}
              onChange={(e) => onChange({ ...nc, orderNumber: e.target.value })}
              className="nc-form-input"
              placeholder="PO26171"
            />
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Project Code</label>
            <input
              type="text"
              value={nc.projectCode || ''}
              onChange={(e) => onChange({ ...nc, projectCode: e.target.value })}
              className="nc-form-input"
            />
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Project Name</label>
            <input
              type="text"
              value={nc.projectName || ''}
              onChange={(e) => onChange({ ...nc, projectName: e.target.value })}
              className="nc-form-input"
            />
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">NC Class *</label>
            <select
              value={nc.ncClass || ''}
              onChange={(e) => onChange({ ...nc, ncClass: e.target.value })}
              className="nc-form-select"
            >
              <option value="">Select...</option>
              {ncClassOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Accountable</label>
            <input
              type="text"
              value={nc.accountable || ''}
              onChange={(e) => onChange({ ...nc, accountable: e.target.value })}
              className="nc-form-input"
            />
          </div>
        </div>
      </div>

      <div className="nc-form-section">
        <h3 className="nc-section-title">NC Details</h3>
        
        <div className="nc-form-group-full">
          <label className="nc-form-label">NC Main Subject *</label>
          <input
            type="text"
            value={nc.ncMainSubject || ''}
            onChange={(e) => onChange({ ...nc, ncMainSubject: e.target.value })}
            className="nc-form-input"
            placeholder="Main subject..."
          />
        </div>

        <div className="nc-form-group-full">
          <label className="nc-form-label">NC Brief Summary & Root Cause</label>
          <textarea
            value={nc.ncBriefSummary || ''}
            onChange={(e) => onChange({ ...nc, ncBriefSummary: e.target.value })}
            className="nc-form-textarea"
            placeholder="Brief summary and root cause..."
            rows="3"
          />
        </div>

        <div className="nc-form-group-full">
          <label className="nc-form-label">Treatment</label>
          <textarea
            value={nc.treatment || ''}
            onChange={(e) => onChange({ ...nc, treatment: e.target.value })}
            className="nc-form-textarea"
            placeholder="Treatment description..."
            rows="2"
          />
        </div>

        <div className="nc-form-group">
          <label className="nc-form-label">Date of Closure</label>
          <input
            type="date"
            value={nc.dateOfClosure || ''}
            onChange={(e) => onChange({ ...nc, dateOfClosure: e.target.value })}
            className="nc-form-input"
          />
        </div>

        <div className="nc-form-group-full">
          <label className="nc-form-label">Root Cause Analysis</label>
          <textarea
            value={nc.rootCauseAnalysis || ''}
            onChange={(e) => onChange({ ...nc, rootCauseAnalysis: e.target.value })}
            className="nc-form-textarea"
            placeholder="Root cause analysis..."
            rows="3"
          />
        </div>

        <div className="nc-form-group-full">
          <label className="nc-form-label">Corrective Action</label>
          <textarea
            value={nc.correctiveAction || ''}
            onChange={(e) => onChange({ ...nc, correctiveAction: e.target.value })}
            className="nc-form-textarea"
            placeholder="Containment and corrective actions..."
            rows="3"
          />
        </div>
      </div>
    </div>
  );
});

NCForm.displayName = 'NCForm';

// ================================================================
// ✅ COMPONENTE PRINCIPAL - AHORA SIN NCFORM DENTRO
// ================================================================
const NCRegistrySystem = ({ onBack }) => {
  const { currentUser } = useAuth();
  const [activeView, setActiveView] = useState('registry');
  const [ncList, setNcList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNC, setSelectedNC] = useState(null);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    detectionPlace: '',
    year: ''
  });

  // Empty NC template
  const emptyNC = {
    number: '',
    year: new Date().getFullYear(),
    month: '',
    status: 'open',
    ncIssuer: '',
    dateOfDetection: new Date().toISOString().split('T')[0],
    detectionPhase: '',
    orderNumber: '',
    projectCode: '',
    projectName: '',
    ncClass: '',
    accountable: '',
    ncMainSubject: '',
    ncBriefSummary: '',
    treatment: '',
    dateOfClosure: '',
    rootCauseAnalysis: '',
    correctiveAction: ''
  };

  const [currentNC, setCurrentNC] = useState(emptyNC);
  
  // ✅ Estabilizar onChange
  const handleNCChange = useCallback((updatedNC) => {
    setCurrentNC(updatedNC);
  }, []);

  useEffect(() => {
    loadNCs();
  }, []);

  const loadNCs = async () => {
    try {
      setLoading(true);
      const data = await getAllNCs();
      setNcList(data);
    } catch (error) {
      console.error('Error loading NCs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNCList = ncList.filter(nc => {
    if (filters.search && 
        !nc.number.includes(filters.search) && 
        !nc.projectName?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !nc.ncMainSubject?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status && nc.status !== filters.status) return false;
    if (filters.priority && nc.ncClass !== filters.priority) return false;
    if (filters.detectionPlace && nc.detectionPhase !== filters.detectionPlace) return false;
    if (filters.year && nc.year !== parseInt(filters.year)) return false;
    return true;
  });

  const uniqueYears = [...new Set(ncList.map(nc => nc.year))].sort((a, b) => b - a);

  // Handlers
  const handleAddNC = async () => {
    const nextNumber = await getNextNCNumber();
    setCurrentNC({ ...emptyNC, number: nextNumber });
    setShowAddModal(true);
  };

  const handleSaveNC = async () => {
    if (!currentNC.number || !currentNC.ncMainSubject || !currentNC.ncClass) {
      alert('⚠️ Please complete required fields: Number, Subject, and NC Class');
      return;
    }

    try {
      if (currentNC.id) {
        const { id, ...updateData } = currentNC;
        await updateNCInRegistry(id, updateData);
        alert('✅ NC updated successfully');
      } else {
        await addNCToRegistry(currentNC);
        alert('✅ NC created successfully');
      }

      await loadNCs();
      setShowAddModal(false);
      setShowEditPanel(false);
      setCurrentNC(emptyNC);
    } catch (error) {
      console.error('Error saving NC:', error);
      alert('❌ Error saving NC');
    }
  };

  const handleEditNC = (nc) => {
    setCurrentNC(nc);
    setShowEditPanel(true);
  };

  const handleDeleteNC = async (id) => {
    if (!window.confirm('Are you sure you want to delete this NC?')) return;

    try {
      await deleteNCFromRegistry(id);
      await loadNCs();
      alert('✅ NC deleted successfully');
    } catch (error) {
      console.error('Error deleting NC:', error);
      alert('❌ Error deleting NC');
    }
  };

  const handleViewNC = (nc) => {
    setSelectedNC(nc);
  };

  const handleUpdateStatus = async (ncId, newStatus) => {
    try {
      await updateNCInRegistry(ncId, { status: newStatus });
      await loadNCs();
      if (selectedNC && selectedNC.id === ncId) {
        setSelectedNC({ ...selectedNC, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getDetectionPhaseLabel = (phase) => {
    const option = detectionPhaseOptions.find(opt => opt.value === phase);
    return option ? option.label : phase;
  };

  return (
    <div className="non-conformity-wrapper">
      <div className="nc-app-container">
        {/* Sidebar */}
        <div className="nc-sidebar">
          {/* ✅ Back Button wrapper para NC */}
          {onBack && (
            <div className="nc-back-button-wrapper">
              <BackButton onClick={onBack} />
            </div>
          )}
          
          <div className="nc-sidebar-header">
            <div className="nc-company-logo-container">
              <img 
                src="/images/logo2.png" 
                alt="Company Logo" 
                className="nc-company-logo"
              />
            </div>
          </div>

          <div className="nc-sidebar-divider"></div>

          <nav className="nc-sidebar-nav">
            <div className="nc-sidebar-section-title">
              📋 NC Management
            </div>

            <div 
              className={`nc-nav-item ${activeView === 'registry' ? 'nc-active' : ''}`}
              onClick={() => setActiveView('registry')}
            >
              <span className="nc-nav-icon">📋</span>
              <span className="nc-nav-text">NC Registry</span>
              <span className="nc-nav-badge">{ncList.length}</span>
              {activeView === 'registry' && <div className="nc-nav-indicator"></div>}
            </div>

            <div 
              className={`nc-nav-item ${activeView === 'stats' ? 'nc-active' : ''}`}
              onClick={() => setActiveView('stats')}
            >
              <span className="nc-nav-icon">📈</span>
              <span className="nc-nav-text">Statistics</span>
              {activeView === 'stats' && <div className="nc-nav-indicator"></div>}
            </div>

            <div className="nc-sidebar-divider"></div>

            <div className="nc-sidebar-section-title">
              📊 Quick Stats
            </div>
          </nav>

          <div className="nc-sidebar-footer">
            <div className="nc-user-info">
              <div className="nc-user-role-section">
                <span className="nc-user-role-label">Current User</span>
                <span className={`nc-user-role-value nc-role-${currentUser?.role || 'unknown'}`}>
                  {currentUser?.displayName || 'Unknown'}
                </span>
              </div>

              <div className="nc-quick-stats">
                <div className="nc-stat-item">
                  <span className="nc-stat-label">Total:</span>
                  <span className="nc-stat-value">{ncList.length}</span>
                </div>
                <div className="nc-stat-item nc-critical">
                  <span className="nc-stat-label">Open:</span>
                  <span className="nc-stat-value">
                    {ncList.filter(nc => nc.status === 'open').length}
                  </span>
                </div>
                <div className="nc-stat-item">
                  <span className="nc-stat-label">Closed:</span>
                  <span className="nc-stat-value">
                    {ncList.filter(nc => nc.status === 'closed').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="nc-main-content">
          <div className="nc-content-header">
            <div className="nc-header-info">
              <h1 className="nc-main-title">Non-Conformity Registry</h1>
              <div className="nc-breadcrumb">
                Quality Management → Non-Conformities → {activeView === 'registry' ? 'NC List' : 'Statistics'}
              </div>
            </div>
            <div className="nc-header-actions">
              {activeView === 'registry' && (
                <button className="nc-btn nc-btn-primary" onClick={handleAddNC}>
                  <span>➕</span>
                  <span>New NC</span>
                </button>
              )}
              <div className="nc-user-role-indicator">
                <span className={`nc-role-badge nc-role-${currentUser?.role || 'unknown'}`}>
                  {currentUser?.role || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Registry View */}
          {activeView === 'registry' && (
            <div className="nc-panel-container">
              <div className="nc-panel-card">
                <div className="nc-form-container">
                  <div className="nc-form-section">
                    <h3 className="nc-section-title">🔍 Search & Filters</h3>
                    
                    <div className="nc-form-grid">
                      <div className="nc-form-group">
                        <label className="nc-form-label">Search</label>
                        <input
                          type="text"
                          className="nc-form-input"
                          placeholder="NC number, project, subject..."
                          value={filters.search}
                          onChange={(e) => setFilters({...filters, search: e.target.value})}
                        />
                      </div>

                      <div className="nc-form-group">
                        <label className="nc-form-label">Status</label>
                        <select
                          className="nc-form-select"
                          value={filters.status}
                          onChange={(e) => setFilters({...filters, status: e.target.value})}
                        >
                          <option value="">All Status</option>
                          {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="nc-form-group">
                        <label className="nc-form-label">Class</label>
                        <select
                          className="nc-form-select"
                          value={filters.priority}
                          onChange={(e) => setFilters({...filters, priority: e.target.value})}
                        >
                          <option value="">All Classes</option>
                          {ncClassOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="nc-form-group">
                        <label className="nc-form-label">Detection</label>
                        <select
                          className="nc-form-select"
                          value={filters.detectionPlace}
                          onChange={(e) => setFilters({...filters, detectionPlace: e.target.value})}
                        >
                          <option value="">All Phases</option>
                          {detectionPhaseOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="nc-form-group">
                        <label className="nc-form-label">Year</label>
                        <select
                          className="nc-form-select"
                          value={filters.year}
                          onChange={(e) => setFilters({...filters, year: e.target.value})}
                        >
                          <option value="">All Years</option>
                          {uniqueYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      Showing {filteredNCList.length} of {ncList.length} NCs
                    </div>
                  </div>

                  <div className="nc-form-section">
                    {loading ? (
                      <div className="nc-empty-state">
                        <span className="nc-empty-icon">⏳</span>
                        <h3 className="nc-empty-title">Loading NCs...</h3>
                      </div>
                    ) : filteredNCList.length === 0 ? (
                      <div className="nc-empty-state">
                        <span className="nc-empty-icon">📋</span>
                        <h3 className="nc-empty-title">No NCs Found</h3>
                        <p className="nc-empty-description">
                          {Object.values(filters).some(v => v) ? 'Try adjusting your filters' : 'Click "New NC" to register your first non-conformity'}
                        </p>
                      </div>
                    ) : (
                      <div className="nc-table-container">
                        <table className="nc-table">
                          <thead>
                            <tr>
                              <th>N°</th>
                              <th>Year</th>
                              <th>Status</th>
                              <th>Class</th>
                              <th>Subject</th>
                              <th>Project</th>
                              <th>Detection</th>
                              <th>Accountable</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredNCList.map((nc) => (
                              <tr key={nc.id}>
                                <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{nc.number}</td>
                                <td>{nc.year}</td>
                                <td>
                                  <span className={`nc-status-badge nc-status-${nc.status}`}>
                                    {nc.status?.replace('_', ' ')}
                                  </span>
                                </td>
                                <td>
                                  <span className={`nc-status-badge nc-priority-${nc.ncClass}`}>
                                    {nc.ncClass}
                                  </span>
                                </td>
                                <td style={{ maxWidth: '200px' }}>{nc.ncMainSubject}</td>
                                <td style={{ maxWidth: '150px' }}>{nc.projectName}</td>
                                <td style={{ fontSize: '0.75rem' }}>
                                  {getDetectionPhaseLabel(nc.detectionPhase)}
                                </td>
                                <td style={{ fontSize: '0.75rem' }}>{nc.accountable}</td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                    <button
                                      onClick={() => handleViewNC(nc)}
                                      className="nc-btn nc-btn-primary"
                                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                      title="View"
                                    >
                                      👁️
                                    </button>
                                    <button
                                      onClick={() => handleEditNC(nc)}
                                      className="nc-btn nc-btn-success"
                                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                      title="Edit"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDeleteNC(nc.id)}
                                      className="nc-btn nc-btn-danger"
                                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                      title="Delete"
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
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics View */}
          {activeView === 'stats' && (
            <div className="nc-panel-container">
              <NCStatisticsCharts ncList={ncList} />
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditPanel) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div className="nc-panel-card" style={{
            maxWidth: '1200px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div className="nc-panel-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="nc-panel-title">
                  {currentNC.id ? `✏️ Edit NC #${currentNC.number}` : '➕ Register New NC'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditPanel(false);
                    setCurrentNC(emptyNC);
                  }}
                  className="nc-btn nc-btn-secondary"
                  style={{ padding: '0.5rem' }}
                >
                  ✕
                </button>
              </div>
            </div>

            <NCForm nc={currentNC} onChange={handleNCChange} />

            <div className="nc-form-actions">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditPanel(false);
                  setCurrentNC(emptyNC);
                }}
                className="nc-btn nc-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNC}
                className="nc-btn nc-btn-success"
              >
                💾 Save NC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedNC && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div className="nc-panel-card" style={{
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div className="nc-panel-header">
              <h2 className="nc-panel-title">
                NC #{selectedNC.number} - {selectedNC.year}
              </h2>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <span className={`nc-status-badge nc-status-${selectedNC.status}`}>
                  {selectedNC.status?.replace('_', ' ')}
                </span>
                <span className={`nc-status-badge nc-priority-${selectedNC.ncClass}`}>
                  {selectedNC.ncClass}
                </span>
              </div>
            </div>

            <div className="nc-form-container">
              <div className="nc-details-grid">
                <div className="nc-detail-item">
                  <span className="nc-detail-label">Project:</span>
                  <span className="nc-detail-value">{selectedNC.projectName || '-'}</span>
                </div>
                <div className="nc-detail-item">
                  <span className="nc-detail-label">Detection:</span>
                  <span className="nc-detail-value">{getDetectionPhaseLabel(selectedNC.detectionPhase)}</span>
                </div>
                <div className="nc-detail-item">
                  <span className="nc-detail-label">Date:</span>
                  <span className="nc-detail-value">{selectedNC.dateOfDetection}</span>
                </div>
                <div className="nc-detail-item">
                  <span className="nc-detail-label">Accountable:</span>
                  <span className="nc-detail-value">{selectedNC.accountable || '-'}</span>
                </div>
              </div>

              {selectedNC.ncMainSubject && (
                <div className="nc-description-section">
                  <h4 className="nc-subsection-title">NC Main Subject</h4>
                  <p className="nc-description-text">{selectedNC.ncMainSubject}</p>
                </div>
              )}

              {selectedNC.ncBriefSummary && (
                <div className="nc-description-section">
                  <h4 className="nc-subsection-title">Brief Summary</h4>
                  <p className="nc-description-text">{selectedNC.ncBriefSummary}</p>
                </div>
              )}

              {selectedNC.treatment && (
                <div className="nc-description-section">
                  <h4 className="nc-subsection-title">Treatment</h4>
                  <p className="nc-description-text">{selectedNC.treatment}</p>
                </div>
              )}

              {selectedNC.rootCauseAnalysis && (
                <div className="nc-description-section">
                  <h4 className="nc-subsection-title">Root Cause Analysis</h4>
                  <p className="nc-description-text">{selectedNC.rootCauseAnalysis}</p>
                </div>
              )}

              {selectedNC.correctiveAction && (
                <div className="nc-description-section">
                  <h4 className="nc-subsection-title">Corrective Action</h4>
                  <p className="nc-description-text">{selectedNC.correctiveAction}</p>
                </div>
              )}

              <div className="nc-form-section">
                <h4 className="nc-subsection-title">🔄 Quick Status Update</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {statusOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleUpdateStatus(selectedNC.id, opt.value)}
                      className={`nc-btn ${
                        selectedNC.status === opt.value 
                          ? opt.value === 'open' ? 'nc-btn-danger'
                          : opt.value === 'closed' ? 'nc-btn-success'
                          : 'nc-btn-primary'
                          : 'nc-btn-secondary'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="nc-form-actions">
                <button
                  onClick={() => setSelectedNC(null)}
                  className="nc-btn nc-btn-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleEditNC(selectedNC);
                    setSelectedNC(null);
                  }}
                  className="nc-btn nc-btn-primary"
                >
                  ✏️ Edit NC
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NCRegistrySystem;