// src/components/magazzino/ImportExcel.jsx
import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, Database, Tag, Clock, Package, User, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import { importArticoliFromExcel, getLastImport } from '../../firebase/magazzinoService';

const ImportExcel = ({ onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState([]);
  
  // Load History State
  const [lastImport, setLastImport] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load history on mount
  useEffect(() => {
    loadLastImport();
  }, []);

  // Reload history after successful import
  useEffect(() => {
    if (importResult) {
      loadLastImport();
    }
  }, [importResult]);

  const loadLastImport = async () => {
    try {
      setLoadingHistory(true);
      const importData = await getLastImport();
      setLastImport(importData);
      setLoadingHistory(false);
    } catch (error) {
      console.error('Error loading last import:', error);
      setLoadingHistory(false);
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const classifyArticle = (description) => {
    if (!description) return 'Others';
    
    const desc = description.toUpperCase();
    
    if (desc.includes('SCREW') || desc.includes('NUT') || desc.includes('BOLT') || 
        desc.includes('WASHER') || /M\d{1,2}/.test(desc) || desc.includes('DIN')) {
      return 'Hardware';
    }
    
    if (desc.includes('CABLE') || desc.includes('CAVO') || desc.includes('COAXIAL') || 
        desc.includes('WIRE')) {
      return 'Cables';
    }
    
    if (desc.includes('BEARING') || desc.includes('SPHERICAL')) {
      return 'Bearings';
    }
    
    if (desc.includes('ACTUATOR') || desc.includes('DRIVE') || desc.includes('MOTOR') || 
        desc.includes('CAPACITOR')) {
      return 'Motors & Actuators';
    }
    
    if (desc.includes('BOARD') || desc.includes('SENSOR') || desc.includes('ANEMOMETER') || 
        desc.includes('ELECTRONIC') || desc.includes('SWITCH') || desc.includes('CONVERTITORE') ||
        desc.includes('ALIMENT') || desc.includes('UPS') || desc.includes('FILTER')) {
      return 'Electronics & Sensors';
    }
    
    if (desc.includes('PLATE') || desc.includes('BRACKET') || desc.includes('SPACER') || 
        desc.includes('MOUNTING') || desc.includes('SUPPORT')) {
      return 'Mechanical Components';
    }
    
    return 'Others';
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
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
    setImportResult(null);
    previewExcel(selectedFile);
  };

  const previewExcel = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
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
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        let sheetName = workbook.SheetNames[0];
        if (workbook.SheetNames.includes('Data')) {
          sheetName = 'Data';
        }
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log('📊 Excel data loaded:', jsonData.length, 'rows');

        const transformedData = jsonData
          .filter(row => row['Material'])
          .map(row => {
            const descrizione = String(row['Material Description'] || '').trim();
            const giacenza = parseFloat(row['Stock Quantity on Period End']) || 0;
            
            return {
              codice: String(row['Material'] || '').trim(),
              codice_vecchio: String(row['Old material number'] || '').trim(),
              descrizione: descrizione,
              giacenza_attuale: giacenza,
              categoria: classifyArticle(descrizione),
              unita_misura: 'pz',
              giacenza_minima: 10,
              giacenza_massima: Math.max(100, giacenza * 2),
              ubicazione: '',
              fornitore_principale: '',
              prezzo_unitario: 0,
              codice_qr: JSON.stringify({
                codigo: String(row['Material'] || '').trim(),
                descripcion: descrizione.substring(0, 50),
                tipo: 'inventario',
                timestamp: new Date().toISOString()
              })
            };
          });

        console.log('✅ Transformed data:', transformedData.length, 'articles');

        if (transformedData.length === 0) {
          throw new Error('No valid articles found in Excel. Please check if SAP export contains "Material" column.');
        }

        const categorias = {};
        transformedData.forEach(art => {
          categorias[art.categoria] = (categorias[art.categoria] || 0) + 1;
        });
        console.log('📂 Category distribution:', categorias);

        // CALL FIREBASE IMPORT (with automatic movements reset)
        console.log('🔥 Starting Firebase import...');
        const result = await importArticoliFromExcel(transformedData);
        console.log('✅ Firebase import completed:', result);
        
        result.categorias = categorias;
        
        setImportResult(result);
        setImporting(false);
        
        if (onImportComplete) {
          onImportComplete(result);
        }
        
      } catch (err) {
        console.error('❌ Import error:', err);
        setError(err.message || 'Error importing data. Please check the Excel format and Firebase connection.');
        setImporting(false);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file. Please try again.');
      setImporting(false);
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleClear = () => {
    setFile(null);
    setPreview([]);
    setImportResult(null);
    setError(null);
  };

  return (
    <>
      {/* Upload Card */}
      <div className="wms-panel-card" style={{ marginBottom: '2rem' }}>
        <div className="wms-panel-header">
          <h2 className="wms-panel-title">
            <Database size={24} />
            Upload SAP Excel File
          </h2>
          <p className="wms-panel-subtitle">
            Import warehouse inventory data from SAP export
          </p>
        </div>

        <div style={{ padding: '2rem' }}>
          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <AlertCircle size={24} style={{ color: '#dc2626', flexShrink: 0 }} />
              <div style={{ color: '#991b1b', fontSize: '0.95rem' }}>{error}</div>
            </div>
          )}

          <label style={{
            display: 'block',
            border: '3px dashed #d1d5db',
            borderRadius: '12px',
            padding: '3rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: 'rgba(249, 250, 251, 0.8)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#0077a2';
            e.currentTarget.style.background = 'rgba(240, 249, 255, 0.8)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.background = 'rgba(249, 250, 251, 0.8)';
          }}>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={importing}
            />
            <Upload size={48} style={{ color: '#0077a2', marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
              {file ? file.name : 'Click to select SAP Excel file or drag and drop'}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              Expected columns: Material, Material Description, Stock Quantity on Period End
            </p>
          </label>

          {file && !importing && !importResult && (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button onClick={handleImport} className="wms-btn wms-btn-primary">
                <Upload size={18} />
                Import to Database
              </button>
              <button onClick={handleClear} className="wms-btn wms-btn-secondary">
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preview Card */}
      {preview.length > 0 && !importing && !importResult && (
        <div className="wms-panel-card" style={{ marginBottom: '2rem' }}>
          <div className="wms-panel-header">
            <h2 className="wms-panel-title">
              <FileText size={24} />
              Preview (First 5 rows)
            </h2>
            <p className="wms-panel-subtitle">Auto-classification enabled</p>
          </div>

          <div style={{ padding: '2rem' }}>
            <div className="wms-table-container">
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Material Code</th>
                    <th>Description</th>
                    <th>Stock SAP</th>
                    <th>Auto Category</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx}>
                      <td><code className="wms-article-code">{row['Material'] || '-'}</code></td>
                      <td style={{ maxWidth: '300px' }}>{row['Material Description'] || '-'}</td>
                      <td><strong>{row['Stock Quantity on Period End'] || 0}</strong></td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          background: '#eff6ff',
                          color: '#1e40af',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          border: '1px solid #bfdbfe'
                        }}>
                          <Tag size={14} />
                          {row.auto_category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {importing && (
        <div className="wms-panel-card">
          <div className="wms-loading-state" style={{ padding: '4rem' }}>
            <div className="wms-spinner"></div>
            <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#1f2937' }}>Importing SAP data...</h3>
            <p style={{ color: '#6b7280', margin: 0 }}>Processing articles and resetting movements</p>
          </div>
        </div>
      )}

      {/* Success Result */}
      {importResult && !importing && (
        <div className="wms-panel-card">
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <CheckCircle size={64} style={{ color: '#10b981', marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', margin: '0 0 1rem 0' }}>
              Import Completed Successfully!
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              margin: '2rem 0',
              textAlign: 'left'
            }}>
              <div style={{
                background: '#f9fafb',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 500, marginBottom: '0.5rem' }}>
                  Total Articles:
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937' }}>
                  {importResult.totale}
                </div>
              </div>

              <div style={{
                background: '#f0fdf4',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #bbf7d0'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 500, marginBottom: '0.5rem' }}>
                  New Articles:
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                  {importResult.nuovi}
                </div>
              </div>

              <div style={{
                background: '#fef3c7',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #fde68a'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 500, marginBottom: '0.5rem' }}>
                  Updated Articles:
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
                  {importResult.aggiornati}
                </div>
              </div>

              {/* NEW: Movements Deleted */}
              <div style={{
                background: '#fee2e2',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #fca5a5'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 500, marginBottom: '0.5rem' }}>
                  Movements Reset:
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>
                  {importResult.movementsDeleted || 0}
                </div>
              </div>
            </div>

            {importResult.categorias && (
              <div style={{
                background: '#f9fafb',
                padding: '1.5rem',
                borderRadius: '8px',
                marginTop: '2rem',
                textAlign: 'left'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#1f2937', fontSize: '1.1rem' }}>
                  Category Distribution:
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem'
                }}>
                  {Object.entries(importResult.categorias).map(([cat, count]) => (
                    <div key={cat} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'white',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <span style={{ fontWeight: 500, color: '#374151' }}>{cat}</span>
                      <span style={{ fontWeight: 700, color: '#0077a2' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NEW: Important Notice */}
            <div style={{
              background: '#fef2f2',
              border: '2px solid #fca5a5',
              padding: '1.5rem',
              borderRadius: '8px',
              marginTop: '2rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <AlertCircle size={24} style={{ color: '#dc2626' }} />
                <h4 style={{ margin: 0, color: '#dc2626', fontSize: '1.1rem' }}>
                  Important: All Movements Reset
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#6b7280', lineHeight: '1.6' }}>
                ⚠️ This import has <strong>deleted all {importResult.movementsDeleted} warehouse movements</strong> and reset stock to match the new SAP data. 
                The warehouse stock now equals the SAP stock, and movement tracking starts fresh from this point.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Load History Section */}
      {loadingHistory ? (
        <div className="wms-panel-card">
          <div className="wms-panel-header">
            <h2 className="wms-panel-title">
              <Clock size={24} />
              SAP Database Load History
            </h2>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="wms-spinner" style={{
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #0077a2',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
            <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading history...</p>
          </div>
        </div>
      ) : !lastImport ? (
        <div className="wms-panel-card">
          <div className="wms-panel-header">
            <h2 className="wms-panel-title">
              <Clock size={24} />
              SAP Database Load History
            </h2>
          </div>
          <div className="wms-empty-state">
            <Database size={64} />
            <h3>No Import History</h3>
            <p>No SAP Excel file has been uploaded yet</p>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Upload your first SAP export using the form above
            </p>
          </div>
        </div>
      ) : (
        <div className="wms-panel-card">
          <div className="wms-panel-header">
            <h2 className="wms-panel-title">
              <Clock size={24} />
              Last Import Information
            </h2>
            <p className="wms-panel-subtitle">Previous SAP data import details</p>
          </div>

          <div style={{ padding: '2rem' }}>
            {/* Success Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              border: '2px solid #86efac',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <CheckCircle size={48} style={{ color: '#16a34a', flexShrink: 0 }} />
              <div>
                <h3 style={{ margin: 0, color: '#166534', fontSize: '1.2rem' }}>
                  Database Successfully Loaded
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#15803d', fontSize: '0.95rem' }}>
                  Last import completed successfully
                </p>
              </div>
            </div>

            {/* Import Details Grid */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* Import Date */}
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #93c5fd'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <Calendar size={20} style={{ color: '#0077a2' }} />
                  <h4 style={{ margin: 0, color: '#1e40af', fontSize: '0.9rem', fontWeight: 600 }}>
                    IMPORT DATE & TIME
                  </h4>
                </div>
                <p style={{ 
                  margin: 0, 
                  color: '#1e3a8a', 
                  fontSize: '1.1rem', 
                  fontWeight: 700,
                  fontFamily: 'monospace'
                }}>
                  {formatDateTime(lastImport.data_importazione)}
                </p>
              </div>

              {/* User */}
              <div style={{
                background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #d8b4fe'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <User size={20} style={{ color: '#9333ea' }} />
                  <h4 style={{ margin: 0, color: '#7e22ce', fontSize: '0.9rem', fontWeight: 600 }}>
                    UPLOADED BY
                  </h4>
                </div>
                <p style={{ 
                  margin: 0, 
                  color: '#6b21a8', 
                  fontSize: '1.1rem', 
                  fontWeight: 700
                }}>
                  {lastImport.utente || 'System'}
                </p>
              </div>

              {/* Total Articles */}
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #fcd34d'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <Package size={20} style={{ color: '#d97706' }} />
                  <h4 style={{ margin: 0, color: '#92400e', fontSize: '0.9rem', fontWeight: 600 }}>
                    TOTAL ARTICLES
                  </h4>
                </div>
                <p style={{ 
                  margin: 0, 
                  color: '#78350f', 
                  fontSize: '1.1rem', 
                  fontWeight: 700
                }}>
                  {lastImport.totale_articoli?.toLocaleString() || 0}
                </p>
              </div>
            </div>

            {/* Import Statistics */}
            <div style={{
              marginTop: '2rem',
              background: 'white',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              padding: '1.5rem'
            }}>
              <h4 style={{ 
                margin: '0 0 1.5rem 0', 
                color: '#374151', 
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Database size={18} />
                Import Statistics
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>New Articles</span>
                    <span style={{ 
                      color: '#10b981', 
                      fontSize: '1.3rem', 
                      fontWeight: 700 
                    }}>
                      {lastImport.articoli_nuovi}
                    </span>
                  </div>
                  <div style={{ 
                    height: '8px', 
                    background: '#d1fae5', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      background: '#10b981',
                      width: `${(lastImport.articoli_nuovi / lastImport.totale_articoli) * 100}%`,
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Updated Articles</span>
                    <span style={{ 
                      color: '#0077a2', 
                      fontSize: '1.3rem', 
                      fontWeight: 700 
                    }}>
                      {lastImport.articoli_aggiornati}
                    </span>
                  </div>
                  <div style={{ 
                    height: '8px', 
                    background: '#dbeafe', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      background: '#0077a2',
                      width: `${(lastImport.articoli_aggiornati / lastImport.totale_articoli) * 100}%`,
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Banner - UPDATED */}
            <div style={{
              background: '#fef2f2',
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '2rem',
              borderLeft: '4px solid #ef4444'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#991b1b' }}>
                <strong>⚠️ Note:</strong> This import reset all warehouse movements ({lastImport.movimenti_resettati || 0} movements deleted) and synchronized stock with SAP data. 
                Movement tracking started fresh from this import.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImportExcel;
