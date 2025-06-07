// src/components/auth/LoginPage.jsx
import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Shield, 
  AlertCircle,
  CheckCircle,
  LogIn
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simular un pequeño delay para mejorar la UX
    setTimeout(() => {
      const result = login(credentials.username, credentials.password);
      
      if (!result.success) {
        setError(result.error);
      }
      // Si es exitoso, el AuthContext manejará el cambio de estado
      
      setIsLoading(false);
    }, 800);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(135deg, #005F83 0%, #0077a2 50%, #667eea 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '1rem'
    }}>
      {/* Patrón de fondo opcional */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        opacity: 0.4
      }}></div>

      {/* Contenedor principal de login */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '450px'
      }}>
        {/* Header con logo y título */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem'
          }}>
            <img 
              src="/images/logo2.png" 
              alt="Valmont Solar Logo" 
              style={{ 
                height: '80px',
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) brightness(1.2)'
              }}
            />
          </div>
          
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            margin: '0 0 0.5rem 0',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            letterSpacing: '-0.02em'
          }}>
            TEST REPORTS SYSTEM
          </h1>
          
          <p style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0,
            fontWeight: '500'
          }}>
            Quality Control & Inspection Platform
          </p>
        </div>

        {/* Tarjeta de login */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '3rem',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          animation: 'fadeInUp 0.8s ease-out forwards'
        }}>
          {/* Icono de login */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #005F83 0%, #0077a2 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(0, 95, 131, 0.3)'
            }}>
              <Shield size={40} color="white" />
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            marginBottom: '2.5rem'
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              color: '#1a202c',
              margin: '0 0 0.5rem 0'
            }}>
              Secure Access
            </h2>
            <p style={{
              color: '#6b7280',
              margin: 0,
              fontSize: '1rem'
            }}>
              Please enter your credentials to continue
            </p>
          </div>

          {/* Formulario de login */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Campo de usuario */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.75rem'
              }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <User 
                  size={20} 
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }}
                />
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter your username"
                  style={{
                    width: '100%',
                    padding: '1rem 1rem 1rem 3rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    transition: 'all 0.3s',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: 'rgba(248, 250, 252, 0.8)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#005F83';
                    e.target.style.boxShadow = '0 0 0 4px rgba(0, 95, 131, 0.1)';
                    e.target.style.background = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = 'rgba(248, 250, 252, 0.8)';
                  }}
                />
              </div>
            </div>

            {/* Campo de contraseña */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.75rem'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock 
                  size={20} 
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '1rem 3rem 1rem 3rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    transition: 'all 0.3s',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: 'rgba(248, 250, 252, 0.8)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#005F83';
                    e.target.style.boxShadow = '0 0 0 4px rgba(0, 95, 131, 0.1)';
                    e.target.style.background = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = 'rgba(248, 250, 252, 0.8)';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: '0.25rem'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div style={{
                background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                border: '1px solid #f87171',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                animation: 'fadeIn 0.3s ease-out'
              }}>
                <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
                <div style={{ color: '#991b1b', fontSize: '0.95rem', fontWeight: '500' }}>
                  {error}
                </div>
              </div>
            )}

            {/* Botón de login */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1.25rem',
                background: isLoading 
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #005F83 0%, #0077a2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '1.1rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                boxShadow: isLoading 
                  ? 'none' 
                  : '0 8px 25px rgba(0, 95, 131, 0.4)',
                marginTop: '1rem'
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 35px rgba(0, 95, 131, 0.5)';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = isLoading 
                  ? 'none' 
                  : '0 8px 25px rgba(0, 95, 131, 0.4)';
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '3px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Access System</span>
                </>
              )}
            </button>
          </form>

          {/* Información de roles disponibles */}
          <div style={{
            marginTop: '2.5rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <CheckCircle size={18} style={{ color: '#10b981' }} />
              <span style={{ fontWeight: '600', color: '#374151' }}>Available Access Levels:</span>
            </div>
            
            <div style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#005F83' }}>Admin:</strong> Full system access
              </div>
              <div>
                <strong style={{ color: '#005F83' }}>Inspector:</strong> Component inspection access (Steel, Hardware, Electrical, Free Inspection)
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.9rem'
        }}>
          <p style={{ margin: 0 }}>© 2025 Valmont Solar - Quality Control System v1.0</p>
        </div>
      </div>

      {/* CSS para animaciones */}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoginPage;