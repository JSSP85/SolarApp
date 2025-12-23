// src/components/magazzino/MagazzinoSystem.jsx
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Upload, 
  Download, 
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
  const [lowStockArticles, setLowStockArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load dashboard stats
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const dashboardStats = await getDashboardStats();
      const lowStock = await getArticoliStockBasso();
      
      setStats(dashboardStats);
      setLowStockArticles(lowStock.slice(0, 5));
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
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard';
      case 'import': return 'Import from SAP';
      case 'movements': return 'Movement Registry';
      case 'export': return 'Export for SAP';
      case 'mobile': return 'Mobile App';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="warehouse-wrapper">
      <div className="wms-app-container">
        {/* Sidebar */}
        <div className="wms-sidebar">
          {/* Back Button */}
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
              className={`wms-nav-item ${activeView === 'export' ? 'wms-active' : ''}`}
              onClick={() => handleViewChange('export')}
            >
              <span className="wms-nav-icon">⬇️</span>
              <span className="wms-nav-text">Export for SAP</span>
              {activeView === 'export' && <div className="wms-nav-indicator"></div>}
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
          {/* Header */}
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
                  Last sync: {new Date(stats.ultima_sincronizzazione).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="wms-panel-container">
            {/* Dashboard View */}
            {activeView === 'dashboard' && (
              <>
                {loading ? (
                  <div className="wms-loading-state">
                    <div className="wms-spinner"></div>
                    <p>Loading statistics...</p>
                  </div>
                ) : (
                  <>
                    {/* Stats Grid */}
                    <div className="wms-stats-container">
                      <div className="wms-stat-card">
                        <div className="wms-stat-icon primary">
                          <Database size={28} />
                        </div>
                        <div className="wms-stat-content">
                          <div className="wms-stat-value">{stats.totale_articoli.toLocaleString()}</div>
                          <div className="wms-stat-label">Total Articles</div>
                        </div>
                      </div>

                      <div className="wms-stat-card">
                        <div className="wms-stat-icon success">
                          <TrendingUp size={28} />
                        </div>
                        <div className="wms-stat-content">
                          <div className="wms-stat-value">{stats.movimenti_oggi}</div>
                          <div className="wms-stat-label">Movements Today</div>
                        </div>
                      </div>

                      <div className="wms-stat-card">
                        <div className="wms-stat-icon warning">
                          <AlertCircle size={28} />
                        </div>
                        <div className="wms-stat-content">
                          <div className="wms-stat-value">{stats.allarmi_attivi}</div>
                          <div className="wms-stat-label">Low Stock Alerts</div>
                        </div>
                      </div>

                      <div className="wms-stat-card">
                        <div className="wms-stat-icon info">
                          <Package size={28} />
                        </div>
                        <div className="wms-stat-content">
                          <div className="wms-stat-value">{stats.categorie}</div>
                          <div className="wms-stat-label">Categories</div>
                        </div>
                      </div>
                    </div>

                    {/* Low Stock Alerts */}
                    {lowStockArticles.length > 0 && (
                      <div className="wms-panel-card">
                        <div className="wms-panel-header">
                          <h2 className="wms-panel-title">
                            <AlertCircle size={24} />
                            Low Stock Alerts
                          </h2>
                          <p className="wms-panel-subtitle">
                            Articles requiring attention
                          </p>
                        </div>
                        <div style={{ padding: '2rem' }}>
                          <div className="wms-table-container">
                            <table className="wms-table">
                              <thead>
                                <tr>
                                  <th>Code</th>
                                  <th>Description</th>
                                  <th>Current Stock</th>
                                  <th>Minimum</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {lowStockArticles.map((article, idx) => (
                                  <tr key={idx}>
                                    <td>
                                      <code className="wms-article-code">{article.codice}</code>
                                    </td>
                                    <td style={{ maxWidth: '300px' }}>{article.descrizione}</td>
                                    <td>
                                      <strong style={{ 
                                        color: article.giacenza_attuale_magazino === 0 ? '#ef4444' : '#f59e0b' 
                                      }}>
                                        {article.giacenza_attuale_magazino}
                                      </strong>
                                    </td>
                                    <td>{article.giacenza_minima}</td>
                                    <td>
                                      <span className={`wms-alert-badge ${
                                        article.giacenza_attuale_magazino === 0 ? 'critical' : 'warning'
                                      }`}>
                                        {article.giacenza_attuale_magazino === 0 ? 'OUT OF STOCK' : 'LOW'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Import View */}
            {activeView === 'import' && (
              <ImportExcel onImportComplete={handleImportComplete} />
            )}

            {/* Movement Registry View */}
            {activeView === 'movements' && (
              <MovimentiRegistry />
            )}

            {/* Export View */}
            {activeView === 'export' && (
              <div className="wms-panel-card">
                <div className="wms-empty-state">
                  <Download size={64} />
                  <h3>Export for SAP Update</h3>
                  <p>This feature will be available soon</p>
                </div>
              </div>
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