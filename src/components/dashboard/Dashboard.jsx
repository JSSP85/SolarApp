import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  Factory, 
  Component, 
  Gauge,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  BarChart3,
  Filter,
  RefreshCw,
  Download
} from 'lucide-react';
import { getInspections, getInspectionStats } from '../../firebase/inspectionService';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    kpis: {
      totalInspections: 0,
      activeSuppliers: 0,
      passRate: 0,
      avgCoating: 0
    },
    timelineData: [],
    suppliersData: [],
    familiesData: [],
    componentsData: [],
    coatingsData: [],
    trendsData: [],
    weeklyData: [],
    statusData: [],
    passFailData: [],
    isLoading: true,
    error: null
  });
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);

  // Colores para los gráficos con tema oscuro
  const colors = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    accent: '#ec4899',
    gradient: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444']
  };

  // Cargar datos desde Firebase
  const loadDashboardData = async () => {
    try {
      setIsRefreshing(true);
      
      // Obtener todas las inspecciones
      const inspections = await getInspections({ limit: 1000 });
      
      // Generar lista de años disponibles
      const years = [...new Set(inspections.map(inspection => {
        const date = new Date(inspection.inspectionDate || inspection.createdAt?.toDate?.() || new Date());
        return date.getFullYear();
      }))].sort((a, b) => b - a);
      setAvailableYears(years);
      
      // Procesar datos para los KPIs
      const kpis = calculateKPIs(inspections);
      
      // Procesar datos para gráficos
      const timelineData = processTimelineData(inspections, selectedYear);
      const suppliersData = processSuppliersData(inspections);
      const familiesData = processFamiliesData(inspections);
      const componentsData = processComponentsData(inspections);
      const coatingsData = processCoatingsData(inspections);
      const trendsData = processTrendsData(inspections);
      const weeklyData = processWeeklyData(inspections);
      const statusData = processStatusData(inspections);
      const passFailData = processPassFailData(inspections, selectedYear);

      setDashboardData({
        kpis,
        timelineData,
        suppliersData,
        familiesData,
        componentsData,
        coatingsData,
        trendsData,
        weeklyData,
        statusData,
        passFailData,
        isLoading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    } finally {
      setIsRefreshing(false);
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadDashboardData();
  }, [selectedYear]);

  // Funciones de procesamiento de datos
  const calculateKPIs = (inspections) => {
    const total = inspections.length;
    const passed = inspections.filter(i => i.inspectionStatus === 'pass').length;
    const suppliers = new Set(inspections.map(i => i.supplierName || i.inspectionSite || 'Unknown')).size;
    
    // Calcular promedio de coating
    const coatings = inspections
      .filter(i => i.meanCoating && !isNaN(parseFloat(i.meanCoating)))
      .map(i => parseFloat(i.meanCoating));
    const avgCoating = coatings.length > 0 ? coatings.reduce((a, b) => a + b, 0) / coatings.length : 0;

    return {
      totalInspections: total,
      activeSuppliers: suppliers,
      passRate: total > 0 ? (passed / total * 100) : 0,
      avgCoating: avgCoating
    };
  };

  const processTimelineData = (inspections, year) => {
    // Crear estructura de 12 meses para el año seleccionado
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const monthlyData = {};
    
    // Inicializar todos los meses del año
    monthNames.forEach((month, index) => {
      const monthKey = `${year}-${String(index + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = { 
        month: month, 
        monthKey: monthKey,
        total: 0 
      };
    });
    
    // Filtrar inspecciones del año seleccionado y contar por mes
    inspections.forEach(inspection => {
      const date = new Date(inspection.inspectionDate || inspection.createdAt?.toDate?.() || new Date());
      if (date.getFullYear() === year) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].total++;
        }
      }
    });

    return Object.values(monthlyData);
  };

  const processPassFailData = (inspections, year) => {
    let passed = 0;
    let failed = 0;
    let inProgress = 0;
    
    // Filtrar inspecciones del año seleccionado
    inspections.forEach(inspection => {
      const date = new Date(inspection.inspectionDate || inspection.createdAt?.toDate?.() || new Date());
      if (date.getFullYear() === year) {
        const status = inspection.inspectionStatus || 'in-progress';
        if (status === 'pass') passed++;
        else if (status === 'reject') failed++;
        else inProgress++;
      }
    });

    return [
      { name: 'Passed', value: passed, fill: colors.success },
      { name: 'Failed', value: failed, fill: colors.danger },
      { name: 'In Progress', value: inProgress, fill: colors.warning }
    ];
  };

  const processSuppliersData = (inspections) => {
    const suppliers = {};
    
    inspections.forEach(inspection => {
      const supplier = inspection.supplierName || inspection.inspectionSite || 'Unknown';
      suppliers[supplier] = (suppliers[supplier] || 0) + 1;
    });

    return Object.entries(suppliers)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([name, value], index) => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        value,
        fill: colors.gradient[index % colors.gradient.length]
      }));
  };

  const processFamiliesData = (inspections) => {
    const families = {};
    
    inspections.forEach(inspection => {
      const family = inspection.componentFamily || 'Unknown';
      families[family] = (families[family] || 0) + 1;
    });

    return Object.entries(families)
      .sort(([,a], [,b]) => b - a)
      .map(([name, value], index) => ({
        name,
        value,
        fill: colors.gradient[index % colors.gradient.length]
      }));
  };

  const processComponentsData = (inspections) => {
    const components = {};
    
    inspections.forEach(inspection => {
      const component = inspection.componentName || inspection.componentCode || 'Unknown';
      components[component] = (components[component] || 0) + 1;
    });

    return Object.entries(components)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        value
      }));
  };

  const processCoatingsData = (inspections) => {
    const coatingsByFamily = {};
    
    inspections.forEach(inspection => {
      if (inspection.meanCoating && !isNaN(parseFloat(inspection.meanCoating))) {
        const family = inspection.componentFamily || 'Unknown';
        if (!coatingsByFamily[family]) {
          coatingsByFamily[family] = [];
        }
        coatingsByFamily[family].push(parseFloat(inspection.meanCoating));
      }
    });

    return Object.entries(coatingsByFamily).map(([family, coatings]) => ({
      family,
      avgCoating: coatings.reduce((a, b) => a + b, 0) / coatings.length,
      minCoating: Math.min(...coatings),
      maxCoating: Math.max(...coatings),
      count: coatings.length
    }));
  };

  const processTrendsData = (inspections) => {
    const monthlyTrends = {};
    
    inspections.forEach(inspection => {
      const date = new Date(inspection.inspectionDate || inspection.createdAt?.toDate?.() || new Date());
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyTrends[monthKey]) {
        monthlyTrends[monthKey] = { month: monthKey, passed: 0, total: 0 };
      }
      
      monthlyTrends[monthKey].total++;
      if (inspection.inspectionStatus === 'pass') monthlyTrends[monthKey].passed++;
    });

    return Object.values(monthlyTrends)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12)
      .map(data => ({
        ...data,
        passRate: data.total > 0 ? (data.passed / data.total * 100) : 0
      }));
  };

  const processWeeklyData = (inspections) => {
    const weeklyData = {};
    const currentDate = new Date();
    
    // Generar últimas 8 semanas
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(currentDate);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekKey = `Week ${8 - i}`;
      weeklyData[weekKey] = { week: weekKey, inspections: 0 };
    }

    inspections.forEach(inspection => {
      const date = new Date(inspection.inspectionDate || inspection.createdAt?.toDate?.() || new Date());
      const weeksAgo = Math.floor((currentDate - date) / (7 * 24 * 60 * 60 * 1000));
      
      if (weeksAgo >= 0 && weeksAgo < 8) {
        const weekKey = `Week ${8 - weeksAgo}`;
        if (weeklyData[weekKey]) {
          weeklyData[weekKey].inspections++;
        }
      }
    });

    return Object.values(weeklyData);
  };

  const processStatusData = (inspections) => {
    const statusCount = {
      pass: 0,
      reject: 0,
      'in-progress': 0
    };

    inspections.forEach(inspection => {
      const status = inspection.inspectionStatus || 'in-progress';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    return [
      { name: 'Passed', value: statusCount.pass, fill: colors.success },
      { name: 'Failed', value: statusCount.reject, fill: colors.danger },
      { name: 'In Progress', value: statusCount['in-progress'], fill: colors.warning }
    ];
  };

  // Formatear números para display
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Componente KPI Card
  const KPICard = ({ title, value, icon: Icon, color, suffix = '' }) => (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ backgroundColor: `${color}20`, color }}>
        <Icon size={24} />
      </div>
      <div className="kpi-content">
        <div className="kpi-value">
          {typeof value === 'number' ? formatNumber(value.toFixed(1)) : value}{suffix}
        </div>
        <div className="kpi-title">{title}</div>
      </div>
    </div>
  );

  // Componente Chart Card
  const ChartCard = ({ title, subtitle, children, className = "" }) => (
    <div className={`chart-card ${className}`}>
      <div className="chart-header">
        <div>
          <h3 className="chart-title">{title}</h3>
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
        <button 
          className="refresh-btn"
          onClick={loadDashboardData}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={isRefreshing ? 'spinning' : ''} />
        </button>
      </div>
      <div className="chart-content">
        {children}
      </div>
    </div>
  );

  if (dashboardData.isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <Activity size={48} className="spinning" />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="dashboard-error">
        <XCircle size={48} />
        <h3>Error loading dashboard</h3>
        <p>{dashboardData.error}</p>
        <button onClick={loadDashboardData} className="retry-btn">
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>📊 Inspections Analytics Dashboard</h1>
        <p>Real-time insights from Firebase Firestore</p>
        <div className="header-badges">
          <span className="live-badge">
            🔄 Live Data
          </span>
          <span className="update-badge">
            📈 Auto-refresh
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpis-grid">
        <KPICard
          title="Total Inspections"
          value={dashboardData.kpis.totalInspections}
          icon={BarChart3}
          color={colors.primary}
        />
        <KPICard
          title="Active Suppliers"
          value={dashboardData.kpis.activeSuppliers}
          icon={Factory}
          color={colors.secondary}
        />
        <KPICard
          title="Pass Rate"
          value={dashboardData.kpis.passRate}
          icon={CheckCircle}
          color={colors.success}
          suffix="%"
        />
        <KPICard
          title="Avg Coating"
          value={dashboardData.kpis.avgCoating}
          icon={Gauge}
          color={colors.accent}
          suffix="μm"
        />
      </div>

      {/* Timeline Chart con selector de año */}
      <ChartCard 
        title={`📅 Inspections by Month - ${selectedYear}`} 
        subtitle="Monthly inspection volume for selected year"
        className="timeline-chart"
      >
        <div className="year-selector-container">
          <label className="year-selector-label">Select Year:</label>
          <select 
            className="year-selector"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {availableYears.length > 0 ? (
              availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))
            ) : (
              <option value={selectedYear}>{selectedYear}</option>
            )}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dashboardData.timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#f1f5f9'
              }}
            />
            <Bar dataKey="total" fill={colors.primary} name="Total Inspections" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Pass/Fail Chart */}
        <ChartCard title={`✅ Pass/Fail Distribution - ${selectedYear}`} subtitle="Inspection results for selected year">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dashboardData.passFailData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value, percent }) => value > 0 ? `${name}: ${value} (${(percent * 100).toFixed(1)}%)` : ''}
              >
                {dashboardData.passFailData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        {/* Suppliers Chart */}
        <ChartCard title="🏭 Top Suppliers" subtitle="Inspection distribution">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dashboardData.suppliersData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {dashboardData.suppliersData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Component Families */}
        <ChartCard title="🔧 Component Families" subtitle="By category breakdown">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dashboardData.familiesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Bar dataKey="value" fill={colors.secondary} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Components */}
        <ChartCard title="⚙️ Top Components" subtitle="Most inspected items">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dashboardData.componentsData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Bar dataKey="value" fill={colors.accent} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Coating Analysis */}
        <ChartCard title="🎨 Coating Analysis" subtitle="Average thickness by family">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dashboardData.coatingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="family" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Bar dataKey="avgCoating" fill={colors.warning} name="Avg Coating (μm)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Wide Charts */}
      <div className="wide-charts">
        {/* Quality Trends */}
        <ChartCard 
          title="📈 Quality Trends" 
          subtitle="Pass rate over time"
          className="trends-chart"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardData.trendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="passRate" 
                stroke={colors.success} 
                fill={`${colors.success}40`} 
                name="Pass Rate (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Weekly Performance */}
        <ChartCard 
          title="📊 Weekly Performance" 
          subtitle="Last 8 weeks inspection volume"
          className="weekly-chart"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="week" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="inspections" 
                stroke={colors.primary} 
                strokeWidth={3}
                dot={{ fill: colors.primary, strokeWidth: 2, r: 6 }}
                name="Inspections"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Status Distribution */}
      <ChartCard 
        title="✅ Status Distribution" 
        subtitle="Current inspection status breakdown"
        className="status-chart"
      >
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={dashboardData.statusData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
            >
              {dashboardData.statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#f1f5f9'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <style jsx>{`
        .dashboard-container {
          display: grid;
          gap: 24px;
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
          grid-template-columns: 1fr;
        }

        .dashboard-header {
          background: linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #be185d 100%);
          color: white;
          padding: 32px;
          border-radius: 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .dashboard-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: shimmer 3s infinite;
        }

        .dashboard-header h1 {
          font-size: 2.5rem;
          margin-bottom: 8px;
          font-weight: 700;
        }

        .dashboard-header p {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 16px;
        }

        .header-badges {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .live-badge, .update-badge {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          padding: 8px 16px;
          border-radius: 24px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid rgba(52, 211, 153, 0.3);
          backdrop-filter: blur(10px);
        }

        .kpis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .kpi-card {
          background: rgba(15, 23, 42, 0.7);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s ease;
        }

        .kpi-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
          background: rgba(15, 23, 42, 0.8);
        }

        .kpi-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpi-content {
          flex: 1;
        }

        .kpi-value {
          font-size: 2rem;
          font-weight: bold;
          color: #f1f5f9;
          margin-bottom: 4px;
        }

        .kpi-title {
          font-size: 0.9rem;
          color: #94a3b8;
        }

        .timeline-chart {
          grid-column: 1 / -1;
        }

        .year-selector-container {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding: 12px 16px;
          background: rgba(30, 41, 59, 0.6);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .year-selector-label {
          font-size: 0.9rem;
          color: #cbd5e1;
          font-weight: 500;
        }

        .year-selector {
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(15, 23, 42, 0.8);
          color: #f1f5f9;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .year-selector:focus {
          outline: none;
          border-color: #60a5fa;
          box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
        }

        .year-selector:hover {
          background: rgba(15, 23, 42, 0.9);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .wide-charts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }

        .chart-card {
          background: rgba(15, 23, 42, 0.7);
          border-radius: 20px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          transition: all 0.3s ease;
        }

        .chart-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chart-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 4px;
        }

        .chart-subtitle {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .refresh-btn {
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #60a5fa;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover {
          background: rgba(59, 130, 246, 0.3);
          transform: translateY(-1px);
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .chart-content {
          height: 100%;
        }

        .dashboard-loading, .dashboard-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: #94a3b8;
          gap: 16px;
        }

        .loading-spinner {
          text-align: center;
        }

        .retry-btn {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .retry-btn:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 16px;
            gap: 16px;
          }

          .dashboard-header h1 {
            font-size: 2rem;
          }

          .kpis-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }

          .wide-charts {
            grid-template-columns: 1fr;
          }

          .header-badges {
            flex-wrap: wrap;
          }

          .year-selector-container {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .year-selector {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;