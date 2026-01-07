// src/firebase/instrumentsService.js

import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate validity years based on category
 */
const getValidityYears = (category) => {
  switch(category) {
    case 'A': return 3;
    case 'B': return 2;
    case 'C': return null; // No verification required
    default: return null;
  }
};

/**
 * Calculate expiration date from calibration date and category
 */
const calculateExpirationDate = (calibrationDate, category) => {
  const validityYears = getValidityYears(category);
  if (!validityYears || !calibrationDate) return null;

  const expDate = new Date(calibrationDate);
  expDate.setFullYear(expDate.getFullYear() + validityYears);
  return Timestamp.fromDate(expDate);
};

/**
 * Calculate days until expiration
 */
const calculateDaysUntilExpiration = (expirationDate) => {
  if (!expirationDate) return null;

  const today = new Date();
  const expDate = expirationDate.toDate();
  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Determine calibration status based on days until expiration
 */
const getCalibrationStatus = (daysUntilExpiration, category) => {
  if (category === 'C') return 'not_required';
  if (daysUntilExpiration === null) return 'unknown';
  if (daysUntilExpiration < 0) return 'expired';
  if (daysUntilExpiration <= 30) return 'expiring_soon';
  return 'valid';
};

/**
 * Determine location type based on assigned_to and cabinet
 */
const getLocationType = (assigned_to, cabinet) => {
  if (cabinet && cabinet.trim() !== '') return 'cabinet';
  if (assigned_to && assigned_to.trim() !== '') return 'person';
  return 'unknown';
};

// ============================================================================
// IMPORT FROM EXCEL (One-time initial import)
// ============================================================================

/**
 * Import instruments from Excel
 * Expected columns: N., STRUMENTO, MISURA/TIPO, COSTRUTTORE, MODELLO,
 * MATRICOLA, REPARTO, ARMADIO, CAT., ASSEGNAZIONE, VERIFICA, SCADENZA
 */
export const importInstrumentsFromExcel = async (excelData) => {
  try {
    console.log('🚀 Starting instruments import...');

    const batch = writeBatch(db);
    const instrumentsRef = collection(db, 'measurement_instruments');
    const importTimestamp = Timestamp.now();

    let imported = 0;
    let errors = [];

    for (const row of excelData) {
      try {
        // Validate required fields
        if (!row['N.'] || !row['STRUMENTO']) {
          errors.push(`Missing required fields in row: ${JSON.stringify(row)}`);
          continue;
        }

        const instrumentNumber = String(row['N.']).trim();
        const category = String(row['CAT.'] || '').trim().toUpperCase();

        // Parse dates
        let calibrationDate = null;
        let expirationDate = null;

        if (row['VERIFICA']) {
          // Handle Excel date format
          if (typeof row['VERIFICA'] === 'number') {
            // Excel serial date
            const excelEpoch = new Date(1899, 11, 30);
            calibrationDate = new Date(excelEpoch.getTime() + row['VERIFICA'] * 86400000);
          } else {
            calibrationDate = new Date(row['VERIFICA']);
          }
          calibrationDate = Timestamp.fromDate(calibrationDate);
        }

        if (row['SCADENZA']) {
          if (typeof row['SCADENZA'] === 'number') {
            const excelEpoch = new Date(1899, 11, 30);
            expirationDate = new Date(excelEpoch.getTime() + row['SCADENZA'] * 86400000);
          } else {
            expirationDate = new Date(row['SCADENZA']);
          }
          expirationDate = Timestamp.fromDate(expirationDate);
        }

        // If no expiration date provided, calculate it
        if (!expirationDate && calibrationDate && category !== 'C') {
          expirationDate = calculateExpirationDate(calibrationDate, category);
        }

        const daysUntilExpiration = expirationDate ? calculateDaysUntilExpiration(expirationDate) : null;
        const calibrationStatus = getCalibrationStatus(daysUntilExpiration, category);

        const assigned_to = String(row['ASSEGNAZIONE'] || '').trim();
        const cabinet = String(row['ARMADIO'] || '').trim();
        const locationType = getLocationType(assigned_to, cabinet);

        // Create calibration history entry
        const calibrationHistory = calibrationDate ? [{
          calibration_date: calibrationDate,
          expiration_date: expirationDate,
          certificate_url: null,
          notes: 'Initial import',
          created_at: importTimestamp
        }] : [];

        const instrumentData = {
          // Identification
          instrument_number: instrumentNumber,
          instrument_name: String(row['STRUMENTO'] || '').trim(),
          measurement_type: String(row['MISURA/TIPO'] || '').trim(),

          // Technical data
          manufacturer: String(row['COSTRUTTORE'] || '').trim(),
          model: String(row['MODELLO'] || '').trim(),
          serial_number: String(row['MATRICOLA'] || '').trim(),

          // Location
          department: String(row['REPARTO'] || '').trim(),
          location_type: locationType,
          assigned_to: assigned_to || null,
          cabinet: cabinet || null,

          // Category and calibration
          category: category || null,
          validity_years: getValidityYears(category),

          // Calibration history
          calibration_history: calibrationHistory,

          // Current calibration (last from history)
          current_calibration_date: calibrationDate,
          current_expiration_date: expirationDate,
          days_until_expiration: daysUntilExpiration,
          calibration_status: calibrationStatus,

          // Media (empty initially)
          certificate_pdf_url: null,
          instrument_photo_url: null,
          qr_code_data: instrumentNumber,
          qr_code_image_url: null, // Will be generated later

          // Metadata
          created_at: importTimestamp,
          updated_at: importTimestamp,
          notes: ''
        };

        // Use instrument_number as document ID
        const docRef = doc(instrumentsRef, instrumentNumber);
        batch.set(docRef, instrumentData);
        imported++;

      } catch (rowError) {
        console.error('Error processing row:', rowError);
        errors.push(`Error in row ${row['N.']}: ${rowError.message}`);
      }
    }

    // Commit batch
    await batch.commit();

    console.log(`✅ Import completed: ${imported} instruments imported`);

    return {
      success: true,
      imported: imported,
      errors: errors,
      message: `Successfully imported ${imported} instruments`
    };

  } catch (error) {
    console.error('❌ Import error:', error);
    return {
      success: false,
      imported: 0,
      errors: [error.message],
      message: `Import failed: ${error.message}`
    };
  }
};

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Get all instruments
 */
export const getAllInstruments = async () => {
  try {
    const instrumentsRef = collection(db, 'measurement_instruments');
    const q = query(instrumentsRef, orderBy('instrument_number', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamps to JS Dates for easier handling
      current_calibration_date: doc.data().current_calibration_date?.toDate() || null,
      current_expiration_date: doc.data().current_expiration_date?.toDate() || null,
      created_at: doc.data().created_at?.toDate() || null,
      updated_at: doc.data().updated_at?.toDate() || null
    }));
  } catch (error) {
    console.error('Error getting instruments:', error);
    throw error;
  }
};

/**
 * Get instrument by ID
 */
export const getInstrumentById = async (instrumentId) => {
  try {
    const docRef = doc(db, 'measurement_instruments', instrumentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Instrument not found');
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      current_calibration_date: data.current_calibration_date?.toDate() || null,
      current_expiration_date: data.current_expiration_date?.toDate() || null,
      created_at: data.created_at?.toDate() || null,
      updated_at: data.updated_at?.toDate() || null
    };
  } catch (error) {
    console.error('Error getting instrument:', error);
    throw error;
  }
};

/**
 * Create new instrument
 */
export const createInstrument = async (instrumentData) => {
  try {
    const instrumentsRef = collection(db, 'measurement_instruments');

    // Calculate calibration fields
    const calibrationDate = instrumentData.current_calibration_date ?
      Timestamp.fromDate(new Date(instrumentData.current_calibration_date)) : null;

    const expirationDate = calibrationDate ?
      calculateExpirationDate(calibrationDate.toDate(), instrumentData.category) : null;

    const daysUntilExpiration = expirationDate ?
      calculateDaysUntilExpiration(expirationDate) : null;

    const calibrationStatus = getCalibrationStatus(daysUntilExpiration, instrumentData.category);

    const locationType = getLocationType(instrumentData.assigned_to, instrumentData.cabinet);

    // Create calibration history entry
    const calibrationHistory = calibrationDate ? [{
      calibration_date: calibrationDate,
      expiration_date: expirationDate,
      certificate_url: instrumentData.certificate_pdf_url || null,
      notes: instrumentData.notes || '',
      created_at: serverTimestamp()
    }] : [];

    const newInstrument = {
      ...instrumentData,
      location_type: locationType,
      validity_years: getValidityYears(instrumentData.category),
      current_calibration_date: calibrationDate,
      current_expiration_date: expirationDate,
      days_until_expiration: daysUntilExpiration,
      calibration_status: calibrationStatus,
      calibration_history: calibrationHistory,
      qr_code_data: instrumentData.instrument_number,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };

    // Use instrument_number as document ID
    const docRef = doc(instrumentsRef, instrumentData.instrument_number);
    await setDoc(docRef, newInstrument);

    return {
      success: true,
      id: instrumentData.instrument_number,
      message: 'Instrument created successfully'
    };
  } catch (error) {
    console.error('Error creating instrument:', error);
    throw error;
  }
};

/**
 * Update existing instrument
 */
export const updateInstrument = async (instrumentId, updates) => {
  try {
    const docRef = doc(db, 'measurement_instruments', instrumentId);

    // Recalculate calibration fields if calibration date or category changed
    let updateData = { ...updates };

    if (updates.current_calibration_date || updates.category) {
      const currentDoc = await getDoc(docRef);
      const currentData = currentDoc.data();

      const calibrationDate = updates.current_calibration_date ?
        Timestamp.fromDate(new Date(updates.current_calibration_date)) :
        currentData.current_calibration_date;

      const category = updates.category || currentData.category;

      const expirationDate = calibrationDate ?
        calculateExpirationDate(calibrationDate.toDate(), category) : null;

      const daysUntilExpiration = expirationDate ?
        calculateDaysUntilExpiration(expirationDate) : null;

      const calibrationStatus = getCalibrationStatus(daysUntilExpiration, category);

      updateData = {
        ...updateData,
        current_calibration_date: calibrationDate,
        current_expiration_date: expirationDate,
        days_until_expiration: daysUntilExpiration,
        calibration_status: calibrationStatus,
        validity_years: getValidityYears(category)
      };
    }

    // Update location type if assigned_to or cabinet changed
    if (updates.assigned_to !== undefined || updates.cabinet !== undefined) {
      const currentDoc = await getDoc(docRef);
      const currentData = currentDoc.data();

      const assigned_to = updates.assigned_to !== undefined ? updates.assigned_to : currentData.assigned_to;
      const cabinet = updates.cabinet !== undefined ? updates.cabinet : currentData.cabinet;

      updateData.location_type = getLocationType(assigned_to, cabinet);
    }

    updateData.updated_at = serverTimestamp();

    await updateDoc(docRef, updateData);

    return {
      success: true,
      message: 'Instrument updated successfully'
    };
  } catch (error) {
    console.error('Error updating instrument:', error);
    throw error;
  }
};

/**
 * Delete instrument
 */
export const deleteInstrument = async (instrumentId) => {
  try {
    const docRef = doc(db, 'measurement_instruments', instrumentId);

    // Get instrument data to delete associated files
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();

      // Delete associated files from storage
      if (data.certificate_pdf_url) {
        try {
          const pdfRef = ref(storage, data.certificate_pdf_url);
          await deleteObject(pdfRef);
        } catch (err) {
          console.warn('Could not delete PDF:', err);
        }
      }

      if (data.instrument_photo_url) {
        try {
          const photoRef = ref(storage, data.instrument_photo_url);
          await deleteObject(photoRef);
        } catch (err) {
          console.warn('Could not delete photo:', err);
        }
      }

      if (data.qr_code_image_url) {
        try {
          const qrRef = ref(storage, data.qr_code_image_url);
          await deleteObject(qrRef);
        } catch (err) {
          console.warn('Could not delete QR code:', err);
        }
      }
    }

    await deleteDoc(docRef);

    return {
      success: true,
      message: 'Instrument deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting instrument:', error);
    throw error;
  }
};

/**
 * Add calibration record to instrument history
 */
export const addCalibrationRecord = async (instrumentId, calibrationData) => {
  try {
    const docRef = doc(db, 'measurement_instruments', instrumentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Instrument not found');
    }

    const instrumentData = docSnap.data();
    const category = instrumentData.category;

    const calibrationDate = Timestamp.fromDate(new Date(calibrationData.calibration_date));
    const expirationDate = calculateExpirationDate(calibrationDate.toDate(), category);
    const daysUntilExpiration = expirationDate ? calculateDaysUntilExpiration(expirationDate) : null;
    const calibrationStatus = getCalibrationStatus(daysUntilExpiration, category);

    // Create new calibration history entry
    const newCalibrationEntry = {
      calibration_date: calibrationDate,
      expiration_date: expirationDate,
      certificate_url: calibrationData.certificate_url || null,
      notes: calibrationData.notes || '',
      created_at: serverTimestamp()
    };

    // Add to history array
    const updatedHistory = [...(instrumentData.calibration_history || []), newCalibrationEntry];

    // Update instrument with new current calibration and history
    await updateDoc(docRef, {
      calibration_history: updatedHistory,
      current_calibration_date: calibrationDate,
      current_expiration_date: expirationDate,
      days_until_expiration: daysUntilExpiration,
      calibration_status: calibrationStatus,
      updated_at: serverTimestamp()
    });

    return {
      success: true,
      message: 'Calibration record added successfully'
    };
  } catch (error) {
    console.error('Error adding calibration record:', error);
    throw error;
  }
};

// ============================================================================
// DASHBOARD STATISTICS
// ============================================================================

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    const instruments = await getAllInstruments();

    const stats = {
      total_instruments: instruments.length,
      category_a: instruments.filter(i => i.category === 'A').length,
      category_b: instruments.filter(i => i.category === 'B').length,
      category_c: instruments.filter(i => i.category === 'C').length,
      expired: instruments.filter(i => i.calibration_status === 'expired').length,
      expiring_soon: instruments.filter(i => i.calibration_status === 'expiring_soon').length,
      valid: instruments.filter(i => i.calibration_status === 'valid').length,
      in_cabinets: instruments.filter(i => i.location_type === 'cabinet').length,
      with_people: instruments.filter(i => i.location_type === 'person').length
    };

    return stats;
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
};

/**
 * Get instruments expiring soon (within 30 days)
 */
export const getExpiringSoonInstruments = async () => {
  try {
    const instruments = await getAllInstruments();
    return instruments
      .filter(i => i.calibration_status === 'expiring_soon')
      .sort((a, b) => (a.days_until_expiration || 0) - (b.days_until_expiration || 0));
  } catch (error) {
    console.error('Error getting expiring instruments:', error);
    throw error;
  }
};

/**
 * Get expired instruments
 */
export const getExpiredInstruments = async () => {
  try {
    const instruments = await getAllInstruments();
    return instruments
      .filter(i => i.calibration_status === 'expired')
      .sort((a, b) => (a.days_until_expiration || 0) - (b.days_until_expiration || 0));
  } catch (error) {
    console.error('Error getting expired instruments:', error);
    throw error;
  }
};

// ============================================================================
// FILE UPLOAD HELPERS
// ============================================================================

/**
 * Upload instrument photo to Firebase Storage
 */
export const uploadInstrumentPhoto = async (instrumentNumber, file) => {
  try {
    const storageRef = ref(storage, `instruments/photos/${instrumentNumber}_${Date.now()}.jpg`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

/**
 * Upload calibration certificate PDF to Firebase Storage
 */
export const uploadCalibrationCertificate = async (instrumentNumber, file) => {
  try {
    const storageRef = ref(storage, `instruments/certificates/${instrumentNumber}_${Date.now()}.pdf`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading certificate:', error);
    throw error;
  }
};

/**
 * Upload QR code image to Firebase Storage
 */
export const uploadQRCodeImage = async (instrumentNumber, blob) => {
  try {
    const storageRef = ref(storage, `instruments/qrcodes/${instrumentNumber}.png`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading QR code:', error);
    throw error;
  }
};
