// src/components/non-conformity/panels/TrackingPanel.jsx
import React, { useState, useEffect } from 'react';
import { useNonConformity } from '../../../context/NonConformityContext';
// ✅ AGREGAR ESTA LÍNEA - IMPORT URGENTE
import { safeDateCompare } from '../../../utils/dateUtils';

const TrackingPanel = () => {
  const { state, dispatch, helpers } = useNonConformity();
  const { ncList } = state;
  
  // Local state for tracking management
  const [selectedNCId, setSelectedNCId] = useState('');
  const [selectedNC, setSelectedNC] = useState(null);
  const [newTimelineEntry, setNewTimelineEntry] = useState({
    title: '',
    description: '',
    type: 'update'
  });
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');

  // Set default selected NC to first active one
  useEffect(() => {
    if (!selectedNCId && ncList.length > 0) {
      const activeNC = ncList.find(nc => nc.status === 'progress' || nc.status === 'open') || ncList[0];
      setSelectedNCId(activeNC.id);
    }
  }, [ncList, selectedNCId]);

  // Update selected NC when ID changes
  useEffect(() => {
    if (selectedNCId) {
      const nc = helpers.getNCById(selectedNCId);
      setSelectedNC(nc);
      setStatusUpdate(nc?.status || '');
    }
  }, [selectedNCId, helpers]);

  // Handle NC selection change
  const handleNCSelection = (ncId) => {
    setSelectedNCId(ncId);
    setShowAddUpdate(false);
    setNewTimelineEntry({ title: '', description: '', type: 'update' });
  };

  // Handle status change
  const handleStatusChange = (newStatus) => {
    if (!selectedNC) return;
    
    helpers.updateNCStatus(selectedNC.id, newStatus);
    
    // Add automatic timeline entry for status change
    const statusLabels = {
      'open': 'Opened',
      'progress': 'In Progress',
      'resolved': 'Resolved',
      'closed': 'Closed'
    };
    
    helpers.addTimelineEntry(selectedNC.id, {
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      title: `Status Updated to ${statusLabels[newStatus]}`,
      description: `Non-conformity status changed from ${statusLabels[selectedNC.status]} to ${statusLabels[newStatus]}`,
      type: 'status_change'
    });
  };

  // Handle adding new timeline entry
  const handleAddTimelineEntry = () => {
    if (!newTimelineEntry.title.trim() || !newTimelineEntry.description.trim()) {
      alert('Please fill in both title and description');
      return;
    }
    
    helpers.addTimelineEntry(selectedNC.id, {
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      title: newTimelineEntry.title,
      description: newTimelineEntry.description,
      type: newTimelineEntry.type
    });
    
    setNewTimelineEntry({ title: '', description: '', type: 'update' });
    setShowAddUpdate(false);
  };

  // ✅ CAMBIO CRÍTICO - REEMPLAZAR ESTA FUNCIÓN COMPLETAMENTE:
  const sortedNCs = [...ncList].sort((a, b) => {
    const statusPriority = { 'open': 0, 'progress': 1, 'resolved': 2, 'closed': 3 };
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    // ✅ USAR FUNCIÓN SEGURA PARA FECHAS - ESTO RESUELVE EL ERROR
    return safeDateCompare(a.createdDate || '', b.createdDate || '', 'desc');
  });

  return (
    <div className="nc-tracking-panel">
      <div className="nc-panel-card">
        <div className="nc-panel-header">
          <h3 className="nc-panel-title">
            <span className="nc-panel-icon">📋</span>
            NC Tracking & Progress Management
          </h3>
          <p className="nc-panel-subtitle">
            Monitor progress, update status, and manage timeline for specific non-conformities
          </p>
        </div>

        {/* NC Selection Section */}
        <div className="nc-tracking-controls">
          <div className="nc-form-group">
            <label className="nc-form-label">Select NC to Track</label>
            <select
              className="nc-form-select nc-select-large"
              value={selectedNCId}
              onChange={(e) => handleNCSelection(e.target.value)}
            >
              <option value="">Choose a Non-Conformity...</option>
              {sortedNCs.map(nc => (
                <option key={nc.id} value={nc.id}>
                  {nc.number} - {nc.project} - {nc.description.substring(0, 50)}
                  {nc.description.length > 50 ? '...' : ''} 
                  ({nc.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* NC Details Section */}
        {selectedNC && (
          <>
            <div className="nc-tracking-details">
              <div className="nc-detail-grid">
                <div className="nc-detail-item">
                  <span className="nc-detail-label">NC Number:</span>
                  <span className="nc-detail-value nc-detail-number">{selectedNC.number}</span>
                </div>
                <div className="nc-detail-item">
                  <span className="nc-detail-label">Priority:</span>
                  <span className={`nc-detail-value nc-priority-${selectedNC.priority}`}>
                    {selectedNC.priority?.toUpperCase()}
                  </span>
                </div>
                <div className="nc-detail-item">
                  <span className="nc-detail-label">Status:</span>
                  <span className={`nc-detail-value nc-status-${selectedNC.status}`}>
                    {selectedNC.status?.toUpperCase()}
                  </span>
                </div>
                <div className="nc-detail-item">
                  <span className="nc-detail-label">Project:</span>
                  <span className="nc-detail-value">{selectedNC.project}</span>
                </div>
                <div className="nc-detail-item">
                  <span className="nc-detail-label">Supplier:</span>
                  <span className="nc-detail-value">{selectedNC.supplier || 'N/A'}</span>
                </div>
                <div className="nc-detail-item">
                  <span className="nc-detail-label">Created:</span>
                  <span className="nc-detail-value">{selectedNC.createdDate || 'N/A'}</span>
                </div>
                <div className="nc-detail-item">
                  <span className="nc-detail-label">Days Open:</span>
                  <span className="nc-detail-value">{selectedNC.daysOpen || 0} days</span>
                </div>
                <div className="nc-detail-item">
                  <span className="nc-detail-label">Assigned To:</span>
                  <span className="nc-detail-value">{selectedNC.assignedTo || selectedNC.createdBy}</span>
                </div>
              </div>

              <div className="nc-description-section">
                <h4 className="nc-subsection-title">Problem Description</h4>
                <p className="nc-description-text">{selectedNC.description}</p>
                {selectedNC.component && (
                  <div className="nc-component-info">
                    <strong>Affected Component:</strong> {selectedNC.component}
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Section */}
            <div className="nc-timeline-section">
              <div className="nc-timeline-header">
                <h4 className="nc-subsection-title">Timeline & Progress Updates</h4>
                <button
                  className="nc-btn nc-btn-primary nc-btn-small"
                  onClick={() => setShowAddUpdate(!showAddUpdate)}
                >
                  <span className="nc-btn-icon">➕</span>
                  Add Update
                </button>
              </div>

              {/* Add Update Form */}
              {showAddUpdate && (
                <div className="nc-add-update-form">
                  <div className="nc-form-group">
                    <label className="nc-form-label">Update Title</label>
                    <input
                      type="text"
                      className="nc-form-input"
                      value={newTimelineEntry.title}
                      onChange={(e) => setNewTimelineEntry({
                        ...newTimelineEntry,
                        title: e.target.value
                      })}
                      placeholder="Brief title for this update..."
                    />
                  </div>
                  <div className="nc-form-group">
                    <label className="nc-form-label">Description</label>
                    <textarea
                      className="nc-form-textarea"
                      rows="3"
                      value={newTimelineEntry.description}
                      onChange={(e) => setNewTimelineEntry({
                        ...newTimelineEntry,
                        description: e.target.value
                      })}
                      placeholder="Detailed description of the update..."
                    />
                  </div>
                  <div className="nc-form-group">
                    <label className="nc-form-label">Update Type</label>
                    <select
                      className="nc-form-select"
                      value={newTimelineEntry.type}
                      onChange={(e) => setNewTimelineEntry({
                        ...newTimelineEntry,
                        type: e.target.value
                      })}
                    >
                      <option value="update">General Update</option>
                      <option value="investigation">Investigation</option>
                      <option value="action">Corrective Action</option>
                      <option value="verification">Verification</option>
                      <option value="escalation">Escalation</option>
                    </select>
                  </div>
                  <div className="nc-form-actions">
                    <button
                      className="nc-btn nc-btn-success"
                      onClick={handleAddTimelineEntry}
                    >
                      Add Update
                    </button>
                    <button
                      className="nc-btn nc-btn-ghost"
                      onClick={() => setShowAddUpdate(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Timeline Display */}
              <div className="nc-timeline">
                {selectedNC.timeline && selectedNC.timeline.length > 0 ? (
                  selectedNC.timeline.map((entry, index) => (
                    <div key={index} className={`nc-timeline-entry nc-entry-${entry.type}`}>
                      <div className="nc-timeline-marker">
                        <span className="nc-timeline-icon">
                          {entry.type === 'creation' ? '🚨' :
                           entry.type === 'action' ? '⚡' :
                           entry.type === 'investigation' ? '🔍' :
                           entry.type === 'status_change' ? '📈' :
                           entry.type === 'verification' ? '✅' :
                           entry.type === 'escalation' ? '⚠️' : '📝'}
                        </span>
                      </div>
                      <div className="nc-timeline-content">
                        <div className="nc-timeline-header">
                          <h5 className="nc-timeline-title">{entry.title}</h5>
                          <span className="nc-timeline-date">
                            {entry.date} {entry.time && `- ${entry.time}`}
                          </span>
                        </div>
                        <p className="nc-timeline-description">{entry.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="nc-timeline-empty">
                    <span className="nc-empty-icon">📅</span>
                    <p>No timeline entries yet. Add the first update to start tracking progress.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="nc-quick-actions">
              <h4 className="nc-subsection-title">Quick Actions</h4>
              <div className="nc-action-buttons">
                <button
                  className="nc-btn nc-btn-success"
                  onClick={() => handleStatusChange('resolved')}
                  disabled={selectedNC.status === 'resolved' || selectedNC.status === 'closed'}
                >
                  <span className="nc-btn-icon">✅</span>
                  Mark as Resolved
                </button>
                <button
                  className="nc-btn nc-btn-danger"
                  onClick={() => handleStatusChange('closed')}
                  disabled={selectedNC.status === 'closed'}
                >
                  <span className="nc-btn-icon">🔒</span>
                  Close NC
                </button>
                <button
                  className="nc-btn nc-btn-secondary"
                  onClick={() => {
                    console.log('Generating PDF for NC:', selectedNC.number);
                  }}
                >
                  <span className="nc-btn-icon">📄</span>
                  Generate Report
                </button>
                <button
                  className="nc-btn nc-btn-ghost"
                  onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'database' })}
                >
                  <span className="nc-btn-icon">🗄️</span>
                  View in Database
                </button>
              </div>
            </div>
          </>
        )}

        {/* No NC Selected State */}
        {!selectedNC && ncList.length > 0 && (
          <div className="nc-empty-state">
            <span className="nc-empty-icon">📋</span>
            <h4>Select an NC to Track</h4>
            <p>Choose a non-conformity from the dropdown above to view its progress and timeline.</p>
          </div>
        )}

        {/* No NCs Available State */}
        {ncList.length === 0 && (
          <div className="nc-empty-state">
            <span className="nc-empty-icon">📝</span>
            <h4>No Non-Conformities Found</h4>
            <p>There are no non-conformities to track yet.</p>
            <button
              className="nc-btn nc-btn-primary"
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'create' })}
            >
              <span className="nc-btn-icon">➕</span>
              Create First NC
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingPanel;