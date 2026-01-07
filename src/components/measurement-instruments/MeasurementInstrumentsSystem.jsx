// src/components/measurement-instruments/MeasurementInstrumentsSystem.jsx
import React, { useState, useEffect } from 'react';
import {
  Gauge,
  Upload,
  Wrench,
  Bell,
  TrendingUp,
  AlertCircle,
  Activity,
  Clock
} from 'lucide-react';
import InstrumentDashboard from './InstrumentDashboard';
import InstrumentManagement from './InstrumentManagement';
import CalibrationAlerts from './CalibrationAlerts';
import { getDashboardStats } from '../../firebase/instrumentsService';
import BackButton from '../common/BackButton';
import '../../styles/measurement-instruments.css';

const MeasurementInstrumentsSystem = ({ onBack }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [stats, setStats] = useState({
    total_instruments: 0,
    category_a: 0,
    category_b: 0,
    category_c: 0,
    expired: 0,
    expiring_soon: 0,
    valid: 0,
    in_cabinets: 0,
    with_people: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadStats();
  }, [refreshKey]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);
      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === 'dashboard') {
      loadStats();
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    loadStats();
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard';
      case 'management': return 'Instrument Management';
      case 'alerts': return 'Calibration Alerts';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="instruments-wrapper">
      <div className="mims-app-container">
        {/* Sidebar */}
        <div className="mims-sidebar">
          {onBack && (
            <div className="mims-back-button-wrapper">
              <BackButton onClick={onBack} />
            </div>
          )}

          <div className="mims-sidebar-header">
            <div className="mims-company-logo-container">
              <img
                src="/images/logo2.png"
                alt="Company Logo"
                className="mims-company-logo"
              />
            </div>
          </div>

          <div className="mims-sidebar-divider"></div>

          <nav className="mims-sidebar-nav">
            <div className="mims-sidebar-section-title">
              📐 Measurement Instruments
            </div>

            <div
              className={`mims-nav-item ${activeView === 'dashboard' ? 'mims-active' : ''}`}
              onClick={() => handleViewChange('dashboard')}
            >
              <span className="mims-nav-icon">📊</span>
              <span className="mims-nav-text">Dashboard</span>
              {activeView === 'dashboard' && <div className="mims-nav-indicator"></div>}
            </div>

            <div
              className={`mims-nav-item ${activeView === 'management' ? 'mims-active' : ''}`}
              onClick={() => handleViewChange('management')}
            >
              <span className="mims-nav-icon">🔧</span>
              <span className="mims-nav-text">Instrument Management</span>
              {activeView === 'management' && <div className="mims-nav-indicator"></div>}
            </div>

            <div
              className={`mims-nav-item ${activeView === 'alerts' ? 'mims-active' : ''}`}
              onClick={() => handleViewChange('alerts')}
            >
              <span className="mims-nav-icon">🔔</span>
              <span className="mims-nav-text">Calibration Alerts</span>
              <span className="mims-nav-badge">{stats.expired + stats.expiring_soon}</span>
              {activeView === 'alerts' && <div className="mims-nav-indicator"></div>}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="mims-main-content">
          <div className="mims-content-header">
            <div className="mims-header-info">
              <h1 className="mims-main-title">
                <Gauge size={28} style={{ display: 'inline-block', marginRight: '0.5rem' }} />
                Measurement Instruments Management
              </h1>
              <div className="mims-breadcrumb">
                Quality Module / {getViewTitle()}
              </div>
            </div>
          </div>

          <div className="mims-content-body">
            {activeView === 'dashboard' && (
              <InstrumentDashboard key={refreshKey} stats={stats} onRefresh={handleRefresh} />
            )}
            {activeView === 'management' && (
              <InstrumentManagement onRefresh={handleRefresh} />
            )}
            {activeView === 'alerts' && (
              <CalibrationAlerts key={refreshKey} stats={stats} onRefresh={handleRefresh} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeasurementInstrumentsSystem;
