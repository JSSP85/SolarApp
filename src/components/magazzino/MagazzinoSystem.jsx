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
import LoadHistory from './LoadHistory';
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
    // Automatically switch to dashboard to see results
    setTimeout(() => setActiveView('dashboard'), 1000);
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard';
      case 'import': return 'Import from SAP';
      case 'movements': return 'Movement Registry';
      case 'history': return 'Load History';
      case 'export': return 'Export for SAP';
      case 'mobile': return 'Mobile App';
      default: return 'Dashboard';
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
              className={`wms-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleViewChange('dashboard')}
            >
              <Package size={20} />
              <span>Dashboard</span>
            </div>

            <div 
              className={`wms-nav-item ${activeView === 'import' ? 'active' : ''}`}
              onClick={() => handleViewChange('import')}
            >
              <Upload size={20} />
              <span>Import from SAP</span>
            </div>

            <div 
              className={`wms-nav-item ${activeView === 'history' ? 'active' : ''}`}
              onClick={() => handleViewChange('history')}
            >
              <Clock size={20} />
              <span>Load History</span>
            </div>

            <div 
              className={`wms-nav-item ${activeView === 'movements' ? 'active' : ''}`}
              onClick={() => handleViewChange('movements')}
            >
              <List size={20} />
              <span>Movement Registry</span>
            </div>

            <div className="wms-sidebar-divider"></div>

            <div className="wms-sidebar-section-title">
              🔧 Tools
            </div>

            <div 
              className={`wms-nav-item ${activeView === 'mobile' ? 'active' : ''}`}
              onClick={() => handleViewChange('mobile')}
            >
              <Smartphone size={20} />
              <span>Mobile App</span>
            </div>
          </nav>

          {/* Stats Summary in Sidebar */}
          <div className="wms-sidebar-stats">
            <div className="wms-stat-card">
              <Database size={16} />
              <div>
                <div className="wms-stat-value">{stats.totale_articoli.toLocaleString()}</div>
                <div className="wms-stat-label">Total Articles</div>
              </div>
            </div>

            <div className="wms-stat-card">
              <Activity size={16} />
              <div>
                <div className="wms-stat-value">{stats.movimenti_oggi}</div>
                <div className="wms-stat-label">Today's Movements</div>
              </div>
            </div>

            <div className="wms-stat-card alert">
              <AlertCircle size={16} />
              <div>
                <div className="wms-stat-value">{stats.allarmi_attivi + stats.articoli_zero_stock}</div>
                <div className="wms-stat-label">Stock Alerts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="wms-main-content">
          <div className="wms-content-header">
            <h1 className="wms-content-title">{getViewTitle()}</h1>
            {stats.ultima_sincronizzazione && (
              <div className="wms-last-sync">
                <Clock size={14} />
                <span>Last sync: {formatDateTime(stats.ultima_sincronizzazione)}</span>
              </div>
            )}
          </div>

          <div className="wms-content-body">
            {/* Dashboard View */}
            {activeView === 'dashboard' && (
              <>
                {loading ? (
                  <div className="wms-panel-card">
                    <div className="wms-empty-state">
                      <Activity size={64} />
                      <h3>Loading Dashboard...</h3>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Stats Cards */}
                    <div className="wms-stats-grid">
                      <div className="wms-stat-card-large">
                        <div className="wms-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                          <Database size={32} style={{ color: '#0077a2' }} />
                        </div>
                        <div className="wms-stat-content">
                          <div className="wms-stat-value-large">{stats.totale_articoli.toLocaleString()}</div>
                          <div className="wms-stat-label-large">Total Articles in Database</div>
                        </div>
                      </div>

                      <div className="wms-stat-card-large">
                        <div className="wms-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                          <Activity size={32} style={{ color: '#10b981' }} />
                        </div>
                        <div className="wms-stat-content">
                          <div className="wms-stat-value-large">{stats.movimenti_oggi}</div>
                          <div className="wms-stat-label-large">Movements Today</div>
                        </div>
                      </div>

                      <div className="wms-stat-card-large">
                        <div className="wms-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                          <AlertCircle size={32} style={{ color: '#f59e0b' }} />
                        </div>
                        <div className="wms-stat-content">
                          <div className="wms-stat-value-large">{stats.allarmi_attivi}</div>
                          <div className="wms-stat-label-large">Low Stock Warnings</div>
                        </div>
                      </div>

                      <div className="wms-stat-card-large">
                        <div className="wms-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                          <TrendingUp size={32} style={{ color: '#ef4444' }} />
                        </div>
                        <div className="wms-stat-content">
                          <div className="wms-stat-value-large">{stats.articoli_zero_stock}</div>
                          <div className="wms-stat-label-large">Out of Stock</div>
                        </div>
                      </div>
                    </div>

                    {/* Full Inventory Table */}
                    <DashboardTable />

                    {/* Low Stock Alert (if any) */}
                    {lowStockArticles.length > 0 && (
                      <div className="wms-panel-card" style={{ marginTop: '2rem' }}>
                        <div className="wms-panel-header">
                          <h2 className="wms-panel-title">
                            <AlertCircle size={24} />
                            Critical Stock Alerts
                          </h2>
                          <p className="wms-panel-subtitle">
                            Articles requiring immediate attention
                          </p>
                        </div>
                        <div style={{ padding: '2rem' }}>
                          <div className="wms-table-container">
                            <table className="wms-table">
                              <thead>
                                <tr>
                                  <th>Code</th>
                                  <th>Description</th>
                                  <th>Category</th>
                                  <th>Current Stock</th>
                                  <th>Min Required</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {lowStockArticles.map(article => (
                                  <tr key={article.codice}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                      {article.codice}
                                    </td>
                                    <td>{article.descrizione}</td>
                                    <td>
                                      <span className="wms-badge">{article.categoria}</span>
                                    </td>
                                    <td style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700 }}>
                                      {article.giacenza_attuale_magazino}
                                    </td>
                                    <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                                      {article.giacenza_minima}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                      <span className={`wms-badge ${
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

            {/* Load History View */}
            {activeView === 'history' && (
              <LoadHistory />
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
                  <div style={{ 
                    marginTop: '2rem', 
                    padding: '1.5rem', 
                    background: '#f0f9ff',
                    borderRadius: '12px',
                    border: '2px solid #0077a2'
                  }}>
                    <p style={{ margin: 0, color: '#1e40af', fontSize: '0.95rem' }}>
                      <strong>📱 Coming Soon:</strong> React Native mobile app with QR code scanning capabilities for real-time inventory management
                    </p>
                  </div>
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