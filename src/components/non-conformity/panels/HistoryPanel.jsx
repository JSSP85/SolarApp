// src/components/non-conformity/panels/HistoryPanel.jsx
import React, { useState, useMemo } from 'react';
import { useNonConformity } from '../../../context/NonConformityContext';

const HistoryPanel = () => {
  const { state, dispatch } = useNonConformity();
  const { ncList, searchTerm } = state;
  
  // Local state for history filters
  const [historyFilters, setHistoryFilters] = useState({
    period: 'all',
    project: 'all',
    priority: 'all',
    activityType: 'all',
    dateFrom: '',
    dateTo: ''
  });
  
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState('date'); // 'date', 'project', 'priority'
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline', 'table'

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setHistoryFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Generate all timeline entries from all NCs
  const getAllTimelineEntries = useMemo(() => {
    let allEntries = [];
    
    ncList.forEach(nc => {
      // Add creation entry
      allEntries.push({
        id: `${nc.id}-creation`,
        ncId: nc.id,
        ncNumber: nc.number,
        project: nc.project,
        priority: nc.priority,
        supplier: nc.supplier,
        date: nc.createdDate,
        title: `🆕 NC Created - ${nc.number}`,
        description: `New non-conformity created: ${nc.description.substring(0, 100)}${nc.description.length > 100 ? '...' : ''}`,
        type: 'creation',
        component: nc.component,
        status: nc.status
      });
      
      // Add timeline entries if they exist
      if (nc.timeline && nc.timeline.length > 0) {
        nc.timeline.forEach((entry, index) => {
          allEntries.push({
            id: `${nc.id}-timeline-${index}`,
            ncId: nc.id,
            ncNumber: nc.number,
            project: nc.project,
            priority: nc.priority,
            supplier: nc.supplier,
            date: entry.date.split(' - ')[0], // Extract date part
            time: entry.date.split(' - ')[1] || '', // Extract time part
            title: entry.title,
            description: entry.description,
            type: entry.type,
            component: nc.component,
            status: nc.status
          });
        });
      }
      
      // Add closure entry if resolved/closed
      if (nc.actualClosureDate && (nc.status === 'resolved' || nc.status === 'closed')) {
        allEntries.push({
          id: `${nc.id}-closure`,
          ncId: nc.id,
          ncNumber: nc.number,
          project: nc.project,
          priority: nc.priority,
          supplier: nc.supplier,
          date: nc.actualClosureDate,
          title: `🏁 NC ${nc.status === 'resolved' ? 'Resolved' : 'Closed'} - ${nc.number}`,
          description: `Non-conformity officially ${nc.status}`,
          type: nc.status,
          component: nc.component,
          status: nc.status
        });
      }
    });
    
    return allEntries;
  }, [ncList]);

  // Filter and sort timeline entries
  const filteredEntries = useMemo(() => {
    let filtered = [...getAllTimelineEntries];
    
    // Apply period filter
    if (historyFilters.period !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (historyFilters.period) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date.split('/').reverse().join('-'));
        return entryDate >= cutoffDate;
      });
    }
    
    // Apply custom date range
    if (historyFilters.dateFrom) {
      const fromDate = new Date(historyFilters.dateFrom);
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date.split('/').reverse().join('-'));
        return entryDate >= fromDate;
      });
    }
    
    if (historyFilters.dateTo) {
      const toDate = new Date(historyFilters.dateTo);
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date.split('/').reverse().join('-'));
        return entryDate <= toDate;
      });
    }
    
    // Apply project filter
    if (historyFilters.project !== 'all') {
      filtered = filtered.filter(entry => entry.project === historyFilters.project);
    }
    
    // Apply priority filter
    if (historyFilters.priority !== 'all') {
      filtered = filtered.filter(entry => entry.priority === historyFilters.priority);
    }
    
    // Apply activity type filter
    if (historyFilters.activityType !== 'all') {
      filtered = filtered.filter(entry => entry.type === historyFilters.activityType);
    }
    
    // Apply search term
    if (localSearchTerm) {
      const searchLower = localSearchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(searchLower) ||
        entry.description.toLowerCase().includes(searchLower) ||
        entry.ncNumber.toLowerCase().includes(searchLower) ||
        entry.project.toLowerCase().includes(searchLower) ||
        (entry.supplier && entry.supplier.toLowerCase().includes(searchLower)) ||
        (entry.component && entry.component.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      if (dateA.getTime() === dateB.getTime() && a.time && b.time) {
        // If same date, sort by time
        return b.time.localeCompare(a.time);
      }
      return dateB - dateA;
    });
    
    return filtered;
  }, [getAllTimelineEntries, historyFilters, localSearchTerm]);

  // Group entries by specified criteria
  const groupedEntries = useMemo(() => {
    if (groupBy === 'date') {
      const grouped = {};
      filteredEntries.forEach(entry => {
        const dateKey = entry.date;
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(entry);
      });
      return grouped;
    } else if (groupBy === 'project') {
      const grouped = {};
      filteredEntries.forEach(entry => {
        const projectKey = entry.project;
        if (!grouped[projectKey]) {
          grouped[projectKey] = [];
        }
        grouped[projectKey].push(entry);
      });
      return grouped;
    } else if (groupBy === 'priority') {
      const grouped = {};
      filteredEntries.forEach(entry => {
        const priorityKey = entry.priority.toUpperCase();
        if (!grouped[priorityKey]) {
          grouped[priorityKey] = [];
        }
        grouped[priorityKey].push(entry);
      });
      return grouped;
    }
    return { 'All Entries': filteredEntries };
  }, [filteredEntries, groupBy]);

  // Get unique values for filter options
  const uniqueProjects = [...new Set(ncList.map(nc => nc.project))];
  const uniquePriorities = [...new Set(ncList.map(nc => nc.priority))];
  const uniqueActivityTypes = [...new Set(getAllTimelineEntries.map(entry => entry.type))];

  // Get timeline icon for entry type
  const getTimelineIcon = (type) => {
    const icons = {
      'creation': '🆕',
      'detection': '🚨',
      'analysis': '🔍',
      'approval': '📋',
      'action': '🔧',
      'status_change': '🔄',
      'update': '📝',
      'escalation': '⚠️',
      'resolution': '🎯',
      'resolved': '✅',
      'closed': '🔒'
    };
    return icons[type] || '📝';
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

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    return {
      totalEntries: filteredEntries.length,
      totalNCs: new Set(filteredEntries.map(entry => entry.ncId)).size,
      criticalEntries: filteredEntries.filter(entry => entry.priority === 'critical').length,
      recentEntries: filteredEntries.filter(entry => {
        const entryDate = new Date(entry.date.split('/').reverse().join('-'));
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      }).length
    };
  }, [filteredEntries]);

  // Handle export (placeholder)
  const handleExport = () => {
    console.log('Exporting history data...', filteredEntries);
    // TODO: Implement actual export functionality
  };

  return (
    <div className="nc-history-panel">
      <div className="nc-panel-card">
        <div className="nc-panel-header">
          <h3 className="nc-panel-title">
            <span className="nc-panel-icon">📚</span>
            NC History & Timeline
          </h3>
          <p className="nc-panel-subtitle">
            Complete chronological view of all non-conformity activities and progress
          </p>
        </div>

        {/* Summary Statistics */}
        <div className="nc-history-stats">
          <div className="nc-stat-card">
            <span className="nc-stat-number">{summaryStats.totalEntries}</span>
            <span className="nc-stat-label">Total Activities</span>
          </div>
          <div className="nc-stat-card">
            <span className="nc-stat-number">{summaryStats.totalNCs}</span>
            <span className="nc-stat-label">NCs Involved</span>
          </div>
          <div className="nc-stat-card">
            <span className="nc-stat-number">{summaryStats.criticalEntries}</span>
            <span className="nc-stat-label">Critical Activities</span>
          </div>
          <div className="nc-stat-card">
            <span className="nc-stat-number">{summaryStats.recentEntries}</span>
            <span className="nc-stat-label">This Week</span>
          </div>
        </div>

        {/* Filters Section */}
        <div className="nc-history-filters">
          <div className="nc-filters-row">
            {/* Search */}
            <div className="nc-form-group nc-search-group">
              <input
                type="text"
                className="nc-form-input nc-search-input"
                placeholder="🔍 Search activities, NC numbers, projects..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
              />
            </div>

            {/* Period Filter */}
            <div className="nc-form-group">
              <select
                className="nc-form-select"
                value={historyFilters.period}
                onChange={(e) => handleFilterChange('period', e.target.value)}
              >
                <option value="all">All time</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="quarter">This quarter</option>
                <option value="year">This year</option>
                <option value="custom">Custom range</option>
              </select>
            </div>

            {/* Project Filter */}
            <div className="nc-form-group">
              <select
                className="nc-form-select"
                value={historyFilters.project}
                onChange={(e) => handleFilterChange('project', e.target.value)}
              >
                <option value="all">All projects</option>
                {uniqueProjects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="nc-form-group">
              <select
                className="nc-form-select"
                value={historyFilters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="all">All priorities</option>
                {uniquePriorities.map(priority => (
                  <option key={priority} value={priority}>{priority.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Activity Type Filter */}
            <div className="nc-form-group">
              <select
                className="nc-form-select"
                value={historyFilters.activityType}
                onChange={(e) => handleFilterChange('activityType', e.target.value)}
              >
                <option value="all">All activities</option>
                {uniqueActivityTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Date Range */}
          {historyFilters.period === 'custom' && (
            <div className="nc-filters-row">
              <div className="nc-form-group">
                <label className="nc-form-label">From Date</label>
                <input
                  type="date"
                  className="nc-form-input"
                  value={historyFilters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>
              <div className="nc-form-group">
                <label className="nc-form-label">To Date</label>
                <input
                  type="date"
                  className="nc-form-input"
                  value={historyFilters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* View Controls */}
          <div className="nc-view-controls">
            <div className="nc-view-mode">
              <button
                className={`nc-btn nc-btn-small ${viewMode === 'timeline' ? 'nc-btn-primary' : 'nc-btn-ghost'}`}
                onClick={() => setViewMode('timeline')}
              >
                📅 Timeline
              </button>
              <button
                className={`nc-btn nc-btn-small ${viewMode === 'table' ? 'nc-btn-primary' : 'nc-btn-ghost'}`}
                onClick={() => setViewMode('table')}
              >
                📋 Table
              </button>
            </div>

            <div className="nc-group-controls">
              <label className="nc-form-label nc-inline-label">Group by:</label>
              <select
                className="nc-form-select nc-select-small"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
              >
                <option value="date">Date</option>
                <option value="project">Project</option>
                <option value="priority">Priority</option>
              </select>
            </div>

            <button
              className="nc-btn nc-btn-secondary nc-btn-small"
              onClick={handleExport}
            >
              📊 Export
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="nc-history-results">
          {filteredEntries.length > 0 ? (
            <>
              {/* Timeline View */}
              {viewMode === 'timeline' && (
                <div className="nc-history-timeline">
                  {Object.entries(groupedEntries).map(([groupKey, entries]) => (
                    <div key={groupKey} className="nc-timeline-group">
                      <div className="nc-timeline-group-header">
                        <h4 className="nc-timeline-group-title">{groupKey}</h4>
                        <span className="nc-timeline-group-count">{entries.length} activities</span>
                      </div>
                      
                      <div className="nc-timeline">
                        {entries.map(entry => (
                          <div key={entry.id} className="nc-timeline-item">
                            <div className="nc-timeline-marker">
                              <span className="nc-timeline-icon-display">
                                {getTimelineIcon(entry.type)}
                              </span>
                            </div>
                            <div className="nc-timeline-content">
                              <div className="nc-timeline-header">
                                <div className="nc-timeline-title">{entry.title}</div>
                                <div className="nc-timeline-meta">
                                  <span className="nc-timeline-date">
                                    {entry.date} {entry.time && `- ${entry.time}`}
                                  </span>
                                  <span className={`nc-status-badge ${getPriorityBadgeClass(entry.priority)}`}>
                                    {entry.priority.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="nc-timeline-description">{entry.description}</div>
                              <div className="nc-timeline-details">
                                <span className="nc-timeline-nc">NC: {entry.ncNumber}</span>
                                <span className="nc-timeline-project">Project: {entry.project}</span>
                                {entry.supplier && (
                                  <span className="nc-timeline-supplier">Supplier: {entry.supplier}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Table View */}
              {viewMode === 'table' && (
                <div className="nc-history-table-container">
                  <table className="nc-history-table">
                    <thead>
                      <tr>
                        <th>Date/Time</th>
                        <th>Activity</th>
                        <th>NC Number</th>
                        <th>Project</th>
                        <th>Priority</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map(entry => (
                        <tr key={entry.id}>
                          <td className="nc-table-date">
                            {entry.date}
                            {entry.time && <div className="nc-table-time">{entry.time}</div>}
                          </td>
                          <td className="nc-table-activity">
                            <span className="nc-activity-icon">{getTimelineIcon(entry.type)}</span>
                            {entry.type.replace('_', ' ').toUpperCase()}
                          </td>
                          <td className="nc-table-nc">{entry.ncNumber}</td>
                          <td className="nc-table-project">{entry.project}</td>
                          <td>
                            <span className={`nc-status-badge ${getPriorityBadgeClass(entry.priority)}`}>
                              {entry.priority.toUpperCase()}
                            </span>
                          </td>
                          <td className="nc-table-description">
                            {entry.description.length > 100 
                              ? `${entry.description.substring(0, 100)}...`
                              : entry.description
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="nc-empty-state">
              <span className="nc-empty-icon">📅</span>
              <h4>No Activities Found</h4>
              <p>No activities match your current filter criteria. Try adjusting the filters or search term.</p>
              <button
                className="nc-btn nc-btn-ghost"
                onClick={() => {
                  setHistoryFilters({
                    period: 'all',
                    project: 'all',
                    priority: 'all',
                    activityType: 'all',
                    dateFrom: '',
                    dateTo: ''
                  });
                  setLocalSearchTerm('');
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;