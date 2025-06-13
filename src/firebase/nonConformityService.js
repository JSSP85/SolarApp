// src/firebase/nonConformityService.js
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

// Nombre de la colección en Firestore
const NC_COLLECTION = 'nonConformities';

/**
 * Convierte datos de la aplicación al formato de Firestore
 */
const createNCDocument = (ncData) => {
  return {
    // Basic Information
    number: ncData.number || '',
    priority: ncData.priority || '',
    project: ncData.project || '',
    projectCode: ncData.projectCode || '',
    date: ncData.date || '',
    supplier: ncData.supplier || '',
    createdBy: ncData.createdBy || '',
    sector: ncData.sector || '',
    
    // NC Details
    ncType: ncData.ncType || '',
    description: ncData.description || '',
    purchaseOrder: ncData.purchaseOrder || '',
    componentCode: ncData.componentCode || '',
    quantity: parseInt(ncData.quantity) || 0,
    component: ncData.component || '',
    
    // Treatment/Resolution
    materialDisposition: ncData.materialDisposition || '',
    containmentAction: ncData.containmentAction || '',
    
    // Corrective Action
    rootCauseAnalysis: ncData.rootCauseAnalysis || '',
    correctiveActionPlan: ncData.correctiveActionPlan || '',
    
    // Status and Timeline
    status: ncData.status || 'open',
    assignedTo: ncData.assignedTo || '',
    plannedClosureDate: ncData.plannedClosureDate || '',
    actualClosureDate: ncData.actualClosureDate || '',
    
    // Photos (compressed)
    photos: ncData.photos || [],
    
    // Timestamps
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdDate: ncData.createdDate || new Date().toLocaleDateString('en-GB'),
    
    // Calculated fields
    daysOpen: ncData.daysOpen || 0,
    
    // Timeline
    timeline: ncData.timeline || [{
      date: `${new Date().toLocaleDateString('en-GB')} - ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
      title: '🚨 NC Created',
      description: `Non-conformity ${ncData.number} has been created and assigned.`,
      type: 'creation'
    }]
  };
};

/**
 * Convierte datos de Firestore al formato de la aplicación
 */
const convertFirestoreToAppData = (firestoreDoc) => {
  const data = firestoreDoc.data();
  
  return {
    id: firestoreDoc.id,
    
    // Basic Information
    number: data.number || '',
    priority: data.priority || '',
    project: data.project || '',
    projectCode: data.projectCode || '',
    date: data.date || '',
    supplier: data.supplier || '',
    createdBy: data.createdBy || '',
    sector: data.sector || '',
    
    // NC Details
    ncType: data.ncType || '',
    description: data.description || '',
    purchaseOrder: data.purchaseOrder || '',
    componentCode: data.componentCode || '',
    quantity: data.quantity?.toString() || '',
    component: data.component || '',
    
    // Treatment/Resolution
    materialDisposition: data.materialDisposition || '',
    containmentAction: data.containmentAction || '',
    
    // Corrective Action
    rootCauseAnalysis: data.rootCauseAnalysis || '',
    correctiveActionPlan: data.correctiveActionPlan || '',
    
    // Status and Timeline
    status: data.status || 'open',
    assignedTo: data.assignedTo || '',
    plannedClosureDate: data.plannedClosureDate || '',
    actualClosureDate: data.actualClosureDate || '',
    
    // Photos
    photos: data.photos || [],
    
    // Dates
    createdDate: data.createdDate || '',
    daysOpen: data.daysOpen || 0,
    
    // Timeline
    timeline: data.timeline || []
  };
};

/**
 * Guardar una nueva NC en Firestore
 * @param {Object} ncData - Datos de la NC desde el contexto
 * @returns {Promise<string>} - ID del documento creado
 */
export const saveNonConformity = async (ncData) => {
  try {
    console.log('Guardando NC en Firestore...', ncData);
    
    // Convertir los datos al formato de Firestore
    const firestoreData = createNCDocument(ncData);
    
    // Agregar a la colección
    const docRef = await addDoc(collection(db, NC_COLLECTION), firestoreData);
    
    console.log('NC guardada con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error guardando NC:', error);
    throw new Error(`Error saving non-conformity: ${error.message}`);
  }
};

/**
 * Actualizar una NC existente
 * @param {string} ncId - ID del documento a actualizar
 * @param {Object} ncData - Nuevos datos de la NC
 * @returns {Promise<void>}
 */
export const updateNonConformity = async (ncId, ncData) => {
  try {
    console.log('Actualizando NC:', ncId);
    
    // Convertir los datos al formato de Firestore
    const firestoreData = createNCDocument(ncData);
    
    // Actualizar timestamp
    firestoreData.updatedAt = Timestamp.now();
    
    // Obtener referencia al documento
    const docRef = doc(db, NC_COLLECTION, ncId);
    
    // Actualizar documento
    await updateDoc(docRef, firestoreData);
    
    console.log('NC actualizada exitosamente');
  } catch (error) {
    console.error('Error actualizando NC:', error);
    throw new Error(`Error updating non-conformity: ${error.message}`);
  }
};

/**
 * Obtener una NC por ID
 * @param {string} ncId - ID del documento
 * @returns {Promise<Object|null>} - Datos de la NC o null si no existe
 */
export const getNonConformity = async (ncId) => {
  try {
    const docRef = doc(db, NC_COLLECTION, ncId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertFirestoreToAppData(docSnap);
    } else {
      console.log('No se encontró la NC con ID:', ncId);
      return null;
    }
  } catch (error) {
    console.error('Error obteniendo NC:', error);
    throw new Error(`Error getting non-conformity: ${error.message}`);
  }
};

/**
 * Obtener todas las NCs con filtros opcionales
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} - Array de NCs
 */
export const getNonConformities = async (filters = {}) => {
  try {
    console.log('Obteniendo NCs con filtros:', filters);
    
    // Crear query base
    let q = query(collection(db, NC_COLLECTION), orderBy('createdAt', 'desc'));
    
    // Aplicar filtros si existen
    if (filters.status && filters.status !== 'all') {
      q = query(q, where('status', '==', filters.status));
    }
    
    if (filters.priority && filters.priority !== 'all') {
      q = query(q, where('priority', '==', filters.priority));
    }
    
    if (filters.project && filters.project !== 'all') {
      q = query(q, where('project', '==', filters.project));
    }
    
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }
    
    // Ejecutar query
    const querySnapshot = await getDocs(q);
    
    // Convertir resultados
    let nonConformities = [];
    querySnapshot.forEach((doc) => {
      nonConformities.push(convertFirestoreToAppData(doc));
    });
    
    // Filtrar por búsqueda en el cliente (Firestore no soporta búsqueda full-text)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      nonConformities = nonConformities.filter(nc => 
        nc.number.toLowerCase().includes(searchLower) ||
        nc.project.toLowerCase().includes(searchLower) ||
        nc.supplier.toLowerCase().includes(searchLower) ||
        nc.description.toLowerCase().includes(searchLower) ||
        nc.componentCode.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtrar por fechas en el cliente
    if (filters.dateStart) {
      nonConformities = nonConformities.filter(nc => 
        nc.date >= filters.dateStart
      );
    }
    
    if (filters.dateEnd) {
      nonConformities = nonConformities.filter(nc => 
        nc.date <= filters.dateEnd
      );
    }
    
    console.log(`Se encontraron ${nonConformities.length} NCs`);
    return nonConformities;
  } catch (error) {
    console.error('Error obteniendo NCs:', error);
    throw new Error(`Error getting non-conformities: ${error.message}`);
  }
};

/**
 * Eliminar una NC
 * @param {string} ncId - ID del documento a eliminar
 * @returns {Promise<void>}
 */
export const deleteNonConformity = async (ncId) => {
  try {
    const docRef = doc(db, NC_COLLECTION, ncId);
    await deleteDoc(docRef);
    console.log('NC eliminada:', ncId);
  } catch (error) {
    console.error('Error eliminando NC:', error);
    throw new Error(`Error deleting non-conformity: ${error.message}`);
  }
};

/**
 * Actualizar estado de una NC
 * @param {string} ncId - ID de la NC
 * @param {string} newStatus - Nuevo estado
 * @param {Object} additionalData - Datos adicionales (opcional)
 * @returns {Promise<void>}
 */
export const updateNCStatus = async (ncId, newStatus, additionalData = {}) => {
  try {
    const docRef = doc(db, NC_COLLECTION, ncId);
    
    const updateData = {
      status: newStatus,
      updatedAt: Timestamp.now(),
      ...additionalData
    };
    
    // Si se está cerrando, agregar fecha de cierre
    if (newStatus === 'resolved' || newStatus === 'closed') {
      updateData.actualClosureDate = new Date().toLocaleDateString('en-GB');
    }
    
    await updateDoc(docRef, updateData);
    console.log('Estado de NC actualizado:', ncId, newStatus);
  } catch (error) {
    console.error('Error actualizando estado de NC:', error);
    throw new Error(`Error updating NC status: ${error.message}`);
  }
};

/**
 * Agregar entrada al timeline de una NC
 * @param {string} ncId - ID de la NC
 * @param {Object} timelineEntry - Nueva entrada del timeline
 * @returns {Promise<void>}
 */
export const addTimelineEntry = async (ncId, timelineEntry) => {
  try {
    const nc = await getNonConformity(ncId);
    if (!nc) throw new Error('NC not found');
    
    const newTimeline = [timelineEntry, ...nc.timeline];
    
    const docRef = doc(db, NC_COLLECTION, ncId);
    await updateDoc(docRef, {
      timeline: newTimeline,
      updatedAt: Timestamp.now()
    });
    
    console.log('Timeline entry added to NC:', ncId);
  } catch (error) {
    console.error('Error adding timeline entry:', error);
    throw new Error(`Error adding timeline entry: ${error.message}`);
  }
};

/**
 * Obtener estadísticas generales de NCs
 * @returns {Promise<Object>} - Estadísticas de NCs
 */
export const getNCStats = async () => {
  try {
    const q = query(collection(db, NC_COLLECTION));
    const querySnapshot = await getDocs(q);
    
    const stats = {
      total: 0,
      open: 0,
      progress: 0,
      resolved: 0,
      closed: 0,
      critical: 0,
      major: 0,
      minor: 0,
      byProject: {},
      bySupplier: {},
      byCreator: {}
    };
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stats.total++;
      
      // Contar por estado
      const status = data.status || 'open';
      if (stats[status] !== undefined) stats[status]++;
      
      // Contar por prioridad
      const priority = data.priority || 'minor';
      if (stats[priority] !== undefined) stats[priority]++;
      
      // Contar por proyecto
      const project = data.project || 'Unknown';
      stats.byProject[project] = (stats.byProject[project] || 0) + 1;
      
      // Contar por supplier
      const supplier = data.supplier || 'Unknown';
      stats.bySupplier[supplier] = (stats.bySupplier[supplier] || 0) + 1;
      
      // Contar por creador
      const creator = data.createdBy || 'Unknown';
      stats.byCreator[creator] = (stats.byCreator[creator] || 0) + 1;
    });
    
    return stats;
  } catch (error) {
    console.error('Error obteniendo estadísticas de NC:', error);
    throw new Error(`Error getting NC stats: ${error.message}`);
  }
};

/**
 * Buscar NCs por texto
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<Array>} - Array de NCs que coinciden
 */
export const searchNonConformities = async (searchTerm) => {
  try {
    // Obtener todas las NCs y filtrar en el cliente
    // (Firestore no tiene búsqueda full-text nativa)
    const allNCs = await getNonConformities();
    
    const searchLower = searchTerm.toLowerCase();
    
    return allNCs.filter(nc => 
      nc.number.toLowerCase().includes(searchLower) ||
      nc.project.toLowerCase().includes(searchLower) ||
      nc.supplier.toLowerCase().includes(searchLower) ||
      nc.description.toLowerCase().includes(searchLower) ||
      nc.componentCode.toLowerCase().includes(searchLower) ||
      nc.component.toLowerCase().includes(searchLower) ||
      nc.ncType.toLowerCase().includes(searchLower) ||
      nc.createdBy.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error buscando NCs:', error);
    throw new Error(`Error searching non-conformities: ${error.message}`);
  }
};