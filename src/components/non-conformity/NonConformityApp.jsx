// src/components/non-conformity/NonConformityApp.jsx - Versión Original Completa
import React, { useEffect } from 'react';
import { NonConformityProvider, useNonConformity } from '../../context/NonConformityContext';
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
  const { activeTab, loading, error, userRole } = state;

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
        if (!helpers.canAccess('dashboard')) {
          return (
            <div className="nc-access-denied">
              <h3>🔒 Access Denied</h3>
              <p>You don't have permission to access the Dashboard. Manager or Admin role required.</p>
            </div>
          );
        }
        return <DashboardPanel />;
      
      case 'database':
        if (!helpers.canAccess('database')) {
          return (
            <div className="nc-access-denied">
              <h3>🔒 Access Denied</h3>
              <p>You don't have permission to access the Database. Manager or Admin role required.</p>
            </div>
          );
        }
        return <DatabasePanel />;
      
      case 'analytics':
        if (!helpers.canAccess('analytics')) {
          return (
            <div className="nc-access-denied">
              <h3>🔒 Access Denied</h3>
              <p>You don't have permission to access Analytics. Admin role required.</p>
            </div>
          );
        }
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
        {/* Content Header */}
        <div className="nc-content-header">
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
            
            {/* User Role Indicator */}
            <div className="nc-user-role-indicator">
              <span className={`nc-role-badge nc-role-${userRole}`}>
                {userRole.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Active Panel Content */}
        <div className="nc-panel-container">
          {renderActivePanel()}
        </div>
      </div>
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