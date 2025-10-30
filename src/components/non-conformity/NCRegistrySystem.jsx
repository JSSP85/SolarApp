// src/components/non-conformity/NCRegistrySystem.jsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '../../context/AuthContext';

// Services
import {
  addNCToRegistry,
  updateNCInRegistry,
  deleteNCFromRegistry,
  getAllNCs,
  getNextNCNumber
} from '../../firebase/ncRegistryService';

import {
  addClientNC,
  updateClientNC,
  deleteClientNC,
  getAllClientNCs
} from '../../firebase/clientNCService';

// Components
import NCStatisticsCharts from './NCStatisticsCharts';
import BackButton from '../common/BackButton';
import ClientNCForm from './ClientNCForm';

// Styles
import '../../styles/non-conformity.css';

// ================================================================
// OPTIONS
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
// NC FORM COMPONENT (Original - para NC Registry)
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
              disabled
            />
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
            <label className="nc-form-label">Year</label>
            <input
              type="number"
              value={nc.year || new Date().getFullYear()}
              onChange={(e) => onChange({ ...nc, year: parseInt(e.target.value) })}
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
              {monthOptions.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Status</label>
            <select
              value={nc.status || 'open'}
              onChange={(e) => onChange({ ...nc, status: e.target.value })}
              className="nc-form-select"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
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
// MAIN COMPONENT
// ================================================================
const NCRegistrySystemUpdated = ({ onBack }) => {
  const { currentUser } = useAuth();
  
  // View management: 'registry', 'client-nc', 'stats'
  const [activeView, setActiveView] = useState('registry');
  
  // Lists
  const [ncList, setNcList] = useState([]);
  const [clientNCList, setClientNCList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNC, setSelectedNC] = useState(null);
  const [showEditPanel, setShowEditPanel] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    detectionPlace: '',
    year: ''
  });

  // Empty templates
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

  const emptyClientNC = {
    year: new Date().getFullYear(),
    month: '',
    status: 'open',
    ncIssuer: '', // Client name
    dateOfDetection: new Date().toISOString().split('T')[0],
    detectionPhase: '',
    orderNumber: '',
    projectCode: '',
    projectName: '',
    ncClass: '',
    ncMainSubject: '',
    ncBriefSummary: '',
    treatment: '',
    dateOfClosure: '',
    rootCauseAnalysis: '',
    correctiveAction: ''
  };

  const [currentNC, setCurrentNC] = useState(emptyNC);
  
  const handleNCChange = useCallback((updatedNC) => {
    setCurrentNC(updatedNC);
  }, []);

  // Load data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [ncs, clientNCs] = await Promise.all([
        getAllNCs(),
        getAllClientNCs()
      ]);
      setNcList(ncs);
      setClientNCList(clientNCs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtering logic
  const getCurrentList = () => {
    return activeView === 'client-nc' ? clientNCList : ncList;
  };

  const filteredList = getCurrentList().filter(nc => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesNumber = nc.number?.toLowerCase().includes(searchLower);
      const matchesProject = nc.projectName?.toLowerCase().includes(searchLower);
      const matchesSubject = nc.ncMainSubject?.toLowerCase().includes(searchLower);
      const matchesClient = nc.ncIssuer?.toLowerCase().includes(searchLower);
      
      if (!matchesNumber && !matchesProject && !matchesSubject && !matchesClient) {
        return false;
      }
    }
    if (filters.status && nc.status !== filters.status) return false;
    if (filters.priority && nc.ncClass !== filters.priority) return false;
    if (filters.detectionPlace && nc.detectionPhase !== filters.detectionPlace) return false;
    if (filters.year && nc.year !== parseInt(filters.year)) return false;
    return true;
  });

  const uniqueYears = [...new Set([...ncList, ...clientNCList].map(nc => nc.year))].sort((a, b) => b - a);

  // Handlers for NC Registry
  const handleAddNC = async () => {
    const nextNumber = await getNextNCNumber();
    setCurrentNC({ ...emptyNC, number: nextNumber });
    setShowAddModal(true);
  };

  // Handlers for Client NC
  const handleAddClientNC = () => {
    setCurrentNC(emptyClientNC);
    setShowAddModal(true);
  };

  const handleSaveNC = async () => {
    // Validation
    if (activeView === 'registry') {
      if (!currentNC.number || !currentNC.ncMainSubject || !currentNC.ncClass) {
        alert('⚠️ Please complete required fields: Number, Subject, and NC Class');
        return;
      }
    } else {
      // Client NC validation (no number required)
      if (!currentNC.ncIssuer || !currentNC.dateOfDetection || !currentNC.ncMainSubject || !currentNC.ncClass) {
        alert('⚠️ Please complete required fields: Client, Date, Subject, and NC Class');
        return;
      }
    }

    try {
      if (activeView === 'registry') {
        // NC Registry save
        if (currentNC.id) {
          const { id, ...updateData } = currentNC;
          await updateNCInRegistry(id, updateData);
          alert('✅ NC updated successfully');
        } else {
          await addNCToRegistry(currentNC);
          alert('✅ NC created successfully');
        }
      } else {
        // Client NC save
        if (currentNC.id) {
          const { id, ...updateData } = currentNC;
          await updateClientNC(id, updateData);
          alert('✅ Client NC updated successfully');
        } else {
          await addClientNC(currentNC);
          alert('✅ Client NC created successfully');
        }
      }

      await loadAllData();
      setShowAddModal(false);
      setShowEditPanel(false);
      setCurrentNC(activeView === 'registry' ? emptyNC : emptyClientNC);
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
      if (activeView === 'registry') {
        await deleteNCFromRegistry(id);
      } else {
        await deleteClientNC(id);
      }
      await loadAllData();
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
      if (activeView === 'registry') {
        await updateNCInRegistry(ncId, { status: newStatus });
      } else {
        await updateClientNC(ncId, { status: newStatus });
      }
      await loadAllData();
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

            {/* NC Registry */}
            <div 
              className={`nc-nav-item ${activeView === 'registry' ? 'nc-active' : ''}`}
              onClick={() => setActiveView('registry')}
            >
              <span className="nc-nav-icon">📋</span>
              <span className="nc-nav-text">NC Registry</span>
              <span className="nc-nav-badge">{ncList.length}</span>
              {activeView === 'registry' && <div className="nc-nav-indicator"></div>}
            </div>

            {/* Client NC */}
            <div 
              className={`nc-nav-item ${activeView === 'client-nc' ? 'nc-active' : ''}`}
              onClick={() => setActiveView('client-nc')}
            >
              <span className="nc-nav-icon">👥</span>
              <span className="nc-nav-text">NC de Clientes</span>
              <span className="nc-nav-badge">{clientNCList.length}</span>
              {activeView === 'client-nc' && <div className="nc-nav-indicator"></div>}
            </div>

            {/* Statistics */}
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
                  <span className="nc-stat-label">Total NC Registry:</span>
                  <span className="nc-stat-value">{ncList.length}</span>
                </div>
                <div className="nc-stat-item">
                  <span className="nc-stat-label">Total Client NC:</span>
                  <span className="nc-stat-value">{clientNCList.length}</span>
                </div>
                <div className="nc-stat-item nc-critical">
                  <span className="nc-stat-label">Open:</span>
                  <span className="nc-stat-value">
                    {[...ncList, ...clientNCList].filter(nc => nc.status === 'open').length}
                  </span>
                </div>
                <div className="nc-stat-item">
                  <span className="nc-stat-label">Closed:</span>
                  <span className="nc-stat-value">
                    {[...ncList, ...clientNCList].filter(nc => nc.status === 'closed').length}
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
              <h1 className="nc-main-title">
                {activeView === 'registry' ? 'NC Registry' : 
                 activeView === 'client-nc' ? 'NC de Clientes' : 
                 'Statistics'}
              </h1>
              <div className="nc-breadcrumb">
                Quality Management → Non-Conformities → {
                  activeView === 'registry' ? 'NC Registry' : 
                  activeView === 'client-nc' ? 'NC de Clientes' : 
                  'Statistics'
                }
              </div>
            </div>
            <div className="nc-header-actions">
              {(activeView === 'registry' || activeView === 'client-nc') && (
                <button 
                  className="nc-btn nc-btn-primary" 
                  onClick={activeView === 'registry' ? handleAddNC : handleAddClientNC}
                >
                  <span>➕</span>
                  <span>New {activeView === 'registry' ? 'NC' : 'Client NC'}</span>
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
          {(activeView === 'registry' || activeView === 'client-nc') && (
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
                          placeholder={activeView === 'registry' ? "NC number, project, subject..." : "Client, project, subject..."}
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
                          <option value="">All</option>
                          {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="nc-form-group">
                        <label className="nc-form-label">Priority</label>
                        <select
                          className="nc-form-select"
                          value={filters.priority}
                          onChange={(e) => setFilters({...filters, priority: e.target.value})}
                        >
                          <option value="">All</option>
                          {ncClassOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="nc-form-group">
                        <label className="nc-form-label">Detection Place</label>
                        <select
                          className="nc-form-select"
                          value={filters.detectionPlace}
                          onChange={(e) => setFilters({...filters, detectionPlace: e.target.value})}
                        >
                          <option value="">All</option>
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
                          <option value="">All</option>
                          {uniqueYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* NC List Table */}
                  <div className="nc-table-container">
                    <table className="nc-table">
                      <thead>
                        <tr>
                          {activeView === 'registry' && <th>NC Number</th>}
                          {activeView === 'client-nc' && <th>Date</th>}
                          <th>{activeView === 'client-nc' ? 'Client' : 'Issuer'}</th>
                          <th>Subject</th>
                          <th>Project</th>
                          <th>Class</th>
                          <th>Status</th>
                          <th>Detection</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredList.length === 0 ? (
                          <tr>
                            <td colSpan={activeView === 'registry' ? "8" : "8"} style={{ textAlign: 'center' }}>
                              No records found
                            </td>
                          </tr>
                        ) : (
                          filteredList.map(nc => (
                            <tr key={nc.id}>
                              {activeView === 'registry' && <td className="nc-table-number">{nc.number}</td>}
                              {activeView === 'client-nc' && <td>{nc.dateOfDetection}</td>}
                              <td>{nc.ncIssuer || '-'}</td>
                              <td className="nc-table-subject">{nc.ncMainSubject || '-'}</td>
                              <td>{nc.projectName || nc.projectCode || '-'}</td>
                              <td>
                                <span className={`nc-badge nc-badge-${nc.ncClass}`}>
                                  {nc.ncClass?.toUpperCase() || '-'}
                                </span>
                              </td>
                              <td>
                                <span className={`nc-status nc-status-${nc.status}`}>
                                  {statusOptions.find(s => s.value === nc.status)?.label || nc.status}
                                </span>
                              </td>
                              <td>
                                <span className="nc-detection-badge">
                                  {getDetectionPhaseLabel(nc.detectionPhase)}
                                </span>
                              </td>
                              <td className="nc-table-actions">
                                <button
                                  className="nc-btn-icon nc-btn-view"
                                  onClick={() => handleViewNC(nc)}
                                  title="View details"
                                >
                                  👁️
                                </button>
                                <button
                                  className="nc-btn-icon nc-btn-edit"
                                  onClick={() => handleEditNC(nc)}
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  className="nc-btn-icon nc-btn-delete"
                                  onClick={() => handleDeleteNC(nc.id)}
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics View */}
          {activeView === 'stats' && (
            <NCStatisticsCharts ncList={[...ncList, ...clientNCList]} />
          )}

          {/* Add/Edit Modal */}
          {showAddModal && (
            <div className="nc-modal-overlay">
              <div className="nc-modal-content">
                <div className="nc-modal-header">
                  <h2 className="nc-modal-title">
                    {currentNC.id ? 'Edit' : 'New'} {activeView === 'registry' ? 'NC' : 'Client NC'}
                  </h2>
                  <button 
                    className="nc-modal-close"
                    onClick={() => {
                      setShowAddModal(false);
                      setCurrentNC(activeView === 'registry' ? emptyNC : emptyClientNC);
                    }}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="nc-modal-body">
                  {activeView === 'registry' ? (
                    <NCForm nc={currentNC} onChange={handleNCChange} />
                  ) : (
                    <ClientNCForm nc={currentNC} onChange={handleNCChange} />
                  )}
                </div>

                <div className="nc-modal-footer">
                  <button
                    className="nc-btn nc-btn-secondary"
                    onClick={() => {
                      setShowAddModal(false);
                      setCurrentNC(activeView === 'registry' ? emptyNC : emptyClientNC);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="nc-btn nc-btn-primary"
                    onClick={handleSaveNC}
                  >
                    💾 Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Panel */}
          {showEditPanel && (
            <div className="nc-panel-overlay">
              <div className="nc-panel-content nc-panel-large">
                <div className="nc-panel-header">
                  <h2 className="nc-panel-title">
                    Edit {activeView === 'registry' ? 'NC' : 'Client NC'}
                  </h2>
                  <button
                    className="nc-panel-close"
                    onClick={() => {
                      setShowEditPanel(false);
                      setCurrentNC(activeView === 'registry' ? emptyNC : emptyClientNC);
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div className="nc-panel-body">
                  {activeView === 'registry' ? (
                    <NCForm nc={currentNC} onChange={handleNCChange} />
                  ) : (
                    <ClientNCForm nc={currentNC} onChange={handleNCChange} />
                  )}
                </div>

                <div className="nc-panel-footer">
                  <button
                    className="nc-btn nc-btn-secondary"
                    onClick={() => {
                      setShowEditPanel(false);
                      setCurrentNC(activeView === 'registry' ? emptyNC : emptyClientNC);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="nc-btn nc-btn-primary"
                    onClick={handleSaveNC}
                  >
                    💾 Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Detail Panel */}
          {selectedNC && (
            <div className="nc-panel-overlay">
              <div className="nc-panel-content">
                <div className="nc-panel-header">
                  <h2 className="nc-panel-title">
                    {activeView === 'registry' ? `NC ${selectedNC.number}` : `Client NC - ${selectedNC.ncIssuer}`}
                  </h2>
                  <button
                    className="nc-panel-close"
                    onClick={() => setSelectedNC(null)}
                  >
                    ✕
                  </button>
                </div>

                <div className="nc-panel-body">
                  <div className="nc-detail-section">
                    <h3 className="nc-section-title">Basic Information</h3>
                    <div className="nc-detail-grid">
                      {activeView === 'registry' && (
                        <div className="nc-detail-item">
                          <span className="nc-detail-label">NC Number:</span>
                          <span className="nc-detail-value">{selectedNC.number}</span>
                        </div>
                      )}
                      <div className="nc-detail-item">
                        <span className="nc-detail-label">{activeView === 'client-nc' ? 'Client:' : 'Issuer:'}</span>
                        <span className="nc-detail-value">{selectedNC.ncIssuer || '-'}</span>
                      </div>
                      <div className="nc-detail-item">
                        <span className="nc-detail-label">Status:</span>
                        <span className={`nc-status nc-status-${selectedNC.status}`}>
                          {statusOptions.find(s => s.value === selectedNC.status)?.label || selectedNC.status}
                        </span>
                      </div>
                      <div className="nc-detail-item">
                        <span className="nc-detail-label">Class:</span>
                        <span className={`nc-badge nc-badge-${selectedNC.ncClass}`}>
                          {selectedNC.ncClass?.toUpperCase()}
                        </span>
                      </div>
                      <div className="nc-detail-item">
                        <span className="nc-detail-label">Date of Detection:</span>
                        <span className="nc-detail-value">{selectedNC.dateOfDetection}</span>
                      </div>
                      <div className="nc-detail-item">
                        <span className="nc-detail-label">Detection Phase:</span>
                        <span className="nc-detail-value">{getDetectionPhaseLabel(selectedNC.detectionPhase)}</span>
                      </div>
                      <div className="nc-detail-item">
                        <span className="nc-detail-label">Project:</span>
                        <span className="nc-detail-value">{selectedNC.projectName || selectedNC.projectCode || '-'}</span>
                      </div>
                      {activeView === 'registry' && (
                        <div className="nc-detail-item">
                          <span className="nc-detail-label">Accountable:</span>
                          <span className="nc-detail-value">{selectedNC.accountable || '-'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="nc-detail-section">
                    <h3 className="nc-section-title">NC Details</h3>
                    <div className="nc-detail-item-full">
                      <span className="nc-detail-label">Subject:</span>
                      <span className="nc-detail-value">{selectedNC.ncMainSubject}</span>
                    </div>
                    <div className="nc-detail-item-full">
                      <span className="nc-detail-label">Summary:</span>
                      <p className="nc-detail-text">{selectedNC.ncBriefSummary || '-'}</p>
                    </div>
                    <div className="nc-detail-item-full">
                      <span className="nc-detail-label">Treatment:</span>
                      <p className="nc-detail-text">{selectedNC.treatment || '-'}</p>
                    </div>
                    <div className="nc-detail-item-full">
                      <span className="nc-detail-label">Root Cause Analysis:</span>
                      <p className="nc-detail-text">{selectedNC.rootCauseAnalysis || '-'}</p>
                    </div>
                    <div className="nc-detail-item-full">
                      <span className="nc-detail-label">Corrective Action:</span>
                      <p className="nc-detail-text">{selectedNC.correctiveAction || '-'}</p>
                    </div>
                  </div>

                  <div className="nc-detail-section">
                    <h3 className="nc-section-title">Status Management</h3>
                    <div className="nc-status-buttons">
                      <button
                        className="nc-btn nc-btn-status nc-btn-status-open"
                        onClick={() => handleUpdateStatus(selectedNC.id, 'open')}
                        disabled={selectedNC.status === 'open'}
                      >
                        🔴 Open
                      </button>
                      <button
                        className="nc-btn nc-btn-status nc-btn-status-progress"
                        onClick={() => handleUpdateStatus(selectedNC.id, 'in_progress')}
                        disabled={selectedNC.status === 'in_progress'}
                      >
                        🟡 In Progress
                      </button>
                      <button
                        className="nc-btn nc-btn-status nc-btn-status-closed"
                        onClick={() => handleUpdateStatus(selectedNC.id, 'closed')}
                        disabled={selectedNC.status === 'closed'}
                      >
                        🟢 Closed
                      </button>
                      <button
                        className="nc-btn nc-btn-status nc-btn-status-cancelled"
                        onClick={() => handleUpdateStatus(selectedNC.id, 'cancelled')}
                        disabled={selectedNC.status === 'cancelled'}
                      >
                        ⚫ Cancelled
                      </button>
                    </div>
                  </div>
                </div>

                <div className="nc-panel-footer">
                  <button
                    className="nc-btn nc-btn-secondary"
                    onClick={() => setSelectedNC(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NCRegistrySystemUpdated;