// src/components/layout/SidebarNav.jsx
import React from 'react';
import { useInspection } from '../../context/InspectionContext';
import { 
  Settings, 
  Clipboard, 
  FileText, 
  Database,
  BarChart,
  Shield
} from 'lucide-react';

const SidebarNav = () => {
  const { state, dispatch } = useInspection();
  const { activeTab, userRole } = state;
  
  const handleTabChange = (tab) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };
  
  return (
    <div 
      className="sidebar" 
      style={{ 
        color: 'white' 
      }}
    >
      <div className="sidebar-header">
        <div className="company-logo-container">
          <img 
            src="/images/logo.png" 
            alt="Valmont Solar Logo" 
            className="company-logo"
          />
        </div>
      </div>
      
      <div className="sidebar-divider"></div>
      
      <div className="sidebar-section-title">
        <span>Inspection</span>
      </div>
      
      <div className="sidebar-nav">
        <div 
          className={`nav-item ${activeTab === 'setup' ? 'active' : ''}`}
          onClick={() => handleTabChange('setup')}
        >
          <Settings size={20} />
          <span>Setup</span>
        </div>
        
        <div 
          className={`nav-item ${activeTab === 'inspection' ? 'active' : ''}`}
          onClick={() => handleTabChange('inspection')}
        >
          <Clipboard size={20} />
          <span>Inspection</span>
        </div>
        
        <div 
          className={`nav-item ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => handleTabChange('report')}
        >
          <FileText size={20} />
          <span>Report</span>
        </div>
      </div>
      
      {/* Admin section */}
      {userRole === 'admin' && (
        <>
          <div className="sidebar-divider admin-divider"></div>
          
          <div className="sidebar-section-title admin-section-title">
            <Shield size={16} className="mr-2" />
            <span>Admin</span>
          </div>
          
          <div className="sidebar-nav">
            <div 
              className={`nav-item admin-item ${activeTab === 'database' ? 'admin-active' : ''}`}
              onClick={() => handleTabChange('database')}
            >
              <Database size={20} />
              <span>Database</span>
            </div>
            
            <div 
              className={`nav-item admin-item ${activeTab === 'dashboard' ? 'admin-active' : ''}`}
              onClick={() => handleTabChange('dashboard')}
            >
              <BarChart size={20} />
              <span>Dashboard</span>
            </div>
          </div>
        </>
      )}

      {/* Estilos específicos con alta prioridad y posición corregida */}
      <style jsx>{`
        /* Selector altamente específico para la barra lateral */
        html body #root .app-container .sidebar,
        html body [data-reactroot] .sidebar,
        html body .sidebar,
        .sidebar {
          background-color: rgba(0, 95, 131, 0.35) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          box-shadow: 2px 0 15px rgba(0, 0, 0, 0.2) !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          bottom: 0 !important;
          width: 250px !important;
          z-index: 100 !important;
          margin: 0 !important;
          padding: 0 !important;
          border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        /* Asegurar que el contenido principal no se superponga con la barra lateral */
        body .main-content {
          margin-left: 250px !important;
        }

        .company-logo-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1.5rem;
        }

        .company-logo {
          max-width: 150px;
          max-height: 100px;
          object-fit: contain;
          filter: brightness(0) invert(1); /* Hacer el logo blanco */
        }

        .sidebar-header {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1.5rem;
        }
        
        /* Títulos de sección */
        .sidebar-section-title {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 0.5rem 1.5rem;
          font-weight: 600;
        }
        
        /* Estilo especial para sección de administrador */
        .admin-section-title {
          color: rgba(255, 161, 86, 0.9);
          display: flex;
          align-items: center;
        }
        
        .admin-divider {
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          background-color: rgba(255, 161, 86, 0.3) !important;
        }

        .sidebar-nav .nav-item {
          color: rgba(255, 255, 255, 0.8);
          transition: all 0.2s ease;
          padding: 0.75rem 1.25rem;
          margin: 0.25rem 0.5rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .sidebar-nav .nav-item:hover {
          background-color: rgba(255, 255, 255, 0.15);
          color: white;
        }

        .sidebar-nav .nav-item.active {
          background-color: rgba(255, 255, 255, 0.2);
          color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        /* Estilos para ítems de administrador */
        .sidebar-nav .nav-item.admin-item {
          color: rgba(255, 161, 86, 0.9);
          font-weight: 600;
          border-left: 3px solid rgba(255, 161, 86, 0.6);
        }
        
        .sidebar-nav .nav-item.admin-item:hover {
          background-color: rgba(255, 161, 86, 0.15);
          color: rgba(255, 161, 86, 1);
        }
        
        .sidebar-nav .nav-item.admin-active {
          background-color: rgba(255, 161, 86, 0.2);
          color: rgba(255, 161, 86, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          font-weight: 600;
          border-left: 3px solid rgba(255, 161, 86, 1);
        }

        .sidebar-divider {
          height: 1px;
          margin: 0.5rem 1rem;
          background-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default SidebarNav;