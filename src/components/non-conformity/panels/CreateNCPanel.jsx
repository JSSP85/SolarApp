// src/components/non-conformity/panels/CreateNCPanel.jsx
import React, { useState, useEffect } from 'react';
import { useNonConformity } from '../../../context/NonConformityContext';
import FileUpload from '../../common/FileUpload';
import ValidationMessage from '../../common/ValidationMessage';

const CreateNCPanel = () => {
  const { state, dispatch, helpers } = useNonConformity();
  const { currentNC, validationErrors, isFormValid } = state;
  
  // Local state for form management
  const [showValidation, setShowValidation] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);

  // Auto-generate NC number on component mount
  useEffect(() => {
    if (!currentNC.number) {
      const newNumber = helpers.generateNCNumber();
      dispatch({
        type: 'UPDATE_NC_FIELD',
        payload: { field: 'number', value: newNumber }
      });
    }
  }, [currentNC.number, dispatch, helpers]);

  // Handle field updates
  const handleFieldChange = (field, value) => {
    setIsDirty(true);
    setSavedSuccessfully(false);
    dispatch({
      type: 'UPDATE_NC_FIELD',
      payload: { field, value }
    });
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      dispatch({ type: 'SET_VALIDATION_ERRORS', payload: newErrors });
    }
  };

  // Handle form submission
  const handleSave = async (generatePDF = false) => {
    const validation = helpers.validateNC();
    setShowValidation(true);
    
    if (!validation.isValid) {
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Add metadata
      const ncToSave = {
        ...currentNC,
        createdBy: 'Current User', // Replace with actual user
        createdDate: new Date().toLocaleDateString('en-GB'),
        status: 'open'
      };
      
      // Save NC
      dispatch({
        type: 'SAVE_NC',
        payload: {
          id: Date.now().toString(),
          number: currentNC.number,
          createdDate: ncToSave.createdDate
        }
      });
      
      setSavedSuccessfully(true);
      setIsDirty(false);
      setShowValidation(false);
      
      if (generatePDF) {
        // TODO: Implement PDF generation
        console.log('Generating PDF for NC:', currentNC.number);
      }
      
      // Auto-generate next NC number
      setTimeout(() => {
        const nextNumber = helpers.generateNCNumber();
        dispatch({
          type: 'UPDATE_NC_FIELD',
          payload: { field: 'number', value: nextNumber }
        });
      }, 1000);
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save NC. Please try again.' });
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

  // Pre-defined options based on RNC-564 document
  const priorityOptions = [
    { value: '', label: 'Select priority' },
    { value: 'critical', label: 'CRITICAL' },
    { value: 'major', label: 'MAJOR' },
    { value: 'minor', label: 'MINOR' }
  ];

  const projectOptions = [
    { value: '', label: 'Select project' },
    { value: 'jesi', label: 'JESI (12926)' },
    { value: 'solar_park_a', label: 'SOLAR PARK A (12345)' },
    { value: 'park_b', label: 'PARK B (12678)' },
    { value: 'valencia_project', label: 'VALENCIA PROJECT (12890)' }
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

      <div className="nc-panel-card">
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
          {/* Basic Information Section */}
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
              {/* Project */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Project *</label>
                <select
                  className={`nc-form-select ${validationErrors.project ? 'error' : ''}`}
                  value={currentNC.project}
                  onChange={(e) => handleFieldChange('project', e.target.value)}
                >
                  {projectOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {showValidation && validationErrors.project && (
                  <ValidationMessage message={validationErrors.project} />
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

          {/* Non-Conformity Details Section */}
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

            {/* Description */}
            <div className="nc-form-group">
              <label className="nc-form-label required">Problem Description *</label>
              <textarea
                className={`nc-form-textarea ${validationErrors.description ? 'error' : ''}`}
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

            {/* Affected Component */}
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

          {/* Material Disposition Section */}
          <div className="nc-form-section">
            <h4 className="nc-section-title">⚙️ Material Disposition</h4>
            
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
                className="nc-form-textarea"
                rows="2"
                value={currentNC.containmentAction}
                onChange={(e) => handleFieldChange('containmentAction', e.target.value)}
                placeholder="Describe immediate actions taken to contain the defect..."
              />
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="nc-form-section">
            <h4 className="nc-section-title">📷 Photo Documentation</h4>
            <p className="nc-section-subtitle">
              Upload photos showing the non-conformity. Images help with analysis and resolution.
            </p>
            
            <FileUpload
              onFilesChange={(files) => handleFieldChange('photos', files)}
              acceptedTypes="image/*"
              maxFiles={5}
              maxSizePerFile={5 * 1024 * 1024} // 5MB
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="nc-form-actions">
          <button
            className="nc-btn nc-btn-primary"
            onClick={() => handleSave(false)}
            disabled={!isDirty && !savedSuccessfully}
          >
            <span className="nc-btn-icon">💾</span>
            Save NC
          </button>
          
          <button
            className="nc-btn nc-btn-secondary"
            onClick={() => handleSave(true)}
            disabled={!isDirty && !savedSuccessfully}
          >
            <span className="nc-btn-icon">📄</span>
            Save & Generate PDF
          </button>
          
          <button
            className="nc-btn nc-btn-warning"
            onClick={handleClear}
          >
            <span className="nc-btn-icon">🔄</span>
            Clear Form
          </button>
          
          <button
            className="nc-btn nc-btn-ghost"
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'database' })}
          >
            <span className="nc-btn-icon">🗄️</span>
            View All NCs
          </button>
        </div>

        {/* Form Status Indicator */}
        <div className="nc-form-status">
          {isDirty && (
            <div className="nc-status-item nc-status-unsaved">
              <span className="nc-status-dot"></span>
              Unsaved changes
            </div>
          )}
          {savedSuccessfully && (
            <div className="nc-status-item nc-status-saved">
              <span className="nc-status-dot"></span>
              Saved successfully
            </div>
          )}
          {showValidation && !isFormValid && (
            <div className="nc-status-item nc-status-error">
              <span className="nc-status-dot"></span>
              Please fix validation errors
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateNCPanel;