// src/components/measurement-instruments/InstrumentManagement.jsx
import React, { useState } from 'react';
import { Plus, Upload, X, Search as SearchIcon } from 'lucide-react';
import ImportExcel from './ImportExcel';
import InstrumentSearch from './InstrumentSearch';
import InstrumentModal from './InstrumentModal';

const InstrumentManagement = ({ onRefresh }) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showInstrumentModal, setShowInstrumentModal] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState(null);

  const handleImportComplete = () => {
    setShowImportModal(false);
    if (onRefresh) onRefresh();
  };

  const handleSelectInstrument = (instrument) => {
    setSelectedInstrument(instrument);
    setShowInstrumentModal(true);
  };

  const handleAddNew = () => {
    setSelectedInstrument(null);
    setShowInstrumentModal(true);
  };

  const handleModalClose = () => {
    setShowInstrumentModal(false);
    setSelectedInstrument(null);
  };

  const handleModalSuccess = () => {
    if (onRefresh) onRefresh();
    // Keep modal open to show updated data
  };

  return (
    <div className="mims-panel-container">
      <div className="mims-panel-card">
        <div className="mims-panel-header">
          <div>
            <div className="mims-panel-title">
              <SearchIcon size={24} />
              Instrument Management
            </div>
            <p className="mims-panel-subtitle">
              Search for an instrument to edit, or add a new one
            </p>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={handleAddNew}
              className="mims-btn mims-btn-primary"
              style={{ flex: 1 }}
            >
              <Plus size={18} />
              Add New Instrument
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="mims-btn mims-btn-secondary"
              style={{ flex: 1 }}
            >
              <Upload size={18} />
              Import from Excel
            </button>
          </div>

          {/* Search Section */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#1f2937' }}>
              Search Existing Instrument
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Type the instrument number, name, manufacturer, or model to find and edit an existing instrument
            </p>
            <InstrumentSearch onSelectInstrument={handleSelectInstrument} />
          </div>

          {/* Info Box */}
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1px solid #bfdbfe',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
              <div style={{
                background: '#3b82f6',
                color: 'white',
                borderRadius: '50%',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <SearchIcon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e40af', marginBottom: '0.5rem' }}>
                  How to use
                </h4>
                <ul style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0, paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                  <li>Click "Add New Instrument" to create a new measurement instrument</li>
                  <li>Use the search bar to find an existing instrument by number, name, or manufacturer</li>
                  <li>Click on a search result to open the edit window</li>
                  <li>In the edit window, you can update all information, add new calibrations, upload files, or delete the instrument</li>
                  <li>Use "Import from Excel" for initial data migration (one-time import)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="mims-modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="mims-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mims-modal-header">
              <h2 className="mims-modal-title">Import Instruments from Excel</h2>
              <button
                className="mims-modal-close"
                onClick={() => setShowImportModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="mims-modal-body">
              <ImportExcel onComplete={handleImportComplete} />
            </div>
          </div>
        </div>
      )}

      {/* Instrument Modal (Add/Edit) */}
      {showInstrumentModal && (
        <InstrumentModal
          instrument={selectedInstrument}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default InstrumentManagement;
