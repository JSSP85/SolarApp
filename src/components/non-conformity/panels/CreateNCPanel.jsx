// src/components/non-conformity/panels/CreateNCPanel.jsx - COMPLETAMENTE ACTUALIZADO
import React, { useState, useEffect } from 'react';
import { useNonConformity } from '../../../context/NonConformityContext';

// Validation message component
const ValidationMessage = ({ message }) => (
  <div className="nc-validation-message">
    <span className="nc-validation-icon">⚠️</span>
    <span>{message}</span>
  </div>
);

const CreateNCPanel = () => {
  const { state, dispatch, helpers } = useNonConformity();
  const { currentNC, validationErrors, loading } = state;
  
  // Local state
  const [isDirty, setIsDirty] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);

  // Generate new NC number on component mount
  useEffect(() => {
    if (!currentNC.number) {
      const newNumber = helpers.generateNCNumber();
      dispatch({
        type: 'UPDATE_NC_FIELD',
        payload: { field: 'number', value: newNumber }
      });
    }
  }, [currentNC.number, dispatch, helpers]);

  // Handle field changes
  const handleFieldChange = (field, value) => {
    dispatch({
      type: 'UPDATE_NC_FIELD',
      payload: { field, value }
    });
    setIsDirty(true);
    setSavedSuccessfully(false);

    // Clear validation error for this field
    if (validationErrors[field]) {
      dispatch({
        type: 'CLEAR_VALIDATION_ERRORS'
      });
    }
  };

  // Validation function
  const validateForm = () => {
    const errors = {};

    if (!currentNC.priority) errors.priority = 'Priority is required';
    if (!currentNC.project) errors.project = 'Project is required';
    if (!currentNC.projectCode) errors.projectCode = 'Project Code CM is required';
    if (!currentNC.date) errors.date = 'Date is required';
    if (!currentNC.ncType) errors.ncType = 'Non-Conformity Type is required';
    if (!currentNC.description) errors.description = 'Problem Description is required';
    if (!currentNC.componentCode) errors.componentCode = 'Component Code is required';
    if (!currentNC.quantity) errors.quantity = 'Quantity is required';
    if (!currentNC.createdBy) errors.createdBy = 'Inspector Name is required';
    if (!currentNC.sector) errors.sector = 'Sector is required';

    dispatch({
      type: 'SET_VALIDATION_ERRORS',
      payload: errors
    });

    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSave = async () => {
    setShowValidation(true);
    
    if (!validateForm()) {
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const newNCData = {
        ...currentNC,
        id: Date.now().toString(),
        number: currentNC.number || helpers.generateNCNumber(),
        createdDate: currentNC.date || new Date().toLocaleDateString('en-GB'),
        status: 'open'
      };

      dispatch({
        type: 'SAVE_NC',
        payload: newNCData
      });

      setSavedSuccessfully(true);
      setIsDirty(false);
      setShowValidation(false);
      
      // Generate new NC number for next NC
      setTimeout(() => {
        const newNumber = helpers.generateNCNumber();
        dispatch({
          type: 'UPDATE_NC_FIELD',
          payload: { field: 'number', value: newNumber }
        });
      }, 2000);

    } catch (error) {
      console.error('Error saving NC:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save Non-Conformity. Please try again.' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Handle form clear
  const handleClear = () => {
    if (isDirty) {
      if (window.confirm('Are you sure you want to clear all fields? Unsaved changes will be lost.')) {
        dispatch({ type: 'CLEAR_CURRENT_NC' });
        setIsDirty(false);
        setShowValidation(false);
        setSavedSuccessfully(false);
        
        // Generate new NC number
        const newNumber = helpers.generateNCNumber();
        dispatch({
          type: 'UPDATE_NC_FIELD',
          payload: { field: 'number', value: newNumber }
        });
      }
    } else {
      dispatch({ type: 'CLEAR_CURRENT_NC' });
    }
  };

  // Pre-defined options
  const priorityOptions = [
    { value: '', label: 'Select priority' },
    { value: 'critical', label: 'CRITICAL' },
    { value: 'major', label: 'MAJOR' },
    { value: 'minor', label: 'MINOR' }
  ];

  const ncTypeOptions = [
    { value: '', label: 'Select type' },
    { value: 'damaged_package', label: 'Damaged package' },
    { value: 'bol_mismatch', label: 'BoL does not match Order' },
    { value: 'material_mismatch', label: 'Material does not match BoL' },
    { value: 'design_error', label: 'BOQ / design error' },
    { value: 'procedure_error', label: 'Procedure / operating instruction' },
    { value: 'calibration_issue', label: 'Calibration / Instrumentation' },
    { value: 'equipment_production', label: 'Lack of adequate equipment in production' },
    { value: 'equipment_site', label: 'Lack of adequate equipment on site' },
    { value: 'contractual_conditions', label: 'Contractual Conditions not fulfilled' },
    { value: 'incomplete_job', label: 'Incomplete Job' },
    { value: 'defective_product', label: 'Defective Product' },
    { value: 'other', label: 'Other' }
  ];

  const materialDispositionOptions = [
    { value: '', label: 'Select disposition' },
    { value: 'accept_as_is', label: 'Accept as is' },
    { value: 'rework_by_supplier', label: 'Rework by supplier' },
    { value: 'rework_by_convert', label: 'Rework by Convert' },
    { value: 'reject', label: 'Reject' }
  ];

  return (
    <div className="nc-create-panel">
      {/* Success Message */}
      {savedSuccessfully && (
        <div className="nc-success-banner">
          <span className="nc-success-icon">✅</span>
          <span>Non-Conformity {currentNC.number} has been created successfully!</span>
        </div>
      )}

      {/* ✅ TARJETA PRINCIPAL CON COLOR SIDEBAR + TRANSPARENCIA */}
      <div className="nc-panel-card-transparent">
        <div className="nc-panel-header">
          <h3 className="nc-panel-title">
            <span className="nc-panel-icon">➕</span>
            Create New Non-Conformity
          </h3>
          <p className="nc-panel-subtitle">
            Complete all required fields to create a new non-conformity report
          </p>
        </div>

        <div className="nc-form-container">
          {/* ✅ BASIC INFORMATION SECTION - CAMPOS ACTUALIZADOS */}
          <div className="nc-form-section">
            <h4 className="nc-section-title">📋 Basic Information</h4>
            
            <div className="nc-form-grid">
              {/* NC Number */}
              <div className="nc-form-group">
                <label className="nc-form-label">
                  NC Number <span className="nc-auto-generated">(Auto-generated)</span>
                </label>
                <input
                  type="text"
                  className="nc-form-input nc-input-readonly"
                  value={currentNC.number}
                  readOnly
                />
              </div>

              {/* Priority */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Priority *</label>
                <select
                  className={`nc-form-select ${validationErrors.priority ? 'error' : ''}`}
                  value={currentNC.priority}
                  onChange={(e) => handleFieldChange('priority', e.target.value)}
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {showValidation && validationErrors.priority && (
                  <ValidationMessage message={validationErrors.priority} />
                )}
              </div>
            </div>

            <div className="nc-form-grid">
              {/* ✅ PROJECT - TEXTBOX LIBRE */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Project *</label>
                <input
                  type="text"
                  className={`nc-form-input ${validationErrors.project ? 'error' : ''}`}
                  value={currentNC.project}
                  onChange={(e) => handleFieldChange('project', e.target.value)}
                  placeholder="Enter project name (e.g., JESI, SOLAR PARK A)"
                />
                {showValidation && validationErrors.project && (
                  <ValidationMessage message={validationErrors.project} />
                )}
              </div>

              {/* ✅ PROJECT CODE CM - NUEVO CAMPO */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Project Code CM *</label>
                <input
                  type="text"
                  className={`nc-form-input ${validationErrors.projectCode ? 'error' : ''}`}
                  value={currentNC.projectCode}
                  onChange={(e) => handleFieldChange('projectCode', e.target.value)}
                  placeholder="Enter project code (e.g., 12926)"
                />
                {showValidation && validationErrors.projectCode && (
                  <ValidationMessage message={validationErrors.projectCode} />
                )}
              </div>
            </div>

            <div className="nc-form-grid">
              {/* ✅ FECHA - NUEVO CAMPO CON CALENDARIO */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Date *</label>
                <input
                  type="date"
                  className={`nc-form-input ${validationErrors.date ? 'error' : ''}`}
                  value={currentNC.date}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                />
                {showValidation && validationErrors.date && (
                  <ValidationMessage message={validationErrors.date} />
                )}
              </div>

              {/* Supplier */}
              <div className="nc-form-group">
                <label className="nc-form-label">Supplier</label>
                <input
                  type="text"
                  className="nc-form-input"
                  value={currentNC.supplier}
                  onChange={(e) => handleFieldChange('supplier', e.target.value)}
                  placeholder="e.g., SCI-FAPI"
                />
              </div>
            </div>
          </div>

          {/* ✅ NON-CONFORMITY DETAILS SECTION - CAMPOS ACTUALIZADOS */}
          <div className="nc-form-section">
            <h4 className="nc-section-title">🔍 Non-Conformity Details</h4>
            
            {/* NC Type */}
            <div className="nc-form-group">
              <label className="nc-form-label required">Non-Conformity Type *</label>
              <select
                className={`nc-form-select ${validationErrors.ncType ? 'error' : ''}`}
                value={currentNC.ncType}
                onChange={(e) => handleFieldChange('ncType', e.target.value)}
              >
                {ncTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {showValidation && validationErrors.ncType && (
                <ValidationMessage message={validationErrors.ncType} />
              )}
            </div>

            {/* ✅ DESCRIPTION - RESIZE LIMITADO HORIZONTALMENTE */}
            <div className="nc-form-group">
              <label className="nc-form-label required">Problem Description *</label>
              <textarea
                className={`nc-form-textarea-limited ${validationErrors.description ? 'error' : ''}`}
                rows="4"
                value={currentNC.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Describe the problem found in detail. Include specific measurements, quantities, and impact on assembly/installation..."
              />
              <div className="nc-char-count">
                {currentNC.description.length}/1000 characters
              </div>
              {showValidation && validationErrors.description && (
                <ValidationMessage message={validationErrors.description} />
              )}
            </div>

            <div className="nc-form-grid">
              {/* ✅ PURCHASE ORDER - NUEVO CAMPO OPCIONAL */}
              <div className="nc-form-group">
                <label className="nc-form-label">Purchase Order (Optional)</label>
                <input
                  type="text"
                  className="nc-form-input"
                  value={currentNC.purchaseOrder}
                  onChange={(e) => handleFieldChange('purchaseOrder', e.target.value)}
                  placeholder="e.g., PO-2024-001"
                />
              </div>

              {/* ✅ COMPONENT CODE - NUEVO CAMPO OBLIGATORIO */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Component Code *</label>
                <input
                  type="text"
                  className={`nc-form-input ${validationErrors.componentCode ? 'error' : ''}`}
                  value={currentNC.componentCode}
                  onChange={(e) => handleFieldChange('componentCode', e.target.value)}
                  placeholder="e.g., L4-155X110X50X4.5"
                />
                {showValidation && validationErrors.componentCode && (
                  <ValidationMessage message={validationErrors.componentCode} />
                )}
              </div>
            </div>

            <div className="nc-form-grid">
              {/* ✅ QUANTITY - NUEVO CAMPO OBLIGATORIO */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Quantity *</label>
                <input
                  type="number"
                  className={`nc-form-input ${validationErrors.quantity ? 'error' : ''}`}
                  value={currentNC.quantity}
                  onChange={(e) => handleFieldChange('quantity', e.target.value)}
                  placeholder="Enter quantity"
                  min="1"
                />
                {showValidation && validationErrors.quantity && (
                  <ValidationMessage message={validationErrors.quantity} />
                )}
              </div>

              {/* Affected Component (Existing) */}
              <div className="nc-form-group">
                <label className="nc-form-label">Affected Component</label>
                <input
                  type="text"
                  className="nc-form-input"
                  value={currentNC.component}
                  onChange={(e) => handleFieldChange('component', e.target.value)}
                  placeholder="e.g., 232 pali L4 LATERAL POST, 155X110X50X4.5MM, 4200MM, S420MC, HDG_100"
                />
              </div>
            </div>

            <div className="nc-form-grid">
              {/* ✅ INSPECTOR NAME - NUEVO CAMPO */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Inspector Name *</label>
                <input
                  type="text"
                  className={`nc-form-input ${validationErrors.createdBy ? 'error' : ''}`}
                  value={currentNC.createdBy}
                  onChange={(e) => handleFieldChange('createdBy', e.target.value)}
                  placeholder="Enter inspector name"
                />
                {showValidation && validationErrors.createdBy && (
                  <ValidationMessage message={validationErrors.createdBy} />
                )}
              </div>

              {/* ✅ SECTOR - NUEVO CAMPO */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Sector *</label>
                <input
                  type="text"
                  className={`nc-form-input ${validationErrors.sector ? 'error' : ''}`}
                  value={currentNC.sector}
                  onChange={(e) => handleFieldChange('sector', e.target.value)}
                  placeholder="e.g., Quality Control, Production, Installation"
                />
                {showValidation && validationErrors.sector && (
                  <ValidationMessage message={validationErrors.sector} />
                )}
              </div>
            </div>
          </div>

          {/* ✅ NC - TREATMENT / RESOLUTION SECTION - NOMBRE CAMBIADO */}
          <div className="nc-form-section">
            <h4 className="nc-section-title">⚙️ NC - TREATMENT / RESOLUTION</h4>
            
            <div className="nc-form-group">
              <label className="nc-form-label">Proposed Disposition</label>
              <select
                className="nc-form-select"
                value={currentNC.materialDisposition}
                onChange={(e) => handleFieldChange('materialDisposition', e.target.value)}
              >
                {materialDispositionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Containment Action */}
            <div className="nc-form-group">
              <label className="nc-form-label">Containment Action</label>
              <textarea
                className="nc-form-textarea-limited"
                rows="2"
                value={currentNC.containmentAction}
                onChange={(e) => handleFieldChange('containmentAction', e.target.value)}
                placeholder="Describe immediate actions taken to contain the defect..."
              />
            </div>
          </div>

          {/* ✅ NC - CORRECTIVE ACTION REQUEST - NUEVA SECCIÓN */}
          <div className="nc-form-section">
            <h4 className="nc-section-title">🔧 NC - CORRECTIVE ACTION REQUEST</h4>
            
            {/* Root Cause Analysis */}
            <div className="nc-form-group">
              <label className="nc-form-label">Root Cause Analysis Description</label>
              <textarea
                className="nc-form-textarea-limited"
                rows="3"
                value={currentNC.rootCauseAnalysis}
                onChange={(e) => handleFieldChange('rootCauseAnalysis', e.target.value)}
                placeholder="Describe the root cause analysis performed to identify the underlying cause of this non-conformity..."
              />
            </div>

            {/* Corrective Action Plan */}
            <div className="nc-form-group">
              <label className="nc-form-label">Corrective Action Plan Description</label>
              <textarea
                className="nc-form-textarea-limited"
                rows="3"
                value={currentNC.correctiveActionPlan}
                onChange={(e) => handleFieldChange('correctiveActionPlan', e.target.value)}
                placeholder="Describe the corrective action plan to address the root cause and prevent recurrence..."
              />
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="nc-form-section">
            <h4 className="nc-section-title">📷 Photo Documentation</h4>
            <p className="nc-section-subtitle">
              Upload photos showing the non-conformity. Images help with analysis and resolution.
            </p>
            
            <div className="nc-photo-upload-area">
              <div className="nc-upload-placeholder">
                <span className="nc-upload-icon">📸</span>
                <p>Click to upload photos or drag and drop</p>
                <p className="nc-upload-note">Supports: JPG, PNG, GIF (Max 5MB each)</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="nc-form-actions">
            <button
              type="button"
              className="nc-btn nc-btn-secondary"
              onClick={handleClear}
              disabled={loading}
            >
              Clear Form
            </button>
            
            <button
              type="button"
              className="nc-btn nc-btn-primary"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="nc-spinner"></span>
                  Creating NC...
                </>
              ) : (
                <>
                  <span className="nc-btn-icon">💾</span>
                  Create Non-Conformity
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ ESTILOS ACTUALIZADOS */}
      <style jsx>{`
        .nc-create-panel {
          padding: 0;
          max-width: 100%;
        }

        .nc-success-banner {
          background: linear-gradient(to right, #10b981, #059669);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        /* ✅ TARJETA PRINCIPAL CON TRANSPARENCIA */
        .nc-panel-card-transparent {
          background: rgba(0, 95, 131, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 95, 131, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .nc-panel-header {
          background: linear-gradient(135deg, rgba(0, 119, 162, 0.9) 0%, rgba(0, 144, 198, 0.8) 100%);
          padding: 1.5rem 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nc-panel-title {
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .nc-panel-icon {
          font-size: 1.75rem;
        }

        .nc-panel-subtitle {
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          font-size: 0.95rem;
        }

        .nc-form-container {
          padding: 2rem;
        }

        .nc-form-section {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nc-section-title {
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .nc-section-subtitle {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .nc-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .nc-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nc-form-label {
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .nc-form-label.required::after {
          content: ' *';
          color: #ff6b6b;
        }

        .nc-auto-generated {
          color: rgba(255, 255, 255, 0.6);
          font-weight: 400;
          font-size: 0.75rem;
        }

        .nc-form-input, .nc-form-select {
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.9);
          color: #374151;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .nc-form-input:focus, .nc-form-select:focus {
          outline: none;
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: white;
        }

        .nc-input-readonly {
          background: rgba(255, 255, 255, 0.5);
          cursor: not-allowed;
        }

        /* ✅ TEXTAREA LIMITADO HORIZONTALMENTE */
        .nc-form-textarea-limited {
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.9);
          color: #374151;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          font-family: inherit;
          /* ✅ LIMITAR RESIZE SOLO VERTICAL */
          resize: vertical;
          min-height: 80px;
          max-width: 100%;
          width: 100%;
        }

        .nc-form-textarea-limited:focus {
          outline: none;
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: white;
        }

        .nc-char-count {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.75rem;
          text-align: right;
        }

        .nc-form-input.error, .nc-form-select.error, .nc-form-textarea-limited.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .nc-validation-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #fca5a5;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .nc-photo-upload-area {
          border: 2px dashed rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nc-photo-upload-area:hover {
          border-color: rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.05);
        }

        .nc-upload-icon {
          font-size: 2rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .nc-upload-placeholder p {
          color: white;
          margin: 0.25rem 0;
        }

        .nc-upload-note {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.75rem;
        }

        .nc-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: 1.5rem;
        }

        .nc-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          text-decoration: none;
        }

        .nc-btn-primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .nc-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        .nc-btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .nc-btn-secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
        }

        .nc-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .nc-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .nc-form-grid {
            grid-template-columns: 1fr;
          }
          
          .nc-form-container {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateNCPanel;