// src/firebase/ncRegistryService.js
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

const NC_REGISTRY_COLLECTION = 'nc_registry';

/**
 * Add new NC to registry
 * @param {Object} ncData - NC data
 * @returns {Promise<string>} - Document ID
 */
export const addNCToRegistry = async (ncData) => {
  try {
    const ncWithTimestamp = {
      ...ncData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, NC_REGISTRY_COLLECTION), ncWithTimestamp);
    console.log('✅ NC added to registry:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding NC:', error);
    throw new Error(`Error adding NC: ${error.message}`);
  }
};

/**
 * Update existing NC
 * @param {string} docId - Document ID
 * @param {Object} updates - Data to update
 * @returns {Promise<void>}
 */
export const updateNCInRegistry = async (docId, updates) => {
  try {
    const docRef = doc(db, NC_REGISTRY_COLLECTION, docId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    console.log('✅ NC updated:', docId);
  } catch (error) {
    console.error('❌ Error updating NC:', error);
    throw new Error(`Error updating NC: ${error.message}`);
  }
};

/**
 * Delete NC from registry
 * @param {string} docId - Document ID
 * @returns {Promise<void>}
 */
export const deleteNCFromRegistry = async (docId) => {
  try {
    const docRef = doc(db, NC_REGISTRY_COLLECTION, docId);
    await deleteDoc(docRef);
    console.log('✅ NC deleted:', docId);
  } catch (error) {
    console.error('❌ Error deleting NC:', error);
    throw new Error(`Error deleting NC: ${error.message}`);
  }
};

/**
 * Get all NCs from registry
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} - Array of NC records
 */
export const getAllNCs = async (filters = {}) => {
  try {
    let q = collection(db, NC_REGISTRY_COLLECTION);
    
    // Apply filters if provided
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
    
    // Add ordering
    constraints.push(orderBy('number', 'desc'));
    
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
    
    console.log(`✅ Retrieved ${ncs.length} NCs from registry`);
    return ncs;
  } catch (error) {
    console.error('❌ Error getting NCs:', error);
    throw new Error(`Error getting NCs: ${error.message}`);
  }
};

/**
 * Get single NC by ID
 * @param {string} docId - Document ID
 * @returns {Promise<Object|null>}
 */
export const getNCById = async (docId) => {
  try {
    const docRef = doc(db, NC_REGISTRY_COLLECTION, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting NC:', error);
    throw new Error(`Error getting NC: ${error.message}`);
  }
};

/**
 * Update NC status
 * @param {string} docId - Document ID
 * @param {string} newStatus - New status value
 * @returns {Promise<void>}
 */
export const updateNCStatus = async (docId, newStatus) => {
  try {
    const updates = {
      status: newStatus,
      updatedAt: Timestamp.now()
    };
    
    // If closing, add closure date
    if (newStatus === 'closed' && !updates.dateOfClosure) {
      updates.dateOfClosure = new Date().toISOString().split('T')[0];
    }
    
    await updateNCInRegistry(docId, updates);
  } catch (error) {
    console.error('❌ Error updating status:', error);
    throw new Error(`Error updating status: ${error.message}`);
  }
};

/**
 * Get NC statistics
 * @returns {Promise<Object>}
 */
export const getNCStatistics = async () => {
  try {
    const allNCs = await getAllNCs();
    
    const stats = {
      total: allNCs.length,
      open: allNCs.filter(nc => nc.status === 'open').length,
      inProgress: allNCs.filter(nc => nc.status === 'in_progress').length,
      closed: allNCs.filter(nc => nc.status === 'closed').length,
      cancelled: allNCs.filter(nc => nc.status === 'cancelled').length,
      critical: allNCs.filter(nc => nc.ncClass === 'critical').length,
      major: allNCs.filter(nc => nc.ncClass === 'major').length,
      minor: allNCs.filter(nc => nc.ncClass === 'minor').length,
      byDetectionPhase: {},
      byYear: {},
      byMonth: {}
    };
    
    // Group by detection phase
    allNCs.forEach(nc => {
      if (nc.detectionPhase) {
        stats.byDetectionPhase[nc.detectionPhase] = 
          (stats.byDetectionPhase[nc.detectionPhase] || 0) + 1;
      }
      if (nc.year) {
        stats.byYear[nc.year] = (stats.byYear[nc.year] || 0) + 1;
      }
      if (nc.month) {
        stats.byMonth[nc.month] = (stats.byMonth[nc.month] || 0) + 1;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('❌ Error getting statistics:', error);
    throw new Error(`Error getting statistics: ${error.message}`);
  }
};

/**
 * Bulk import NCs from Excel data
 * @param {Array} ncArray - Array of NC objects
 * @returns {Promise<Object>} - Import results
 */
export const bulkImportNCs = async (ncArray) => {
  try {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const ncData of ncArray) {
      try {
        await addNCToRegistry(ncData);
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push({
          nc: ncData.number,
          error: error.message
        });
      }
    }
    
    console.log(`✅ Import complete: ${successCount} success, ${errorCount} errors`);
    
    return {
      success: successCount,
      errors: errorCount,
      errorDetails: errors
    };
  } catch (error) {
    console.error('❌ Bulk import error:', error);
    throw new Error(`Bulk import error: ${error.message}`);
  }
};

/**
 * Get next NC number
 * @returns {Promise<string>}
 */
export const getNextNCNumber = async () => {
  try {
    const allNCs = await getAllNCs();
    
    if (allNCs.length === 0) {
      return '562'; // Start from 562 if empty
    }
    
    const numbers = allNCs
      .map(nc => parseInt(nc.number))
      .filter(num => !isNaN(num));
    
    const maxNumber = Math.max(...numbers);
    return String(maxNumber + 1);
  } catch (error) {
    console.error('❌ Error getting next number:', error);
    return '562';
  }
};
