// src/MainMenu.jsx - LIMPIO SIN LÓGICA DE AUTENTICACIÓN
import React, { useState } from 'react';
import styles from './MainMenu.module.css';
import { 
  ChevronRight, 
  Shield, 
  Settings,
  LayoutDashboard, 
  ArrowLeft,
  Ruler,
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
  Book,
  LogOut
} from 'lucide-react';

// Importar contexto de autenticación
import { useAuth } from './context/AuthContext';

// Importar el nuevo componente BackButton
import BackButton from './components/common/BackButton';

// Import Quality Book Generator
import QualityBookGenerator from './components/quality/QualityBookGenerator';

// Custom SVG for the hardware components (screw icon)
const ScrewIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="32" 
    height="32" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={styles.mainMenuCardIcon}
  >
    <path d="M12 2l4 4-1.5 1.5-2.5-2.5-7 7L3.5 14M9 9l3 3M14 12l2 2M12 18l-2-2m2 2l4-4" />
    <path d="M16 16l4-4h-4v4" />
    <path d="M12 22a3 3 0 0 1-3-3V12" />
  </svg>
);

// Custom SVG for measurement (caliper icon)
const CaliperIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="32" 
    height="32" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={styles.mainMenuCardIcon}
  >
    <path d="M2 5h20v14H2z" />
    <path d="M4 5v14" />
    <path d="M20 5v14" />
    <path d="M6.5 5v4" />
    <path d="M6.5 13v6" />
    <path d="M9 5v2" />
    <path d="M9 11v8" />
    <path d="M11.5 5v8" />
    <path d="M11.5 17v2" />
    <path d="M14 5v3" />
    <path d="M14 12v7" />
    <path d="M16.5 5v2" />
    <path d="M16.5 11v8" />
    <path d="M4 12h16" />
  </svg>
);

// Import actual application components
import DashboardApp from './DashboardApp';
import { InspectionProvider } from './context/InspectionContext';
import { LanguageProvider } from './context/LanguageContext';

const MainMenu = () => {
  const { currentUser, hasPermission, logout } = useAuth();
  const [selectedOption, setSelectedOption] = useState(null);

  // Función para manejar logout
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
  };

  // Function to render the selected application
  const renderSelectedApp = () => {
    switch (selectedOption) {
      case 'steel':
        console.log('🚀 Iniciando Steel Components con usuario:', currentUser.displayName);
        
        return (
          <div className={styles.mainMenuAppWrapper}>
            <BackButton onClick={() => setSelectedOption(null)} />
            
            <LanguageProvider>
              <InspectionProvider initialUserRole={currentUser.role}>
                <DashboardApp />
              </InspectionProvider>
            </LanguageProvider>
          </div>
        );
      case 'quality-book':
        return (
          <div>
            <QualityBookGenerator onBackClick={() => setSelectedOption(null)} />
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
          {/* Header con información del usuario */}
          <div className={`${styles.mainMenuHeader} ${styles.mainMenuFadeIn}`}>
            <div className={styles.headerContainer}>
              <div className={styles.headerRow}>
                <img 
                  src="/images/logo.png" 
                  alt="Company Logo" 
                  className={styles.companyLogo} 
                />
                <h1 className={styles.mainMenuTitle}>TEST REPORTS - INSPECTION SYSTEM</h1>
                
                {/* Usuario logueado y botón logout */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'white', fontWeight: '600', fontSize: '1rem' }}>
                      {currentUser.displayName}
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                      {currentUser.role === 'admin' ? 'Administrator' : 'Inspector'}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
              <p className={styles.mainMenuSubtitle}>
                Advanced quality control solution for solar component manufacturing
              </p>
            </div>
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
                {/* Steel Components Card */}
                {hasPermission('steel') && (
                  <div 
                    className={`${styles.mainMenuCard} ${styles.mainMenuStagger1}`}
                    onClick={() => setSelectedOption('steel')}
                  >
                    <div className={styles.mainMenuCardBody}>
                      <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(108, 207, 255, 0.1)', border: '1px solid rgba(108, 207, 255, 0.2)' }}>
                        <CaliperIcon />
                      </div>
                      <h3 className={styles.mainMenuCardTitle}>Steel Components</h3>
                      <p className={styles.mainMenuCardDescription}>
                        Structural steel components inspection for solar mounting systems
                      </p>
                      <div className={styles.mainMenuCardFooter}>
                        <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeInfo}`}>
                          Available
                        </div>
                        <ChevronRight className={styles.mainMenuCardArrow} size={16} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Hardware Components Card */}
                {hasPermission('hardware') && (
                  <div 
                    className={`${styles.mainMenuCard} ${styles.mainMenuStagger2}`}
                    onClick={() => setSelectedOption('hardware')}
                  >
                    <div className={styles.mainMenuCardBody}>
                      <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(251, 211, 141, 0.1)', border: '1px solid rgba(251, 211, 141, 0.2)' }}>
                        <ScrewIcon />
                      </div>
                      <h3 className={styles.mainMenuCardTitle}>Hardware Components</h3>
                      <p className={styles.mainMenuCardDescription}>
                        Fasteners and mounting hardware inspection for solar systems
                      </p>
                      <div className={styles.mainMenuCardFooter}>
                        <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeWarning}`}>Under Construction</div>
                        <ChevronRight className={styles.mainMenuCardArrow} size={16} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Electrical & Electronic Components Card */}
                {hasPermission('electrical') && (
                  <div 
                    className={`${styles.mainMenuCard} ${styles.mainMenuStagger3}`}
                    onClick={() => setSelectedOption('electrical')}
                  >
                    <div className={styles.mainMenuCardBody}>
                      <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(72, 187, 120, 0.1)', border: '1px solid rgba(72, 187, 120, 0.2)' }}>
                        <Cpu size={32} className={styles.mainMenuCardIcon} />
                      </div>
                      <h3 className={styles.mainMenuCardTitle}>Electrical & Electronic Components</h3>
                      <p className={styles.mainMenuCardDescription}>
                        Electrical and electronic components inspection for solar systems
                      </p>
                      <div className={styles.mainMenuCardFooter}>
                        <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeWarning}`}>Under Construction</div>
                        <ChevronRight className={styles.mainMenuCardArrow} size={16} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Free Inspection Card */}
                {hasPermission('free-inspection') && (
                  <div 
                    className={`${styles.mainMenuCard} ${styles.mainMenuStagger4}`}
                    onClick={() => setSelectedOption('free-inspection')}
                  >
                    <div className={styles.mainMenuCardBody}>
                      <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                        <ClipboardEdit size={32} className={styles.mainMenuCardIcon} />
                      </div>
                      <h3 className={styles.mainMenuCardTitle}>Free Inspection</h3>
                      <p className={styles.mainMenuCardDescription}>
                        Flexible inspection framework for custom notes and photo documentation
                      </p>
                      <div className={styles.mainMenuCardFooter}>
                        <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeWarning}`}>Under Construction</div>
                        <ChevronRight className={styles.mainMenuCardArrow} size={16} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Manager module - Solo mostrar si tiene permisos admin */}
          {(hasPermission('non-conformity-manager') || hasPermission('inspection-dashboard') || hasPermission('quality-database') || hasPermission('quality-book')) && (
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
                  {hasPermission('non-conformity-manager') && (
                    <div 
                      className={`${styles.mainMenuCard} ${styles.mainMenuStagger1}`}
                      onClick={() => setSelectedOption('non-conformity-manager')}
                    >
                      <div className={styles.mainMenuCardBody}>
                        <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                          <AlertTriangle size={32} className={styles.mainMenuCardIcon} />
                        </div>
                        <h3 className={styles.mainMenuCardTitle}>Non-Conformity Manager</h3>
                        <p className={styles.mainMenuCardDescription}>
                          Track, manage and resolve non-conformities across manufacturing plants
                        </p>
                        <div className={styles.mainMenuCardFooter}>
                          <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeWarning}`}>Under Construction</div>
                          <ChevronRight className={styles.mainMenuCardArrow} size={16} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inspection Dashboard Card */}
                  {hasPermission('inspection-dashboard') && (
                    <div 
                      className={`${styles.mainMenuCard} ${styles.mainMenuStagger2}`}
                      onClick={() => setSelectedOption('inspection-dashboard')}
                    >
                      <div className={styles.mainMenuCardBody}>
                        <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                          <BarChart2 size={32} className={styles.mainMenuCardIcon} />
                        </div>
                        <h3 className={styles.mainMenuCardTitle}>Inspection Dashboard</h3>
                        <p className={styles.mainMenuCardDescription}>
                          Comprehensive analytics and reports for quality control performance
                        </p>
                        <div className={styles.mainMenuCardFooter}>
                          <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeWarning}`}>Under Construction</div>
                          <ChevronRight className={styles.mainMenuCardArrow} size={16} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quality Database Card */}
                  {hasPermission('quality-database') && (
                    <div 
                      className={`${styles.mainMenuCard} ${styles.mainMenuStagger3} ${styles.mainMenuCardDisabled}`}
                    >
                      <div className={styles.mainMenuCardBody}>
                        <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                          <Database size={32} className={styles.mainMenuCardIcon} />
                        </div>
                        <h3 className={styles.mainMenuCardTitle}>Quality Database</h3>
                        <p className={styles.mainMenuCardDescription}>
                          Centralized database for all quality control data and documentation
                        </p>
                        <div className={styles.mainMenuCardFooter}>
                          <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeDisabled}`}>Coming Soon</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quality Book Generator */}
                  {hasPermission('quality-book') && (
                    <div 
                      className={`${styles.mainMenuCard} ${styles.mainMenuStagger4}`}
                      onClick={() => setSelectedOption('quality-book')}
                    >
                      <div className={styles.mainMenuCardBody}>
                        <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                          <Book size={32} className={styles.mainMenuCardIcon} />
                        </div>
                        <h3 className={styles.mainMenuCardTitle}>Quality Book Generator</h3>
                        <p className={styles.mainMenuCardDescription}>
                          Automated traceability documentation system for quality control books
                        </p>
                        <div className={styles.mainMenuCardFooter}>
                          <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeInfo}`}>Available</div>
                          <ChevronRight className={styles.mainMenuCardArrow} size={16} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className={`${styles.mainMenuFooter} ${styles.mainMenuStagger3}`}>
            <div className={styles.mainMenuFooterBrand}>
              <LayoutDashboard size={16} />
              <span>Solar Quality Control System v1.0</span>
            </div>
            <p>© 2025 Valmont Solar</p>
          </div>
        </div>
      </div>
    );
  }

  // If an option is selected, render the corresponding application
  return renderSelectedApp();
};

export default MainMenu;