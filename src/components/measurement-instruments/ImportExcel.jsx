// src/components/measurement-instruments/ImportExcel.jsx
import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { importInstrumentsFromExcel } from '../../firebase/instrumentsService';

const ImportExcel = ({ onComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewFile(selectedFile);
    }
  };

  const previewFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        // Show first 5 rows as preview
        setPreview(jsonData.slice(0, 5));
      } catch (error) {
        console.error('Error previewing file:', error);
        alert('Error reading Excel file');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    try {
      setLoading(true);
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          console.log('Importing data:', jsonData);

          const importResult = await importInstrumentsFromExcel(jsonData);
          setResult(importResult);
          setLoading(false);

          if (importResult.success) {
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 2000);
          }
        } catch (error) {
          console.error('Error importing:', error);
          setResult({
            success: false,
            imported: 0,
            errors: [error.message],
            message: 'Import failed'
          });
          setLoading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.5rem' }}>
          Excel File Requirements
        </h3>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Your Excel file should contain the following columns:
        </p>
        <div style={{
          background: '#f9fafb',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontFamily: 'monospace',
          color: '#4b5563'
        }}>
          N., STRUMENTO, MISURA/TIPO, COSTRUTTORE, MODELLO, MATRICOLA, REPARTO,
          ARMADIO, CAT., ASSEGNAZIONE, VERIFICA, SCADENZA
        </div>
      </div>

      {/* File Upload */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="mims-form-label">
          <FileSpreadsheet size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Select Excel File
        </label>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="mims-form-input"
        />
      </div>

      {/* Preview */}
      {preview.length > 0 && !result && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.75rem' }}>
            Preview (First 5 rows)
          </h4>
          <div style={{
            background: '#f9fafb',
            padding: '1rem',
            borderRadius: '8px',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            <pre style={{ fontSize: '0.75rem', margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(preview, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          background: result.success ? '#d1fae5' : '#fee2e2',
          border: `1px solid ${result.success ? '#86efac' : '#fca5a5'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {result.success ? (
              <CheckCircle size={20} style={{ color: '#065f46' }} />
            ) : (
              <AlertCircle size={20} style={{ color: '#991b1b' }} />
            )}
            <strong style={{ color: result.success ? '#065f46' : '#991b1b' }}>
              {result.message}
            </strong>
          </div>
          <p style={{ color: result.success ? '#065f46' : '#991b1b', fontSize: '0.875rem', margin: 0 }}>
            Imported: {result.imported} instruments
          </p>
          {result.errors && result.errors.length > 0 && (
            <details style={{ marginTop: '0.5rem' }}>
              <summary style={{ cursor: 'pointer', color: '#991b1b', fontSize: '0.875rem' }}>
                View errors ({result.errors.length})
              </summary>
              <ul style={{ marginTop: '0.5rem', fontSize: '0.8rem', paddingLeft: '1.5rem' }}>
                {result.errors.slice(0, 10).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button
          onClick={handleImport}
          disabled={!file || loading || result?.success}
          className="mims-btn mims-btn-primary"
        >
          {loading ? (
            <>
              <div className="mims-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
              Importing...
            </>
          ) : (
            <>
              <Upload size={18} />
              Import Instruments
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ImportExcel;
