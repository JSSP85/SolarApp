// src/utils/databaseService.js
import * as XLSX from 'xlsx';

// Caché para almacenar los datos y evitar múltiples lecturas del Excel
let componentsCache = null;

/**
 * Lee los datos del archivo Excel de componentes
 * @returns {Promise<Array>} Datos de componentes
 */
export const loadComponentsData = async () => {
  // Si ya tenemos los datos en caché, los retornamos
  if (componentsCache) {
    return componentsCache;
  }

  try {
    // Obtener el archivo Excel usando fetch
    const response = await fetch('/data/Database_componenti.xlsx');
    if (!response.ok) {
      throw new Error(`No se pudo cargar el archivo Excel: ${response.status}`);
    }
    
    // Convertir respuesta a ArrayBuffer para XLSX
    const arrayBuffer = await response.arrayBuffer();
    
    // Leer el archivo Excel
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Obtener la primera hoja
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convertir a JSON (con encabezados)
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Guardar en caché
    componentsCache = data;
    return data;
  } catch (error) {
    console.error("Error al cargar datos de componentes:", error);
    return [];
  }
};

/**
 * Busca un componente por su código
 * @param {string} code - Código del componente a buscar
 * @returns {Promise<Object|null>} - Datos del componente o null si no se encuentra
 */
export const getComponentData = async (code) => {
  if (!code) return null;
  
  try {
    // Normalizar el código (minúsculas para comparación insensible a mayúsculas)
    const normalizedCode = code.toLowerCase();
    
    // Cargar datos si no están en caché
    const components = await loadComponentsData();
    
    // Buscar componente que coincida con el código (columna "Codigo")
    const component = components.find(
      comp => comp.Codigo && comp.Codigo.toLowerCase() === normalizedCode
    );
    
    return component || null;
  } catch (error) {
    console.error(`Error al buscar componente ${code}:`, error);
    return null;
  }
};