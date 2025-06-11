// src/components/non-conformity/layout/NonConformitySidebar.jsx
import React from 'react';
import { useNonConformity } from '../../../context/NonConformityContext';
import { useAuth } from '../../../context/AuthContext'; // ✅ IMPORTAR AUTH

const NonConformitySidebar = () => {
  const { state, dispatch, helpers } = useNonConformity();
  const { activeTab, metrics } = state;
  
  // ✅ 1. DETECTAR USUARIO REAL LOGUEADO
  const { currentUser } = useAuth();
  const userRole = currentUser?.role || 'unknown';
  const displayName = currentUser?.displayName || 'Unknown User';
  
  // ✅ 2. VERIFICAR SI ES ADMIN PARA MANAGEMENT
  const isAdmin = currentUser?.role === 'admin';

  // Handle tab change with permission validation
  const handleTabChange = (tab) => {
    // ✅ 3. BLOQUEAR MANAGEMENT PARA NO-ADMIN
    if (tab === 'dashboard' || tab === 'database' || tab === 'analytics') {
      if (!isAdmin) {
        console.log(`🚫 Access denied to ${tab} - Admin access required`);
        return;
      }
    }

    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };

  // Check if a tab is accessible for current user
  const isTabAccessible = (tab) => {
    // ✅ BLOQUEAR Management para no-Admin
    if (tab === 'dashboard' || tab === 'database' || tab === 'analytics') {
      return isAdmin;
    }
    return true; // Otras tabs siempre accesibles
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
        {/* ✅ 4. ICONOS CORRECTAMENTE ALINEADOS */}
        {/* Create NC */}
        <div 
          className={`nc-nav-item ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => handleTabChange('create')}
        >
          <span className="nc-nav-icon">➕</span>
          <span className="nc-nav-text">New NC</span>
          {activeTab === 'create' && <div className="nc-nav-indicator"></div>}
        </div>
        
        {/* Tracking */}
        <div 
          className={`nc-nav-item ${activeTab === 'tracking' ? 'active' : ''}`}
          onClick={() => handleTabChange('tracking')}
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
          className={`nc-nav-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => handleTabChange('history')}
        >
          <span className="nc-nav-icon">📚</span>
          <span className="nc-nav-text">History</span>
          {activeTab === 'history' && <div className="nc-nav-indicator"></div>}
        </div>
      </div>

      {/* ✅ 5. MANAGEMENT SECTION - SOLO VISIBLE PARA ADMIN */}
      {isAdmin && (
        <>
          <div className="nc-sidebar-divider nc-admin-divider"></div>
          
          <div className="nc-sidebar-section-title nc-admin-section-title">
            <span className="nc-admin-icon">🔧</span>
            <span>Management</span>
          </div>
          
          <div className="nc-sidebar-nav">
            {/* Dashboard */}
            <div 
              className={`nc-nav-item nc-admin-item ${activeTab === 'dashboard' ? 'nc-admin-active' : ''}`}
              onClick={() => handleTabChange('dashboard')}
            >
              <span className="nc-nav-icon">📊</span>
              <span className="nc-nav-text">Dashboard</span>
              {activeTab === 'dashboard' && <div className="nc-nav-indicator nc-admin-indicator"></div>}
            </div>
            
            {/* Database */}
            <div 
              className={`nc-nav-item nc-admin-item ${activeTab === 'database' ? 'nc-admin-active' : ''}`}
              onClick={() => handleTabChange('database')}
            >
              <span className="nc-nav-icon">🗄️</span>
              <span className="nc-nav-text">Database</span>
              <span className="nc-nav-badge nc-admin-badge">{state.ncList.length}</span>
              {activeTab === 'database' && <div className="nc-nav-indicator nc-admin-indicator"></div>}
            </div>
            
            {/* Analytics */}
            <div 
              className={`nc-nav-item nc-admin-item ${activeTab === 'analytics' ? 'nc-admin-active' : ''}`}
              onClick={() => handleTabChange('analytics')}
            >
              <span className="nc-nav-icon">📈</span>
              <span className="nc-nav-text">Analytics</span>
              {activeTab === 'analytics' && <div className="nc-nav-indicator nc-admin-indicator"></div>}
            </div>
          </div>
        </>
      )}

      {/* User Info Section */}
      <div className="nc-sidebar-footer">
        <div className="nc-sidebar-divider"></div>
        
        <div className="nc-user-info">
          <div className="nc-user-role-section">
            <span className="nc-user-role-label">Current Role:</span>
            {/* ✅ 6. MOSTRAR USUARIO REAL LOGUEADO */}
            <span className={`nc-user-role-value nc-role-${userRole}`}>
              {displayName}
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

      {/* ✅ 7. ESTILOS ACTUALIZADOS CON TRANSPARENCIA */}
      <style jsx>{`
        .nc-sidebar {
          width: 250px;
          /* ✅ TRANSPARENCIA PARA VER FONDO */
          background-color: rgba(0, 95, 131, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 2px 0 15px rgba(0, 0, 0, 0.3);
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 100;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nc-sidebar-header {
          padding: 1.5rem 1.5rem 1rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nc-company-logo-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .nc-company-logo {
          height: 50px;
          filter: brightness(1.2) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .nc-sidebar-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
          margin: 0.75rem 1rem;
        }

        .nc-admin-divider {
          background: linear-gradient(to right, transparent, rgba(255, 161, 86, 0.3), transparent);
        }

        .nc-sidebar-section-title {
          padding: 0.75rem 1.5rem 0.5rem 1.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nc-admin-section-title {
          color: rgba(255, 161, 86, 0.9);
        }

        .nc-admin-icon {
          font-size: 14px;
        }

        .nc-sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0 1rem;
        }

        .nc-nav-item {
          /* ✅ ICONOS CORRECTAMENTE ALINEADOS */
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          position: relative;
          min-height: 44px; /* ✅ ALTURA MÍNIMA PARA ALINEACIÓN */
        }

        .nc-nav-item:hover:not(.disabled) {
          background-color: rgba(255, 255, 255, 0.15);
          color: white;
          transform: translateX(2px);
        }

        .nc-nav-item.active {
          background-color: rgba(255, 255, 255, 0.25);
          color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          font-weight: 600;
          border-left: 3px solid white;
        }

        .nc-nav-item.disabled {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
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
          background-color: rgba(255, 161, 86, 0.25);
          color: rgba(255, 161, 86, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          font-weight: 600;
          border-left: 3px solid rgba(255, 161, 86, 1);
        }

        .nc-nav-icon {
          font-size: 18px;
          min-width: 20px;
          text-align: center; /* ✅ CENTRAR ICONOS */
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nc-nav-text {
          flex: 1;
          text-align: left;
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

        .nc-nav-indicator {
          position: absolute;
          right: -1rem;
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
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .nc-user-role-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .nc-user-role-value {
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.35rem 0.6rem;
          border-radius: 6px;
          text-align: center;
        }

        .nc-role-admin {
          background: rgba(236, 72, 153, 0.3);
          color: rgba(236, 72, 153, 1);
          border: 1px solid rgba(236, 72, 153, 0.5);
        }

        .nc-role-manager {
          background: rgba(255, 161, 86, 0.3);
          color: rgba(255, 161, 86, 1);
          border: 1px solid rgba(255, 161, 86, 0.5);
        }

        .nc-role-inspect1, .nc-role-inspect2, .nc-role-inspect3, .nc-role-inspect4, .nc-role-inspect5 {
          background: rgba(66, 153, 225, 0.3);
          color: rgba(66, 153, 225, 1);
          border: 1px solid rgba(66, 153, 225, 0.5);
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