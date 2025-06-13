// src/components/non-conformity/panels/CreateNCPanel.jsx
// ✅ MODIFICADO PARA INCLUIR CAMPO "DETECTION SOURCE"

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
    { value: 'critical', label: 'Critical' },
    { value: 'major', label: 'Major' },
    { value: 'minor', label: 'Minor' },
    { value: 'low', label: 'Low' }
  ];

  const ncTypeOptions = [
    { value: '', label: 'Select type' },
    { value: 'design_error', label: 'Design Error' },
    { value: 'manufacturing_defect', label: 'Manufacturing Defect' },
    { value: 'material_defect', label: 'Material Defect' },
    { value: 'documentation_error', label: 'Documentation Error' },
    { value: 'process_deviation', label: 'Process Deviation' },
    { value: 'supplier_nc', label: 'Supplier Non-Conformity' },
    { value: 'logistics_nc', label: 'Logistics Non-Conformity' },
    { value: 'installation_issue', label: 'Installation Issue' },
    { value: 'quality_control_fail', label: 'Quality Control Failure' },
    { value: 'testing_nc', label: 'Testing Non-Conformity' },
    { value: 'calibration_issue', label: 'Calibration Issue' },
    { value: 'training_gap', label: 'Training Gap' },
    { value: 'equipment_malfunction', label: 'Equipment Malfunction' },
    { value: 'environmental_impact', label: 'Environmental Impact' },
    { value: 'safety_concern', label: 'Safety Concern' },
    { value: 'regulatory_violation', label: 'Regulatory Violation' },
    { value: 'customer_complaint', label: 'Customer Complaint' },
    { value: 'audit_finding', label: 'Audit Finding' },
    { value: 'corrective_action_ineffective', label: 'Previous Corrective Action Ineffective' },
    { value: 'system_failure', label: 'System Failure' },
    { value: 'human_error', label: 'Human Error' },
    { value: 'communication_breakdown', label: 'Communication Breakdown' },
    { value: 'resource_shortage', label: 'Resource Shortage' },
    { value: 'time_constraint', label: 'Time Constraint Issue' },
    { value: 'defective_product', label: 'Defective Product' },
    { value: 'other', label: 'Other' }
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
    { value: 'accept_as_is', label: 'Accept as is' },
    { value: 'rework_by_supplier', label: 'Rework by supplier' },
    { value: 'rework_by_convert', label: 'Rework by Convert' },
    { value: 'reject', label: 'Reject' }
  ];

  // Generate new NC number on component mount
  useEffect(() => {
    if (!currentNC.number) {
      const newNumber = helpers.generateNCNumber();
      dispatch({
        type: actions.UPDATE_NC_FIELD,
        payload: { field: 'number', value: newNumber }
      });
    }
  }, [currentNC.number, dispatch, helpers, actions]);

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
                {/* NC Number (Auto-generated) */}
                <div className="nc-form-group">
                  <label className="nc-form-label">NC Number</label>
                  <input
                    type="text"
                    className="nc-form-input readonly"
                    value={currentNC.number || 'Auto-generated'}
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

                {/* Project */}
                <div className="nc-form-group">
                  <label className="nc-form-label required">Project *</label>
                  <input
                    type="text"
                    className={`nc-form-input ${validationErrors.project ? 'error' : ''}`}
                    value={currentNC.project}
                    onChange={(e) => handleFieldChange('project', e.target.value)}
                    placeholder="e.g., JESI, SOLAR PARK A"
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
                    placeholder="e.g., 12926"
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
                    placeholder="e.g., Juan Sebastian Sanchez"
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
              <div className="nc-field-help">
                Indicate where this non-conformity was discovered
              </div>
              {showValidation && validationErrors.detectionSource && (
                <ValidationMessage message={validationErrors.detectionSource} />
              )}
            </div>

            {/* Description */}
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
                {currentNC.description?.length || 0}/1000 characters
              </div>
              {showValidation && validationErrors.description && (
                <ValidationMessage message={validationErrors.description} />
              )}
            </div>

            <div className="nc-form-grid">
              {/* Purchase Order */}
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
                onChange={(e) => handleFieldChange('containmentAction', e.target.value)}
                placeholder="Describe immediate actions taken to contain the defect..."
              />
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
                onChange={(e) => handleFieldChange('rootCauseAnalysis', e.target.value)}
                placeholder="Analyze and describe the root cause of this non-conformity..."
              />
            </div>

            <div className="nc-form-group">
              <label className="nc-form-label">Corrective Action Plan</label>
              <textarea
                className="nc-form-textarea-limited"
                rows="3"
                value={currentNC.correctiveAction}
                onChange={(e) => handleFieldChange('correctiveAction', e.target.value)}
                placeholder="Define specific corrective actions to prevent recurrence..."
              />
            </div>

            <div className="nc-form-grid">
              <div className="nc-form-group">
                <label className="nc-form-label">Planned Closure Date</label>
                <input
                  type="date"
                  className="nc-form-input"
                  value={currentNC.plannedClosureDate}
                  onChange={(e) => handleFieldChange('plannedClosureDate', e.target.value)}
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
                            <span className="nc-pdf-name">{photo.name}</span>
                            <span className="nc-pdf-size">{(photo.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                      ) : (
                        <div className="nc-image-preview">
                          <img src={photo.url} alt={photo.name} />
                          <div className="nc-image-overlay">
                            <span className="nc-image-name">{photo.name}</span>
                            {photo.compressionRatio && (
                              <span className="nc-compression-badge">
                                🗜️ -{photo.compressionRatio}%
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      <button 
                        className="nc-photo-remove-btn"
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
        return null;
    }
  };

  return (
    <div className="nc-panel-card nc-create-panel">
      <style>{`
        /* ✅ ESTILOS ESPECÍFICOS PARA CREATE NC PANEL */
        .nc-create-panel {
          max-width: 1200px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        /* Step Progress Bar */
        .nc-step-progress-container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
          color: white;
        }

        .nc-step-progress {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          max-width: 800px;
          margin: 0 auto;
        }

        .nc-step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          flex: 1;
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
          margin-bottom: 0.75rem;
          transition: all 0.3s ease;
          z-index: 2;
          position: relative;
        }

        .nc-step-circle.completed {
          background: #10b981;
          color: white;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }

        .nc-step-circle.current {
          background: white;
          color: #667eea;
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .nc-step-circle.pending {
          background: rgba(255, 255, 255, 0.3);
          color: rgba(255, 255, 255, 0.8);
          border: 2px solid rgba(255, 255, 255, 0.5);
        }

        .nc-step-label {
          text-align: center;
          font-size: 0.875rem;
          font-weight: 600;
          max-width: 100px;
          transition: all 0.3s ease;
        }

        .nc-step-label.completed,
        .nc-step-label.current {
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .nc-step-label.pending {
          color: rgba(255, 255, 255, 0.7);
        }

        .nc-step-connector {
          position: absolute;
          top: 25px;
          left: calc(50% + 25px);
          right: calc(-50% + 25px);
          height: 3px;
          z-index: 1;
          transition: all 0.3s ease;
        }

        .nc-step-connector.completed {
          background: #10b981;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .nc-step-connector.pending {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Form Content */
        .nc-form-container {
          padding: 3rem; /* ✅ MÁS PADDING */
          background: rgba(255, 255, 255, 0.95); /* ✅ FONDO BLANCO SEMI-TRANSPARENTE */
          margin: 1rem;
          borderRadius: 16px;
          backdropFilter: blur(5px);
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
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          background: white;
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
          background: #f9fafb;
          color: #6b7280;
          cursor: not-allowed;
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

        /* Photo Upload */
        .nc-photo-upload-area {
          border: 3px dashed #d1d5db;
          border-radius: 12px;
          padding: 3rem 2rem;
          text-align: center;
          transition: all 0.3s ease;
          background: #fafbfc;
          margin-bottom: 2rem;
        }

        .nc-photo-upload-area:hover {
          border-color: #667eea;
          background: #f8faff;
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
          padding: 1rem 0.75rem 0.5rem;
          font-size: 0.75rem;
        }

        .nc-pdf-preview {
          display: flex;
          align-items: center;
          padding: 1rem;
          background: #f3f4f6;
          gap: 0.75rem;
        }

        .nc-pdf-icon {
          font-size: 2rem;
        }

        .nc-pdf-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .nc-pdf-name {
          font-weight: 600;
          font-size: 0.875rem;
          color: #374151;
        }

        .nc-pdf-size {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .nc-compression-badge {
          background: #10b981;
          color: white;
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          font-size: 0.625rem;
          font-weight: 600;
          margin-top: 0.25rem;
          align-self: flex-start;
        }

        .nc-photo-remove-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.3s ease;
        }

        .nc-photo-remove-btn:hover {
          background: #ef4444;
          transform: scale(1.1);
        }

        /* Validation */
        .nc-validation-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.5rem;
        }

        .nc-validation-icon {
          font-size: 0.875rem;
        }

        /* Navigation */
        .nc-wizard-navigation {
          background: #f9fafb;
          padding: 1.5rem 2.5rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nc-nav-buttons {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .nc-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: none;
          font-size: 0.875rem;
        }

        .nc-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        .nc-btn-secondary {
          background: #6b7280;
          color: white;
        }

        .nc-btn-secondary:hover:not(:disabled) {
          background: #4b5563;
          transform: translateY(-1px);
        }

        .nc-btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .nc-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .nc-btn-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .nc-btn-success:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }

        .nc-btn-combo {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
        }

        .nc-btn-combo:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
        }

        .nc-btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .nc-step-counter {
          color: #6b7280;
          font-size: 0.875rem;
        }

        /* Success Message */
        .nc-success-banner {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
          margin-bottom: 0;
        }

        .nc-success-icon {
          font-size: 1.2rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .nc-create-panel {
            max-width: 95%;
            margin: 1rem auto;
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
            margin: 0.5rem;
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
          }

          .nc-nav-buttons {
            flex-direction: column;
            width: 100%;
            gap: 0.75rem;
          }

          .nc-btn {
            justify-content: center;
            width: 100%;
          }
        }
      `}</style>

      {/* ✅ DIV PRINCIPAL SIN STYLE TAG INTERNO */}
      <div className="nc-panel-card nc-create-panel">
        {/* Success Message */}
        {savedSuccessfully && (
          <div className="nc-success-banner">
            <span className="nc-success-icon">✅</span>
            <span>Non-Conformity {currentNC.number} has been created successfully!</span>
          </div>
        )}}
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
          <span className="nc-panel-icon">{steps[currentStep].id === 'basic' ? '➕' : 
            steps[currentStep].id === 'details' ? '🔍' :
            steps[currentStep].id === 'treatment' ? '⚙️' :
            steps[currentStep].id === 'corrective' ? '🔧' : '📸'}</span>
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
              
              {/* ✅ BOTÓN SAVE & EXPORT - SOLO EN ÚLTIMO PASO */}
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
    </>
  );
};

export default CreateNCPanel;