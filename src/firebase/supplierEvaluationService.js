// src/firebase/supplierEvaluationService.js
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

// Collection name in Firestore
const SUPPLIER_EVALUATIONS_COLLECTION = 'supplierEvaluations';

/**
 * Convert application data to Firestore format
 */
const createSupplierEvaluationDocument = (supplierData) => {
  return {
    // Basic Information
    supplierName: supplierData.supplierName || '',
    category: supplierData.category || '',
    location: supplierData.location || '',
    contactPerson: supplierData.contactPerson || '',
    auditDate: supplierData.auditDate || '',
    auditorName: supplierData.auditorName || '',
    activityField: supplierData.activityField || '',
    auditType: supplierData.auditType || '',
    
    // Certifications
    certifications: {
      iso9001: supplierData.certifications?.iso9001 || false,
      iso14001: supplierData.certifications?.iso14001 || false,
      iso45001: supplierData.certifications?.iso45001 || false,
      en1090: supplierData.certifications?.en1090 || false,
      ceMarking: supplierData.certifications?.ceMarking || false,
      others: supplierData.certifications?.others || ''
    },
    
    // Company Data
    companyData: {
      annualRevenue: supplierData.companyData?.annualRevenue || '',
      employees: supplierData.companyData?.employees || ''
    },
    
    // KPI Scores
    kpiScores: {
      kpi1: supplierData.kpiScores?.kpi1 || 0,
      kpi2: supplierData.kpiScores?.kpi2 || 0,
      kpi3: supplierData.kpiScores?.kpi3 || 0,
      kpi4: supplierData.kpiScores?.kpi4 || 0,
      kpi5: supplierData.kpiScores?.kpi5 || 0
    },
    
    // KPI Details (if provided)
    kpiDetails: supplierData.kpiDetails || {},
    
    // Observations
    observations: {
      strengths: supplierData.observations?.strengths || '',
      improvements: supplierData.observations?.improvements || '',
      actions: supplierData.observations?.actions || '',
      followUpDate: supplierData.observations?.followUpDate || ''
    },
    
    // Calculated fields
    gai: supplierData.gai || 0,
    supplierClass: supplierData.supplierClass || 'C',
    
    // Metadata
    createdBy: supplierData.createdBy || '',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
};

/**
 * Convert Firestore data to application format
 */
const convertFirestoreToAppData = (firestoreDoc) => {
  const data = firestoreDoc.data();
  
  return {
    id: firestoreDoc.id,
    
    // Basic Information
    supplierName: data.supplierName || '',
    category: data.category || '',
    location: data.location || '',
    contactPerson: data.contactPerson || '',
    auditDate: data.auditDate || '',
    auditorName: data.auditorName || '',
    activityField: data.activityField || '',
    auditType: data.auditType || '',
    
    // Certifications
    certifications: {
      iso9001: data.certifications?.iso9001 || false,
      iso14001: data.certifications?.iso14001 || false,
      iso45001: data.certifications?.iso45001 || false,
      en1090: data.certifications?.en1090 || false,
      ceMarking: data.certifications?.ceMarking || false,
      others: data.certifications?.others || ''
    },
    
    // Company Data
    companyData: {
      annualRevenue: data.companyData?.annualRevenue || '',
      employees: data.companyData?.employees || ''
    },
    
    // KPI Scores
    kpiScores: {
      kpi1: data.kpiScores?.kpi1 || 0,
      kpi2: data.kpiScores?.kpi2 || 0,
      kpi3: data.kpiScores?.kpi3 || 0,
      kpi4: data.kpiScores?.kpi4 || 0,
      kpi5: data.kpiScores?.kpi5 || 0
    },
    
    // KPI Details
    kpiDetails: data.kpiDetails || {},
    
    // Observations
    observations: {
      strengths: data.observations?.strengths || '',
      improvements: data.observations?.improvements || '',
      actions: data.observations?.actions || '',
      followUpDate: data.observations?.followUpDate || ''
    },
    
    // Calculated fields
    gai: data.gai || 0,
    supplierClass: data.supplierClass || 'C',
    
    // Metadata
    createdBy: data.createdBy || '',
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
  };
};

/**
 * Save a new supplier evaluation to Firestore
 * @param {Object} supplierData - Supplier evaluation data from the application
 * @returns {Promise<string>} - ID of the created document
 */
export const saveSupplierEvaluation = async (supplierData) => {
  try {
    console.log('Saving supplier evaluation to Firestore...', supplierData);
    
    // Convert data to Firestore format
    const firestoreData = createSupplierEvaluationDocument(supplierData);
    
    // Add to collection
    const docRef = await addDoc(collection(db, SUPPLIER_EVALUATIONS_COLLECTION), firestoreData);
    
    console.log('Supplier evaluation saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving supplier evaluation:', error);
    throw new Error(`Error saving supplier evaluation: ${error.message}`);
  }
};

/**
 * Update an existing supplier evaluation
 * @param {string} evaluationId - ID of the document to update
 * @param {Object} supplierData - New supplier evaluation data
 * @returns {Promise<void>}
 */
export const updateSupplierEvaluation = async (evaluationId, supplierData) => {
  try {
    console.log('Updating supplier evaluation:', evaluationId);
    
    // Convert data to Firestore format
    const firestoreData = createSupplierEvaluationDocument(supplierData);
    
    // Update timestamp
    firestoreData.updatedAt = Timestamp.now();
    
    // Get document reference
    const docRef = doc(db, SUPPLIER_EVALUATIONS_COLLECTION, evaluationId);
    
    // Update document
    await updateDoc(docRef, firestoreData);
    
    console.log('Supplier evaluation updated successfully');
  } catch (error) {
    console.error('Error updating supplier evaluation:', error);
    throw new Error(`Error updating supplier evaluation: ${error.message}`);
  }
};

/**
 * Delete a supplier evaluation
 * @param {string} evaluationId - ID of the document to delete
 * @returns {Promise<void>}
 */
export const deleteSupplierEvaluation = async (evaluationId) => {
  try {
    console.log('Deleting supplier evaluation:', evaluationId);
    
    const docRef = doc(db, SUPPLIER_EVALUATIONS_COLLECTION, evaluationId);
    await deleteDoc(docRef);
    
    console.log('Supplier evaluation deleted successfully');
  } catch (error) {
    console.error('Error deleting supplier evaluation:', error);
    throw new Error(`Error deleting supplier evaluation: ${error.message}`);
  }
};

/**
 * Get a single supplier evaluation by ID
 * @param {string} evaluationId - ID of the document to retrieve
 * @returns {Promise<Object|null>} - Supplier evaluation data or null if not found
 */
export const getSupplierEvaluation = async (evaluationId) => {
  try {
    console.log('Getting supplier evaluation:', evaluationId);
    
    const docRef = doc(db, SUPPLIER_EVALUATIONS_COLLECTION, evaluationId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertFirestoreToAppData(docSnap);
    } else {
      console.log('Supplier evaluation not found');
      return null;
    }
  } catch (error) {
    console.error('Error getting supplier evaluation:', error);
    throw new Error(`Error getting supplier evaluation: ${error.message}`);
  }
};

/**
 * Get all supplier evaluations
 * @param {Object} options - Query options
 * @param {string} options.orderBy - Field to order by (default: 'createdAt')
 * @param {string} options.orderDirection - Order direction ('asc' or 'desc', default: 'desc')
 * @param {number} options.limit - Maximum number of results
 * @returns {Promise<Array>} - Array of supplier evaluation data
 */
export const getAllSupplierEvaluations = async (options = {}) => {
  try {
    console.log('Getting all supplier evaluations...');
    
    const {
      orderBy: orderByField = 'createdAt',
      orderDirection = 'desc',
      limit: limitCount
    } = options;
    
    // Build query
    let q = collection(db, SUPPLIER_EVALUATIONS_COLLECTION);
    
    // Add ordering
    q = query(q, orderBy(orderByField, orderDirection));
    
    // Add limit if specified
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    // Execute query
    const querySnapshot = await getDocs(q);
    
    // Convert results
    const supplierEvaluations = [];
    querySnapshot.forEach((doc) => {
      supplierEvaluations.push(convertFirestoreToAppData(doc));
    });
    
    console.log(`Retrieved ${supplierEvaluations.length} supplier evaluations`);
    return supplierEvaluations;
    
  } catch (error) {
    console.error('Error getting supplier evaluations:', error);
    throw new Error(`Error getting supplier evaluations: ${error.message}`);
  }
};

/**
 * Get supplier evaluations by category
 * @param {string} category - Supplier category to filter by
 * @returns {Promise<Array>} - Array of supplier evaluation data
 */
export const getSupplierEvaluationsByCategory = async (category) => {
  try {
    console.log('Getting supplier evaluations by category:', category);
    
    const q = query(
      collection(db, SUPPLIER_EVALUATIONS_COLLECTION),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const supplierEvaluations = [];
    querySnapshot.forEach((doc) => {
      supplierEvaluations.push(convertFirestoreToAppData(doc));
    });
    
    console.log(`Retrieved ${supplierEvaluations.length} supplier evaluations for category: ${category}`);
    return supplierEvaluations;
    
  } catch (error) {
    console.error('Error getting supplier evaluations by category:', error);
    throw new Error(`Error getting supplier evaluations by category: ${error.message}`);
  }
};

/**
 * Get supplier evaluations by class (A, B, C)
 * @param {string} supplierClass - Supplier class to filter by
 * @returns {Promise<Array>} - Array of supplier evaluation data
 */
export const getSupplierEvaluationsByClass = async (supplierClass) => {
  try {
    console.log('Getting supplier evaluations by class:', supplierClass);
    
    const q = query(
      collection(db, SUPPLIER_EVALUATIONS_COLLECTION),
      where('supplierClass', '==', supplierClass),
      orderBy('gai', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const supplierEvaluations = [];
    querySnapshot.forEach((doc) => {
      supplierEvaluations.push(convertFirestoreToAppData(doc));
    });
    
    console.log(`Retrieved ${supplierEvaluations.length} supplier evaluations for class: ${supplierClass}`);
    return supplierEvaluations;
    
  } catch (error) {
    console.error('Error getting supplier evaluations by class:', error);
    throw new Error(`Error getting supplier evaluations by class: ${error.message}`);
  }
};

/**
 * Get supplier evaluations statistics
 * @returns {Promise<Object>} - Statistics object
 */
export const getSupplierEvaluationStats = async () => {
  try {
    console.log('Getting supplier evaluation statistics...');
    
    const querySnapshot = await getDocs(collection(db, SUPPLIER_EVALUATIONS_COLLECTION));
    
    let totalSuppliers = 0;
    let classA = 0;
    let classB = 0;
    let classC = 0;
    const categoryCounts = {};
    let totalGAI = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalSuppliers++;
      
      // Count by class
      switch (data.supplierClass) {
        case 'A':
          classA++;
          break;
        case 'B':
          classB++;
          break;
        case 'C':
          classC++;
          break;
      }
      
      // Count by category
      const category = data.category || 'Unknown';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      
      // Sum GAI for average
      totalGAI += data.gai || 0;
    });
    
    const stats = {
      totalSuppliers,
      classA,
      classB,
      classC,
      categoryCounts,
      averageGAI: totalSuppliers > 0 ? Math.round(totalGAI / totalSuppliers) : 0,
      classAPercentage: totalSuppliers > 0 ? Math.round((classA / totalSuppliers) * 100) : 0,
      classBPercentage: totalSuppliers > 0 ? Math.round((classB / totalSuppliers) * 100) : 0,
      classCPercentage: totalSuppliers > 0 ? Math.round((classC / totalSuppliers) * 100) : 0
    };
    
    console.log('Supplier evaluation statistics:', stats);
    return stats;
    
  } catch (error) {
    console.error('Error getting supplier evaluation statistics:', error);
    throw new Error(`Error getting supplier evaluation statistics: ${error.message}`);
  }
};