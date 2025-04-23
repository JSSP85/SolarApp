// src/DashboardApp.jsx
import React, { useEffect } from 'react';
import { useInspection } from './context/InspectionContext';
import SidebarNav from './components/layout/SidebarNav';
import ContentHeader from './components/layout/ContentHeader';
import SetupForm from './components/setup/SetupForm'; 
import { InspectionPanelSistem } from './components/inspection';
import ReportViewDashboard from './components/report/ReportViewDashboard';

const DashboardApp = () => {
  const { state } = useInspection();
  const { activeTab } = state;

  // Efecto para añadir los estilos del tema
  useEffect(() => {
    // Determinar la ruta base según el entorno
    // Esto detecta si estamos en GitHub Pages o en desarrollo local
    const isGitHubPages = window.location.hostname.includes('github.io');
    const baseUrl = isGitHubPages ? '/SolarApp' : '';
    
    // Definir los estilos CSS con la ruta de imagen correcta
    const mediumModernThemeStyles = `
      body {
        background-image: url('${baseUrl}/images/backgrounds/solar-background2.jpeg') !important;
        background-size: cover !important;
        background-position: center !important;
        background-attachment: fixed !important;
        color: #2d3748;
        min-height: 100vh;
      }
      
      .app-container {
        background: transparent !important;
      }
      
      .main-content {
        background: transparent;
        position: relative;
        z-index: 1;
        /* Añadir sombra a la izquierda para dar sensación de profundidad con respecto a la barra lateral */
        box-shadow: -8px 0 16px -6px rgba(0, 0, 0, 0.1);
      }
      
      /* Eliminamos los estilos específicos de la barra lateral */
      
      .card-header {
        background: linear-gradient(to right, rgba(74, 111, 160, 0.9), rgba(111, 140, 182, 0.9));
        color: white;
        border-radius: 8px 8px 0 0;
        padding: 1rem;
      }
      
      .card-title {
        font-weight: 600;
      }
      
      .dashboard-card {
        background: rgba(242, 245, 250, 0.85);
        border: 1px solid rgba(203, 213, 225, 0.8);
        box-shadow: 0 4px 12px rgba(100, 116, 139, 0.2);
        border-radius: 8px;
        margin-bottom: 1rem;
        backdrop-filter: blur(10px);
      }
      
      .card-body {
        padding: 1.25rem;
      }
      
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
      
      /* Tabla de datos */
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
      
      /* Secciones de reporte */
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
      
      /* Badges y estados */
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
      
      /* Efecto de contenido con profundidad */
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
    
    // Crear elemento de estilo e insertarlo en el head
    const styleElement = document.createElement('style');
    styleElement.textContent = mediumModernThemeStyles;
    document.head.appendChild(styleElement);
    
    // Limpiar al desmontar
    return () => {
      document.head.removeChild(styleElement);
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardApp;
