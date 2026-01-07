// src/components/measurement-instruments/InstrumentForm.jsx
import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { createInstrument } from '../../firebase/instrumentsService';

const InstrumentForm = ({ onComplete, onCancel }) => {
  const [formData, setFormData] = useState({
    instrument_number: '',
    instrument_name: '',
    measurement_type: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    department: '',
    location_type: 'person',
    assigned_to: '',
    cabinet: '',
    category: 'A',
    current_calibration_date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-clear location fields based on type
    if (name === 'location_type') {
      if (value === 'person') {
        setFormData(prev => ({ ...prev, cabinet: '' }));
      } else {
        setFormData(prev => ({ ...prev, assigned_to: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createInstrument(formData);
      alert('Instrument created successfully!');
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Error creating instrument:', error);
      alert('Error creating instrument: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Column 1 */}
        <div>
          <div className="mims-form-group">
            <label className="mims-form-label">Instrument Number *</label>
            <input
              name="instrument_number"
              value={formData.instrument_number}
              onChange={handleChange}
              className="mims-form-input"
              placeholder="N.001"
              required
            />
          </div>

          <div className="mims-form-group">
            <label className="mims-form-label">Instrument Name *</label>
            <input
              name="instrument_name"
              value={formData.instrument_name}
              onChange={handleChange}
              className="mims-form-input"
              required
            />
          </div>

          <div className="mims-form-group">
            <label className="mims-form-label">Measurement Type</label>
            <input
              name="measurement_type"
              value={formData.measurement_type}
              onChange={handleChange}
              className="mims-form-input"
              placeholder="e.g., Digital, Analog"
            />
          </div>

          <div className="mims-form-group">
            <label className="mims-form-label">Manufacturer</label>
            <input
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              className="mims-form-input"
            />
          </div>

          <div className="mims-form-group">
            <label className="mims-form-label">Model</label>
            <input
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="mims-form-input"
            />
          </div>

          <div className="mims-form-group">
            <label className="mims-form-label">Serial Number</label>
            <input
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              className="mims-form-input"
            />
          </div>
        </div>

        {/* Column 2 */}
        <div>
          <div className="mims-form-group">
            <label className="mims-form-label">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mims-form-select"
              required
            >
              <option value="A">Category A (3 years validity)</option>
              <option value="B">Category B (2 years validity)</option>
              <option value="C">Category C (No verification required)</option>
            </select>
          </div>

          <div className="mims-form-group">
            <label className="mims-form-label">Department</label>
            <input
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="mims-form-input"
              placeholder="e.g., PROD, O&M, SAT"
            />
          </div>

          <div className="mims-form-group">
            <label className="mims-form-label">Location Type *</label>
            <select
              name="location_type"
              value={formData.location_type}
              onChange={handleChange}
              className="mims-form-select"
              required
            >
              <option value="person">With Person</option>
              <option value="cabinet">In Cabinet</option>
            </select>
          </div>

          {formData.location_type === 'person' ? (
            <div className="mims-form-group">
              <label className="mims-form-label">Assigned To</label>
              <input
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                className="mims-form-input"
                placeholder="Person name"
              />
            </div>
          ) : (
            <div className="mims-form-group">
              <label className="mims-form-label">Cabinet</label>
              <select
                name="cabinet"
                value={formData.cabinet}
                onChange={handleChange}
                className="mims-form-select"
              >
                <option value="">Select Cabinet</option>
                <option value="A">Cabinet A</option>
                <option value="B">Cabinet B</option>
                <option value="C">Cabinet C</option>
                <option value="D">Cabinet D</option>
              </select>
            </div>
          )}

          <div className="mims-form-group">
            <label className="mims-form-label">Calibration Date</label>
            <input
              type="date"
              name="current_calibration_date"
              value={formData.current_calibration_date}
              onChange={handleChange}
              className="mims-form-input"
            />
          </div>

          <div className="mims-form-group">
            <label className="mims-form-label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="mims-form-textarea"
              rows="3"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
        <button
          type="button"
          onClick={onCancel}
          className="mims-btn mims-btn-secondary"
          disabled={loading}
        >
          <X size={18} />
          Cancel
        </button>
        <button
          type="submit"
          className="mims-btn mims-btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="mims-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Instrument
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default InstrumentForm;
