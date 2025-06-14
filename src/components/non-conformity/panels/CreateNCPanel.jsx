// src/components/non-conformity/panels/CreateNCPanel.jsx
// ✅ COMPONENTE COMPLETO - CON TODAS LAS FUNCIONALIDADES (1500+ LÍNEAS)

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

// Step Progress Component
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
            
            {/* Step Connector Line */}
            {index < steps.length - 1 && (
              <div className={`nc-step-connector ${
                completedSteps.includes(index) ? 'completed' : 'pending'
              }`}></div>
            )}
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

  // Define wizard steps
  const steps = [
    {
      id: 'basic',
      title: 'Basic Information',
      subtitle: 'General NC details and identification',
      requiredFields: ['priority', 'project', 'projectCode', 'date', 'createdBy', 'sector']
    },
    {
      id: 'details',
      title: 'Non-Conformity Details',
      subtitle: 'Problem description and component information',
      requiredFields: ['ncType', 'detectionSource', 'description', 'componentCode', 'quantity']
    },
    {
      id: 'treatment',
      title: 'Treatment / Resolution',
      subtitle: 'Material disposition and containment actions',
      requiredFields: [] // Optional fields
    },
    {
      id: 'corrective',
      title: 'Corrective Action Request',
      subtitle: 'Root cause analysis and corrective measures',
      requiredFields: [] // Optional fields
    },
    {
      id: 'photos',
      title: 'Photo Documentation',
      subtitle: 'Upload supporting images and evidence',
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

  // ✅ NUEVO: Options para Detection Source
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

  // ✅ MODIFICADO: Generate new NC number starting from 565 (formato simplificado)
  useEffect(() => {
    if (!currentNC.number) {
      // Custom NC number generation starting from 565 (sin año)
      const existingNumbers = state.ncList
        .map(nc => nc.number)
        .filter(num => num && num.startsWith('RNC-'))
        .map(num => parseInt(num.split('-')[1]) || 0)
        .filter(num => !isNaN(num));
      
      // ✅ CAMBIO: Formato simplificado RNC-565 (sin año)
      const nextNumber = existingNumbers.length > 0 ? 
        Math.max(...existingNumbers) + 1 : 565;
      
      const newNumber = `RNC-${nextNumber}`;
      
      dispatch({
        type: actions.UPDATE_NC_FIELD,
        payload: { field: 'number', value: newNumber }
      });
    }
  }, [currentNC.number, dispatch, state.ncList, actions]);

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

  // ✅ NUEVA FUNCIÓN: Generar número automáticamente
  const generateNewNumber = () => {
    const existingNumbers = state.ncList
      .map(nc => nc.number)
      .filter(num => num && num.startsWith('RNC-'))
      .map(num => parseInt(num.split('-')[1]) || 0)
      .filter(num => !isNaN(num));
    
    const nextNumber = existingNumbers.length > 0 ? 
      Math.max(...existingNumbers) + 1 : 565;
    
    const newNumber = `RNC-${nextNumber}`;
    handleFieldChange('number', newNumber);
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
          
          processedFiles++;
          if (processedFiles === totalFiles) {
            setUploadingFiles(false);
          }
        } else {
          // Handle image files with compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          const reader = new FileReader();
          reader.onload = (e) => {
            img.onload = () => {
              // Calculate new dimensions (max 1920x1080)
              const maxWidth = 1920;
              const maxHeight = 1080;
              let { width, height } = img;
              
              if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
              }
              
              canvas.width = width;
              canvas.height = height;
              
              // Draw and compress
              ctx.drawImage(img, 0, 0, width, height);
              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
              
              const newPhoto = {
                id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                size: file.size,
                type: 'image',
                uploadDate: new Date().toISOString(),
                url: compressedDataUrl,
                originalSize: file.size,
                compressedSize: Math.round(compressedDataUrl.length * 0.75),
                compressionRatio: Math.round((1 - (compressedDataUrl.length * 0.75) / file.size) * 100)
              };

              const currentPhotos = Array.isArray(currentNC.photos) ? currentNC.photos : [];
              handleFieldChange('photos', [...currentPhotos, newPhoto]);
              
              processedFiles++;
              if (processedFiles === totalFiles) {
                setUploadingFiles(false);
              }
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        processedFiles++;
        if (processedFiles === totalFiles) {
          setUploadingFiles(false);
        }
      }
    }

    // Mostrar mensaje si algunos archivos fueron rechazados
    if (validFiles.length < files.length) {
      alert(`${files.length - validFiles.length} archivo(s) no válido(s). Solo se aceptan imágenes y PDFs menores a 10MB.`);
    }
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
          detectionSource: 'Detection Source', // ✅ NUEVO CAMPO
          description: 'Problem Description',
          componentCode: 'Component Code',
          quantity: 'Quantity'
        };
        errors[field] = `${fieldNames[field]} is required`;
      }
    });

    dispatch({
      type: actions.SET_VALIDATION_ERRORS,
      payload: errors
    });

    return Object.keys(errors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    setShowValidation(true);
    
    if (validateCurrentStep()) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      
      // Move to next step
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        setShowValidation(false);
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowValidation(false);
    }
  };

  // Submit form
  const handleSubmit = async () => {
    // Validate all steps
    let allValid = true;
    for (let i = 0; i < steps.length; i++) {
      const stepData = steps[i];
      const hasErrors = stepData.requiredFields.some(field => !currentNC[field] || currentNC[field] === '');
      if (hasErrors) {
        allValid = false;
        break;
      }
    }

    if (allValid) {
      try {
        setUploadingFiles(true); // Mostrar loading

        // ✅ GUARDAR EN FIREBASE
        const newNCData = {
          ...currentNC,
          number: currentNC.number || helpers.generateNCNumber(),
          createdDate: currentNC.date || new Date().toLocaleDateString('en-GB'),
          status: 'open',
          daysOpen: 0
        };

        // Guardar en Firebase
        const firebaseId = await saveNonConformity(newNCData);
        console.log('NC guardada en Firebase con ID:', firebaseId);

        // También guardar en contexto local para mantener sincronización
        dispatch({
          type: actions.SAVE_NC,
          payload: { ...newNCData, id: firebaseId }
        });

        setSavedSuccessfully(true);
        setCompletedSteps([...Array(steps.length).keys()]); // Mark all steps as completed
        setUploadingFiles(false);
        
        // Mostrar mensaje de éxito con estadísticas
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
            <div className="nc-form-section">
              <h4 className="nc-section-title">🆔 NC Identification</h4>
              
              <div className="nc-form-grid">
                {/* NC Number (Editable para migración) */}
                <div className="nc-form-group">
                  <label className="nc-form-label">NC Number</label>
                  <div className="nc-input-with-button">
                    <input
                      type="text"
                      className="nc-form-input"
                      value={currentNC.number || ''}
                      onChange={(e) => handleFieldChange('number', e.target.value)}
                      placeholder="e.g., RNC-565"
                    />
                    <button
                      type="button"
                      className="nc-generate-btn"
                      onClick={generateNewNumber}
                      title="Generate next available number"
                    >
                      🔄
                    </button>
                  </div>
                  <div className="nc-field-help">
                    Auto-generated or editable for migrating existing NCs
                  </div>
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

                {/* Project */}
                <div className="nc-form-group">
                  <label className="nc-form-label required">Project *</label>
                  <input
                    type="text"
                    className={`nc-form-input ${validationErrors.project ? 'error' : ''}`}
                    value={currentNC.project}
                    onChange={(e) => handleFieldChange('project', e.target.value)}
                    placeholder="e.g., Solar Installation Project"
                  />
                  {showValidation && validationErrors.project && (
                    <ValidationMessage message={validationErrors.project} />
                  )}
                </div>

                {/* Project Code */}
                <div className="nc-form-group">
                  <label className="nc-form-label required">Project Code CM *</label>
                  <input
                    type="text"
                    className={`nc-form-input ${validationErrors.projectCode ? 'error' : ''}`}
                    value={currentNC.projectCode}
                    onChange={(e) => handleFieldChange('projectCode', e.target.value)}
                    placeholder="e.g., CM-2024-001"
                  />
                  {showValidation && validationErrors.projectCode && (
                    <ValidationMessage message={validationErrors.projectCode} />
                  )}
                  <div className="nc-field-help">
                    Enter the official project code assigned by project management.
                  </div>
                </div>

                {/* Date */}
                <div className="nc-form-group">
                  <label className="nc-form-label required">Date *</label>
                  <input
                    type="date"
                    className={`nc-form-input ${validationErrors.date ? 'error' : ''}`}
                    value={currentNC.date}
                    onChange={(e) => handleFieldChange('date', e.target.value)}
                    max={new Date().toISOString().split('T')[0]} // No future dates
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
                    placeholder="e.g., Quality Control, Production, Installation"
                  />
                  {showValidation && validationErrors.sector && (
                    <ValidationMessage message={validationErrors.sector} />
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
          </div>
        );

      case 'details':
        return (
          <div className="nc-step-content">
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

            {/* ✅ NUEVO: Detection Source */}
            <div className="nc-form-group">
              <label className="nc-form-label required">Detection Source *</label>
              <select
                className={`nc-form-select ${validationErrors.detectionSource ? 'error' : ''}`}
                value={currentNC.detectionSource}
                onChange={(e) => handleFieldChange('detectionSource', e.target.value)}
              >
                {detectionSourceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {showValidation && validationErrors.detectionSource && (
                <ValidationMessage message={validationErrors.detectionSource} />
              )}
              <div className="nc-field-help">
                Select where or how this non-conformity was detected.
              </div>
            </div>

            {/* Problem Description */}
            <div className="nc-form-group">
              <label className="nc-form-label required">Problem Description *</label>
              <textarea
                className={`nc-form-textarea-limited ${validationErrors.description ? 'error' : ''}`}
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

            <div className="nc-form-grid">
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

              {/* Component */}
              <div className="nc-form-group">
                <label className="nc-form-label">Component Description</label>
                <input
                  type="text"
                  className="nc-form-input"
                  value={currentNC.component}
                  onChange={(e) => handleFieldChange('component', e.target.value)}
                  placeholder="e.g., L4 LATERAL POST - 155X110X50X4.5MM, 4200MM, S420MC, HDG_100"
                />
              </div>
            </div>
          </div>
        );

      case 'treatment':
        return (
          <div className="nc-step-content">
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

            <div className="nc-form-group">
              <label className="nc-form-label">Containment Action</label>
              <textarea
                className="nc-form-textarea-limited"
                rows="3"
                value={currentNC.containmentAction}
                onChange={(e) => {
                  if (e.target.value.length <= 300) {
                    handleFieldChange('containmentAction', e.target.value);
                  }
                }}
                placeholder="Describe immediate actions taken to contain the defect..."
              />
              <div className="nc-char-count">
                {currentNC.containmentAction ? currentNC.containmentAction.length : 0}/300 characters
              </div>
            </div>
          </div>
        );

      case 'corrective':
        return (
          <div className="nc-step-content">
            <div className="nc-form-group">
              <label className="nc-form-label">Root Cause Analysis Description</label>
              <textarea
                className="nc-form-textarea-limited"
                rows="3"
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

            <div className="nc-form-group">
              <label className="nc-form-label">Corrective Action Plan</label>
              <textarea
                className="nc-form-textarea-limited"
                rows="3"
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

            <div className="nc-form-grid">
              <div className="nc-form-group">
                <label className="nc-form-label">Planned Closure Date</label>
                <input
                  type="date"
                  className="nc-form-input"
                  value={currentNC.plannedClosureDate}
                  onChange={(e) => handleFieldChange('plannedClosureDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]} // No past dates
                />
              </div>

              <div className="nc-form-group">
                <label className="nc-form-label">Assigned To</label>
                <input
                  type="text"
                  className="nc-form-input"
                  value={currentNC.assignedTo}
                  onChange={(e) => handleFieldChange('assignedTo', e.target.value)}
                  placeholder="Person responsible for resolution"
                />
              </div>
            </div>
          </div>
        );

      case 'photos':
        return (
          <div className="nc-step-content">
            <div className="nc-photo-upload-area"
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => e.preventDefault()}
            >
              <div className="nc-upload-content">
                <div className="nc-upload-icon">📸</div>
                <h4>Upload Photos & Documents</h4>
                <p>Drag and drop multiple files here, or click to select</p>
                <div className="nc-upload-specs">
                  <span>📁 Supports: JPG, PNG, GIF, PDF</span>
                  <span>💾 Max size: 10MB per file</span>
                  <span>🗜️ Images auto-compressed to optimize storage</span>
                  <span>📷 Multiple files supported</span>
                </div>
                <input
                  type="file"
                  multiple /* ✅ PERMITIR MÚLTIPLES ARCHIVOS */
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="nc-file-input"
                />
                <button 
                  type="button" 
                  className="nc-upload-btn"
                  onClick={() => document.querySelector('.nc-file-input').click()}
                  disabled={uploadingFiles}
                >
                  {uploadingFiles ? '📤 Uploading...' : '📎 Select Multiple Files'}
                </button>
              </div>
            </div>

            {/* Photo Preview Grid */}
            {Array.isArray(currentNC.photos) && currentNC.photos.length > 0 && (
              <div className="nc-photo-preview-section">
                <h4>📷 Uploaded Files ({currentNC.photos.length})</h4>
                <div className="nc-photo-preview-grid">
                  {currentNC.photos.map((photo) => (
                    <div key={photo.id} className="nc-photo-preview-card">
                      {photo.type === 'pdf' ? (
                        <div className="nc-pdf-preview">
                          <div className="nc-pdf-icon">📄</div>
                          <div className="nc-pdf-info">
                            <div className="nc-file-name">{photo.name}</div>
                            <div className="nc-file-size">{(photo.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                        </div>
                      ) : (
                        <div className="nc-image-preview">
                          <img 
                            src={photo.url} 
                            alt={photo.name}
                            loading="lazy"
                          />
                          <div className="nc-image-overlay">
                            <div className="nc-image-info">
                              <div className="nc-file-name">{photo.name}</div>
                              {photo.compressionRatio && (
                                <div className="nc-compression-info">
                                  📦 Compressed {photo.compressionRatio}%
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      <button 
                        className="nc-remove-photo"
                        onClick={() => removePhoto(photo.id)}
                        title="Remove file"
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  // Main component return
  return (
    <>
      {/* ✅ CSS STYLES OUTSIDE OF MAIN DIV - CON OVERRIDE DE FONDOS */}
      <style>{`
        /* ✅ IMPORTANTE: Override de fondos conflictivos */
        html, body {
          background: transparent !important;
          background-color: transparent !important;
        }
        
        .non-conformity-wrapper {
          background: transparent !important;
          background-color: transparent !important;
        }
        
        .nc-app-container {
          background: transparent !important;
          background-color: transparent !important;
        }
        
        .nc-main-content {
          background: transparent !important;
          background-color: transparent !important;
        }

        .nc-create-panel {
          background: rgba(242, 245, 250, 0.7);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.3);
          margin: 2rem auto;
          max-width: 900px;
          overflow: hidden;
        }

        .nc-success-banner {
          background: linear-gradient(135deg, #10B981, #059669);
          color: white;
          padding: 1rem 2rem;
          margin-bottom: 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
          animation: slideDown 0.3s ease-out;
        }

        .nc-success-icon {
          font-size: 1.25rem;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .nc-step-progress-container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
          color: white;
        }

        .nc-step-progress {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 800px;
          margin: 0 auto;
          position: relative;
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
          0% {
            box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.1);
          }
          100% {
            box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.3);
          }
        }

        .nc-step-label {
          text-align: center;
          font-size: 0.875rem;
          max-width: 120px;
          line-height: 1.3;
        }

        .nc-step-label.completed {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
        }

        .nc-step-label.current {
          color: white;
          font-weight: 600;
        }

        .nc-step-label.pending {
          color: rgba(255, 255, 255, 0.6);
        }

        .nc-step-connector {
          position: absolute;
          top: 25px;
          left: 50%;
          right: -50%;
          height: 2px;
          z-index: 1;
        }

        .nc-step-connector.completed {
          background: #10B981;
        }

        .nc-step-connector.pending {
          background: rgba(255, 255, 255, 0.2);
        }

        .nc-step-item:last-child .nc-step-connector {
          display: none;
        }

        .nc-panel-header {
          padding: 2rem;
          border-bottom: 1px solid rgba(229, 231, 235, 0.6);
          background: rgba(248, 250, 252, 0.5);
          backdrop-filter: blur(5px);
        }

        .nc-panel-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1F2937;
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nc-panel-icon {
          font-size: 1.25rem;
        }

        .nc-panel-subtitle {
          color: #6B7280;
          margin: 0 0 1rem 0;
          font-size: 1rem;
        }

        .nc-step-info {
          background: #E5E7EB;
          color: #374151;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          display: inline-block;
        }

        .nc-form-container {
          padding: 2rem;
        }

        .nc-step-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .nc-form-section {
          margin-bottom: 2rem;
        }

        .nc-section-title {
          color: #374151;
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .nc-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .nc-form-group {
          display: flex;
          flex-direction: column;
        }

        .nc-form-label {
          color: #374151;
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .nc-form-label.required::after {
          content: ' *';
          color: #ef4444;
        }

        .nc-form-input,
        .nc-form-select,
        .nc-form-textarea-limited {
          padding: 0.75rem;
          border: 2px solid rgba(229, 231, 235, 0.8);
          border-radius: 8px;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(5px);
        }

        .nc-form-input:focus,
        .nc-form-select:focus,
        .nc-form-textarea-limited:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .nc-form-input.error,
        .nc-form-select.error,
        .nc-form-textarea-limited.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .nc-form-input.readonly {
          background: rgba(249, 250, 251, 0.7);
          color: #6b7280;
          cursor: not-allowed;
          backdrop-filter: blur(5px);
        }

        .nc-input-with-button {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .nc-input-with-button .nc-form-input {
          flex: 1;
        }

        .nc-generate-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 44px;
          height: 44px;
        }

        .nc-generate-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .nc-generate-btn:active {
          transform: translateY(0);
        }

        .nc-field-help {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .nc-char-count {
          font-size: 0.75rem;
          color: #6b7280;
          text-align: right;
          margin-top: 0.25rem;
        }

        .nc-validation-error {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .nc-validation-icon {
          font-size: 0.875rem;
        }

        /* Photo Upload */
        .nc-photo-upload-area {
          border: 3px dashed rgba(209, 213, 219, 0.8);
          border-radius: 12px;
          padding: 3rem 2rem;
          text-align: center;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(5px);
          margin-bottom: 2rem;
        }

        .nc-photo-upload-area:hover {
          border-color: #667eea;
          background: rgba(248, 250, 255, 0.5);
        }

        .nc-upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .nc-upload-icon {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }

        .nc-upload-specs {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .nc-file-input {
          display: none;
        }

        .nc-upload-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nc-upload-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .nc-upload-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Photo Preview */
        .nc-photo-preview-section {
          margin-top: 2rem;
        }

        .nc-photo-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .nc-photo-preview-card {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .nc-photo-preview-card:hover {
          transform: translateY(-2px);
        }

        .nc-image-preview {
          position: relative;
          height: 150px;
          overflow: hidden;
        }

        .nc-image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .nc-image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          color: white;
          padding: 1rem 0.75rem 0.75rem;
        }

        .nc-image-info {
          font-size: 0.75rem;
        }

        .nc-file-name {
          font-weight: 500;
          margin-bottom: 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nc-compression-info {
          font-size: 0.6rem;
          opacity: 0.8;
        }

        .nc-pdf-preview {
          display: flex;
          align-items: center;
          padding: 1rem;
          background: rgba(248, 250, 252, 0.8);
          backdrop-filter: blur(5px);
          height: 150px;
        }

        .nc-pdf-icon {
          font-size: 3rem;
          margin-right: 1rem;
        }

        .nc-pdf-info {
          flex: 1;
        }

        .nc-file-size {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .nc-remove-photo {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .nc-remove-photo:hover {
          background: #dc2626;
        }

        .nc-wizard-navigation {
          background: rgba(249, 250, 251, 0.5);
          backdrop-filter: blur(5px);
          padding: 2rem;
          border-top: 1px solid rgba(229, 231, 235, 0.6);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nc-step-counter {
          font-size: 0.875rem;
          color: #6B7280;
          font-weight: 500;
        }

        .nc-nav-buttons {
          display: flex;
          gap: 1rem;
        }

        .nc-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nc-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .nc-btn-primary {
          background: #667eea;
          color: white;
        }

        .nc-btn-primary:hover:not(:disabled) {
          background: #5a67d8;
          transform: translateY(-1px);
        }

        .nc-btn-secondary {
          background: #6B7280;
          color: white;
        }

        .nc-btn-secondary:hover:not(:disabled) {
          background: #4B5563;
          transform: translateY(-1px);
        }

        .nc-btn-success {
          background: #10B981;
          color: white;
        }

        .nc-btn-success:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-1px);
        }

        .nc-btn-combo {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .nc-btn-combo:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .nc-btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .nc-create-panel {
            max-width: 95%;
            margin: 1rem auto;
            background: rgba(242, 245, 250, 0.8);
            backdrop-filter: blur(8px);
          }

          .nc-step-progress-container {
            padding: 1rem;
          }

          .nc-step-circle {
            width: 40px;
            height: 40px;
            font-size: 0.9rem;
          }

          .nc-step-label {
            font-size: 0.75rem;
            max-width: 80px;
          }

          .nc-form-container {
            padding: 1.5rem;
          }

          .nc-form-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .nc-photo-preview-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .nc-photo-upload-area {
            padding: 2rem 1rem;
          }

          .nc-upload-icon {
            font-size: 2.5rem;
          }

          .nc-panel-header {
            padding: 1.5rem;
          }

          .nc-panel-title {
            font-size: 1.25rem;
          }

          .nc-wizard-navigation {
            padding: 1rem 1.5rem;
            flex-direction: column;
            gap: 1rem;
          }

          .nc-nav-buttons {
            width: 100%;
            justify-content: space-between;
          }

          .nc-btn {
            flex: 1;
            justify-content: center;
          }

          .nc-input-with-button {
            flex-direction: column;
            gap: 0.75rem;
          }

          .nc-input-with-button .nc-form-input {
            flex: none;
            width: 100%;
          }

          .nc-generate-btn {
            width: 100%;
            min-width: auto;
          }
        }
      `}</style>

      {/* ✅ MAIN COMPONENT DIV - SIN CSS INTERNO */}
      <div className="nc-panel-card nc-create-panel">
        {/* Success Message - SOLO UNA VEZ */}
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
            <span className="nc-panel-icon">{
              steps[currentStep].id === 'basic' ? '➕' : 
              steps[currentStep].id === 'details' ? '🔍' :
              steps[currentStep].id === 'treatment' ? '⚙️' :
              steps[currentStep].id === 'corrective' ? '🔧' : '📸'
            }</span>
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
                  className="nc-btn nc-btn-success"
                  onClick={handleSubmit}
                  disabled={uploadingFiles}
                >
                  {uploadingFiles ? (
                    <>
                      <div className="nc-btn-spinner"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      ✓ Submit NC
                    </>
                  )}
                </button>
                
                {/* Save & Export Button - Solo en último paso */}
                <button 
                  className="nc-btn nc-btn-combo"
                  onClick={async () => {
                    await handleSubmit();
                    if (!uploadingFiles) {
                      setTimeout(() => handleExportPDF(), 1000);
                    }
                  }}
                  disabled={uploadingFiles || exportingPDF}
                  title="Save NC and immediately export to PDF"
                >
                  💾📄 Save & Export
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