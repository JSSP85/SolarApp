// src/MainMenu.jsx - Updated with Supplier Evaluation
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
  Building2,
  Users
} from 'lucide-react';

// Import contexts and components
import { useAuth } from './context/AuthContext';
import BackButton from './components/common/BackButton';
import QualityBookGenerator from './components/quality/QualityBookGenerator';
import NonConformityApp from './components/non-conformity/NonConformityApp';
import SupplierEvaluationWrapper from './components/supplier-evaluation/SupplierEvaluationWrapper';

// Custom SVG icons (existing ones)
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
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  // Function to handle direct option selection
  const handleOptionSelect = (option) => {
    if (hasPermission(option)) {
      setSelectedOption(option);
    } else {
      alert('You do not have permission to access this section.');
    }
  };

  // Function to render the selected application
  const renderSelectedApp = () => {
    switch(selectedOption) {
      case 'steel':
      case 'hardware':
      case 'electrical':
      case 'free-inspection':
        return (
          <InspectionProvider>
            <LanguageProvider>
              <DashboardApp 
                mode={selectedOption}
                onBack={() => setSelectedOption(null)}
              />
            </LanguageProvider>
          </InspectionProvider>
        );
      
      case 'non-conformity-manager':
        return (
          <NonConformityApp 
            onBack={() => setSelectedOption(null)}
          />
        );
      
      case 'quality-book':
        return (
          <QualityBookGenerator 
            onBack={() => setSelectedOption(null)}
          />
        );
      
      case 'supplier-evaluation':
        return (
          <SupplierEvaluationWrapper 
            onBack={() => setSelectedOption(null)}
          />
        );
      
      case 'inspection-dashboard':
        return (
          <div className="inspection-dashboard-placeholder">
            <BackButton onClick={() => setSelectedOption(null)} />
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <BarChart2 size={64} style={{ margin: '0 auto 1rem', color: '#6b7280' }} />
              <h2>Inspection Dashboard</h2>
              <p>Dashboard implementation in progress</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Main menu interface
  if (!selectedOption) {
    return (
      <div className={styles.mainMenuContainer}>
        <div className={styles.mainMenuContent}>
          {/* Header */}
          <div className={`${styles.mainMenuHeader} ${styles.mainMenuStagger1}`}>
            <div className={styles.mainMenuHeaderContent}>
              <div className={styles.mainMenuLogo}>
                <Shield size={32} className={styles.mainMenuLogoIcon} />
                <div className={styles.mainMenuLogoText}>
                  <h1>Quality Control System</h1>
                  <p>Valmont Solar - Manufacturing Excellence</p>
                </div>
              </div>
              
              {/* User Info and Logout */}
              <div className={styles.mainMenuUserSection}>
                <div className={styles.mainMenuUserInfo}>
                  <User size={16} />
                  <span>{currentUser?.displayName}</span>
                  <span className={styles.mainMenuUserRole}>({currentUser?.role})</span>
                </div>
                <button 
                  className={styles.mainMenuLogoutBtn}
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Inspector module section */}
          <div className={`${styles.mainMenuSection} ${styles.mainMenuStagger1}`}>
            <div className={styles.mainMenuSectionHeader}>
              <h2 className={styles.mainMenuSectionTitle}>
                <ClipboardEdit size={20} />
                Inspector Module Selection
              </h2>
            </div>
            <div className={styles.mainMenuSectionBody}>
              <div className={styles.mainMenuCards}>
                {/* Steel Components Card */}
                {hasPermission('steel') && (
                  <div 
                    className={`${styles.mainMenuCard} ${styles.mainMenuStagger1}`}
                    onClick={() => handleOptionSelect('steel')}
                  >
                    <div className={styles.mainMenuCardBody}>
                      <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <Ruler size={32} className={styles.mainMenuCardIcon} />
                      </div>
                      <h3 className={styles.mainMenuCardTitle}>Steel Components</h3>
                      <p className={styles.mainMenuCardDescription}>
                        Complete inspection protocols for structural steel components and assemblies
                      </p>
                      <div className={styles.mainMenuCardFooter}>
                        <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeInfo}`}>Available</div>
                        <ChevronRight className={styles.mainMenuCardArrow} size={20} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Hardware Components Card */}
                {hasPermission('hardware') && (
                  <div 
                    className={`${styles.mainMenuCard} ${styles.mainMenuStagger2}`}
                    onClick={() => handleOptionSelect('hardware')}
                  >
                    <div className={styles.mainMenuCardBody}>
                      <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <ScrewIcon />
                      </div>
                      <h3 className={styles.mainMenuCardTitle}>Hardware Components</h3>
                      <p className={styles.mainMenuCardDescription}>
                        Comprehensive quality checks for fasteners, bolts, and mechanical hardware
                      </p>
                      <div className={styles.mainMenuCardFooter}>
                        <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeInfo}`}>Available</div>
                        <ChevronRight className={styles.mainMenuCardArrow} size={20} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Electrical Components Card */}
                {hasPermission('electrical') && (
                  <div 
                    className={`${styles.mainMenuCard} ${styles.mainMenuStagger3}`}
                    onClick={() => handleOptionSelect('electrical')}
                  >
                    <div className={styles.mainMenuCardBody}>
                      <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <Cpu size={32} className={styles.mainMenuCardIcon} />
                      </div>
                      <h3 className={styles.mainMenuCardTitle}>Electrical Components</h3>
                      <p className={styles.mainMenuCardDescription}>
                        Advanced electrical testing and validation protocols for solar systems
                      </p>
                      <div className={styles.mainMenuCardFooter}>
                        <div className={`${styles.mainMenuBadge} ${styles.mainMenuBadgeInfo}`}>Available</div>
                        <ChevronRight className={styles.mainMenuCardArrow} size={20} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Free Inspection Card */}
                {hasPermission('free-inspection') && (
                  <div 
                    className={`${styles.mainMenuCard} ${styles.mainMenuStagger4} ${!hasPermission('free-inspection') ? styles.mainMenuCardDisabled : ''}`}
                    onClick={() => hasPermission('free-inspection') && handleOptionSelect('free-inspection')}
                  >
                    <div className={styles.mainMenuCardBody}>
                      <div className={styles.mainMenuCardIconContainer} style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        <CaliperIcon />
                      </div>
                      <h3 className={styles.mainMenuCardTitle}>Free Inspection</h3>
                      <p className={styles.mainMenuCardDescription}>
                        Flexible inspection tools for custom components and special requirements
                      </p>
                      <div className={styles.mainMenuCardFooter}>
                        <div className={`${styles.mainMenuBadge} ${hasPermission('free-inspection') ? styles.mainMenuBadgeWarning : styles.mainMenuBadgeDisabled}`}>
                          {hasPermission('free-inspection') ? 'Under Construction' : 'Access Denied'}
                        </div>
                        <ChevronRight className={styles.mainMenuCardArrow} size={20} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Manager module section */}
          {(hasPermission('non-conformity-manager') || hasPermission('inspection-dashboard') || hasPermission('supplier-evaluation') || hasPermission('quality-book')) && (
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

                  {/* Supplier Evaluation Card - UPDATED */}
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

  // If an option is selected, render the corresponding application
  return renderSelectedApp();
};

export default MainMenu;