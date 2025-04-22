// src/components/common/SampleIndicators.jsx
import React from 'react';

/**
 * Componente reutilizable para mostrar indicadores de muestra con estado
 * 
 * @param {Object} props - Propiedades del componente
 * @param {number} props.count - Número de muestras a mostrar
 * @param {number} props.currentIndex - Índice de muestra activa actual (base 0)
 * @param {Array} props.values - Array de valores de muestra
 * @param {Function} props.getStatusClass - Función para determinar clase CSS según el índice de muestra
 * @param {Function} props.onSelectSample - Callback cuando se hace clic en un indicador
 * @param {string} [props.containerClass] - Clase adicional para el contenedor
 */
const SampleIndicators = ({ 
  count,
  currentIndex,
  values,
  getStatusClass,
  onSelectSample,
  containerClass = ''
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${containerClass}`}>
      {Array.from({ length: count }).map((_, index) => {
        const value = values?.[index];
        
        return (
          <button
            key={index}
            className={`flex flex-col items-center p-1 rounded text-xs
              ${getStatusClass(index)} 
              ${index === currentIndex ? 'ring-2 ring-blue-400' : ''}`}
            onClick={() => onSelectSample(index)}
          >
            <span className="font-bold">{index + 1}</span>
            {value && (
              <span className="text-xs">
                {value}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SampleIndicators;