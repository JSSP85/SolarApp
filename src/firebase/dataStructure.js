// src/firebase/dataStructure.js

/**
 * Estructura de datos para una inspección en Firestore
 */
export const createInspectionDocument = (inspectionData) => {
  const currentTime = new Date();
  
  return {
    // Metadatos del documento
    id: inspectionData.id || null, // Se auto-genera si no se proporciona
    createdAt: currentTime,
    updatedAt: currentTime,
    status: inspectionData.inspectionStatus || 'in-progress',
    
    // Información del componente
    componentInfo: {
      client: inspectionData.client || '',
      projectName: inspectionData.projectName || '',
      componentFamily: inspectionData.componentFamily || '',
      componentCode: inspectionData.componentCode || '',
      componentName: inspectionData.componentName || '',
      surfaceProtection: inspectionData.surfaceProtection || '',
      thickness: inspectionData.thickness || null,
      specialCoating: inspectionData.specialCoating || null,
      batchQuantity: parseInt(inspectionData.batchQuantity) || 0
    },
    
    // Información de la inspección
    inspectionInfo: {
      inspector: inspectionData.inspector || '',
      inspectionDate: inspectionData.inspectionDate || '',
      inspectionCountry: inspectionData.inspectionCountry || '',
      inspectionCity: inspectionData.inspectionCity || '',
      inspectionSite: inspectionData.inspectionSite || '',
      inspectionAddress: inspectionData.inspectionAddress || '',
      coordinates: inspectionData.mapCoords || null
    },
    
    // Mediciones
    measurements: {
      dimensional: {
        dimensions: inspectionData.dimensions || [],
        measurements: inspectionData.dimensionMeasurements || {},
        nonConformities: inspectionData.dimensionNonConformities || {},
        completedDimensions: inspectionData.completedDimensions || {}
      },
      coating: {
        requirements: inspectionData.coatingRequirements || {},
        meanCoating: parseFloat(inspectionData.meanCoating) || 0,
        localMeasurements: inspectionData.localCoatingMeasurements || [],
        stats: inspectionData.coatingStats || {}
      },
      visual: {
        conformity: inspectionData.visualConformity || '',
        notes: inspectionData.visualNotes || '',
        photos: inspectionData.photos || []
      }
    },
    
    // Equipo de medición
    equipment: inspectionData.measurementEquipment || [],
    
    // Información de muestra
    sampleInfo: {
      sampleInfo: inspectionData.sampleInfo || '',
      sampleCount: inspectionData.sampleCount || 0,
      inspectionStep: inspectionData.inspectionStep || 'first'
    },
    
    // Resultados finales
    finalResults: {
      totalNonConformities: inspectionData.totalNonConformities || 0,
      inspectionStatus: inspectionData.inspectionStatus || 'in-progress',
      completionPercentage: calculateCompletionPercentage(inspectionData)
    }
  };
};

/**
 * Calcula el porcentaje de completación de una inspección
 */
const calculateCompletionPercentage = (data) => {
  let completed = 0;
  let total = 5; // Setup, Dimensions, Coating, Visual, Final
  
  if (data.componentCode && data.inspector && data.batchQuantity) completed++;
  if (data.dimensions && data.dimensions.length > 0) completed++;
  if (data.dimensionMeasurements && Object.keys(data.dimensionMeasurements).length > 0) completed++;
  if (data.localCoatingMeasurements && data.localCoatingMeasurements.some(m => m !== '')) completed++;
  if (data.visualConformity) completed++;
  
  return Math.round((completed / total) * 100);
};

/**
 * Convierte datos de Firestore a formato de la aplicación
 */
export const convertFirestoreToAppData = (firestoreDoc) => {
  const data = firestoreDoc.data();
  
  return {
    id: firestoreDoc.id,
    
    // Component info
    client: data.componentInfo?.client || '',
    projectName: data.componentInfo?.projectName || '',
    componentFamily: data.componentInfo?.componentFamily || '',
    componentCode: data.componentInfo?.componentCode || '',
    componentName: data.componentInfo?.componentName || '',
    surfaceProtection: data.componentInfo?.surfaceProtection || '',
    thickness: data.componentInfo?.thickness || '',
    specialCoating: data.componentInfo?.specialCoating || '',
    batchQuantity: data.componentInfo?.batchQuantity?.toString() || '',
    
    // Inspection info
    inspector: data.inspectionInfo?.inspector || '',
    inspectionDate: data.inspectionInfo?.inspectionDate || '',
    inspectionCountry: data.inspectionInfo?.inspectionCountry || '',
    inspectionCity: data.inspectionInfo?.inspectionCity || '',
    inspectionSite: data.inspectionInfo?.inspectionSite || '',
    inspectionAddress: data.inspectionInfo?.inspectionAddress || '',
    mapCoords: data.inspectionInfo?.coordinates || { lat: 40.416775, lng: -3.703790 },
    
    // Measurements
    dimensions: data.measurements?.dimensional?.dimensions || [],
    dimensionMeasurements: data.measurements?.dimensional?.measurements || {},
    dimensionNonConformities: data.measurements?.dimensional?.nonConformities || {},
    completedDimensions: data.measurements?.dimensional?.completedDimensions || {},
    
    coatingRequirements: data.measurements?.coating?.requirements || {},
    meanCoating: data.measurements?.coating?.meanCoating?.toString() || '',
    localCoatingMeasurements: data.measurements?.coating?.localMeasurements || [],
    coatingStats: data.measurements?.coating?.stats || {},
    
    visualConformity: data.measurements?.visual?.conformity || '',
    visualNotes: data.measurements?.visual?.notes || '',
    photos: data.measurements?.visual?.photos || [],
    
    // Equipment
    measurementEquipment: data.equipment || [],
    
    // Sample info
    sampleInfo: data.sampleInfo?.sampleInfo || '',
    inspectionStep: data.sampleInfo?.inspectionStep || 'first',
    
    // Results
    totalNonConformities: data.finalResults?.totalNonConformities || 0,
    inspectionStatus: data.finalResults?.inspectionStatus || 'in-progress',
    
    // Timestamps
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
};
