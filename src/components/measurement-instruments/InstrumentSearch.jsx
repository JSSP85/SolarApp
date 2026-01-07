// src/components/measurement-instruments/InstrumentSearch.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { getAllInstruments } from '../../firebase/instrumentsService';

const InstrumentSearch = ({ onSelectInstrument }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [instruments, setInstruments] = useState([]);
  const [filteredInstruments, setFilteredInstruments] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadInstruments();
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredInstruments([]);
      setShowDropdown(false);
    } else {
      const filtered = instruments.filter(inst =>
        inst.instrument_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.instrument_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.model?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInstruments(filtered);
      setShowDropdown(filtered.length > 0);
    }
  }, [searchTerm, instruments]);

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

  const handleSelectInstrument = (instrument) => {
    setSearchTerm('');
    setShowDropdown(false);
    onSelectInstrument(instrument);
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'A': return 'mims-badge category-a';
      case 'B': return 'mims-badge category-b';
      case 'C': return 'mims-badge category-c';
      default: return 'mims-badge';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'valid': return 'mims-badge valid';
      case 'expiring_soon': return 'mims-badge expiring_soon';
      case 'expired': return 'mims-badge expired';
      case 'not_required': return 'mims-badge not_required';
      default: return 'mims-badge';
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={dropdownRef}>
      <div className="mims-search-box" style={{ marginBottom: 0 }}>
        <Search className="mims-search-icon" size={20} />
        <input
          type="text"
          className="mims-search-input"
          placeholder="Search by number, name, manufacturer, or model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (filteredInstruments.length > 0) {
              setShowDropdown(true);
            }
          }}
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setShowDropdown(false);
            }}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {showDropdown && filteredInstruments.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginTop: '0.5rem',
            maxHeight: '400px',
            overflowY: 'auto',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            zIndex: 1000
          }}
        >
          <div style={{ padding: '0.5rem' }}>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              padding: '0.5rem 0.75rem',
              borderBottom: '1px solid #f3f4f6',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {filteredInstruments.length} Result{filteredInstruments.length !== 1 ? 's' : ''} Found
            </div>
            {filteredInstruments.map((inst) => (
              <div
                key={inst.id}
                onClick={() => handleSelectInstrument(inst)}
                style={{
                  padding: '0.75rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f3f4f6',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{
                    background: '#e5e7eb',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    fontFamily: 'monospace',
                    color: '#1f2937'
                  }}>
                    {inst.instrument_number}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1f2937', flex: 1 }}>
                    {inst.instrument_name}
                  </span>
                  <span className={getCategoryBadgeClass(inst.category)} style={{ fontSize: '0.7rem' }}>
                    {inst.category}
                  </span>
                  <span className={getStatusBadgeClass(inst.calibration_status)} style={{ fontSize: '0.7rem' }}>
                    {inst.calibration_status === 'valid' ? 'Valid' :
                     inst.calibration_status === 'expiring_soon' ? 'Expiring' :
                     inst.calibration_status === 'expired' ? 'Expired' : 'N/A'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', gap: '1rem' }}>
                  <span>{inst.manufacturer} {inst.model}</span>
                  {inst.department && <span>• {inst.department}</span>}
                  {inst.location_type === 'person' && inst.assigned_to && (
                    <span>• 👤 {inst.assigned_to}</span>
                  )}
                  {inst.location_type === 'cabinet' && inst.cabinet && (
                    <span>• 🗄️ Cabinet {inst.cabinet}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {showDropdown && searchTerm && filteredInstruments.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginTop: '0.5rem',
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            zIndex: 1000
          }}
        >
          <p style={{ color: '#6b7280', margin: 0 }}>
            No instruments found matching "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
};

export default InstrumentSearch;
