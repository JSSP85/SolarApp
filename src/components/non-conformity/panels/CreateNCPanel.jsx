// src/components/non-conformity/panels/CreateNCPanel.jsx
// ✅ COMPONENTE COMPLETAMENTE CORREGIDO Y MEJORADO

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

// ✅ MODIFICADO: Step Progress Component - Nuevos colores profesionales
const StepProgressBar = ({ steps, currentStep, completedSteps, handleStepClick }) => {
  return (
    <div className="nc-step-progress-container">
      <div className="nc-step-progress">
        {steps.map((step, index) => (
          <div key={step.id} className="nc-step-item">
            <div 
              className={`nc-step-circle ${
                completedSteps.includes(index) ? 'completed' : 
                currentStep === index ? 'current' : 'pending'
              }`}
              onClick={() => handleStepClick(index)}
            >
              {completedSteps.includes(index) ? '✓' : index + 1}
            </div>
            <div className={`nc-step-label ${
              completedSteps.includes(index) ? 'completed' : 
              currentStep === index ? 'current' : 'pending'
            }`}>
              {step.title}
            </div>
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
      requiredFields: []
    },
    {
      id: 'corrective',
      title: 'Corrective Action Request',
      subtitle: 'Root cause analysis and corrective measures',
      icon: '🔧',
      requiredFields: []
    },
    {
      id: 'photos',
      title: 'Photo Documentation',
      subtitle: 'Upload supporting images and evidence',
      icon: '📸',
      requiredFields: []
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

  // ✅ CORREGIDO: Auto-generar número al iniciar
  useEffect(() => {
    if (!currentNC.number && !manualNumberEdit) {
      generateNewNumber();
    }
  }, [currentNC.number, manualNumberEdit, state.ncList]);

  // ✅ CORREGIDO: Generar número secuencial correctamente
  const generateNewNumber = () => {
    const existingNumbers = state.ncList
      .map(nc => nc.number)
      .filter(num => num && num.startsWith('RNC-'))
      .map(num => parseInt(num.split('-')[1]) || 0)
      .filter(num => !isNaN(num));
    
    // ✅ CORREGIDO: Comenzar desde 565 y continuar secuencialmente
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

  // ✅ FUNCIONES PARA MANEJO DE FOTOS MEJORADAS
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    handleFileUpload(files);
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
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
    const currentPhotos = Array.isArray(currentNC.photos) ? currentNC.photos : [];
    const newPhotos = [...currentPhotos];

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

          newPhotos.push(newPhoto);
        } else {
          // Handle image files with compression
          const compressedImage = await compressImage(file);
          newPhotos.push(compressedImage);
        }

        processedFiles++;
        console.log(`Processed ${processedFiles}/${totalFiles} files`);
      } catch (error) {
        console.error('Error processing file:', file.name, error);
      }
    }

    // ✅ CORREGIDO: Actualizar todas las fotos de una vez
    handleFieldChange('photos', newPhotos);
    setUploadingFiles(false);
    alert(`✅ Successfully uploaded ${processedFiles} file(s)! Total photos: ${newPhotos.length}`);
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

// ✅ FUNCIÓN ACTUALIZADA CON SINCRONIZACIÓN - REEMPLAZAR SOLO ESTA FUNCIÓN
const handleSaveAndExport = async () => {
  // Validar campos requeridos
  const allRequiredFields = steps.reduce((acc, step) => [...acc, ...step.requiredFields], []);
  const hasAllRequired = allRequiredFields.every(field => currentNC[field] && currentNC[field] !== '');

  if (!hasAllRequired) {
    alert('❌ Please complete all required fields before submitting.');
    return;
  }

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
    
    // ✅ SOLUCIÓN CLAVE: Refrescar lista desde Firebase DESPUÉS de guardar
    console.log('🔄 Refreshing NC list from Firebase...');
    await helpers.refreshFromFirebase();
    
    // Actualizar estado local
    dispatch({
      type: actions.ADD_NC,
      payload: { ...newNCData, firebaseId }
    });

    setSavedSuccessfully(true);
    
    const totalPhotos = Array.isArray(currentNC.photos) ? currentNC.photos.length : 0;
    const compressedPhotos = Array.isArray(currentNC.photos) ? 
      currentNC.photos.filter(p => p.compressionRatio).length : 0;
    
    alert(`✅ Non-Conformity ${newNCData.number} saved successfully! 📊 ${totalPhotos} photo(s) uploaded`);

    // Exportar PDF después de guardar
    setTimeout(async () => {
      try {
        setExportingPDF(true);
        await exportNCToPDF(newNCData, {
          includePhotos: true,
          showProgress: true
        });
        alert('✅ PDF exported successfully!');
      } catch (error) {
        console.error('Error exporting PDF:', error);
        alert(`❌ Error exporting PDF: ${error.message}`);
      } finally {
        setExportingPDF(false);
      }
    }, 1000);

    // Reset form for new NC after 3 seconds
    setTimeout(() => {
      dispatch({ type: actions.RESET_CURRENT_NC });
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

  // Render step content
  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'basic':
        return (
          <div className="nc-step-content">
            <div className="nc-form-grid-improved">
              {/* NC Number */}
              <div className="nc-form-group-improved">
                <label className="nc-form-label-improved required">NC Number *</label>
                <div className="nc-input-with-button">
                  <input
                    type="text"
                    className="nc-form-input-improved"
                    value={currentNC.number}
                    onChange={(e) => handleFieldChange('number', e.target.value)}
                    onFocus={() => setManualNumberEdit(true)}
                    placeholder="RNC-xxx"
                  />
                  <button
                    type="button"
                    className="nc-generate-btn"
                    onClick={generateNewNumber}
                    title="Generate new number"
                  >
                    🔄
                  </button>
                </div>
              </div>

              {/* Priority */}
              <div className="nc-form-group-improved">
                <label className="nc-form-label-improved required">Priority *</label>
                <select
                  className={`nc-form-select-improved ${validationErrors.priority ? 'error' : ''}`}
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

              {/* Project */}
              <div className="nc-form-group-improved">
                <label className="nc-form-label-improved required">Project *</label>
                <input
                  type="text"
                  className={`nc-form-input-improved ${validationErrors.project ? 'error' : ''}`}
                  value={currentNC.project}
                  onChange={(e) => handleFieldChange('project', e.target.value)}
                  placeholder="e.g., Solar Farm Phase 2"
                />
                {showValidation && validationErrors.project && (
                  <ValidationMessage message={validationErrors.project} />
                )}
              </div>

              {/* Project Code */}
              <div className="nc-form-group-improved">
                <label className="nc-form-label-improved required">Project Code CM *</label>
                <input
                  type="text"
                  className={`nc-form-input-improved ${validationErrors.projectCode ? 'error' : ''}`}
                  value={currentNC.projectCode}
                  onChange={(e) => handleFieldChange('projectCode', e.target.value)}
                  placeholder="e.g., CM-2024-001"
                />
                {showValidation && validationErrors.projectCode && (
                  <ValidationMessage message={validationErrors.projectCode} />
                )}
              </div>

              {/* Date */}
              <div className="nc-form-group-improved">
                <label className="nc-form-label-improved required">Date *</label>
                <input
                  type="date"
                  className={`nc-form-input-improved ${validationErrors.date ? 'error' : ''}`}
                  value={currentNC.date}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                />
                {showValidation && validationErrors.date && (
                  <ValidationMessage message={validationErrors.date} />
                )}
              </div>

              {/* Inspector Name */}
              <div className="nc-form-group-improved">
                <label className="nc-form-label-improved required">Inspector Name *</label>
                <input
                  type="text"
                  className={`nc-form-input-improved ${validationErrors.createdBy ? 'error' : ''}`}
                  value={currentNC.createdBy}
                  onChange={(e) => handleFieldChange('createdBy', e.target.value)}
                  placeholder="e.g., John Smith"
                />
                {showValidation && validationErrors.createdBy && (
                  <ValidationMessage message={validationErrors.createdBy} />
                )}
              </div>

              {/* Sector */}
              <div className="nc-form-group-improved">
                <label className="nc-form-label-improved required">Sector *</label>
                <input
                  type="text"
                  className={`nc-form-input-improved ${validationErrors.sector ? 'error' : ''}`}
                  value={currentNC.sector}
                  onChange={(e) => handleFieldChange('sector', e.target.value)}
                  placeholder="e.g., Production"
                />
                {showValidation && validationErrors.sector && (
                  <ValidationMessage message={validationErrors.sector} />
                )}
              </div>

              {/* Supplier (optional) */}
              <div className="nc-form-group-improved">
                <label className="nc-form-label-improved">Supplier</label>
                <input
                  type="text"
                  className="nc-form-input-improved"
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
            <div className="nc-form-grid-improved">
              {/* NC Type */}
              <div className="nc-form-group-improved">
                <label className="nc-form-label-improved required">Non-Conformity Type *</label>
                <select
                  className={`nc-form-select-improved ${validationErrors.ncType ? 'error' : ''}`}
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
              <div className="nc-form-group-improved">
                <label className="nc-form-label-improved required">Detection Source *</label>
                <select
                  className={`nc-form-select-improved ${validationErrors.detectionSource ? 'error' : ''}`}
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
              <div className="nc-form-group-improved">
                <label className="nc-form-label-improved required">Component Code *</label>
                <input
                  type="text"
                  className={`nc-form-input-improved ${validationErrors.componentCode ? 'error' : ''}`}
                  value={currentNC.componentCode}
                  onChange={(e) => handleFieldChange('componentCode', e.target.value)}
                  placeholder="e.g., L4-155X110X50X4.5"
                />
                {showValidation && validationErrors.componentCode && (
                  <ValidationMessage message={validationErrors.componentCode} />
                )}
              </div>

              {/* Quantity */}
              <div className="nc-form-group-improved">
                <label className="nc-form-label-improved required">Quantity *</label>
                <input
                  type="number"
                  className={`nc-form-input-improved ${validationErrors.quantity ? 'error' : ''}`}
                  value={currentNC.quantity}
                  onChange={(e) => handleFieldChange('quantity', e.target.value)}
                  placeholder="e.g., 232"
                  min="1"
                />
                {showValidation && validationErrors.quantity && (
                  <ValidationMessage message={validationErrors.quantity} />
                )}
              </div>

              {/* Component Description - Full width */}
              <div className="nc-form-group-full-improved">
                <label className="nc-form-label-improved">Component Description</label>
                <input
                  type="text"
                  className="nc-form-input-improved"
                  value={currentNC.component}
                  onChange={(e) => handleFieldChange('component', e.target.value)}
                  placeholder="e.g., L4 LATERAL POST - 155X110X50X4.5MM, 4200MM, S420MC, HDG_100"
                />
              </div>

              {/* Problem Description - Full width */}
              <div className="nc-form-group-full-improved">
                <label className="nc-form-label-improved required">Problem Description *</label>
                <textarea
                  className={`nc-form-textarea-improved ${validationErrors.description ? 'error' : ''}`}
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

              {/* Purchase Order (optional) */}
              <div className="nc-form-group-improved">
                <label className="nc-form-label-improved">Purchase Order</label>
                <input
                  type="text"
                  className="nc-form-input-improved"
                  value={currentNC.purchaseOrder}
                  onChange={(e) => handleFieldChange('purchaseOrder', e.target.value)}
                  placeholder="e.g., PO-2024-001"
                />
              </div>
            </div>
          </div>
        );

      case 'treatment':
        return (
          <div className="nc-step-content">
            <div className="nc-form-grid-improved">
              {/* Material Disposition */}
              <div className="nc-form-group-improved">
                <label className="nc-form-label-improved">Material Disposition</label>
                <select
                  className="nc-form-select-improved"
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

              {/* Containment Action - Full width */}
              <div className="nc-form-group-full-improved">
                <label className="nc-form-label-improved">Containment Action Description</label>
                <textarea
                  className="nc-form-textarea-improved"
                  rows="4"
                  value={currentNC.containmentAction}
                  onChange={(e) => {
                    if (e.target.value.length <= 300) {
                      handleFieldChange('containmentAction', e.target.value);
                    }
                  }}
                  placeholder="Describe immediate containment actions taken..."
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
            <div className="nc-form-grid-improved">
              {/* Root Cause Analysis - Full width */}
              <div className="nc-form-group-full-improved">
                <label className="nc-form-label-improved">Root Cause Analysis Description</label>
                <textarea
                  className="nc-form-textarea-improved"
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
              <div className="nc-form-group-full-improved">
                <label className="nc-form-label-improved">Corrective Action Plan</label>
                <textarea
                  className="nc-form-textarea-improved"
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
              <div className="nc-form-group-improved">
                <label className="nc-form-label-improved">Target Completion Date</label>
                <input
                  type="date"
                  className="nc-form-input-improved"
                  value={currentNC.targetDate}
                  onChange={(e) => handleFieldChange('targetDate', e.target.value)}
                />
              </div>

              <div className="nc-form-group-improved">
                <label className="nc-form-label-improved">Follow-up Responsible</label>
                <input
                  type="text"
                  className="nc-form-input-improved"
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
              {/* Upload area */}
              <div 
                className="nc-photo-upload-area-improved"
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

              {/* ✅ MEJORADO: Photo gallery con múltiples fotos */}
              {currentNC.photos && currentNC.photos.length > 0 && (
                <div className="nc-photo-gallery-improved">
                  <h5 className="nc-gallery-title-improved">
                    📁 Uploaded Files ({currentNC.photos.length})
                  </h5>
                  <div className="nc-photo-grid-improved">
                    {currentNC.photos.map((photo, index) => (
                      <div key={photo.id} className="nc-photo-item-improved">
                        <div className="nc-photo-preview">
                          {photo.type === 'pdf' ? (
                            <div className="nc-pdf-preview">
                              <span className="nc-pdf-icon">📄</span>
                              <span className="nc-file-name">{photo.name}</span>
                            </div>
                          ) : (
                            <img 
                              src={photo.url} 
                              alt={photo.name}
                              className="nc-photo-thumbnail"
                            />
                          )}
                        </div>
                        <div className="nc-photo-info">
                          <span className="nc-photo-name">{photo.name}</span>
                          <span className="nc-photo-size">
                            {(photo.size / 1024).toFixed(1)} KB
                          </span>
                          {photo.compressionRatio && (
                            <span className="nc-compression-badge">
                              -{photo.compressionRatio}%
                            </span>
                          )}
                        </div>
                        <button
                          className="nc-remove-photo-btn"
                          onClick={() => removePhoto(photo.id)}
                          title="Remove photo"
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadingFiles && (
                <div className="nc-upload-progress">
                  <div className="nc-progress-bar">
                    <div className="nc-progress-fill"></div>
                  </div>
                  <span>Uploading files...</span>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* ✅ NUEVOS ESTILOS MEJORADOS */}
      <style>{`
        /* ========================================
           ✅ ESTILOS MEJORADOS Y PROFESIONALES
           ======================================== */

        /* Container principal más compacto */
        .nc-panel-card.nc-create-panel {
          background: white !important;
          border-radius: 16px !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
          max-width: 1000px !important;
          margin: 0 auto !important;
          padding: 0 !important;
          overflow: hidden !important;
        }

        /* ✅ NUEVO: Progress bar profesional azul */
        .nc-step-progress-container {
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
          padding: 1.5rem !important;
          margin-bottom: 0 !important;
        }

        .nc-step-progress {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          max-width: 800px !important;
          margin: 0 auto !important;
        }

        .nc-step-item {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          flex: 1 !important;
        }

        .nc-step-circle {
          width: 40px !important;
          height: 40px !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-weight: 600 !important;
          font-size: 0.875rem !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          margin-bottom: 0.5rem !important;
        }

        .nc-step-circle.pending {
          background: rgba(255, 255, 255, 0.2) !important;
          color: rgba(255, 255, 255, 0.7) !important;
          border: 2px solid rgba(255, 255, 255, 0.3) !important;
        }

        .nc-step-circle.current {
          background: white !important;
          color: #3b82f6 !important;
          border: 2px solid white !important;
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.3) !important;
        }

        .nc-step-circle.completed {
          background: #10b981 !important;
          color: white !important;
          border: 2px solid #10b981 !important;
        }

        .nc-step-label {
          font-size: 0.75rem !important;
          font-weight: 500 !important;
          text-align: center !important;
          line-height: 1.2 !important;
        }

        .nc-step-label.pending {
          color: rgba(255, 255, 255, 0.7) !important;
        }

        .nc-step-label.current {
          color: white !important;
          font-weight: 600 !important;
        }

        .nc-step-label.completed {
          color: white !important;
        }

        /* Panel header mejorado */
        .nc-panel-header {
          padding: 2rem 2rem 1rem 2rem !important;
          border-bottom: 1px solid #f3f4f6 !important;
          background: #fafafa !important;
        }

        .nc-panel-title {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          color: #1f2937 !important;
          margin-bottom: 0.5rem !important;
          display: flex !important;
          align-items: center !important;
          gap: 0.75rem !important;
        }

        .nc-panel-icon {
          font-size: 1.75rem !important;
        }

        .nc-panel-subtitle {
          color: #6b7280 !important;
          font-size: 0.875rem !important;
          margin-bottom: 0.5rem !important;
        }

        .nc-step-info {
          background: #e0f2fe !important;
          color: #0277bd !important;
          padding: 0.25rem 0.75rem !important;
          border-radius: 12px !important;
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          display: inline-block !important;
        }

        /* ✅ MEJORADO: Form container más compacto */
        .nc-form-container {
          padding: 2rem !important;
        }

        /* ✅ MEJORADO: Grid layout responsivo y compacto */
        .nc-form-grid-improved {
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
          gap: 1.25rem !important;
          margin-bottom: 1rem !important;
        }

        .nc-form-group-improved {
          display: flex !important;
          flex-direction: column !important;
        }

        .nc-form-group-full-improved {
          grid-column: 1 / -1 !important;
          display: flex !important;
          flex-direction: column !important;
        }

        /* ✅ MEJORADO: Labels más visibles con negrita */
        .nc-form-label-improved {
          font-size: 0.875rem !important;
          font-weight: 700 !important;
          color: #374151 !important;
          margin-bottom: 0.5rem !important;
          display: flex !important;
          align-items: center !important;
        }

        .nc-form-label-improved.required::after {
          content: ' *' !important;
          color: #ef4444 !important;
          font-weight: 600 !important;
        }

        /* ✅ MEJORADO: Inputs más grandes y profesionales */
        .nc-form-input-improved,
        .nc-form-select-improved,
        .nc-form-textarea-improved {
          padding: 0.875rem !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 8px !important;
          font-size: 0.875rem !important;
          transition: all 0.2s ease !important;
          background: white !important;
          min-height: 44px !important;
        }

        .nc-form-input-improved:focus,
        .nc-form-select-improved:focus,
        .nc-form-textarea-improved:focus {
          outline: none !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        .nc-form-input-improved.error,
        .nc-form-select-improved.error,
        .nc-form-textarea-improved.error {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }

        .nc-form-textarea-improved {
          resize: vertical !important;
          min-height: 100px !important;
        }

        /* ✅ MEJORADO: Photo upload area */
        .nc-photo-upload-area-improved {
          border: 2px dashed #d1d5db !important;
          border-radius: 12px !important;
          padding: 2rem !important;
          text-align: center !important;
          transition: all 0.2s ease !important;
          background: #fafafa !important;
          margin-bottom: 2rem !important;
        }

        .nc-photo-upload-area-improved:hover,
        .nc-photo-upload-area-improved.drag-over {
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

        /* ✅ MEJORADO: Photo gallery con múltiples fotos */
        .nc-photo-gallery-improved {
          margin-top: 2rem !important;
        }

        .nc-gallery-title-improved {
          font-size: 1.125rem !important;
          font-weight: 700 !important;
          color: #374151 !important;
          margin-bottom: 1rem !important;
          display: flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
        }

        .nc-photo-grid-improved {
          display: grid !important;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important;
          gap: 1rem !important;
          max-height: 400px !important;
          overflow-y: auto !important;
          padding: 0.5rem !important;
          border-radius: 8px !important;
          background: #f9fafb !important;
        }

        .nc-photo-item-improved {
          border: 1px solid #e5e7eb !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          background: white !important;
          transition: all 0.2s ease !important;
          position: relative !important;
        }

        .nc-photo-item-improved:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
          border-color: #3b82f6 !important;
        }

        .nc-photo-preview {
          aspect-ratio: 1 / 1 !important;
          overflow: hidden !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: #f3f4f6 !important;
        }

        .nc-photo-thumbnail {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }

        .nc-pdf-preview {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          height: 100% !important;
          padding: 1rem !important;
        }

        .nc-pdf-icon {
          font-size: 2rem !important;
          margin-bottom: 0.5rem !important;
        }

        .nc-file-name {
          font-size: 0.75rem !important;
          text-align: center !important;
          color: #6b7280 !important;
          word-break: break-word !important;
        }

        .nc-photo-info {
          padding: 0.5rem !important;
          border-top: 1px solid #f3f4f6 !important;
        }

        .nc-photo-name {
          display: block !important;
          font-size: 0.75rem !important;
          font-weight: 500 !important;
          color: #374151 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }

        .nc-photo-size {
          display: block !important;
          font-size: 0.625rem !important;
          color: #9ca3af !important;
          margin-top: 0.25rem !important;
        }

        .nc-compression-badge {
          display: inline-block !important;
          background: #dcfce7 !important;
          color: #166534 !important;
          font-size: 0.625rem !important;
          font-weight: 500 !important;
          padding: 0.125rem 0.375rem !important;
          border-radius: 4px !important;
          margin-left: 0.5rem !important;
        }

        .nc-remove-photo-btn {
          position: absolute !important;
          top: 0.5rem !important;
          right: 0.5rem !important;
          background: rgba(239, 68, 68, 0.9) !important;
          border: none !important;
          border-radius: 50% !important;
          width: 24px !important;
          height: 24px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 0.75rem !important;
          cursor: pointer !important;
          opacity: 0 !important;
          transition: opacity 0.2s ease !important;
        }

        .nc-photo-item-improved:hover .nc-remove-photo-btn {
          opacity: 1 !important;
        }

        /* Navigation buttons */
        .nc-wizard-navigation {
          padding: 1.5rem 2rem !important;
          border-top: 1px solid #f3f4f6 !important;
          background: #fafafa !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
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
          font-weight: 600 !important;
          font-size: 0.875rem !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          border: 2px solid transparent !important;
          display: flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
          min-height: 44px !important;
        }

        .nc-btn-secondary {
          background: white !important;
          color: #6b7280 !important;
          border-color: #d1d5db !important;
        }

        .nc-btn-secondary:hover:not(:disabled) {
          background: #f9fafb !important;
          border-color: #9ca3af !important;
        }

        .nc-btn-secondary:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
        }

        .nc-btn-primary {
          background: #3b82f6 !important;
          color: white !important;
          border-color: #3b82f6 !important;
        }

        .nc-btn-primary:hover:not(:disabled) {
          background: #2563eb !important;
          border-color: #2563eb !important;
        }

        .nc-btn-success {
          background: #10b981 !important;
          color: white !important;
          border-color: #10b981 !important;
        }

        .nc-btn-success:hover:not(:disabled) {
          background: #059669 !important;
          border-color: #059669 !important;
        }

        .nc-btn:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
        }

        /* Success banner */
        .nc-success-banner {
          background: linear-gradient(90deg, #dcfce7, #bbf7d0) !important;
          color: #166534 !important;
          padding: 1rem 2rem !important;
          display: flex !important;
          align-items: center !important;
          gap: 0.75rem !important;
          font-weight: 600 !important;
          border-bottom: 1px solid #a7f3d0 !important;
        }

        .nc-success-icon {
          font-size: 1.25rem !important;
        }

        /* Validation errors */
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

        /* Character count */
        .nc-char-count {
          font-size: 0.75rem !important;
          color: #9ca3af !important;
          text-align: right !important;
          margin-top: 0.25rem !important;
        }

        /* Input with button */
        .nc-input-with-button {
          display: flex !important;
          gap: 0.5rem !important;
          align-items: flex-end !important;
        }

        .nc-input-with-button .nc-form-input-improved {
          flex: 1 !important;
        }

        .nc-generate-btn {
          padding: 0.875rem !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 8px !important;
          background: white !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          font-size: 1rem !important;
          min-width: 44px !important;
          min-height: 44px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .nc-generate-btn:hover {
          border-color: #3b82f6 !important;
          background: #eff6ff !important;
        }

        /* Upload progress */
        .nc-upload-progress {
          margin-top: 1rem !important;
          text-align: center !important;
        }

        .nc-progress-bar {
          width: 100% !important;
          height: 4px !important;
          background: #e5e7eb !important;
          border-radius: 2px !important;
          overflow: hidden !important;
          margin-bottom: 0.5rem !important;
        }

        .nc-progress-fill {
          height: 100% !important;
          background: #3b82f6 !important;
          animation: progress 2s ease-in-out infinite !important;
        }

        @keyframes progress {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 0%; }
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .nc-form-grid-improved {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }

          .nc-panel-header {
            padding: 1.5rem 1rem 1rem 1rem !important;
          }

          .nc-form-container {
            padding: 1.5rem 1rem !important;
          }

          .nc-wizard-navigation {
            padding: 1rem !important;
            flex-direction: column !important;
            gap: 1rem !important;
          }

          .nc-nav-buttons {
            width: 100% !important;
            justify-content: space-between !important;
          }

          .nc-photo-grid-improved {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
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
          handleStepClick={handleStepClick}
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
            
            {/* ✅ CORREGIDO: Solo botón Save & Export PDF en el último paso */}
            {currentStep < steps.length - 1 ? (
              <button 
                className="nc-btn nc-btn-primary"
                onClick={handleNext}
              >
                Next →
              </button>
            ) : (
              <button
                className="nc-btn nc-btn-success"
                onClick={handleSaveAndExport}
                disabled={exportingPDF || uploadingFiles}
              >
                {exportingPDF ? '🔄 Exporting...' : 
                 uploadingFiles ? '💾 Saving...' : 
                 '💾 Save & Export PDF'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateNCPanel;
