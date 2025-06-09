// src/components/common/ValidationMessage.jsx
import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';

const ValidationMessage = ({ 
  message, 
  type = 'error', 
  size = 'small',
  showIcon = true 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertTriangle size={16} />;
      case 'warning':
        return <AlertCircle size={16} />;
      case 'success':
        return <CheckCircle size={16} />;
      case 'info':
        return <Info size={16} />;
      default:
        return <AlertTriangle size={16} />;
    }
  };

  const getStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: size === 'small' ? '0.5rem 0.75rem' : '0.75rem 1rem',
      borderRadius: '6px',
      fontSize: size === 'small' ? '0.875rem' : '1rem',
      fontWeight: '500',
      marginTop: '0.5rem'
    };

    switch (type) {
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: '#fed7d7',
          border: '1px solid #feb2b2',
          color: '#c53030'
        };
      case 'warning':
        return {
          ...baseStyles,
          backgroundColor: '#fefcbf',
          border: '1px solid #f6e05e',
          color: '#b7791f'
        };
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: '#c6f6d5',
          border: '1px solid #9ae6b4',
          color: '#2f855a'
        };
      case 'info':
        return {
          ...baseStyles,
          backgroundColor: '#bee3f8',
          border: '1px solid #90cdf4',
          color: '#2b6cb0'
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: '#fed7d7',
          border: '1px solid #feb2b2',
          color: '#c53030'
        };
    }
  };

  if (!message) {
    return null;
  }

  return (
    <div style={getStyles()}>
      {showIcon && getIcon()}
      <span>{message}</span>
    </div>
  );
};

export default ValidationMessage;