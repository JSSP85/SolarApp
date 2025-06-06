// src/App.jsx - Actualizado con flujo de autenticación
import React from 'react';
import './App.css';
import './app-dashboard.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import MainMenu from './MainMenu';

// Componente que maneja la lógica de autenticación
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar un spinner de carga mientras se verifica la sesión
  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #005F83 0%, #0077a2 50%, #667eea 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        {/* Logo de carga */}
        <img 
          src="/images/logo2.png" 
          alt="Valmont Solar Logo" 
          style={{ 
            height: '100px',
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) brightness(1.2)',
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
        
        {/* Spinner de carga */}
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        
        {/* Texto de carga */}
        <div style={{
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: '500',
          textAlign: 'center'
        }}>
          <div>Loading Quality Control System...</div>
          <div style={{ 
            fontSize: '1rem', 
            color: 'rgba(255, 255, 255, 0.8)', 
            marginTop: '0.5rem' 
          }}>
            Verifying session
          </div>
        </div>

        {/* CSS para animaciones */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
              0%, 100% { 
                opacity: 1; 
                transform: scale(1); 
              }
              50% { 
                opacity: 0.8; 
                transform: scale(1.05); 
              }
            }
          `}
        </style>
      </div>
    );
  }

  // Si el usuario está autenticado, mostrar el MainMenu
  if (isAuthenticated) {
    return <MainMenu />;
  }

  // Si no está autenticado, mostrar la página de login
  return <LoginPage />;
};

// Componente principal de la aplicación
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;