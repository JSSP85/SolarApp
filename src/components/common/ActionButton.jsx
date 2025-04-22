// src/components/common/ActionButton.jsx
import React from 'react';

/**
 * Botón de acción estándar con soporte para iconos
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onClick - Función que se ejecuta al hacer clic
 * @param {React.ReactNode} props.children - Contenido del botón
 * @param {string} [props.variant='primary'] - Variante visual ('primary', 'success', 'danger', etc.)
 * @param {React.ReactNode} [props.icon] - Icono opcional
 * @param {string} [props.iconPosition='right'] - Posición del icono ('left' o 'right')
 * @param {boolean} [props.disabled=false] - Si el botón está deshabilitado
 * @param {string} [props.className=''] - Clases CSS adicionales
 */
const ActionButton = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  icon, 
  iconPosition = 'right',
  disabled = false,
  className = '' 
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return disabled 
          ? 'bg-blue-300 text-white cursor-not-allowed' 
          : 'bg-blue-600 text-white hover:bg-blue-700';
      case 'success':
        return disabled 
          ? 'bg-green-300 text-white cursor-not-allowed' 
          : 'bg-green-600 text-white hover:bg-green-700';
      case 'danger':
        return disabled 
          ? 'bg-red-300 text-white cursor-not-allowed' 
          : 'bg-red-600 text-white hover:bg-red-700';
      case 'warning':
        return disabled 
          ? 'bg-yellow-300 text-white cursor-not-allowed' 
          : 'bg-yellow-600 text-white hover:bg-yellow-700';
      case 'secondary':
      default:
        return disabled 
          ? 'bg-gray-300 text-white cursor-not-allowed' 
          : 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };
  
  return (
    <button
      className={`px-4 py-2 rounded flex items-center ${getVariantClass()} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

export default ActionButton;