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

    setStats({
      total,
      statusDist,
      classDist,
      phaseDist,
      phaseDistByYear,
      accountableDist,
      accountableDistByYear,
      monthlyData,
      yearlyDist
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
    const yearNCs = ncList.filter(nc => nc.year === selectedYearPieCharts);
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
    const yearNCs = ncList.filter(nc => nc.year === selectedYearPieCharts);
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
      {/* KPI Cards with background */}
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-200">Total NCs</span>
            <BarChart3 className="text-blue-200" size={24} />
          </div>
          <p className="text-4xl font-bold">{stats.total}</p>
          <p className="text-blue-200 text-sm mt-2">All records</p>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-200">Open</span>
            <AlertCircle className="text-red-200" size={24} />
          </div>
          <p className="text-4xl font-bold">{stats.statusDist.open}</p>
          <p className="text-red-200 text-sm mt-2">
            {stats.total > 0 ? ((stats.statusDist.open / stats.total) * 100).toFixed(1) : 0}% of total
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-200">In Progress</span>
            <Clock className="text-yellow-200" size={24} />
          </div>
          <p className="text-4xl font-bold">{stats.statusDist.inProgress}</p>
          <p className="text-yellow-200 text-sm mt-2">
            {stats.total > 0 ? ((stats.statusDist.inProgress / stats.total) * 100).toFixed(1) : 0}% of total
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-200">Closed</span>
            <CheckCircle className="text-green-200" size={24} />
          </div>
          <p className="text-4xl font-bold">{stats.statusDist.closed}</p>
          <p className="text-green-200 text-sm mt-2">
            {stats.total > 0 ? ((stats.statusDist.closed / stats.total) * 100).toFixed(1) : 0}% closure rate
          </p>
        </div>
      </div>
      </div>

      {/* NC Class Distribution Cards with background */}
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h3 className="text-xl font-bold mb-4">Distribution by NC Class</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-400">{stats.classDist.critical}</div>
            <div className="text-sm text-red-300 mt-2">🚨 CRITICAL</div>
            <div className="text-xs text-red-400 mt-1">
              {stats.total > 0 ? ((stats.classDist.critical / stats.total) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="bg-orange-900/30 border border-orange-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-orange-400">{stats.classDist.major}</div>
            <div className="text-sm text-orange-300 mt-2">🔴 MAJOR</div>
            <div className="text-xs text-orange-400 mt-1">
              {stats.total > 0 ? ((stats.classDist.major / stats.total) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">{stats.classDist.minor}</div>
            <div className="text-sm text-yellow-300 mt-2">🟡 MINOR</div>
            <div className="text-xs text-yellow-400 mt-1">
              {stats.total > 0 ? ((stats.classDist.minor / stats.total) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Combined Pie Charts Row: Status and Class Distribution */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">📊 Status & NC Class Distribution</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-300">Year:</label>
            <select 
              value={selectedYearPieCharts}
              onChange={(e) => setSelectedYearPieCharts(e.target.value)}
              className="bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Distribution Pie Chart */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-center">Status Distribution</h4>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
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
            <h4 className="text-lg font-semibold mb-3 text-center">NC Class Distribution</h4>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">📍 NCs by Detection Phase</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-300">Year:</label>
            <select 
              value={selectedYearPhase}
              onChange={(e) => setSelectedYearPhase(e.target.value)}
              className="bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">👥 NCs by Accountable / Supplier</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-300">Year:</label>
            <select 
              value={selectedYearAccountable}
              onChange={(e) => setSelectedYearAccountable(e.target.value)}
              className="bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
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

      {/* Charts Row 4: Yearly Trend */}
      {yearlyChartData.length > 1 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold mb-4">📅 NCs by Year</h3>
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
          <h3 className="text-xl font-bold mb-4">📈 Monthly Trend (Last 12 Months)</h3>
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