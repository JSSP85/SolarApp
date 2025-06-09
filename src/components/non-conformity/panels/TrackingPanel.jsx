// src/components/non-conformity/panels/TrackingPanel.jsx
import React, { useState, useEffect } from 'react';
import { useNonConformity } from '../../../context/NonConformityContext';

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

    const statusLabels = {
      'open': 'Open',
      'progress': 'In Progress',
      'resolved': 'Resolved',
      'closed': 'Closed'
    };

    // Add timeline entry for status change
    const timelineEntry = {
      date: `${new Date().toLocaleDateString('en-GB')} - ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
      title: `🔄 Status Changed to ${statusLabels[newStatus]}`,
      description: `NC status updated from ${statusLabels[selectedNC.status]} to ${statusLabels[newStatus]}`,
      type: 'status_change'
    };

    // Update NC status and add timeline entry
    dispatch({
      type: 'UPDATE_NC',
      payload: {
        id: selectedNC.id,
        updates: { 
          status: newStatus,
          ...(newStatus === 'resolved' && !selectedNC.actualClosureDate && {
            actualClosureDate: new Date().toLocaleDateString('en-GB')
          })
        }
      }
    });

    dispatch({
      type: 'ADD_TIMELINE_ENTRY',
      payload: {
        ncId: selectedNC.id,
        entry: timelineEntry
      }
    });

    setStatusUpdate(newStatus);
  };

  // Handle adding new timeline entry
  const handleAddTimelineEntry = () => {
    if (!newTimelineEntry.title || !newTimelineEntry.description || !selectedNC) return;

    const entryIcons = {
      'update': '📝',
      'analysis': '🔍',
      'action': '🔧',
      'approval': '✅',
      'escalation': '⚠️',
      'resolution': '🎯'
    };

    const timelineEntry = {
      date: `${new Date().toLocaleDateString('en-GB')} - ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
      title: `${entryIcons[newTimelineEntry.type]} ${newTimelineEntry.title}`,
      description: newTimelineEntry.description,
      type: newTimelineEntry.type
    };

    dispatch({
      type: 'ADD_TIMELINE_ENTRY',
      payload: {
        ncId: selectedNC.id,
        entry: timelineEntry
      }
    });

    // Reset form
    setNewTimelineEntry({ title: '', description: '', type: 'update' });
    setShowAddUpdate(false);
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

  // Get timeline icon for entry type
  const getTimelineIcon = (type) => {
    const icons = {
      'detection': '🚨',
      'analysis': '🔍',
      'approval': '📋',
      'action': '🔧',
      'status_change': '🔄',
      'update': '📝',
      'escalation': '⚠️',
      'resolution': '🎯',
      'creation': '🆕'
    };
    return icons[type] || '📝';
  };

  // Filter NCs for dropdown (active ones first)
  const sortedNCs = [...ncList].sort((a, b) => {
    const statusPriority = { 'open': 0, 'progress': 1, 'resolved': 2, 'closed': 3 };
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    return new Date(b.createdDate.split('/').reverse().join('-')) - new Date(a.createdDate.split('/').reverse().join('-'));
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
                  {' '}({nc.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {selectedNC && (
            <div className="nc-form-group">
              <label className="nc-form-label">Update Status</label>
              <select
                className="nc-form-select"
                value={statusUpdate}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="open">Open</option>
                <option value="progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          )}
        </div>

        {/* NC Details Section */}
        {selectedNC && (
          <>
            <div className="nc-tracking-details">
              <div className="nc-details-grid">
                <div className="nc-detail-item">
                  <span className="nc-detail-label">NC Number:</span>
                  <span className="nc-detail-value nc-detail-number">{selectedNC.number}</span>
                </div>
                <div className="nc-detail-item">
                  <span className="nc-detail-label">Priority:</span>
                  <span className={`nc-status-badge ${getPriorityBadgeClass(selectedNC.priority)}`}>
                    {selectedNC.priority.toUpperCase()}
                  </span>
                </div>
                <div className="nc-detail-item">
                  <span className="nc-detail-label">Status:</span>
                  <span className={`nc-status-badge ${getStatusBadgeClass(selectedNC.status)}`}>
                    {selectedNC.status.replace('_', ' ').toUpperCase()}
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
                  <span className="nc-detail-value">{selectedNC.createdDate}</span>
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
                <h4 className="nc-subsection-title">
                  <span className="nc-timeline-icon">⏱️</span>
                  Progress Timeline
                </h4>
                <button
                  className="nc-btn nc-btn-secondary nc-btn-small"
                  onClick={() => setShowAddUpdate(!showAddUpdate)}
                >
                  <span className="nc-btn-icon">➕</span>
                  Add Update
                </button>
              </div>

              {/* Add Update Form */}
              {showAddUpdate && (
                <div className="nc-add-update-form">
                  <div className="nc-form-grid">
                    <div className="nc-form-group">
                      <label className="nc-form-label">Update Type</label>
                      <select
                        className="nc-form-select"
                        value={newTimelineEntry.type}
                        onChange={(e) => setNewTimelineEntry(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="update">General Update</option>
                        <option value="analysis">Root Cause Analysis</option>
                        <option value="action">Corrective Action</option>
                        <option value="approval">Approval/Review</option>
                        <option value="escalation">Escalation</option>
                        <option value="resolution">Resolution</option>
                      </select>
                    </div>
                    <div className="nc-form-group">
                      <label className="nc-form-label">Update Title</label>
                      <input
                        type="text"
                        className="nc-form-input"
                        value={newTimelineEntry.title}
                        onChange={(e) => setNewTimelineEntry(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Brief description of the update..."
                      />
                    </div>
                  </div>
                  <div className="nc-form-group">
                    <label className="nc-form-label">Detailed Description</label>
                    <textarea
                      className="nc-form-textarea"
                      rows="3"
                      value={newTimelineEntry.description}
                      onChange={(e) => setNewTimelineEntry(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Provide detailed information about this update..."
                    />
                  </div>
                  <div className="nc-form-actions nc-form-actions-inline">
                    <button
                      className="nc-btn nc-btn-primary nc-btn-small"
                      onClick={handleAddTimelineEntry}
                      disabled={!newTimelineEntry.title || !newTimelineEntry.description}
                    >
                      <span className="nc-btn-icon">💾</span>
                      Add Update
                    </button>
                    <button
                      className="nc-btn nc-btn-ghost nc-btn-small"
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
                    <div key={index} className="nc-timeline-item">
                      <div className="nc-timeline-marker">
                        <span className="nc-timeline-icon-display">
                          {getTimelineIcon(entry.type)}
                        </span>
                      </div>
                      <div className="nc-timeline-content">
                        <div className="nc-timeline-date">{entry.date}</div>
                        <div className="nc-timeline-title">{entry.title}</div>
                        <div className="nc-timeline-description">{entry.description}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="nc-timeline-empty">
                    <span className="nc-empty-icon">📝</span>
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
                    // TODO: Implement PDF generation for specific NC
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