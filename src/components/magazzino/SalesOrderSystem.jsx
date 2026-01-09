// src/components/magazzino/SalesOrderSystem.jsx
import React, { useState, useEffect } from 'react';
import {
  Package,
  Upload,
  List,
  AlertCircle,
  ClipboardList,
  TrendingUp,
  Clock,
  Activity,
  CheckCircle,
  PlayCircle
} from 'lucide-react';
import CreateSalesOrder from './CreateSalesOrder';
import ActiveOrders from './ActiveOrders';
import { getSalesOrderStats } from '../../firebase/salesOrderService';
import BackButton from '../common/BackButton';
import '../../styles/salesOrders.css';

const SalesOrderSystem = ({ onBack }) => {
  const [activeView, setActiveView] = useState('active-orders');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdueOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const orderStats = await getSalesOrderStats();
      setStats(orderStats);
      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === 'active-orders') {
      loadStats();
    }
  };

  const handleOrderCreated = () => {
    console.log('Order created successfully');
    loadStats();
    // Auto switch to active orders after 2 seconds
    setTimeout(() => setActiveView('active-orders'), 2000);
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'active-orders': return 'Active Orders';
      case 'create-order': return 'Create New Order';
      default: return 'Active Orders';
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
              📋 Sales Orders
            </div>

            <div
              className={`wms-nav-item ${activeView === 'active-orders' ? 'wms-active' : ''}`}
              onClick={() => handleViewChange('active-orders')}
            >
              <span className="wms-nav-icon">📦</span>
              <span className="wms-nav-text">Active Orders</span>
              <span className="wms-nav-badge">{stats.pending + stats.inProgress}</span>
              {activeView === 'active-orders' && <div className="wms-nav-indicator"></div>}
            </div>

            <div
              className={`wms-nav-item ${activeView === 'create-order' ? 'wms-active' : ''}`}
              onClick={() => handleViewChange('create-order')}
            >
              <span className="wms-nav-icon">➕</span>
              <span className="wms-nav-text">Create New Order</span>
              {activeView === 'create-order' && <div className="wms-nav-indicator"></div>}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="wms-main-content">
          <div className="wms-content-header">
            <div className="wms-header-info">
              <h1 className="wms-main-title">Sales Order Management</h1>
              <div className="wms-breadcrumb">
                Warehouse Management → Sales Orders → {getViewTitle()}
              </div>
            </div>
            <div className="wms-header-actions">
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
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          <div className="wms-panel-container">
            {/* Active Orders View */}
            {activeView === 'active-orders' && (
              <>
                {loading ? (
                  <div className="wms-panel-card">
                    <div className="wms-loading-state">
                      <Activity size={64} />
                      <h3>Loading Orders...</h3>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Stats Cards */}
                    <div className="wms-stats-container">
                      <div className="wms-stat-card">
                        <div className="wms-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                          <ClipboardList size={32} style={{ color: '#0077a2' }} />
                        </div>
                        <div>
                          <div className="wms-stat-value">{stats.total}</div>
                          <div className="wms-stat-label">Total Orders</div>
                        </div>
                      </div>

                      <div className="wms-stat-card">
                        <div className="wms-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                          <Clock size={32} style={{ color: '#f59e0b' }} />
                        </div>
                        <div>
                          <div className="wms-stat-value">{stats.pending}</div>
                          <div className="wms-stat-label">Pending</div>
                        </div>
                      </div>

                      <div className="wms-stat-card">
                        <div className="wms-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                          <PlayCircle size={32} style={{ color: '#10b981' }} />
                        </div>
                        <div>
                          <div className="wms-stat-value">{stats.inProgress}</div>
                          <div className="wms-stat-label">In Progress</div>
                        </div>
                      </div>

                      <div className="wms-stat-card">
                        <div className="wms-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                          <AlertCircle size={32} style={{ color: '#ef4444' }} />
                        </div>
                        <div>
                          <div className="wms-stat-value">{stats.overdueOrders}</div>
                          <div className="wms-stat-label">Overdue</div>
                        </div>
                      </div>
                    </div>

                    {/* Active Orders Cards */}
                    <ActiveOrders onOrderUpdate={loadStats} />
                  </>
                )}
              </>
            )}

            {/* Create Order View */}
            {activeView === 'create-order' && (
              <CreateSalesOrder onOrderCreated={handleOrderCreated} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderSystem;
