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
  Activity
} from 'lucide-react';
import ImportExcel from './ImportExcel';
import MovimentiRegistry from './MovimentiRegistry';
import { getDashboardStats, getArticoliStockBasso } from '../../firebase/magazzinoService';
import './MagazzinoSystem.css';

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
      setLowStockArticles(lowStock.slice(0, 5)); // Top 5 low stock items
      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  // Refresh stats when returning to dashboard or after import
  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === 'dashboard') {
      loadStats();
    }
  };

  const handleImportComplete = (result) => {
    console.log('Import completed:', result);
    loadStats(); // Refresh stats after import
  };

  return (
    <div className="magazzino-system">
      {/* Header */}
      <div className="magazzino-header">
        <div className="header-content">
          <div className="header-title-section">
            <Package size={40} className="header-icon" />
            <div>
              <h1>Warehouse Management System</h1>
              <p>Real-time inventory control and mobile integration</p>
            </div>
          </div>
          {onBack && (
            <button onClick={onBack} className="btn-back">
              ← Back to Menu
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="magazzino-tabs">
        <button 
          className={`tab-btn ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleViewChange('dashboard')}
        >
          <Activity size={20} />
          Dashboard
        </button>
        <button 
          className={`tab-btn ${activeView === 'import' ? 'active' : ''}`}
          onClick={() => handleViewChange('import')}
        >
          <Upload size={20} />
          Import SAP
        </button>
        <button 
          className={`tab-btn ${activeView === 'movements' ? 'active' : ''}`}
          onClick={() => handleViewChange('movements')}
        >
          <List size={20} />
          Movement Registry
        </button>
        <button 
          className={`tab-btn ${activeView === 'export' ? 'active' : ''}`}
          onClick={() => handleViewChange('export')}
        >
          <Download size={20} />
          Export for SAP
        </button>
        <button 
          className={`tab-btn ${activeView === 'mobile' ? 'active' : ''}`}
          onClick={() => handleViewChange('mobile')}
        >
          <Smartphone size={20} />
          Mobile App
        </button>
      </div>

      {/* Content Area */}
      <div className="magazzino-content">
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="dashboard-view">
            <h2 className="section-title">System Overview</h2>
            
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading statistics...</p>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="stats-grid">
                  <div className="stat-card primary">
                    <div className="stat-icon">
                      <Database size={32} />
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{stats.totale_articoli.toLocaleString()}</div>
                      <div className="stat-label">Total Articles</div>
                    </div>
                  </div>

                  <div className="stat-card success">
                    <div className="stat-icon">
                      <TrendingUp size={32} />
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{stats.movimenti_oggi}</div>
                      <div className="stat-label">Movements Today</div>
                    </div>
                  </div>

                  <div className="stat-card warning">
                    <div className="stat-icon">
                      <AlertCircle size={32} />
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{stats.allarmi_attivi}</div>
                      <div className="stat-label">Low Stock Alerts</div>
                    </div>
                  </div>

                  <div className="stat-card info">
                    <div className="stat-icon">
                      <Package size={32} />
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{stats.categorie}</div>
                      <div className="stat-label">Categories</div>
                    </div>
                  </div>
                </div>

                {/* Low Stock Alerts */}
                {lowStockArticles.length > 0 && (
                  <div className="alerts-section">
                    <h3 className="subsection-title">
                      <AlertCircle size={24} />
                      Low Stock Alerts
                    </h3>
                    <div className="alerts-grid">
                      {lowStockArticles.map((article, idx) => (
                        <div key={idx} className="alert-card">
                          <div className="alert-header">
                            <code className="alert-code">{article.codice}</code>
                            <span className={`alert-badge ${article.giacenza_attuale_magazino === 0 ? 'critical' : 'warning'}`}>
                              {article.giacenza_attuale_magazino === 0 ? 'OUT OF STOCK' : 'LOW'}
                            </span>
                          </div>
                          <p className="alert-description">{article.descrizione}</p>
                          <div className="alert-stats">
                            <span className="alert-stat">
                              Current: <strong className={article.giacenza_attuale_magazino === 0 ? 'text-critical' : 'text-warning'}>
                                {article.giacenza_attuale_magazino}
                              </strong>
                            </span>
                            <span className="alert-stat">
                              Minimum: <strong>{article.giacenza_minima}</strong>
                            </span>
                            <span className="alert-stat">
                              Needed: <strong className="text-success">
                                {Math.max(0, article.giacenza_minima - article.giacenza_attuale_magazino)}
                              </strong>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="quick-actions">
                  <h3 className="subsection-title">Quick Actions</h3>
                  <div className="actions-grid">
                    <button 
                      className="action-btn primary"
                      onClick={() => handleViewChange('import')}
                    >
                      <Upload size={24} />
                      <span>Import SAP Data</span>
                    </button>
                    <button 
                      className="action-btn success"
                      onClick={() => handleViewChange('movements')}
                    >
                      <List size={24} />
                      <span>View Movements</span>
                    </button>
                    <button 
                      className="action-btn info"
                      onClick={() => handleViewChange('mobile')}
                    >
                      <Smartphone size={24} />
                      <span>Download Mobile App</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
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
          <div className="export-view">
            <div className="coming-soon-card">
              <Download size={64} />
              <h2>Export for SAP</h2>
              <p>This feature will allow you to export warehouse movements to update SAP</p>
              <div className="coming-soon-badge">Coming Soon</div>
            </div>
          </div>
        )}

        {/* Mobile App View */}
        {activeView === 'mobile' && (
          <div className="mobile-view">
            <div className="coming-soon-card">
              <Smartphone size={64} />
              <h2>Mobile App Download</h2>
              <p>Download the Android app to manage inventory with QR scanner</p>
              <div className="coming-soon-badge">Coming Soon</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MagazzinoSystem;