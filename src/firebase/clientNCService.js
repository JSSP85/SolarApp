// src/firebase/clientNCService.js
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';

const CLIENT_NC_COLLECTION = 'client_nc_registry';

/**
 * Add new Client NC to registry
 * @param {Object} ncData - Client NC data
 * @returns {Promise<string>} - Document ID
 */
export const addClientNC = async (ncData) => {
  try {
    const ncWithTimestamp = {
      ...ncData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, CLIENT_NC_COLLECTION), ncWithTimestamp);
    console.log('✅ Client NC added to registry:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding Client NC:', error);
    throw new Error(`Error adding Client NC: ${error.message}`);
  }
};

/**
 * Update existing Client NC
 * @param {string} docId - Document ID
 * @param {Object} updates - Data to update
 * @returns {Promise<void>}
 */
export const updateClientNC = async (docId, updates) => {
  try {
    const docRef = doc(db, CLIENT_NC_COLLECTION, docId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    console.log('✅ Client NC updated:', docId);
  } catch (error) {
    console.error('❌ Error updating Client NC:', error);
    throw new Error(`Error updating Client NC: ${error.message}`);
  }
};

/**
 * Delete Client NC from registry
 * @param {string} docId - Document ID
 * @returns {Promise<void>}
 */
export const deleteClientNC = async (docId) => {
  try {
    const docRef = doc(db, CLIENT_NC_COLLECTION, docId);
    await deleteDoc(docRef);
    console.log('✅ Client NC deleted:', docId);
  } catch (error) {
    console.error('❌ Error deleting Client NC:', error);
    throw new Error(`Error deleting Client NC: ${error.message}`);
  }
};

/**
 * Get all Client NCs from registry
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} - Array of Client NC records
 */
export const getAllClientNCs = async (filters = {}) => {
  try {
    let q = collection(db, CLIENT_NC_COLLECTION);
    
    const constraints = [];
    
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters.ncClass) {
      constraints.push(where('ncClass', '==', filters.ncClass));
    }
    if (filters.year) {
      constraints.push(where('year', '==', parseInt(filters.year)));
    }
    if (filters.detectionPhase) {
      constraints.push(where('detectionPhase', '==', filters.detectionPhase));
    }
    
    // Order by date of detection (descending)
    constraints.push(orderBy('dateOfDetection', 'desc'));
    
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }
    
    const querySnapshot = await getDocs(q);
    const ncs = [];
    
    querySnapshot.forEach((doc) => {
      ncs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Retrieved ${ncs.length} Client NCs from registry`);
    return ncs;
  } catch (error) {
    console.error('❌ Error getting Client NCs:', error);
    throw new Error(`Error getting Client NCs: ${error.message}`);
  }
};

/**
 * Get single Client NC by ID
 * @param {string} docId - Document ID
 * @returns {Promise<Object|null>}
 */
export const getClientNCById = async (docId) => {
  try {
    const docRef = doc(db, CLIENT_NC_COLLECTION, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting Client NC by ID:', error);
    throw new Error(`Error getting Client NC: ${error.message}`);
  }
};

/**
 * Get Client NC statistics
 * @returns {Promise<Object>} - Statistics object
 */
export const getClientNCStats = async () => {
  try {
    const ncs = await getAllClientNCs();
    
    const stats = {
      total: ncs.length,
      byStatus: {
        open: ncs.filter(nc => nc.status === 'open').length,
        in_progress: ncs.filter(nc => nc.status === 'in_progress').length,
        closed: ncs.filter(nc => nc.status === 'closed').length,
        cancelled: ncs.filter(nc => nc.status === 'cancelled').length
      },
      byClass: {
        critical: ncs.filter(nc => nc.ncClass === 'critical').length,
        major: ncs.filter(nc => nc.ncClass === 'major').length,
        minor: ncs.filter(nc => nc.ncClass === 'minor').length
      },
      byClient: {}
    };
    
    // Count by client
    ncs.forEach(nc => {
      const client = nc.ncIssuer || 'Unknown';
      stats.byClient[client] = (stats.byClient[client] || 0) + 1;
    });
    
    return stats;
  } catch (error) {
    console.error('❌ Error getting Client NC stats:', error);
    throw new Error(`Error getting stats: ${error.message}`);
  }
};