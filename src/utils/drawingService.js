// src/utils/drawingService.js
import { getComponentData } from './databaseService';

/**
 * Normaliza el nombre del archivo de imagen
 * @param {string} imageName - Nombre de imagen del Excel
 * @returns {string} - Nombre normalizado con ruta completa
 */
const normalizeImagePath = (imageName) => {
  if (!imageName) return null;
  
  // Limpiar el nombre (quitar espacios extra)
  const cleanName = imageName.trim();
  
  // Verificar si ya tiene extensión común de imagen
  const hasExtension = /\.(jpg|jpeg|png|gif|bmp|tiff|webp)$/i.test(cleanName);
  
  if (hasExtension) {
    // Ya tiene extensión, usar tal como está
    return `/images/drawings/${cleanName}`;
  } else {
    // No tiene extensión, agregar .jpeg por defecto
    return `/images/drawings/${cleanName}.jpeg`;
  }
};

/**
 * Obtiene información del dibujo técnico para un componente
 * @param {string} componentCode - Código del componente
 * @returns {Promise<Object>} - Información del dibujo
 */
export const getComponentDrawing = async (componentCode) => {
  try {
    console.log("Buscando dibujo para componente:", componentCode);
    
    if (!componentCode) {
      console.warn("No se proporcionó código de componente");
      return {
        found: false,
        errorMessage: "No component code provided"
      };
    }
    
    // Obtener datos del componente desde el Excel
    const componentData = await getComponentData(componentCode);
    console.log("Datos del componente encontrados:", componentData);
    console.log("Campo Imagen del componente:", componentData ? componentData.Imagen : "No encontrado");
    
    // Verificar si tenemos datos y el campo Imagen
    if (!componentData || !componentData.Imagen) {
      console.warn("No se encontró imagen para el componente:", componentCode);
      return {
        found: false,
        errorMessage: "No technical drawing available for this component"
      };
    }
    
    // Normalizar la ruta de la imagen
    const imagePath = normalizeImagePath(componentData.Imagen);
    console.log("Ruta de imagen construida:", imagePath);
    console.log("Valor original de Imagen:", componentData.Imagen);
    
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
