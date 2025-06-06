// src/DashboardApp.jsx - VERSIÓN ANTERIOR MEJORADA
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

  // EFECTO LIMPIO PARA APLICAR TEMA - BASADO EN VERSIÓN ANTERIOR QUE FUNCIONABA
  useEffect(() => {
    // Determinar la ruta base según el entorno
    const isGitHubPages = window.location.hostname.includes('github.io');
    const baseUrl = isGitHubPages ? '/SolarApp' : '';
    
    // ESTILOS LIMPIOS Y EFECTIVOS (sin selectores agresivos)
    const cleanThemeStyles = `
      /* FONDO PRINCIPAL - SIMPLE Y DIRECTO */
      body {
        background-image: url('${baseUrl}/images/backgrounds/solar-background2.jpeg') !important;
        background-size: cover !important;
        background-position: center !important;
        background-attachment: fixed !important;
        background-color: #f5f9fd !important;
        color: #2d3748;
        min-height: 100vh;
      }
      
      /* CONTENEDORES PRINCIPALES - TRANSPARENTES */
      .app-container {
        background: transparent !important;
      }
      
      .main-content {
        background: transparent;
        position: relative;
        z-index: 1;
        box-shadow: -8px 0 16px -6px rgba(0, 0, 0, 0.1);
      }
      
      /* CARDS CON TRANSPARENCIA EQUILIBRADA */
      .dashboard-card {
        background: rgba(242, 245, 250, 0.85);
        border: 1px solid rgba(203, 213, 225, 0.8);
        box-shadow: 0 4px 12px rgba(100, 116, 139, 0.2);
        border-radius: 8px;
        margin-bottom: 1rem;
        backdrop-filter: blur(10px);
      }
      
      .card-header {
        background: linear-gradient(to right, rgba(74, 111, 160, 0.9), rgba(111, 140, 182, 0.9));
        color: white;
        border-radius: 8px 8px 0 0;
        padding: 1rem;
      }
      
      .card-title {
        font-weight: 600;
      }
      
      .card-body {
        padding: 1.25rem;
      }
      
      /* FORMULARIOS */
      .form-control {
        background-color: rgba(255, 255, 255, 0.9);
        border-color: #b2c0d0;
        color: #334155;
        border-radius: 6px;
        padding: 0.5rem 0.75rem;
        transition: all 0.2s;
      }
      
      .form-control::placeholder {
        color: #94a3b8;
      }
      
      .form-control:focus {
        border-color: #4a6fa0;
        box-shadow: 0 0 0 3px rgba(74, 111, 160, 0.25);
      }
      
      .form-label {
        color: #3d4a5c;
        font-weight: 500;
        margin-bottom: 0.5rem;
      }
      
      /* BOTONES */
      .btn-primary {
        background: linear-gradient(to right, #3e6394, #5980b3);
        border: none;
        color: white;
        font-weight: 500;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        box-shadow: 0 2px 6px rgba(62, 99, 148, 0.3);
        transition: all 0.2s;
      }
      
      .btn-primary:hover {
        background: linear-gradient(to right, #34568a, #4871a6);
        box-shadow: 0 4px 8px rgba(62, 99, 148, 0.4);
        transform: translateY(-1px);
      }
      
      .btn-secondary {
        background: rgba(231, 237, 245, 0.9);
        border: 1px solid #b2c0d0;
        color: #3d4a5c;
        font-weight: 500;
        padding: 0.5rem 1rem;
        border-radius: 6px;
      }
      
      .btn-secondary:hover {
        background: rgba(217, 226, 238, 0.9);
      }
      
      /* TABLAS */
      .data-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        border-radius: 6px;
        overflow: hidden;
        background-color: rgba(255, 255, 255, 0.9);
        box-shadow: 0 2px 6px rgba(100, 116, 139, 0.15);
      }
      
      .data-table th {
        background-color: rgba(231, 237, 245, 0.9);
        color: #3d4a5c;
        font-weight: 600;
        text-align: left;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #d1dce8;
      }
      
      .data-table td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #e7edf5;
        color: #334155;
        background-color: rgba(248, 250, 253, 0.9);
      }
      
      .data-table tr:nth-child(even) td {
        background-color: rgba(248, 250, 253, 0.95);
      }
      
      .data-table tr:hover td {
        background-color: rgba(231, 237, 245, 0.9);
      }
      
      /* TÍTULOS DE SECCIÓN */
      .report-section-title {
        color: #2d3748;
        font-weight: 600;
        border-bottom: 2px solid #d1dce8;
        padding-bottom: 0.5rem;
        margin-bottom: 1rem;
        position: relative;
      }
      
      .report-section-title::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -2px;
        width: 50px;
        height: 2px;
        background: linear-gradient(to right, #3e6394, #5980b3);
      }
      
      /* BADGES */
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
      }
      
      .badge-success {
        background-color: #d1fae5;
        color: #065f46;
      }
      
      .badge-danger {
        background-color: #fee2e2;
        color: #b91c1c;
      }
      
      .badge-info {
        background-color: #dbeafe;
        color: #1e40af;
      }
      
      /* CHARTS Y CONTENEDORES ESPECIALES */
      .chart-container {
        background: rgba(255, 255, 255, 0.9);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
        box-shadow: 0 2px 6px rgba(100, 116, 139, 0.15);
        backdrop-filter: blur(5px);
      }
      
      .content-container {
        background: rgba(242, 245, 250, 0.7);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        box-shadow: 
          0 10px 15px -3px rgba(0, 0, 0, 0.1),
          0 4px 6px -2px rgba(0, 0, 0, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 1rem;
      }
    `;
    
    // Crear elemento de estilo único con ID específico
    const styleElement = document.createElement('style');
    styleElement.id = 'dashboard-clean-theme';
    styleElement.textContent = cleanThemeStyles;
    
    // LIMPIEZA PREVENTIVA - Eliminar estilos conflictivos anteriores
    const oldStyles = [
      'steel-components-styles',
      'steel-components-fixed-styles', 
      'steel-specific-styles-only',
      'test-background-fix',
      'fix-white-box-specific',
      'fix-potente-background'
    ];
    
    oldStyles.forEach(id => {
      const oldElement = document.getElementById(id);
      if (oldElement) {
        document.head.removeChild(oldElement);
        console.log(`🗑️ Eliminated conflicting style: ${id}`);
      }
    });
    
    // Aplicar el nuevo estilo limpio
    document.head.appendChild(styleElement);
    console.log('✅ Clean theme applied successfully');
    
    // Verificar imagen de fondo
    const testImg = new Image();
    testImg.onload = () => {
      console.log('✅ Background image loaded successfully');
    };
    testImg.onerror = () => {
      console.error('❌ Background image failed to load. Check path:', `${baseUrl}/images/backgrounds/solar-background2.jpeg`);
    };
    testImg.src = `${baseUrl}/images/backgrounds/solar-background2.jpeg`;
    
    // LIMPIEZA al desmontar - Simple y efectiva
    return () => {
      const element = document.getElementById('dashboard-clean-theme');
      if (element) {
        document.head.removeChild(element);
        console.log('🧹 Clean theme styles removed');
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
  );
};

export default DashboardApp;