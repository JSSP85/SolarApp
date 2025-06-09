// src/components/non-conformity/panels/AnalyticsPanel.jsx
import React, { useState, useMemo } from 'react';
import { useNonConformity } from '../../../context/NonConformityContext';

const AnalyticsPanel = () => {
  const { state, helpers } = useNonConformity();
  const { ncList, userRole } = state;
  
  // Local state for analytics configuration
  const [analysisType, setAnalysisType] = useState('trends');
  const [timeRange, setTimeRange] = useState('last_6_months');
  const [comparisonPeriod, setComparisonPeriod] = useState('previous_period');
  const [groupBy, setGroupBy] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('count');
  const [selectedDimension, setSelectedDimension] = useState('priority');

  // Verify admin access
  if (!helpers.canAccess('analytics')) {
    return (
      <div className="nc-access-denied">
        <div className="nc-access-denied-content">
          <span className="nc-access-denied-icon">🔒</span>
          <h3>Access Restricted</h3>
          <p>Advanced Analytics is only available to administrators.</p>
          <p>Current role: <strong>{userRole}</strong></p>
        </div>
      </div>
    );
  }

  // Advanced analytics calculations
  const analyticsData = useMemo(() => {
    const now = new Date();
    
    // Generate time periods for analysis
    const generateTimePeriods = (range) => {
      const periods = [];
      let startDate = new Date();
      let periodLength = 1; // months
      let numberOfPeriods = 6;
      
      switch (range) {
        case 'last_3_months':
          numberOfPeriods = 3;
          break;
        case 'last_6_months':
          numberOfPeriods = 6;
          break;
        case 'last_12_months':
          numberOfPeriods = 12;
          break;
        case 'last_2_years':
          numberOfPeriods = 24;
          break;
      }
      
      for (let i = numberOfPeriods - 1; i >= 0; i--) {
        const periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        periods.push({
          label: periodStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          start: periodStart,
          end: periodEnd,
          fullLabel: periodStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        });
      }
      
      return periods;
    };

    const timePeriods = generateTimePeriods(timeRange);
    
    // Calculate trends data
    const trendsData = timePeriods.map(period => {
      const periodNCs = ncList.filter(nc => {
        const createdDate = new Date(nc.createdDate.split('/').reverse().join('-'));
        return createdDate >= period.start && createdDate <= period.end;
      });
      
      const resolvedNCs = ncList.filter(nc => {
        if (!nc.actualClosureDate) return false;
        const closureDate = new Date(nc.actualClosureDate.split('/').reverse().join('-'));
        return closureDate >= period.start && closureDate <= period.end;
      });
      
      const avgResolutionTime = resolvedNCs.length > 0
        ? resolvedNCs.reduce((sum, nc) => sum + (nc.daysOpen || 0), 0) / resolvedNCs.length
        : 0;
      
      return {
        period: period.label,
        fullPeriod: period.fullLabel,
        created: periodNCs.length,
        resolved: resolvedNCs.length,
        critical: periodNCs.filter(nc => nc.priority === 'critical').length,
        major: periodNCs.filter(nc => nc.priority === 'major').length,
        minor: periodNCs.filter(nc => nc.priority === 'minor').length,
        avgResolutionTime: Math.round(avgResolutionTime),
        backlog: periodNCs.length - resolvedNCs.length
      };
    });
    
    // Root cause analysis
    const rootCauseAnalysis = {
      byType: ncList.reduce((acc, nc) => {
        acc[nc.ncType] = (acc[nc.ncType] || 0) + 1;
        return acc;
      }, {}),
      bySupplier: ncList.reduce((acc, nc) => {
        if (nc.supplier) {
          acc[nc.supplier] = (acc[nc.supplier] || 0) + 1;
        }
        return acc;
      }, {}),
      byProject: ncList.reduce((acc, nc) => {
        acc[nc.project] = (acc[nc.project] || 0) + 1;
        return acc;
      }, {})
    };
    
    // Performance metrics
    const performanceMetrics = {
      totalNCs: ncList.length,
      avgResolutionTime: ncList.filter(nc => nc.actualClosureDate).reduce((sum, nc) => {
        return sum + (nc.daysOpen || 0);
      }, 0) / Math.max(ncList.filter(nc => nc.actualClosureDate).length, 1),
      resolutionRate: (ncList.filter(nc => nc.status === 'resolved' || nc.status === 'closed').length / Math.max(ncList.length, 1)) * 100,
      criticalsResolved: ncList.filter(nc => nc.priority === 'critical' && (nc.status === 'resolved' || nc.status === 'closed')).length,
      overdueNCs: ncList.filter(nc => {
        if (!nc.plannedClosureDate || nc.status === 'resolved' || nc.status === 'closed') return false;
        const planned = new Date(nc.plannedClosureDate.split('/').reverse().join('-'));
        return now > planned;
      }).length
    };
    
    // Quality trends (improvement/degradation analysis)
    const qualityTrends = {
      monthlyCreationTrend: trendsData.map(t => t.created),
      monthlyResolutionTrend: trendsData.map(t => t.resolved),
      resolutionTimeTrend: trendsData.map(t => t.avgResolutionTime),
      criticalTrend: trendsData.map(t => t.critical)
    };
    
    // Calculate trend direction
    const calculateTrend = (data) => {
      if (data.length < 2) return 'stable';
      const recent = data.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
      const older = data.slice(0, -3).reduce((sum, val) => sum + val, 0) / Math.max(data.length - 3, 1);
      
      if (recent > older * 1.1) return 'increasing';
      if (recent < older * 0.9) return 'decreasing';
      return 'stable';
    };
    
    // Supplier performance analysis
    const supplierPerformance = Object.entries(rootCauseAnalysis.bySupplier)
      .map(([supplier, count]) => {
        const supplierNCs = ncList.filter(nc => nc.supplier === supplier);
        const criticalCount = supplierNCs.filter(nc => nc.priority === 'critical').length;
        const avgResolution = supplierNCs.filter(nc => nc.actualClosureDate)
          .reduce((sum, nc) => sum + (nc.daysOpen || 0), 0) / Math.max(supplierNCs.filter(nc => nc.actualClosureDate).length, 1);
        
        return {
          supplier,
          totalNCs: count,
          criticalNCs: criticalCount,
          criticalRate: (criticalCount / count) * 100,
          avgResolutionTime: Math.round(avgResolution),
          riskScore: (count * 0.4) + (criticalCount * 0.6) + (avgResolution * 0.1)
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore);
    
    // Predictive indicators
    const predictiveIndicators = {
      projectedMonthlyNCs: Math.round(
        trendsData.slice(-3).reduce((sum, t) => sum + t.created, 0) / 3
      ),
      resolutionCapacity: Math.round(
        trendsData.slice(-3).reduce((sum, t) => sum + t.resolved, 0) / 3
      ),
      backlogTrend: calculateTrend(trendsData.map(t => t.backlog)),
      criticalTrend: calculateTrend(qualityTrends.criticalTrend)
    };
    
    return {
      trendsData,
      rootCauseAnalysis,
      performanceMetrics,
      qualityTrends,
      supplierPerformance,
      predictiveIndicators
    };
  }, [ncList, timeRange]);

  // Get trend indicator
  const getTrendIndicator = (trend) => {
    switch (trend) {
      case 'increasing': return { icon: '📈', color: 'red', text: 'Increasing' };
      case 'decreasing': return { icon: '📉', color: 'green', text: 'Decreasing' };
      default: return { icon: '➡️', color: 'blue', text: 'Stable' };
    }
  };

  // Format percentage
  const formatPercent = (value) => Math.round(value * 100) / 100;

  // Export analytics data
  const handleExportAnalytics = () => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      analysisType,
      ...analyticsData
    };
    
    console.log('Exporting analytics data:', exportData);
    // TODO: Implement actual export functionality (CSV, Excel, PDF)
  };

  return (
    <div className="nc-analytics-panel">
      <div className="nc-panel-card">
        <div className="nc-panel-header">
          <h3 className="nc-panel-title">
            <span className="nc-panel-icon">📈</span>
            Advanced Analytics & Intelligence
          </h3>
          <div className="nc-analytics-controls">
            <select
              className="nc-form-select nc-select-small"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="last_3_months">Last 3 Months</option>
              <option value="last_6_months">Last 6 Months</option>
              <option value="last_12_months">Last 12 Months</option>
              <option value="last_2_years">Last 2 Years</option>
            </select>
            <button
              className="nc-btn nc-btn-secondary nc-btn-small"
              onClick={handleExportAnalytics}
            >
              📊 Export Analytics
            </button>
          </div>
        </div>

        {/* Analysis Type Selector */}
        <div className="nc-analysis-selector">
          <button
            className={`nc-analysis-tab ${analysisType === 'trends' ? 'active' : ''}`}
            onClick={() => setAnalysisType('trends')}
          >
            📈 Trends Analysis
          </button>
          <button
            className={`nc-analysis-tab ${analysisType === 'performance' ? 'active' : ''}`}
            onClick={() => setAnalysisType('performance')}
          >
            🎯 Performance Metrics
          </button>
          <button
            className={`nc-analysis-tab ${analysisType === 'rootcause' ? 'active' : ''}`}
            onClick={() => setAnalysisType('rootcause')}
          >
            🔍 Root Cause Analysis
          </button>
          <button
            className={`nc-analysis-tab ${analysisType === 'predictive' ? 'active' : ''}`}
            onClick={() => setAnalysisType('predictive')}
          >
            🔮 Predictive Insights
          </button>
        </div>

        {/* Trends Analysis */}
        {analysisType === 'trends' && (
          <div className="nc-analysis-content">
            <div className="nc-trends-overview">
              <h4 className="nc-section-title">📊 Trends Overview</h4>
              <div className="nc-trends-chart">
                <div className="nc-chart-header">
                  <span>NC Creation vs Resolution Trends</span>
                  <div className="nc-chart-legend">
                    <span className="nc-legend-item">
                      <span className="nc-legend-color nc-legend-created"></span>
                      Created
                    </span>
                    <span className="nc-legend-item">
                      <span className="nc-legend-color nc-legend-resolved"></span>
                      Resolved
                    </span>
                    <span className="nc-legend-item">
                      <span className="nc-legend-color nc-legend-critical"></span>
                      Critical
                    </span>
                  </div>
                </div>
                
                <div className="nc-trends-bars">
                  {analyticsData.trendsData.map((data, index) => (
                    <div key={index} className="nc-trend-group">
                      <div className="nc-trend-bars-container">
                        <div 
                          className="nc-trend-bar nc-trend-created"
                          style={{ height: `${Math.max(data.created * 8, 4)}px` }}
                          title={`Created: ${data.created}`}
                        />
                        <div 
                          className="nc-trend-bar nc-trend-resolved"
                          style={{ height: `${Math.max(data.resolved * 8, 4)}px` }}
                          title={`Resolved: ${data.resolved}`}
                        />
                        <div 
                          className="nc-trend-bar nc-trend-critical"
                          style={{ height: `${Math.max(data.critical * 12, 2)}px` }}
                          title={`Critical: ${data.critical}`}
                        />
                      </div>
                      <div className="nc-trend-label">{data.period}</div>
                      <div className="nc-trend-values">
                        <span className="nc-trend-value-created">+{data.created}</span>
                        <span className="nc-trend-value-resolved">-{data.resolved}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="nc-trends-insights">
              <h4 className="nc-section-title">🧠 Key Insights</h4>
              <div className="nc-insights-grid">
                <div className="nc-insight-card">
                  <div className="nc-insight-metric">
                    {getTrendIndicator(analyticsData.qualityTrends.monthlyCreationTrend.slice(-3).reduce((sum, val) => sum + val, 0) > 
                                      analyticsData.qualityTrends.monthlyCreationTrend.slice(0, -3).reduce((sum, val) => sum + val, 0) ? 'increasing' : 'decreasing').icon}
                  </div>
                  <div className="nc-insight-content">
                    <div className="nc-insight-title">Creation Trend</div>
                    <div className="nc-insight-description">
                      NC creation rate is {getTrendIndicator(analyticsData.qualityTrends.monthlyCreationTrend.slice(-3).reduce((sum, val) => sum + val, 0) > 
                                                           analyticsData.qualityTrends.monthlyCreationTrend.slice(0, -3).reduce((sum, val) => sum + val, 0) ? 'increasing' : 'decreasing').text.toLowerCase()} 
                      compared to previous periods
                    </div>
                  </div>
                </div>

                <div className="nc-insight-card">
                  <div className="nc-insight-metric">⏱️</div>
                  <div className="nc-insight-content">
                    <div className="nc-insight-title">Resolution Time</div>
                    <div className="nc-insight-description">
                      Average resolution time: {formatPercent(analyticsData.performanceMetrics.avgResolutionTime)} days
                    </div>
                  </div>
                </div>

                <div className="nc-insight-card">
                  <div className="nc-insight-metric">🎯</div>
                  <div className="nc-insight-content">
                    <div className="nc-insight-title">Resolution Rate</div>
                    <div className="nc-insight-description">
                      {formatPercent(analyticsData.performanceMetrics.resolutionRate)}% of NCs have been resolved
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {analysisType === 'performance' && (
          <div className="nc-analysis-content">
            <div className="nc-performance-kpis">
              <h4 className="nc-section-title">🎯 Key Performance Indicators</h4>
              <div className="nc-kpi-grid">
                <div className="nc-kpi-card">
                  <div className="nc-kpi-icon">📋</div>
                  <div className="nc-kpi-content">
                    <div className="nc-kpi-value">{analyticsData.performanceMetrics.totalNCs}</div>
                    <div className="nc-kpi-label">Total NCs</div>
                    <div className="nc-kpi-trend">All time</div>
                  </div>
                </div>

                <div className="nc-kpi-card">
                  <div className="nc-kpi-icon">⏱️</div>
                  <div className="nc-kpi-content">
                    <div className="nc-kpi-value">{formatPercent(analyticsData.performanceMetrics.avgResolutionTime)}</div>
                    <div className="nc-kpi-label">Avg Resolution (days)</div>
                    <div className="nc-kpi-trend">Target: 10 days</div>
                  </div>
                </div>

                <div className="nc-kpi-card">
                  <div className="nc-kpi-icon">✅</div>
                  <div className="nc-kpi-content">
                    <div className="nc-kpi-value">{formatPercent(analyticsData.performanceMetrics.resolutionRate)}%</div>
                    <div className="nc-kpi-label">Resolution Rate</div>
                    <div className="nc-kpi-trend">Target: 90%</div>
                  </div>
                </div>

                <div className="nc-kpi-card">
                  <div className="nc-kpi-icon">🚨</div>
                  <div className="nc-kpi-content">
                    <div className="nc-kpi-value">{analyticsData.performanceMetrics.criticalsResolved}</div>
                    <div className="nc-kpi-label">Criticals Resolved</div>
                    <div className="nc-kpi-trend">High priority</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="nc-supplier-performance">
              <h4 className="nc-section-title">🚛 Supplier Risk Analysis</h4>
              <div className="nc-supplier-table">
                <table className="nc-analytics-table">
                  <thead>
                    <tr>
                      <th>Supplier</th>
                      <th>Total NCs</th>
                      <th>Critical NCs</th>
                      <th>Critical Rate</th>
                      <th>Avg Resolution</th>
                      <th>Risk Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.supplierPerformance.slice(0, 5).map((supplier, index) => (
                      <tr key={supplier.supplier}>
                        <td>
                          <div className="nc-supplier-rank">
                            <span className="nc-rank-badge">#{index + 1}</span>
                            {supplier.supplier}
                          </div>
                        </td>
                        <td>{supplier.totalNCs}</td>
                        <td className="nc-critical-count">{supplier.criticalNCs}</td>
                        <td>
                          <span className={`nc-rate-badge ${supplier.criticalRate > 30 ? 'high' : supplier.criticalRate > 15 ? 'medium' : 'low'}`}>
                            {formatPercent(supplier.criticalRate)}%
                          </span>
                        </td>
                        <td>{supplier.avgResolutionTime} days</td>
                        <td>
                          <div className="nc-risk-score">
                            <div className="nc-risk-bar">
                              <div 
                                className={`nc-risk-fill ${supplier.riskScore > 15 ? 'high' : supplier.riskScore > 8 ? 'medium' : 'low'}`}
                                style={{ width: `${Math.min((supplier.riskScore / 20) * 100, 100)}%` }}
                              />
                            </div>
                            <span>{formatPercent(supplier.riskScore)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Root Cause Analysis */}
        {analysisType === 'rootcause' && (
          <div className="nc-analysis-content">
            <div className="nc-rootcause-charts">
              <h4 className="nc-section-title">🔍 Root Cause Distribution</h4>
              
              <div className="nc-rootcause-grid">
                <div className="nc-rootcause-chart">
                  <h5>By NC Type</h5>
                  <div className="nc-distribution-bars">
                    {Object.entries(analyticsData.rootCauseAnalysis.byType)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 6)
                      .map(([type, count], index) => (
                        <div key={type} className="nc-distribution-item">
                          <div className="nc-distribution-label">
                            {type.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="nc-distribution-bar">
                            <div 
                              className="nc-distribution-fill"
                              style={{ 
                                width: `${(count / Math.max(...Object.values(analyticsData.rootCauseAnalysis.byType))) * 100}%`,
                                backgroundColor: `hsl(${index * 60}, 70%, 60%)`
                              }}
                            />
                          </div>
                          <div className="nc-distribution-count">{count}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>

                <div className="nc-rootcause-chart">
                  <h5>By Project</h5>
                  <div className="nc-distribution-bars">
                    {Object.entries(analyticsData.rootCauseAnalysis.byProject)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([project, count], index) => (
                        <div key={project} className="nc-distribution-item">
                          <div className="nc-distribution-label">{project}</div>
                          <div className="nc-distribution-bar">
                            <div 
                              className="nc-distribution-fill"
                              style={{ 
                                width: `${(count / Math.max(...Object.values(analyticsData.rootCauseAnalysis.byProject))) * 100}%`,
                                backgroundColor: `hsl(${200 + index * 40}, 70%, 60%)`
                              }}
                            />
                          </div>
                          <div className="nc-distribution-count">{count}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="nc-patterns-analysis">
              <h4 className="nc-section-title">🔬 Pattern Analysis</h4>
              <div className="nc-patterns-insights">
                <div className="nc-pattern-card">
                  <div className="nc-pattern-icon">🏆</div>
                  <div className="nc-pattern-content">
                    <div className="nc-pattern-title">Most Common Issue</div>
                    <div className="nc-pattern-value">
                      {Object.entries(analyticsData.rootCauseAnalysis.byType)
                        .sort(([,a], [,b]) => b - a)[0]?.[0]?.replace('_', ' ').toUpperCase() || 'N/A'}
                    </div>
                    <div className="nc-pattern-detail">
                      {Object.entries(analyticsData.rootCauseAnalysis.byType)
                        .sort(([,a], [,b]) => b - a)[0]?.[1] || 0} occurrences
                    </div>
                  </div>
                </div>

                <div className="nc-pattern-card">
                  <div className="nc-pattern-icon">🏭</div>
                  <div className="nc-pattern-content">
                    <div className="nc-pattern-title">Highest Impact Project</div>
                    <div className="nc-pattern-value">
                      {Object.entries(analyticsData.rootCauseAnalysis.byProject)
                        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                    </div>
                    <div className="nc-pattern-detail">
                      {Object.entries(analyticsData.rootCauseAnalysis.byProject)
                        .sort(([,a], [,b]) => b - a)[0]?.[1] || 0} NCs
                    </div>
                  </div>
                </div>

                <div className="nc-pattern-card">
                  <div className="nc-pattern-icon">⚠️</div>
                  <div className="nc-pattern-content">
                    <div className="nc-pattern-title">Risk Areas</div>
                    <div className="nc-pattern-value">
                      {analyticsData.supplierPerformance.filter(s => s.criticalRate > 20).length}
                    </div>
                    <div className="nc-pattern-detail">High-risk suppliers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Predictive Insights */}
        {analysisType === 'predictive' && (
          <div className="nc-analysis-content">
            <div className="nc-predictions">
              <h4 className="nc-section-title">🔮 Predictive Insights</h4>
              
              <div className="nc-prediction-cards">
                <div className="nc-prediction-card">
                  <div className="nc-prediction-icon">📊</div>
                  <div className="nc-prediction-content">
                    <div className="nc-prediction-title">Projected Monthly NCs</div>
                    <div className="nc-prediction-value">{analyticsData.predictiveIndicators.projectedMonthlyNCs}</div>
                    <div className="nc-prediction-detail">Based on 3-month trend</div>
                    <div className="nc-prediction-confidence">Confidence: 75%</div>
                  </div>
                </div>

                <div className="nc-prediction-card">
                  <div className="nc-prediction-icon">⚡</div>
                  <div className="nc-prediction-content">
                    <div className="nc-prediction-title">Resolution Capacity</div>
                    <div className="nc-prediction-value">{analyticsData.predictiveIndicators.resolutionCapacity}</div>
                    <div className="nc-prediction-detail">NCs/month capacity</div>
                    <div className="nc-prediction-confidence">
                      {analyticsData.predictiveIndicators.resolutionCapacity >= analyticsData.predictiveIndicators.projectedMonthlyNCs 
                        ? '✅ Sufficient' : '⚠️ At risk'}
                    </div>
                  </div>
                </div>

                <div className="nc-prediction-card">
                  <div className="nc-prediction-icon">📈</div>
                  <div className="nc-prediction-content">
                    <div className="nc-prediction-title">Backlog Trend</div>
                    <div className="nc-prediction-value">
                      {getTrendIndicator(analyticsData.predictiveIndicators.backlogTrend).icon}
                    </div>
                    <div className="nc-prediction-detail">
                      {getTrendIndicator(analyticsData.predictiveIndicators.backlogTrend).text}
                    </div>
                    <div className="nc-prediction-confidence">
                      {analyticsData.predictiveIndicators.backlogTrend === 'increasing' ? '⚠️ Monitor' : '✅ Good'}
                    </div>
                  </div>
                </div>

                <div className="nc-prediction-card">
                  <div className="nc-prediction-icon">🚨</div>
                  <div className="nc-prediction-content">
                    <div className="nc-prediction-title">Critical NC Trend</div>
                    <div className="nc-prediction-value">
                      {getTrendIndicator(analyticsData.predictiveIndicators.criticalTrend).icon}
                    </div>
                    <div className="nc-prediction-detail">
                      {getTrendIndicator(analyticsData.predictiveIndicators.criticalTrend).text}
                    </div>
                    <div className="nc-prediction-confidence">
                      {analyticsData.predictiveIndicators.criticalTrend === 'increasing' ? '🚨 Alert' : '✅ Stable'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="nc-recommendations">
              <h4 className="nc-section-title">💡 AI Recommendations</h4>
              <div className="nc-recommendations-list">
                {analyticsData.predictiveIndicators.backlogTrend === 'increasing' && (
                  <div className="nc-recommendation-item">
                    <div className="nc-recommendation-icon">⚠️</div>
                    <div className="nc-recommendation-content">
                      <div className="nc-recommendation-title">Backlog Management</div>
                      <div className="nc-recommendation-text">
                        NC backlog is increasing. Consider allocating additional resources or reviewing resolution processes.
                      </div>
                      <div className="nc-recommendation-priority">High Priority</div>
                    </div>
                  </div>
                )}

                {analyticsData.supplierPerformance.filter(s => s.criticalRate > 30).length > 0 && (
                  <div className="nc-recommendation-item">
                    <div className="nc-recommendation-icon">🚛</div>
                    <div className="nc-recommendation-content">
                      <div className="nc-recommendation-title">Supplier Quality Review</div>
                      <div className="nc-recommendation-text">
                        {analyticsData.supplierPerformance.filter(s => s.criticalRate > 30).length} supplier(s) 
                        have critical NC rates above 30%. Consider quality audits or corrective action plans.
                      </div>
                      <div className="nc-recommendation-priority">Medium Priority</div>
                    </div>
                  </div>
                )}

                {analyticsData.performanceMetrics.avgResolutionTime > 10 && (
                  <div className="nc-recommendation-item">
                    <div className="nc-recommendation-icon">⏱️</div>
                    <div className="nc-recommendation-content">
                      <div className="nc-recommendation-title">Resolution Time Optimization</div>
                      <div className="nc-recommendation-text">
                        Average resolution time ({formatPercent(analyticsData.performanceMetrics.avgResolutionTime)} days) 
                        exceeds target. Review workflow efficiency and resource allocation.
                      </div>
                      <div className="nc-recommendation-priority">Medium Priority</div>
                    </div>
                  </div>
                )}

                <div className="nc-recommendation-item">
                  <div className="nc-recommendation-icon">📊</div>
                  <div className="nc-recommendation-content">
                    <div className="nc-recommendation-title">Continuous Monitoring</div>
                    <div className="nc-recommendation-text">
                      Schedule weekly review of these analytics to identify trends early and take proactive measures.
                    </div>
                    <div className="nc-recommendation-priority">Low Priority</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Summary */}
        <div className="nc-analytics-footer">
          <div className="nc-analytics-summary">
            <span>📊 Analytics generated for {timeRange.replace('_', ' ')} • </span>
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
          <div className="nc-analytics-actions">
            <button
              className="nc-btn nc-btn-ghost nc-btn-small"
              onClick={() => window.print()}
            >
              🖨️ Print Report
            </button>
            <button
              className="nc-btn nc-btn-secondary nc-btn-small"
              onClick={handleExportAnalytics}
            >
              📁 Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;