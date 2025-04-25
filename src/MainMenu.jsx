// src/MainMenu.jsx
import React, { useState, useEffect } from 'react';
import styles from './MainMenu.module.css'; // Importar CSS Module en lugar de CSS regular

// Import icons from lucide-react - using only basic icons that should be available in all versions
import { 
  ChevronRight, 
  Shield, 
  Settings,
  LayoutDashboard, 
  ArrowLeft,
  Gauge,
  Cpu,
  FileText,
  ClipboardEdit,
  AlertTriangle,
  BarChart2,
  UserCog,
  Briefcase,
  FileWarning,
  PieChart,
  Database,
  Lock
} from 'lucide-react';

// Importar el nuevo componente BackButton
import BackButton from './components/common/BackButton';

// Custom SVG for the screw icon since it might not be available in lucide-react
const ScrewNutIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="38" 
    height="38" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={styles.mainMenuCardIcon}
  >
    <path d="M12 6V12L14.5 14.5"></path>
    <path d="M16 8L12 4 8 8 4 12 8 16 12 20 16 16 20 12Z"></path>
    <path d="M12 1L12 4"></path>
    <path d="M12 20L12 23"></path>
    <path d="M4 12L1 12"></path>
    <path d="M23 12L20 12"></path>
  </svg>
);

// Custom SVG for the measurement gauge
const MeasurementGaugeIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="38" 
    height="38" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={styles.mainMenuCardIcon}
  >
    <path d="M12 15l3.5-3.5"></path>
    <path d="M20.3 18c.4-1 .7-2.2.7-3.4C21 9.8 17 6 12 6s-9 3.8-9 8.6c0 1.2.3 2.4.7 3.4"></path>
    <path d="M9 15L6 12 9 9"></path>
    <path d="M15 9l3 3-3 3"></path>
    <path d="M12 12v-3"></path>
    <path d="M4 21h16"></path>
    <path d="M4 21V18"></path>
    <path d="M20 21V18"></path>
    <path d="M7 18v3"></path>
    <path d="M17 18v3"></path>
    <path d="M4 18h16"></path>
  </svg>
);

// Import actual application components
import DashboardApp from './DashboardApp';
import { InspectionProvider } from './context/InspectionContext';
import { LanguageProvider } from './context/LanguageContext';

const MainMenu = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  // Function to handle application background issue - MODIFICADO PARA USAR IMAGEN
  useEffect(() => {
    if (selectedOption === 'steel') {
      // Detectar si estamos en GitHub Pages para ajustar la ruta de la imagen
      const isGitHubPages = window.location.hostname.includes('github.io');
      const baseUrl = isGitHubPages ? '/SolarApp' : '';
      
      // Apply the background fix to the entire document
      const applyBackgroundFix = () => {
        const styleElement = document.createElement('style');
        styleElement.id = 'main-menu-global-fix';
        styleElement.innerHTML = `
          /* Fondo con imagen en lugar de gradiente */
          body { 
            background-image: url('${baseUrl}/images/backgrounds/solar-background2.jpeg') !important;
            background-size: cover !important;
            background-position: center !important;
            background-attachment: fixed !important;
            background-color: #f5f9fd !important;
          }
          
          /* Asegurar que el patrón sea visible y tenga el z-index correcto */
          body::after {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.06' fill-rule='evenodd'/%3E%3C/svg%3E");
            opacity: 0.5; /* Reducido para no ocultar la imagen de fondo */
            z-index: -1;
            pointer-events: none;
          }
          
          /* Hacer que los elementos del app-container sean transparentes */
          .app-container, .main-content { 
            background: transparent !important; 
            min-height: 100vh !important; 
          }
          
          /* Hacer que las tarjetas sean más claras con transparencia */
          .dashboard-card {
            background: rgba(255, 255, 255, 0.85) !important;
            border: 1px solid rgba(255, 255, 255, 0.5) !important;
            backdrop-filter: blur(5px);
          }
          
          /* Mejorar apariencia de cabeceras */
          .card-header {
            background: linear-gradient(to right, rgba(90, 103, 216, 0.85), rgba(104, 117, 245, 0.75)) !important;
          }

          /* Make sure charts and tables fit well */
          .chart-container {
            page-break-inside: avoid;
            height: auto !important;
            max-height: 70vh !important;
          }

          /* Estilos adicionales para garantizar que todo el fondo esté cubierto */
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
          }

          html {
            overflow-y: auto;
          }

          .sidebar {
            background-color: #005F83 !important;
          }

          /* Garantizar que elementos del dashboard tengan fondo transparente */
          #root, [data-reactroot], .app-container > * {
            background: transparent !important;
          }

          /* Asegurar que las tarjetas destacan sobre el fondo */
          .dashboard-card {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          }
          
          /* Mejorar visibilidad del texto */
          .card-body {
            color: #333 !important;
          }
          
          /* Estilos adicionales para arreglar problemas de scroll */
          .main-content {
            overflow-y: auto !important;
          }
        `;
        document.head.appendChild(styleElement);
      };
      
      applyBackgroundFix();
      
      // Clean up when navigating back to menu
      return () => {
        const styleElement = document.getElementById('main-menu-global-fix');
        if (styleElement) styleElement.remove();
      };
    }
  }, [selectedOption]);

  // Function to render the selected application
  const renderSelectedApp = () => {
    switch (selectedOption) {
      case 'steel':
        return (
          <div className={styles.mainMenuAppWrapper}>
            {/* Reemplazar el botón original con el nuevo componente BackButton */}
            <BackButton onClick={() => setSelectedOption(null)} />
            
            <LanguageProvider>
              <InspectionProvider>
                <DashboardApp />
              </InspectionProvider>
            </LanguageProvider>
          </div>
        );
      case 'hardware':
      case 'electrical':
      case 'free-inspection':
      case 'non-conformity-manager':
      case 'inspection-dashboard':
        return (
          <div className={styles.mainMenuContainer}>
            <div className={styles.mainMenuContent}>
              <div className={`${styles.mainMenuSection} ${styles.mainMenuFadeIn}`}>
                <div className={`${styles.mainMenuSectionBody} text-center p-8`}>
                  <h2 className={styles.mainMenuCardTitle} style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>
                    Page Under Construction
                  </h2>
                  <p className={styles.mainMenuCardDescription} style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
                    This section is currently in development.
                  </p>
                  <button
                    onClick={() => setSelectedOption(null)}
                    style={{
                      background: 'linear-gradient(to right, #0077a2, #005F83)',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px rgba(0, 95, 131, 0.3)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    Return to Main Menu
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // If no option is selected, show the main menu
  if (!selectedOption) {
    return (
      <div className={styles.mainMenuContainer}>
        <div className={styles.mainMenuContent}>
          {/* Header - MODIFICADO: más fino y separado */}
          <div className={`${styles.mainMenuHeader} ${styles.mainMenuFadeIn}`}>
            <div className={styles.headerContainer}>
              {/* Logo de la empresa */}
              <img 
                src="/images/logo.png" 
                alt="Company Logo" 
                className={styles.companyLogo} 
              />
              <h1 className={styles.mainMenuTitle}>TEST REPORTS - INSPECTION SYSTEM</h1>
            </div>
            <p className={styles.mainMenuSubtitle}>
              Advanced quality control solution for solar component manufacturing
            </p>
          </div>

          {/* Main content - Inspection modules */}
          <div className={`${styles.mainMenuSection} ${styles.mainMenuStagger1}`}>
            <div className={styles.mainMenuSectionHeader}>
              <h2 className={styles.mainMenuSectionTitle}>
                <Shield size={20} />
                Inspection Module Selection
              </h2>
            </div>
            <div className={styles.mainMenuSectionBody}>
              <div className={styles.mainMenuCards}>
                {/* Steel Components Card - MEJORADO */}
                <div 
                  className={`${styles.mainMenuCard} ${styles.mainMenuStagger1}`}
                  onClick={() => setSelectedOption('steel')}
                >
                  <div className={styles.mainMenuCardBody}>
                    <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(108, 207, 255, 0.1)', border: '1px solid rgba(108, 207, 255, 0.2)' }}>
                      <Gauge size={38} className={styles.mainMenuCardIcon} />
                    </div>
                    <h3 className={styles.mainMenuCardTitle}>Steel Components</h3>
                    <p className={styles.mainMenuCardDescription}>
                      Structural steel components inspection for solar mounting systems
                    </p>
                    <div className={styles.mainMenuCardFooter}>
                      <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeInfo}`}>Available</div>
                      <ChevronRight size={18} className={styles.mainMenuCardArrow} />
                    </div>
                  </div>
                </div>

                {/* Hardware Components Card - MEJORADO */}
                <div 
                  className={`${styles.mainMenuCard} ${styles.mainMenuStagger2}`}
                  onClick={() => setSelectedOption('hardware')}
                >
                  <div className={styles.mainMenuCardBody}>
                    <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(251, 211, 141, 0.1)', border: '1px solid rgba(251, 211, 141, 0.2)' }}>
                      <Settings size={38} className={styles.mainMenuCardIcon} />
                    </div>
                    <h3 className={styles.mainMenuCardTitle}>Hardware Components</h3>
                    <p className={styles.mainMenuCardDescription}>
                      Fasteners and mounting hardware inspection for solar systems
                    </p>
                    <div className={styles.mainMenuCardFooter}>
                      <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeWarning}`}>Page Under Construction</div>
                      <ChevronRight size={18} className={styles.mainMenuCardArrow} />
                    </div>
                  </div>
                </div>

                {/* Electrical & Electronic Components Card */}
                <div 
                  className={`${styles.mainMenuCard} ${styles.mainMenuStagger3}`}
                  onClick={() => setSelectedOption('electrical')}
                >
                  <div className={styles.mainMenuCardBody}>
                    <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(72, 187, 120, 0.1)', border: '1px solid rgba(72, 187, 120, 0.2)' }}>
                      <Cpu size={38} className={styles.mainMenuCardIcon} />
                    </div>
                    <h3 className={styles.mainMenuCardTitle}>Electrical & Electronic Components</h3>
                    <p className={styles.mainMenuCardDescription}>
                      Electrical and electronic components inspection for solar systems
                    </p>
                    <div className={styles.mainMenuCardFooter}>
                      <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeWarning}`}>Page Under Construction</div>
                      <ChevronRight size={18} className={styles.mainMenuCardArrow} />
                    </div>
                  </div>
                </div>

                {/* Free Inspection Card */}
                <div 
                  className={`${styles.mainMenuCard} ${styles.mainMenuStagger4}`}
                  onClick={() => setSelectedOption('free-inspection')}
                >
                  <div className={styles.mainMenuCardBody}>
                    <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                      <ClipboardEdit size={38} className={styles.mainMenuCardIcon} />
                    </div>
                    <h3 className={styles.mainMenuCardTitle}>Free Inspection</h3>
                    <p className={styles.mainMenuCardDescription}>
                      Flexible inspection framework for custom notes and photo documentation
                    </p>
                    <div className={styles.mainMenuCardFooter}>
                      <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeWarning}`}>Page Under Construction</div>
                      <ChevronRight size={18} className={styles.mainMenuCardArrow} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NUEVA SECCIÓN - Manager module */}
          <div className={`${styles.mainMenuSection} ${styles.mainMenuStagger2}`} style={{ marginTop: '2rem' }}>
            <div className={styles.mainMenuSectionHeader} style={{ background: 'rgba(0, 80, 120, 0.8)' }}>
              <h2 className={styles.mainMenuSectionTitle}>
                <UserCog size={20} />
                Manager Module Selection
              </h2>
            </div>
            <div className={styles.mainMenuSectionBody}>
              <div className={styles.mainMenuCards}>
                {/* Non-Conformity Manager Card */}
                <div 
                  className={`${styles.mainMenuCard} ${styles.mainMenuStagger1}`}
                  onClick={() => setSelectedOption('non-conformity-manager')}
                >
                  <div className={styles.mainMenuCardBody}>
                    <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <AlertTriangle size={38} className={styles.mainMenuCardIcon} />
                    </div>
                    <h3 className={styles.mainMenuCardTitle}>Non-Conformity Manager</h3>
                    <p className={styles.mainMenuCardDescription}>
                      Track, manage and resolve non-conformities across manufacturing plants
                    </p>
                    <div className={styles.mainMenuCardFooter}>
                      <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeWarning}`}>Page Under Construction</div>
                      <ChevronRight size={18} className={styles.mainMenuCardArrow} />
                    </div>
                  </div>
                </div>

                {/* Inspection Dashboard Card */}
                <div 
                  className={`${styles.mainMenuCard} ${styles.mainMenuStagger2}`}
                  onClick={() => setSelectedOption('inspection-dashboard')}
                >
                  <div className={styles.mainMenuCardBody}>
                    <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                      <BarChart2 size={38} className={styles.mainMenuCardIcon} />
                    </div>
                    <h3 className={styles.mainMenuCardTitle}>Inspection Dashboard</h3>
                    <p className={styles.mainMenuCardDescription}>
                      Comprehensive analytics and reports for quality control performance
                    </p>
                    <div className={styles.mainMenuCardFooter}>
                      <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeWarning}`}>Page Under Construction</div>
                      <ChevronRight size={18} className={styles.mainMenuCardArrow} />
                    </div>
                  </div>
                </div>

                {/* Future Option 1 */}
                <div 
                  className={`${styles.mainMenuCard} ${styles.mainMenuStagger3} ${styles.mainMenuCardDisabled}`}
                >
                  <div className={styles.mainMenuCardBody}>
                    <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                      <Database size={38} className={styles.mainMenuCardIcon} />
                    </div>
                    <h3 className={styles.mainMenuCardTitle}>Quality Database</h3>
                    <p className={styles.mainMenuCardDescription}>
                      Centralized database for all quality control data and documentation
                    </p>
                    <div className={styles.mainMenuCardFooter}>
                      <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeDisabled}`}>Coming Soon</div>
                      <Lock size={18} className={styles.mainMenuCardArrow} />
                    </div>
                  </div>
                </div>

                {/* Future Option 2 */}
                <div 
                  className={`${styles.mainMenuCard} ${styles.mainMenuStagger4} ${styles.mainMenuCardDisabled}`}
                >
                  <div className={styles.mainMenuCardBody}>
                    <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                      <Briefcase size={38} className={styles.mainMenuCardIcon} />
                    </div>
                    <h3 className={styles.mainMenuCardTitle}>Supplier Management</h3>
                    <p className={styles.mainMenuCardDescription}>
                      Evaluate and manage supplier quality performance and documentation
                    </p>
                    <div className={styles.mainMenuCardFooter}>
                      <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeDisabled}`}>Coming Soon</div>
                      <Lock size={18} className={styles.mainMenuCardArrow} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`${styles.mainMenuFooter} ${styles.mainMenuStagger3}`}>
            <div className={styles.mainMenuFooterBrand}>
              <LayoutDashboard size={16} />
              <span>Solar Quality Control System v1.0</span>
            </div>
            <p>© 2025 Valmont Solar</p>
          </div>
        </div>

        {/* Estilos adicionales para las mejoras de animación */}
        <style jsx>{`
          .${styles.mainMenuCard} {
            transform: translateY(0);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            overflow: hidden;
            position: relative;
          }
          
          .${styles.mainMenuCard}:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
          }
          
          .${styles.mainMenuCard}:hover .${styles.mainMenuCardIconContainer} {
            transform: scale(1.08);
          }
          
          .${styles.mainMenuCard}:hover .${styles.mainMenuCardArrow} {
            transform: translateX(4px);
            opacity: 1;
          }
          
          .${styles.mainMenuCardIconContainer} {
            transition: transform 0.3s ease;
          }
          
          .${styles.mainMenuCardArrow} {
            transition: all 0.3s ease;
            opacity: 0.7;
          }
          
          .${styles.mainMenuCardDisabled} {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          .${styles.mainMenuCardDisabled}:hover {
            transform: translateY(0);
            box-shadow: none;
          }
          
          .${styles.mainMenuBadgeDisabled} {
            background-color: rgba(107, 114, 128, 0.25);
            border: 1px solid rgba(107, 114, 128, 0.4);
          }
          
          .${styles.mainMenuCard}::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              to right,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.2) 50%,
              rgba(255, 255, 255, 0) 100%
            );
            transform: translateX(-100%);
            transition: transform 0.6s ease;
            z-index: 1;
            pointer-events: none;
          }
          
          .${styles.mainMenuCard}:hover::before {
            transform: translateX(100%);
          }
          
          .${styles.mainMenuHeader} {
            padding: 1.25rem 2rem;
            margin-bottom: 2.5rem;
            background: rgba(0, 95, 131, 0.8);
          }
          
          .${styles.mainMenuTitle} {
            margin-top: 0.5rem;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          
          .${styles.mainMenuSectionHeader} {
            border-left: 4px solid rgba(255, 255, 255, 0.4);
          }
          
          .${styles.mainMenuSectionTitle} {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
        `}</style>
      </div>
    );
  }

  // If an option is selected, render the corresponding application
  return renderSelectedApp();
};

export default MainMenu;
