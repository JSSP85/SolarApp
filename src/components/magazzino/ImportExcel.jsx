// src/components/magazzino/ImportExcel.jsx
import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, Database, Loader, Tag } from 'lucide-react';
import * as XLSX from 'xlsx';
import { importArticoliFromExcel } from '../../firebase/magazzinoService';
import './ImportExcel.css';

const ImportExcel = ({ onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState([]);

  // Auto-classification logic based on keywords
  const classifyArticle = (description) => {
    if (!description) return 'Others';
    
    const desc = description.toUpperCase();
    
    // Hardware (Screws, nuts, washers, bolts)
    if (desc.includes('SCREW') || desc.includes('NUT') || desc.includes('BOLT') || 
        desc.includes('WASHER') || /M\d{1,2}/.test(desc) || desc.includes('DIN')) {
      return 'Hardware';
    }
    
    // Cables
    if (desc.includes('CABLE') || desc.includes('CAVO') || desc.includes('COAXIAL') || 
        desc.includes('WIRE')) {
      return 'Cables';
    }
    
    // Bearings
    if (desc.includes('BEARING') || desc.includes('SPHERICAL')) {
      return 'Bearings';
    }
    
    // Motors & Actuators
    if (desc.includes('ACTUATOR') || desc.includes('DRIVE') || desc.includes('MOTOR') || 
        desc.includes('CAPACITOR')) {
      return 'Motors & Actuators';
    }
    
    // Electronics & Sensors
    if (desc.includes('BOARD') || desc.includes('SENSOR') || desc.includes('ANEMOMETER') || 
        desc.includes('ELECTRONIC') || desc.includes('SWITCH') || desc.includes('CONVERTITORE') ||
        desc.includes('ALIMENT') || desc.includes('UPS') || desc.includes('FILTER')) {
      return 'Electronics & Sensors';
    }
    
    // Mechanical Components
    if (desc.includes('PLATE') || desc.includes('BRACKET') || desc.includes('SPACER') || 
        desc.includes('MOUNTING') || desc.includes('SUPPORT')) {
      return 'Mechanical Components';
    }
    
    // Default
    return 'Others';
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      return;
    }

    // Validate file type
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
    setImportResult(null);
    
    // Preview first 5 rows
    previewExcel(selectedFile);
  };

  // Preview Excel data
  const previewExcel = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet (SAP exports to 'Data' sheet)
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        // Show first 5 rows with auto-classification
        const previewData = jsonData.slice(0, 5).map(row => ({
          ...row,
          auto_category: classifyArticle(row['Material Description'])
        }));
        
        setPreview(previewData);
      } catch (err) {
        console.error('Error reading Excel:', err);
        setError('Error reading Excel file. Please check the format.');
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Process and import Excel (SAP FORMAT)
  const handleImport = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setImporting(true);
    setError(null);
    
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        // Read Excel
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get 'Data' sheet (SAP default) or first sheet
        let sheetName = workbook.SheetNames[0];
        if (workbook.SheetNames.includes('Data')) {
          sheetName = 'Data';
        }
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log('Excel data loaded:', jsonData.length, 'rows');

        // Transform SAP data to our structure
        const transformedData = jsonData
          .filter(row => row['Material']) // Only rows with Material code
          .map(row => {
            const descrizione = String(row['Material Description'] || '').trim();
            const giacenza = parseFloat(row['Stock Quantity on Period End']) || 0;
            
            return {
              // Basic info from SAP
              codice: String(row['Material'] || '').trim(),
              codice_vecchio: String(row['Old material number'] || '').trim(),
              descrizione: descrizione,
              giacenza_attuale: giacenza,
              
              // Auto-generated fields
              categoria: classifyArticle(descrizione),
              unita_misura: 'pz',
              
              // Default values (hidden from user, used internally)
              giacenza_minima: 10,
              giacenza_massima: Math.max(100, giacenza * 2),
              ubicazione: '',
              fornitore_principale: '',
              prezzo_unitario: 0,
              
              // Generate QR code data
              codice_qr: JSON.stringify({
                codigo: String(row['Material'] || '').trim(),
                descripcion: descrizione.substring(0, 50),
                tipo: 'inventario',
                timestamp: new Date().toISOString()
              })
            };
          });

        console.log('Transformed data:', transformedData.length, 'articles');

        if (transformedData.length === 0) {
          throw new Error('No valid articles found in Excel. Please check if SAP export contains "Material" column.');
        }

        // Show category distribution
        const categorias = {};
        transformedData.forEach(art => {
          categorias[art.categoria] = (categorias[art.categoria] || 0) + 1;
        });
        console.log('Category distribution:', categorias);

        // Import to Firebase
        const result = await importArticoliFromExcel(transformedData);
        
        // Add category stats to result
        result.categorias = categorias;
        
        setImportResult(result);
        setImporting(false);
        
        // Notify parent component
        if (onImportComplete) {
          onImportComplete(result);
        }
        
      } catch (err) {
        console.error('Import error:', err);
        setError(err.message || 'Error importing data. Please check the Excel format.');
        setImporting(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Clear selection
  const handleClear = () => {
    setFile(null);
    setPreview([]);
    setImportResult(null);
    setError(null);
  };

  return (
    <div className="import-excel-container">
      <div className="import-header">
        <Database size={32} />
        <div>
          <h2>Import from SAP Excel</h2>
          <p>Upload your Excel file exported from SAP to update the warehouse database</p>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="upload-section">
        <label className="file-input-label">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="file-input"
            disabled={importing}
          />
          <div className="file-input-visual">
            <Upload size={48} />
            <p className="file-input-text">
              {file ? file.name : 'Click to select SAP Excel file or drag and drop'}
            </p>
            <p className="file-input-hint">
              Expected columns: Material, Material Description, Stock Quantity on Period End
            </p>
          </div>
        </label>

        {file && !importing && !importResult && (
          <div className="file-actions">
            <button onClick={handleImport} className="btn btn-primary">
              <Upload size={18} />
              Import to Database
            </button>
            <button onClick={handleClear} className="btn btn-secondary">
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Preview Section */}
      {preview.length > 0 && !importing && !importResult && (
        <div className="preview-section">
          <h3>
            <FileText size={20} />
            Preview (First 5 rows) - Auto-classification enabled
          </h3>
          <div className="preview-table-wrapper">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>Material Code</th>
                  <th>Old Code</th>
                  <th>Description</th>
                  <th>Stock SAP</th>
                  <th>Auto Category</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx}>
                    <td><code>{row['Material'] || '-'}</code></td>
                    <td><code>{row['Old material number'] || '-'}</code></td>
                    <td className="desc-col">{row['Material Description'] || '-'}</td>
                    <td><strong>{row['Stock Quantity on Period End'] || 0}</strong></td>
                    <td>
                      <span className="category-badge">
                        <Tag size={14} />
                        {row.auto_category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="preview-note">
            Categories are automatically assigned based on keywords in descriptions
          </p>
        </div>
      )}

      {/* Loading State */}
      {importing && (
        <div className="import-status importing">
          <Loader size={48} className="spinner" />
          <h3>Importing SAP data...</h3>
          <p>Processing articles and auto-classifying categories</p>
        </div>
      )}

      {/* Success Result */}
      {importResult && !importing && (
        <div className="import-status success">
          <CheckCircle size={48} />
          <h3>Import Completed Successfully!</h3>
          <div className="import-stats">
            <div className="stat-item">
              <span className="stat-label">Total Articles:</span>
              <span className="stat-value">{importResult.totale}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">New Articles:</span>
              <span className="stat-value success-text">{importResult.nuovi}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Updated Articles:</span>
              <span className="stat-value warning-text">{importResult.aggiornati}</span>
            </div>
          </div>

          {/* Category Distribution */}
          {importResult.categorias && (
            <div className="category-distribution">
              <h4>Category Distribution:</h4>
              <div className="category-grid">
                {Object.entries(importResult.categorias).map(([cat, count]) => (
                  <div key={cat} className="category-item">
                    <span className="category-name">{cat}</span>
                    <span className="category-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleClear} className="btn btn-primary">
            Import Another File
          </button>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="import-status error">
          <AlertCircle size={48} />
          <h3>Import Error</h3>
          <p>{error}</p>
          <button onClick={handleClear} className="btn btn-secondary">
            Try Again
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="import-instructions">
        <h4>📋 SAP Export Instructions:</h4>
        <ol>
          <li>Export your warehouse inventory from SAP</li>
          <li>Ensure the Excel contains these columns:
            <ul>
              <li><code>Material</code> - Article code (700xxx)</li>
              <li><code>Material Description</code> - Component name</li>
              <li><code>Stock Quantity on Period End</code> - Current stock</li>
              <li><code>Old material number</code> - Legacy code (optional)</li>
            </ul>
          </li>
          <li>Upload the file using the button above</li>
          <li>Review the preview with auto-assigned categories</li>
          <li>Click "Import to Database"</li>
        </ol>
        
        <div className="import-note">
          <strong>🤖 Auto-Classification:</strong> Articles are automatically categorized based on keywords in descriptions.
        </div>
        
        <div className="import-note">
          <strong>⚠️ Important:</strong> This updates SAP stock values but preserves all warehouse movements.
        </div>
      </div>
    </div>
  );
};

export default ImportExcel;