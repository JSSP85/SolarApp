// src/components/non-conformity/NCRegistrySystem.jsx
// VERSIÓN COMPLETA CON TODAS LAS FUNCIONALIDADES + ESTILOS ADAPTADOS

// ✅ CAMBIO 1: Agregar useCallback al import
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  addNCToRegistry,
  updateNCInRegistry,
  deleteNCFromRegistry,
  getAllNCs,
  getNextNCNumber
} from '../../firebase/ncRegistryService';
import NCStatisticsCharts from './NCStatisticsCharts';
import '../../styles/non-conformity.css';

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

  // Options
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

  // ✅ CAMBIO 2: Actualizar formato de meses
  const monthOptions = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  ];

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

  // ✅ CAMBIO 3: Agregar función memoizada para manejar cambios en el formulario
  const handleNCChange = useCallback((updatedNC) => {
    setCurrentNC(updatedNC);
  }, []);

  const getDetectionPhaseLabel = (phase) => {
    const option = detectionPhaseOptions.find(opt => opt.value === phase);
    return option ? option.label : phase;
  };

  // NC Form Component
  const NCForm = ({ nc, onChange }) => (
    <div className="nc-form-container">
      <div className="nc-form-section">
        <h3 className="nc-section-title">Basic Information</h3>
        
        <div className="nc-form-grid">
          <div className="nc-form-group">
            <label className="nc-form-label">NC Number *</label>
            <input
              type="text"
              value={nc.number}
              onChange={(e) => onChange({ ...nc, number: e.target.value })}
              className="nc-form-input"
              placeholder="562"
            />
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Year</label>
            <input
              type="number"
              value={nc.year}
              onChange={(e) => onChange({ ...nc, year: parseInt(e.target.value) })}
              className="nc-form-input"
            />
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Month</label>
            <select
              value={nc.month}
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
              value={nc.status}
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
              value={nc.ncIssuer}
              onChange={(e) => onChange({ ...nc, ncIssuer: e.target.value })}
              className="nc-form-input"
            />
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Date of Detection</label>
            <input
              type="date"
              value={nc.dateOfDetection}
              onChange={(e) => onChange({ ...nc, dateOfDetection: e.target.value })}
              className="nc-form-input"
            />
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Detection Phase</label>
            <select
              value={nc.detectionPhase}
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
              value={nc.orderNumber}
              onChange={(e) => onChange({ ...nc, orderNumber: e.target.value })}
              className="nc-form-input"
              placeholder="PO26171"
            />
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Project Code</label>
            <input
              type="text"
              value={nc.projectCode}
              onChange={(e) => onChange({ ...nc, projectCode: e.target.value })}
              className="nc-form-input"
            />
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Project Name</label>
            <input
              type="text"
              value={nc.projectName}
              onChange={(e) => onChange({ ...nc, projectName: e.target.value })}
              className="nc-form-input"
            />
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">NC Class *</label>
            <select
              value={nc.ncClass}
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
              value={nc.accountable}
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
            value={nc.ncMainSubject}
            onChange={(e) => onChange({ ...nc, ncMainSubject: e.target.value })}
            className="nc-form-input"
            placeholder="Main subject..."
          />
        </div>

        <div className="nc-form-group-full">
          <label className="nc-form-label">NC Brief Summary & Root Cause</label>
          <textarea
            value={nc.ncBriefSummary}
            onChange={(e) => onChange({ ...nc, ncBriefSummary: e.target.value })}
            className="nc-form-textarea"
            placeholder="Brief summary and root cause..."
            rows="3"
          />
        </div>

        <div className="nc-form-group-full">
          <label className="nc-form-label">Treatment</label>
          <textarea
            value={nc.treatment}
            onChange={(e) => onChange({ ...nc, treatment: e.target.value })}
            className="nc-form-textarea"
            placeholder="Treatment description..."
            rows="3"
          />
        </div>

        <div className="nc-form-group-full">
          <label className="nc-form-label">Root Cause Analysis</label>
          <textarea
            value={nc.rootCauseAnalysis}
            onChange={(e) => onChange({ ...nc, rootCauseAnalysis: e.target.value })}
            className="nc-form-textarea"
            placeholder="Root cause analysis..."
            rows="3"
          />
        </div>

        <div className="nc-form-group-full">
          <label className="nc-form-label">Corrective Action</label>
          <textarea
            value={nc.correctiveAction}
            onChange={(e) => onChange({ ...nc, correctiveAction: e.target.value })}
            className="nc-form-textarea"
            placeholder="Corrective action plan..."
            rows="3"
          />
        </div>

        <div className="nc-form-group">
          <label className="nc-form-label">Date of Closure</label>
          <input
            type="date"
            value={nc.dateOfClosure}
            onChange={(e) => onChange({ ...nc, dateOfClosure: e.target.value })}
            className="nc-form-input"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="nc-panel-container">
      {/* Header */}
      <div className="nc-panel-card">
        <div className="nc-panel-header">
          <div>
            <h2 className="nc-panel-title">
              <span className="nc-panel-icon">📋</span>
              NC Registry System
            </h2>
            <p className="nc-panel-subtitle">
              Complete registry and tracking of non-conformities
            </p>
          </div>
          <button onClick={onBack} className="nc-btn nc-btn-secondary">
            ← Back
          </button>
        </div>

        {/* View Selector */}
        <div className="nc-view-selector">
          <button
            className={`nc-view-btn ${activeView === 'registry' ? 'active' : ''}`}
            onClick={() => setActiveView('registry')}
          >
            📋 Registry
          </button>
          <button
            className={`nc-view-btn ${activeView === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveView('stats')}
          >
            📊 Statistics
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="nc-content-area">
        {/* Registry View */}
        {activeView === 'registry' && (
          <div className="nc-panel-card">
            <div className="nc-panel-content">
              {/* Actions Bar */}
              <div className="nc-actions-bar">
                <button onClick={handleAddNC} className="nc-btn nc-btn-success">
                  ➕ Register New NC
                </button>
              </div>

              {/* Filters */}
              <div className="nc-form-section">
                <h3 className="nc-section-title">Filters</h3>
                <div className="nc-form-grid">
                  <div className="nc-form-group">
                    <label className="nc-form-label">Search</label>
                    <input
                      type="text"
                      className="nc-form-input"
                      placeholder="Search by number, project, subject..."
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

              {/* NC List Table */}
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
                      {Object.values(filters).some(v => v) ? 
                        'No NCs match the current filters' : 
                        'No NCs registered yet. Click "Register New NC" to add one.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="nc-table">
                      <thead>
                        <tr>
                          <th>NC #</th>
                          <th>Date</th>
                          <th>Project</th>
                          <th>Subject</th>
                          <th>Class</th>
                          <th>Status</th>
                          <th>Phase</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredNCList.map(nc => (
                          <tr key={nc.id}>
                            <td className="nc-number-cell">{nc.number}</td>
                            <td>{nc.dateOfDetection}</td>
                            <td>{nc.projectName || nc.projectCode || '-'}</td>
                            <td>{nc.ncMainSubject || '-'}</td>
                            <td>
                              <span className={`nc-badge nc-badge-${nc.ncClass}`}>
                                {nc.ncClass?.toUpperCase() || '-'}
                              </span>
                            </td>
                            <td>
                              <span className={`nc-badge nc-badge-${nc.status}`}>
                                {nc.status?.replace('_', ' ').toUpperCase() || '-'}
                              </span>
                            </td>
                            <td>{getDetectionPhaseLabel(nc.detectionPhase)}</td>
                            <td>
                              <div className="nc-action-buttons">
                                <button
                                  onClick={() => handleViewNC(nc)}
                                  className="nc-btn-icon"
                                  title="View"
                                >
                                  👁️
                                </button>
                                <button
                                  onClick={() => handleEditNC(nc)}
                                  className="nc-btn-icon"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteNC(nc.id)}
                                  className="nc-btn-icon"
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
        )}

        {/* Statistics View */}
        {activeView === 'stats' && (
          <div className="nc-panel-container">
            <NCStatisticsCharts ncList={ncList} />
          </div>
        )}
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

            {/* ✅ CAMBIO 4: Usar handleNCChange en lugar de setCurrentNC */}
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
              <h2 className="nc-panel-title">NC #{selectedNC.number} - Details</h2>
            </div>

            <div className="nc-panel-content">
              <div className="nc-detail-grid">
                <div className="nc-detail-item">
                  <span className="nc-detail-label">Status:</span>
                  <span className={`nc-badge nc-badge-${selectedNC.status}`}>
                    {selectedNC.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="nc-detail-item">
                  <span className="nc-detail-label">Class:</span>
                  <span className={`nc-badge nc-badge-${selectedNC.ncClass}`}>
                    {selectedNC.ncClass?.toUpperCase()}
                  </span>
                </div>
                <div className="nc-detail-item">
                  <span className="nc-detail-label">Date:</span>
                  <span>{selectedNC.dateOfDetection}</span>
                </div>
                <div className="nc-detail-item">
                  <span className="nc-detail-label">Phase:</span>
                  <span>{getDetectionPhaseLabel(selectedNC.detectionPhase)}</span>
                </div>
                <div className="nc-detail-item">
                  <span className="nc-detail-label">Project:</span>
                  <span>{selectedNC.projectName || selectedNC.projectCode || '-'}</span>
                </div>
                <div className="nc-detail-item">
                  <span className="nc-detail-label">Accountable:</span>
                  <span>{selectedNC.accountable || '-'}</span>
                </div>
              </div>

              {selectedNC.ncMainSubject && (
                <div className="nc-description-section">
                  <h4 className="nc-subsection-title">Subject</h4>
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