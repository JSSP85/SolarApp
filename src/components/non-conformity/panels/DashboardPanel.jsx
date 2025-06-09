// src/components/non-conformity/panels/DashboardPanel.jsx
import React, { useState, useMemo } from 'react';
import { useNonConformity } from '../../../context/NonConformityContext';

const DashboardPanel = () => {
  const { state, helpers } = useNonConformity();
  const { ncList, metrics } = state;
  
  // Local state for dashboard controls
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('count');
  const [refreshInterval, setRefreshInterval] = useState('manual');

  // Calculate comprehensive metrics
  const dashboardMetrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter NCs by period
    const getFilteredNCs = (period) => {
      return ncList.filter(nc => {
        const createdDate = new Date(nc.createdDate.split('/').reverse().join('-'));
        switch (period) {
          case 'week':
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            return createdDate >= weekAgo;
          case 'month':
            return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
          case 'quarter':
            const quarterStart = new Date(currentYear, Math.floor(currentMonth / 3) * 3, 1);
            return createdDate >= quarterStart;
          case 'year':
            return createdDate.getFullYear() === currentYear;
          default:
            return true;
        }
      });
    };

    const periodNCs = getFilteredNCs(selectedPeriod);
    const allActiveNCs = ncList.filter(nc => nc.status !== 'closed' && nc.status !== 'resolved');
    const resolvedNCs = ncList.filter(nc => nc.status === 'resolved' || nc.status === 'closed');
    
    return {
      // Main KPIs
      totalNCs: ncList.length,
      activeNCs: allActiveNCs.length,
      criticalNCs: ncList.filter(nc => nc.priority === 'critical' && nc.status !== 'closed').length,
      majorNCs: ncList.filter(nc => nc.priority === 'major' && nc.status !== 'closed').length,
      minorNCs: ncList.filter(nc => nc.priority === 'minor' && nc.status !== 'closed').length,
      
      // Period-specific metrics
      periodMetrics: {
        created: periodNCs.length,
        resolved: periodNCs.filter(nc => nc.status === 'resolved' || nc.status === 'closed').length,
        critical: periodNCs.filter(nc => nc.priority === 'critical').length,
        overdue: periodNCs.filter(nc => {
          if (!nc.plannedClosureDate) return false;
          const planned = new Date(nc.plannedClosureDate.split('/').reverse().join('-'));
          return now > planned && (nc.status !== 'resolved' && nc.status !== 'closed');
        }).length
      },
      
      // Performance metrics
      avgResolutionTime: resolvedNCs.length > 0 
        ? Math.round(resolvedNCs.reduce((sum, nc) => sum + (nc.daysOpen || 0), 0) / resolvedNCs.length)
        : 0,
      resolutionRate: ncList.length > 0 
        ? Math.round((resolvedNCs.length / ncList.length) * 100)
        : 0,
      
      // Distribution by priority
      priorityDistribution: {
        critical: ncList.filter(nc => nc.priority === 'critical').length,
        major: ncList.filter(nc => nc.priority === 'major').length,
        minor: ncList.filter(nc => nc.priority === 'minor').length
      },
      
      // Distribution by project
      projectDistribution: ncList.reduce((acc, nc) => {
        acc[nc.project] = (acc[nc.project] || 0) + 1;
        return acc;
      }, {}),
      
      // Distribution by supplier
      supplierDistribution: ncList.reduce((acc, nc) => {
        if (nc.supplier) {
          acc[nc.supplier] = (acc[nc.supplier] || 0) + 1;
        }
        return acc;
      }, {}),
      
      // Status distribution
      statusDistribution: {
        open: ncList.filter(nc => nc.status === 'open').length,
        progress: ncList.filter(nc => nc.status === 'progress').length,
        resolved: ncList.filter(nc => nc.status === 'resolved').length,
        closed: ncList.filter(nc => nc.status === 'closed').length
      },
      
      // Trend data (last 6 months)
      trendData: generateTrendData(ncList),
      
      // Alerts
      alerts: generateAlerts(ncList, now)
    };
  }, [ncList, selectedPeriod]);

  // Generate trend data for charts
  function generateTrendData(ncList) {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      const monthNCs = ncList.filter(nc => {
        const createdDate = new Date(nc.createdDate.split('/').reverse().join('-'));
        return createdDate.getMonth() === date.getMonth() && 
               createdDate.getFullYear() === date.getFullYear();
      });
      
      const resolvedNCs = ncList.filter(nc => {
        if (!nc.actualClosureDate) return false;
        const closureDate = new Date(nc.actualClosureDate.split('/').reverse().join('-'));
        return closureDate.getMonth() === date.getMonth() && 
               closureDate.getFullYear() === date.getFullYear();
      });
      
      months.push({
        month: monthName,
        created: monthNCs.length,
        resolved: resolvedNCs.length,
        critical: monthNCs.filter(nc => nc.priority === 'critical').length
      });
    }
    
    return months;
  }

  // Generate alerts and notifications
  function generateAlerts(ncList, now) {
    const alerts = [];
    
    // Overdue NCs
    const overdueNCs = ncList.filter(nc => {
      if (!nc.plannedClosureDate || nc.status === 'resolved' || nc.status === 'closed') return false;
      const planned = new Date(nc.plannedClosureDate.split('/').reverse().join('-'));
      return now > planned;
    });
    
    if (overdueNCs.length > 0) {
      alerts.push({
        type: 'error',
        icon: '⚠️',
        title: `${overdueNCs.length} Overdue NC${overdueNCs.length > 1 ? 's' : ''}`,
        message: `${overdueNCs.length} non-conformities are past their planned closure date`,
        action: 'Review overdue items'
      });
    }
    
    // Critical NCs open for too long
    const longOpenCritical = ncList.filter(nc => 
      nc.priority === 'critical' && 
      (nc.status === 'open' || nc.status === 'progress') &&
      (nc.daysOpen || 0) > 3
    );
    
    if (longOpenCritical.length > 0) {
      alerts.push({
        type: 'warning',
        icon: '🚨',
        title: `${longOpenCritical.length} Critical NC${longOpenCritical.length > 1 ? 's' : ''} Need Attention`,
        message: `Critical non-conformities open for more than 3 days`,
        action: 'Escalate immediately'
      });
    }
    
    // High volume of NCs this month
    const thisMonthNCs = ncList.filter(nc => {
      const createdDate = new Date(nc.createdDate.split('/').reverse().join('-'));
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear();
    });
    
    if (thisMonthNCs.length > 10) {
      alerts.push({
        type: 'info',
        icon: '📊',
        title: 'High NC Volume This Month',
        message: `${thisMonthNCs.length} NCs created this month - above average`,
        action: 'Review trend patterns'
      });
    }
    
    return alerts;
  }

  // Get top performers/issues
  const topProjects = Object.entries(dashboardMetrics.projectDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
    
  const topSuppliers = Object.entries(dashboardMetrics.supplierDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Format percentage
  const formatPercentage = (value, total) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <div className="nc-dashboard-panel">
      <div className="nc-panel-card">
        <div className="nc-panel-header">
          <h3 className="nc-panel-title">
            <span className="nc-panel-icon">📊</span>
            Non-Conformity Management Dashboard
          </h3>
          <div className="nc-dashboard-controls">
            <select
              className="nc-form-select nc-select-small"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
            <button className="nc-btn nc-btn-ghost nc-btn-small">
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Alert Banner */}
        {dashboardMetrics.alerts.length > 0 && (
          <div className="nc-alerts-section">
            {dashboardMetrics.alerts.map((alert, index) => (
              <div key={index} className={`nc-alert nc-alert-${alert.type}`}>
                <span className="nc-alert-icon">{alert.icon}</span>
                <div className="nc-alert-content">
                  <div className="nc-alert-title">{alert.title}</div>
                  <div className="nc-alert-message">{alert.message}</div>
                </div>
                <button className="nc-alert-action">{alert.action}</button>
              </div>
            ))}
          </div>
        )}

        {/* Main KPI Cards */}
        <div className="nc-dashboard-grid">
          <div className="nc-metric-card nc-metric-primary">
            <div className="nc-metric-icon">📋</div>
            <div className="nc-metric-content">
              <div className="nc-metric-number">{dashboardMetrics.totalNCs}</div>
              <div className="nc-metric-label">Total NCs</div>
              <div className="nc-metric-change">
                +{dashboardMetrics.periodMetrics.created} this {selectedPeriod}
              </div>
            </div>
          </div>

          <div className="nc-metric-card nc-metric-warning">
            <div className="nc-metric-icon">🔴</div>
            <div className="nc-metric-content">
              <div className="nc-metric-number">{dashboardMetrics.criticalNCs}</div>
              <div className="nc-metric-label">Critical Active</div>
              <div className="nc-metric-change">
                {dashboardMetrics.periodMetrics.critical} new critical
              </div>
            </div>
          </div>

          <div className="nc-metric-card nc-metric-info">
            <div className="nc-metric-icon">⏱️</div>
            <div className="nc-metric-content">
              <div className="nc-metric-number">{dashboardMetrics.avgResolutionTime}</div>
              <div className="nc-metric-label">Avg Resolution (days)</div>
              <div className="nc-metric-change">
                Target: 10 days
              </div>
            </div>
          </div>

          <div className="nc-metric-card nc-metric-success">
            <div className="nc-metric-icon">✅</div>
            <div className="nc-metric-content">
              <div className="nc-metric-number">{dashboardMetrics.resolutionRate}%</div>
              <div className="nc-metric-label">Resolution Rate</div>
              <div className="nc-metric-change">
                {dashboardMetrics.periodMetrics.resolved} resolved this {selectedPeriod}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="nc-charts-section">
          <div className="nc-chart-card">
            <h4 className="nc-chart-title">📈 Trend Analysis (Last 6 Months)</h4>
            <div className="nc-chart-placeholder">
              <div className="nc-chart-content">
                {dashboardMetrics.trendData.map((month, index) => (
                  <div key={index} className="nc-trend-bar">
                    <div className="nc-trend-month">{month.month}</div>
                    <div className="nc-trend-bars">
                      <div 
                        className="nc-trend-created" 
                        style={{ height: `${Math.max(month.created * 10, 5)}px` }}
                        title={`Created: ${month.created}`}
                      ></div>
                      <div 
                        className="nc-trend-resolved" 
                        style={{ height: `${Math.max(month.resolved * 10, 5)}px` }}
                        title={`Resolved: ${month.resolved}`}
                      ></div>
                    </div>
                    <div className="nc-trend-values">
                      <span className="nc-trend-created-val">↑{month.created}</span>
                      <span className="nc-trend-resolved-val">↓{month.resolved}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="nc-chart-legend">
                <span className="nc-legend-item">
                  <span className="nc-legend-color nc-legend-created"></span>
                  Created
                </span>
                <span className="nc-legend-item">
                  <span className="nc-legend-color nc-legend-resolved"></span>
                  Resolved
                </span>
              </div>
            </div>
          </div>

          <div className="nc-chart-card">
            <h4 className="nc-chart-title">🎯 Priority Distribution</h4>
            <div className="nc-priority-chart">
              <div className="nc-priority-item">
                <div className="nc-priority-bar">
                  <div 
                    className="nc-priority-fill nc-priority-critical-fill"
                    style={{ width: `${formatPercentage(dashboardMetrics.priorityDistribution.critical, dashboardMetrics.totalNCs)}%` }}
                  ></div>
                </div>
                <div className="nc-priority-label">
                  <span className="nc-priority-name">Critical</span>
                  <span className="nc-priority-count">{dashboardMetrics.priorityDistribution.critical}</span>
                </div>
              </div>
              
              <div className="nc-priority-item">
                <div className="nc-priority-bar">
                  <div 
                    className="nc-priority-fill nc-priority-major-fill"
                    style={{ width: `${formatPercentage(dashboardMetrics.priorityDistribution.major, dashboardMetrics.totalNCs)}%` }}
                  ></div>
                </div>
                <div className="nc-priority-label">
                  <span className="nc-priority-name">Major</span>
                  <span className="nc-priority-count">{dashboardMetrics.priorityDistribution.major}</span>
                </div>
              </div>
              
              <div className="nc-priority-item">
                <div className="nc-priority-bar">
                  <div 
                    className="nc-priority-fill nc-priority-minor-fill"
                    style={{ width: `${formatPercentage(dashboardMetrics.priorityDistribution.minor, dashboardMetrics.totalNCs)}%` }}
                  ></div>
                </div>
                <div className="nc-priority-label">
                  <span className="nc-priority-name">Minor</span>
                  <span className="nc-priority-count">{dashboardMetrics.priorityDistribution.minor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Section */}
        <div className="nc-analysis-section">
          <div className="nc-analysis-card">
            <h4 className="nc-analysis-title">🏭 Top Projects by NC Count</h4>
            <div className="nc-ranking-list">
              {topProjects.map(([project, count], index) => (
                <div key={project} className="nc-ranking-item">
                  <span className="nc-ranking-position">#{index + 1}</span>
                  <span className="nc-ranking-name">{project}</span>
                  <span className="nc-ranking-value">{count} NCs</span>
                  <div className="nc-ranking-bar">
                    <div 
                      className="nc-ranking-fill"
                      style={{ width: `${formatPercentage(count, Math.max(...Object.values(dashboardMetrics.projectDistribution)))}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="nc-analysis-card">
            <h4 className="nc-analysis-title">🚛 Top Suppliers by NC Count</h4>
            <div className="nc-ranking-list">
              {topSuppliers.length > 0 ? topSuppliers.map(([supplier, count], index) => (
                <div key={supplier} className="nc-ranking-item">
                  <span className="nc-ranking-position">#{index + 1}</span>
                  <span className="nc-ranking-name">{supplier}</span>
                  <span className="nc-ranking-value">{count} NCs</span>
                  <div className="nc-ranking-bar">
                    <div 
                      className="nc-ranking-fill nc-ranking-supplier"
                      style={{ width: `${formatPercentage(count, Math.max(...Object.values(dashboardMetrics.supplierDistribution)))}%` }}
                    ></div>
                  </div>
                </div>
              )) : (
                <div className="nc-no-data">
                  <span>📊</span>
                  <p>No supplier data available</p>
                </div>
              )}
            </div>
          </div>

          <div className="nc-analysis-card">
            <h4 className="nc-analysis-title">📊 Status Overview</h4>
            <div className="nc-status-overview">
              <div className="nc-status-item">
                <span className="nc-status-dot nc-status-open-dot"></span>
                <span className="nc-status-name">Open</span>
                <span className="nc-status-count">{dashboardMetrics.statusDistribution.open}</span>
              </div>
              <div className="nc-status-item">
                <span className="nc-status-dot nc-status-progress-dot"></span>
                <span className="nc-status-name">In Progress</span>
                <span className="nc-status-count">{dashboardMetrics.statusDistribution.progress}</span>
              </div>
              <div className="nc-status-item">
                <span className="nc-status-dot nc-status-resolved-dot"></span>
                <span className="nc-status-name">Resolved</span>
                <span className="nc-status-count">{dashboardMetrics.statusDistribution.resolved}</span>
              </div>
              <div className="nc-status-item">
                <span className="nc-status-dot nc-status-closed-dot"></span>
                <span className="nc-status-name">Closed</span>
                <span className="nc-status-count">{dashboardMetrics.statusDistribution.closed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="nc-performance-summary">
          <h4 className="nc-summary-title">📈 Performance Summary</h4>
          <div className="nc-performance-grid">
            <div className="nc-performance-item">
              <span className="nc-performance-label">Resolution Rate Target</span>
              <div className="nc-performance-progress">
                <div 
                  className="nc-performance-bar"
                  style={{ width: `${Math.min(dashboardMetrics.resolutionRate, 100)}%` }}
                ></div>
              </div>
              <span className="nc-performance-value">{dashboardMetrics.resolutionRate}% / 90%</span>
            </div>
            
            <div className="nc-performance-item">
              <span className="nc-performance-label">Average Resolution Time</span>
              <div className="nc-performance-progress">
                <div 
                  className={`nc-performance-bar ${dashboardMetrics.avgResolutionTime > 10 ? 'nc-performance-warning' : ''}`}
                  style={{ width: `${Math.min((dashboardMetrics.avgResolutionTime / 15) * 100, 100)}%` }}
                ></div>
              </div>
              <span className="nc-performance-value">{dashboardMetrics.avgResolutionTime} days / 10 days target</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPanel;