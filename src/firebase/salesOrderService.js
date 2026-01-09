// src/firebase/salesOrderService.js

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

// ============================================================================
// IMPORT SALES ORDER FROM EXCEL
// ============================================================================

/**
 * Import Sales Order from Excel
 * Extracts data from columns: E, F, G, H, I, J, L
 *
 * Excel Column Mapping:
 * - E: Sales Document (SO Number)
 * - F: Sold-To Party Name (Cliente)
 * - G: Name (Nombre Proyecto)
 * - H: Sales Document Item (Line Item)
 * - I: Material (Código Producto)
 * - J: Material Description (Descripción)
 * - L: Order Quantity (Cantidad)
 *
 * @param {Array} excelData - Array of rows from Excel
 * @returns {Object} - Parsed sales order data ready for creation
 */
export const parseSalesOrderFromExcel = async (excelData) => {
  try {
    if (!excelData || excelData.length === 0) {
      throw new Error('No data provided');
    }

    // Group items by Sales Order Number
    const ordersMap = new Map();

    excelData.forEach((row, index) => {
      // Extract data from specific columns
      const salesOrderNumber = row.E || row['Sales Document'];
      const cliente = row.F || row['Sold-To Party Name'];
      const nombreProyecto = row.G || row['Name'];
      const lineItem = row.H || row['Sales Document Item'];
      const materialCode = row.I || row['Material'];
      const description = row.J || row['Material Description'];
      const quantityRequired = parseInt(row.L || row['Order Quantity (Item)']) || 0;

      // Validate required fields
      if (!salesOrderNumber) {
        console.warn(`Row ${index + 1}: Missing Sales Order Number (column E)`);
        return;
      }
      if (!materialCode) {
        console.warn(`Row ${index + 1}: Missing Material Code (column I)`);
        return;
      }

      // Initialize order if not exists
      if (!ordersMap.has(salesOrderNumber)) {
        ordersMap.set(salesOrderNumber, {
          salesOrderNumber,
          cliente: cliente || 'Unknown',
          nombreProyecto: nombreProyecto || 'Untitled Project',
          items: []
        });
      }

      // Add item to order
      const order = ordersMap.get(salesOrderNumber);
      order.items.push({
        lineItem: lineItem || `${order.items.length + 1}`,
        materialCode: String(materialCode).trim(),
        description: description || 'No description',
        quantityRequired,
        quantityPrepared: 0, // Initially 0
        currentStock: null // Will be fetched from inventory
      });
    });

    // Convert map to array
    const orders = Array.from(ordersMap.values());

    console.log(`✅ Parsed ${orders.length} sales order(s) with ${excelData.length} total items`);

    return orders;

  } catch (error) {
    console.error('Error parsing Sales Order from Excel:', error);
    throw error;
  }
};

// ============================================================================
// GET CURRENT STOCK FOR ITEMS
// ============================================================================

/**
 * Fetch current stock from inventory for given material codes
 * Groups stock by material code (sums across all locations)
 *
 * @param {Array} materialCodes - Array of material codes
 * @returns {Map} - Map of materialCode -> total stock quantity
 */
export const getCurrentStockForMaterials = async (materialCodes) => {
  try {
    const stockMap = new Map();

    // Get all articles from inventory
    const articoliRef = collection(db, 'articoli');
    const snapshot = await getDocs(articoliRef);

    snapshot.docs.forEach(doc => {
      const articolo = doc.data();
      const codice = articolo.codice;
      const giacenza = articolo.giacenza_attuale_magazino || 0;

      if (materialCodes.includes(codice)) {
        // Sum stock across all locations for the same material code
        const currentStock = stockMap.get(codice) || 0;
        stockMap.set(codice, currentStock + giacenza);
      }
    });

    return stockMap;

  } catch (error) {
    console.error('Error fetching current stock:', error);
    throw error;
  }
};

// ============================================================================
// CREATE SALES ORDER
// ============================================================================

/**
 * Create a new Sales Order in Firebase
 *
 * @param {Object} orderData - Sales order data with:
 *   - salesOrderNumber: SO number
 *   - cliente: Customer name
 *   - nombreProyecto: Project name
 *   - items: Array of items
 *   - deadline: Deadline date
 *   - createdBy: User ID
 * @returns {string} - Sales Order ID
 */
export const createSalesOrder = async (orderData) => {
  try {
    const timestamp = Timestamp.now();

    // Calculate initial progress
    const totalItems = orderData.items.length;
    const completedItems = orderData.items.filter(item =>
      item.quantityPrepared >= item.quantityRequired
    ).length;
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    // Prepare sales order document
    const salesOrder = {
      salesOrderNumber: orderData.salesOrderNumber,
      cliente: orderData.cliente,
      nombreProyecto: orderData.nombreProyecto,
      deadline: orderData.deadline ? Timestamp.fromDate(new Date(orderData.deadline)) : null,
      status: 'pending', // pending | in-progress | completed
      progress: Math.round(progress),
      items: orderData.items,
      createdAt: timestamp,
      createdBy: orderData.createdBy || 'Unknown',
      updatedAt: timestamp,
      completedAt: null
    };

    // Add to Firebase
    const salesOrdersRef = collection(db, 'sales_orders');
    const docRef = await addDoc(salesOrdersRef, salesOrder);

    console.log(`✅ Sales Order created: ${docRef.id}`);
    return docRef.id;

  } catch (error) {
    console.error('Error creating sales order:', error);
    throw error;
  }
};

// ============================================================================
// GET ALL SALES ORDERS
// ============================================================================

/**
 * Get all sales orders with optional filters
 *
 * @param {Object} filters - Filter options
 *   - status: 'pending' | 'in-progress' | 'completed'
 *   - limit: Max number of results
 * @returns {Array} - Array of sales orders
 */
export const getAllSalesOrders = async (filters = {}) => {
  try {
    const salesOrdersRef = collection(db, 'sales_orders');
    let q = query(salesOrdersRef);

    // Filter by status
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

    // Order by creation date (newest first)
    q = query(q, orderBy('createdAt', 'desc'));

    // Limit results
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      completedAt: doc.data().completedAt?.toDate(),
      deadline: doc.data().deadline?.toDate()
    }));

  } catch (error) {
    console.error('Error getting sales orders:', error);
    throw error;
  }
};

// ============================================================================
// GET SALES ORDER BY ID
// ============================================================================

/**
 * Get a specific sales order by ID
 *
 * @param {string} orderId - Sales order Firebase ID
 * @returns {Object|null} - Sales order data or null
 */
export const getSalesOrderById = async (orderId) => {
  try {
    const orderRef = doc(db, 'sales_orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return null;
    }

    return {
      id: orderSnap.id,
      ...orderSnap.data(),
      createdAt: orderSnap.data().createdAt?.toDate(),
      updatedAt: orderSnap.data().updatedAt?.toDate(),
      completedAt: orderSnap.data().completedAt?.toDate(),
      deadline: orderSnap.data().deadline?.toDate()
    };

  } catch (error) {
    console.error('Error getting sales order:', error);
    throw error;
  }
};

// ============================================================================
// UPDATE ITEM PROGRESS
// ============================================================================

/**
 * Update the quantity prepared for a specific item in a sales order
 * This will be called from the mobile app when workers scan and prepare items
 *
 * @param {string} orderId - Sales order Firebase ID
 * @param {string} materialCode - Material code of the item
 * @param {number} quantityPrepared - New quantity prepared
 * @param {string} operatorName - Name of operator (optional)
 * @returns {Object} - Updated sales order
 */
export const updateItemProgress = async (orderId, materialCode, quantityPrepared, operatorName = 'Unknown') => {
  try {
    const orderRef = doc(db, 'sales_orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      throw new Error('Sales order not found');
    }

    const orderData = orderSnap.data();
    const items = orderData.items || [];

    // Find and update the specific item
    const updatedItems = items.map(item => {
      if (item.materialCode === materialCode) {
        return {
          ...item,
          quantityPrepared,
          lastUpdatedBy: operatorName,
          lastUpdatedAt: new Date()
        };
      }
      return item;
    });

    // Calculate new progress
    const totalQuantity = updatedItems.reduce((sum, item) => sum + item.quantityRequired, 0);
    const preparedQuantity = updatedItems.reduce((sum, item) => sum + item.quantityPrepared, 0);
    const progress = totalQuantity > 0 ? (preparedQuantity / totalQuantity) * 100 : 0;

    // Determine new status
    let newStatus = orderData.status;
    if (progress === 0) {
      newStatus = 'pending';
    } else if (progress > 0 && progress < 100) {
      newStatus = 'in-progress';
    } else if (progress === 100) {
      newStatus = 'completed';
    }

    // Update order
    const updates = {
      items: updatedItems,
      progress: Math.round(progress),
      status: newStatus,
      updatedAt: serverTimestamp(),
      completedAt: newStatus === 'completed' ? serverTimestamp() : null
    };

    await updateDoc(orderRef, updates);

    // Log activity
    await logSalesOrderActivity({
      orderId,
      salesOrderNumber: orderData.salesOrderNumber,
      action: 'item_updated',
      materialCode,
      quantityPrepared,
      operatorName,
      timestamp: Timestamp.now()
    });

    return await getSalesOrderById(orderId);

  } catch (error) {
    console.error('Error updating item progress:', error);
    throw error;
  }
};

// ============================================================================
// UPDATE SALES ORDER STATUS
// ============================================================================

/**
 * Update sales order status manually
 *
 * @param {string} orderId - Sales order Firebase ID
 * @param {string} status - New status: 'pending' | 'in-progress' | 'completed'
 * @returns {boolean} - Success
 */
export const updateSalesOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(db, 'sales_orders', orderId);

    const updates = {
      status,
      updatedAt: serverTimestamp()
    };

    if (status === 'completed') {
      updates.completedAt = serverTimestamp();
    }

    await updateDoc(orderRef, updates);
    return true;

  } catch (error) {
    console.error('Error updating sales order status:', error);
    throw error;
  }
};

// ============================================================================
// DELETE SALES ORDER
// ============================================================================

/**
 * Delete a sales order
 *
 * @param {string} orderId - Sales order Firebase ID
 * @returns {boolean} - Success
 */
export const deleteSalesOrder = async (orderId) => {
  try {
    const orderRef = doc(db, 'sales_orders', orderId);
    await deleteDoc(orderRef);
    console.log(`✅ Sales Order deleted: ${orderId}`);
    return true;

  } catch (error) {
    console.error('Error deleting sales order:', error);
    throw error;
  }
};

// ============================================================================
// UPDATE SALES ORDER ITEMS
// ============================================================================

/**
 * Update the items array of a sales order
 * Used for editing or deleting line items
 *
 * @param {string} orderId - Sales order Firebase ID
 * @param {Array} items - Updated items array
 * @returns {boolean} - Success
 */
export const updateSalesOrderItems = async (orderId, items) => {
  try {
    const orderRef = doc(db, 'sales_orders', orderId);

    // Recalculate progress
    const totalQuantity = items.reduce((sum, item) => sum + item.quantityRequired, 0);
    const preparedQuantity = items.reduce((sum, item) => sum + (item.quantityPrepared || 0), 0);
    const progress = totalQuantity > 0 ? (preparedQuantity / totalQuantity) * 100 : 0;

    // Determine status based on progress
    let status = 'pending';
    if (progress > 0 && progress < 100) {
      status = 'in-progress';
    } else if (progress === 100) {
      status = 'completed';
    }

    const updates = {
      items,
      progress: Math.round(progress),
      status,
      updatedAt: serverTimestamp()
    };

    if (status === 'completed') {
      updates.completedAt = serverTimestamp();
    } else {
      updates.completedAt = null;
    }

    await updateDoc(orderRef, updates);
    console.log(`✅ Sales Order items updated: ${orderId}`);
    return true;

  } catch (error) {
    console.error('Error updating sales order items:', error);
    throw error;
  }
};

// ============================================================================
// LOG SALES ORDER ACTIVITY
// ============================================================================

/**
 * Log activity for sales orders (for audit trail)
 *
 * @param {Object} activity - Activity data
 * @returns {string} - Activity log ID
 */
export const logSalesOrderActivity = async (activity) => {
  try {
    const activityRef = collection(db, 'sales_order_activity');
    const docRef = await addDoc(activityRef, {
      ...activity,
      timestamp: activity.timestamp || Timestamp.now()
    });

    return docRef.id;

  } catch (error) {
    console.error('Error logging sales order activity:', error);
    // Don't throw - logging failures shouldn't break main operations
    return null;
  }
};

// ============================================================================
// GET SALES ORDER STATS
// ============================================================================

/**
 * Get sales order statistics for dashboard
 *
 * @returns {Object} - Dashboard stats
 */
export const getSalesOrderStats = async () => {
  try {
    const allOrders = await getAllSalesOrders();

    const stats = {
      total: allOrders.length,
      pending: allOrders.filter(o => o.status === 'pending').length,
      inProgress: allOrders.filter(o => o.status === 'in-progress').length,
      completed: allOrders.filter(o => o.status === 'completed').length,
      overdueOrders: allOrders.filter(o =>
        o.deadline &&
        o.status !== 'completed' &&
        new Date(o.deadline) < new Date()
      ).length
    };

    return stats;

  } catch (error) {
    console.error('Error getting sales order stats:', error);
    throw error;
  }
};
