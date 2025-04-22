// src/utils/coatingCalculations.js

/**
 * Calcula estadísticas para mediciones de recubrimiento
 * @param {Array} measurements - Array de mediciones de recubrimiento
 * @returns {Object} - Objeto con diversas estadísticas calculadas
 */
export const calculateCoatingStats = (measurements) => {
  // Filtrar valores vacíos
  const validMeasurements = measurements.filter(m => m !== '' && m !== null);
  const numValues = validMeasurements.length;
  
  if (numValues === 0) {
    return {
      readings: 0,
      mean: 0,
      maximum: 0,
      minimum: 0,
      range: 0,
      stdDeviation: 0,
      meanPlus3Sigma: 0,
      meanMinus3Sigma: 0,
      cv: 0
    };
  }
  
  // Convertir a números
  const numericValues = validMeasurements.map(m => parseFloat(m));
  
  // Calcular estadísticas
  const mean = numericValues.reduce((sum, val) => sum + val, 0) / numValues;
  const maximum = Math.max(...numericValues);
  const minimum = Math.min(...numericValues);
  const range = maximum - minimum;
  
  // Calcular desviación estándar
  const variance = numericValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numValues;
  const stdDeviation = Math.sqrt(variance);
  
  // Media +/- 3 sigma
  const meanPlus3Sigma = mean + (3 * stdDeviation);
  const meanMinus3Sigma = mean - (3 * stdDeviation);
  
  // Coeficiente de variación (CV%)
  const cv = (stdDeviation / mean) * 100;
  
  return {
    readings: numValues,
    mean: mean.toFixed(2),
    maximum: maximum.toFixed(1),
    minimum: minimum.toFixed(1),
    range: range.toFixed(1),
    stdDeviation: stdDeviation.toFixed(2),
    meanPlus3Sigma: meanPlus3Sigma.toFixed(2),
    meanMinus3Sigma: meanMinus3Sigma.toFixed(2),
    cv: cv.toFixed(1)
  };
};

/**
 * Obtiene los requisitos de recubrimiento según el tipo de protección
 * @param {Object} surfaceProtection - Objeto con información de protección superficial
 * @returns {Object} - Requisitos de recubrimiento medio y local
 */
export const getCoatingRequirements = (surfaceProtection) => {
  if (!surfaceProtection) {
    return { mean: 0, local: 0 };
  }

  // Aquí implementarías la lógica basada en los datos reales de Google Sheets
  return {
    mean: surfaceProtection.meanRequirement || 0,
    local: surfaceProtection.localRequirement || 0
  };
};

/**
 * Verifica si un valor de recubrimiento cumple con los requisitos
 * @param {string} type - 'mean' o 'local'
 * @param {string|number} value - Valor de medición
 * @param {Object} requirements - Objeto con requisitos de recubrimiento
 * @returns {boolean} - Verdadero si el valor cumple los requisitos
 */
export const isCoatingValueValid = (type, value, requirements) => {
  if (!value || value === '') return true; // Valores vacíos no se consideran inválidos aún
  
  const numValue = parseFloat(value);
  const minRequired = requirements[type];
  
  return numValue >= minRequired;
};