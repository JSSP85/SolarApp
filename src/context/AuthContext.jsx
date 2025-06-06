// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Configuración de usuarios y permisos (la misma que estaba en MainMenu)
const USER_CREDENTIALS = {
  'Admin': {
    password: 'valm2025',
    role: 'admin',
    permissions: ['steel', 'hardware', 'electrical', 'free-inspection', 'non-conformity-manager', 'inspection-dashboard', 'quality-database', 'quality-book', 'supplier-management'],
    displayName: 'Administrator'
  },
  'Inspector1': {
    password: '4321',
    role: 'inspect1',
    permissions: ['steel', 'hardware', 'electrical', 'free-inspection'],
    displayName: 'Inspector 1'
  },
  'Inspector2': {
    password: '0099',
    role: 'inspect2', 
    permissions: ['steel', 'hardware', 'electrical', 'free-inspection'],
    displayName: 'Inspector 2'
  },
  'Inspector3': {
    password: '1199',
    role: 'inspect3',
    permissions: ['steel', 'hardware', 'electrical', 'free-inspection'],
    displayName: 'Inspector 3'
  },
  'Inspector4': {
    password: '9900',
    role: 'inspect4',
    permissions: ['steel', 'hardware', 'electrical', 'free-inspection'],
    displayName: 'Inspector 4'
  },
  'Inspector5': {
    password: '6789',
    role: 'inspect5',
    permissions: ['steel', 'hardware', 'electrical', 'free-inspection'],
    displayName: 'Inspector 5'
  }
};

// Crear el contexto
const AuthContext = createContext();

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay una sesión activa al cargar la aplicación
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const savedUser = sessionStorage.getItem('currentUser');
        const sessionExpiry = sessionStorage.getItem('sessionExpiry');
        
        if (savedUser && sessionExpiry) {
          const expiryTime = parseInt(sessionExpiry);
          const currentTime = Date.now();
          
          // Verificar si la sesión no ha expirado (24 horas)
          if (currentTime < expiryTime) {
            const userData = JSON.parse(savedUser);
            setCurrentUser(userData);
            setIsAuthenticated(true);
            console.log('✅ Sesión restaurada para:', userData.displayName);
          } else {
            // Limpiar sesión expirada
            clearSession();
            console.log('⚠️ Sesión expirada, limpiando datos');
          }
        }
      } catch (error) {
        console.error('Error al verificar sesión existente:', error);
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  // Función para limpiar la sesión
  const clearSession = () => {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('sessionExpiry');
    sessionStorage.removeItem('userRole');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Función para hacer login
  const login = (username, password) => {
    const user = USER_CREDENTIALS[username];
    
    if (user && user.password === password) {
      const userData = {
        username: username,
        role: user.role,
        permissions: user.permissions,
        displayName: user.displayName,
        loginTime: new Date().toISOString()
      };

      // Establecer expiración de sesión a 24 horas
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000);

      // Guardar en sessionStorage
      sessionStorage.setItem('currentUser', JSON.stringify(userData));
      sessionStorage.setItem('sessionExpiry', expiryTime.toString());
      sessionStorage.setItem('userRole', user.role);

      setCurrentUser(userData);
      setIsAuthenticated(true);

      console.log('✅ Login exitoso para:', userData.displayName);
      return { success: true };
    } else {
      console.log('❌ Credenciales inválidas');
      return { 
        success: false, 
        error: 'Credenciales inválidas. Por favor verifica tu usuario y contraseña.' 
      };
    }
  };

  // Función para hacer logout
  const logout = () => {
    clearSession();
    console.log('👋 Logout realizado');
  };

  // Función para verificar si el usuario tiene permisos para una funcionalidad
  const hasPermission = (permission) => {
    if (!currentUser) return false;
    return currentUser.permissions.includes(permission);
  };

  // Función para obtener el nivel de acceso requerido para un módulo
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

  // Función para extender la sesión (opcional, para mantener activa la sesión)
  const extendSession = () => {
    if (isAuthenticated && currentUser) {
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
      sessionStorage.setItem('sessionExpiry', expiryTime.toString());
      console.log('🔄 Sesión extendida');
    }
  };

  const value = {
    isAuthenticated,
    currentUser,
    loading,
    login,
    logout,
    hasPermission,
    getRequiredAccessLevel,
    extendSession,
    // Datos útiles para los componentes
    userCredentials: USER_CREDENTIALS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;