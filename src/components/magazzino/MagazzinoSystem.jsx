// src/components/magazzino/MagazzinoSystem.jsx
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Upload, 
  List, 
  AlertCircle, 
  Smartphone,
  TrendingUp,
  Database,
  Activity,
  Clock
} from 'lucide-react';
import ImportExcel from './ImportExcel';
import MovimentiRegistry from './MovimentiRegistry';
import DashboardTable from './DashboardTable';
import { getDashboardStats, getArticoliStockBasso } from '../../firebase/magazzinoService';
import BackButton from '../common/BackButton';
import '../../styles/magazzino.css';

const MagazzinoSystem = ({ onBack }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [stats, setStats] = useState({
    totale_articoli: 0,
    movimenti_oggi: 0,
    allarmi_attivi: 0,
    articoli_zero_stock: 0,
    ultima_sincronizzazione: null,
    categorie: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

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

  const handleImportComplete = (result) => {
    console.log('Import completed:', result);
    loadStats();
    // Auto switch to dashboard after 2 seconds
    setTimeout(() => setActiveView('dashboard'), 2000);
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard';
      case 'import': return 'Import from SAP';
      case 'movements': return 'Movement Registry';
      case 'mobile': return 'Mobile App';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="warehouse-wrapper">
      <div className="wms-app-container">
        {/* Sidebar */}
        <div className="wms-sidebar">
          {onBack && (
            <div className="wms-back-button-wrapper">
              <BackButton onClick={onBack} />
            </div>
          )}
          
          <div className="wms-sidebar-header">
            <div className="wms-company-logo-container">
              <img 
                src="/images/logo2.png" 
                alt="Company Logo" 
                className="wms-company-logo"
              />
            </div>
          </div>

          <div className="wms-sidebar-divider"></div>

          <nav className="wms-sidebar-nav">
            <div className="wms-sidebar-section-title">
              📦 Warehouse Management
            </div>

            <div 
              className={`wms-nav-item ${activeView === 'dashboard' ? 'wms-active' : ''}`}
              onClick={() => handleViewChange('dashboard')}
            >
              <span className="wms-nav-icon">📊</span>
              <span className="wms-nav-text">Dashboard</span>
              {activeView === 'dashboard' && <div className="wms-nav-indicator"></div>}
            </div>

            <div 
              className={`wms-nav-item ${activeView === 'import' ? 'wms-active' : ''}`}
              onClick={() => handleViewChange('import')}
            >
              <span className="wms-nav-icon">⬆️</span>
              <span className="wms-nav-text">Import from SAP</span>
              {activeView === 'import' && <div className="wms-nav-indicator"></div>}
            </div>

            <div 
              className={`wms-nav-item ${activeView === 'movements' ? 'wms-active' : ''}`}
              onClick={() => handleViewChange('movements')}
            >
              <span className="wms-nav-icon">📋</span>
              <span className="wms-nav-text">Movement Registry</span>
              <span className="wms-nav-badge">{stats.movimenti_oggi}</span>
              {activeView === 'movements' && <div className="wms-nav-indicator"></div>}
            </div>

            <div className="wms-sidebar-divider"></div>

            <div className="wms-sidebar-section-title">
              🔧 Tools
            </div>

            <div 
              className={`wms-nav-item ${activeView === 'mobile' ? 'wms-active' : ''}`}
              onClick={() => handleViewChange('mobile')}
            >
              <span className="wms-nav-icon">📱</span>
              <span className="wms-nav-text">Mobile App</span>
              {activeView === 'mobile' && <div className="wms-nav-indicator"></div>}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="wms-main-content">
          <div className="wms-content-header">
            <div className="wms-header-info">
              <h1 className="wms-main-title">Warehouse Management System</h1>
              <div className="wms-breadcrumb">
                Quality Management → Warehouse → {getViewTitle()}
              </div>
            </div>
            <div className="wms-header-actions">
              {stats.ultima_sincronizzazione && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: 'white'
                }}>
                  <Clock size={16} />
                  Last sync: {new Date(stats.ultima_sincronizzazione.toDate()).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          <div className="wms-panel-container">
            {/* Dashboard View */}
            {activeView === 'dashboard' && (
              <>
                {loading ? (
                  <div className="wms-panel-card">
                    <div className="wms-loading-state">
                      <Activity size={64} />
                      <h3>Loading Dashboard...</h3>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Stats Cards */}
                    <div className="wms-stats-container">
                      <div className="wms-stat-card">
                        <div className="wms-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                          <Database size={32} style={{ color: '#0077a2' }} />
                        </div>
                        <div>
                          <div className="wms-stat-value">{stats.totale_articoli}</div>
                          <div className="wms-stat-label">Total Articles</div>
                        </div>
                      </div>

                      <div className="wms-stat-card">
                        <div className="wms-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                          <Activity size={32} style={{ color: '#10b981' }} />
                        </div>
                        <div>
                          <div className="wms-stat-value">{stats.movimenti_oggi}</div>
                          <div className="wms-stat-label">Movements Today</div>
                        </div>
                      </div>

                      <div className="wms-stat-card">
                        <div className="wms-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                          <AlertCircle size={32} style={{ color: '#f59e0b' }} />
                        </div>
                        <div>
                          <div className="wms-stat-value">{stats.allarmi_attivi}</div>
                          <div className="wms-stat-label">Low Stock</div>
                        </div>
                      </div>

                      <div className="wms-stat-card">
                        <div className="wms-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                          <TrendingUp size={32} style={{ color: '#ef4444' }} />
                        </div>
                        <div>
                          <div className="wms-stat-value">{stats.articoli_zero_stock}</div>
                          <div className="wms-stat-label">Out of Stock</div>
                        </div>
                      </div>
                    </div>

                    {/* Full Inventory Table */}
                    <DashboardTable />
                  </>
                )}
              </>
            )}

            {/* Import View (includes LoadHistory inside) */}
            {activeView === 'import' && (
              <ImportExcel onImportComplete={handleImportComplete} />
            )}

            {/* Movement Registry View */}
            {activeView === 'movements' && (
              <MovimentiRegistry />
            )}

            {/* Mobile App View */}
            {activeView === 'mobile' && (
              <div className="wms-panel-card">
                <div className="wms-empty-state">
                  <Smartphone size={64} />
                  <h3>Mobile App Download</h3>
                  <p>Download the Android app to manage inventory with QR scanner</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagazzinoSystem;