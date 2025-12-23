// src/firebase/magazzinoService.js

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
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// ============================================================================
// IMPORT EXCEL (SAP DATABASE)
// ============================================================================

/**
 * Import articles from Excel (SAP export)
 * This OVERWRITES the SAP data but keeps movements intact
 * 
 * @param {Array} excelData - Array of objects from Excel
 * @returns {Object} - Import result with stats
 */
export const importArticoliFromExcel = async (excelData) => {
  try {
    const batch = writeBatch(db);
    const articoliRef = collection(db, 'articoli');
    const importTimestamp = Timestamp.now();
    
    let nuovi = 0;
    let aggiornati = 0;
    
    for (const row of excelData) {
      const articoloRef = doc(articoliRef, row.codice);
      const articoloSnap = await getDoc(articoloRef);
      
      // Check if article exists
      const exists = articoloSnap.exists();
      const existingData = exists ? articoloSnap.data() : {};
      
      // Prepare data - KEEP movimenti_totali from existing
      const articleData = {
        codice: row.codice,
        descrizione: row.descrizione || '',
        categoria: row.categoria || 'Altri',
        unita_misura: row.unita_misura || 'pz',
        giacenza_sap: parseInt(row.giacenza_attuale) || 0,  // From Excel
        giacenza_minima: parseInt(row.giacenza_minima) || 10,
        giacenza_massima: parseInt(row.giacenza_massima) || 100,
        ubicazione: row.ubicazione || '',
        fornitore_principale: row.fornitore_principale || '',
        prezzo_unitario: parseFloat(row.prezzo_unitario) || 0,
        codice_qr: row.codice_qr || '',
        
        // IMPORTANT: Keep existing movements, don't overwrite
        movimenti_totali: existingData.movimenti_totali || 0,
        
        // Calculate current magazino stock: SAP + movements
        giacenza_attuale_magazino: (parseInt(row.giacenza_attuale) || 0) + (existingData.movimenti_totali || 0),
        
        // Timestamps
        ultima_importazione_sap: importTimestamp,
        ultima_modifica: serverTimestamp(),
        
        // Flag
        attivo: true
      };
      
      batch.set(articoloRef, articleData, { merge: true });
      
      if (exists) {
        aggiornati++;
      } else {
        nuovi++;
      }
    }
    
    // Commit batch
    await batch.commit();
    
    // Log import in importazioni_sap collection
    const importRef = collection(db, 'importazioni_sap');
    await addDoc(importRef, {
      data_importazione: importTimestamp,
      utente: 'System', // You can pass user info as parameter
      totale_articoli: excelData.length,
      articoli_nuovi: nuovi,
      articoli_aggiornati: aggiornati,
      status: 'completato'
    });
    
    return {
      success: true,
      totale: excelData.length,
      nuovi,
      aggiornati
    };
    
  } catch (error) {
    console.error('Error importing articles:', error);
    throw error;
  }
};

// ============================================================================
// GET LAST IMPORT (NEW)
// ============================================================================

/**
 * Get last SAP import record
 * 
 * @returns {Object|null} - Last import data or null
 */
export const getLastImport = async () => {
  try {
    const importRef = collection(db, 'importazioni_sap');
    const q = query(importRef, orderBy('data_importazione', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    };
  } catch (error) {
    console.error('Error getting last import:', error);
    throw error;
  }
};

// ============================================================================
// GET ARTICLE BY CODE (For QR Scan)
// ============================================================================

/**
 * Get article by code (for QR scanner)
 * 
 * @param {string} codice - Article code
 * @returns {Object|null} - Article data or null
 */
export const getArticoloByCodice = async (codice) => {
  try {
    const articoloRef = doc(db, 'articoli', codice);
    const articoloSnap = await getDoc(articoloRef);
    
    if (articoloSnap.exists()) {
      return {
        id: articoloSnap.id,
        ...articoloSnap.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting article:', error);
    throw error;
  }
};

// ============================================================================
// SEARCH ARTICLES
// ============================================================================

/**
 * Search articles by code or description
 * 
 * @param {string} searchTerm - Search term
 * @param {number} maxResults - Max results to return
 * @returns {Array} - Array of articles
 */
export const searchArticoli = async (searchTerm, maxResults = 20) => {
  try {
    const articoliRef = collection(db, 'articoli');
    
    // Search by code (exact or starts with)
    const queryByCode = query(
      articoliRef,
      where('codice', '>=', searchTerm),
      where('codice', '<=', searchTerm + '\uf8ff'),
      limit(maxResults)
    );
    
    const snapshot = await getDocs(queryByCode);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
  } catch (error) {
    console.error('Error searching articles:', error);
    throw error;
  }
};

// ============================================================================
// GET ALL ARTICLES (with filters)
// ============================================================================

/**
 * Get all articles with optional filters
 * 
 * @param {Object} filters - Filter options
 * @returns {Array} - Array of articles
 */
export const getAllArticoli = async (filters = {}) => {
  try {
    const articoliRef = collection(db, 'articoli');
    let q = query(articoliRef);
    
    // Filter by category
    if (filters.categoria) {
      q = query(q, where('categoria', '==', filters.categoria));
    }
    
    // Order by code
    q = query(q, orderBy('codice', 'asc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
  } catch (error) {
    console.error('Error getting articles:', error);
    throw error;
  }
};

// ============================================================================
// REGISTER MOVEMENT (Mobile App)
// ============================================================================

/**
 * Register a movement from mobile app
 * This updates the magazino stock but NOT the SAP stock
 * 
 * @param {Object} movimento - Movement data
 * @returns {string} - Movement ID
 */
export const registraMovimento = async (movimento) => {
  try {
    const articoloRef = doc(db, 'articoli', movimento.codice_articolo);
    const articoloSnap = await getDoc(articoloRef);
    
    if (!articoloSnap.exists()) {
      throw new Error('Article not found');
    }
    
    const articoloData = articoloSnap.data();
    
    // Calculate quantities
    const giacenzaSAP = articoloData.giacenza_sap || 0;
    const movimentiTotaliPrecedenti = articoloData.movimenti_totali || 0;
    const giacenzaPrecedenteMagazzino = articoloData.giacenza_attuale_magazino || giacenzaSAP;
    
    // New quantities
    const quantitaMovimento = movimento.quantita; // Can be positive or negative
    const nuoviMovimentiTotali = movimentiTotaliPrecedenti + quantitaMovimento;
    const nuovaGiacenzaMagazzino = giacenzaSAP + nuoviMovimentiTotali;
    
    // Generate movement ID
    const timestamp = new Date();
    const movimentoId = `MOV-${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}-${String(timestamp.getTime()).slice(-6)}`;
    
    // Create movement document
    const movimentoData = {
      id: movimentoId,
      timestamp: Timestamp.fromDate(timestamp),
      codice_articolo: movimento.codice_articolo,
      tipo: movimento.tipo, // 'ENTRATA', 'USCITA', 'AGGIUSTAMENTO'
      quantita: quantitaMovimento,
      
      // Stock snapshots
      giacenza_sap_momento: giacenzaSAP,
      giacenza_precedente_magazino: giacenzaPrecedenteMagazzino,
      giacenza_nuova_magazino: nuovaGiacenzaMagazzino,
      
      // Details
      operatore: movimento.operatore || 'Unknown',
      motivo: movimento.motivo || '',
      riferimento: movimento.riferimento || '',
      ubicazione: movimento.ubicazione || articoloData.ubicazione || '',
      note: movimento.note || '',
      
      // Metadata
      dispositivo: movimento.dispositivo || 'Unknown',
      sincronizzato: true,
      foto_url: movimento.foto_url || ''
    };
    
    // Add movement to collection
    const movimentiRef = collection(db, 'movimenti');
    const newMovDoc = await addDoc(movimentiRef, movimentoData);
    
    // Update article with new magazino stock
    await updateDoc(articoloRef, {
      movimenti_totali: nuoviMovimentiTotali,
      giacenza_attuale_magazino: nuovaGiacenzaMagazzino,
      ultima_modifica: serverTimestamp()
    });
    
    return newMovDoc.id;
    
  } catch (error) {
    console.error('Error registering movement:', error);
    throw error;
  }
};

// ============================================================================
// GET MOVEMENTS (with filters)
// ============================================================================

/**
 * Get movements with optional filters
 * 
 * @param {Object} filters - Filter options
 * @returns {Array} - Array of movements
 */
export const getMovimenti = async (filters = {}) => {
  try {
    const movimentiRef = collection(db, 'movimenti');
    let q = query(movimentiRef);
    
    // Filter by date range
    if (filters.dataInizio) {
      q = query(q, where('timestamp', '>=', Timestamp.fromDate(filters.dataInizio)));
    }
    
    if (filters.dataFine) {
      q = query(q, where('timestamp', '<=', Timestamp.fromDate(filters.dataFine)));
    }
    
    // Filter by article
    if (filters.codice_articolo) {
      q = query(q, where('codice_articolo', '==', filters.codice_articolo));
    }
    
    // Filter by operator
    if (filters.operatore) {
      q = query(q, where('operatore', '==', filters.operatore));
    }
    
    // Filter by type
    if (filters.tipo) {
      q = query(q, where('tipo', '==', filters.tipo));
    }
    
    // Order by timestamp descending
    q = query(q, orderBy('timestamp', 'desc'));
    
    // Limit results
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      firebaseId: doc.id, 
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() // Convert Timestamp to Date
    }));
    
  } catch (error) {
    console.error('Error getting movements:', error);
    throw error;
  }
};

// ============================================================================
// GET MOVEMENT STATS
// ============================================================================

/**
 * Get movement statistics
 * 
 * @param {Date} dataInizio - Start date
 * @param {Date} dataFine - End date
 * @returns {Object} - Statistics
 */
export const getMovimentiStats = async (dataInizio, dataFine) => {
  try {
    const movimenti = await getMovimenti({ dataInizio, dataFine });
    
    const stats = {
      totale: movimenti.length,
      entrate: movimenti.filter(m => m.tipo === 'ENTRATA').length,
      uscite: movimenti.filter(m => m.tipo === 'USCITA').length,
      aggiustamenti: movimenti.filter(m => m.tipo === 'AGGIUSTAMENTO').length,
      operatori: [...new Set(movimenti.map(m => m.operatore))],
      articoli_modificati: [...new Set(movimenti.map(m => m.codice_articolo))].length
    };
    
    return stats;
    
  } catch (error) {
    console.error('Error getting movement stats:', error);
    throw error;
  }
};

// ============================================================================
// EXPORT FOR SAP UPDATE
// ============================================================================

/**
 * Export movements grouped by article for SAP update
 * 
 * @param {Date} dataInizio - Start date
 * @param {Date} dataFine - End date
 * @returns {Array} - Grouped movements by article
 */
export const exportMovimentiForSAP = async (dataInizio, dataFine) => {
  try {
    const movimenti = await getMovimenti({ dataInizio, dataFine });
    
    // Group by article code
    const grouped = {};
    
    movimenti.forEach(mov => {
      if (!grouped[mov.codice_articolo]) {
        grouped[mov.codice_articolo] = {
          codice: mov.codice_articolo,
          giacenza_sap_iniziale: mov.giacenza_sap_momento, // SAP at that time
          totale_movimenti: 0,
          num_movimenti: 0,
          entrate: 0,
          uscite: 0,
          giacenza_finale_magazino: 0,
          ultima_modifica: mov.timestamp
        };
      }
      
      grouped[mov.codice_articolo].totale_movimenti += mov.quantita;
      grouped[mov.codice_articolo].num_movimenti += 1;
      
      if (mov.tipo === 'ENTRATA') {
        grouped[mov.codice_articolo].entrate += Math.abs(mov.quantita);
      } else if (mov.tipo === 'USCITA') {
        grouped[mov.codice_articolo].uscite += Math.abs(mov.quantita);
      }
      
      // Keep last giacenza
      if (mov.timestamp > grouped[mov.codice_articolo].ultima_modifica) {
        grouped[mov.codice_articolo].giacenza_finale_magazino = mov.giacenza_nuova_magazino;
        grouped[mov.codice_articolo].ultima_modifica = mov.timestamp;
      }
    });
    
    // Convert to array and sort
    return Object.values(grouped).sort((a, b) => a.codice.localeCompare(b.codice));
    
  } catch (error) {
    console.error('Error exporting for SAP:', error);
    throw error;
  }
};

// ============================================================================
// GET ARTICLES WITH LOW STOCK
// ============================================================================

/**
 * Get articles with stock below minimum
 * 
 * @returns {Array} - Articles with low stock
 */
export const getArticoliStockBasso = async () => {
  try {
    const articoliRef = collection(db, 'articoli');
    const snapshot = await getDocs(articoliRef);
    
    const articoli = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Filter manually (Firestore doesn't support comparing two fields in query)
    return articoli.filter(art => 
      art.giacenza_attuale_magazino <= art.giacenza_minima
    ).sort((a, b) => 
      a.giacenza_attuale_magazino - b.giacenza_attuale_magazino
    );
    
  } catch (error) {
    console.error('Error getting low stock articles:', error);
    throw error;
  }
};

// ============================================================================
// GET DASHBOARD STATS
// ============================================================================

/**
 * Get dashboard statistics
 * 
 * @returns {Object} - Dashboard stats
 */
export const getDashboardStats = async () => {
  try {
    // Get all articles
    const articoli = await getAllArticoli();
    
    // Get today's movements
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    const movimentiOggi = await getMovimenti({ dataInizio: oggi });
    
    // Get low stock articles
    const stockBasso = await getArticoliStockBasso();
    
    // Get last import
    const lastImport = await getLastImport();
    
    // Calculate stats
    const stats = {
      totale_articoli: articoli.length,
      movimenti_oggi: movimentiOggi.length,
      allarmi_attivi: stockBasso.filter(a => a.giacenza_attuale_magazino > 0).length,
      articoli_zero_stock: articoli.filter(a => a.giacenza_attuale_magazino === 0).length,
      ultima_sincronizzazione: lastImport?.data_importazione || null,
      categorie: [...new Set(articoli.map(a => a.categoria))].length
    };
    
    return stats;
    
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
};

// ============================================================================
// DELETE MOVEMENT (Admin only)
// ============================================================================

/**
 * Delete a movement and recalculate article stock
 * WARNING: Use carefully, this will recalculate stock
 * 
 * @param {string} movimentoId - Movement Firebase ID
 * @returns {boolean} - Success
 */
export const deleteMovimento = async (movimentoId) => {
  try {
    const movimentoRef = doc(db, 'movimenti', movimentoId);
    const movimentoSnap = await getDoc(movimentoRef);
    
    if (!movimentoSnap.exists()) {
      throw new Error('Movement not found');
    }
    
    const movData = movimentoSnap.data();
    
    // Get article
    const articoloRef = doc(db, 'articoli', movData.codice_articolo);
    const articoloSnap = await getDoc(articoloRef);
    
    if (articoloSnap.exists()) {
      const artData = articoloSnap.data();
      
      // Recalculate: remove this movement from totals
      const nuoviMovimentiTotali = (artData.movimenti_totali || 0) - movData.quantita;
      const nuovaGiacenza = artData.giacenza_sap + nuoviMovimentiTotali;
      
      // Update article
      await updateDoc(articoloRef, {
        movimenti_totali: nuoviMovimentiTotali,
        giacenza_attuale_magazino: nuovaGiacenza,
        ultima_modifica: serverTimestamp()
      });
    }
    
    // Delete movement
    await deleteDoc(movimentoRef);
    
    return true;
    
  } catch (error) {
    console.error('Error deleting movement:', error);
    throw error;
  }
};