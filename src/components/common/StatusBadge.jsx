// src/components/common/StatusBadge.jsx
import React from 'react';

/**
 * Componente de insignia de estado con diferentes estilos según el estado
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.status - Estado ('pass', 'reject', 'warning', 'in-progress', etc.)
 * @param {string} props.text - Texto a mostrar
 * @param {string} [props.className] - Clases CSS adicionales
 */
const StatusBadge = ({ status, text, className = '' }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'pass':
      case 'conforming':
        return 'bg-green-100 text-green-700';
      case 'reject':
      case 'non-conforming':
        return 'bg-red-100 text-red-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      case 'info':
      case 'in-progress':
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };
  
  return (
    <span className={`px-3 py-1 rounded-full font-bold ${getStatusClass()} ${className}`}>
      {text}
    </span>
  );
};

export default StatusBadge;