// src/utils/drawingService.js
import { getComponentData } from './databaseService';

/**
 * Obtiene información del dibujo técnico para un componente
 * @param {string} componentCode - Código del componente
 * @returns {Promise<Object>} - Información del dibujo
 */
export const getComponentDrawing = async (componentCode) => {
  try {
    if (!componentCode) {
      return {
        found: false,
        errorMessage: "No component code provided"
      };
    }
    
    // Obtener datos del componente desde el Excel
    const componentData = await getComponentData(componentCode);
    
    // Verificar si tenemos datos y el campo Imagen
    if (!componentData || !componentData.Imagen) {
      return {
        found: false,
        errorMessage: "No technical drawing available for this component"
      };
    }
    
    // Construir la ruta a la imagen usando el valor de la columna "Imagen"
    const imagePath = `/images/drawings/${componentData.Imagen}.jpeg`;
    
    return {
      found: true,
      src: imagePath,
      alt: `Technical drawing for ${componentCode}`,
      imageCode: componentData.Imagen,
      componentName: componentData.Nombre || componentCode
    };
  } catch (error) {
    console.error("Error fetching component drawing:", error);
    return {
      found: false,
      errorMessage: "Error loading technical drawing data"
    };
  }
};