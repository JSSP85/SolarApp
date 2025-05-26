// src/services/photoGalleryService.js
import { getInspections } from '../firebase/inspectionService';

/**
 * Obtiene todas las fotos agrupadas por familia de componente
 */
export const getPhotosGroupedByFamily = async (filters = {}) => {
  try {
    // Obtener todas las inspecciones
    const inspections = await getInspections(filters);
    
    // Agrupar fotos por familia de componente
    const photosByFamily = {};
    
    inspections.forEach(inspection => {
      // Obtener datos básicos de la inspección
      const componentFamily = inspection.componentFamily || 
                              inspection.componentInfo?.componentFamily || 
                              'Unknown Family';
      
      const componentCode = inspection.componentCode || 
                            inspection.componentInfo?.componentCode || 
                            'Unknown Code';
      
      const componentName = inspection.componentName || 
                            inspection.componentInfo?.componentName || 
                            'Unknown Component';
      
      const inspectionDate = inspection.inspectionDate || 
                             inspection.inspectionInfo?.inspectionDate || 
                             new Date().toISOString().split('T')[0];
      
      const inspector = inspection.inspector || 
                        inspection.inspectionInfo?.inspector || 
                        'Unknown Inspector';
      
      const inspectionStatus = inspection.inspectionStatus || 
                               inspection.finalResults?.inspectionStatus || 
                               'in-progress';

      // Procesar fotos si existen
      if (inspection.photos && Array.isArray(inspection.photos) && inspection.photos.length > 0) {
        // Inicializar familia si no existe
        if (!photosByFamily[componentFamily]) {
          photosByFamily[componentFamily] = [];
        }
        
        // Agregar cada foto con metadatos
        inspection.photos.forEach((photo, photoIndex) => {
          photosByFamily[componentFamily].push({
            id: `${inspection.id}_${photoIndex}`,
            src: photo.src,
            dimensions: photo.dimensions || null,
            caption: photo.caption || `Photo ${photoIndex + 1}`,
            inspectionId: inspection.id,
            componentFamily,
            componentCode,
            componentName,
            inspectionDate,
            inspector,
            inspectionStatus,
            photoIndex,
            timestamp: new Date(inspectionDate).getTime(),
            // Metadatos adicionales para filtros
            year: new Date(inspectionDate).getFullYear(),
            month: new Date(inspectionDate).getMonth() + 1,
            day: new Date(inspectionDate).getDate()
          });
        });
      }
    });
    
    return photosByFamily;
  } catch (error) {
    console.error('Error fetching photos grouped by family:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de la galería
 */
export const getGalleryStats = async () => {
  try {
    const photosByFamily = await getPhotosGroupedByFamily();
    
    const stats = {
      totalFamilies: Object.keys(photosByFamily).length,
      totalPhotos: 0,
      familyStats: {},
      latestPhotos: [],
      oldestPhotos: []
    };
    
    const allPhotos = [];
    
    // Calcular estadísticas por familia
    Object.entries(photosByFamily).forEach(([family, photos]) => {
      stats.totalPhotos += photos.length;
      stats.familyStats[family] = {
        count: photos.length,
        latestDate: Math.max(...photos.map(p => p.timestamp)),
        oldestDate: Math.min(...photos.map(p => p.timestamp)),
        components: [...new Set(photos.map(p => p.componentCode))].length
      };
      
      allPhotos.push(...photos);
    });
    
    // Ordenar todas las fotos por fecha
    allPhotos.sort((a, b) => b.timestamp - a.timestamp);
    
    // Obtener las 10 fotos más recientes y más antiguas
    stats.latestPhotos = allPhotos.slice(0, 10);
    stats.oldestPhotos = allPhotos.slice(-10).reverse();
    
    return stats;
  } catch (error) {
    console.error('Error getting gallery stats:', error);
    throw error;
  }
};

/**
 * Filtra fotos por criterios específicos
 */
export const filterPhotos = (photosByFamily, filters) => {
  const {
    dateStart,
    dateEnd,
    componentCode,
    componentFamily,
    inspector,
    status
  } = filters;
  
  const filteredPhotos = {};
  
  Object.entries(photosByFamily).forEach(([family, photos]) => {
    const filtered = photos.filter(photo => {
      // Filtro por familia de componente
      if (componentFamily && photo.componentFamily !== componentFamily) {
        return false;
      }
      
      // Filtro por código de componente
      if (componentCode && !photo.componentCode.toLowerCase().includes(componentCode.toLowerCase())) {
        return false;
      }
      
      // Filtro por inspector
      if (inspector && !photo.inspector.toLowerCase().includes(inspector.toLowerCase())) {
        return false;
      }
      
      // Filtro por estado
      if (status && photo.inspectionStatus !== status) {
        return false;
      }
      
      // Filtro por fecha
      if (dateStart || dateEnd) {
        const photoDate = new Date(photo.inspectionDate);
        
        if (dateStart && photoDate < new Date(dateStart)) {
          return false;
        }
        
        if (dateEnd && photoDate > new Date(dateEnd)) {
          return false;
        }
      }
      
      return true;
    });
    
    if (filtered.length > 0) {
      filteredPhotos[family] = filtered;
    }
  });
  
  return filteredPhotos;
};

/**
 * Descarga una imagen
 */
export const downloadImage = async (photo) => {
  try {
    // Crear un enlace temporal para descargar
    const link = document.createElement('a');
    link.href = photo.src;
    link.download = `${photo.componentCode}_${photo.inspectionDate}_photo_${photo.photoIndex + 1}.jpg`;
    
    // Agregar al DOM temporalmente y hacer clic
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error downloading image:', error);
    
    // Fallback: abrir en nueva ventana
    try {
      window.open(photo.src, '_blank');
      return true;
    } catch (fallbackError) {
      console.error('Fallback download also failed:', fallbackError);
      return false;
    }
  }
};

/**
 * Convierte una imagen a base64 para descarga alternativa
 */
export const getImageAsBase64 = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};