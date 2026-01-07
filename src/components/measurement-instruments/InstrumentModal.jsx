// src/components/measurement-instruments/InstrumentModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Upload, CheckCircle, Download, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import {
  createInstrument,
  updateInstrument,
  deleteInstrument,
  addCalibrationRecord,
  uploadInstrumentPhoto,
  uploadCalibrationCertificate
} from '../../firebase/instrumentsService';

const InstrumentModal = ({ instrument, onClose, onSuccess }) => {
  const isEditMode = !!instrument;

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

  const [newCalibrationDate, setNewCalibrationDate] = useState('');
  const [certificateFile, setCertificateFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (instrument) {
      setFormData({
        instrument_number: instrument.instrument_number || '',
        instrument_name: instrument.instrument_name || '',
        measurement_type: instrument.measurement_type || '',
        manufacturer: instrument.manufacturer || '',
        model: instrument.model || '',
        serial_number: instrument.serial_number || '',
        department: instrument.department || '',
        location_type: instrument.location_type || 'person',
        assigned_to: instrument.assigned_to || '',
        cabinet: instrument.cabinet || '',
        category: instrument.category || 'A',
        current_calibration_date: instrument.current_calibration_date
          ? new Date(instrument.current_calibration_date).toISOString().split('T')[0]
          : '',
        notes: instrument.notes || ''
      });
    }
  }, [instrument]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'location_type') {
      if (value === 'person') {
        setFormData(prev => ({ ...prev, cabinet: '' }));
      } else {
        setFormData(prev => ({ ...prev, assigned_to: '' }));
      }
    }
  };

  const handleCertificateUpload = async () => {
    if (!certificateFile || !instrument) return;

    try {
      setUploadingCertificate(true);
      const url = await uploadCalibrationCertificate(instrument.instrument_number, certificateFile);
      await updateInstrument(instrument.id, { certificate_pdf_url: url });
      alert('Certificate uploaded successfully!');
      setCertificateFile(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error uploading certificate:', error);
      alert('Error uploading certificate: ' + error.message);
    } finally {
      setUploadingCertificate(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile || !instrument) return;

    try {
      setUploadingPhoto(true);
      const url = await uploadInstrumentPhoto(instrument.instrument_number, photoFile);
      await updateInstrument(instrument.id, { instrument_photo_url: url });
      alert('Photo uploaded successfully!');
      setPhotoFile(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo: ' + error.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddCalibration = async () => {
    if (!newCalibrationDate || !instrument) {
      alert('Please enter a calibration date');
      return;
    }

    try {
      setLoading(true);

      // Upload certificate if provided
      let certificateUrl = null;
      if (certificateFile) {
        certificateUrl = await uploadCalibrationCertificate(instrument.instrument_number, certificateFile);
      }

      await addCalibrationRecord(instrument.id, {
        calibration_date: newCalibrationDate,
        certificate_url: certificateUrl,
        notes: formData.notes || ''
      });

      alert('Calibration record added successfully!');
      setNewCalibrationDate('');
      setCertificateFile(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error adding calibration:', error);
      alert('Error adding calibration: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode) {
        // Update existing instrument
        await updateInstrument(instrument.id, formData);

        // Upload files if provided
        if (certificateFile) {
          const certUrl = await uploadCalibrationCertificate(formData.instrument_number, certificateFile);
          await updateInstrument(instrument.id, { certificate_pdf_url: certUrl });
        }
        if (photoFile) {
          const photoUrl = await uploadInstrumentPhoto(formData.instrument_number, photoFile);
          await updateInstrument(instrument.id, { instrument_photo_url: photoUrl });
        }

        alert('Instrument updated successfully!');
      } else {
        // Create new instrument
        await createInstrument(formData);

        // Upload files if provided (after creation)
        if (certificateFile || photoFile) {
          if (certificateFile) {
            const certUrl = await uploadCalibrationCertificate(formData.instrument_number, certificateFile);
            await updateInstrument(formData.instrument_number, { certificate_pdf_url: certUrl });
          }
          if (photoFile) {
            const photoUrl = await uploadInstrumentPhoto(formData.instrument_number, photoFile);
            await updateInstrument(formData.instrument_number, { instrument_photo_url: photoUrl });
          }
        }

        alert('Instrument created successfully!');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving instrument:', error);
      alert('Error saving instrument: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!instrument) return;

    if (window.confirm(`Are you sure you want to delete "${instrument.instrument_name}"? This action cannot be undone.`)) {
      try {
        setLoading(true);
        await deleteInstrument(instrument.id);
        alert('Instrument deleted successfully!');
        if (onSuccess) onSuccess();
        onClose();
      } catch (error) {
        console.error('Error deleting instrument:', error);
        alert('Error deleting instrument: ' + error.message);
        setLoading(false);
      }
    }
  };

  const getValidityYears = (category) => {
    switch(category) {
      case 'A': return 3;
      case 'B': return 2;
      case 'C': return 'N/A (No verification required)';
      default: return 'N/A';
    }
  };

  const calculateExpirationDate = (calibrationDate, category) => {
    if (!calibrationDate || category === 'C') return 'N/A';
    const validity = category === 'A' ? 3 : category === 'B' ? 2 : 0;
    if (validity === 0) return 'N/A';

    const expDate = new Date(calibrationDate);
    expDate.setFullYear(expDate.getFullYear() + validity);
    return expDate.toLocaleDateString();
  };

  return (
    <div className="mims-modal-overlay" onClick={onClose}>
      <div
        className="mims-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '900px' }}
      >
        <div className="mims-modal-header">
          <h2 className="mims-modal-title">
            {isEditMode ? `Edit Instrument: ${instrument.instrument_number}` : 'Add New Instrument'}
          </h2>
          <button className="mims-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mims-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', background: '#f9fafb' }}>

            {/* Basic Information */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                Basic Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem' }}>
                <div className="mims-form-group">
                  <label className="mims-form-label">Instrument Number *</label>
                  <input
                    name="instrument_number"
                    value={formData.instrument_number}
                    onChange={handleChange}
                    className="mims-form-input"
                    placeholder="N.001"
                    required
                    disabled={isEditMode}
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
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    Validity: {getValidityYears(formData.category)}
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Data */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                Technical Data
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '1rem' }}>
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

                <div className="mims-form-group">
                  <label className="mims-form-label">Department</label>
                  <input
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="mims-form-input"
                    placeholder="e.g., PROD, O&M"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                Location
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem' }}>
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
              </div>
            </div>

            {/* Calibration - Existing Instrument */}
            {isEditMode && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                  Current Calibration
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Last Calibration</div>
                    <div style={{ fontWeight: 600, color: '#1f2937' }}>
                      {instrument.current_calibration_date
                        ? new Date(instrument.current_calibration_date).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Expiration Date</div>
                    <div style={{ fontWeight: 600, color: '#1f2937' }}>
                      {instrument.current_expiration_date
                        ? new Date(instrument.current_expiration_date).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Status</div>
                    <span className={`mims-badge ${instrument.calibration_status}`}>
                      {instrument.calibration_status === 'valid' ? 'Valid' :
                       instrument.calibration_status === 'expiring_soon' ? 'Expiring Soon' :
                       instrument.calibration_status === 'expired' ? 'Expired' : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Add New Calibration */}
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: '#1e40af' }}>
                    Add New Calibration Record
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'end' }}>
                    <div className="mims-form-group" style={{ marginBottom: 0 }}>
                      <label className="mims-form-label">New Calibration Date</label>
                      <input
                        type="date"
                        value={newCalibrationDate}
                        onChange={(e) => setNewCalibrationDate(e.target.value)}
                        className="mims-form-input"
                      />
                      {newCalibrationDate && formData.category !== 'C' && (
                        <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
                          → New expiration: {calculateExpirationDate(newCalibrationDate, formData.category)}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCalibration}
                      disabled={!newCalibrationDate || loading}
                      className="mims-btn mims-btn-primary"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <Save size={18} />
                      Add Calibration
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Calibration - New Instrument */}
            {!isEditMode && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                  Initial Calibration
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem' }}>
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
                    <label className="mims-form-label">Expiration Date (Auto-calculated)</label>
                    <input
                      type="text"
                      value={calculateExpirationDate(formData.current_calibration_date, formData.category)}
                      className="mims-form-input"
                      disabled
                      style={{ background: '#e5e7eb', color: '#6b7280' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* File Uploads */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                Attachments (Optional)
              </h3>

              {/* Certificate PDF */}
              <div style={{ marginBottom: '1rem', padding: '1.25rem', background: 'white', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={18} style={{ color: '#0077a2' }} />
                    <span style={{ fontWeight: 600, color: '#1f2937' }}>Calibration Certificate (PDF)</span>
                  </div>
                  {instrument?.certificate_pdf_url && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={16} style={{ color: '#10b981' }} />
                      <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>Uploaded</span>
                    </div>
                  )}
                </div>

                {instrument?.certificate_pdf_url && (
                  <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#d1fae5', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: 500 }}>
                      📄 {instrument.certificate_pdf_url.split('/').pop().split('?')[0].substring(0, 35)}...
                    </span>
                    <a
                      href={instrument.certificate_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mims-btn mims-btn-secondary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                    >
                      <Download size={14} />
                      Download
                    </a>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setCertificateFile(e.target.files[0])}
                    id="cert-file-input"
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="cert-file-input"
                    className="mims-btn mims-btn-secondary"
                    style={{ cursor: 'pointer', marginBottom: 0 }}
                  >
                    <Upload size={16} />
                    {certificateFile ? certificateFile.name.substring(0, 25) + '...' : 'Choose File'}
                  </label>
                  {isEditMode && certificateFile && (
                    <button
                      type="button"
                      onClick={handleCertificateUpload}
                      disabled={uploadingCertificate}
                      className="mims-btn mims-btn-primary"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {uploadingCertificate ? 'Uploading...' : 'Upload PDF'}
                    </button>
                  )}
                </div>
              </div>

              {/* Photo */}
              <div style={{ padding: '1.25rem', background: 'white', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ImageIcon size={18} style={{ color: '#0077a2' }} />
                    <span style={{ fontWeight: 600, color: '#1f2937' }}>Instrument Photo</span>
                  </div>
                  {instrument?.instrument_photo_url && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={16} style={{ color: '#10b981' }} />
                      <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>Uploaded</span>
                    </div>
                  )}
                </div>

                {instrument?.instrument_photo_url && (
                  <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#d1fae5', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: 500 }}>
                      📸 {instrument.instrument_photo_url.split('/').pop().split('?')[0].substring(0, 35)}...
                    </span>
                    <a
                      href={instrument.instrument_photo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mims-btn mims-btn-secondary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                    >
                      <Download size={14} />
                      View
                    </a>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files[0])}
                    id="photo-file-input"
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="photo-file-input"
                    className="mims-btn mims-btn-secondary"
                    style={{ cursor: 'pointer', marginBottom: 0 }}
                  >
                    <Upload size={16} />
                    {photoFile ? photoFile.name.substring(0, 25) + '...' : 'Choose File'}
                  </label>
                  {isEditMode && photoFile && (
                    <button
                      type="button"
                      onClick={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="mims-btn mims-btn-primary"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                Notes
              </h3>
              <div className="mims-form-group">
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="mims-form-textarea"
                  rows="3"
                  placeholder="Additional notes or comments..."
                />
              </div>
            </div>

          </div>

          <div className="mims-modal-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="mims-btn mims-btn-danger"
                  >
                    <Trash2 size={18} />
                    Delete Instrument
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={onClose}
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
                      {isEditMode ? 'Save Changes' : 'Create Instrument'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstrumentModal;
