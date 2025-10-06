import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  Cell, ResponsiveContainer
} from 'recharts';
import { BarChart3, TrendingUp, AlertCircle, CheckCircle, Clock, Calendar } from 'lucide-react';

const NCStatisticsCharts = ({ ncList }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (ncList && ncList.length > 0) {
      calculateStats();
    }
  }, [ncList]);

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

    // Detection Phase distribution
    const phaseDist = {};
    ncList.forEach(nc => {
      if (nc.detectionPhase) {
        phaseDist[nc.detectionPhase] = (phaseDist[nc.detectionPhase] || 0) + 1;
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

  // Prepare data for charts
  const statusChartData = [
    { name: 'Open', value: stats.statusDist.open, color: '#ef4444' },
    { name: 'In Progress', value: stats.statusDist.inProgress, color: '#eab308' },
    { name: 'Closed', value: stats.statusDist.closed, color: '#22c55e' },
    { name: 'Cancelled', value: stats.statusDist.cancelled, color: '#6b7280' }
  ].filter(item => item.value > 0);

  const classChartData = [
    { name: 'Critical', value: stats.classDist.critical, color: '#dc2626' },
    { name: 'Major', value: stats.classDist.major, color: '#f97316' },
    { name: 'Minor', value: stats.classDist.minor, color: '#eab308' }
  ].filter(item => item.value > 0);

  const phaseChartData = Object.entries(stats.phaseDist)
    .map(([phase, count]) => ({
      name: phase.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      value: count
    }))
    .sort((a, b) => b.value - a.value);

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

  const COLORS = ['#ef4444', '#eab308', '#22c55e', '#6b7280', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
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

      {/* NC Class Distribution Cards */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
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

      {/* Charts Row 1: Status & Class Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold mb-4">📊 NC Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
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

        {/* NC Class Pie Chart */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold mb-4">⚠️ NC Class Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={classChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
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

      {/* Charts Row 2: Detection Phase Bar Chart */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold mb-4">📍 NCs by Detection Phase</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={phaseChartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" stroke="#94a3b8" />
            <YAxis dataKey="name" type="category" width={150} stroke="#94a3b8" />
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

      {/* Charts Row 3: Yearly Trend */}
      {yearlyChartData.length > 1 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold mb-4">📅 NCs by Year</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Charts Row 4: Monthly Trend */}
      {monthlyTrendData.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={24} />
            Monthly Trend (Last 12 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="month" 
                stroke="#94a3b8"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Total NCs"
              />
              <Line 
                type="monotone" 
                dataKey="open" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Open"
              />
              <Line 
                type="monotone" 
                dataKey="closed" 
                stroke="#22c55e" 
                strokeWidth={2}
                name="Closed"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold mb-4">📋 Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Summary */}
          <div>
            <h4 className="font-semibold mb-3 text-slate-300">By Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded">
                <span className="text-slate-300">🔴 Open</span>
                <span className="font-bold">{stats.statusDist.open}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded">
                <span className="text-slate-300">🟡 In Progress</span>
                <span className="font-bold">{stats.statusDist.inProgress}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded">
                <span className="text-slate-300">🟢 Closed</span>
                <span className="font-bold">{stats.statusDist.closed}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded">
                <span className="text-slate-300">⚫ Cancelled</span>
                <span className="font-bold">{stats.statusDist.cancelled}</span>
              </div>
            </div>
          </div>

          {/* Class Summary */}
          <div>
            <h4 className="font-semibold mb-3 text-slate-300">By NC Class</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded">
                <span className="text-slate-300">🚨 Critical</span>
                <span className="font-bold text-red-400">{stats.classDist.critical}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded">
                <span className="text-slate-300">🔴 Major</span>
                <span className="font-bold text-orange-400">{stats.classDist.major}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded">
                <span className="text-slate-300">🟡 Minor</span>
                <span className="font-bold text-yellow-400">{stats.classDist.minor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NCStatisticsCharts;