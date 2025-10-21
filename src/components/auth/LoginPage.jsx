// src/components/auth/LoginPage.jsx - Versión Responsive
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

    setTimeout(() => {
      const result = login(credentials.username, credentials.password);
      
      if (!result.success) {
        setError(result.error);
      }
      
      setIsLoading(false);
    }, 800);
  };

  return (
    <>
      {/* Estilos CSS responsivos integrados */}
      <style jsx>{`
        .login-container {
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, #005F83 0%, #0077a2 50%, #667eea 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 1rem;
        }

        .background-pattern {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
          opacity: 0.4;
        }

        .main-wrapper {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 450px;
        }

        .header-section {
          text-align: center;
          margin-bottom: 3rem;
        }

        .logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .logo {
          height: 80px;
          max-width: 90%;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) brightness(1.2);
          transition: height 0.3s ease;
        }

        .main-title {
          font-size: 2.5rem;
          font-weight: bold;
          color: white;
          margin: 0 0 0.5rem 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          letter-spacing: -0.02em;
          transition: font-size 0.3s ease;
        }

        .subtitle {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          font-weight: 500;
          transition: font-size 0.3s ease;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 3rem;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: fadeInUp 0.8s ease-out forwards;
          transition: padding 0.3s ease;
        }

        .shield-icon-container {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .shield-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #005F83 0%, #0077a2 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 25px rgba(0, 95, 131, 0.3);
          transition: width 0.3s ease, height 0.3s ease;
        }

        .form-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .form-title {
          font-size: 1.75rem;
          font-weight: bold;
          color: #1a202c;
          margin: 0 0 0.5rem 0;
          transition: font-size 0.3s ease;
        }

        .form-subtitle {
          color: #6b7280;
          margin: 0;
          font-size: 1rem;
          transition: font-size 0.3s ease;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          display: block;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.75rem;
          transition: font-size 0.3s ease;
        }

        .input-container {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          transition: left 0.3s ease;
        }

        .form-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s;
          outline: none;
          box-sizing: border-box;
          background: rgba(248, 250, 252, 0.8);
        }

        .form-input:focus {
          border-color: #005F83;
          box-shadow: 0 0 0 4px rgba(0, 95, 131, 0.1);
          background: white;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.3s;
        }

        .password-toggle:hover {
          color: #005F83;
        }

        .error-message {
          background-color: #fef2f2;
          color: #dc2626;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          border-left: 4px solid #dc2626;
          transition: padding 0.3s ease;
        }

        .submit-button {
          width: 100%;
          padding: 1rem 1.5rem;
          background: ${isLoading ? '#9ca3af' : 'linear-gradient(135deg, #005F83 0%, #0077a2 100%)'};
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: ${isLoading ? 'not-allowed' : 'pointer'};
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          box-shadow: ${isLoading ? 'none' : '0 8px 25px rgba(0, 95, 131, 0.4)'};
          margin-top: 1rem;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(0, 95, 131, 0.5);
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

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

        /* RESPONSIVE DESIGN */
        
        /* Tablets y pantallas medianas */
        @media (max-width: 768px) {
          .main-wrapper {
            max-width: 400px;
          }
          
          .logo {
            height: 60px;
          }
          
          .main-title {
            font-size: 2rem;
          }
          
          .subtitle {
            font-size: 1.1rem;
          }
          
          .login-card {
            padding: 2.5rem;
          }
          
          .shield-icon {
            width: 60px;
            height: 60px;
          }
          
          .form-title {
            font-size: 1.5rem;
          }
          
          .form-subtitle {
            font-size: 0.9rem;
          }
          
          .form-label {
            font-size: 0.9rem;
          }
        }

        /* Móviles pequeños */
        @media (max-width: 480px) {
          .login-container {
            padding: 0.5rem;
          }
          
          .main-wrapper {
            max-width: 100%;
          }
          
          .header-section {
            margin-bottom: 2rem;
          }
          
          .logo-container {
            margin-bottom: 1.5rem;
          }
          
          .logo {
            height: 50px;
          }
          
          .main-title {
            font-size: 1.75rem;
            line-height: 1.2;
          }
          
          .subtitle {
            font-size: 1rem;
          }
          
          .login-card {
            padding: 2rem;
            border-radius: 20px;
          }
          
          .shield-icon {
            width: 50px;
            height: 50px;
          }
          
          .form-header {
            margin-bottom: 2rem;
          }
          
          .form-title {
            font-size: 1.4rem;
          }
          
          .form-subtitle {
            font-size: 0.85rem;
          }
          
          .form {
            gap: 1.25rem;
          }
          
          .form-label {
            font-size: 0.85rem;
            margin-bottom: 0.5rem;
          }
          
          .form-input {
            padding: 0.875rem 0.875rem 0.875rem 2.5rem;
            font-size: 0.9rem;
          }
          
          .input-icon {
            left: 0.875rem;
          }
          
          .error-message {
            padding: 0.875rem;
            font-size: 0.85rem;
          }
          
          .submit-button {
            padding: 0.875rem 1.25rem;
            font-size: 1rem;
          }
        }

        /* Móviles muy pequeños */
        @media (max-width: 360px) {
          .login-container {
            padding: 0.25rem;
          }
          
          .logo {
            height: 40px;
          }
          
          .main-title {
            font-size: 1.5rem;
          }
          
          .subtitle {
            font-size: 0.9rem;
          }
          
          .login-card {
            padding: 1.5rem;
          }
          
          .shield-icon {
            width: 40px;
            height: 40px;
          }
          
          .form-title {
            font-size: 1.25rem;
          }
        }

        /* ALTURA LIMITADA - PORTÁTILES 15" Y PANTALLAS CORTAS */
        @media (max-height: 900px) {
          .header-section {
            margin-bottom: 2rem;
          }
          
          .logo {
            height: 50px;
          }
          
          .main-title {
            font-size: 2rem;
          }
          
          .subtitle {
            font-size: 1rem;
          }
          
          .login-card {
            padding: 2rem;
          }
          
          .shield-icon {
            width: 50px;
            height: 50px;
          }
          
          .form-header {
            margin-bottom: 1.5rem;
          }
        }

        /* PORTÁTILES ESTÁNDAR 15" - ALTURA MUY LIMITADA */
        @media (max-height: 800px) {
          .login-container {
            padding: 0.5rem;
            align-items: flex-start;
            padding-top: 1rem;
          }
          
          .header-section {
            margin-bottom: 1.5rem;
          }
          
          .logo-container {
            margin-bottom: 1rem;
          }
          
          .logo {
            height: 40px;
          }
          
          .main-title {
            font-size: 1.75rem;
            margin-bottom: 0.25rem;
          }
          
          .subtitle {
            font-size: 0.9rem;
          }
          
          .login-card {
            padding: 1.5rem;
          }
          
          .shield-icon-container {
            margin-bottom: 1rem;
          }
          
          .shield-icon {
            width: 40px;
            height: 40px;
          }
          
          .form-header {
            margin-bottom: 1rem;
          }
          
          .form-title {
            font-size: 1.3rem;
          }
          
          .form-subtitle {
            font-size: 0.8rem;
          }
          
          .form {
            gap: 1rem;
          }
          
          .form-label {
            margin-bottom: 0.5rem;
            font-size: 0.85rem;
          }
          
          .form-input {
            padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          }
          
          .input-icon {
            left: 0.75rem;
          }
        }

        /* PANTALLAS MUY CORTAS - NETBOOKS Y SIMILARES */
        @media (max-height: 700px) {
          .login-container {
            padding: 0.25rem;
            padding-top: 0.5rem;
          }
          
          .header-section {
            margin-bottom: 1rem;
          }
          
          .logo-container {
            margin-bottom: 0.5rem;
          }
          
          .logo {
            height: 35px;
          }
          
          .main-title {
            font-size: 1.5rem;
            margin-bottom: 0;
          }
          
          .subtitle {
            font-size: 0.8rem;
          }
          
          .login-card {
            padding: 1rem;
          }
          
          .shield-icon-container {
            margin-bottom: 0.5rem;
          }
          
          .shield-icon {
            width: 35px;
            height: 35px;
          }
          
          .form-header {
            margin-bottom: 0.5rem;
          }
          
          .form-title {
            font-size: 1.2rem;
          }
          
          .form-subtitle {
            font-size: 0.75rem;
          }
          
          .form {
            gap: 0.75rem;
          }
        }

        /* Pantallas grandes */
        @media (min-width: 1200px) and (min-height: 900px) {
          .main-wrapper {
            max-width: 500px;
          }
          
          .login-card {
            padding: 3.5rem;
          }
        }

        /* Orientación horizontal en móviles */
        @media (max-height: 600px) and (orientation: landscape) {
          .header-section {
            margin-bottom: 1.5rem;
          }
          
          .logo {
            height: 40px;
          }
          
          .main-title {
            font-size: 1.5rem;
          }
          
          .subtitle {
            font-size: 0.9rem;
          }
          
          .login-card {
            padding: 1.5rem;
          }
          
          .shield-icon {
            width: 40px;
            height: 40px;
          }
          
          .form-header {
            margin-bottom: 1.5rem;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="background-pattern"></div>
        
        <div className="main-wrapper">
          {/* Header con logo y título */}
          <div className="header-section">
            <div className="logo-container">
              <img 
                src="/images/logo2.png" 
                alt="Valmont Solar Logo" 
                className="logo"
              />
            </div>
            
            <h1 className="main-title">
              SYSTEM MANAGEMENT
            </h1>
            
            <p className="subtitle">
              Quality Control & Inspection Platform
            </p>
          </div>

          {/* Tarjeta de login */}
          <div className="login-card">
            {/* Icono de login */}
            <div className="shield-icon-container">
              <div className="shield-icon">
                <Shield size={40} color="white" />
              </div>
            </div>

            <div className="form-header">
              <h2 className="form-title">
                Secure Access
              </h2>
              <p className="form-subtitle">
                Please enter your credentials to continue
              </p>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="error-message">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Formulario de login */}
            <form onSubmit={handleSubmit} className="form">
              {/* Campo de usuario */}
              <div className="form-group">
                <label className="form-label">
                  Username
                </label>
                <div className="input-container">
                  <User size={20} className="input-icon" />
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter your username"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Campo de contraseña */}
              <div className="form-group">
                <label className="form-label">
                  Password
                </label>
                <div className="input-container">
                  <Lock size={20} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Botón de login */}
              <button
                type="submit"
                disabled={isLoading}
                className="submit-button"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
