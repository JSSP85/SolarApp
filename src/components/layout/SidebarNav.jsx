// src/components/layout/SidebarNav.jsx - CORREGIDO CON LÓGICA DE PERMISOS
import React, { useState, useEffect } from 'react';
import { useInspection } from '../../context/InspectionContext';
import { 
  Settings, 
  Clipboard, 
  FileText, 
  AlertTriangle, 
  X,
  Database,
  BarChart,
  Shield,
  Images
} from 'lucide-react';

const SidebarNav = () => {
  const { state, dispatch, validateRequiredFields } = useInspection();
  const { activeTab } = state;
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [attemptedTab, setAttemptedTab] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('inspector'); // Estado local para el rol
  
  // NUEVO: Efecto para sincronizar el userRole desde sessionStorage
  useEffect(() => {
    const syncUserRole = () => {
      try {
        const savedUserRole = sessionStorage.getItem('userRole');
        console.log('🔍 Rol encontrado en sessionStorage:', savedUserRole);
        
        if (savedUserRole) {
          // Actualizar estado local
          setCurrentUserRole(savedUserRole);
          
          // Actualizar el contexto también si es diferente
          if (state.userRole !== savedUserRole) {
            dispatch({ 
              type: 'UPDATE_SETUP_FIELD', 
              payload: { field: 'userRole', value: savedUserRole }
            });
            console.log('✅ UserRole actualizado en contexto:', savedUserRole);
          }
        } else {
          console.log('⚠️ No se encontró userRole en sessionStorage, usando valor por defecto');
          setCurrentUserRole('inspector');
        }
      } catch (error) {
        console.error('❌ Error al sincronizar userRole:', error);
        setCurrentUserRole('inspector');
      }
    };

    // Sincronizar inmediatamente
    syncUserRole();
    
    // Escuchar cambios en sessionStorage (por si cambia en otra pestaña)
    const handleStorageChange = (e) => {
      if (e.key === 'userRole') {
        console.log('🔄 UserRole cambió en sessionStorage:', e.newValue);
        syncUserRole();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // También verificar periódicamente (por si acaso)
    const interval = setInterval(syncUserRole, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [state.userRole, dispatch]);

  // FUNCIÓN MEJORADA: Verificar si el usuario es admin
  const isAdmin = () => {
    const roleToCheck = currentUserRole || state.userRole || 'inspector';
    const isAdminRole = roleToCheck === 'admin';
    
    console.log('🔐 Verificando permisos admin:', {
      currentUserRole,
      stateUserRole: state.userRole,
      roleToCheck,
      isAdminRole
    });
    
    return isAdminRole;
  };

  // FUNCIÓN MEJORADA: Verificar si el usuario puede acceder a una pestaña
  const canAccessTab = (tab) => {
    // Las pestañas básicas (setup, inspection, report) están disponibles para todos
    const basicTabs = ['setup', 'inspection', 'report'];
    if (basicTabs.includes(tab)) {
      return true;
    }
    
    // Las pestañas admin solo para administradores
    const adminTabs = ['database', 'gallery', 'dashboard'];
    if (adminTabs.includes(tab)) {
      return isAdmin();
    }
    
    return true; // Por defecto, permitir acceso
  };
  
  const handleTabChange = (tab) => {
    // NUEVA VALIDACIÓN: Verificar permisos antes de cambiar de pestaña
    if (!canAccessTab(tab)) {
      console.log('🚫 Acceso denegado a pestaña:', tab, 'para rol:', currentUserRole);
      return;
    }

    // Si queremos ir a inspection o report, necesitamos validar primero
    if ((tab === 'inspection' || tab === 'report') && activeTab === 'setup') {
      const validation = validateRequiredFields();
      
      if (!validation.isValid) {
        setValidationError(`To continue to the ${tab === 'inspection' ? 'Inspection' : 'Report'} section, please complete the following fields:\n\n• ${validation.missingFields.join('\n• ')}`);
        setAttemptedTab(tab);
        setShowValidationModal(true);
        return;
      }
    }
    
    // Si llegamos aquí, la validación pasó o no era necesaria
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };
  
  const closeValidationModal = () => {
    setShowValidationModal(false);
    setAttemptedTab(null);
    setValidationError('');
  };

  const proceedAnyway = () => {
    // Si el usuario decide proceder sin completar todos los campos
    if (attemptedTab) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: attemptedTab });
    }
    closeValidationModal();
  };
  
  return (
    <>
      <div 
        className="sidebar" 
        style={{ 
          color: 'white' 
        }}
      >
        <div className="sidebar-header">
          <div className="company-logo-container">
            <img 
              src="/images/logo.png" 
              alt="Valmont Solar Logo" 
              className="company-logo"
            />
          </div>
        </div>
        
        <div className="sidebar-divider"></div>
        
        <div className="sidebar-section-title">
          <span>Inspection</span>
        </div>
        
        <div className="sidebar-nav">
          <div 
            className={`nav-item ${activeTab === 'setup' ? 'active' : ''}`}
            onClick={() => handleTabChange('setup')}
          >
            <Settings size={20} />
            <span>Setup</span>
          </div>
          
          <div 
            className={`nav-item ${activeTab === 'inspection' ? 'active' : ''}`}
            onClick={() => handleTabChange('inspection')}
          >
            <Clipboard size={20} />
            <span>Inspection</span>
          </div>
          
          <div 
            className={`nav-item ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => handleTabChange('report')}
          >
            <FileText size={20} />
            <span>Report</span>
          </div>
        </div>
        
        {/* SECCIÓN ADMIN CORREGIDA - Solo mostrar si es admin */}
        {isAdmin() && (
          <>
            <div className="sidebar-divider admin-divider"></div>
            
            <div className="sidebar-section-title admin-section-title">
              <Shield size={16} className="mr-2" />
              <span>Admin</span>
            </div>
            
            <div className="sidebar-nav">
              <div 
                className={`nav-item admin-item ${activeTab === 'database' ? 'admin-active' : ''}`}
                onClick={() => handleTabChange('database')}
              >
                <Database size={20} />
                <span>Database</span>
              </div>
              
              <div 
                className={`nav-item admin-item ${activeTab === 'gallery' ? 'admin-active' : ''}`}
                onClick={() => handleTabChange('gallery')}
              >
                <Images size={20} />
                <span>Photo Gallery</span>
              </div>
              
              <div 
                className={`nav-item admin-item ${activeTab === 'dashboard' ? 'admin-active' : ''}`}
                onClick={() => handleTabChange('dashboard')}
              >
                <BarChart size={20} />
                <span>Dashboard</span>
              </div>
            </div>
          </>
        )}

        {/* DEBUGGING INFO - Solo mostrar en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ 
            position: 'absolute', 
            bottom: '10px', 
            left: '10px', 
            fontSize: '10px', 
            color: 'rgba(255,255,255,0.5)',
            background: 'rgba(0,0,0,0.3)',
            padding: '4px',
            borderRadius: '4px'
          }}>
            Role: {currentUserRole}<br/>
            Admin: {isAdmin() ? 'Yes' : 'No'}
          </div>
        )}

        {/* Estilos específicos con alta prioridad y posición corregida */}
        <style jsx>{`
          /* Selector altamente específico para la barra lateral */
          html body #root .app-container .sidebar,
          html body [data-reactroot] .sidebar,
          html body .sidebar,
          .sidebar {
            background-color: rgba(0, 95, 131, 0.35) !important;
            backdrop-filter: blur(8px) !important;
            -webkit-backdrop-filter: blur(8px) !important;
            box-shadow: 2px 0 15px rgba(0, 0, 0, 0.2) !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            width: 250px !important;
            z-index: 100 !important;
            margin: 0 !important;
            padding: 0 !important;
            border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
          }

          /* Asegurar que el contenido principal no se superponga con la barra lateral */
          body .main-content {
            margin-left: 250px !important;
          }

          .company-logo-container {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1.5rem;
          }

          .company-logo {
            max-width: 150px;
            max-height: 100px;
            object-fit: contain;
            filter: brightness(0) invert(1); /* Hacer el logo blanco */
          }

          .sidebar-header {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1.5rem;
          }
          
          /* Títulos de sección */
          .sidebar-section-title {
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 0.5rem 1.5rem;
            font-weight: 600;
          }
          
          /* Estilo especial para sección de administrador */
          .admin-section-title {
            color: rgba(255, 161, 86, 0.9);
            display: flex;
            align-items: center;
          }
          
          .admin-divider {
            margin-top: 1.5rem;
            margin-bottom: 1rem;
            background-color: rgba(255, 161, 86, 0.3) !important;
          }

          .sidebar-nav .nav-item {
            color: rgba(255, 255, 255, 0.8);
            transition: all 0.2s ease;
            padding: 0.75rem 1.25rem;
            margin: 0.25rem 0.5rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
          }

          .sidebar-nav .nav-item:hover {
            background-color: rgba(255, 255, 255, 0.15);
            color: white;
          }

          .sidebar-nav .nav-item.active {
            background-color: rgba(255, 255, 255, 0.2);
            color: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }
          
          /* Estilos para ítems de administrador */
          .sidebar-nav .nav-item.admin-item {
            color: rgba(255, 161, 86, 0.9);
            font-weight: 600;
            border-left: 3px solid rgba(255, 161, 86, 0.6);
          }
          
          .sidebar-nav .nav-item.admin-item:hover {
            background-color: rgba(255, 161, 86, 0.15);
            color: rgba(255, 161, 86, 1);
          }
          
          .sidebar-nav .nav-item.admin-active {
            background-color: rgba(255, 161, 86, 0.2);
            color: rgba(255, 161, 86, 1);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            font-weight: 600;
            border-left: 3px solid rgba(255, 161, 86, 1);
          }

          .sidebar-divider {
            height: 1px;
            margin: 0.5rem 1rem;
            background-color: rgba(255, 255, 255, 0.2);
          }
        `}</style>
      </div>

      {/* Modal de validación */}
      {showValidationModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative'
          }}>
            {/* Botón cerrar */}
            <button
              onClick={closeValidationModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>

            {/* Header del modal */}
            <div style={{
              marginBottom: '20px',
              paddingRight: '32px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                  padding: '8px',
                  borderRadius: '50%'
                }}>
                  <AlertTriangle size={24} style={{ color: '#dc2626' }} />
                </div>
                <h3 style={{
                  margin: 0,
                  color: '#1f2937',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  Missing Required Fields
                </h3>
              </div>
            </div>

            {/* Contenido del error */}
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px'
            }}>
              <div style={{
                color: '#991b1b',
                fontSize: '14px',
                lineHeight: '1.5',
                whiteSpace: 'pre-line'
              }}>
                {validationError}
              </div>
            </div>

            {/* Botones */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={closeValidationModal}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
              >
                Back to Setup
              </button>
              <button
                onClick={proceedAnyway}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Continue Anyway
              </button>
            </div>

            {/* Nota informativa */}
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#0c4a6e'
            }}>
              <strong>Note:</strong> It is recommended to complete all required fields to obtain a complete and accurate report.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SidebarNav;