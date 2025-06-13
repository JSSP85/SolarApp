// src/utils/dateUtils.js

/**
 * Convierte una fecha en formato DD/MM/YYYY a objeto Date de forma segura
 * @param {string} dateString - Fecha en formato DD/MM/YYYY
 * @param {Date} fallbackDate - Fecha de respaldo si la entrada es inválida
 * @returns {Date} - Objeto Date válido
 */
export const safeParseDate = (dateString, fallbackDate = new Date('1900-01-01')) => {
  // Si no hay fecha o es undefined/null, usar fallback
  if (!dateString || typeof dateString !== 'string') {
    return fallbackDate;
  }
  
  try {
    // Verificar si la fecha tiene el formato correcto DD/MM/YYYY
    const parts = dateString.trim().split('/');
    if (parts.length !== 3) {
      return fallbackDate;
    }
    
    const [day, month, year] = parts;
    
    // Validar que sean números
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return fallbackDate;
    }
    
    // Crear fecha en formato ISO (YYYY-MM-DD)
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const parsedDate = new Date(isoDate);
    
    // Verificar que la fecha sea válida
    if (isNaN(parsedDate.getTime())) {
      return fallbackDate;
    }
    
    return parsedDate;
  } catch (error) {
    console.warn('Error parsing date:', dateString, error);
    return fallbackDate;
  }
};

/**
 * Ordena dos fechas de forma segura
 * @param {string} dateA - Primera fecha DD/MM/YYYY
 * @param {string} dateB - Segunda fecha DD/MM/YYYY
 * @param {string} direction - 'asc' o 'desc'
 * @returns {number} - Resultado de comparación para sort()
 */
export const safeDateCompare = (dateA, dateB, direction = 'desc') => {
  const parsedA = safeParseDate(dateA);
  const parsedB = safeParseDate(dateB);
  
  const result = parsedA.getTime() - parsedB.getTime();
  
  return direction === 'asc' ? result : -result;
};

/**
 * Filtra elementos por rango de fechas de forma segura
 * @param {Array} items - Array de elementos con fechas
 * @param {string} dateField - Campo que contiene la fecha
 * @param {Date} startDate - Fecha de inicio
 * @param {Date} endDate - Fecha de fin
 * @returns {Array} - Array filtrado
 */
export const safeDateFilter = (items, dateField, startDate, endDate) => {
  if (!Array.isArray(items)) return [];
  
  return items.filter(item => {
    const itemDate = safeParseDate(item[dateField]);
    
    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;
    
    return true;
  });
};

/**
 * Formatea una fecha a DD/MM/YYYY de forma segura
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Fecha formateada o fecha por defecto
 */
export const safeDateFormat = (date) => {
  try {
    let dateObj;
    
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      // Si ya está en formato DD/MM/YYYY, devolverla tal como está
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
        return date;
      }
      dateObj = new Date(date);
    } else {
      return new Date().toLocaleDateString('en-GB');
    }
    
    if (isNaN(dateObj.getTime())) {
      return new Date().toLocaleDateString('en-GB');
    }
    
    return dateObj.toLocaleDateString('en-GB');
  } catch (error) {
    console.warn('Error formatting date:', date, error);
    return new Date().toLocaleDateString('en-GB');
  }
};

/**
 * Calcula días entre dos fechas de forma segura
 * @param {string} startDate - Fecha inicial DD/MM/YYYY
 * @param {string} endDate - Fecha final DD/MM/YYYY (opcional, usa hoy por defecto)
 * @returns {number} - Número de días
 */
export const safeDateDiff = (startDate, endDate) => {
  const start = safeParseDate(startDate);
  const end = endDate ? safeParseDate(endDate) : new Date();
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Verifica si una fecha está en un rango específico
 * @param {string} dateString - Fecha a verificar DD/MM/YYYY
 * @param {string} period - Período: 'week', 'month', 'quarter', 'year'
 * @returns {boolean} - True si está en el período
 */
export const isDateInPeriod = (dateString, period) => {
  const date = safeParseDate(dateString);
  const now = new Date();
  const cutoffDate = new Date();
  
  switch (period) {
    case 'week':
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return true;
  }
  
  return date >= cutoffDate;
};

// Exportaciones por defecto para compatibilidad
export default {
  safeParseDate,
  safeDateCompare,
  safeDateFilter,
  safeDateFormat,
  safeDateDiff,
  isDateInPeriod
};