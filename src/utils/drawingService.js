// src/utils/drawingService.js
import { getComponentData } from './databaseService'; // Servicio que ya debe existir para acceder al Excel

export const getComponentDrawing = (componentCode) => {
  try {
    // Obtener datos del componente desde el servicio de base de datos
    const componentData = getComponentData(componentCode);
    
    if (!componentData || !componentData.Imagen) {
      return {
        found: false,
        errorMessage: "No technical drawing available for this component"
      };
    }
    
    // Construir la ruta al archivo de imagen
    const imagePath = `/images/drawings/${componentData.Imagen}.jpeg`;
    
    return {
      found: true,
      src: imagePath,
      alt: `Technical drawing for ${componentCode}`,
      imageCode: componentData.Imagen
    };
  } catch (error) {
    console.error("Error fetching component drawing:", error);
    return {
      found: false,
      errorMessage: "Error loading technical drawing data"
    };
  }
};