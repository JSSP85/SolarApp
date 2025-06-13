// src/components/non-conformity/panels/CreateNCPanel.jsx - WIZARD STEPPER VERSION CON FIREBASE
import React, { useState, useEffect } from 'react';
import { useNonConformity } from '../../../context/NonConformityContext';
import { saveNonConformity } from '../../../firebase/nonConformityService';
import { exportNCToPDF } from '../../../utils/ncPdfExportService';

// Validation message component
const ValidationMessage = ({ message }) => (
  <div className="nc-validation-message">
    <span className="nc-validation-icon">⚠️</span>
    <span>{message}</span>
  </div>
);

// ✅ CONFIGURACIÓN PARA COMPRESIÓN DE IMÁGENES
const MAX_IMAGE_WIDTH = 1200;
const MAX_IMAGE_HEIGHT = 800;
const IMAGE_QUALITY = 0.7; // 70% calidad para reducir tamaño

// ✅ FUNCIÓN DE COMPRESIÓN DE IMÁGENES
const compressImage = (imageDataUrl) => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo la proporción
        let newWidth = img.width;
        let newHeight = img.height;
        
        if (newWidth > MAX_IMAGE_WIDTH) {
          newHeight = Math.round((MAX_IMAGE_WIDTH / newWidth) * newHeight);
          newWidth = MAX_IMAGE_WIDTH;
        }
        
        if (newHeight > MAX_IMAGE_HEIGHT) {
          newWidth = Math.round((MAX_IMAGE_HEIGHT / newHeight) * newWidth);
          newHeight = MAX_IMAGE_HEIGHT;
        }
        
        // Crear canvas para redimensionar
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, newWidth, newHeight);
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Convertir a JPEG con calidad reducida
        const compressedDataUrl = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
        
        // Calcular estadísticas de compresión
        const originalSize = Math.round(imageDataUrl.length / 1024);
        const newSize = Math.round(compressedDataUrl.length / 1024);
        const compressionRatio = Math.round(((originalSize - newSize) / originalSize) * 100);
        
        console.log(`Imagen comprimida: ${originalSize}KB → ${newSize}KB (${compressionRatio}% reducción)`);
        
        resolve({
          compressedImage: compressedDataUrl,
          originalSize,
          newSize,
          compressionRatio,
          newDimensions: `${newWidth}x${newHeight}`
        });
      };
      
      img.onerror = () => reject(new Error('Error loading image for compression'));
      img.src = imageDataUrl;
    } catch (error) {
      reject(error);
    }
  });
};

// Step Progress Bar Component
const StepProgressBar = ({ steps, currentStep, completedSteps }) => {
  return (
    <div className="nc-step-progress-container">
      <div className="nc-step-progress-bar">
        {steps.map((step, index) => (
          <div key={index} className="nc-step-wrapper">
            {/* Step Circle */}
            <div className={`nc-step-circle ${
              completedSteps.includes(index) ? 'completed' : 
              currentStep === index ? 'current' : 'pending'
            }`}>
              {completedSteps.includes(index) ? (
                <span className="nc-step-check">✓</span>
              ) : (
                <span className="nc-step-number">{index + 1}</span>
              )}
            </div>
            
            {/* Step Label */}
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
  const { state, dispatch, helpers } = useNonConformity();
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
      requiredFields: ['ncType', 'description', 'componentCode', 'quantity']
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
    { value: 'minor', label: 'Minor' }
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

  // ✅ FUNCIONES PARA MANEJO DE FOTOS
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    handleFilesUpload(files);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    handleFilesUpload(files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleFilesUpload = async (files) => {
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
      return isValidType && isValidSize;
    });

    if (validFiles.length > 0) {
      setUploadingFiles(true);
    }

    let processedFiles = 0;
    const totalFiles = validFiles.length;

    for (const file of validFiles) {
      try {
        if (file.type.startsWith('image/')) {
          // ✅ COMPRIMIR IMÁGENES
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const compressionResult = await compressImage(e.target.result);
              
              const newPhoto = {
                id: Date.now() + Math.random(),
                name: file.name,
                url: compressionResult.compressedImage,
                type: file.type,
                size: compressionResult.newSize * 1024, // Convertir KB a bytes
                originalSize: compressionResult.originalSize * 1024,
                compressionRatio: compressionResult.compressionRatio,
                dimensions: compressionResult.newDimensions
              };
              
              const currentPhotos = Array.isArray(currentNC.photos) ? currentNC.photos : [];
              handleFieldChange('photos', [...currentPhotos, newPhoto]);
              
              processedFiles++;
              if (processedFiles === totalFiles) {
                setUploadingFiles(false);
              }
            } catch (error) {
              console.error('Error compressing image:', error);
              processedFiles++;
              if (processedFiles === totalFiles) {
                setUploadingFiles(false);
              }
            }
          };
          reader.readAsDataURL(file);
        } else {
          // ✅ ARCHIVOS PDF SIN COMPRIMIR
          const reader = new FileReader();
          reader.onload = (e) => {
            const newPhoto = {
              id: Date.now() + Math.random(),
              name: file.name,
              url: e.target.result,
              type: file.type,
              size: file.size
            };
            
            const currentPhotos = Array.isArray(currentNC.photos) ? currentNC.photos : [];
            handleFieldChange('photos', [...currentPhotos, newPhoto]);
            
            processedFiles++;
            if (processedFiles === totalFiles) {
              setUploadingFiles(false);
            }
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
          description: 'Problem Description',
          componentCode: 'Component Code',
          quantity: 'Quantity'
        };
        errors[field] = `${fieldNames[field]} is required`;
      }
    });

    dispatch({
      type: 'SET_VALIDATION_ERRORS',
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
          type: 'SAVE_NC',
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

📊 Summary:
• Saved to Firebase database
• ${totalPhotos} photos uploaded
• ${compressedPhotos} images compressed
• Data synchronized across all devices

🎯 Next steps:
• Check Database section to verify
• Track progress in Tracking panel
• Export PDF when ready
        `;
        
        alert(successMessage);
        
        // Reset form after 3 seconds y generar nuevo número
        setTimeout(() => {
          dispatch({ type: 'CLEAR_CURRENT_NC' });
          const newNumber = helpers.generateNCNumber();
          dispatch({
            type: 'UPDATE_NC_FIELD',
            payload: { field: 'number', value: newNumber }
          });
          setCurrentStep(0);
          setCompletedSteps([]);
          setSavedSuccessfully(false);
          setIsDirty(false);
        }, 3000);

      } catch (error) {
        console.error('Error saving NC to Firebase:', error);
        setUploadingFiles(false);
        
        // Fallback: guardar solo en contexto local
        const newNCData = {
          ...currentNC,
          id: Date.now().toString(),
          number: currentNC.number || helpers.generateNCNumber(),
          createdDate: currentNC.date || new Date().toLocaleDateString('en-GB'),
          status: 'open',
          daysOpen: 0
        };

        dispatch({
          type: 'SAVE_NC',
          payload: newNCData
        });

        alert(`⚠️ Warning: NC saved locally but not synced to cloud.\n\nError: ${error.message}\n\nYour data is safe locally. Please check your internet connection and try exporting later.`);
      }
    } else {
      setShowValidation(true);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'basic':
        return (
          <div className="nc-step-content">
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
                {currentNC.description.length}/1000 characters
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
                value={currentNC.correctiveActionPlan}
                onChange={(e) => handleFieldChange('correctiveActionPlan', e.target.value)}
                placeholder="Detail the corrective actions to prevent recurrence..."
              />
            </div>
          </div>
        );

      case 'photos':
        return (
          <div className="nc-step-content">
            {/* ✅ ZONA DE UPLOAD CON DRAG & DROP */}
            <div 
              className="nc-photo-upload-area"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                id="file-input"
                type="file"
                multiple
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <div 
                className="nc-upload-placeholder"
                onClick={() => document.getElementById('file-input').click()}
              >
                <div className="nc-upload-icon">📸</div>
                {uploadingFiles ? (
                  <>
                    <p><strong>Uploading files...</strong></p>
                    <div className="nc-upload-spinner">⏳</div>
                  </>
                ) : (
                  <>
                    <p><strong>Click to upload photos</strong> or drag and drop</p>
                    <p className="nc-upload-note">
                      Supported formats: JPG, PNG, PDF (Max 10MB each)
                    </p>
                  </>
                )}
              </div>
            </div>
            
            {/* ✅ PREVIEW DE FOTOS EN GRILLA 2x2 */}
            {currentNC.photos && Array.isArray(currentNC.photos) && currentNC.photos.length > 0 && (
              <div className="nc-photo-preview-section">
                <h4 className="nc-photos-title">Uploaded Photos ({currentNC.photos.length})</h4>
                <div className="nc-photo-preview-grid">
                  {currentNC.photos.map((photo) => (
                    <div key={photo.id} className="nc-photo-preview-item">
                      {photo.type && photo.type.startsWith('image/') ? (
                        <img src={photo.url} alt={photo.name} />
                      ) : (
                        <div className="nc-pdf-preview">
                          <div className="nc-pdf-icon">📄</div>
                          <span className="nc-pdf-name">{photo.name}</span>
                        </div>
                      )}
                      <div className="nc-photo-info">
                        <span className="nc-photo-name">{photo.name}</span>
                        <span className="nc-photo-size">{(photo.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <button 
                        className="nc-photo-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(photo.id);
                        }}
                        title="Remove photo"
                      >
                        ×
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
    <div className="nc-create-panel-wizard">
      {/* CSS Styles */}
      <style jsx>{`
        .nc-create-panel-wizard {
          background: rgba(0, 95, 131, 0.75);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 95, 131, 0.3);
          border-radius: 16px;
          overflow: hidden;
        }

        /* Step Progress Bar Styles */
        .nc-step-progress-container {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .nc-step-progress-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 800px;
          margin: 0 auto;
          position: relative;
        }

        .nc-step-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          flex: 1;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nc-step-wrapper:hover .nc-step-circle.completed,
        .nc-step-wrapper:hover .nc-step-circle.current {
          transform: scale(1.1);
        }

        .nc-step-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.1rem;
          margin-bottom: 0.75rem;
          transition: all 0.3s ease;
          position: relative;
          z-index: 2;
        }

        .nc-step-circle.pending {
          background: rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.6);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .nc-step-circle.current {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: 2px solid #3b82f6;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
          animation: pulse 2s infinite;
        }

        .nc-step-circle.completed {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: 2px solid #10b981;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
        }

        .nc-step-check {
          font-size: 1.3rem;
        }

        .nc-step-number {
          font-size: 1.1rem;
        }

        .nc-step-label {
          text-align: center;
          font-size: 0.85rem;
          font-weight: 600;
          line-height: 1.2;
          max-width: 120px;
          transition: all 0.3s ease;
        }

        .nc-step-label.pending {
          color: rgba(255, 255, 255, 0.6);
        }

        .nc-step-label.current {
          color: #93c5fd;
        }

        .nc-step-label.completed {
          color: #6ee7b7;
        }

        .nc-step-connector {
          position: absolute;
          top: 25px;
          left: 50%;
          right: -50%;
          height: 3px;
          z-index: 1;
          transition: all 0.3s ease;
        }

        .nc-step-connector.pending {
          background: rgba(255, 255, 255, 0.2);
        }

        .nc-step-connector.completed {
          background: linear-gradient(90deg, #10b981, #059669);
        }

        /* Panel Header */
        .nc-panel-header {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
        }

        .nc-panel-title {
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .nc-panel-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1rem;
          margin: 0;
        }

        .nc-step-info {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        /* Form Content */
        .nc-form-container {
          background: rgba(255, 255, 255, 0.95);
          padding: 2rem;
        }

        .nc-step-content {
          min-height: 300px;
        }

        .nc-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .nc-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nc-form-label {
          color: #1e40af;
          font-weight: 700;
          font-size: 0.875rem;
          text-align: left;
          margin-bottom: 0.5rem;
          display: block;
        }

        .nc-form-label.required::after {
          content: ' *';
          color: #ef4444;
        }

        .nc-auto-generated {
          color: #9ca3af;
          font-weight: 400;
          font-size: 0.75rem;
        }

        .nc-form-input, .nc-form-select {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #374151;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .nc-form-input:focus, .nc-form-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .nc-form-input.error, .nc-form-select.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .nc-input-readonly {
          background-color: #f9fafb;
          color: #6b7280;
          cursor: not-allowed;
        }

        .nc-form-textarea-limited {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #374151;
          font-size: 0.875rem;
          resize: vertical;
          font-family: inherit;
          transition: all 0.2s ease;
          grid-column: 1 / -1;
        }

        .nc-form-textarea-limited:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .nc-char-count {
          text-align: right;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .nc-validation-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .nc-validation-icon {
          font-size: 0.875rem;
        }

        /* Photo Upload - MEJORADO */
        .nc-photo-upload-area {
          border: 2px dashed #3b82f6;
          border-radius: 12px;
          padding: 3rem;
          text-align: center;
          background: linear-gradient(135deg, #f8faff 0%, #f1f5ff 100%);
          transition: all 0.3s ease;
          margin-bottom: 2rem;
        }

        .nc-photo-upload-area:hover {
          border-color: #1d4ed8;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
        }

        .nc-upload-placeholder {
          cursor: pointer;
        }

        .nc-upload-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          opacity: 0.8;
        }

        .nc-upload-placeholder p {
          color: #374151;
          margin: 0.5rem 0;
          font-size: 1rem;
        }

        .nc-upload-note {
          color: #6b7280;
          font-size: 0.875rem;
          margin-top: 1rem;
        }

        .nc-upload-spinner {
          font-size: 1.5rem;
          animation: spin 1s linear infinite;
          margin-top: 0.5rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ✅ SECCIÓN DE FOTOS SUBIDAS */
        .nc-photo-preview-section {
          margin-top: 1.5rem;
        }

        .nc-photos-title {
          color: #1e40af;
          font-weight: 700;
          font-size: 1rem;
          margin-bottom: 1rem;
          text-align: left;
        }

        /* ✅ GRILLA 2x2 PARA FOTOS */
        .nc-photo-preview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .nc-photo-preview-item {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background: white;
          border: 2px solid #e5e7eb;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .nc-photo-preview-item:hover {
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
        }

        .nc-photo-preview-item img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
        }

        /* ✅ PREVIEW PARA PDFs */
        .nc-pdf-preview {
          width: 100%;
          height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f8faff 0%, #f1f5ff 100%);
          border: 2px dashed #3b82f6;
        }

        .nc-pdf-icon {
          font-size: 3rem;
          color: #3b82f6;
          margin-bottom: 0.5rem;
        }

        .nc-pdf-name {
          color: #374151;
          font-size: 0.875rem;
          text-align: center;
          padding: 0 1rem;
          font-weight: 600;
        }

        /* ✅ INFO DE LA FOTO */
        .nc-photo-info {
          padding: 0.75rem;
          background: white;
          border-top: 1px solid #e5e7eb;
        }

        .nc-photo-name {
          display: block;
          color: #374151;
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
          word-break: break-word;
        }

        .nc-photo-size {
          color: #6b7280;
          font-size: 0.75rem;
        }

        /* ✅ BOTÓN REMOVER MEJORADO */
        .nc-photo-remove {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: 2px solid white;
          cursor: pointer;
          font-size: 1.2rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .nc-photo-remove:hover {
          background: rgba(220, 38, 38, 1);
          transform: scale(1.1);
        }

        /* Navigation Buttons */
        .nc-wizard-navigation {
          background: rgba(255, 255, 255, 0.95);
          padding: 1.5rem 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nc-nav-buttons {
          display: flex;
          gap: 1rem;
        }

        .nc-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nc-btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .nc-btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .nc-btn-primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }

        .nc-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .nc-btn-success {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .nc-btn-success:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669, #047857);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .nc-btn-export {
          background: linear-gradient(135deg, #7c3aed, #5b21b6);
          color: white;
        }

        .nc-btn-export:hover:not(:disabled) {
          background: linear-gradient(135deg, #6d28d9, #4c1d95);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .nc-btn-combo {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        }

        .nc-btn-combo:hover:not(:disabled) {
          background: linear-gradient(135deg, #d97706, #b45309);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .nc-btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        .nc-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
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

          /* ✅ FOTOS RESPONSIVE - 1 COLUMNA EN MÓVIL */
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
          
          {/* ✅ BOTÓN EXPORT PDF */}
          <button 
            className="nc-btn nc-btn-export"
            onClick={handleExportPDF}
            disabled={exportingPDF || !currentNC.number}
            title="Export current NC to PDF"
          >
            {exportingPDF ? (
              <>
                <div className="nc-btn-spinner"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                📄 Export PDF
              </>
            )}
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
              
              {/* ✅ BOTÓN SAVE & EXPORT */}
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
  );
};

export default CreateNCPanel;