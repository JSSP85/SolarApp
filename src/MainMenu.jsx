// src/MainMenu.jsx - Versión actualizada sin modales de login
import React, { useState } from 'react';
import styles from './MainMenu.module.css';

// Import icons from lucide-react
import { 
  ChevronRight, 
  Shield, 
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
  Database,
  Book,
  LogOut,
  User,
  Building2
} from 'lucide-react';

// Importar el contexto de autenticación
import { useAuth } from './context/AuthContext';

// Importar el componente BackButton existente
import BackButton from './components/common/BackButton';

// Import Quality Book Generator
import QualityBookGenerator from './components/quality/QualityBookGenerator';

// Import Non-Conformity App
import NCRegistrySystem from './components/non-conformity/NCRegistrySystem';

import SupplierEvaluationWrapper from './components/supplier-evaluation/SupplierEvaluationWrapper';

import InspectionDashboard from './components/inspection-dashboard/InspectionDashboard';

// Custom SVG para hardware components
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

// Custom SVG para measurement (caliper icon)
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
  const { currentUser, logout, hasPermission } = useAuth();
  const [selectedOption, setSelectedOption] = useState(null);

  // Function to handle logout
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
  };

  // Function to handle direct option selection (sin autenticación adicional)
  const handleOptionSelect = (option) => {
    if (hasPermission(option)) {
      setSelectedOption(option);
    } else {
      alert('No tienes permisos para acceder a esta sección.');
    }
  };

  // Function to render the selected application
  const renderSelectedApp = () => {
    switch (selectedOption) {
      case 'steel':
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
    case 'non-conformity-manager':
  return (
    <div className="non-conformity-wrapper">
      <NCRegistrySystem onBack={() => setSelectedOption(null)} />
    </div>
  );
        case 'supplier-evaluation':
  return (
    <SupplierEvaluationWrapper 
      onBack={() => setSelectedOption(null)}
    />
  );

    case 'inspection-dashboard':
     return (
       <div className="inspection-dashboard-wrapper">
         <BackButton onClick={() => setSelectedOption(null)} />
         <InspectionDashboard />
       </div>
     );
    case 'hardware':
    case 'electrical':
    case 'free-inspection':
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

  // Si no hay opción seleccionada, mostrar el menú principalf
  if (!selectedOption) {
    return (
      <div className={styles.mainMenuContainer}>
        <div className={styles.mainMenuContent}>
          {/* Header con información del usuario y logout */}
          <div className={`${styles.mainMenuHeader} ${styles.mainMenuFadeIn}`}>
            <div className={styles.headerContainer}>
              <div className={styles.headerRow}>
                {/* Logo */}
                <img 
                  src="/images/logo.png" 
                  alt="Company Logo" 
                  className={styles.companyLogo} 
                />
                
                {/* Título central */}
                <h1 className={styles.mainMenuTitle}>TEST REPORTS - INSPECTION SYSTEM</h1>
                
                {/* Información del usuario y logout */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      color: 'white', 
                      fontWeight: '600',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <User size={16} />
                      {currentUser.displayName}
                    </div>
                    <div style={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {currentUser.role}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                      e.target.style.transform = 'translateY(-2px)';
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

          {/* Sección de módulos de inspección */}
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
                <div 
                  className={`${styles.mainMenuCard} ${styles.mainMenuStagger1} ${
                    !hasPermission('steel') ? styles.mainMenuCardDisabled : ''
                  }`}
                  onClick={() => hasPermission('steel') && handleOptionSelect('steel')}
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
                      <div className={`${styles.mainMenuBadge} ${hasPermission('steel') ? styles.mainMenuBadgeInfo : styles.mainMenuBadgeDisabled}`}>
                        {hasPermission('steel') ? 'Available' : 'Access Denied'}
                      </div>
                      <ChevronRight className={styles.mainMenuCardArrow} size={20} />
                    </div>
                  </div>
                </div>

                {/* Hardware Components Card */}
                <div 
                  className={`${styles.mainMenuCard} ${styles.mainMenuStagger2} ${
                    !hasPermission('hardware') ? styles.mainMenuCardDisabled : ''
                  }`}
                  onClick={() => hasPermission('hardware') && handleOptionSelect('hardware')}
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
                      <div className={`${styles.mainMenuBadge} ${hasPermission('hardware') ? styles.mainMenuBadgeWarning : styles.mainMenuBadgeDisabled}`}>
                        {hasPermission('hardware') ? 'Under Construction' : 'Access Denied'}
                      </div>
                      <ChevronRight className={styles.mainMenuCardArrow} size={20} />
                    </div>
                  </div>
                </div>

                {/* Electrical & Electronic Components Card */}
                <div 
                  className={`${styles.mainMenuCard} ${styles.mainMenuStagger3} ${
                    !hasPermission('electrical') ? styles.mainMenuCardDisabled : ''
                  }`}
                  onClick={() => hasPermission('electrical') && handleOptionSelect('electrical')}
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
                      <div className={`${styles.mainMenuBadge} ${hasPermission('electrical') ? styles.mainMenuBadgeWarning : styles.mainMenuBadgeDisabled}`}>
                        {hasPermission('electrical') ? 'Under Construction' : 'Access Denied'}
                      </div>
                      <ChevronRight className={styles.mainMenuCardArrow} size={20} />
                    </div>
                  </div>
                </div>

                {/* Free Inspection Card */}
                <div 
                  className={`${styles.mainMenuCard} ${styles.mainMenuStagger4} ${
                    !hasPermission('free-inspection') ? styles.mainMenuCardDisabled : ''
                  }`}
                  onClick={() => hasPermission('free-inspection') && handleOptionSelect('free-inspection')}
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
                      <div className={`${styles.mainMenuBadge} ${hasPermission('free-inspection') ? styles.mainMenuBadgeWarning : styles.mainMenuBadgeDisabled}`}>
                        {hasPermission('free-inspection') ? 'Under Construction' : 'Access Denied'}
                      </div>
                      <ChevronRight className={styles.mainMenuCardArrow} size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección Manager module - Solo visible si el usuario tiene permisos */}
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
                      onClick={() => handleOptionSelect('non-conformity-manager')}
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
                          <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeInfo}`}>Available</div>
                          <ChevronRight className={styles.mainMenuCardArrow} size={20} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inspection Dashboard Card */}
                  {hasPermission('inspection-dashboard') && (
                    <div 
                      className={`${styles.mainMenuCard} ${styles.mainMenuStagger2}`}
                      onClick={() => handleOptionSelect('inspection-dashboard')}
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
                          <ChevronRight className={styles.mainMenuCardArrow} size={20} />
                        </div>
                      </div>
                    </div>
                  )}

                 {/* Supplier Evaluation Card */}
{hasPermission('supplier-evaluation') && (
  <div 
    className={`${styles.mainMenuCard} ${styles.mainMenuStagger3}`}
    onClick={() => handleOptionSelect('supplier-evaluation')}
  >
    <div className={styles.mainMenuCardBody}>
      <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
        <Building2 size={32} className={styles.mainMenuCardIcon} />
      </div>
      <h3 className={styles.mainMenuCardTitle}>Supplier Evaluation</h3>
      <p className={styles.mainMenuCardDescription}>
        Comprehensive supplier assessment and qualification management system
      </p>
      <div className={styles.mainMenuCardFooter}>
        <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeInfo}`}>Available</div>
        <ChevronRight className={styles.mainMenuCardArrow} size={20} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quality Book Generator */}
                  {hasPermission('quality-book') && (
                    <div 
                      className={`${styles.mainMenuCard} ${styles.mainMenuStagger4}`}
                      onClick={() => handleOptionSelect('quality-book')}
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
                          <ChevronRight className={styles.mainMenuCardArrow} size={20} />
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

  // Si una opción está seleccionada, renderizar la aplicación correspondiente
  return renderSelectedApp();
};

export default MainMenu;