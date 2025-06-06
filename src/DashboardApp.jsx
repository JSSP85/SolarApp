// src/DashboardApp.jsx - USANDO AUTHCONTEXT PARA PERMISOS
import React, { useEffect } from 'react';
import { useInspection } from './context/InspectionContext';
import { useAuth } from './context/AuthContext'; // NUEVO: Usar AuthContext
import SidebarNav from './components/layout/SidebarNav';
import ContentHeader from './components/layout/ContentHeader';
import SetupForm from './components/setup/SetupForm'; 
import { InspectionPanelSistem } from './components/inspection';
import ReportViewDashboard from './components/report/ReportViewDashboard';
import DatabaseView from './components/database/DatabaseView';
import PhotoGallery from './components/gallery/PhotoGallery'; 

const DashboardApp = () => {
  const { state } = useInspection();
  const { currentUser } = useAuth(); // NUEVO: Obtener usuario desde AuthContext
  const { activeTab } = state;

  // SIMPLIFICADO: Verificar si el usuario es admin
  const isAdmin = () => {
    return currentUser && currentUser.role === 'admin';
  };

  // Efecto para aplicar estilos específicos de Steel Components
  useEffect(() => {
    const steelComponentsStyles = `
      .steel-components-wrapper {
        background: #f5f9fd url('/images/backgrounds/solar-background2.jpeg') center/cover fixed;
        min-height: 100vh;
        margin: 0;
        padding: 0;
        color: #2d3748;
      }
      
      .steel-components-wrapper #root {
        max-width: 1000px;
        width: 100%;
        margin: 0 auto;
        padding: 1rem;
        background: transparent;
        text-align: left;
        box-sizing: border-box;
      }
      
      .steel-components-wrapper .app-container {
        background: transparent;
      }
      
      .steel-components-wrapper .main-content {
        background: transparent;
        position: relative;
        z-index: 1;
        box-shadow: -8px 0 16px -6px rgba(0, 0, 0, 0.1);
      }
      
      .steel-components-wrapper .dashboard-card {
        background: rgba(242, 245, 250, 0.95);
        border: 1px solid rgba(203, 213, 225, 0.8);
        box-shadow: 0 8px 32px rgba(100, 116, 139, 0.2);
        border-radius: 12px;
        margin-bottom: 1.5rem;
        backdrop-filter: blur(10px);
      }
      
      .steel-components-wrapper .card-header {
        background: linear-gradient(to right, rgba(74, 111, 160, 0.95), rgba(111, 140, 182, 0.90));
        color: white;
        border-radius: 12px 12px 0 0;
        padding: 1.25rem 1.5rem;
        font-weight: 600;
      }
      
      .steel-components-wrapper .card-body {
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.98);
      }
      
      .steel-components-wrapper .cards-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-bottom: 2rem;
      }
      
      .steel-components-wrapper .form-control {
        background-color: rgba(255, 255, 255, 0.95);
        border: 2px solid rgba(180, 200, 220, 0.8);
        color: #334155;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        transition: all 0.3s ease;
      }
      
      .steel-components-wrapper .form-control::placeholder {
        color: #94a3b8;
      }
      
      .steel-components-wrapper .form-control:focus {
        border-color: #4a6fa0;
        box-shadow: 0 0 0 4px rgba(74, 111, 160, 0.15);
        background-color: rgba(255, 255, 255, 1);
        outline: none;
      }
      
      .steel-components-wrapper .form-label {
        color: #3d4a5c;
        font-weight: 600;
        margin-bottom: 0.75rem;
      }
      
      .steel-components-wrapper .btn-primary {
        background: linear-gradient(to right, #4a6fa0, #6b8bc3);
        border: none;
        color: white;
        font-weight: 600;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(74, 111, 160, 0.3);
        transition: all 0.3s ease;
      }
      
      .steel-components-wrapper .btn-primary:hover {
        background: linear-gradient(to right, #3e5d8a, #5a7ab3);
        box-shadow: 0 6px 20px rgba(74, 111, 160, 0.4);
        transform: translateY(-2px);
      }
      
      .steel-components-wrapper .btn-secondary {
        background: rgba(231, 237, 245, 0.95);
        border: 1px solid #b2c0d0;
        color: #3d4a5c;
        font-weight: 500;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        transition: all 0.3s ease;
      }
      
      .steel-components-wrapper .btn-secondary:hover {
        background: rgba(217, 226, 238, 0.95);
        transform: translateY(-1px);
      }
      
      .steel-components-wrapper .data-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        border-radius: 8px;
        overflow: hidden;
        background-color: rgba(255, 255, 255, 0.95);
        box-shadow: 0 4px 12px rgba(100, 116, 139, 0.15);
      }
      
      .steel-components-wrapper .data-table th {
        background-color: rgba(231, 237, 245, 0.95);
        color: #3d4a5c;
        font-weight: 600;
        text-align: left;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #d1dce8;
      }
      
      .steel-components-wrapper .data-table td {
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #e7edf5;
        color: #334155;
        background-color: rgba(248, 250, 253, 0.95);
      }
      
      .steel-components-wrapper .data-table tr:nth-child(even) td {
        background-color: rgba(248, 250, 253, 0.98);
      }
      
      .steel-components-wrapper .data-table tr:hover td {
        background-color: rgba(231, 237, 245, 0.95);
      }
      
      .steel-components-wrapper .sidebar {
        background: linear-gradient(180deg, #005F83 0%, #004666 100%);
        box-shadow: 2px 0 12px rgba(0, 95, 131, 0.2);
      }
      
      .steel-components-wrapper .report-section-title {
        color: #2d3748;
        font-weight: 600;
        border-bottom: 2px solid #d1dce8;
        padding-bottom: 0.75rem;
        margin-bottom: 1.5rem;
        position: relative;
      }
      
      .steel-components-wrapper .report-section-title::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -2px;
        width: 60px;
        height: 3px;
        background: linear-gradient(to right, #4a6fa0, #6b8bc3);
        border-radius: 2px;
      }
      
      .steel-components-wrapper .badge {
        display: inline-flex;
        align-items: center;
        padding: 0.375rem 0.875rem;
        border-radius: 50px;
        font-size: 0.875rem;
        font-weight: 600;
      }
      
      .steel-components-wrapper .badge-success {
        background-color: #d1fae5;
        color: #065f46;
      }
      
      .steel-components-wrapper .badge-danger {
        background-color: #fee2e2;
        color: #b91c1c;
      }
      
      .steel-components-wrapper .badge-info {
        background-color: #dbeafe;
        color: #1e40af;
      }
      
      .steel-components-wrapper .chart-container {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 12px rgba(100, 116, 139, 0.1);
        page-break-inside: avoid;
        height: auto;
        max-height: 70vh;
      }
      
      @media (max-width: 1024px) {
        .steel-components-wrapper #root {
          max-width: 95%;
          padding: 0.75rem;
        }
        
        .steel-components-wrapper .cards-grid-2 {
          grid-template-columns: 1fr;
        }
      }
      
      @media (max-width: 768px) {
        .steel-components-wrapper .main-content {
          padding: 0.5rem;
        }
        
        .steel-components-wrapper .dashboard-card {
          margin-bottom: 1rem;
        }
      }
    `;
    
    // Crear elemento de estilo específico
    const styleElement = document.createElement('style');
    styleElement.id = 'steel-components-styles';
    styleElement.textContent = steelComponentsStyles;
    document.head.appendChild(styleElement);
    
    // Verificar si la imagen existe
    const testImg = new Image();
    testImg.onload = () => {
      console.log('✅ Background image loaded successfully for Steel Components');
    };
    testImg.onerror = () => {
      console.error('❌ Background image failed to load for Steel Components');
    };
    testImg.src = '/images/backgrounds/solar-background2.jpeg';
    
    // Limpiar al desmontar el componente
    return () => {
      const element = document.getElementById('steel-components-styles');
      if (element) {
        document.head.removeChild(element);
      }
    };
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'setup':
        return 'Inspection Setup';
      case 'inspection':
        return 'Component Inspection';
      case 'report':
        return 'Inspection Report';
      case 'database':
        return 'Inspection Database';
      case 'gallery':
        return 'Photo Gallery';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="steel-components-wrapper">
      <div className="min-h-screen">
        <div className="app-container">
          <SidebarNav />
          
          <div className="main-content">
            <ContentHeader title={getPageTitle()} />
            
            <div className="p-4">
              {activeTab === 'setup' && <SetupForm />}
              {activeTab === 'inspection' && <InspectionPanelSistem />}
              {activeTab === 'report' && <ReportViewDashboard />}
              
              {/* Pestañas admin - Solo mostrar si es admin */}
              {activeTab === 'database' && isAdmin() && <DatabaseView />}
              {activeTab === 'gallery' && isAdmin() && <PhotoGallery />}
              {activeTab === 'dashboard' && isAdmin() && (
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3 className="card-title">Admin Dashboard</h3>
                  </div>
                  <div className="card-body">
                    <p>Dashboard content for administrators coming soon...</p>
                    <div style={{ 
                      background: '#f0f9ff', 
                      padding: '1rem', 
                      borderRadius: '8px',
                      border: '1px solid #bae6fd',
                      marginTop: '1rem'
                    }}>
                      <strong>User:</strong> {currentUser?.displayName}<br/>
                      <strong>Role:</strong> {currentUser?.role}<br/>
                      <strong>Permissions:</strong> {currentUser?.permissions?.join(', ')}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Mostrar mensaje de acceso denegado si el usuario no es admin pero intenta acceder a pestañas admin */}
              {(activeTab === 'database' || activeTab === 'gallery' || activeTab === 'dashboard') && !isAdmin() && (
                <div className="dashboard-card">
                  <div className="card-header" style={{background: 'linear-gradient(to right, #ef4444, #dc2626)'}}>
                    <h3 className="card-title" style={{color: 'white'}}>
                      Access Denied
                    </h3>
                  </div>
                  <div className="card-body">
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: '#6b7280'
                    }}>
                      <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                        You don't have permission to access this section.
                      </p>
                      <p>
                        This feature is only available for administrators.
                      </p>
                      <div style={{ 
                        background: '#fef2f2', 
                        padding: '1rem', 
                        borderRadius: '8px',
                        border: '1px solid #fecaca',
                        marginTop: '1rem'
                      }}>
                        <strong>Current User:</strong> {currentUser?.displayName}<br/>
                        <strong>Role:</strong> {currentUser?.role}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardApp;