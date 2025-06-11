// src/components/non-conformity/NonConformityApp.jsx - ACTUALIZADO
import React, { useEffect } from 'react';
import { NonConformityProvider, useNonConformity } from '../../context/NonConformityContext';
import { useAuth } from '../../context/AuthContext'; // ✅ IMPORTAR AUTH
import NonConformitySidebar from './layout/NonConformitySidebar';
import CreateNCPanel from './panels/CreateNCPanel';
import TrackingPanel from './panels/TrackingPanel';
import HistoryPanel from './panels/HistoryPanel';
import DashboardPanel from './panels/DashboardPanel';
import DatabasePanel from './panels/DatabasePanel';
import AnalyticsPanel from './panels/AnalyticsPanel';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import '../../styles/non-conformity.css';

// Main content component that handles rendering different panels
const NonConformityContent = () => {
  const { state, dispatch, helpers } = useNonConformity();
  const { activeTab, loading, error } = state;
  
  // ✅ OBTENER USUARIO ACTUAL
  const { currentUser } = useAuth();

  // Update metrics on component mount
  useEffect(() => {
    const metrics = helpers.calculateMetrics();
    // You can dispatch an action to update metrics if needed
  }, [helpers]);

  // Handle loading state
  if (loading) {
    return (
      <div className="nc-loading-container">
        <LoadingSpinner message="Loading Non-Conformity Management..." />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="nc-error-container">
        <ErrorMessage 
          message={error} 
          onRetry={() => dispatch({ type: 'CLEAR_ERROR' })} 
        />
      </div>
    );
  }

  // Render appropriate panel based on active tab
  const renderActivePanel = () => {
    switch (activeTab) {
      case 'create':
        return <CreateNCPanel />;
      
      case 'tracking':
        return <TrackingPanel />;
      
      case 'history':
        return <HistoryPanel />;
      
      case 'dashboard':
        return <DashboardPanel />;
      
      case 'database':
        return <DatabasePanel />;
      
      case 'analytics':
        return <AnalyticsPanel />;
      
      default:
        return <CreateNCPanel />;
    }
  };

  // Helper function to get breadcrumb title
  const getBreadcrumbTitle = (tab) => {
    const titles = {
      'create': 'Create New',
      'tracking': 'Tracking',
      'history': 'History',
      'dashboard': 'Dashboard',
      'database': 'Database',
      'analytics': 'Analytics'
    };
    return titles[tab] || 'Create New';
  };

  return (
    <div className="nc-app-container">
      {/* Sidebar Navigation */}
      <NonConformitySidebar />
      
      {/* Main Content Area */}
      <div className="nc-main-content">
        {/* ✅ CONTENT HEADER AZULADO */}
        <div className="nc-content-header-blue">
          <div className="nc-header-info">
            <h1 className="nc-main-title">Non-Conformity Management</h1>
            <div className="nc-breadcrumb">
              Quality Control → Non-Conformities → {getBreadcrumbTitle(activeTab)}
            </div>
          </div>
          
          {/* Quick Action Button */}
          <div className="nc-header-actions">
            {activeTab !== 'create' && (
              <button 
                className="nc-btn nc-btn-primary"
                onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'create' })}
              >
                <span className="nc-btn-icon">➕</span>
                Quick Create NC
              </button>
            )}
            
            {/* ✅ USER ROLE INDICATOR - MOSTRAR USUARIO REAL */}
            <div className="nc-user-role-indicator">
              <span className={`nc-role-badge nc-role-${currentUser?.role || 'unknown'}`}>
                {currentUser?.displayName || 'Unknown User'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Active Panel Content */}
        <div className="nc-panel-container">
          {renderActivePanel()}
        </div>
      </div>

      {/* ✅ ESTILOS ACTUALIZADOS PARA HEADER AZULADO */}
      <style jsx>{`
        .nc-content-header-blue {
          /* ✅ FONDO AZULADO SIMILAR AL PROYECTO */
          background: linear-gradient(135deg, rgba(0, 95, 131, 0.9) 0%, rgba(0, 119, 162, 0.85) 50%, rgba(0, 144, 198, 0.8) 100%);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 1.5rem 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 95, 131, 0.3);
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nc-header-info {
          flex: 1;
        }

        .nc-main-title {
          color: white;
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .nc-breadcrumb {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .nc-header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nc-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          text-decoration: none;
        }

        .nc-btn-primary {
          background: rgba(255, 255, 255, 0.9);
          color: rgba(0, 95, 131, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .nc-btn-primary:hover {
          background: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .nc-btn-icon {
          font-size: 16px;
        }

        .nc-user-role-indicator .nc-role-badge {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(5px);
        }

        .nc-role-admin {
          background: rgba(236, 72, 153, 0.2) !important;
          color: rgba(255, 182, 217, 1) !important;
          border: 1px solid rgba(236, 72, 153, 0.3) !important;
        }

        .nc-role-manager {
          background: rgba(255, 161, 86, 0.2) !important;
          color: rgba(255, 206, 154, 1) !important;
          border: 1px solid rgba(255, 161, 86, 0.3) !important;
        }

        .nc-role-inspect1, .nc-role-inspect2, .nc-role-inspect3, .nc-role-inspect4, .nc-role-inspect5 {
          background: rgba(66, 153, 225, 0.2) !important;
          color: rgba(147, 197, 253, 1) !important;
          border: 1px solid rgba(66, 153, 225, 0.3) !important;
        }
      `}</style>
    </div>
  );
};

// Main App Component with Provider
const NonConformityApp = ({ onBack }) => {
  return (
    <NonConformityProvider>
      <div className="non-conformity-wrapper">
        {/* Back Button to Main Menu */}
        {onBack && (
          <button 
            className="nc-back-to-menu"
            onClick={onBack}
            title="Back to Main Menu"
          >
            <span>←</span>
            <span>Back to Main Menu</span>
          </button>
        )}
        
        {/* Main Non-Conformity Application */}
        <NonConformityContent />
      </div>
    </NonConformityProvider>
  );
};

export default NonConformityApp;

// Export individual components for testing or standalone use
export { 
  NonConformityContent,
  CreateNCPanel,
  TrackingPanel,
  HistoryPanel,
  DashboardPanel,
  DatabasePanel,
  AnalyticsPanel
};