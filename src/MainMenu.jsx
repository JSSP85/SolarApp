// src/MainMenu.jsx
import React, { useState, useEffect } from 'react';
import styles from './MainMenu.module.css';

// Import icons from lucide-react
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
  Book,
  LogOut
} from 'lucide-react';

// Import Quality Book Generator
import QualityBookGenerator from './components/quality/QualityBookGenerator';
import NonConformityApp from './components/non-conformity/NonConformityApp';

// Import actual application components
import DashboardApp from './DashboardApp';
import { InspectionProvider } from './context/InspectionContext';
import { LanguageProvider } from './context/LanguageContext';

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

// Custom SVG for Non-Conformity Management
const NonConformityIcon = () => (
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
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
    <circle cx="12" cy="15" r="1" fill="currentColor" />
    <path d="m9 12 2 2 4-4" stroke="#e53e3e" strokeWidth="2" />
  </svg>
);

// Configuración de usuarios y permisos
const USER_CREDENTIALS = {
  'Admin': {
    password: 'valm2025',
    role: 'admin',
    permissions: ['steel', 'hardware', 'electrical', 'free-inspection', 'non-conformity', 'inspection-dashboard', 'quality-database', 'quality-book', 'supplier-management']
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

  // CSS Isolation for Non-Conformity App
  useEffect(() => {
    if (selectedOption === 'non-conformity') {
      document.body.classList.add('non-conformity-active');
    } else {
      document.body.classList.remove('non-conformity-active');
    }
    
    return () => {
      document.body.classList.remove('non-conformity-active');
    };
  }, [selectedOption]);

  // Function to get current user role
  const getCurrentUserRole = () => {
    return sessionStorage.getItem('userRole') || null;
  };

  // Function to check permissions
  const hasPermission = (module) => {
    const currentUserRole = getCurrentUserRole();
    if (!currentUserRole) return false;
    
    const user = Object.values(USER_CREDENTIALS).find(u => u.role === currentUserRole);
    return user ? user.permissions.includes(module) : false;
  };

  // Function to handle authentication
  const handleLogin = (e) => {
    e.preventDefault();
    
    const user = USER_CREDENTIALS[loginCredentials.username];
    
    if (user && user.password === loginCredentials.password) {
      if (user.permissions.includes(pendingManagerOption)) {
        setShowLoginModal(false); 
        setLoginError('');
        setSelectedOption(pendingManagerOption);
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

  // Function to handle option selection
  const handleOptionSelect = (option) => {
    switch (option) {
      case 'steel':
        setSelectedOption('steel');
        break;
      case 'hardware':
        setSelectedOption('hardware');
        break;
      case 'electrical':
        setSelectedOption('electrical');
        break;
      case 'free-inspection':
        setSelectedOption('free-inspection');
        break;
      case 'non-conformity':
        setSelectedOption('non-conformity');
        break;
      case 'inspection-dashboard':
        setSelectedOption('inspection-dashboard');
        break;
      case 'quality-database':
        setSelectedOption('quality-database');
        break;
      case 'quality-book':
        setSelectedOption('quality-book');
        break;
      case 'supplier-management':
        setSelectedOption('supplier-management');
        break;
      default:
        setSelectedOption(null);
        break;
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('userRole');
    setSelectedOption(null);
  };

  // Render content based on selected option
  const renderContent = () => {
    switch (selectedOption) {
      case 'steel':
        return (
          <div className="steel-components-wrapper">
            <InspectionProvider>
              <LanguageProvider>
                <DashboardApp 
                  onBack={() => setSelectedOption(null)} 
                  currentUserRole={getCurrentUserRole()}
                />
              </LanguageProvider>
            </InspectionProvider>
          </div>
        );
      
      case 'non-conformity':
        return (
          <div className="non-conformity-wrapper">
            <NonConformityApp onBack={() => setSelectedOption(null)} />
          </div>
        );
      
      case 'quality-book':
        return (
          <div className="quality-book-wrapper">
            <QualityBookGenerator onBack={() => setSelectedOption(null)} />
          </div>
        );
      
      case 'hardware':
        return (
          <div className={styles.mainMenuPlaceholder}>
            <div className={styles.mainMenuPlaceholderContent}>
              <div className={styles.mainMenuPlaceholderIcon}>
                <ScrewIcon />
              </div>
              <h2 className={styles.mainMenuPlaceholderTitle}>Hardware Components</h2>
              <p className={styles.mainMenuPlaceholderDescription}>
                This module is currently under development. Hardware components inspection functionality will be available soon.
              </p>
              <button 
                className={styles.mainMenuPlaceholderButton}
                onClick={() => setSelectedOption(null)}
              >
                <ArrowLeft size={20} />
                Back to Main Menu
              </button>
            </div>
          </div>
        );
      
      case 'electrical':
        return (
          <div className={styles.mainMenuPlaceholder}>
            <div className={styles.mainMenuPlaceholderContent}>
              <div className={styles.mainMenuPlaceholderIcon}>
                <Cpu size={48} />
              </div>
              <h2 className={styles.mainMenuPlaceholderTitle}>Electrical & Electronic Components</h2>
              <p className={styles.mainMenuPlaceholderDescription}>
                This module is currently under development. Electrical components inspection functionality will be available soon.
              </p>
              <button 
                className={styles.mainMenuPlaceholderButton}
                onClick={() => setSelectedOption(null)}
              >
                <ArrowLeft size={20} />
                Back to Main Menu
              </button>
            </div>
          </div>
        );
      
      case 'free-inspection':
        return (
          <div className={styles.mainMenuPlaceholder}>
            <div className={styles.mainMenuPlaceholderContent}>
              <div className={styles.mainMenuPlaceholderIcon}>
                <ClipboardEdit size={48} />
              </div>
              <h2 className={styles.mainMenuPlaceholderTitle}>Free Inspection</h2>
              <p className={styles.mainMenuPlaceholderDescription}>
                This module is currently under development. Free inspection functionality will be available soon.
              </p>
              <button 
                className={styles.mainMenuPlaceholderButton}
                onClick={() => setSelectedOption(null)}
              >
                <ArrowLeft size={20} />
                Back to Main Menu
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Don't render MainMenu if an option is selected
  if (selectedOption) {
    return renderContent();
  }

  return (
    <div className={styles.mainMenuContainer}>
      <div className={styles.mainMenuContent}>
        {/* Header principal */}
        <div className={`${styles.mainMenuSection} ${styles.mainMenuStagger0}`}>
          <div className={styles.mainMenuHeader}>
            <div className={styles.mainMenuHeaderContent}>
              <div className={styles.mainMenuBrandContainer}>
                <img 
                  src="/images/logo.png" 
                  alt="Valmont Solar Logo" 
                  className={styles.mainMenuLogo}
                />
                <div className={styles.mainMenuHeaderActions}>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
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

          {/* Sección de herramientas de gestión */}
          <div className={`${styles.mainMenuSection} ${styles.mainMenuStagger2}`}>
            <div className={styles.mainMenuSectionHeader}>
              <h2 className={styles.mainMenuSectionTitle}>
                <UserCog size={20} />
                Management Tools
              </h2>
            </div>
            <div className={styles.mainMenuSectionBody}>
              <div className={styles.mainMenuCards}>
                {/* Non-Conformity Manager Card */}
                {hasPermission('non-conformity') && (
                  <div 
                    className={`${styles.mainMenuCard} ${styles.mainMenuStagger1}`}
                    onClick={() => handleManagerOptionSelect('non-conformity')}
                  >
                    <div className={styles.mainMenuCardBody}>
                      <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(229, 62, 62, 0.1)', border: '1px solid rgba(229, 62, 62, 0.2)' }}>
                        <NonConformityIcon />
                      </div>
                      <h3 className={styles.mainMenuCardTitle}>Non-Conformity Management</h3>
                      <p className={styles.mainMenuCardDescription}>
                        Track, manage and resolve non-conformities across manufacturing processes
                      </p>
                      <div className={styles.mainMenuCardFooter}>
                        <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeInfo}`}>
                          Available
                        </div>
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

                {/* Quality Database Card */}
                {hasPermission('quality-database') && (
                  <div 
                    className={`${styles.mainMenuCard} ${styles.mainMenuStagger3}`}
                    onClick={() => handleOptionSelect('quality-database')}
                  >
                    <div className={styles.mainMenuCardBody}>
                      <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <Database size={32} className={styles.mainMenuCardIcon} />
                      </div>
                      <h3 className={styles.mainMenuCardTitle}>Quality Database</h3>
                      <p className={styles.mainMenuCardDescription}>
                        Centralized database for all quality control records and historical data
                      </p>
                      <div className={styles.mainMenuCardFooter}>
                        <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeWarning}`}>Under Construction</div>
                        <ChevronRight className={styles.mainMenuCardArrow} size={20} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Quality Book Generator Card */}
                {hasPermission('quality-book') && (
                  <div 
                    className={`${styles.mainMenuCard} ${styles.mainMenuStagger4}`}
                    onClick={() => handleManagerOptionSelect('quality-book')}
                  >
                    <div className={styles.mainMenuCardBody}>
                      <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        <Book size={32} className={styles.mainMenuCardIcon} />
                      </div>
                      <h3 className={styles.mainMenuCardTitle}>Quality Book Generator</h3>
                      <p className={styles.mainMenuCardDescription}>
                        Generate comprehensive quality control books and documentation packages
                      </p>
                      <div className={styles.mainMenuCardFooter}>
                        <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeInfo}`}>Available</div>
                        <ChevronRight className={styles.mainMenuCardArrow} size={20} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Supplier Management Card */}
                {hasPermission('supplier-management') && (
                  <div 
                    className={`${styles.mainMenuCard} ${styles.mainMenuStagger5}`}
                    onClick={() => handleOptionSelect('supplier-management')}
                  >
                    <div className={styles.mainMenuCardBody}>
                      <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <Briefcase size={32} className={styles.mainMenuCardIcon} />
                      </div>
                      <h3 className={styles.mainMenuCardTitle}>Supplier Management</h3>
                      <p className={styles.mainMenuCardDescription}>
                        Manage supplier relationships, evaluations, and performance tracking
                      </p>
                      <div className={styles.mainMenuCardFooter}>
                        <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeWarning}`}>Under Construction</div>
                        <ChevronRight className={styles.mainMenuCardArrow} size={20} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de login */}
      {showLoginModal && (
        <div className={styles.mainMenuModal}>
          <div className={styles.mainMenuModalContent}>
            <h3 className={styles.mainMenuModalTitle}>
              <Lock size={24} />
              Authentication Required
            </h3>
            <p className={styles.mainMenuModalDescription}>
              Please enter your credentials to access this module.
            </p>
            
            <form onSubmit={handleLogin} className={styles.mainMenuModalForm}>
              <div className={styles.mainMenuModalField}>
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={loginCredentials.username}
                  onChange={(e) => setLoginCredentials(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter your username"
                  required
                />
              </div>
              
              <div className={styles.mainMenuModalField}>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={loginCredentials.password}
                  onChange={(e) => setLoginCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              {loginError && (
                <div className={styles.mainMenuModalError}>
                  <AlertTriangle size={16} />
                  {loginError}
                </div>
              )}
              
              <div className={styles.mainMenuModalActions}>
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className={styles.mainMenuModalCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.mainMenuModalSubmit}
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainMenu;