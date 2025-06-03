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
  Lock,
  Book
} from 'lucide-react';

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

// Configuración de usuarios y permisos
const USER_CREDENTIALS = {
  'Admin': {
    password: 'valm2025',
    role: 'admin',
    permissions: ['steel', 'hardware', 'electrical', 'free-inspection', 'non-conformity-manager', 'inspection-dashboard', 'quality-database', 'quality-book', 'supplier-management']
  },
  'Inspector1': {
    password: '4321',
    role: 'inspect1',
    permissions: ['steel', 'hardware', 'electrical', 'free-inspection']
  },
  'Inspector2': {
    password: '0099',
    role: 'inspect2', 
    permissions: ['steel', 'hardware', 'electrical', 'free-inspection']
  },
  'Inspector3': {
    password: '1199',
    role: 'inspect3',
    permissions: ['steel', 'hardware', 'electrical', 'free-inspection']
  },
  'Inspector4': {
    password: '9900',
    role: 'inspect4',
    permissions: ['steel', 'hardware', 'electrical', 'free-inspection']
  },
  'Inspector5': {
    password: '6789',
    role: 'inspect5',
    permissions: ['steel', 'hardware', 'electrical', 'free-inspection']
  }
};

const MainMenu = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [pendingManagerOption, setPendingManagerOption] = useState(null);
  const [pendingModuleType, setPendingModuleType] = useState(null);

  // Function to handle authentication
  const handleLogin = (e) => {
    e.preventDefault();
    
    const user = USER_CREDENTIALS[loginCredentials.username];
    
    if (user && user.password === loginCredentials.password) {
      // Verificar si el usuario tiene permisos para el módulo solicitadoo
      if (user.permissions.includes(pendingManagerOption)) {
        setShowLoginModal(false); 
        setLoginError('');
        setSelectedOption(pendingManagerOption);

         // Guardar el rol del usuario para usarlo en la aplicación
        sessionStorage.setItem('userRole', user.role);
      } else {
        setLoginError(`Access denied. Your role (${user.role}) does not have permission to access this module.`);
      }
    } else {
      setLoginError('Invalid username or password. Please try again.');
    }
  };

  // Function to handle manager option selection that requires authentication
  const handleManagerOptionSelect = (option) => {
    setPendingManagerOption(option);
    setPendingModuleType('manager');
    setShowLoginModal(true);
    setLoginCredentials({ username: '', password: '' });
    setLoginError('');
  };

  // Function to handle Steel Components selection with authentication
  const handleSteelSelection = () => {
    setPendingManagerOption('steel');
    setPendingModuleType('inspector');
    setShowLoginModal(true);
    setLoginCredentials({ username: '', password: '' });
    setLoginError('');
  };

  // Function to handle Hardware Components selection with authentication
  const handleHardwareSelection = () => {
    setPendingManagerOption('hardware');
    setPendingModuleType('inspector');
    setShowLoginModal(true);
    setLoginCredentials({ username: '', password: '' });
    setLoginError('');
  };

  // Function to handle Electrical Components selection with authentication
  const handleElectricalSelection = () => {
    setPendingManagerOption('electrical');
    setPendingModuleType('inspector');
    setShowLoginModal(true);
    setLoginCredentials({ username: '', password: '' });
    setLoginError('');
  };

  // Function to handle Free Inspection selection with authentication
  const handleFreeInspectionSelection = () => {
    setPendingManagerOption('free-inspection');
    setPendingModuleType('inspector');
    setShowLoginModal(true);
    setLoginCredentials({ username: '', password: '' });
    setLoginError('');
  };

  // Function to get required access level
  const getRequiredAccessLevel = (module) => {
    switch(module) {
      case 'steel':
      case 'hardware':
      case 'electrical':
      case 'free-inspection':
        return 'Inspector Level Access Required';
      case 'non-conformity-manager':
      case 'inspection-dashboard':
        return 'Manager Level Access Required';
      case 'quality-database':
      case 'quality-book':
      case 'supplier-management':
        return 'Administrator Access Required';
      default:
        return 'Authentication Required';
    }
  };

  // Function to handle application background issue - MODIFICADO PARA USAR IMAGEN
useEffect(() => {
  if (selectedOption === 'steel') {
    const isGitHubPages = window.location.hostname.includes('github.io');
    const baseUrl = isGitHubPages ? '/SolarApp' : '';
    
    const applyBackgroundFix = () => {
      const styleElement = document.createElement('style');
      styleElement.id = 'main-menu-global-fix';
      styleElement.innerHTML = `
       
        /* FORZAR FONDO TRANSPARENTE EN HTML Y ROOT */
html.steel-active,
html.steel-active :root {
  background: transparent !important;
  background-color: transparent !important;
}
       
        /* Background con múltiples fallbacks */
body.steel-active { 
  background: #f5f9fd url('/images/backgrounds/solar-background2.jpeg') center/cover fixed !important;
  min-height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  color: #2d3748 !important;
}

/* FORZAR TRANSPARENCIA EN TODOS LOS CONTENEDORES */
body.steel-active #root {
  background: transparent !important;
  background-color: transparent !important;
  max-width: 800px !important;
  width: 100% !important;
  margin: 0 auto !important;
  padding: 1rem !important;
  text-align: left !important;
  box-sizing: border-box !important;
}

body.steel-active .app-container {
  background: transparent !important;
  background-color: transparent !important;
}

body.steel-active .main-content {
  background: transparent !important;
  background-color: transparent !important;
}
        
        
        /* Tarjetas con altura normal (NO alargadas) */
        body.steel-active .dashboard-card {
  background: rgba(255, 255, 255, 0.90) !important;
  border: 1px solid rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(8px) !important;
  box-shadow: 0 8px 32px rgba(100, 116, 139, 0.15) !important;
  border-radius: 12px !important;
  margin-bottom: 1.5rem !important;
  margin-right: 1% !important;
  max-width: 450px !important;
  width: 48% !important;
  display: inline-block !important;
  vertical-align: top !important;
  height: auto !important;
  max-height: none !important;
  min-height: auto !important;
        }
        
        /* Headers mejorados */
        body.steel-active .card-header {
          background: linear-gradient(135deg, rgba(74, 111, 160, 0.95), rgba(111, 140, 182, 0.90)) !important;
          color: white !important;
          border-radius: 12px 12px 0 0 !important;
          padding: 1.25rem 1.5rem !important;
          font-weight: 600 !important;
        }
        
        body.steel-active .card-body {
          padding: 1.5rem !important;
          background: rgba(255, 255, 255, 0.95) !important;
        }
        
        /* Patrón sutil de fondo */
        body.steel-active::after {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='21' cy='21' r='1'/%3E%3Ccircle cx='35' cy='35' r='1'/%3E%3Ccircle cx='49' cy='49' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          z-index: -10;
          pointer-events: none;
          opacity: 0.7;
        }
        
        /* Sidebar */
        body.steel-active .sidebar {
          background: linear-gradient(180deg, #005F83 0%, #004666 100%) !important;
          box-shadow: 2px 0 12px rgba(0, 95, 131, 0.2) !important;
        }
        
        /* Formularios mejorados */
        body.steel-active .form-control {
          background: rgba(255, 255, 255, 0.95) !important;
          border: 2px solid rgba(180, 200, 220, 0.8) !important;
          border-radius: 8px !important;
          padding: 0.75rem 1rem !important;
          transition: all 0.3s ease !important;
        }
        
        body.steel-active .form-control:focus {
          border-color: rgba(74, 111, 160, 0.8) !important;
          box-shadow: 0 0 0 4px rgba(74, 111, 160, 0.15) !important;
          background: rgba(255, 255, 255, 1) !important;
        }
        
        /* Botones mejorados */
        body.steel-active .btn-primary {
          background: linear-gradient(135deg, #4a6fa0, #6b8bc3) !important;
          border: none !important;
          color: white !important;
          font-weight: 600 !important;
          padding: 0.75rem 1.5rem !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(74, 111, 160, 0.3) !important;
          transition: all 0.3s ease !important;
        }
        
        body.steel-active .btn-primary:hover {
          background: linear-gradient(135deg, #3e5d8a, #5a7ab3) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 20px rgba(74, 111, 160, 0.4) !important;
        }
      `;
      document.head.appendChild(styleElement);
    };
    
    // Aplicar clase al body y estilos
    document.body.classList.add('steel-active');
    document.documentElement.classList.add('steel-active');
    applyBackgroundFix();
    
    return () => {
      document.body.classList.remove('steel-active');
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
              <InspectionProvider initialUserRole={sessionStorage.getItem('userRole')}>
                <DashboardApp />
              </InspectionProvider>
            </LanguageProvider>
          </div>
        );
      case 'quality-book':
        return (
          <div className={styles.mainMenuAppWrapper}>
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
          {/* Header - Modificado: Logo a la izquierda, título centrado y espacio a la derecha para equilibrar */}
          <div className={`${styles.mainMenuHeader} ${styles.mainMenuFadeIn}`}>
            <div className={styles.headerContainer}>
              {/* Logo y título en línea */}
              <div className={styles.headerRow}>
                {/* Logo de la empresa */}
                <img 
                  src="/images/logo.png" 
                  alt="Company Logo" 
                  className={styles.companyLogo} 
                />
                <h1 className={styles.mainMenuTitle}>TEST REPORTS - INSPECTION SYSTEM</h1>
                {/* Elemento invisible para equilibrar el diseño */}
                <div className={styles.logoPlaceholder}></div>
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
                {/* Steel Components Card - CON AUTENTICACIÓN */}
                <div 
                  className={`${styles.mainMenuCard} ${styles.mainMenuStagger1}`}
                  onClick={() => handleSteelSelection()}
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
                      <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeAuth}`}>
                        <Lock size={12} />
                        Inspector Access
                      </div>
                      <div className={styles.managerLockIndicator}>
                        <Lock size={14} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hardware Components Card - CON AUTENTICACIÓN */}
                <div 
                  className={`${styles.mainMenuCard} ${styles.mainMenuStagger2}`}
                  onClick={() => handleHardwareSelection()}
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
                      <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeAuth}`}>
                        <Lock size={12} />
                        Inspector Access
                      </div>
                      <div className={styles.managerLockIndicator}>
                        <Lock size={14} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Electrical & Electronic Components Card - CON AUTENTICACIÓN */}
                <div 
                  className={`${styles.mainMenuCard} ${styles.mainMenuStagger3}`}
                  onClick={() => handleElectricalSelection()}
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
                      <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeAuth}`}>
                        <Lock size={12} />
                        Inspector Access
                      </div>
                      <div className={styles.managerLockIndicator}>
                        <Lock size={14} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Free Inspection Card - CON AUTENTICACIÓN */}
                <div 
                  className={`${styles.mainMenuCard} ${styles.mainMenuStagger4}`}
                  onClick={() => handleFreeInspectionSelection()}
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
                      <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeAuth}`}>
                        <Lock size={12} />
                        Inspector Access
                      </div>
                      <div className={styles.managerLockIndicator}>
                        <Lock size={14} />
                      </div>
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
                  onClick={() => handleManagerOptionSelect('non-conformity-manager')}
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
                      <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeWarning}`}>Page Under Construction</div>
                      <div className={styles.managerLockIndicator}>
                        <Lock size={14} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inspection Dashboard Card */}
                <div 
                  className={`${styles.mainMenuCard} ${styles.mainMenuStagger2}`}
                  onClick={() => handleManagerOptionSelect('inspection-dashboard')}
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
                      <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeWarning}`}>Page Under Construction</div>
                      <div className={styles.managerLockIndicator}>
                        <Lock size={14} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Future Option 1 */}
                <div 
                  className={`${styles.mainMenuCard} ${styles.mainMenuStagger3} ${styles.mainMenuCardDisabled}`}
                  onClick={() => handleManagerOptionSelect('quality-database')}
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
                      <div className={styles.managerLockIndicator}>
                        <Lock size={14} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quality Book Generator - NUEVA TARJETA */}
                <div 
                  className={`${styles.mainMenuCard} ${styles.mainMenuStagger4}`}
                  onClick={() => handleManagerOptionSelect('quality-book')}
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
                      <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeInfo}`}>Listo para Usar</div>
                      <div className={styles.managerLockIndicator}>
                        <Lock size={14} />
                      </div>
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

          {/* Modal de login mejorado */}
          {showLoginModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>
                  <Lock size={18} className="mr-2" /> Authentication Required
                </h3>
                <div className={styles.modalAccessLevel}>
                  {getRequiredAccessLevel(pendingManagerOption)}
                </div>
                <p className={styles.modalDescription}>
                  Please enter your credentials to access the {pendingManagerOption?.replace('-', ' ')} module
                </p>
                
                {loginError && (
                  <div className={styles.loginError}>
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <div className={styles.formGroup}>
                    <label htmlFor="username">Username</label>
                    <input 
                      type="text" 
                      id="username"
                      value={loginCredentials.username}
                      onChange={(e) => setLoginCredentials({...loginCredentials, username: e.target.value})}
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="password">Password</label>
                    <input 
                      type="password" 
                      id="password"
                      value={loginCredentials.password}
                      onChange={(e) => setLoginCredentials({...loginCredentials, password: e.target.value})}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <div className={styles.modalActions}>
                    <button 
                      type="button" 
                      className={styles.cancelButton}
                      onClick={() => {
                        setShowLoginModal(false);
                        setLoginError('');
                        setLoginCredentials({ username: '', password: '' });
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className={styles.loginButton}
                    >
                      Login
                    </button>
                  </div>
                </form>

                {/* Información de roles disponibles */}
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '0.75rem', 
                  background: '#f8fafc', 
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#64748b'
                }}>
                  <strong>Available Roles:</strong><br />
                  • Admin: Full system access<br />
                  • Inspector1-5: Steel, Hardware, Electrical, Free Inspection access
                </div>
              </div>
            </div>
          )}

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
              padding: 0.75rem 2rem;
              margin-bottom: 2.5rem;
              background: rgba(0, 95, 131, 0.8);
              height: auto;
            }
            
            .${styles.mainMenuTitle} {
              margin: 0;
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

            .${styles.managerLockIndicator} {
              display: flex;
              align-items: center;
              justify-content: center;
              color: rgba(255, 255, 255, 0.7);
            }
          `}</style>
        </div>
      </div>
    );
  }

  // If an option is selected, render the corresponding application
  return renderSelectedApp();
};

export default MainMenu;