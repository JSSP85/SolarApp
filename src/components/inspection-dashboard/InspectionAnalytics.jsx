// src/components/inspection-dashboard/InspectionAnalytics.jsx
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
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
    const positive = inspections.filter(i => 
      i.inspectionOutcome === 'positive' || 
      i.overallOutcome === 'positive'
    ).length;
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

  // Process outcomes for pie chart
  const outcomesData = useMemo(() => {
    const outcomes = {
      positive: 0,
      negative: 0,
      'positive with comments': 0
    };

    inspections.forEach(insp => {
      const outcome = insp.inspectionOutcome || insp.overallOutcome;
      if (outcome && outcomes.hasOwnProperty(outcome)) {
        outcomes[outcome]++;
      }
    });

    return [
      { name: 'Positive', value: outcomes.positive, color: '#10b981' },
      { name: 'Negative', value: outcomes.negative, color: '#ef4444' },
      { name: 'With Comments', value: outcomes['positive with comments'], color: '#f59e0b' }
    ].filter(item => item.value > 0);
  }, [inspections]);

  // Process inspections by supplier for selected year
  const inspectionsBySupplier = useMemo(() => {
    const supplierData = {};

    inspections.forEach(insp => {
      const date = new Date(insp.inspectionDate);
      if (date.getFullYear() === selectedYear) {
        // Try multiple field names to get supplier
        const supplier = insp.supplier || insp.supplierName || insp.inspectionSite || 'Unknown';
        
        if (supplierData[supplier]) {
          supplierData[supplier]++;
        } else {
          supplierData[supplier] = 1;
        }
      }
    });

    // Convert to array and sort
    const sortedData = Object.entries(supplierData)
      .map(([name, count]) => ({ 
        name: name.length > 20 ? name.substring(0, 20) + '...' : name, 
        count 
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 suppliers

    console.log('📊 Inspections by Supplier:', sortedData); // Para debug
    
    return sortedData;
  }, [inspections, selectedYear]);

  // Calculate rejection rate by supplier
  const rejectionBySupplier = useMemo(() => {
    const supplierStats = {};

    inspections.forEach(insp => {
      // Try multiple field names to get supplier
      const supplier = insp.supplier || insp.supplierName || insp.inspectionSite || 'Unknown';
      
      if (!supplierStats[supplier]) {
        supplierStats[supplier] = { total: 0, rejected: 0 };
      }
      supplierStats[supplier].total++;
      
      const outcome = insp.inspectionOutcome || insp.overallOutcome;
      if (outcome === 'negative') {
        supplierStats[supplier].rejected++;
      }
    });

    const sortedData = Object.entries(supplierStats)
      .map(([name, stats]) => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        rate: stats.total > 0 ? (stats.rejected / stats.total * 100) : 0,
        total: stats.total
      }))
      .filter(item => item.total >= 3) // Only suppliers with 3+ inspections
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 8);

    console.log('📊 Rejection by Supplier:', sortedData); // Para debug
    
    return sortedData;
  }, [inspections]);

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  const renderKPICard = (title, value, Icon, format = 'number', trend) => {
    const formattedValue = format === 'currency' 
      ? `€${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
      : format === 'percentage'
      ? `${value.toFixed(1)}%`
      : value.toLocaleString();

    return (
      <div className="id-kpi-card">
        <div className="id-kpi-icon">
          <Icon size={24} />
        </div>
        <div className="id-kpi-content">
          <div className="id-kpi-label">{title}</div>
          <div className="id-kpi-value">{formattedValue}</div>
          {trend && <div className="id-kpi-trend">{trend}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="id-analytics-section">
      {/* Year Selector */}
      <div className="id-year-selector">
        <label>Select Year: </label>
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="id-year-select"
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="id-kpi-grid">
        {renderKPICard(
          'Total Inspections',
          kpis.totalInspections,
          Package,
          'number'
        )}
        {renderKPICard(
          'Total Cost',
          kpis.totalCost,
          DollarSign,
          'currency'
        )}
        {renderKPICard(
          'Approval Rate',
          kpis.approvalRate,
          CheckCircle,
          'percentage'
        )}
        {renderKPICard(
          'Active Suppliers',
          kpis.activeSuppliers,
          Users,
          'number'
        )}
        {renderKPICard(
          'Avg Cost/Inspection',
          kpis.avgCost,
          TrendingUp,
          'currency'
        )}
      </div>

      {/* Charts Grid */}
      <div className="id-charts-grid">
        
        {/* Chart 1: Inspections by Month */}
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
              <Bar dataKey="inspections" fill="#0077a2" name="Inspections" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Costs by Month */}
        <div className="id-chart-card">
          <h3 className="id-chart-title">Costs by Month ({selectedYear})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={inspectionsByMonth}>
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
              <Line 
                type="monotone" 
                dataKey="cost" 
                stroke="#f59e0b" 
                strokeWidth={3}
                name="Cost (€)"
                dot={{ fill: '#f59e0b', r: 5 }}
              />
            </LineChart>
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
                formatter={(value) => `${value.toFixed(1)}%`}
              />
              <Bar dataKey="rate" fill="#ef4444" name="Rejection Rate (%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default InspectionAnalytics;