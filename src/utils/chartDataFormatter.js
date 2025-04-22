// src/utils/chartDataFormatter.js

/**
 * Formatea datos de medición dimensional para gráficos
 * @param {Object} dimensionMeasurements - Objeto con mediciones dimensionales
 * @param {number} sampleCount - Número de muestras
 * @returns {Array} - Datos formateados para gráfico
 */
export const formatDimensionChartData = (dimensionMeasurements, sampleCount) => {
  if (!dimensionMeasurements || !sampleCount) return [];
  
  const chartData = [];
  
  // Para cada posición de muestra
  for (let i = 0; i < sampleCount; i++) {
    const sampleData = {
      sample: i + 1
    };
    
    // Añadir un punto de datos para cada dimensión
    Object.keys(dimensionMeasurements).forEach(dimCode => {
      if (dimensionMeasurements[dimCode] && dimensionMeasurements[dimCode][i]) {
        sampleData[dimCode] = parseFloat(dimensionMeasurements[dimCode][i]);
      }
    });
    
    chartData.push(sampleData);
  }
  
  return chartData;
};

/**
 * Formatea mediciones de recubrimiento para gráfico
 * @param {Array} measurements - Mediciones de recubrimiento
 * @returns {Array} - Datos formateados para gráfico
 */
export const formatCoatingChartData = (measurements) => {
  if (!measurements) return [];
  
  return measurements
    .filter(value => value !== '')
    .map((value, index) => ({
      reading: index + 1,
      thickness: parseFloat(value)
    }));
};