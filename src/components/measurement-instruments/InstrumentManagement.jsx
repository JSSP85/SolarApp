// src/components/measurement-instruments/InstrumentManagement.jsx
import React, { useState } from 'react';
import { Plus, Upload, X } from 'lucide-react';
import ImportExcel from './ImportExcel';
import InstrumentForm from './InstrumentForm';
import InstrumentList from './InstrumentList';

const InstrumentManagement = ({ onRefresh }) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleImportComplete = () => {
    setShowImportModal(false);
    setRefreshKey(prev => prev + 1);
    if (onRefresh) onRefresh();
  };

  const handleFormComplete = () => {
    setShowAddForm(false);
    setRefreshKey(prev => prev + 1);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="mims-panel-container">
      <div className="mims-panel-card">
        <div className="mims-panel-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="mims-panel-title">Instrument Management</div>
              <p className="mims-panel-subtitle">
                Add, edit, or import measurement instruments
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowImportModal(true)}
                className="mims-btn mims-btn-secondary"
              >
                <Upload size={18} />
                Import from Excel
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="mims-btn mims-btn-primary"
              >
                {showAddForm ? <X size={18} /> : <Plus size={18} />}
                {showAddForm ? 'Cancel' : 'Add Instrument'}
              </button>
            </div>
          </div>
        </div>

        {showAddForm && (
          <div style={{ padding: '2rem', borderBottom: '1px solid #e5e7eb' }}>
            <InstrumentForm
              onComplete={handleFormComplete}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        <div style={{ padding: '2rem' }}>
          <InstrumentList
            key={refreshKey}
            onRefresh={() => {
              setRefreshKey(prev => prev + 1);
              if (onRefresh) onRefresh();
            }}
          />
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
    </div>
  );
};

export default InstrumentManagement;
