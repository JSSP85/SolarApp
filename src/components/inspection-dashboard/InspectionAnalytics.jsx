// src/components/inspection-dashboard/InspectionAnalytics.jsx
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Area
} from 'recharts';
import { TrendingUp, DollarSign, CheckCircle, Users, Package } from 'lucide-react';

const InspectionAnalytics = ({ inspections }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Get available years from inspections
  const availableYears = useMemo(() => {
    const years = [...new Set(inspections.map(insp => {
      const date = new Date(insp.inspectionDate);
      return date.getFullYear();
    }))].sort((a, b) => b - a);
    return years;
  }, [inspections]);

  // ============================================
  // DATA PROCESSING FUNCTIONS
  // ============================================

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = inspections.length;
    
    // Calculate total cost
    const totalCost = inspections.reduce((sum, insp) => {
      const cost = parseFloat(insp.cost?.replace('€', '').replace(',', '.') || 0);
      return sum + cost;
    }, 0);

    // Calculate approval rate
    const positive = inspections.filter(i => {
      const outcome = (i.inspectionOutcome || i.overallOutcome || '').toLowerCase();
      return outcome === 'positive';
    }).length;
    const approvalRate = total > 0 ? (positive / total * 100) : 0;

    // Count active suppliers
    const activeSuppliers = new Set(inspections.map(i => i.supplier).filter(Boolean)).size;

    // Calculate average cost
    const avgCost = total > 0 ? totalCost / total : 0;

    return {
      totalInspections: total,
      totalCost: totalCost,
      approvalRate: approvalRate,
      activeSuppliers: activeSuppliers,
      avgCost: avgCost
    };
  }, [inspections]);

  // Process inspections by month for selected year
  const inspectionsByMonth = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = monthNames.map((month, index) => ({
      month: month,
      inspections: 0,
      cost: 0
    }));

    inspections.forEach(insp => {
      const date = new Date(insp.inspectionDate);
      if (date.getFullYear() === selectedYear) {
        const monthIndex = date.getMonth();
        monthlyData[monthIndex].inspections++;
        
        const cost = parseFloat(insp.cost?.replace('€', '').replace(',', '.') || 0);
        monthlyData[monthIndex].cost += cost;
      }
    });

    return monthlyData;
  }, [inspections, selectedYear]);

  // Process outcomes data
  const outcomesData = useMemo(() => {
    const outcomes = {
      positive: 0,
      negative: 0,
      positiveWithComments: 0
    };

    inspections.forEach(insp => {
      const outcome = (insp.inspectionOutcome || insp.overallOutcome || '').toLowerCase();
      if (outcome === 'positive') {
        outcomes.positive++;
      } else if (outcome === 'negative') {
        outcomes.negative++;
      } else if (outcome.includes('positive with comments')) {
        outcomes.positiveWithComments++;
      }
    });

    return [
      { name: 'Positive', value: outcomes.positive, color: '#10b981' },
      { name: 'Negative', value: outcomes.negative, color: '#ef4444' },
      { name: 'Positive w/ Comments', value: outcomes.positiveWithComments, color: '#f59e0b' }
    ];
  }, [inspections]);

  // Process inspections by supplier for selected year
  const inspectionsBySupplier = useMemo(() => {
    const supplierCounts = {};
    
    inspections.forEach(insp => {
      const date = new Date(insp.inspectionDate);
      if (date.getFullYear() === selectedYear && insp.supplier) {
        supplierCounts[insp.supplier] = (supplierCounts[insp.supplier] || 0) + 1;
      }
    });

    return Object.entries(supplierCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 suppliers
  }, [inspections, selectedYear]);

  // Calculate rejection rate by supplier (FIXED)
  const rejectionBySupplier = useMemo(() => {
    const supplierStats = {};
    
    inspections.forEach(insp => {
      if (!insp.supplier) return;
      
      if (!supplierStats[insp.supplier]) {
        supplierStats[insp.supplier] = { total: 0, rejected: 0 };
      }
      
      supplierStats[insp.supplier].total++;
      
      const outcome = (insp.inspectionOutcome || insp.overallOutcome || '').toLowerCase();
      if (outcome === 'negative') {
        supplierStats[insp.supplier].rejected++;
      }
    });

    return Object.entries(supplierStats)
      .filter(([_, stats]) => stats.total >= 3) // Only suppliers with 3+ inspections
      .map(([name, stats]) => ({
        name,
        rate: (stats.rejected / stats.total) * 100,
        rejected: stats.rejected,
        total: stats.total
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 10); // Top 10 suppliers by rejection rate
  }, [inspections]);

  // ============================================
  // FASE 2: NEW DATA PROCESSING FUNCTIONS
  // ============================================

  // Process inspections by year (totals)
  const inspectionsByYear = useMemo(() => {
    const yearData = {};
    
    inspections.forEach(insp => {
      const date = new Date(insp.inspectionDate);
      const year = date.getFullYear();
      
      if (!yearData[year]) {
        yearData[year] = { year: year.toString(), inspections: 0, cost: 0 };
      }
      
      yearData[year].inspections++;
      const cost = parseFloat(insp.cost?.replace('€', '').replace(',', '.') || 0);
      yearData[year].cost += cost;
    });

    return Object.values(yearData).sort((a, b) => a.year.localeCompare(b.year));
  }, [inspections]);

  // Process inspections by client (FIXED)
  const inspectionsByClient = useMemo(() => {
    const clientCounts = {};
    
    inspections.forEach(insp => {
      // Check if components array exists and has data
      if (insp.components && Array.isArray(insp.components) && insp.components.length > 0) {
        insp.components.forEach(comp => {
          if (comp.client && comp.client.trim() !== '') {
            clientCounts[comp.client] = (clientCounts[comp.client] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(clientCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 clients
  }, [inspections]);

  // Process inspections by project (FIXED)
  const inspectionsByProject = useMemo(() => {
    const projectCounts = {};
    
    inspections.forEach(insp => {
      // Check if components array exists and has data
      if (insp.components && Array.isArray(insp.components) && insp.components.length > 0) {
        insp.components.forEach(comp => {
          if (comp.projectName && comp.projectName.trim() !== '') {
            projectCounts[comp.projectName] = (projectCounts[comp.projectName] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(projectCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 projects
  }, [inspections]);

  // Analyze internal vs external inspections (FIXED)
  const inspectorAnalysis = useMemo(() => {
    let internal = 0;
    let external = 0;
    let internalCost = 0;
    let externalCost = 0;

    inspections.forEach(insp => {
      const cost = parseFloat(insp.cost?.replace('€', '').replace(',', '.') || 0);
      
      // Check inspectorType field - FIXED LOGIC
      if (insp.inspectorType === 'EXTERNO') {
        external++;
        externalCost += cost;
      } else {
        internal++;
        internalCost += cost;
      }
    });

    return {
      distribution: [
        { name: 'Internal', value: internal, color: '#005f83' },
        { name: 'External', value: external, color: '#f59e0b' }
      ],
      costs: {
        internal: internal > 0 ? internalCost / internal : 0,
        external: external > 0 ? externalCost / external : 0
      }
    };
  }, [inspections]);

  // ============================================
  // FASE 3: ADVANCED DATA PROCESSING FUNCTIONS
  // ============================================

  // Process most inspected components (FIXED)
  const topComponents = useMemo(() => {
    const componentCounts = {};
    
    inspections.forEach(insp => {
      if (insp.components && Array.isArray(insp.components) && insp.components.length > 0) {
        insp.components.forEach(comp => {
          if (comp.componentCode && comp.componentCode.trim() !== '') {
            const key = comp.componentDescription 
              ? `${comp.componentCode} - ${comp.componentDescription}`
              : comp.componentCode;
            componentCounts[key] = (componentCounts[key] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(componentCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 components
  }, [inspections]);

  // Process inspections by quarter
  const inspectionsByQuarter = useMemo(() => {
    const quarterData = {};
    
    inspections.forEach(insp => {
      const date = new Date(insp.inspectionDate);
      const year = date.getFullYear();
      const month = date.getMonth();
      const quarter = Math.floor(month / 3) + 1;
      const key = `${year} Q${quarter}`;
      
      if (!quarterData[key]) {
        quarterData[key] = { quarter: key, inspections: 0 };
      }
      
      quarterData[key].inspections++;
    });

    return Object.values(quarterData).sort((a, b) => a.quarter.localeCompare(b.quarter));
  }, [inspections]);

  // Calculate quality trend over time (approval rate by month)
  const qualityTrend = useMemo(() => {
    const monthlyQuality = {};
    
    inspections.forEach(insp => {
      const date = new Date(insp.inspectionDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyQuality[key]) {
        monthlyQuality[key] = { total: 0, positive: 0 };
      }
      
      monthlyQuality[key].total++;
      
      const outcome = (insp.inspectionOutcome || insp.overallOutcome || '').toLowerCase();
      if (outcome === 'positive') {
        monthlyQuality[key].positive++;
      }
    });

    return Object.entries(monthlyQuality)
      .map(([key, stats]) => ({
        month: key,
        rate: (stats.positive / stats.total) * 100
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  }, [inspections]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="id-analytics-container">
      {/* KPI Cards */}
      <div className="id-kpi-grid">
        <div className="id-kpi-card">
          <div className="id-kpi-icon" style={{ backgroundColor: '#dbeafe' }}>
            <Package size={24} color="#005f83" />
          </div>
          <div className="id-kpi-content">
            <div className="id-kpi-label">Total Inspections</div>
            <div className="id-kpi-value">{kpis.totalInspections}</div>
          </div>
        </div>

        <div className="id-kpi-card">
          <div className="id-kpi-icon" style={{ backgroundColor: '#fef3c7' }}>
            <DollarSign size={24} color="#f59e0b" />
          </div>
          <div className="id-kpi-content">
            <div className="id-kpi-label">Total Cost</div>
            <div className="id-kpi-value">€{kpis.totalCost.toFixed(2)}</div>
          </div>
        </div>

        <div className="id-kpi-card">
          <div className="id-kpi-icon" style={{ backgroundColor: '#d1fae5' }}>
            <CheckCircle size={24} color="#10b981" />
          </div>
          <div className="id-kpi-content">
            <div className="id-kpi-label">Approval Rate</div>
            <div className="id-kpi-value">{kpis.approvalRate.toFixed(1)}%</div>
          </div>
        </div>

        <div className="id-kpi-card">
          <div className="id-kpi-icon" style={{ backgroundColor: '#e0e7ff' }}>
            <Users size={24} color="#6366f1" />
          </div>
          <div className="id-kpi-content">
            <div className="id-kpi-label">Active Suppliers</div>
            <div className="id-kpi-value">{kpis.activeSuppliers}</div>
          </div>
        </div>

        <div className="id-kpi-card">
          <div className="id-kpi-icon" style={{ backgroundColor: '#fce7f3' }}>
            <TrendingUp size={24} color="#ec4899" />
          </div>
          <div className="id-kpi-content">
            <div className="id-kpi-label">Avg Cost</div>
            <div className="id-kpi-value">€{kpis.avgCost.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Year Selector */}
      <div className="id-year-selector">
        <span className="id-year-label">Select Year:</span>
        <div className="id-year-buttons">
          {availableYears.map(year => (
            <button
              key={year}
              className={`id-year-btn ${selectedYear === year ? 'active' : ''}`}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* FASE 1: Core Charts */}
      <div className="id-charts-grid">
        {/* Chart 1: Inspections by Month - CHANGED TO BAR CHART */}
        <div className="id-chart-card">
          <h3 className="id-chart-title">Inspections by Month ({selectedYear})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inspectionsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="inspections" 
                fill="#005f83" 
                name="Inspections"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Costs by Month - CHANGED TO BAR CHART */}
        <div className="id-chart-card">
          <h3 className="id-chart-title">Costs by Month ({selectedYear})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inspectionsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value) => `€${value.toFixed(2)}`}
              />
              <Legend />
              <Bar 
                dataKey="cost" 
                fill="#f59e0b" 
                name="Cost (€)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Outcomes Pie Chart */}
        <div className="id-chart-card">
          <h3 className="id-chart-title">Inspection Outcomes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={outcomesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {outcomesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 4: Inspections by Supplier */}
        <div className="id-chart-card">
          <h3 className="id-chart-title">Inspections by Supplier ({selectedYear})</h3>
          {inspectionsBySupplier.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inspectionsBySupplier} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  stroke="#6b7280"
                  style={{ fontSize: '0.85rem' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="count" fill="#005f83" name="Inspections" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '300px',
              color: '#6b7280'
            }}>
              No data available for {selectedYear}
            </div>
          )}
        </div>

        {/* Chart 5: Rejection Rate by Supplier */}
        <div className="id-chart-card id-chart-card-wide">
          <h3 className="id-chart-title">Rejection Rate by Supplier (Min. 3 inspections)</h3>
          {rejectionBySupplier.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rejectionBySupplier}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#6b7280" label={{ value: 'Rejection Rate (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name, props) => [
                    `${value.toFixed(1)}% (${props.payload.rejected}/${props.payload.total})`,
                    'Rejection Rate'
                  ]}
                />
                <Bar dataKey="rate" fill="#ef4444" name="Rejection Rate (%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '300px',
              color: '#6b7280'
            }}>
              No suppliers with 3+ inspections found
            </div>
          )}
        </div>
      </div>

      {/* FASE 2: Detailed Analysis Charts */}
      <div className="id-section-divider">
        <h2 className="id-section-title">📊 Detailed Analysis</h2>
      </div>

      <div className="id-charts-grid">
        {/* Chart 6: Inspections by Year */}
        <div className="id-chart-card">
          <h3 className="id-chart-title">Total Inspections by Year</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inspectionsByYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="inspections" fill="#005f83" name="Inspections" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 7: Costs by Year */}
        <div className="id-chart-card">
          <h3 className="id-chart-title">Total Costs by Year</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inspectionsByYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value) => `€${value.toFixed(2)}`}
              />
              <Bar dataKey="cost" fill="#f59e0b" name="Cost (€)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 8: Inspections by Client */}
        <div className="id-chart-card">
          <h3 className="id-chart-title">Top 10 Clients by Inspections</h3>
          {inspectionsByClient.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inspectionsByClient} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  stroke="#6b7280"
                  style={{ fontSize: '0.85rem' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="count" fill="#6366f1" name="Inspections" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '300px',
              color: '#6b7280'
            }}>
              No client data available
            </div>
          )}
        </div>

        {/* Chart 9: Inspections by Project */}
        <div className="id-chart-card">
          <h3 className="id-chart-title">Top 10 Projects by Inspections</h3>
          {inspectionsByProject.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inspectionsByProject} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  stroke="#6b7280"
                  style={{ fontSize: '0.85rem' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="count" fill="#8b5cf6" name="Inspections" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '300px',
              color: '#6b7280'
            }}>
              No project data available
            </div>
          )}
        </div>

        {/* Chart 10: Internal vs External Distribution */}
        <div className="id-chart-card">
          <h3 className="id-chart-title">Inspector Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={inspectorAnalysis.distribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {inspectorAnalysis.distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 11: Average Cost Comparison */}
        <div className="id-chart-card">
          <h3 className="id-chart-title">Average Cost: Internal vs External</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={[
                { name: 'Internal', cost: inspectorAnalysis.costs.internal },
                { name: 'External', cost: inspectorAnalysis.costs.external }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value) => `€${value.toFixed(2)}`}
              />
              <Bar dataKey="cost" fill="#ec4899" name="Avg Cost (€)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FASE 3: Advanced Insights */}
      <div className="id-section-divider">
        <h2 className="id-section-title">🔍 Advanced Insights</h2>
      </div>

      <div className="id-charts-grid">
        {/* Chart 12: Top Components */}
        <div className="id-chart-card id-chart-card-wide">
          <h3 className="id-chart-title">Top 10 Most Inspected Components</h3>
          {topComponents.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topComponents} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={200} 
                  stroke="#6b7280"
                  style={{ fontSize: '0.75rem' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="count" fill="#14b8a6" name="Inspections" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '300px',
              color: '#6b7280'
            }}>
              No component data available
            </div>
          )}
        </div>

        {/* Chart 13: Inspections by Quarter */}
        <div className="id-chart-card">
          <h3 className="id-chart-title">Inspections by Quarter</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inspectionsByQuarter}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="quarter" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="inspections" fill="#f97316" name="Inspections" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 14: Quality Trend */}
        <div className="id-chart-card">
          <h3 className="id-chart-title">Quality Trend (Last 12 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={qualityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#6b7280" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value) => `${value.toFixed(1)}%`}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="rate" 
                fill="#10b981" 
                stroke="#10b981"
                fillOpacity={0.3}
                name="Approval Rate (%)"
              />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#059669" 
                strokeWidth={2}
                dot={{ fill: '#059669', r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default InspectionAnalytics;