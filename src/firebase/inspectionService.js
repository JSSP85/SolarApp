// src/firebase/inspectionService.js
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';
import { createInspectionDocument, convertFirestoreToAppData } from './dataStructure';

// Nombre de la colección en Firestore
const INSPECTIONS_COLLECTION = 'inspections';

/**
 * Guardar una nueva inspección en Firestore
 * @param {Object} inspectionData - Datos de la inspección desde el contexto
 * @returns {Promise<string>} - ID del documento creado
 */
export const saveInspection = async (inspectionData) => {
  try {
    console.log('Guardando inspección en Firestore...', inspectionData);
    
    // Convertir los datos al formato de Firestore
    const firestoreData = createInspectionDocument(inspectionData);
    
    // Agregar a la colección
    const docRef = await addDoc(collection(db, INSPECTIONS_COLLECTION), firestoreData);
    
    console.log('Inspección guardada con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error guardando inspección:', error);
    throw new Error(`Error saving inspection: ${error.message}`);
  }
};

/**
 * Actualizar una inspección existente
 * @param {string} inspectionId - ID del documento a actualizar
 * @param {Object} inspectionData - Nuevos datos de la inspección
 * @returns {Promise<void>}
 */
export const updateInspection = async (inspectionId, inspectionData) => {
  try {
    console.log('Actualizando inspección:', inspectionId);
    
    // Convertir los datos al formato de Firestore
    const firestoreData = createInspectionDocument(inspectionData);
    
    // Actualizar timestamp
    firestoreData.updatedAt = Timestamp.now();
    
    // Obtener referencia al documento
    const docRef = doc(db, INSPECTIONS_COLLECTION, inspectionId);
    
    // Actualizar documento
    await updateDoc(docRef, firestoreData);
    
    console.log('Inspección actualizada exitosamente');
  } catch (error) {
    console.error('Error actualizando inspección:', error);
    throw new Error(`Error updating inspection: ${error.message}`);
  }
};

/**
 * Obtener una inspección por ID
 * @param {string} inspectionId - ID del documento
 * @returns {Promise<Object|null>} - Datos de la inspección o null si no existe
 */
export const getInspection = async (inspectionId) => {
  try {
    const docRef = doc(db, INSPECTIONS_COLLECTION, inspectionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertFirestoreToAppData(docSnap);
    } else {
      console.log('No se encontró la inspección con ID:', inspectionId);
      return null;
    }
  } catch (error) {
    console.error('Error obteniendo inspección:', error);
    throw new Error(`Error getting inspection: ${error.message}`);
  }
};

/**
 * Obtener todas las inspecciones con filtros opcionales
 * @param {Object} filters - Filtros opcionales
 * @param {string} filters.projectName - Filtrar por proyecto
 * @param {string} filters.componentFamily - Filtrar por familia de componente
 * @param {string} filters.inspector - Filtrar por inspector
 * @param {string} filters.status - Filtrar por estado
 * @param {number} filters.limit - Límite de resultados
 * @returns {Promise<Array>} - Array de inspecciones
 */
export const getInspections = async (filters = {}) => {
  try {
    let q = collection(db, INSPECTIONS_COLLECTION);
    
    // Aplicar filtros si existen
    const queryConstraints = [];
    
    if (filters.projectName) {
      queryConstraints.push(where('componentInfo.projectName', '==', filters.projectName));
    }
    
    if (filters.componentFamily) {
      queryConstraints.push(where('componentInfo.componentFamily', '==', filters.componentFamily));
    }
    
    if (filters.inspector) {
      queryConstraints.push(where('inspectionInfo.inspector', '==', filters.inspector));
    }
    
    if (filters.status) {
      queryConstraints.push(where('finalResults.inspectionStatus', '==', filters.status));
    }
    
    // Ordenar por fecha de creación (más recientes primero)
    queryConstraints.push(orderBy('createdAt', 'desc'));
    
    // Aplicar límite si se especifica
    if (filters.limit) {
      queryConstraints.push(limit(filters.limit));
    }
    
    // Crear query con todos los constraints
    q = query(q, ...queryConstraints);
    
    // Ejecutar query
    const querySnapshot = await getDocs(q);
    const inspections = [];
    
    querySnapshot.forEach((doc) => {
      inspections.push(convertFirestoreToAppData(doc));
    });
    
    console.log(`Se encontraron ${inspections.length} inspecciones`);
    return inspections;
  } catch (error) {
    console.error('Error obteniendo inspecciones:', error);
    throw new Error(`Error getting inspections: ${error.message}`);
  }
};

/**
 * Eliminar una inspección
 * @param {string} inspectionId - ID del documento a eliminar
 * @returns {Promise<void>}
 */
export const deleteInspection = async (inspectionId) => {
  try {
    const docRef = doc(db, INSPECTIONS_COLLECTION, inspectionId);
    await deleteDoc(docRef);
    console.log('Inspección eliminada:', inspectionId);
  } catch (error) {
    console.error('Error eliminando inspección:', error);
    throw new Error(`Error deleting inspection: ${error.message}`);
  }
};

/**
 * Obtener estadísticas generales de inspecciones
 * @returns {Promise<Object>} - Estadísticas de inspecciones
 */
export const getInspectionStats = async () => {
  try {
    const q = query(collection(db, INSPECTIONS_COLLECTION));
    const querySnapshot = await getDocs(q);
    
    const stats = {
      total: 0,
      passed: 0,
      rejected: 0,
      inProgress: 0,
      byProject: {},
      byFamily: {},
      byInspector: {}
    };
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stats.total++;
      
      // Contar por estado
      const status = data.finalResults?.inspectionStatus || 'in-progress';
      if (status === 'pass') stats.passed++;
      else if (status === 'reject') stats.rejected++;
      else stats.inProgress++;
      
      // Contar por proyecto
      const project = data.componentInfo?.projectName || 'Unknown';
      stats.byProject[project] = (stats.byProject[project] || 0) + 1;
      
      // Contar por familia de componente
      const family = data.componentInfo?.componentFamily || 'Unknown';
      stats.byFamily[family] = (stats.byFamily[family] || 0) + 1;
      
      // Contar por inspector
      const inspector = data.inspectionInfo?.inspector || 'Unknown';
      stats.byInspector[inspector] = (stats.byInspector[inspector] || 0) + 1;
    });
    
    return stats;
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw new Error(`Error getting inspection stats: ${error.message}`);
  }
};

/**
 * Buscar inspecciones por texto libre
 * @param {string} searchText - Texto a buscar
 * @returns {Promise<Array>} - Array de inspecciones que coinciden
 */
export const searchInspections = async (searchText) => {
  try {
    // Firestore no tiene búsqueda de texto completo nativa,
    // por lo que obtenemos todos los documentos y filtramos en el cliente
    const q = query(
      collection(db, INSPECTIONS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(100) // Limitamos para evitar costos excesivos
    );
    
    const querySnapshot = await getDocs(q);
    const inspections = [];
    const searchLower = searchText.toLowerCase();
    
    querySnapshot.forEach((doc) => {
      const data = convertFirestoreToAppData(doc);
      
      // Buscar en varios campos
      const searchableText = [
        data.componentName,
        data.componentCode,
        data.projectName,
        data.inspector,
        data.inspectionSite,
        data.inspectionCity
      ].join(' ').toLowerCase();
      
      if (searchableText.includes(searchLower)) {
        inspections.push(data);
      }
    });
    
    return inspections;
  } catch (error) {
    console.error('Error buscando inspecciones:', error);
    throw new Error(`Error searching inspections: ${error.message}`);
  }
};
