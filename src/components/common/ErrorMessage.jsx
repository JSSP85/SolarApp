// src/components/common/ErrorMessage.jsx
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ 
  message = "An error occurred", 
  onRetry,
  title = "Error"
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      gap: '1rem',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      margin: '1rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#dc2626'
      }}>
        <AlertTriangle size={24} />
        <h3 style={{
          margin: 0,
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          {title}
        </h3>
      </div>
      
      <p style={{
        color: '#991b1b',
        fontSize: '0.9rem',
        margin: 0,
        maxWidth: '400px'
      }}>
        {message}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#b91c1c';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#dc2626';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;