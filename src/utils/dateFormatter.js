// src/utils/dateFormatter.js

/**
 * Formatea una fecha en formato localizado (DD/MM/YYYY)
 * @param {string} dateString - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {string} Fecha formateada (DD/MM/YYYY)
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Formatea una fecha en formato largo (DD de Mes, YYYY)
 * @param {string} dateString - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {string} Fecha formateada (DD de Mes, YYYY)
 */
export const formatLongDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting long date:', error);
    return dateString;
  }
};

/**
 * Formatea una fecha con hora (DD/MM/YYYY, HH:MM)
 * @param {string} dateString - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {string} Fecha y hora formateada (DD/MM/YYYY, HH:MM)
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()}, ${date.toLocaleTimeString(undefined, { 
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  } catch (error) {
    console.error('Error formatting date time:', error);
    return dateString;
  }
};