import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  Cell, ResponsiveContainer
} from 'recharts';
import { BarChart3, TrendingUp, AlertCircle, CheckCircle, Clock, Calendar } from 'lucide-react';

const NCStatisticsCharts = ({ ncList }) => {
  const [stats, setStats] = useState(null);
  const [selectedYearPhase, setSelectedYearPhase] = useState('all');
  const [selectedYearAccountable, setSelectedYearAccountable] = useState('all');
  const [selectedYearPieCharts, setSelectedYearPieCharts] = useState('all');
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    if (ncList && ncList.length > 0) {
      calculateStats();
      extractAvailableYears();
    }
  }, [ncList]);

  const extractAvailableYears = () => {
    const years = [...new Set(ncList.map(nc => nc.year).filter(Boolean))].sort((a, b) => b - a);
    setAvailableYears(years);
  };

  const calculateStats = () => {
    const total = ncList.length;
    
    // Status distribution
    const statusDist = {
      open: ncList.filter(nc => nc.status === 'open').length,
      inProgress: ncList.filter(nc => nc.status === 'in_progress').length,
      closed: ncList.filter(nc => nc.status === 'closed').length,
      cancelled: ncList.filter(nc => nc.status === 'cancelled').length
    };

    // NC Class distribution
    const classDist = {
      critical: ncList.filter(nc => nc.ncClass === 'critical').length,
      major: ncList.filter(nc => nc.ncClass === 'major').length,
      minor: ncList.filter(nc => nc.ncClass === 'minor').length
    };

    // Detection Phase distribution (all data for filtering)
    const phaseDist = {};
    const phaseDistByYear = {};
    
    ncList.forEach(nc => {
      if (nc.detectionPhase) {
        phaseDist[nc.detectionPhase] = (phaseDist[nc.detectionPhase] || 0) + 1;
        
        if (nc.year) {
          if (!phaseDistByYear[nc.year]) {
            phaseDistByYear[nc.year] = {};
          }
          phaseDistByYear[nc.year][nc.detectionPhase] = 
            (phaseDistByYear[nc.year][nc.detectionPhase] || 0) + 1;
        }
      }
    });

    // Accountable/Supplier distribution
    const accountableDist = {};
    const accountableDistByYear = {};
    
    ncList.forEach(nc => {
      const accountable = nc.accountable || nc.supplier || nc.responsiblePerson || 'Not Assigned';
      accountableDist[accountable] = (accountableDist[accountable] || 0) + 1;
      
      if (nc.year) {
        if (!accountableDistByYear[nc.year]) {
          accountableDistByYear[nc.year] = {};
        }
        accountableDistByYear[nc.year][accountable] = 
          (accountableDistByYear[nc.year][accountable] || 0) + 1;
      }
    });

    // Monthly trend (last 12 months)
    const monthlyData = {};
    ncList.forEach(nc => {
      if (nc.year && nc.month) {
        const key = `${nc.year}-${nc.month}`;
        if (!monthlyData[key]) {
          monthlyData[key] = { open: 0, closed: 0, total: 0 };
        }
        monthlyData[key].total++;
        if (nc.status === 'open') monthlyData[key].open++;
        if (nc.status === 'closed') monthlyData[key].closed++;
      }
    });

    // Yearly distribution
    const yearlyDist = {};
    ncList.forEach(nc => {
      if (nc.year) {
        yearlyDist[nc.year] = (yearlyDist[nc.year] || 0) + 1;
      }
    });

    // Yearly distribution by detection phase (for stacked chart)
    const yearlyByPhase = {};
    ncList.forEach(nc => {
      if (nc.year && nc.detectionPhase) {
        if (!yearlyByPhase[nc.year]) {
          yearlyByPhase[nc.year] = {};
        }
        yearlyByPhase[nc.year][nc.detectionPhase] = 
          (yearlyByPhase[nc.year][nc.detectionPhase] || 0) + 1;
      }
    });

    setStats({
      total,
      statusDist,
      classDist,
      phaseDist,
      phaseDistByYear,
      accountableDist,
      accountableDistByYear,
      monthlyData,
      yearlyDist,
      yearlyByPhase
    });
  };

  if (!stats) {
    return (
      <div className="text-center text-slate-400 py-12">
        Loading statistics...
      </div>
    );
  }

  // Filter functions - defined here before use
  const getPhaseDataForYear = () => {
    if (selectedYearPhase === 'all') {
      return stats.phaseDist;
    }
    return stats.phaseDistByYear[selectedYearPhase] || {};
  };

  const getStatusDataForYear = () => {
    if (selectedYearPieCharts === 'all') {
      return stats.statusDist;
    }
    const yearNCs = ncList.filter(nc => String(nc.year) === String(selectedYearPieCharts));
    return {
      open: yearNCs.filter(nc => nc.status === 'open').length,
      inProgress: yearNCs.filter(nc => nc.status === 'in_progress').length,
      closed: yearNCs.filter(nc => nc.status === 'closed').length,
      cancelled: yearNCs.filter(nc => nc.status === 'cancelled').length
    };
  };

  const getClassDataForYear = () => {
    if (selectedYearPieCharts === 'all') {
      return stats.classDist;
    }
    const yearNCs = ncList.filter(nc => String(nc.year) === String(selectedYearPieCharts));
    return {
      critical: yearNCs.filter(nc => nc.ncClass === 'critical').length,
      major: yearNCs.filter(nc => nc.ncClass === 'major').length,
      minor: yearNCs.filter(nc => nc.ncClass === 'minor').length
    };
  };

  const getAccountableDataForYear = () => {
    if (selectedYearAccountable === 'all') {
      return stats.accountableDist;
    }
    return stats.accountableDistByYear[selectedYearAccountable] || {};
  };

  // Prepare data for charts
  const filteredStatusDist = getStatusDataForYear();
  const filteredClassDist = getClassDataForYear();
  
  const statusChartData = [
    { name: 'Open', value: filteredStatusDist.open, color: '#ef4444' },
    { name: 'In Progress', value: filteredStatusDist.inProgress, color: '#eab308' },
    { name: 'Closed', value: filteredStatusDist.closed, color: '#22c55e' },
    { name: 'Cancelled', value: filteredStatusDist.cancelled, color: '#6b7280' }
  ].filter(item => item.value > 0);

  const classChartData = [
    { name: 'Critical', value: filteredClassDist.critical, color: '#dc2626' },
    { name: 'Major', value: filteredClassDist.major, color: '#f97316' },
    { name: 'Minor', value: filteredClassDist.minor, color: '#eab308' }
  ].filter(item => item.value > 0);

  const phaseChartData = Object.entries(getPhaseDataForYear())
    .map(([phase, count]) => ({
      name: phase.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      value: count
    }))
    .sort((a, b) => b.value - a.value);

  // Filter accountable data by selected year
  const accountableChartData = Object.entries(getAccountableDataForYear())
    .map(([accountable, count]) => ({
      name: accountable,
      value: count
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 accountables

  const yearlyChartData = Object.entries(stats.yearlyDist)
    .map(([year, count]) => ({
      year: year,
      count: count
    }))
    .sort((a, b) => a.year - b.year);

  // Prepare stacked bar chart data for yearly NCs by detection phase
  const yearlyStackedData = Object.keys(stats.yearlyByPhase)
    .sort((a, b) => a - b)
    .map(year => {
      const phases = stats.yearlyByPhase[year];
      return {
        year: year,
        'NC BY CLIENT': phases['nc_by_client'] || 0,
        'Installation': phases['installation'] || 0,
        'On Site': phases['on_site'] || 0,
        'Production': phases['production'] || 0,
        'Malpractice': phases['malpractice'] || 0,
        'Incoming Goods': phases['incoming_goods'] || 0,
        'Other': phases['other'] || 0
      };
    });

  // Detection phase colors for stacked chart
  const phaseColors = {
    'NC BY CLIENT': '#22c55e',
    'Installation': '#3b82f6',
    'On Site': '#eab308',
    'Production': '#9ca3af',
    'Malpractice': '#f97316',
    'Incoming Goods': '#60a5fa',
    'Other': '#a78bfa'
  };

  // Monthly trend (last 12 entries)
  const monthlyTrendData = Object.entries(stats.monthlyData)
    .map(([key, data]) => ({
      month: key,
      open: data.open,
      closed: data.closed,
      total: data.total
    }))
    .slice(-12);

  const COLORS = ['#ef4444', '#eab308', '#22c55e', '#6b7280', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Compact KPI Cards and NC Class Distribution Combined */}
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>📊 Key Performance Indicators</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Total NCs - Compact */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-blue-200 text-sm">Total NCs</span>
              <BarChart3 className="text-blue-200" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
            <p className="text-blue-200 text-xs mt-1">All records</p>
          </div>

          {/* Open - Compact */}
          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-red-200 text-sm">Open</span>
              <AlertCircle className="text-red-200" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{stats.statusDist.open}</p>
            <p className="text-red-200 text-xs mt-1">
              {stats.total > 0 ? ((stats.statusDist.open / stats.total) * 100).toFixed(1) : 0}% of total
            </p>
          </div>

          {/* In Progress - Compact */}
          <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-yellow-200 text-sm">In Progress</span>
              <Clock className="text-yellow-200" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{stats.statusDist.inProgress}</p>
            <p className="text-yellow-200 text-xs mt-1">
              {stats.total > 0 ? ((stats.statusDist.inProgress / stats.total) * 100).toFixed(1) : 0}% of total
            </p>
          </div>

          {/* Closed - Compact */}
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-green-200 text-sm">Closed</span>
              <CheckCircle className="text-green-200" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{stats.statusDist.closed}</p>
            <p className="text-green-200 text-xs mt-1">
              {stats.total > 0 ? ((stats.statusDist.closed / stats.total) * 100).toFixed(1) : 0}% closure rate
            </p>
          </div>
        </div>

        {/* NC Class Distribution - Compact inline */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e5e7eb' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1f2937' }}>Distribution by NC Class</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-500">{stats.classDist.critical}</div>
              <div className="text-xs text-red-600 font-semibold mt-1">🚨 CRITICAL</div>
              <div className="text-xs text-red-700 mt-0.5">
                {stats.total > 0 ? ((stats.classDist.critical / stats.total) * 100).toFixed(1) : 0}%
              </div>
            </div>
            <div className="bg-orange-900/30 border border-orange-700 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-500">{stats.classDist.major}</div>
              <div className="text-xs text-orange-600 font-semibold mt-1">🔴 MAJOR</div>
              <div className="text-xs text-orange-700 mt-0.5">
                {stats.total > 0 ? ((stats.classDist.major / stats.total) * 100).toFixed(1) : 0}%
              </div>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.classDist.minor}</div>
              <div className="text-xs text-yellow-700 font-semibold mt-1">🟡 MINOR</div>
              <div className="text-xs text-yellow-800 mt-0.5">
                {stats.total > 0 ? ((stats.classDist.minor / stats.total) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Pie Charts Row: Status and Class Distribution */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f1f5f9' }}>📊 Status & NC Class Distribution</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: '500' }}>📅</span>
            <button
              onClick={() => setSelectedYearPieCharts('all')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: selectedYearPieCharts === 'all' ? '#3b82f6' : '#475569',
                color: selectedYearPieCharts === 'all' ? '#ffffff' : '#cbd5e1',
                boxShadow: selectedYearPieCharts === 'all' ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none',
                transform: selectedYearPieCharts === 'all' ? 'translateY(-2px)' : 'none'
              }}
            >
              All Years
            </button>
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYearPieCharts(year)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: selectedYearPieCharts === year ? '#3b82f6' : '#475569',
                  color: selectedYearPieCharts === year ? '#ffffff' : '#cbd5e1',
                  boxShadow: selectedYearPieCharts === year ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none',
                  transform: selectedYearPieCharts === year ? 'translateY(-2px)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (selectedYearPieCharts !== year) {
                    e.currentTarget.style.backgroundColor = '#64748b';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedYearPieCharts !== year) {
                    e.currentTarget.style.backgroundColor = '#475569';
                    e.currentTarget.style.transform = 'none';
                  }
                }}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {/* Status Distribution Pie Chart */}
          <div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', textAlign: 'center', color: '#cbd5e1' }}>Status Distribution</h4>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart key={`status-${selectedYearPieCharts}`}>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* NC Class Distribution Pie Chart */}
          <div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', textAlign: 'center', color: '#cbd5e1' }}>NC Class Distribution</h4>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart key={`class-${selectedYearPieCharts}`}>
                  <Pie
                    data={classChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {classChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row: Detection Phase Bar Chart with Year Filter */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f1f5f9' }}>📍 NCs by Detection Phase</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: '500' }}>📅</span>
            <button
              onClick={() => setSelectedYearPhase('all')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: selectedYearPhase === 'all' ? '#8b5cf6' : '#475569',
                color: selectedYearPhase === 'all' ? '#ffffff' : '#cbd5e1',
                boxShadow: selectedYearPhase === 'all' ? '0 4px 12px rgba(139, 92, 246, 0.4)' : 'none',
                transform: selectedYearPhase === 'all' ? 'translateY(-2px)' : 'none'
              }}
            >
              All Years
            </button>
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYearPhase(year)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: selectedYearPhase === year ? '#8b5cf6' : '#475569',
                  color: selectedYearPhase === year ? '#ffffff' : '#cbd5e1',
                  boxShadow: selectedYearPhase === year ? '0 4px 12px rgba(139, 92, 246, 0.4)' : 'none',
                  transform: selectedYearPhase === year ? 'translateY(-2px)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (selectedYearPhase !== year) {
                    e.currentTarget.style.backgroundColor = '#64748b';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedYearPhase !== year) {
                    e.currentTarget.style.backgroundColor = '#475569';
                    e.currentTarget.style.transform = 'none';
                  }
                }}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={phaseChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis type="number" stroke="#475569" />
              <YAxis dataKey="name" type="category" width={150} stroke="#475569" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]}>
                {phaseChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3: NCs by Accountable/Supplier with Year Filter */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f1f5f9' }}>👥 NCs by Accountable / Supplier</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: '500' }}>📅</span>
            <button
              onClick={() => setSelectedYearAccountable('all')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: selectedYearAccountable === 'all' ? '#10b981' : '#475569',
                color: selectedYearAccountable === 'all' ? '#ffffff' : '#cbd5e1',
                boxShadow: selectedYearAccountable === 'all' ? '0 4px 12px rgba(16, 185, 129, 0.4)' : 'none',
                transform: selectedYearAccountable === 'all' ? 'translateY(-2px)' : 'none'
              }}
            >
              All Years
            </button>
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYearAccountable(year)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: selectedYearAccountable === year ? '#10b981' : '#475569',
                  color: selectedYearAccountable === year ? '#ffffff' : '#cbd5e1',
                  boxShadow: selectedYearAccountable === year ? '0 4px 12px rgba(16, 185, 129, 0.4)' : 'none',
                  transform: selectedYearAccountable === year ? 'translateY(-2px)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (selectedYearAccountable !== year) {
                    e.currentTarget.style.backgroundColor = '#64748b';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedYearAccountable !== year) {
                    e.currentTarget.style.backgroundColor = '#475569';
                    e.currentTarget.style.transform = 'none';
                  }
                }}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={accountableChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis type="number" stroke="#475569" />
              <YAxis dataKey="name" type="category" width={180} stroke="#475569" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]}>
                {accountableChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stacked Bar Chart: NCs by Year and Detection Phase */}
      {yearlyStackedData.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#f1f5f9' }}>
            📊 NC Detection Phases by Year
          </h3>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={yearlyStackedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="year" stroke="#475569" />
                <YAxis stroke="#475569" label={{ value: 'Count of NCs', angle: -90, position: 'insideLeft', style: { fill: '#475569' } }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="square"
                />
                <Bar dataKey="NC BY CLIENT" stackId="a" fill={phaseColors['NC BY CLIENT']} />
                <Bar dataKey="Installation" stackId="a" fill={phaseColors['Installation']} />
                <Bar dataKey="On Site" stackId="a" fill={phaseColors['On Site']} />
                <Bar dataKey="Production" stackId="a" fill={phaseColors['Production']} />
                <Bar dataKey="Malpractice" stackId="a" fill={phaseColors['Malpractice']} />
                <Bar dataKey="Incoming Goods" stackId="a" fill={phaseColors['Incoming Goods']} />
                <Bar dataKey="Other" stackId="a" fill={phaseColors['Other']} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Charts Row 4: Yearly Trend */}
      {yearlyChartData.length > 1 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#f1f5f9' }}>📅 NCs by Year</h3>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="year" stroke="#475569" />
                <YAxis stroke="#475569" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Charts Row 5: Monthly Trend */}
      {monthlyTrendData.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#f1f5f9' }}>📈 Monthly Trend (Last 12 Months)</h3>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="month" stroke="#475569" />
                <YAxis stroke="#475569" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total NCs" />
                <Line type="monotone" dataKey="open" stroke="#ef4444" strokeWidth={2} name="Open" />
                <Line type="monotone" dataKey="closed" stroke="#22c55e" strokeWidth={2} name="Closed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default NCStatisticsCharts;