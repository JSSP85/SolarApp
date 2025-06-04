// src/DashboardApp.jsx - VERSIÓN CORREGIDA
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

  // Efecto para añadir los estilos del tema - CORREGIDO
  useEffect(() => {
    // CORREGIDO: Ruta fija para Codespaces (sin detección automática)
    const baseUrl = ''; // Ruta local para Codespaces
    
    // Definir los estilos CSS con la ruta de imagen correcta - MEJORADO
    const mediumModernThemeStyles = `
      /* ESTILOS CORREGIDOS PARA STEEL COMPONENTS */
      
      body {
        background-image: url('/images/backgrounds/solar-background2.jpeg') !important;
        background-size: cover !important;
        background-position: center !important;
        background-attachment: fixed !important;
        color: #2d3748;
        min-height: 100vh;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      /* FORZAR TRANSPARENCIA EN HTML Y ROOT */
      html, 
      html body {
        background-color: transparent !important;
      }
      
      #root {
        max-width: 1000px !important;
        width: 100% !important;
        margin: 0 auto !important;
        padding: 1rem !important;
        background: transparent !important;
        background-color: transparent !important;
        text-align: left !important;
        box-sizing: border-box !important;
      }
      
      .app-container {
        background: transparent !important;
        background-color: transparent !important;
      }
      
      .main-content {
        background: transparent !important;
        background-color: transparent !important;
        position: relative;
        z-index: 1;
        box-shadow: -8px 0 16px -6px rgba(0, 0, 0, 0.1);
      }
      
      /* TARJETAS MEJORADAS */
      .dashboard-card {
        background: rgba(242, 245, 250, 0.95) !important;
        border: 1px solid rgba(203, 213, 225, 0.8) !important;
        box-shadow: 0 8px 32px rgba(100, 116, 139, 0.2) !important;
        border-radius: 12px !important;
        margin-bottom: 1.5rem !important;
        backdrop-filter: blur(10px) !important;
      }
      
      .card-header {
        background: linear-gradient(to right, rgba(74, 111, 160, 0.95), rgba(111, 140, 182, 0.90)) !important;
        color: white !important;
        border-radius: 12px 12px 0 0 !important;
        padding: 1.25rem 1.5rem !important;
        font-weight: 600 !important;
      }
      
      .card-body {
        padding: 1.5rem !important;
        background: rgba(255, 255, 255, 0.98) !important;
      }
      
      /* GRID DE DOS COLUMNAS PARA TARJETAS */
      .cards-grid-2 {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 1.5rem !important;
        margin-bottom: 2rem !important;
      }
      
      /* FORMULARIOS MEJORADOS */
      .form-control {
        background-color: rgba(255, 255, 255, 0.95) !important;
        border: 2px solid rgba(180, 200, 220, 0.8) !important;
        color: #334155 !important;
        border-radius: 8px !important;
        padding: 0.75rem 1rem !important;
        transition: all 0.3s ease !important;
      }
      
      .form-control::placeholder {
        color: #94a3b8 !important;
      }
      
      .form-control:focus {
        border-color: #4a6fa0 !important;
        box-shadow: 0 0 0 4px rgba(74, 111, 160, 0.15) !important;
        background-color: rgba(255, 255, 255, 1) !important;
      }
      
      .form-label {
        color: #3d4a5c !important;
        font-weight: 600 !important;
        margin-bottom: 0.75rem !important;
      }
      
      /* BOTONES MEJORADOS */
      .btn-primary {
        background: linear-gradient(to right, #4a6fa0, #6b8bc3) !important;
        border: none !important;
        color: white !important;
        font-weight: 600 !important;
        padding: 0.75rem 1.5rem !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 12px rgba(74, 111, 160, 0.3) !important;
        transition: all 0.3s ease !important;
      }
      
      .btn-primary:hover {
        background: linear-gradient(to right, #3e5d8a, #5a7ab3) !important;
        box-shadow: 0 6px 20px rgba(74, 111, 160, 0.4) !important;
        transform: translateY(-2px) !important;
      }
      
      .btn-secondary {
        background: rgba(231, 237, 245, 0.95) !important;
        border: 1px solid #b2c0d0 !important;
        color: #3d4a5c !important;
        font-weight: 500 !important;
        padding: 0.75rem 1.5rem !important;
        border-radius: 8px !important;
        transition: all 0.3s ease !important;
      }
      
      .btn-secondary:hover {
        background: rgba(217, 226, 238, 0.95) !important;
        transform: translateY(-1px) !important;
      }
      
      /* TABLAS MEJORADAS */
      .data-table {
        width: 100% !important;
        border-collapse: separate !important;
        border-spacing: 0 !important;
        border-radius: 8px !important;
        overflow: hidden !important;
        background-color: rgba(255, 255, 255, 0.95) !important;
        box-shadow: 0 4px 12px rgba(100, 116, 139, 0.15) !important;
      }
      
      .data-table th {
        background-color: rgba(231, 237, 245, 0.95) !important;
        color: #3d4a5c !important;
        font-weight: 600 !important;
        text-align: left !important;
        padding: 1rem 1.25rem !important;
        border-bottom: 1px solid #d1dce8 !important;
      }
      
      .data-table td {
        padding: 1rem 1.25rem !important;
        border-bottom: 1px solid #e7edf5 !important;
        color: #334155 !important;
        background-color: rgba(248, 250, 253, 0.95) !important;
      }
      
      .data-table tr:nth-child(even) td {
        background-color: rgba(248, 250, 253, 0.98) !important;
      }
      
      .data-table tr:hover td {
        background-color: rgba(231, 237, 245, 0.95) !important;
      }
      
      /* SIDEBAR MEJORADO */
      .sidebar {
        background: linear-gradient(180deg, #005F83 0%, #004666 100%) !important;
        box-shadow: 2px 0 12px rgba(0, 95, 131, 0.2) !important;
      }
      
      /* SECCIONES DE REPORTE */
      .report-section-title {
        color: #2d3748 !important;
        font-weight: 600 !important;
        border-bottom: 2px solid #d1dce8 !important;
        padding-bottom: 0.75rem !important;
        margin-bottom: 1.5rem !important;
        position: relative !important;
      }
      
      .report-section-title::after {
        content: '' !important;
        position: absolute !important;
        left: 0 !important;
        bottom: -2px !important;
        width: 60px !important;
        height: 3px !important;
        background: linear-gradient(to right, #4a6fa0, #6b8bc3) !important;
        border-radius: 2px !important;
      }
      
      /* BADGES Y ESTADOS */
      .badge {
        display: inline-flex !important;
        align-items: center !important;
        padding: 0.375rem 0.875rem !important;
        border-radius: 50px !important;
        font-size: 0.875rem !important;
        font-weight: 600 !important;
      }
      
      .badge-success {
        background-color: #d1fae5 !important;
        color: #065f46 !important;
      }
      
      .badge-danger {
        background-color: #fee2e2 !important;
        color: #b91c1c !important;
      }
      
      .badge-info {
        background-color: #dbeafe !important;
        color: #1e40af !important;
      }
      
      /* GRÁFICOS Y CONTENEDORES ESPECIALES */
      .chart-container {
        background: rgba(255, 255, 255, 0.95) !important;
        border-radius: 12px !important;
        padding: 1.5rem !important;
        margin-bottom: 1.5rem !important;
        box-shadow: 0 4px 12px rgba(100, 116, 139, 0.1) !important;
        page-break-inside: avoid !important;
        height: auto !important;
        max-height: 70vh !important;
      }
      
      /* PATRÓN SUTIL DE FONDO */
      body::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='21' cy='21' r='1'/%3E%3Ccircle cx='35' cy='35' r='1'/%3E%3Ccircle cx='49' cy='49' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        z-index: -1;
        pointer-events: none;
        opacity: 0.6;
      }
      
      /* RESPONSIVE DESIGN */
      @media (max-width: 1024px) {
        #root {
          max-width: 95% !important;
          padding: 0.75rem !important;
        }
        
        .cards-grid-2 {
          grid-template-columns: 1fr !important;
        }
      }
      
      @media (max-width: 768px) {
        .main-content {
          padding: 0.5rem !important;
        }
        
        .dashboard-card {
          margin-bottom: 1rem !important;
        }
      }
    `;
    
    // Crear elemento de estilo e insertarlo en el head
    const styleElement = document.createElement('style');
    styleElement.id = 'dashboard-app-styles'; // ID único para evitar conflictos
    styleElement.textContent = mediumModernThemeStyles;
    document.head.appendChild(styleElement);
    
    // Limpiar al desmontar el componente
    return () => {
      const element = document.getElementById('dashboard-app-styles');
      if (element) {
        document.head.removeChild(element);
      }
    };
  }, []); // Sin dependencias para ejecutarse solo una vez

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
    <div className="min-h-screen">
      <div className="app-container">
        <SidebarNav />
        
        <div className="main-content">
          <ContentHeader title={getPageTitle()} />
          
          <div className="p-4">
            {activeTab === 'setup' && <SetupForm />}
            {activeTab === 'inspection' && <InspectionPanelSistem />}
            {activeTab === 'report' && <ReportViewDashboard />}
            {/* Nueva pestaña Database - Solo visible para usuarios Admin */}
            {activeTab === 'database' && userRole === 'admin' && <DatabaseView />}
            {/* NUEVA PESTAÑA GALLERY - Solo visible para usuarios Admin */}
            {activeTab === 'gallery' && userRole === 'admin' && <PhotoGallery />}
            {activeTab === 'dashboard' && userRole === 'admin' && <div>Dashboard content here</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardApp;