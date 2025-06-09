// src/components/non-conformity/layout/NonConformitySidebar.jsx
import React from 'react';
import { useNonConformity } from '../../../context/NonConformityContext';

const NonConformitySidebar = () => {
  const { state, dispatch, helpers } = useNonConformity();
  const { activeTab, userRole, metrics } = state;

  // Handle tab change with permission validation
  const handleTabChange = (tab) => {
    // Check if user has permission to access this tab
    const requiredPermissions = {
      'create': 'create',
      'tracking': 'tracking', 
      'history': 'history',
      'dashboard': 'dashboard',
      'database': 'database',
      'analytics': 'analytics'
    };

    const permission = requiredPermissions[tab];
    
    // 🔧 ADMIN ACCESS: Si estás en NonConformity = eres Admin = acceso completo
    // No verificar permisos para dashboard, database, analytics
    if (tab === 'dashboard' || tab === 'database' || tab === 'analytics') {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
      return;
    }
    
    if (permission && !helpers.canAccess(permission)) {
      console.log(`🚫 Access denied to ${tab} for role: ${userRole}`);
      return;
    }

    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };

  // Check if a tab is accessible for current user
  const isTabAccessible = (tab) => {
    const requiredPermissions = {
      'create': 'create',
      'tracking': 'tracking',
      'history': 'history', 
      'dashboard': 'dashboard',
      'database': 'database',
      'analytics': 'analytics'
    };

    // 🔧 ADMIN ACCESS: Dashboard, Database y Analytics siempre accesibles
    if (tab === 'dashboard' || tab === 'database' || tab === 'analytics') {
      return true;
    }

    const permission = requiredPermissions[tab];
    return !permission || helpers.canAccess(permission);
  };

  return (
    <div className="nc-sidebar">
      {/* Company Logo */}
      <div className="nc-sidebar-header">
        <div className="nc-company-logo-container">
          <img 
            src="/images/logo.png" 
            alt="Valmont Solar Logo" 
            className="nc-company-logo"
          />
        </div>
      </div>
      
      <div className="nc-sidebar-divider"></div>
      
      {/* Main Non-Conformity Section */}
      <div className="nc-sidebar-section-title">
        <span>🔍 Non-Conformity</span>
      </div>
      
      <div className="nc-sidebar-nav">
        {/* Create NC */}
        <div 
          className={`nc-nav-item ${activeTab === 'create' ? 'active' : ''} ${!isTabAccessible('create') ? 'disabled' : ''}`}
          onClick={() => isTabAccessible('create') && handleTabChange('create')}
        >
          <span className="nc-nav-icon">➕</span>
          <span className="nc-nav-text">New NC</span>
          {activeTab === 'create' && <div className="nc-nav-indicator"></div>}
        </div>
        
        {/* Tracking */}
        <div 
          className={`nc-nav-item ${activeTab === 'tracking' ? 'active' : ''} ${!isTabAccessible('tracking') ? 'disabled' : ''}`}
          onClick={() => isTabAccessible('tracking') && handleTabChange('tracking')}
        >
          <span className="nc-nav-icon">📋</span>
          <span className="nc-nav-text">Tracking</span>
          {/* Show active NCs count */}
          {metrics.activeNCs > 0 && (
            <span className="nc-nav-badge">{metrics.activeNCs}</span>
          )}
          {activeTab === 'tracking' && <div className="nc-nav-indicator"></div>}
        </div>
        
        {/* History */}
        <div 
          className={`nc-nav-item ${activeTab === 'history' ? 'active' : ''} ${!isTabAccessible('history') ? 'disabled' : ''}`}
          onClick={() => isTabAccessible('history') && handleTabChange('history')}
        >
          <span className="nc-nav-icon">📚</span>
          <span className="nc-nav-text">History</span>
          {activeTab === 'history' && <div className="nc-nav-indicator"></div>}
        </div>
      </div>

      {/* Admin Management Section */}
      <div className="nc-sidebar-divider nc-admin-divider"></div>
      
      <div className="nc-sidebar-section-title nc-admin-section-title">
        <span className="nc-admin-icon">🔧</span>
        <span>Management</span>
      </div>
      
      <div className="nc-sidebar-nav">
        {/* Dashboard - SIN CANDADO */}
        <div 
          className={`nc-nav-item nc-admin-item ${activeTab === 'dashboard' ? 'nc-admin-active' : ''}`}
          onClick={() => handleTabChange('dashboard')}
        >
          <span className="nc-nav-icon">📊</span>
          <span className="nc-nav-text">Dashboard</span>
          {/* 🔧 REMOVED: Candado eliminado */}
          {activeTab === 'dashboard' && <div className="nc-nav-indicator nc-admin-indicator"></div>}
        </div>
        
        {/* Database - SIN CANDADO */}
        <div 
          className={`nc-nav-item nc-admin-item ${activeTab === 'database' ? 'nc-admin-active' : ''}`}
          onClick={() => handleTabChange('database')}
        >
          <span className="nc-nav-icon">🗄️</span>
          <span className="nc-nav-text">Database</span>
          {/* Show total NCs count */}
          <span className="nc-nav-badge nc-admin-badge">{state.ncList.length}</span>
          {/* 🔧 REMOVED: Candado eliminado */}
          {activeTab === 'database' && <div className="nc-nav-indicator nc-admin-indicator"></div>}
        </div>
        
        {/* Analytics - SIN CANDADO */}
        <div 
          className={`nc-nav-item nc-admin-item ${activeTab === 'analytics' ? 'nc-admin-active' : ''}`}
          onClick={() => handleTabChange('analytics')}
        >
          <span className="nc-nav-icon">📈</span>
          <span className="nc-nav-text">Analytics</span>
          {/* 🔧 REMOVED: Candado eliminado */}
          {activeTab === 'analytics' && <div className="nc-nav-indicator nc-admin-indicator"></div>}
        </div>
      </div>

      {/* User Info Section */}
      <div className="nc-sidebar-footer">
        <div className="nc-sidebar-divider"></div>
        
        <div className="nc-user-info">
          <div className="nc-user-role-section">
            <span className="nc-user-role-label">Current Role:</span>
            <span className={`nc-user-role-value nc-role-${userRole}`}>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
          </div>
          
          {/* Quick Stats */}
          <div className="nc-quick-stats">
            <div className="nc-stat-item">
              <span className="nc-stat-label">Active NCs:</span>
              <span className="nc-stat-value">{metrics.activeNCs}</span>
            </div>
            {metrics.criticalNCs > 0 && (
              <div className="nc-stat-item nc-critical">
                <span className="nc-stat-label">Critical:</span>
                <span className="nc-stat-value">{metrics.criticalNCs}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline Styles for Sidebar - Following Steel Components Pattern */}
      <style jsx>{`
        .nc-sidebar {
          width: 250px;
          background-color: rgba(0, 95, 131, 0.35);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 2px 0 15px rgba(0, 0, 0, 0.2);
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 100;
          color: white;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          overflow-y: auto;
        }

        .nc-company-logo-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1.5rem;
        }

        .nc-company-logo {
          max-width: 150px;
          max-height: 100px;
          object-fit: contain;
          filter: brightness(0) invert(1);
        }

        .nc-sidebar-divider {
          height: 1px;
          margin: 0.5rem 1rem;
          background-color: rgba(255, 255, 255, 0.2);
        }

        .nc-sidebar-section-title {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 0.5rem 1.5rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nc-admin-section-title {
          color: rgba(255, 161, 86, 0.9);
          display: flex;
          align-items: center;
        }

        .nc-admin-divider {
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          background-color: rgba(255, 161, 86, 0.3);
        }

        .nc-sidebar-nav .nc-nav-item {
          color: rgba(255, 255, 255, 0.8);
          transition: all 0.2s ease;
          padding: 0.75rem 1.25rem;
          margin: 0.25rem 0.5rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          position: relative;
        }

        .nc-nav-item:hover:not(.disabled) {
          background-color: rgba(255, 255, 255, 0.15);
          color: white;
        }

        .nc-nav-item.active {
          background-color: rgba(255, 255, 255, 0.2);
          color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .nc-nav-item.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .nc-nav-item.nc-admin-item {
          color: rgba(255, 161, 86, 0.9);
          font-weight: 600;
          border-left: 3px solid rgba(255, 161, 86, 0.6);
        }

        .nc-nav-item.nc-admin-item:hover:not(.disabled) {
          background-color: rgba(255, 161, 86, 0.15);
          color: rgba(255, 161, 86, 1);
        }

        .nc-nav-item.nc-admin-active {
          background-color: rgba(255, 161, 86, 0.2);
          color: rgba(255, 161, 86, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          font-weight: 600;
          border-left: 3px solid rgba(255, 161, 86, 1);
        }

        .nc-nav-icon {
          font-size: 18px;
          min-width: 20px;
        }

        .nc-nav-text {
          flex: 1;
        }

        .nc-nav-badge {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          min-width: 1.5rem;
          text-align: center;
        }

        .nc-admin-badge {
          background: rgba(255, 161, 86, 0.3);
          color: rgba(255, 161, 86, 1);
        }

        .nc-lock-icon {
          font-size: 14px;
          opacity: 0.7;
        }

        .nc-nav-indicator {
          position: absolute;
          right: -0.5rem;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: white;
          border-radius: 2px;
        }

        .nc-admin-indicator {
          background: rgba(255, 161, 86, 1);
        }

        .nc-sidebar-footer {
          margin-top: auto;
          padding-bottom: 1rem;
        }

        .nc-user-info {
          padding: 1rem 1.5rem;
        }

        .nc-user-role-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .nc-user-role-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .nc-user-role-value {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .nc-role-inspector {
          background: rgba(66, 153, 225, 0.3);
          color: rgba(66, 153, 225, 1);
        }

        .nc-role-manager {
          background: rgba(255, 161, 86, 0.3);
          color: rgba(255, 161, 86, 1);
        }

        .nc-role-admin {
          background: rgba(236, 72, 153, 0.3);
          color: rgba(236, 72, 153, 1);
        }

        .nc-quick-stats {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .nc-stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nc-stat-label {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .nc-stat-value {
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
        }

        .nc-stat-item.nc-critical .nc-stat-value {
          color: #ff6b6b;
        }

        @media (max-width: 768px) {
          .nc-sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
        }
      `}</style>
    </div>
  );
};

export default NonConformitySidebar;