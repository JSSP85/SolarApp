// src/components/non-conformity/panels/DashboardPanel.jsx
import React, { useState, useMemo } from 'react';
import { useNonConformity } from '../../../context/NonConformityContext';
// ✅ IMPORT DE UTILIDADES DE FECHA SEGURAS
import { safeParseDate, safeDateCompare } from '../../../utils/dateUtils';
// ✅ IMPORT DE RECHARTS PARA GRÁFICOS MODERNOS
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
// ✅ IMPORT DE ICONOS LUCIDE
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Activity,
  Users,
  Target,
  Calendar,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';

const DashboardPanel = () => {
  const { state, helpers } = useNonConformity();
  const { ncList, metrics } = state;
  
  // Local state for dashboard controls
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('count');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // ✅ PALETA DE COLORES MODERNA (IGUAL AL DASHBOARD DE INSPECTIONS)
  const colors = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    accent: '#ec4899',
    gradient: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'],
    background: 'rgba(15, 23, 42, 0.9)',
    cardBackground: 'rgba(30, 41, 59, 0.8)',
    border: 'rgba(255, 255, 255, 0.1)'
  };

  // ✅ FUNCIÓN SEGURA: Generate trend data para gráficos
  const generateTrendData = (ncList, selectedPeriod) => {
    const now = new Date();
    const months = [];
    
    // Generate 6 months of data
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en', { month: 'short' });
      const year = date.getFullYear();
      const monthKey = `${monthName} ${year}`;
      
      // Filter NCs for this month - ✅ USANDO FECHAS SEGURAS
      const monthNCs = ncList.filter(nc => {
        const createdDate = safeParseDate(nc.createdDate);
        return createdDate.getMonth() === date.getMonth() && 
               createdDate.getFullYear() === date.getFullYear();
      });
      
      // Filter resolved NCs for this month - ✅ USANDO FECHAS SEGURAS
      const resolvedNCs = monthNCs.filter(nc => {
        if (nc.status === 'resolved' || nc.status === 'closed') {
          const resolvedDate = safeParseDate(nc.actualClosureDate);
          return resolvedDate.getMonth() === date.getMonth() && 
                 resolvedDate.getFullYear() === date.getFullYear();
        }
        return false;
      });
      
      months.push({
        month: monthKey,
        created: monthNCs.length,
        resolved: resolvedNCs.length,
        resolutionRate: monthNCs.length > 0 ? 
          Math.round((resolvedNCs.length / monthNCs.length) * 100) : 0
      });
    }
    
    return months;
  };

  // ✅ FUNCIÓN SEGURA: Generate alerts - CON FECHAS SEGURAS
  const generateAlerts = (ncList) => {
    const alerts = [];
    const now = new Date();
    
    // Overdue NCs - ✅ USAR FECHAS SEGURAS
    const overdueNCs = ncList.filter(nc => {
      if (!nc.plannedClosureDate || nc.status === 'resolved' || nc.status === 'closed') return false;
      const planned = safeParseDate(nc.plannedClosureDate);
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
    
    // High volume of NCs this month - ✅ USAR FECHAS SEGURAS
    const thisMonthNCs = ncList.filter(nc => {
      const createdDate = safeParseDate(nc.createdDate);
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
  };

  // Calculate comprehensive metrics - ✅ CON FECHAS SEGURAS
  const dashboardMetrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter NCs by period - ✅ USANDO FECHAS SEGURAS
    const getFilteredNCs = (period) => {
      return ncList.filter(nc => {
        const createdDate = safeParseDate(nc.createdDate);
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
    
    const filteredNCs = getFilteredNCs(selectedPeriod);
    
    // Basic metrics
    const totalNCs = ncList.length;
    const activeNCs = ncList.filter(nc => nc.status === 'open' || nc.status === 'progress').length;
    const resolvedNCs = ncList.filter(nc => nc.status === 'resolved' || nc.status === 'closed').length;
    const criticalNCs = ncList.filter(nc => nc.priority === 'critical' && (nc.status === 'open' || nc.status === 'progress')).length;
    
    // Priority distribution
    const priorityDistribution = {
      critical: ncList.filter(nc => nc.priority === 'critical').length,
      major: ncList.filter(nc => nc.priority === 'major').length,
      minor: ncList.filter(nc => nc.priority === 'minor').length,
      low: ncList.filter(nc => nc.priority === 'low').length
    };
    
    // Status distribution
    const statusDistribution = {
      open: ncList.filter(nc => nc.status === 'open').length,
      progress: ncList.filter(nc => nc.status === 'progress').length,
      resolved: ncList.filter(nc => nc.status === 'resolved').length,
      closed: ncList.filter(nc => nc.status === 'closed').length
    };
    
    // Period-specific metrics
    const periodMetrics = {
      created: filteredNCs.length,
      resolved: filteredNCs.filter(nc => nc.status === 'resolved' || nc.status === 'closed').length,
      avgResolutionTime: filteredNCs.filter(nc => nc.daysOpen).reduce((acc, nc) => acc + (nc.daysOpen || 0), 0) / Math.max(filteredNCs.length, 1)
    };
    
    // Resolution rate
    const resolutionRate = totalNCs > 0 ? Math.round((resolvedNCs / totalNCs) * 100) : 0;
    
    // Generate alerts
    const alerts = generateAlerts(ncList);
    
    return {
      totalNCs,
      activeNCs,
      resolvedNCs,
      criticalNCs,
      priorityDistribution,
      statusDistribution,
      periodMetrics,
      resolutionRate,
      alerts
    };
  }, [ncList, selectedPeriod]);

  // ✅ PROCESAR DATOS PARA GRÁFICOS MODERNOS
  const priorityChartData = Object.entries(dashboardMetrics.priorityDistribution).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value,
    color: key === 'critical' ? colors.danger : 
           key === 'major' ? colors.warning : 
           key === 'minor' ? colors.primary : colors.success
  }));

  const statusChartData = Object.entries(dashboardMetrics.statusDistribution).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value,
    color: key === 'open' ? colors.danger : 
           key === 'progress' ? colors.warning : 
           key === 'resolved' ? colors.success : colors.primary
  }));

  const trendData = generateTrendData(ncList, selectedPeriod);

  // ✅ COMPONENTE PARA KPI CARDS MODERNOS
  const ModernKPICard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div style={{
      background: colors.cardBackground,
      backdropFilter: 'blur(10px)',
      border: `1px solid ${colors.border}`,
      borderRadius: '16px',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{
          background: `${colors[color]}20`,
          borderRadius: '12px',
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} color={colors[color]} />
        </div>
        {trend !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {trend > 0 ? <TrendingUp size={16} color={colors.success} /> : <TrendingDown size={16} color={colors.danger} />}
            <span style={{ color: trend > 0 ? colors.success : colors.danger, fontSize: '0.875rem', fontWeight: '600' }}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
      <div style={{ color: 'white', fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
        {value}
      </div>
      <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', fontWeight: '500' }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  // ✅ COMPONENTE PARA TARJETAS DE GRÁFICOS MODERNOS
  const ModernChartCard = ({ title, subtitle, children, className = '' }) => (
    <div 
      style={{
        background: colors.cardBackground,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${colors.border}`,
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      }}
      className={className}
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // ✅ TOOLTIP PERSONALIZADO PARA GRÁFICOS
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          padding: '0.75rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
          <p style={{ color: 'white', margin: '0 0 0.5rem 0', fontWeight: '600' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '0.25rem 0', fontSize: '0.875rem' }}>
              {`${entry.name}: ${entry.value}${entry.name === 'resolutionRate' ? '%' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      background: colors.background,
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '2rem',
      border: `1px solid ${colors.border}`,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      color: 'white'
    }}>
      {/* ✅ HEADER MODERNO */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: `1px solid ${colors.border}`
      }}>
        <div>
          <h2 style={{ 
            color: 'white', 
            fontSize: '1.75rem', 
            fontWeight: '700', 
            margin: '0 0 0.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <BarChart3 size={28} color={colors.primary} />
            NC Dashboard Analytics
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
            Real-time insights and performance metrics
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <select
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: 'white',
              fontSize: '0.875rem'
            }}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              background: `${colors.primary}20`,
              border: `1px solid ${colors.primary}`,
              borderRadius: '8px',
              padding: '0.5rem',
              color: colors.primary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ✅ ALERTAS MODERNAS */}
      {dashboardMetrics.alerts.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          {dashboardMetrics.alerts.map((alert, index) => (
            <div 
              key={index}
              style={{
                background: alert.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 
                           alert.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 
                           'rgba(59, 130, 246, 0.1)',
                border: `1px solid ${alert.type === 'error' ? colors.danger : 
                                    alert.type === 'warning' ? colors.warning : colors.primary}`,
                borderRadius: '12px',
                padding: '1rem 1.5rem',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{alert.icon}</span>
                <div>
                  <div style={{ color: 'white', fontWeight: '600', marginBottom: '0.25rem' }}>
                    {alert.title}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                    {alert.message}
                  </div>
                </div>
              </div>
              <button style={{
                background: 'transparent',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}>
                {alert.action}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ✅ KPI CARDS MODERNOS */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        <ModernKPICard
          icon={Activity}
          title="Total Non-Conformities"
          value={dashboardMetrics.totalNCs}
          subtitle={`${dashboardMetrics.periodMetrics.created} created this ${selectedPeriod}`}
          color="primary"
          trend={5}
        />
        
        <ModernKPICard
          icon={AlertTriangle}
          title="Critical Active"
          value={dashboardMetrics.criticalNCs}
          subtitle={`${dashboardMetrics.activeNCs} total active NCs`}
          color="danger"
          trend={-2}
        />
        
        <ModernKPICard
          icon={CheckCircle}
          title="Resolution Rate"
          value={`${dashboardMetrics.resolutionRate}%`}
          subtitle={`${dashboardMetrics.resolvedNCs} resolved NCs`}
          color="success"
          trend={8}
        />
        
        <ModernKPICard
          icon={Clock}
          title="Avg Resolution Time"
          value={`${Math.round(dashboardMetrics.periodMetrics.avgResolutionTime)} days`}
          subtitle={`Based on ${selectedPeriod} data`}
          color="warning"
          trend={-5}
        />
      </div>

      {/* ✅ GRÁFICOS MODERNOS */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        {/* Trend Analysis */}
        <ModernChartCard 
          title="Trend Analysis" 
          subtitle="Monthly NC creation and resolution trends"
          className="col-span-2"
        >
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="month" stroke="rgba(255, 255, 255, 0.6)" />
              <YAxis stroke="rgba(255, 255, 255, 0.6)" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="created" fill={colors.primary} name="Created" />
              <Bar dataKey="resolved" fill={colors.success} name="Resolved" />
              <Line 
                type="monotone" 
                dataKey="resolutionRate" 
                stroke={colors.accent} 
                strokeWidth={3} 
                name="Resolution Rate (%)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ModernChartCard>

        {/* Priority Distribution */}
        <ModernChartCard title="Priority Distribution" subtitle="NC distribution by priority level">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityChartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {priorityChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ModernChartCard>

        {/* Status Overview */}
        <ModernChartCard title="Status Overview" subtitle="Current status distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusChartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis type="number" stroke="rgba(255, 255, 255, 0.6)" />
              <YAxis dataKey="name" type="category" stroke="rgba(255, 255, 255, 0.6)" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill={colors.secondary}>
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ModernChartCard>
      </div>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DashboardPanel;