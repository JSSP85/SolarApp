// src/components/non-conformity/panels/CreateNCPanel.jsx
// ✅ COMPONENTE COMPLETAMENTE REDISEÑADO - ESTILO DASHBOARD MODERNO CON MODIFICACIONES

import React, { useState, useEffect } from 'react';
import { useNonConformity } from '../../../context/NonConformityContext';
import { saveNonConformity } from '../../../firebase/nonConformityService';
import { exportNCToPDF } from '../../../utils/ncPdfExportService';

// Validation Message Component
const ValidationMessage = ({ message }) => (
  <div className="nc-validation-error">
    <span className="nc-validation-icon">⚠️</span>
    {message}
  </div>
);

// ✅ MODIFICADO: Step Progress Component - SIN líneas conectoras
const StepProgressBar = ({ steps, currentStep, completedSteps }) => {
  return (
    <div className="nc-step-progress-container">
      <div className="nc-step-progress">
        {steps.map((step, index) => (
          <div key={step.id} className="nc-step-item">
            <div className={`nc-step-circle ${
              completedSteps.includes(index) ? 'completed' : 
              currentStep === index ? 'current' : 'pending'
            }`}>
              {completedSteps.includes(index) ? '✓' : index + 1}
            </div>
            <div className={`nc-step-label ${
              completedSteps.includes(index) ? 'completed' : 
              currentStep === index ? 'current' : 'pending'
            }`}>
              {step.title}
            </div>
            
            {/* ✅ REMOVIDO: Step Connector Line - Ya no se muestra la línea */}
          </div>
        ))}
      </div>
    </div>
  );
};

const CreateNCPanel = () => {
  const { state, dispatch, helpers, actions } = useNonConformity();
  const { currentNC, validationErrors, loading } = state;
  
  // Wizard State
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);

  // Local state for photo upload
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  // ✅ NUEVO: Estado para edición manual de número
  const [manualNumberEdit, setManualNumberEdit] = useState(false);

  // Define wizard steps
  const steps = [
    {
      id: 'basic',
      title: 'Basic Information',
      subtitle: 'General NC details and identification',
      icon: '🆔',
      requiredFields: ['priority', 'project', 'projectCode', 'date', 'createdBy', 'sector']
    },
    {
      id: 'details',
      title: 'Non-Conformity Details',
      subtitle: 'Problem description and component information',
      icon: '🔍',
      requiredFields: ['ncType', 'detectionSource', 'description', 'componentCode', 'quantity']
    },
    {
      id: 'treatment',
      title: 'Treatment / Resolution',
      subtitle: 'Material disposition and containment actions',
      icon: '⚙️',
      requiredFields: [] // Optional fields
    },
    {
      id: 'corrective',
      title: 'Corrective Action Request',
      subtitle: 'Root cause analysis and corrective measures',
      icon: '🔧',
      requiredFields: [] // Optional fields
    },
    {
      id: 'photos',
      title: 'Photo Documentation',
      subtitle: 'Upload supporting images and evidence',
      icon: '📸',
      requiredFields: [] // Optional fields
    }
  ];

  // Options for dropdowns
  const priorityOptions = [
    { value: '', label: 'Select priority' },
    { value: 'critical', label: '🚨 Critical' },
    { value: 'major', label: '🔴 Major' },
    { value: 'minor', label: '🟡 Minor' },
    { value: 'low', label: '🟢 Low' }
  ];

  const ncTypeOptions = [
    { value: '', label: 'Select type' },
    { value: 'design_error', label: '📐 Design Error' },
    { value: 'manufacturing_defect', label: '🏭 Manufacturing Defect' },
    { value: 'material_defect', label: '🧱 Material Defect' },
    { value: 'documentation_error', label: '📋 Documentation Error' },
    { value: 'process_deviation', label: '⚙️ Process Deviation' },
    { value: 'supplier_nc', label: '🏢 Supplier Non-Conformity' },
    { value: 'logistics_nc', label: '🚛 Logistics Non-Conformity' },
    { value: 'installation_issue', label: '🔧 Installation Issue' },
    { value: 'quality_control_fail', label: '🎯 Quality Control Failure' },
    { value: 'testing_nc', label: '🧪 Testing Non-Conformity' },
    { value: 'calibration_issue', label: '📏 Calibration Issue' },
    { value: 'training_gap', label: '🎓 Training Gap' },
    { value: 'equipment_malfunction', label: '🔨 Equipment Malfunction' },
    { value: 'environmental_impact', label: '🌍 Environmental Impact' },
    { value: 'safety_concern', label: '⚠️ Safety Concern' },
    { value: 'regulatory_violation', label: '📜 Regulatory Violation' },
    { value: 'customer_complaint', label: '👤 Customer Complaint' },
    { value: 'audit_finding', label: '🔍 Audit Finding' },
    { value: 'corrective_action_ineffective', label: '🔄 Previous Corrective Action Ineffective' },
    { value: 'system_failure', label: '💻 System Failure' },
    { value: 'human_error', label: '👥 Human Error' },
    { value: 'communication_breakdown', label: '📞 Communication Breakdown' },
    { value: 'resource_shortage', label: '📦 Resource Shortage' },
    { value: 'time_constraint', label: '⏰ Time Constraint Issue' },
    { value: 'defective_product', label: '❌ Defective Product' },
    { value: 'other', label: '❓ Other' }
  ];

  const detectionSourceOptions = [
    { value: '', label: 'Select where NC was found' },
    { value: 'production', label: '🏭 Production' },
    { value: 'logistics', label: '🚛 Logistics' },
    { value: 'on_site', label: '🏗️ On Site' },
    { value: 'inspections', label: '🔍 Inspections' },
    { value: 'client_nc', label: '👥 Client NC' },
    { value: 'incoming_inspection', label: '📥 Incoming Inspection' },
    { value: 'final_inspection', label: '✅ Final Inspection' },
    { value: 'customer_complaint', label: '📞 Customer Complaint' },
    { value: 'internal_audit', label: '📋 Internal Audit' },
    { value: 'supplier_audit', label: '🏢 Supplier Audit' }
  ];

  const materialDispositionOptions = [
    { value: '', label: 'Select disposition' },
    { value: 'accept_as_is', label: '✅ Accept as is' },
    { value: 'rework_by_supplier', label: '🔧 Rework by supplier' },
    { value: 'rework_by_convert', label: '🛠️ Rework by Convert' },
    { value: 'reject', label: '❌ Reject' }
  ];

  // ✅ MODIFICADO: Auto-generar número al iniciar (formato RNC-565)
  useEffect(() => {
    if (!currentNC.number && !manualNumberEdit) {
      generateNewNumber();
    }
  }, [currentNC.number, manualNumberEdit, state.ncList]);

  // ✅ MODIFICADO: Generar número automáticamente empezando desde RNC-565
  const generateNewNumber = () => {
    const existingNumbers = state.ncList
      .map(nc => nc.number)
      .filter(num => num && num.startsWith('RNC-'))
      .map(num => parseInt(num.split('-')[1]) || 0)
      .filter(num => !isNaN(num));
    
    // ✅ CAMBIO PRINCIPAL: Comenzar desde 565 en lugar de cualquier número anterior
    const nextNumber = existingNumbers.length > 0 ? 
      Math.max(...existingNumbers, 564) + 1 : 565;
    
    const newNumber = `RNC-${nextNumber}`;
    handleFieldChange('number', newNumber);
  };

  // Handle field changes
  const handleFieldChange = (field, value) => {
    dispatch({
      type: actions.UPDATE_NC_FIELD,
      payload: { field, value }
    });
    setIsDirty(true);
    setSavedSuccessfully(false);

    // Clear validation error for this field
    if (validationErrors[field]) {
      dispatch({
        type: actions.CLEAR_VALIDATION_ERRORS
      });
    }
  };

  // ✅ FUNCIONES PARA MANEJO DE FOTOS
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    handleFileUpload(files);
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileUpload = async (files) => {
    if (files.length === 0) return;

    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    
    const validFiles = files.filter(file => {
      return file.size <= maxFileSize && acceptedTypes.includes(file.type);
    });

    if (validFiles.length === 0) {
      alert('No valid files selected. Please ensure files are images or PDFs under 10MB.');
      return;
    }

    setUploadingFiles(true);
    let processedFiles = 0;
    const totalFiles = validFiles.length;

    for (const file of validFiles) {
      try {
        if (file.type === 'application/pdf') {
          // Handle PDF files
          const newPhoto = {
            id: `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            type: 'pdf',
            uploadDate: new Date().toISOString(),
            url: URL.createObjectURL(file)
          };

          const currentPhotos = Array.isArray(currentNC.photos) ? currentNC.photos : [];
          handleFieldChange('photos', [...currentPhotos, newPhoto]);
        } else {
          // Handle image files with compression
          const compressedImage = await compressImage(file);
          const currentPhotos = Array.isArray(currentNC.photos) ? currentNC.photos : [];
          handleFieldChange('photos', [...currentPhotos, compressedImage]);
        }

        processedFiles++;
        console.log(`Processed ${processedFiles}/${totalFiles} files`);
      } catch (error) {
        console.error('Error processing file:', file.name, error);
      }
    }

    setUploadingFiles(false);
    alert(`✅ Successfully uploaded ${processedFiles} file(s)!`);
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let { width, height } = img;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          const compressionRatio = ((file.size - blob.size) / file.size * 100).toFixed(1);
          
          const compressedPhoto = {
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: blob.size,
            originalSize: file.size,
            type: 'image',
            compressionRatio: parseFloat(compressionRatio),
            uploadDate: new Date().toISOString(),
            url: URL.createObjectURL(blob)
          };

          resolve(compressedPhoto);
        }, 'image/jpeg', 0.8);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
  };

  const removePhoto = (photoId) => {
    const currentPhotos = Array.isArray(currentNC.photos) ? currentNC.photos : [];
    const updatedPhotos = currentPhotos.filter(photo => photo.id !== photoId);
    handleFieldChange('photos', updatedPhotos);
  };

  // ✅ FUNCIÓN DE EXPORT PDF
  const handleExportPDF = async () => {
    if (!currentNC.number || !currentNC.project) {
      alert('Por favor complete al menos el número de NC y proyecto antes de exportar.');
      return;
    }

    try {
      setExportingPDF(true);
      
      await exportNCToPDF(currentNC, {
        includePhotos: true,
        showProgress: true
      });
      
      alert('✅ PDF exportado exitosamente!');
    } catch (error) {
      console.error('Error exportando PDF:', error);
      alert(`❌ Error exportando PDF: ${error.message}`);
    } finally {
      setExportingPDF(false);
    }
  };

  // Handle step click (only if step is completed or current)
  const handleStepClick = (stepIndex) => {
    if (stepIndex === currentStep || completedSteps.includes(stepIndex)) {
      setCurrentStep(stepIndex);
      setShowValidation(false);
    }
  };

  // Validate current step
  const validateCurrentStep = () => {
    const currentStepData = steps[currentStep];
    const errors = {};

    // Check required fields for current step
    currentStepData.requiredFields.forEach(field => {
      if (!currentNC[field] || currentNC[field] === '') {
        const fieldNames = {
          priority: 'Priority',
          project: 'Project',
          projectCode: 'Project Code CM',
          date: 'Date',
          createdBy: 'Inspector Name',
          sector: 'Sector',
          ncType: 'Non-Conformity Type',
          detectionSource: 'Detection Source',
          description: 'Problem Description',
          componentCode: 'Component Code',
          quantity: 'Quantity'
        };
        errors[field] = `${fieldNames[field]} is required`;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Handle next step
  const handleNext = () => {
    const validation = validateCurrentStep();
    
    if (!validation.isValid) {
      setShowValidation(true);
      dispatch({
        type: actions.SET_VALIDATION_ERRORS,
        payload: validation.errors
      });
      alert('Please complete all required fields before proceeding.');
      return;
    }

    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    // Move to next step
    setCurrentStep(currentStep + 1);
    setShowValidation(false);
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setShowValidation(false);
  };

  // Handle final submit
  const handleSubmit = async () => {
    // Validate all required steps
    const allRequiredFields = steps.reduce((acc, step) => [...acc, ...step.requiredFields], []);
    const hasAllRequired = allRequiredFields.every(field => currentNC[field] && currentNC[field] !== '');

    if (hasAllRequired) {
      try {
        setUploadingFiles(true);

        const newNCData = {
          ...currentNC,
          id: `nc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Save to Firebase
        const firebaseId = await saveNonConformity(newNCData);
        
        // Update local state
        dispatch({
          type: actions.ADD_NC,
          payload: { ...newNCData, firebaseId }
        });

        setSavedSuccessfully(true);
        setUploadingFiles(false);
        
        const totalPhotos = Array.isArray(currentNC.photos) ? currentNC.photos.length : 0;
        const compressedPhotos = Array.isArray(currentNC.photos) ? 
          currentNC.photos.filter(p => p.compressionRatio).length : 0;
        
        const successMessage = `
✅ Non-Conformity ${newNCData.number} saved successfully!
📊 ${totalPhotos} photo(s) uploaded
🗜️ ${compressedPhotos} image(s) compressed automatically
💾 Data saved to Firebase with ID: ${firebaseId}
        `;
        
        alert(successMessage);

        // Reset form for new NC after 3 seconds
        setTimeout(() => {
          dispatch({ type: 'RESET_CURRENT_NC' });
          setCurrentStep(0);
          setCompletedSteps([]);
          setSavedSuccessfully(false);
          setShowValidation(false);
          setManualNumberEdit(false);
        }, 3000);

      } catch (error) {
        console.error('Error saving NC:', error);
        alert(`❌ Error saving NC: ${error.message}`);
        setUploadingFiles(false);
      }
    } else {
      alert('❌ Please complete all required fields before submitting.');
    }
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'basic':
        return (
          <div className="nc-step-content">
            {/* Header especial para NC Number y Priority */}
            <div className="nc-form-grid-header">
              {/* NC Number (Auto-generated con opción manual) */}
              <div className="nc-form-group">
                <label className="nc-form-label">NC Number</label>
                <div className="nc-input-with-button">
                  <input
                    type="text"
                    className={`nc-form-input ${manualNumberEdit ? '' : 'readonly'}`}
                    value={currentNC.number || ''}
                    onChange={(e) => manualNumberEdit && handleFieldChange('number', e.target.value)}
                    placeholder="e.g., RNC-565"
                    readOnly={!manualNumberEdit}
                  />
                  <button
                    type="button"
                    className={`nc-edit-btn ${manualNumberEdit ? 'active' : ''}`}
                    onClick={() => setManualNumberEdit(!manualNumberEdit)}
                    title={manualNumberEdit ? 'Lock automatic numbering' : 'Enable manual editing'}
                  >
                    {manualNumberEdit ? '🔒' : '✏️'}
                  </button>
                  {!manualNumberEdit && (
                    <button
                      type="button"
                      className="nc-generate-btn"
                      onClick={generateNewNumber}
                      title="Generate next available number"
                    >
                      🔄
                    </button>
                  )}
                </div>
                <div className="nc-field-help">
                  {manualNumberEdit ? 
                    'Manual mode: Enter custom NC number' : 
                    'Auto mode: Next number assigned automatically starting from RNC-565'
                  }
                </div>
              </div>

              {/* Priority */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Priority Level *</label>
                <select
                  className={`nc-form-select ${validationErrors.priority ? 'error' : ''}`}
                  value={currentNC.priority}
                  onChange={(e) => handleFieldChange('priority', e.target.value)}
                >
                  {priorityOptions.map((option) => (
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

            {/* Grid principal con el resto de campos */}
            <div className="nc-form-grid">
              {/* Project Name */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Project Name *</label>
                <input
                  type="text"
                  className={`nc-form-input ${validationErrors.project ? 'error' : ''}`}
                  value={currentNC.project}
                  onChange={(e) => handleFieldChange('project', e.target.value)}
                  placeholder="e.g., Amazon Warehouse MAD4"
                />
                {showValidation && validationErrors.project && (
                  <ValidationMessage message={validationErrors.project} />
                )}
              </div>

              {/* Project Code CM */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Project Code CM *</label>
                <input
                  type="text"
                  className={`nc-form-input ${validationErrors.projectCode ? 'error' : ''}`}
                  value={currentNC.projectCode}
                  onChange={(e) => handleFieldChange('projectCode', e.target.value)}
                  placeholder="e.g., 24AM101"
                />
                {showValidation && validationErrors.projectCode && (
                  <ValidationMessage message={validationErrors.projectCode} />
                )}
              </div>

              {/* Date */}
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

              {/* Inspector Name */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Inspector Name *</label>
                <input
                  type="text"
                  className={`nc-form-input ${validationErrors.createdBy ? 'error' : ''}`}
                  value={currentNC.createdBy}
                  onChange={(e) => handleFieldChange('createdBy', e.target.value)}
                  placeholder="e.g., John Smith"
                />
                {showValidation && validationErrors.createdBy && (
                  <ValidationMessage message={validationErrors.createdBy} />
                )}
              </div>

              {/* Sector */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Sector *</label>
                <input
                  type="text"
                  className={`nc-form-input ${validationErrors.sector ? 'error' : ''}`}
                  value={currentNC.sector}
                  onChange={(e) => handleFieldChange('sector', e.target.value)}
                  placeholder="e.g., Production"
                />
                {showValidation && validationErrors.sector && (
                  <ValidationMessage message={validationErrors.sector} />
                )}
              </div>

              {/* Supplier (optional) */}
              <div className="nc-form-group">
                <label className="nc-form-label">Supplier</label>
                <input
                  type="text"
                  className="nc-form-input"
                  value={currentNC.supplier}
                  onChange={(e) => handleFieldChange('supplier', e.target.value)}
                  placeholder="e.g., Steel Works Inc."
                />
              </div>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="nc-step-content">
            <div className="nc-form-grid">
              {/* NC Type */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Non-Conformity Type *</label>
                <select
                  className={`nc-form-select ${validationErrors.ncType ? 'error' : ''}`}
                  value={currentNC.ncType}
                  onChange={(e) => handleFieldChange('ncType', e.target.value)}
                >
                  {ncTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {showValidation && validationErrors.ncType && (
                  <ValidationMessage message={validationErrors.ncType} />
                )}
              </div>

              {/* Detection Source */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Detection Source *</label>
                <select
                  className={`nc-form-select ${validationErrors.detectionSource ? 'error' : ''}`}
                  value={currentNC.detectionSource}
                  onChange={(e) => handleFieldChange('detectionSource', e.target.value)}
                >
                  {detectionSourceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {showValidation && validationErrors.detectionSource && (
                  <ValidationMessage message={validationErrors.detectionSource} />
                )}
              </div>

              {/* Component Code */}
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

              {/* Quantity */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Quantity *</label>
                <input
                  type="number"
                  className={`nc-form-input ${validationErrors.quantity ? 'error' : ''}`}
                  value={currentNC.quantity}
                  onChange={(e) => handleFieldChange('quantity', e.target.value)}
                  placeholder="e.g., 232"
                  min="1"
                />
                {showValidation && validationErrors.quantity && (
                  <ValidationMessage message={validationErrors.quantity} />
                )}
              </div>

              {/* Component Description - Span full width */}
              <div className="nc-form-group nc-form-group-full">
                <label className="nc-form-label">Component Description</label>
                <input
                  type="text"
                  className="nc-form-input"
                  value={currentNC.component}
                  onChange={(e) => handleFieldChange('component', e.target.value)}
                  placeholder="e.g., L4 LATERAL POST - 155X110X50X4.5MM, 4200MM, S420MC, HDG_100"
                />
              </div>

              {/* Problem Description - Span full width */}
              <div className="nc-form-group nc-form-group-full">
                <label className="nc-form-label required">Problem Description *</label>
                <textarea
                  className={`nc-form-textarea ${validationErrors.description ? 'error' : ''}`}
                  rows="4"
                  value={currentNC.description}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      handleFieldChange('description', e.target.value);
                    }
                  }}
                  placeholder="Describe the non-conformity in detail..."
                />
                <div className="nc-char-count">
                  {currentNC.description ? currentNC.description.length : 0}/500 characters
                </div>
                {showValidation && validationErrors.description && (
                  <ValidationMessage message={validationErrors.description} />
                )}
              </div>
            </div>
          </div>
        );

      case 'treatment':
        return (
          <div className="nc-step-content">
            <div className="nc-form-grid">
              {/* Material Disposition */}
              <div className="nc-form-group">
                <label className="nc-form-label">Material Disposition</label>
                <select
                  className="nc-form-select"
                  value={currentNC.materialDisposition}
                  onChange={(e) => handleFieldChange('materialDisposition', e.target.value)}
                >
                  {materialDispositionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Responsible Person */}
              <div className="nc-form-group">
                <label className="nc-form-label">Responsible for Treatment</label>
                <input
                  type="text"
                  className="nc-form-input"
                  value={currentNC.responsiblePerson}
                  onChange={(e) => handleFieldChange('responsiblePerson', e.target.value)}
                  placeholder="e.g., Quality Manager"
                />
              </div>

              {/* Containment Action - Full width */}
              <div className="nc-form-group nc-form-group-full">
                <label className="nc-form-label">Immediate Containment Action</label>
                <textarea
                  className="nc-form-textarea"
                  rows="3"
                  value={currentNC.containmentAction}
                  onChange={(e) => {
                    if (e.target.value.length <= 300) {
                      handleFieldChange('containmentAction', e.target.value);
                    }
                  }}
                  placeholder="Describe immediate actions taken to contain the non-conformity..."
                />
                <div className="nc-char-count">
                  {currentNC.containmentAction ? currentNC.containmentAction.length : 0}/300 characters
                </div>
              </div>
            </div>
          </div>
        );

      case 'corrective':
        return (
          <div className="nc-step-content">
            <div className="nc-form-grid">
              {/* Root Cause Analysis - Full width */}
              <div className="nc-form-group nc-form-group-full">
                <label className="nc-form-label">Root Cause Analysis Description</label>
                <textarea
                  className="nc-form-textarea"
                  rows="4"
                  value={currentNC.rootCauseAnalysis}
                  onChange={(e) => {
                    if (e.target.value.length <= 400) {
                      handleFieldChange('rootCauseAnalysis', e.target.value);
                    }
                  }}
                  placeholder="Analyze and describe the root cause of this non-conformity..."
                />
                <div className="nc-char-count">
                  {currentNC.rootCauseAnalysis ? currentNC.rootCauseAnalysis.length : 0}/400 characters
                </div>
              </div>

              {/* Corrective Action Plan - Full width */}
              <div className="nc-form-group nc-form-group-full">
                <label className="nc-form-label">Corrective Action Plan</label>
                <textarea
                  className="nc-form-textarea"
                  rows="4"
                  value={currentNC.correctiveAction}
                  onChange={(e) => {
                    if (e.target.value.length <= 400) {
                      handleFieldChange('correctiveAction', e.target.value);
                    }
                  }}
                  placeholder="Define specific corrective actions to prevent recurrence..."
                />
                <div className="nc-char-count">
                  {currentNC.correctiveAction ? currentNC.correctiveAction.length : 0}/400 characters
                </div>
              </div>

              {/* Target Date and Follow-up */}
              <div className="nc-form-group">
                <label className="nc-form-label">Target Completion Date</label>
                <input
                  type="date"
                  className="nc-form-input"
                  value={currentNC.targetDate}
                  onChange={(e) => handleFieldChange('targetDate', e.target.value)}
                />
              </div>

              <div className="nc-form-group">
                <label className="nc-form-label">Follow-up Responsible</label>
                <input
                  type="text"
                  className="nc-form-input"
                  value={currentNC.followUpResponsible}
                  onChange={(e) => handleFieldChange('followUpResponsible', e.target.value)}
                  placeholder="e.g., Process Engineer"
                />
              </div>
            </div>
          </div>
        );

      case 'photos':
        return (
          <div className="nc-step-content">
            <div className="nc-form-section">
              <h4 className="nc-section-title">Photo Documentation</h4>
              
              {/* Upload area */}
              <div 
                className="nc-photo-upload-area"
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="nc-upload-content">
                  <span className="nc-upload-icon">📸</span>
                  <p className="nc-upload-text">
                    Drag and drop images/PDFs here, or 
                    <label className="nc-file-label">
                      browse files
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                        className="nc-file-input"
                      />
                    </label>
                  </p>
                  <p className="nc-upload-hint">
                    Supports: JPG, PNG, GIF, PDF (max 10MB each)
                  </p>
                </div>
              </div>

              {/* Photo gallery */}
              {currentNC.photos && currentNC.photos.length > 0 && (
                <div className="nc-photo-gallery">
                  <h5 className="nc-gallery-title">Uploaded Files ({currentNC.photos.length})</h5>
                  <div className="nc-photo-grid">
                    {currentNC.photos.map((photo) => (
                      <div key={photo.id} className="nc-photo-item">
                        <div className="nc-photo-preview">
                          {photo.type === 'pdf' ? (
                            <div className="nc-pdf-preview">
                              <span className="nc-pdf-icon">📄</span>
                              <span className="nc-pdf-name">{photo.name}</span>
                            </div>
                          ) : (
                            <img src={photo.url} alt={photo.name} className="nc-photo-image" />
                          )}
                        </div>
                        <div className="nc-photo-info">
                          <div className="nc-photo-name">{photo.name}</div>
                          <div className="nc-photo-details">
                            {(photo.size / (1024 * 1024)).toFixed(2)} MB
                            {photo.compressionRatio && (
                              <span className="nc-compression-info">
                                (Compressed {photo.compressionRatio}%)
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="nc-photo-remove"
                          onClick={() => removePhoto(photo.id)}
                          title="Remove file"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadingFiles && (
                <div className="nc-upload-progress">
                  <span className="nc-upload-spinner">⏳</span>
                  Processing files...
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <>
      <style jsx>{`
        /* ✅ ESTILOS GENERALES CON MEJORAS VISUALES */
        .nc-create-panel {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
          border: none !important;
          border-radius: 20px !important;
          overflow: hidden !important;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.1),
            0 8px 32px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.5) !important;
        }

        /* ✅ MODIFICADO: Color más claro para la tarjeta principal */
        .nc-panel-card {
          background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%) !important;
          border: 1px solid rgba(203, 213, 225, 0.3) !important;
          border-radius: 16px !important;
          box-shadow: 
            0 10px 25px rgba(0, 0, 0, 0.08),
            0 4px 16px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
        }

        /* Success Banner */
        .nc-success-banner {
          background: linear-gradient(135deg, #10B981, #059669);
          color: white;
          padding: 1rem 2rem;
          margin: 1rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
          animation: slideDown 0.3s ease-out;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .nc-success-icon {
          font-size: 1.25rem;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Progress Bar estilo Dashboard */
        .nc-step-progress-container {
          background: linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #be185d 100%);
          padding: 2rem;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .nc-step-progress-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          100% { left: 100%; }
        }

        .nc-step-progress {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .nc-step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          flex: 1;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .nc-step-item:hover {
          transform: translateY(-2px);
        }

        .nc-step-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1rem;
          margin-bottom: 0.5rem;
          transition: all 0.3s ease;
          z-index: 2;
          position: relative;
        }

        .nc-step-circle.completed {
          background: #10B981;
          color: white;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
        }

        .nc-step-circle.current {
          background: white;
          color: #667eea;
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.3);
          animation: pulse 2s infinite;
        }

        .nc-step-circle.pending {
          background: rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.7);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.3); }
          50% { box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.1); }
        }

        .nc-step-label {
          text-align: center;
          font-size: 0.875rem;
          max-width: 120px;
          line-height: 1.3;
          font-weight: 500;
        }

        .nc-step-label.completed { color: rgba(255, 255, 255, 0.9); }
        .nc-step-label.current { color: white; font-weight: 600; }
        .nc-step-label.pending { color: rgba(255, 255, 255, 0.6); }

        /* ✅ REMOVIDO: Las líneas conectoras ya no se muestran */
        .nc-step-connector {
          display: none !important;
        }

        /* Panel Header - OCULTO para ahorrar espacio */
        .nc-panel-header {
          display: none !important;
        }

        /* Form Container - LAYOUT PROFESIONAL */
        .nc-form-container {
          padding: 2rem 3rem !important;
        }

        .nc-step-content {
          max-width: 100% !important;
          margin: 0 auto !important;
        }

        .nc-form-section {
          margin-bottom: 2rem !important;
        }

        /* Grid mejorado - 2 columnas balanceadas */
        .nc-form-grid {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 2rem 3rem !important;
          margin-bottom: 2rem !important;
          align-items: start !important;
        }

        /* Campos que ocupan toda la línea */
        .nc-form-group-full {
          grid-column: 1 / -1 !important;
        }

        /* Grupo especial para NC Number + Priority */
        .nc-form-grid-header {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 2rem 3rem !important;
          margin-bottom: 2.5rem !important;
          padding: 1.5rem !important;
          background: rgba(255, 255, 255, 0.05) !important;
          border-radius: 12px !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        /* Form Groups and Inputs */
        .nc-form-group {
          display: flex !important;
          flex-direction: column !important;
          gap: 0.5rem !important;
        }

        .nc-form-label {
          font-weight: 600 !important;
          color: #374151 !important;
          font-size: 0.875rem !important;
          margin-bottom: 0.25rem !important;
        }

        .nc-form-label.required::after {
          content: ' *' !important;
          color: #ef4444 !important;
        }

        .nc-form-input,
        .nc-form-select,
        .nc-form-textarea {
          width: 100% !important;
          padding: 0.75rem 1rem !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 8px !important;
          font-size: 0.875rem !important;
          transition: all 0.2s ease !important;
          background: white !important;
        }

        .nc-form-input:focus,
        .nc-form-select:focus,
        .nc-form-textarea:focus {
          outline: none !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        .nc-form-input.error,
        .nc-form-select.error,
        .nc-form-textarea.error {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }

        .nc-form-input.readonly {
          background: #f9fafb !important;
          color: #6b7280 !important;
        }

        /* Validation Error Messages */
        .nc-validation-error {
          display: flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
          color: #ef4444 !important;
          font-size: 0.75rem !important;
          margin-top: 0.25rem !important;
        }

        .nc-validation-icon {
          font-size: 0.875rem !important;
        }

        /* Input with button layout */
        .nc-input-with-button {
          display: flex !important;
          gap: 0.5rem !important;
          align-items: flex-end !important;
        }

        .nc-input-with-button .nc-form-input {
          flex: 1 !important;
        }

        .nc-edit-btn,
        .nc-generate-btn {
          padding: 0.75rem !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 8px !important;
          background: white !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          font-size: 1rem !important;
          min-width: 40px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .nc-edit-btn:hover,
        .nc-generate-btn:hover {
          border-color: #3b82f6 !important;
          background: #eff6ff !important;
        }

        .nc-edit-btn.active {
          background: #3b82f6 !important;
          color: white !important;
          border-color: #3b82f6 !important;
        }

        /* Field Help Text */
        .nc-field-help {
          font-size: 0.75rem !important;
          color: #6b7280 !important;
          margin-top: 0.25rem !important;
        }

        /* Character Count */
        .nc-char-count {
          font-size: 0.75rem !important;
          color: #9ca3af !important;
          text-align: right !important;
          margin-top: 0.25rem !important;
        }

        /* Section Titles */
        .nc-section-title {
          font-size: 1.125rem !important;
          font-weight: 600 !important;
          color: #374151 !important;
          margin-bottom: 1rem !important;
          padding-bottom: 0.5rem !important;
          border-bottom: 2px solid #e5e7eb !important;
        }

        /* Photo Upload Area */
        .nc-photo-upload-area {
          border: 2px dashed #d1d5db !important;
          border-radius: 12px !important;
          padding: 2rem !important;
          text-align: center !important;
          transition: all 0.2s ease !important;
          background: #fafafa !important;
          margin-bottom: 2rem !important;
        }

        .nc-photo-upload-area:hover,
        .nc-photo-upload-area.drag-over {
          border-color: #3b82f6 !important;
          background: #eff6ff !important;
        }

        .nc-upload-content {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          gap: 1rem !important;
        }

        .nc-upload-icon {
          font-size: 3rem !important;
        }

        .nc-upload-text {
          font-size: 1rem !important;
          color: #374151 !important;
          margin: 0 !important;
        }

        .nc-file-label {
          color: #3b82f6 !important;
          cursor: pointer !important;
          text-decoration: underline !important;
          margin-left: 0.25rem !important;
        }

        .nc-file-input {
          display: none !important;
        }

        .nc-upload-hint {
          font-size: 0.875rem !important;
          color: #6b7280 !important;
          margin: 0 !important;
        }

        /* Photo Gallery */
        .nc-photo-gallery {
          margin-top: 2rem !important;
        }

        .nc-gallery-title {
          font-size: 1rem !important;
          font-weight: 600 !important;
          color: #374151 !important;
          margin-bottom: 1rem !important;
        }

        .nc-photo-grid {
          display: grid !important;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important;
          gap: 1rem !important;
        }

        .nc-photo-item {
          border: 1px solid #e5e7eb !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          background: white !important;
          position: relative !important;
        }

        .nc-photo-preview {
          width: 100% !important;
          height: 150px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: #f9fafb !important;
        }

        .nc-photo-image {
          max-width: 100% !important;
          max-height: 100% !important;
          object-fit: cover !important;
        }

        .nc-pdf-preview {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          gap: 0.5rem !important;
          color: #6b7280 !important;
        }

        .nc-pdf-icon {
          font-size: 2rem !important;
        }

        .nc-pdf-name {
          font-size: 0.75rem !important;
          text-align: center !important;
        }

        .nc-photo-info {
          padding: 0.75rem !important;
        }

        .nc-photo-name {
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          color: #374151 !important;
          margin-bottom: 0.25rem !important;
          word-break: break-word !important;
        }

        .nc-photo-details {
          font-size: 0.75rem !important;
          color: #6b7280 !important;
        }

        .nc-compression-info {
          color: #059669 !important;
          font-weight: 500 !important;
        }

        .nc-photo-remove {
          position: absolute !important;
          top: 0.5rem !important;
          right: 0.5rem !important;
          width: 24px !important;
          height: 24px !important;
          border-radius: 50% !important;
          background: rgba(239, 68, 68, 0.9) !important;
          color: white !important;
          border: none !important;
          cursor: pointer !important;
          font-size: 0.75rem !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s ease !important;
        }

        .nc-photo-remove:hover {
          background: #ef4444 !important;
          transform: scale(1.1) !important;
        }

        /* Upload Progress */
        .nc-upload-progress {
          display: flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
          justify-content: center !important;
          padding: 1rem !important;
          background: #eff6ff !important;
          border-radius: 8px !important;
          color: #3b82f6 !important;
          font-weight: 500 !important;
        }

        .nc-upload-spinner {
          font-size: 1.25rem !important;
          animation: spin 1s linear infinite !important;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        /* Navigation Buttons */
        .nc-wizard-navigation {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          padding: 2rem 3rem !important;
          background: rgba(249, 250, 251, 0.8) !important;
          border-top: 1px solid #e5e7eb !important;
        }

        .nc-step-counter {
          font-size: 0.875rem !important;
          color: #6b7280 !important;
          font-weight: 500 !important;
        }

        .nc-nav-buttons {
          display: flex !important;
          gap: 1rem !important;
        }

        .nc-btn {
          padding: 0.75rem 1.5rem !important;
          border-radius: 8px !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          border: none !important;
          font-size: 0.875rem !important;
          display: flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
        }

        .nc-btn-primary {
          background: #3b82f6 !important;
          color: white !important;
        }

        .nc-btn-primary:hover:not(:disabled) {
          background: #2563eb !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
        }

        .nc-btn-secondary {
          background: #6b7280 !important;
          color: white !important;
        }

        .nc-btn-secondary:hover:not(:disabled) {
          background: #4b5563 !important;
        }

        .nc-btn-success {
          background: #10b981 !important;
          color: white !important;
        }

        .nc-btn-success:hover:not(:disabled) {
          background: #059669 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
        }

        .nc-btn:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
        }

        /* Export Button */
        .nc-export-btn {
          background: #8b5cf6 !important;
          color: white !important;
        }

        .nc-export-btn:hover:not(:disabled) {
          background: #7c3aed !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3) !important;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .nc-form-grid,
          .nc-form-grid-header {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }

          .nc-wizard-navigation {
            flex-direction: column !important;
            gap: 1rem !important;
            align-items: stretch !important;
          }

          .nc-nav-buttons {
            justify-content: space-between !important;
          }

          .nc-btn {
            flex: 1 !important;
            justify-content: center !important;
          }

          .nc-input-with-button {
            flex-direction: column !important;
            gap: 0.75rem !important;
            align-items: stretch !important;
          }

          .nc-input-with-button .nc-form-input {
            flex: none !important;
            width: 100% !important;
          }

          .nc-edit-btn,
          .nc-generate-btn {
            width: 100% !important;
            min-width: auto !important;
            justify-content: center !important;
          }
        }

        @media (max-width: 480px) {
          .nc-form-container {
            padding: 1rem !important;
          }
          
          .nc-form-grid,
          .nc-form-grid-header {
            gap: 1rem !important;
          }
        }
      `}</style>

      {/* ✅ MAIN COMPONENT DIV - DISEÑO DASHBOARD MODERNO */}
      <div className="nc-panel-card nc-create-panel">
        {/* Success Message */}
        {savedSuccessfully && (
          <div className="nc-success-banner">
            <span className="nc-success-icon">✅</span>
            <span>Non-Conformity {currentNC.number} has been created successfully!</span>
          </div>
        )}

        {/* Step Progress Bar */}
        <StepProgressBar 
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />

        {/* Panel Header */}
        <div className="nc-panel-header">
          <h3 className="nc-panel-title">
            <span className="nc-panel-icon">{steps[currentStep].icon}</span>
            {steps[currentStep].title}
          </h3>
          <p className="nc-panel-subtitle">
            {steps[currentStep].subtitle}
          </p>
          <div className="nc-step-info">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Form Content */}
        <div className="nc-form-container">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="nc-wizard-navigation">
          <div className="nc-step-counter">
            Step {currentStep + 1} of {steps.length}
          </div>
          
          <div className="nc-nav-buttons">
            <button 
              className="nc-btn nc-btn-secondary"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              ← Previous
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button 
                className="nc-btn nc-btn-primary"
                onClick={handleNext}
              >
                Next →
              </button>
            ) : (
              <>
                <button
                  className="nc-btn nc-export-btn"
                  onClick={handleExportPDF}
                  disabled={exportingPDF}
                >
                  {exportingPDF ? '📄 Exporting...' : '📄 Export PDF'}
                </button>
                
                <button 
                  className="nc-btn nc-btn-success"
                  onClick={handleSubmit}
                  disabled={uploadingFiles}
                >
                  {uploadingFiles ? '💾 Saving...' : '💾 Create NC'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateNCPanel;