// src/utils/samplePlanHelper.js

/**
 * Calcula tamaño de muestra basado en la cantidad del lote
 * @param {number} quantity - Cantidad del lote
 * @returns {string} - Letra de muestra y tamaño
 */
export const calculateSample = (quantity) => {
  let letter = "";
  let sampleSize = 0;
  
  if (quantity <= 8) letter = "A";
  else if (quantity <= 15) letter = "B";
  else if (quantity <= 25) letter = "C";
  else if (quantity <= 50) letter = "D";
  else if (quantity <= 90) letter = "E";
  else if (quantity <= 150) letter = "F";
  else if (quantity <= 280) letter = "G";
  else if (quantity <= 500) letter = "H";
  else if (quantity <= 1200) letter = "J";
  else if (quantity <= 3200) letter = "K";
  else if (quantity <= 10000) letter = "L";
  else if (quantity <= 35000) letter = "M";
  else if (quantity <= 150000) letter = "N";
  else if (quantity <= 500000) letter = "P";
  else letter = "Q";
  
  switch(letter) {
    case "A": case "B": case "C": case "D": case "E": case "F": sampleSize = 2; break;
    case "G": sampleSize = 3; break;
    case "H": sampleSize = 5; break;
    case "J": sampleSize = 8; break;
    case "K": sampleSize = 13; break;
    case "L": sampleSize = 20; break;
    case "M": sampleSize = 32; break;
    case "N": sampleSize = 50; break;
    case "P": sampleSize = 80; break;
    case "Q": sampleSize = 125; break;
    default: sampleSize = 0;
  }
  
  return `Letter: ${letter} - Sample: ${sampleSize}`;
};

/**
 * Extrae el tamaño de muestra de la cadena de información de muestra
 * @param {string} sampleInfo - Cadena con información de muestra
 * @returns {number} - Número de muestras
 */
export const getSampleCount = (sampleInfo) => {
  if (!sampleInfo) return 0;
  const match = sampleInfo.match(/Sample: (\d+)/);
  return match ? parseInt(match[1]) : 0;
};

/**
 * Extrae la letra de muestra de la cadena de información de muestra
 * @param {string} sampleInfo - Cadena con información de muestra
 * @returns {string} - Letra de muestra
 */
export const getSampleLetter = (sampleInfo) => {
  if (!sampleInfo) return '';
  const match = sampleInfo.match(/Letter: ([A-Z])/);
  return match ? match[1] : '';
};