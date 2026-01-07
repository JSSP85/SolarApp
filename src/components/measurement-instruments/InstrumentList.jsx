// src/components/measurement-instruments/InstrumentList.jsx
import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { getAllInstruments, deleteInstrument } from '../../firebase/instrumentsService';

const InstrumentList = ({ onRefresh }) => {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInstruments();
  }, []);

  const loadInstruments = async () => {
    try {
      setLoading(true);
      const data = await getAllInstruments();
      setInstruments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading instruments:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (instrumentId, instrumentName) => {
    if (window.confirm(`Are you sure you want to delete "${instrumentName}"? This action cannot be undone.`)) {
      try {
        await deleteInstrument(instrumentId);
        alert('Instrument deleted successfully');
        loadInstruments();
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error('Error deleting instrument:', error);
        alert('Error deleting instrument: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="mims-loading-state">
        <div className="mims-spinner"></div>
        <p>Loading instruments...</p>
      </div>
    );
  }

  if (instruments.length === 0) {
    return (
      <div className="mims-empty-state">
        <p>No instruments found. Add your first instrument or import from Excel.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
        All Instruments ({instruments.length})
      </h3>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {instruments.map((inst) => (
          <div
            key={inst.id}
            style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{
                  background: '#e5e7eb',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  fontFamily: 'monospace'
                }}>
                  {inst.instrument_number}
                </span>
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>
                  {inst.instrument_name}
                </span>
                <span className={`mims-badge category-${inst.category.toLowerCase()}`}>
                  {inst.category}
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {inst.manufacturer} {inst.model && `• ${inst.model}`}
                {inst.department && ` • ${inst.department}`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="mims-btn mims-btn-secondary"
                style={{ padding: '0.5rem' }}
                title="View Details"
              >
                <Eye size={18} />
              </button>
              <button
                className="mims-btn mims-btn-danger"
                style={{ padding: '0.5rem' }}
                onClick={() => handleDelete(inst.id, inst.instrument_name)}
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstrumentList;
