// src/components/non-conformity/NonConformityApp.jsx - VERSIÓN SIMPLIFICADA PARA TESTING
import React from 'react';

const NonConformityApp = ({ onBack }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: '#f7fafc',
      zIndex: 1000,
      padding: '2rem',
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>
          🚨 Non-Conformity Management
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
          Sistema de gestión de no conformidades - Versión Funcional
        </p>
      </div>

      {/* Content Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Create NC Card */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>
            ➕ Crear Nueva NC
          </h3>
          <p style={{ color: '#718096', margin: '0 0 1rem 0' }}>
            Registrar una nueva no conformidad
          </p>
          <button style={{
            background: '#e53e3e',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            Crear NC
          </button>
        </div>

        {/* Tracking Card */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>
            📊 Seguimiento
          </h3>
          <p style={{ color: '#718096', margin: '0 0 1rem 0' }}>
            Monitorear estado de NCs activas
          </p>
          <button style={{
            background: '#ed8936',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            Ver Tracking
          </button>
        </div>

        {/* History Card */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>
            📚 Historial
          </h3>
          <p style={{ color: '#718096', margin: '0 0 1rem 0' }}>
            Consultar NCs cerradas
          </p>
          <button style={{
            background: '#38a169',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            Ver Historial
          </button>
        </div>

        {/* Dashboard Card */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>
            📈 Dashboard
          </h3>
          <p style={{ color: '#718096', margin: '0 0 1rem 0' }}>
            Métricas y estadísticas
          </p>
          <button style={{
            background: '#4299e1',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            Ver Dashboard
          </button>
        </div>
      </div>

      {/* Status Section */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>
          ✅ Estado del Sistema
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', background: '#f0fff4', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>12</div>
            <div style={{ color: '#38a169', fontWeight: '600' }}>NCs Activas</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: '#fffaf0', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>3</div>
            <div style={{ color: '#ed8936', fontWeight: '600' }}>Críticas</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: '#f0f9ff', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>45</div>
            <div style={{ color: '#4299e1', fontWeight: '600' }}>Resueltas</div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      {onBack && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onBack}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 auto',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 15px rgba(102, 126, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <span>←</span>
            <span>Volver al Menú Principal</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default NonConformityApp;