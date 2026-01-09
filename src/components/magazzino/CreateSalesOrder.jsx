// src/components/magazzino/CreateSalesOrder.jsx
import React, { useState, useEffect } from 'react';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  Package,
  User,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  parseSalesOrderFromExcel,
  getCurrentStockForMaterials,
  createSalesOrder
} from '../../firebase/salesOrderService';
import { useAuth } from '../../context/AuthContext';

const CreateSalesOrder = ({ onOrderCreated }) => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null); // Sales order preview
  const [deadline, setDeadline] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndProcessFile = (selectedFile) => {
    if (!selectedFile) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      setError('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setImportSuccess(false);
    previewExcel(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndProcessFile(selectedFile);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    validateAndProcessFile(droppedFile);
  };

  const previewExcel = async (file) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        // Parse with column letters (A, B, C...) and skip first row (header)
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
          header: 'A',
          range: 1 // Skip first row (row 0 is header)
        });

        console.log('📊 Raw Excel data (first 5 rows):', jsonData.slice(0, 5));

        // Parse sales orders from Excel
        const parsedOrders = await parseSalesOrderFromExcel(jsonData);

        if (!parsedOrders || parsedOrders.length === 0) {
          setError('No valid sales orders found in Excel file');
          return;
        }

        // For now, take the first order (in future, support multiple orders)
        const order = parsedOrders[0];

        // Get current stock for all materials in the order
        const materialCodes = order.items.map(item => item.materialCode);
        const stockMap = await getCurrentStockForMaterials(materialCodes);

        // Enrich items with current stock
        order.items = order.items.map(item => ({
          ...item,
          currentStock: stockMap.get(item.materialCode) || 0
        }));

        setPreview(order);
        setShowConfirmation(false);

      } catch (err) {
        console.error('Error reading Excel:', err);
        setError(`Error reading Excel file: ${err.message}`);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleConfirm = () => {
    if (!deadline) {
      setError('Please select a deadline date');
      return;
    }
    setShowConfirmation(true);
    setError(null);
  };

  const handleCreateOrder = async () => {
    if (!preview || !deadline) {
      setError('Missing order data or deadline');
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const orderData = {
        ...preview,
        deadline,
        createdBy: user?.email || 'Unknown'
      };

      const orderId = await createSalesOrder(orderData);

      console.log('✅ Sales Order created:', orderId);
      setImportSuccess(true);
      setImporting(false);

      // Clear form
      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setDeadline('');
        setShowConfirmation(false);
        if (onOrderCreated) {
          onOrderCreated();
        }
      }, 2000);

    } catch (err) {
      console.error('Error creating sales order:', err);
      setError(`Failed to create order: ${err.message}`);
      setImporting(false);
    }
  };

  const getStockIndicator = (required, current) => {
    if (current >= required) {
      return { icon: CheckCircle, color: '#10b981', label: 'In Stock' };
    } else if (current > 0) {
      return { icon: AlertCircle, color: '#f59e0b', label: 'Partial Stock' };
    } else {
      return { icon: AlertCircle, color: '#ef4444', label: 'Out of Stock' };
    }
  };

  return (
    <div className="wms-panel-card">
      <div className="wms-card-header">
        <div className="wms-card-title">
          <FileText size={24} />
          Create New Sales Order
        </div>
        <div className="wms-card-subtitle">
          Import sales order from Excel file (columns E, F, G, H, I, J, L)
        </div>
      </div>

      <div className="wms-card-content">
        {/* File Upload Section */}
        <div className="wms-upload-section">
          <div
            className={`so-upload-dropzone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="so-upload-icon">
              <Upload size={56} />
            </div>
            <h3 className="so-upload-title">Upload Sales Order Excel</h3>
            <p className="so-upload-subtitle">
              {isDragging
                ? 'Drop file here to upload'
                : 'Drag & drop your Excel file here, or click to browse'}
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="so-file-input"
              id="sales-order-file"
            />
            <label htmlFor="sales-order-file" className="so-upload-button">
              <Upload size={18} />
              Choose File
            </label>
            {file && (
              <div className="so-file-info">
                <FileText size={18} />
                <span className="so-file-name">{file.name}</span>
                <span className="so-file-size">
                  ({(file.size / 1024).toFixed(2)} KB)
                </span>
              </div>
            )}
          </div>

          {/* Column Mapping Info */}
          <div className="so-column-info">
            <h4>📋 Expected Excel Columns:</h4>
            <ul>
              <li><strong>Column E:</strong> Sales Document (SO Number)</li>
              <li><strong>Column F:</strong> Sold-To Party Name (Customer)</li>
              <li><strong>Column G:</strong> Name (Project Name)</li>
              <li><strong>Column H:</strong> Sales Document Item (Line Item)</li>
              <li><strong>Column I:</strong> Material (Product Code)</li>
              <li><strong>Column J:</strong> Material Description</li>
              <li><strong>Column L:</strong> Order Quantity (Item)</li>
            </ul>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="wms-alert wms-alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {importSuccess && (
          <div className="wms-alert wms-alert-success">
            <CheckCircle size={20} />
            <span>Sales Order created successfully!</span>
          </div>
        )}

        {/* Preview Section */}
        {preview && !importSuccess && (
          <>
            <div className="wms-divider"></div>

            {/* Order Header Info */}
            <div className="so-header-info">
              <div className="so-info-grid">
                <div className="so-info-item">
                  <span className="so-info-label">Sales Order #:</span>
                  <span className="so-info-value">{preview.salesOrderNumber}</span>
                </div>
                <div className="so-info-item">
                  <span className="so-info-label">Customer:</span>
                  <span className="so-info-value">{preview.cliente}</span>
                </div>
                <div className="so-info-item">
                  <span className="so-info-label">Project:</span>
                  <span className="so-info-value">{preview.nombreProyecto}</span>
                </div>
                <div className="so-info-item">
                  <span className="so-info-label">Total Items:</span>
                  <span className="so-info-value">{preview.items.length}</span>
                </div>
              </div>
            </div>

            {/* Deadline Selection */}
            <div className="so-deadline-section">
              <label className="so-deadline-label">
                <Calendar size={20} />
                Deadline Date:
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="so-deadline-input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="wms-divider"></div>

            {/* Items Preview Table */}
            <div className="so-preview-section">
              <h3 className="so-preview-title">
                <Package size={20} />
                Order Items Preview
              </h3>

              <div className="so-table-container">
                <table className="so-preview-table">
                  <thead>
                    <tr>
                      <th>Line</th>
                      <th>Material Code</th>
                      <th>Description</th>
                      <th>Qty Required</th>
                      <th>Current Stock</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.items.map((item, index) => {
                      const stockIndicator = getStockIndicator(item.quantityRequired, item.currentStock);
                      const StockIcon = stockIndicator.icon;

                      return (
                        <tr key={index}>
                          <td>{item.lineItem}</td>
                          <td className="so-material-code">{item.materialCode}</td>
                          <td className="so-description">{item.description}</td>
                          <td className="so-quantity">{item.quantityRequired}</td>
                          <td className="so-stock" style={{
                            color: item.currentStock >= item.quantityRequired ? '#10b981' :
                                   item.currentStock > 0 ? '#f59e0b' : '#ef4444',
                            fontWeight: 'bold'
                          }}>
                            {item.currentStock}
                          </td>
                          <td>
                            <div className="so-stock-indicator" style={{ color: stockIndicator.color }}>
                              <StockIcon size={16} />
                              <span>{stockIndicator.label}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="so-actions">
              {!showConfirmation ? (
                <button
                  className="so-btn so-btn-primary"
                  onClick={handleConfirm}
                  disabled={!deadline}
                >
                  <CheckCircle size={20} />
                  Review & Confirm
                </button>
              ) : (
                <div className="so-confirmation">
                  <div className="so-confirmation-message">
                    <AlertCircle size={24} />
                    <div>
                      <h4>Confirm Order Creation</h4>
                      <p>You are about to create Sales Order <strong>{preview.salesOrderNumber}</strong> with {preview.items.length} items and deadline on <strong>{new Date(deadline).toLocaleDateString()}</strong>.</p>
                    </div>
                  </div>
                  <div className="so-confirmation-actions">
                    <button
                      className="so-btn so-btn-secondary"
                      onClick={() => setShowConfirmation(false)}
                      disabled={importing}
                    >
                      Cancel
                    </button>
                    <button
                      className="so-btn so-btn-success"
                      onClick={handleCreateOrder}
                      disabled={importing}
                    >
                      {importing ? 'Creating...' : 'Confirm & Create Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateSalesOrder;
