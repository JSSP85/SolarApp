// src/DashboardApp.jsx - VERSIÓN FINAL CORREGIDA (basada en prueba exitosa)
import React, { useEffect } from 'react';
import { useInspection } from './context/InspectionContext';
import SidebarNav from './components/layout/SidebarNav';
import ContentHeader from './components/layout/ContentHeader';
import SetupForm from './components/setup/SetupForm'; 
import { InspectionPanelSistem } from './components/inspection';
import ReportViewDashboard from './components/report/ReportViewDashboard';
import DatabaseView from './components/database/DatabaseView';
import PhotoGallery from './components/gallery/PhotoGallery'; 

const DashboardApp = () => {
  const { state } = useInspection();
  const { activeTab, userRole } = state;

  // APLICAR LOS ESTILOS QUE FUNCIONARON EN LA PRUEBA DE CONSOLA
  useEffect(() => {
    const steelComponentsStylesFixed = `
      /* ESTILOS VERIFICADOS Y FUNCIONANDO - BASADOS EN PRUEBA EXITOSA */
      
      /* FORZAR TRANSPARENCIA TOTAL */
      body {
        background: #f5f9fd url('/images/backgrounds/solar-background2.jpeg') center/cover fixed !important;
        background-color: transparent !important;
        min-height: 100vh !important;
      }
      
      html {
        background-color: transparent !important;
      }
      
      #root {
        background: transparent !important;
        background-color: transparent !important;
      }
      
      /* STEEL COMPONENTS WRAPPER - TRANSPARENTE CON IMAGEN */
      .steel-components-wrapper {
        background: #f5f9fd url('/images/backgrounds/solar-background2.jpeg') center/cover fixed !important;
        min-height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        color: #2d3748 !important;
      }
      
      /* MAIN CONTENT - SIN FONDO BLANCO */
      .steel-components-wrapper .main-content {
        background: transparent !important;
        background-color: transparent !important;
        position: relative !important;
        z-index: 1 !important;
        margin-left: 240px !important;
        padding: 2rem !important;
      }
      
      /* APP CONTAINER - TRANSPARENTE */
      .steel-components-wrapper .app-container {
        background: transparent !important;
        background-color: transparent !important;
        min-height: 100vh !important;
        display: flex !important;
      }
      
      /* CONTENT HEADER - TRANSPARENTE */
      .steel-components-wrapper .content-header {
        background: transparent !important;
        background-color: transparent !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        margin-bottom: 2rem !important;
        padding: 1rem 0 !important;
      }
      
      /* CARDS MÁS TRANSPARENTES CON BACKDROP BLUR */
      .steel-components-wrapper .dashboard-card {
        background: rgba(255, 255, 255, 0.88) !important;
        backdrop-filter: blur(10px) !important;
        border: 1px solid rgba(203, 213, 225, 0.6) !important;
        box-shadow: 0 8px 32px rgba(100, 116, 139, 0.15) !important;
        border-radius: 12px !important;
        margin-bottom: 1.5rem !important;
      }
      
      .steel-components-wrapper .card-header {
        background: linear-gradient(to right, rgba(74, 111, 160, 0.90), rgba(111, 140, 182, 0.85)) !important;
        color: white !important;
        border-radius: 12px 12px 0 0 !important;
        padding: 1.25rem 1.5rem !important;
        font-weight: 600 !important;
      }
      
      .steel-components-wrapper .card-body {
        padding: 1.5rem !important;
        background: rgba(255, 255, 255, 0.95) !important;
      }
      
      /* QUITAR FONDOS BLANCOS DE DIVS GENÉRICOS - REGLA CLAVE */
      .steel-components-wrapper div:not(.sidebar):not(.dashboard-card):not(.card-body):not(.data-table):not(.chart-container) {
        background-color: transparent !important;
      }
      
      /* SIDEBAR MANTENER OPACO PARA FUNCIONALIDAD */
      .steel-components-wrapper .sidebar {
        background: linear-gradient(180deg, #005F83 0%, #004666 100%) !important;
        box-shadow: 2px 0 12px rgba(0, 95, 131, 0.2) !important;
        position: fixed !important;
        left: 0 !important;
        top: 0 !important;
        width: 240px !important;
        height: 100vh !important;
        z-index: 10 !important;
      }
      
      /* FORMULARIOS */
      .steel-components-wrapper .form-control {
        background-color: rgba(255, 255, 255, 0.95) !important;
        border: 2px solid rgba(180, 200, 220, 0.8) !important;
        color: #334155 !important;
        border-radius: 8px !important;
        padding: 0.75rem 1rem !important;
        transition: all 0.3s ease !important;
      }
      
      .steel-components-wrapper .form-control:focus {
        border-color: #4a6fa0 !important;
        box-shadow: 0 0 0 4px rgba(74, 111, 160, 0.15) !important;
        background-color: rgba(255, 255, 255, 1) !important;
        outline: none !important;
      }
      
      .steel-components-wrapper .form-label {
        color: #3d4a5c !important;
        font-weight: 600 !important;
        margin-bottom: 0.75rem !important;
      }
      
      /* BOTONES */
      .steel-components-wrapper .btn-primary {
        background: linear-gradient(to right, #4a6fa0, #6b8bc3) !important;
        border: none !important;
        color: white !important;
        font-weight: 600 !important;
        padding: 0.75rem 1.5rem !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 12px rgba(74, 111, 160, 0.3) !important;
        transition: all 0.3s ease !important;
      }
      
      .steel-components-wrapper .btn-primary:hover {
        background: linear-gradient(to right, #3e5d8a, #5a7ab3) !important;
        box-shadow: 0 6px 20px rgba(74, 111, 160, 0.4) !important;
        transform: translateY(-2px) !important;
      }
      
      .steel-components-wrapper .btn-secondary {
        background: rgba(231, 237, 245, 0.95) !important;
        border: 1px solid #b2c0d0 !important;
        color: #3d4a5c !important;
        font-weight: 500 !important;
        padding: 0.75rem 1.5rem !important;
        border-radius: 8px !important;
        transition: all 0.3s ease !important;
      }
      
      /* TABLAS */
      .steel-components-wrapper .data-table {
        width: 100% !important;
        border-collapse: separate !important;
        border-spacing: 0 !important;
        border-radius: 8px !important;
        overflow: hidden !important;
        background-color: rgba(255, 255, 255, 0.95) !important;
        box-shadow: 0 4px 12px rgba(100, 116, 139, 0.15) !important;
      }
      
      .steel-components-wrapper .data-table th {
        background-color: rgba(231, 237, 245, 0.95) !important;
        color: #3d4a5c !important;
        font-weight: 600 !important;
        text-align: left !important;
        padding: 1rem 1.25rem !important;
        border-bottom: 1px solid #d1dce8 !important;
      }
      
      .steel-components-wrapper .data-table td {
        padding: 1rem 1.25rem !important;
        border-bottom: 1px solid #e7edf5 !important;
        color: #334155 !important;
        background-color: rgba(248, 250, 253, 0.95) !important;
      }
      
      /* CHARTS Y GRÁFICOS */
      .steel-components-wrapper .chart-container {
        background: rgba(255, 255, 255, 0.92) !important;
        border-radius: 12px !important;
        padding: 1.5rem !important;
        margin-bottom: 1.5rem !important;
        box-shadow: 0 4px 12px rgba(100, 116, 139, 0.1) !important;
        page-break-inside: avoid !important;
        height: auto !important;
        max-height: 70vh !important;
        backdrop-filter: blur(8px) !important;
      }
      
      /* TÍTULOS DE SECCIÓN */
      .steel-components-wrapper .report-section-title {
        color: #2d3748 !important;
        font-weight: 600 !important;
        border-bottom: 2px solid #d1dce8 !important;
        padding-bottom: 0.75rem !important;
        margin-bottom: 1.5rem !important;
        position: relative !important;
      }
      
      .steel-components-wrapper .report-section-title::after {
        content: '' !important;
        position: absolute !important;
        left: 0 !important;
        bottom: -2px !important;
        width: 60px !important;
        height: 3px !important;
        background: linear-gradient(to right, #4a6fa0, #6b8bc3) !important;
        border-radius: 2px !important;
      }
      
      /* BADGES */
      .steel-components-wrapper .badge {
        display: inline-flex !important;
        align-items: center !important;
        padding: 0.375rem 0.875rem !important;
        border-radius: 50px !important;
        font-size: 0.875rem !important;
        font-weight: 600 !important;
      }
      
      .steel-components-wrapper .badge-success {
        background-color: #d1fae5 !important;
        color: #065f46 !important;
      }
      
      .steel-components-wrapper .badge-danger {
        background-color: #fee2e2 !important;
        color: #b91c1c !important;
      }
      
      .steel-components-wrapper .badge-info {
        background-color: #dbeafe !important;
        color: #1e40af !important;
      }
      
      /* RESPONSIVE DESIGN */
      @media (max-width: 1024px) {
        .steel-components-wrapper .main-content {
          margin-left: 0 !important;
          padding: 1rem !important;
        }
        
        .steel-components-wrapper .sidebar {
          transform: translateX(-100%) !important;
        }
      }
      
      @media (max-width: 768px) {
        .steel-components-wrapper .main-content {
          padding: 0.5rem !important;
        }
        
        .steel-components-wrapper .dashboard-card {
          margin-bottom: 1rem !important;
        }
      }
    `;
    
    // Crear elemento de estilo con los estilos verificados
    const styleElement = document.createElement('style');
    styleElement.id = 'steel-components-fixed-styles';
    styleElement.textContent = steelComponentsStylesFixed;
    document.head.appendChild(styleElement);
    
    // LIMPIAR ESTILOS ANTERIORES CONFLICTIvVOS
    const oldStyle = document.getElementById('steel-components-styles');
    if (oldStyle) {
      document.head.removeChild(oldStyle);
    }
    
    const testStyle = document.getElementById('test-background-fix');
    if (testStyle) {
      document.head.removeChild(testStyle);
    }
    
    console.log('✅ Estilos corregidos aplicados permanentemente - Background funcionando');
    
    // Verificar imagen de fondo
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
      const element = document.getElementById('steel-components-fixed-styles');
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
              {activeTab === 'database' && userRole === 'admin' && <DatabaseView />}
              {activeTab === 'gallery' && userRole === 'admin' && <PhotoGallery />}
              {activeTab === 'dashboard' && userRole === 'admin' && <div>Dashboard content here</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardApp;