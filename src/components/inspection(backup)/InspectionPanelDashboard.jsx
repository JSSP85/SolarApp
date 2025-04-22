// src/components/inspection/InspectionPanelDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useInspection } from '../../context/InspectionContext';
import { CheckCircle, ArrowLeft, ArrowRight, XCircle, Camera, Upload, Info, Settings, Eye, List, BarChart2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getSampleLetter, getSampleCount } from '../../utils/samplePlanHelper';

const InspectionPanelDashboard = () => {
  const { state, dispatch } = useInspection();
  const {
    componentName,
    componentCode,
    dimensions,
    currentDimension,
    currentDimSample,
    dimensionMeasurements,
    dimensionNonConformities,
    totalSamplesChecked,
    completedDimensions,
    inspectionStatus,
    inspectionStep,
    totalNonConformities,
    sampleInfo,
    iso2859Table,
    showStepNotification,
    stepNotificationMessage,
    selectedHistoryDim,
    meanCoating,
    localCoatingMeasurements,
    currentCoatingSample,
    coatingStats,
    coatingRequirements,
    visualConformity,
    visualNotes,
    measurementEquipment,
    photos
  } = state;

  // Estado local para las pestañas de los steps de dimensión
  const [activeStepTab, setActiveStepTab] = useState(inspectionStep);
  
  // Estado local para la visualización de gráficos
  const [chartViewMode, setChartViewMode] = useState('all'); // 'all' o 'individual'
  const [selectedDimForChart, setSelectedDimForChart] = useState(
    dimensions && dimensions.length > 0 ? dimensions[0].code : ''
  );
  
  // Estado para la dimensión seleccionada en el historial
  const [historyDimension, setHistoryDimension] = useState(
    dimensions && dimensions.length > 0 ? dimensions[0].code : ''
  );

  // Colores para dimensiones
  const dimensionColors = {
    A: "#8884d8", // Purple
    B: "#82ca9d", // Green
    C: "#ffc658"  // Yellow/Orange
  };

  // Cambiar el paso de inspección cuando cambia activeStepTab
  useEffect(() => {
    dispatch({ type: 'SET_INSPECTION_STEP', payload: activeStepTab });
    
    // Reiniciar a la primera cota al cambiar de step
    dispatch({ 
      type: 'SET_DIMENSION_SAMPLE', 
      payload: { 
        dimension: 0, // La primera dimensión (normalmente A)
        sample: 1 // La primera muestra
      } 
    });
  }, [activeStepTab, dispatch]);
  
  // Actualizar historyDimension cuando cambia currentDimension
  useEffect(() => {
    if (dimensions && currentDimension < dimensions.length) {
      setHistoryDimension(dimensions[currentDimension].code);
    }
  }, [currentDimension, dimensions]);

  // Obtener todas las medidas registradas para una dimensión específica en todos los steps
  const getDimensionMeasurementHistory = (dimCode) => {
    if (!dimensions) return [];
    
    const sampleCount = getSampleCount(sampleInfo);
    
    // Crear un array con todas las muestras para todos los steps
    const steps = ['first', 'second', 'third', 'fourth', 'fifth'];
    const history = [];
    
    for (let i = 0; i < sampleCount; i++) {
      const sampleRow = { sample: i + 1 };
      steps.forEach((step, stepIndex) => {
        const stepOffset = stepIndex * sampleCount;
        sampleRow[step] = dimensionMeasurements?.[dimCode]?.[stepOffset + i] || '';
      });
      history.push(sampleRow);
    }
    
    return history;
  };

  // Verificar si un valor está dentro de tolerancias
  const isValueWithinTolerance = (value, dimension) => {
    if (!value || value === '' || !dimension) return true;
    
    const numValue = parseFloat(value);
    const min = dimension.nominal - dimension.toleranceMinus;
    const max = dimension.nominal + dimension.tolerancePlus;
    
    return numValue >= min && numValue <= max;
  };

  // Acciones del panel de inspección
  const handleBackToSetup = () => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'setup' });
  };
  
  const handleCompleteInspection = () => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'report' });
  };
  
  // CORRECCIÓN: Actualizar medición dimensional con el índice correcto para el step activo
  const handleDimensionInputChange = (e) => {
    if (currentDimension < dimensions?.length) {
      const dimCode = dimensions[currentDimension].code;
      
      // Calcular el índice correcto basado SOLO en el step actual
      const stepIndex = ['first', 'second', 'third', 'fourth', 'fifth'].indexOf(activeStepTab);
      const sampleCount = getSampleCount(sampleInfo);
      const actualIndex = (stepIndex * sampleCount) + (currentDimSample - 1);
      
      dispatch({
        type: 'UPDATE_DIMENSION_MEASUREMENT',
        payload: {
          dimension: dimCode,
          sampleIndex: actualIndex,
          value: e.target.value
        }
      });
    }
  };
  
  // Ir a la siguiente muestra dimensional
  const handleNextDimensionSample = () => {
    const inputValue = document.querySelector('#dimension-input')?.value;
    
    // Asegurar que el valor se guarde con el índice correcto
    if (currentDimension < dimensions?.length && inputValue) {
      const dimCode = dimensions[currentDimension].code;
      const stepIndex = ['first', 'second', 'third', 'fourth', 'fifth'].indexOf(activeStepTab);
      const sampleCount = getSampleCount(sampleInfo);
      const actualIndex = (stepIndex * sampleCount) + (currentDimSample - 1);
      
      // Guardar el valor actual primero
      dispatch({
        type: 'UPDATE_DIMENSION_MEASUREMENT',
        payload: {
          dimension: dimCode,
          sampleIndex: actualIndex,
          value: inputValue
        }
      });
    }
    
    // Luego avanzar a la siguiente muestra
    dispatch({
      type: 'NEXT_DIMENSION_SAMPLE',
      payload: { }  // No pasamos valor porque ya actualizamos la medición justo antes
    });
  };
  
  // Cambiar el paso de inspección
  const handleStepChange = (step) => {
    setActiveStepTab(step);
  };
  
  // Ver historial de dimensión
  const handleViewDimensionHistory = (dimIndex) => {
    dispatch({ 
      type: 'TOGGLE_DIMENSION_HISTORY',
      payload: dimIndex 
    });
  };
  
  // Seleccionar muestra dimensional específica
  const handleSelectDimensionSample = (dimIndex, sampleIndex) => {
    dispatch({ 
      type: 'SET_DIMENSION_SAMPLE', 
      payload: { 
        dimension: dimIndex, 
        sample: sampleIndex + 1 
      } 
    });
  };
  
  // Actualizar medición de revestimiento
  const handleCoatingInputChange = (value) => {
    dispatch({
      type: 'UPDATE_COATING_MEASUREMENT',
      payload: { 
        sampleIndex: currentCoatingSample - 1, 
        value: value 
      }
    });
  };
  
  // Ir a la siguiente muestra de revestimiento
  const handleNextCoatingSample = () => {
    const inputValue = document.querySelector('#local-coating-input')?.value;
    dispatch({
      type: 'NEXT_COATING_SAMPLE',
      payload: { value: inputValue }
    });
  };
  
  // Ir a la muestra anterior de revestimiento
  const handlePrevCoatingSample = () => {
    const inputValue = document.querySelector('#local-coating-input')?.value;
    dispatch({
      type: 'PREV_COATING_SAMPLE',
      payload: { value: inputValue }
    });
  };
  
  // Seleccionar muestra de revestimiento específica
  const handleSelectCoatingSample = (index) => {
    const currentValue = document.querySelector('#local-coating-input')?.value;
    
    if (currentValue) {
      dispatch({
        type: 'UPDATE_COATING_MEASUREMENT',
        payload: { 
          sampleIndex: currentCoatingSample - 1, 
          value: currentValue 
        }
      });
    }
    
    dispatch({
      type: 'SET_COATING_SAMPLE',
      payload: index + 1
    });
  };
  
  // Obtener estado visual de la muestra dimensional
  const getDimensionSampleStatus = (dimCode, sampleIndex) => {
    const value = dimensionMeasurements?.[dimCode]?.[sampleIndex];
    
    if (!value || value === '') return 'bg-gray-200'; // No rellenado aún
    
    // Verificar si está dentro de tolerancias
    const dimension = dimensions.find(d => d.code === dimCode);
    if (!dimension) return 'bg-gray-200';
    
    const numValue = parseFloat(value);
    const min = dimension.nominal - dimension.toleranceMinus;
    const max = dimension.nominal + dimension.tolerancePlus;
    
    return (numValue >= min && numValue <= max) ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
  };
  
  // Obtener estado visual de muestra de revestimiento
  const getCoatingSampleStatus = (sampleIndex) => {
    const localValue = localCoatingMeasurements?.[sampleIndex];
    
    // Si el valor no está rellenado, no está completo
    if (!localValue || localValue === '') 
      return sampleIndex + 1 === currentCoatingSample ? 'bg-blue-500 text-white' : 'bg-gray-200';
    
    // Si el valor es inválido, marcar como fallado
    if (coatingRequirements?.local && parseFloat(localValue) < coatingRequirements.local)
      return 'bg-red-500 text-white';
    
    // Todo bien
    return 'bg-green-500 text-white';
  };
  
  // Verificar si podemos ir al siguiente paso
  const isReadyForNextStep = () => {
    const sampleLetter = getSampleLetter(sampleInfo);
    const stepData = iso2859Table?.[sampleLetter]?.[inspectionStep];
    
    if (!stepData) return false;
    
    // Criterios para pasar al siguiente paso (simplificados)
    return true;
  };
  
  // Obtener siguiente paso
  const getNextStep = (currentStep) => {
    const steps = ['first', 'second', 'third', 'fourth', 'fifth'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      return steps[currentIndex + 1];
    }
    return null;
  };
  
  // Preparar datos para gráficos
  const getDimensionChartData = () => {
    const sampleCount = getSampleCount(sampleInfo);
    const chartData = [];
    
    for (let i = 0; i < sampleCount; i++) {
      const sampleData = { sample: i + 1 };
      
      dimensions?.forEach(dim => {
        if (dimensionMeasurements?.[dim.code]?.[i]) {
          sampleData[dim.code] = parseFloat(dimensionMeasurements[dim.code][i]);
        }
      });
      
      chartData.push(sampleData);
    }
    
    return chartData;
  };
  
  const getCoatingChartData = () => {
    return localCoatingMeasurements
      .filter(value => value !== '')
      .map((value, index) => ({
        reading: index + 1,
        thickness: parseFloat(value)
      }));
  };
  
  // Obtener total y progreso de muestras
  const getTotalRequiredSamples = () => {
    const sampleLetter = getSampleLetter(sampleInfo);
    const stepData = iso2859Table?.[sampleLetter]?.[inspectionStep];
    
    if (!stepData) return 0;
    return stepData.size * (dimensions?.length || 0);
  };
  
  const getInspectionProgress = () => {
    const totalRequired = getTotalRequiredSamples();
    const totalChecked = Object.values(totalSamplesChecked || {}).reduce((sum, count) => sum + count, 0);
    
    if (totalRequired === 0) return 0;
    return (totalChecked / totalRequired) * 100;
  };

  // Función para cambiar entre vista de gráficos (todas las dimensiones o individual)
  const handleToggleChartView = (mode) => {
    setChartViewMode(mode);
  };

  // Función para seleccionar dimensión específica para gráfico individual
  const handleSelectDimForChart = (dimCode) => {
    setSelectedDimForChart(dimCode);
  };

  // CORRECCIÓN: Obtener el índice de muestra correcto basado SOLO en el step activo actual
  const getCurrentSampleIndex = () => {
    const stepIndex = ['first', 'second', 'third', 'fourth', 'fifth'].indexOf(activeStepTab);
    const sampleCount = getSampleCount(sampleInfo);
    return (stepIndex * sampleCount) + (currentDimSample - 1);
  };

  // Obtener valor actual para la dimensión y muestra actuales
  const getCurrentDimensionValue = () => {
    if (!dimensions || currentDimension >= dimensions.length) return '';
    
    const dimCode = dimensions[currentDimension].code;
    const index = getCurrentSampleIndex();
    
    return dimensionMeasurements?.[dimCode]?.[index] || '';
  };
  
  // Cambiar la dimensión seleccionada para el historial
  const handleChangeHistoryDimension = (dimCode) => {
    setHistoryDimension(dimCode);
  };

  // Obtener descripción de la dimensión actual
  const getCurrentDimensionName = () => {
    if (!dimensions || currentDimension >= dimensions.length) return '';
    return dimensions[currentDimension]?.description || '';
  };

  // Obtener nominal de la dimensión actual
  const getCurrentDimensionNominal = () => {
    if (!dimensions || currentDimension >= dimensions.length) return 0;
    return dimensions[currentDimension]?.nominal || 0;
  };

  // Obtener tolerancia + de la dimensión actual
  const getCurrentDimensionTolerancePlus = () => {
    if (!dimensions || currentDimension >= dimensions.length) return 0;
    return dimensions[currentDimension]?.tolerancePlus || 0;
  };

  // Obtener tolerancia - de la dimensión actual
  const getCurrentDimensionToleranceMinus = () => {
    if (!dimensions || currentDimension >= dimensions.length) return 0;
    return dimensions[currentDimension]?.toleranceMinus || 0;
  };

  // Manejar cambio en conformidad visual
  const handleVisualConformityChange = (value) => {
    dispatch({
      type: 'SET_VISUAL_CONFORMITY',
      payload: value
    });
  };
  
  // Manejar cambio en notas visuales
  const handleNotesChange = (e) => {
    dispatch({
      type: 'SET_VISUAL_NOTES',
      payload: e.target.value
    });
  };
  
  // Simular captura de foto
  const handleCapturePhoto = () => {
    const placeholder = {
      id: Date.now(),
      src: "/api/placeholder/150/150",
      caption: `Photo ${(photos?.length || 0) + 1}`
    };
    
    dispatch({
      type: 'ADD_PHOTO',
      payload: placeholder
    });
  };
  
  // Simular subida de foto
  const handleUploadPhoto = () => {
    const placeholder = {
      id: Date.now(),
      src: "/api/placeholder/150/150",
      caption: `Uploaded ${(photos?.length || 0) + 1}`
    };
    
    dispatch({
      type: 'ADD_PHOTO',
      payload: placeholder
    });
  };

  return (
    <div>
      <div className="dashboard-card mb-4">
        <div className="card-header" style={{background: 'linear-gradient(to right, #5a67d8, #6875f5)'}}>
          <div className="flex justify-between items-center">
            <h3 className="card-title text-white">Inspection Overview</h3>
            <div>
              <span className="badge bg-blue-100 text-blue-800">
                Component: {componentName || componentCode || "Torque tube 140x100x3.5mm"}
              </span>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="dashboard-card bg-blue-50 mb-4">
            <div className="card-header" style={{background: 'linear-gradient(to right, #667eea, #764ba2)'}}>
              <h3 className="card-title text-white">Overall Status</h3>
            </div>
            <div className="card-body p-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-lg">Overall Status: </span>
                  <span className={`px-3 py-1 badge ${
                    inspectionStatus === 'pass' ? 'badge-success' : 
                    inspectionStatus === 'reject' ? 'badge-danger' : 
                    'badge-info'
                  }`}>
                    {inspectionStatus === 'pass' ? 'ACCEPTED' : 
                     inspectionStatus === 'reject' ? 'REJECTED' : 
                    'IN PROGRESS'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Current Step: </span>
                  <span className="font-bold">{inspectionStep.charAt(0).toUpperCase() + inspectionStep.slice(1)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <span className="font-medium">Total Non-conformities: </span>
                  <span className={totalNonConformities > 0 ? 'text-red-600 font-bold' : 'font-bold'}>
                    {totalNonConformities}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium">Sample Letter: </span>
                  <span className="font-bold">{getSampleLetter(sampleInfo)}</span>
                </div>
                
                <div>
                  <span className="font-medium">Samples Checked: </span>
                  <span className="font-bold">
                    {Object.values(totalSamplesChecked || {}).reduce((sum, count) => sum + count, 0)}
                  </span>
                  <span className="text-gray-500"> of </span>
                  <span className="font-bold">{getTotalRequiredSamples()}</span>
                </div>
                
                <div>
                  <span className="font-medium">Acceptance Number: </span>
                  <span className="font-bold">
                    {(iso2859Table?.[getSampleLetter(sampleInfo)]?.[inspectionStep]?.ac === '#' ? 
                      'N/A' : 
                      iso2859Table?.[getSampleLetter(sampleInfo)]?.[inspectionStep]?.ac)}
                  </span>
                  <span className="font-medium ml-2">Re: </span>
                  <span className="font-bold">{iso2859Table?.[getSampleLetter(sampleInfo)]?.[inspectionStep]?.re}</span>
                </div>
              </div>
              
              <div className="w-full bg-white rounded-full h-2.5 mt-3">
                <div 
                  className={`h-2.5 rounded-full ${
                    inspectionStatus === 'pass' ? 'bg-green-600' : 
                    inspectionStatus === 'reject' ? 'bg-red-600' : 
                    'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(100, getInspectionProgress())}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* SECCIÓN: Measurement Equipment */}
          <div className="dashboard-card mb-4">
            <div className="card-header" style={{background: 'linear-gradient(to right, #5a67d8, #6875f5)'}}>
              <h3 className="card-title text-white">Measurement Equipment</h3>
            </div>
            <div className="card-body">
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                {(measurementEquipment || []).map((equip, index) => (
                  <div key={index} style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '8px', 
                    background: '#f8fafc', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flex: '1'}}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tool type"
                        value={equip.toolType || ''}
                        onChange={(e) => dispatch({ 
                          type: 'UPDATE_EQUIPMENT', 
                          payload: { id: equip.id, field: 'toolType', value: e.target.value } 
                        })}
                      />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tool ID"
                        value={equip.toolId || ''}
                        onChange={(e) => dispatch({ 
                          type: 'UPDATE_EQUIPMENT', 
                          payload: { id: equip.id, field: 'toolId', value: e.target.value } 
                        })}
                      />
                    </div>
                    {index === 0 ? (
                      <button 
                        className="btn"
                        style={{
                          padding: '4px', 
                          borderRadius: '50%', 
                          background: '#ebf4ff', 
                          color: '#5a67d8'
                        }}
                        onClick={() => dispatch({ type: 'ADD_EQUIPMENT' })}
                      >
                        +
                      </button>
                    ) : (
                      <button 
                        className="btn"
                        style={{
                          padding: '4px', 
                          borderRadius: '50%', 
                          background: '#fee2e2', 
                          color: '#e53e3e'
                        }}
                        onClick={() => dispatch({ 
                          type: 'REMOVE_EQUIPMENT',
                          payload: equip.id
                        })}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#718096',
                padding: '8px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <Info size={12} style={{marginRight: '4px', color: '#a0aec0'}} />
                  Example: Coating Meter (Tool Type), CM-789 (Tool ID)
                </div>
              </div>
            </div>
          </div>
          
          {showStepNotification && (
            <div className="dashboard-card bg-yellow-50 border-yellow-200 mb-4">
              <div className="card-body p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Info size={16} className="mr-2 text-yellow-500" />
                    <div>{stepNotificationMessage}</div>
                  </div>
                  <button 
                    className="text-yellow-800 hover:text-yellow-900"
                    onClick={() => dispatch({ type: 'HIDE_STEP_NOTIFICATION' })}
                  >
                    <XCircle size={16} />
                  </button>
                </div>
                
                {isReadyForNextStep() && (
                  <div className="mt-2">
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        const nextStep = getNextStep(inspectionStep);
                        if (nextStep) {
                          handleStepChange(nextStep);
                        }
                      }}
                    >
                      Continue to Step {getNextStep(inspectionStep)?.charAt(0).toUpperCase() + getNextStep(inspectionStep)?.slice(1)}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* SECCIÓN: Technical Drawing (Ahora en horizontal) */}
          <div className="dashboard-card mb-4">
            <div className="card-header" style={{background: 'linear-gradient(to right, #667eea, #764ba2)'}}>
              <h3 className="card-title text-white">Technical Drawing</h3>
            </div>
            <div className="card-body p-0">
              <div className="aspect-video bg-gray-50 flex items-center justify-center">
                <img src="/api/placeholder/600/300" alt="Component technical drawing" className="max-h-full rounded" />
              </div>
            </div>
          </div>
          
          {/* SECCIÓN PRINCIPAL: Dimension Inspection (reestructurada) */}
          <div className="dashboard-card mb-4">
            <div className="card-header bg-indigo-500">
              <h3 className="card-title text-white">Dimension Inspection</h3>
            </div>
            <div className="card-body p-0"> {/* Sin padding para que las pestañas se ajusten correctamente */}
              {/* PESTAÑAS DE STEPS - Ahora dentro de la tarjeta principal */}
              <div className="flex justify-center mb-2 py-2" style={{borderBottom: '1px solid #e2e8f0'}}>
                {['first', 'second', 'third', 'fourth', 'fifth'].map((step) => {
                  const isActive = activeStepTab === step;
                  
                  return (
                    <button
                      key={step}
                      className={`mx-1 px-4 py-1 text-sm font-medium border border-gray-300 ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                      style={{borderRadius: '4px'}}
                      onClick={() => handleStepChange(step)}
                    >
                      Step {step.charAt(0).toUpperCase() + step.slice(1)}
                    </button>
                  );
                })}
              </div>
              
              {/* CURRENT DIMENSION - Destacada como minitarjeta */}
              <div className="p-4">
                {currentDimension < dimensions?.length && (
                  <div className="mb-5">
                    <div style={{display: 'flex', alignItems: 'flex-start', marginBottom: '8px'}}>
                      <div style={{
                        width: '36px', 
                        height: '36px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        background: 'rgb(76, 86, 199)', 
                        color: 'white', 
                        fontWeight: 'bold',
                        marginRight: '8px',
                        fontSize: '16px',
                        borderRadius: '4px'
                      }}>
                        {dimensions[currentDimension].code}
                      </div>
                      <div>
                        <div style={{fontWeight: 'bold', fontSize: '18px'}}>Current Dimension</div>
                        <div style={{fontSize: '16px'}}>{getCurrentDimensionName()}</div>
                      </div>
                    </div>
                    
                    <div style={{marginBottom: '12px', display: 'flex', flexWrap: 'wrap'}}>
                      <div style={{marginRight: '16px', marginBottom: '8px'}}>
                        <div style={{fontSize: '14px', color: '#666', marginBottom: '2px'}}>Nominal</div>
                        <div style={{fontWeight: 'bold', fontSize: '16px'}}>{getCurrentDimensionNominal()} mm</div>
                      </div>
                      
                      <div style={{marginRight: '16px', marginBottom: '8px'}}>
                        <div style={{fontSize: '14px', color: '#666', marginBottom: '2px'}}>Tolerance +</div>
                        <div style={{fontWeight: 'bold', fontSize: '16px', color: '#059669'}}>{getCurrentDimensionTolerancePlus()} mm</div>
                      </div>
                      
                      <div style={{marginBottom: '8px'}}>
                        <div style={{fontSize: '14px', color: '#666', marginBottom: '2px'}}>Tolerance -</div>
                        <div style={{fontWeight: 'bold', fontSize: '16px', color: '#DC2626'}}>{getCurrentDimensionToleranceMinus()} mm</div>
                      </div>
                    </div>
                    
                    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between'}}>
                      <div style={{textAlign: 'center', marginBottom: '8px', color: '#059669'}}>
                        <div style={{fontSize: '14px', color: '#666'}}>Maximum Allowed</div>
                        <div style={{fontWeight: 'bold'}}>{(getCurrentDimensionNominal() + getCurrentDimensionTolerancePlus())} mm</div>
                      </div>
                      
                      <div style={{textAlign: 'center', marginBottom: '8px', color: '#DC2626'}}>
                        <div style={{fontSize: '14px', color: '#666'}}>Minimum Allowed</div>
                        <div style={{fontWeight: 'bold'}}>{(getCurrentDimensionNominal() - getCurrentDimensionToleranceMinus())} mm</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* CONTENEDOR PRINCIPAL CON DIVISIÓN CLARA ENTRE STATUS E INPUT */}
                <div style={{display: 'flex', flexWrap: 'wrap'}}>
                  {/* DIMENSION STATUS */}
                  <div style={{flex: '1 1 50%', minWidth: '300px', paddingRight: '20px', borderRight: '1px solid #e5e7eb'}}>
                    <h4 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '12px'}}>Dimension Status</h4>
                    
                    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                      {dimensions?.map((dim, dimIndex) => {
                        const nonConformCount = dimensionNonConformities?.[dim.code] || 0;
                        const samplesChecked = totalSamplesChecked?.[dim.code] || 0;
                        const isComplete = completedDimensions?.[dim.code];
                        
                        // Determinar estado visual
                        let statusClass, statusText;
                        if (isComplete) {
                          statusClass = nonConformCount === 0 ? 'CONFORMING' : 'NON-CONFORMING';
                          statusText = nonConformCount === 0 ? 'CONFORMING' : 'NON-CONFORMING';
                        } else {
                          statusClass = 'IN PROGRESS';
                          statusText = 'IN PROGRESS';
                        }
                        
                        return (
                          <div key={dimIndex} style={{
                            padding: '12px', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '8px',
                            background: '#f9fafb'
                          }}>
                            <div style={{display: 'flex', alignItems: 'flex-start', marginBottom: '8px'}}>
                              <div style={{
                                width: '28px', 
                                height: '28px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                background: dimIndex === currentDimension ? 'rgb(76, 86, 199)' : '#e5e7eb', 
                                color: dimIndex === currentDimension ? 'white' : '#4b5563', 
                                fontWeight: 'bold',
                                marginRight: '12px',
                                fontSize: '14px',
                                borderRadius: '50%'
                              }}>
                                {dim.code}
                              </div>
                              
                              <div style={{flex: 1}}>
                                <div style={{fontWeight: 'bold'}}>{dim.description}</div>
                                <div style={{fontSize: '12px', color: '#6b7280'}}>
                                  {dim.nominal} mm ({dim.tolerancePlus > 0 ? '+' : ''}{dim.tolerancePlus}, 
                                  {dim.toleranceMinus > 0 ? '+' : ''}{dim.toleranceMinus})
                                </div>
                              </div>
                              
                              <div style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                borderRadius: '9999px',
                                color: statusClass === 'CONFORMING' ? '#059669' : 
                                      statusClass === 'NON-CONFORMING' ? '#DC2626' : '#3B82F6',
                                background: statusClass === 'CONFORMING' ? '#d1fae5' : 
                                           statusClass === 'NON-CONFORMING' ? '#fee2e2' : '#dbeafe'
                              }}>
                                {statusText}
                              </div>
                            </div>
                            
                            <div style={{
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              fontSize: '12px', 
                              color: '#6b7280'
                            }}>
                              <div>
                                Non-conformities: <span style={{
                                  color: nonConformCount > 0 ? '#DC2626' : 'inherit',
                                  fontWeight: nonConformCount > 0 ? 'bold' : 'normal'
                                }}>
                                  {nonConformCount}
                                </span>
                              </div>
                              <div>
                                Samples: {samplesChecked}/{getSampleCount(sampleInfo)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* DIMENSION INPUT */}
                  <div style={{flex: '1 1 50%', minWidth: '300px', paddingLeft: '20px'}}>
                    <h4 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '12px'}}>Dimension Input</h4>
                    
                    {/* Input de medición */}
                    <div style={{marginBottom: '20px'}}>
                      <div style={{
                        fontSize: '14px', 
                        fontWeight: 'bold', 
                        marginBottom: '8px',
                        textAlign: 'right'
                      }}>
                        Sample {currentDimSample} of {getSampleCount(sampleInfo)}
                      </div>
                      
                      <div style={{display: 'flex', alignItems: 'center'}}>
                        <button style={{
                          padding: '8px',
                          background: currentDimSample > 1 ? '#dbeafe' : '#f3f4f6',
                          color: currentDimSample > 1 ? '#3B82F6' : '#9ca3af',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          marginRight: '8px',
                          cursor: currentDimSample > 1 ? 'pointer' : 'not-allowed'
                        }}
                        onClick={() => currentDimSample > 1 && dispatch({ type: 'PREV_DIMENSION_SAMPLE' })}
                        disabled={currentDimSample <= 1}
                        >
                          ←
                        </button>
                        
                        <div style={{flex: 1, display: 'flex'}}>
                          <input 
                            id="dimension-input"
                            type="number" 
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              border: '1px solid #d1d5db',
                              borderRight: 'none',
                              borderRadius: '4px 0 0 4px',
                              fontSize: '14px'
                            }}
                            placeholder="Enter measurement"
                            value={getCurrentDimensionValue()}
                            onChange={handleDimensionInputChange}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleNextDimensionSample();
                              }
                            }}
                            step="0.1"
                          />
                          <button 
                            style={{
                              background: '#4F46E5',
                              color: 'white',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '0 4px 4px 0',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                            onClick={handleNextDimensionSample}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Measurement Records */}
                    <div style={{marginBottom: '20px'}}>
                      <h4 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '12px'}}>Measurement Records</h4>
                      
                      {/* Botones para seleccionar dimensión */}
                      <div style={{display: 'flex', marginBottom: '12px', overflowX: 'auto', gap: '4px'}}>
                        {dimensions?.map((dim) => (
                          <button
                            key={dim.code}
                            style={{
                              padding: '4px 8px',
                              fontSize: '14px',
                              fontWeight: 'medium',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              background: historyDimension === dim.code ? '#4F46E5' : '#f9fafb',
                              color: historyDimension === dim.code ? 'white' : '#374151'
                            }}
                            onClick={() => handleChangeHistoryDimension(dim.code)}
                          >
                            Dimension {dim.code}
                          </button>
                        ))}
                      </div>
                      
                      {/* Tabla de historial */}
                      {dimensions && dimensions.length > 0 && (
                        <div style={{overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '4px'}}>
                          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
                            <thead>
                              <tr style={{background: '#f9fafb', borderBottom: '1px solid #e5e7eb'}}>
                                <th style={{padding: '8px 12px', textAlign: 'left', fontWeight: 'medium'}}>
                                  Sample
                                </th>
                                {['first', 'second', 'third', 'fourth', 'fifth'].map((step) => (
                                  <th key={step} style={{padding: '8px 12px', textAlign: 'left', fontWeight: 'medium'}}>
                                    Step {step.charAt(0).toUpperCase() + step.slice(1)}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {getDimensionMeasurementHistory(historyDimension).map((row, index) => {
                                const dimension = dimensions.find(d => d.code === historyDimension);
                                
                                return (
                                  <tr key={index} style={{borderBottom: index < (getSampleCount(sampleInfo) - 1) ? '1px solid #e5e7eb' : 'none'}}>
                                    <td style={{padding: '8px 12px', fontWeight: 'medium'}}>
                                      {row.sample}
                                    </td>
                                    {['first', 'second', 'third', 'fourth', 'fifth'].map((step) => {
                                      const value = row[step];
                                      const isValid = isValueWithinTolerance(value, dimension);
                                      let bgColor, textColor;
                                      
                                      if (value) {
                                        if (isValid) {
                                          bgColor = '#ecfdf5';
                                          textColor = '#065f46';
                                        } else {
                                          bgColor = '#fee2e2';
                                          textColor = '#b91c1c';
                                        }
                                      } else {
                                        bgColor = '';
                                        textColor = '';
                                      }
                                      
                                      // Determinar si esta es la celda actual
                                      const isActiveCell = activeStepTab === step && 
                                                          historyDimension === dimensions[currentDimension]?.code && 
                                                          row.sample === currentDimSample;
                                      
                                      return (
                                        <td 
                                          key={step} 
                                          style={{
                                            padding: '8px 12px',
                                            background: bgColor,
                                            color: textColor,
                                            fontWeight: 'medium',
                                            border: isActiveCell ? '2px solid #3B82F6' : 'none'
                                          }}
                                        >
                                          {value || '—'}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* SECCIÓN: Dimensional Measurements Chart */}
          <div className="dashboard-card mt-4">
            <div className="card-header" style={{background: 'linear-gradient(to right, #667eea, #764ba2)'}}>
              <h3 className="card-title text-white">Dimensional Measurements Chart</h3>
            </div>
            <div className="card-body">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  {dimensions?.map((dim, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-1"
                        style={{ backgroundColor: dimensionColors[dim.code] }}
                      ></div>
                      <span className="text-sm font-medium">
                        {dim.code}: {dim.description}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    className={`px-3 py-1 text-sm rounded flex items-center ${chartViewMode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    onClick={() => handleToggleChartView('all')}
                  >
                    <List size={14} className="mr-1" /> All Dimensions
                  </button>
                  <button 
                    className={`px-3 py-1 text-sm rounded flex items-center ${chartViewMode === 'individual' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    onClick={() => handleToggleChartView('individual')}
                  >
                    <BarChart2 size={14} className="mr-1" /> Individual
                  </button>
                </div>
              </div>
              
              {/* Selector de dimensión individual si está en modo individual */}
              {chartViewMode === 'individual' && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {dimensions?.map((dim) => (
                      <button
                        key={dim.code}
                        className={`px-3 py-1 text-sm rounded ${selectedDimForChart === dim.code ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        onClick={() => handleSelectDimForChart(dim.code)}
                      >
                        Dimension {dim.code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Vista de gráfico */}
              <div className="chart-container" style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getDimensionChartData()}
                    margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="sample" 
                      label={{ value: 'Sample', position: 'insideBottom', offset: -5 }} 
                    />
                    <YAxis 
                      label={{ value: 'Value', angle: -90, position: 'insideLeft', offset: -5 }} 
                      domain={chartViewMode === 'individual' ? ['auto', 'auto'] : [0, 'auto']}
                    />
                    <Tooltip />
                    <Legend />
                    
                    {/* Contenido del gráfico dependiendo del modo seleccionado */}
                    {chartViewMode === 'all' ? 
                      // Mostrar todas las dimensiones
                      dimensions?.map(dim => (
                        <Line
                          key={dim.code}
                          type="monotone"
                          dataKey={dim.code}
                          name={`${dim.code}: ${dim.description}`}
                          stroke={dimensionColors[dim.code]}
                          activeDot={{ r: 8 }}
                        />
                      )) : 
                      // Mostrar solo la dimensión seleccionada
                      <Line
                        type="monotone"
                        dataKey={selectedDimForChart}
                        name={`${selectedDimForChart}: ${dimensions.find(d => d.code === selectedDimForChart)?.description}`}
                        stroke={dimensionColors[selectedDimForChart]}
                        activeDot={{ r: 8 }}
                      />
                    }
                    
                    {/* Líneas de referencia */}
                    {chartViewMode === 'individual' && dimensions && dimensions.length > 0 && (
                      <>
                        <ReferenceLine
                          y={dimensions.find(d => d.code === selectedDimForChart)?.nominal}
                          stroke={dimensionColors[selectedDimForChart]}
                          strokeDasharray="3 3"
                          label={{ 
                            value: `Nominal: ${dimensions.find(d => d.code === selectedDimForChart)?.nominal}`, 
                            position: 'right' 
                          }}
                        />
                        <ReferenceLine
                          y={dimensions.find(d => d.code === selectedDimForChart)?.nominal + 
                             dimensions.find(d => d.code === selectedDimForChart)?.tolerancePlus}
                          stroke="red"
                          strokeDasharray="3 3"
                          label={{ 
                            value: `Upper: ${dimensions.find(d => d.code === selectedDimForChart)?.nominal + 
                                    dimensions.find(d => d.code === selectedDimForChart)?.tolerancePlus}`, 
                            position: 'right' 
                          }}
                        />
                        <ReferenceLine
                          y={dimensions.find(d => d.code === selectedDimForChart)?.nominal - 
                             dimensions.find(d => d.code === selectedDimForChart)?.toleranceMinus}
                          stroke="red"
                          strokeDasharray="3 3"
                          label={{ 
                            value: `Lower: ${dimensions.find(d => d.code === selectedDimForChart)?.nominal - 
                                    dimensions.find(d => d.code === selectedDimForChart)?.toleranceMinus}`, 
                            position: 'right' 
                          }}
                        />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* SECCIÓN: Coating Measurement */}
          <div className="dashboard-card mt-4">
            <div className="card-header" style={{background: 'linear-gradient(to right, #5a67d8, #6875f5)'}}>
              <h3 className="card-title text-white">Coating Measurement</h3>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <span className="font-medium mr-2">Mean Coating (Auto-calculated):</span>
                  <span className="font-bold">{meanCoating || '-'} µm</span>
                  <div className="ml-2 badge badge-info flex items-center">
                    <Info size={14} className="mr-1" />
                    Based on local measurements
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Minimum required: {coatingRequirements?.mean || '-'} µm
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                <button 
                  className={`btn ${currentCoatingSample > 1 ? 'btn-secondary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  onClick={handlePrevCoatingSample}
                  disabled={currentCoatingSample <= 1}
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="flex-1">
                  <label className="form-label">
                    Local Coating - Sample {currentCoatingSample} of {getSampleCount(sampleInfo)}
                  </label>
                  <div className="flex">
                    <input 
                      id="local-coating-input"
                      type="number" 
                      className="form-control rounded-r-none" 
                      placeholder="Enter local coating measurement"
                      value={localCoatingMeasurements?.[currentCoatingSample - 1] || ''}
                      onChange={(e) => handleCoatingInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleNextCoatingSample();
                        }
                      }}
                      step="0.1"
                      min="0"
                    />
                    <button 
                      className="btn btn-primary rounded-l-none"
                      onClick={handleNextCoatingSample}
                      disabled={currentCoatingSample >= getSampleCount(sampleInfo)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="form-label">Sample Progress</label>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: getSampleCount(sampleInfo) }).map((_, index) => {
                    const localValue = localCoatingMeasurements?.[index];
                    
                    return (
                      <button
                        key={index}
                        className={`p-2 rounded text-xs flex flex-col items-center ${getCoatingSampleStatus(index)} 
                          ${index + 1 === currentCoatingSample ? 'ring-2 ring-blue-400' : ''}`}
                        onClick={() => handleSelectCoatingSample(index)}
                      >
                        <span className="font-bold">{index + 1}</span>
                        {localValue && (
                          <span className="text-xs">
                            {localValue}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {coatingStats?.readings > 0 && (
                <>
                  <div className="mt-4">
                    <label className="form-label">Coating Statistics</label>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border p-1 text-left"># Readings</th>
                            <th className="border p-1 text-left">Mean</th>
                            <th className="border p-1 text-left">Maximum</th>
                            <th className="border p-1 text-left">Minimum</th>
                            <th className="border p-1 text-left">Range</th>
                            <th className="border p-1 text-left">Std Deviation</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border p-1">{coatingStats.readings}</td>
                            <td className="border p-1">{coatingStats.mean} µm</td>
                            <td className="border p-1">{coatingStats.maximum} µm</td>
                            <td className="border p-1">{coatingStats.minimum} µm</td>
                            <td className="border p-1">{coatingStats.range} µm</td>
                            <td className="border p-1">{coatingStats.stdDeviation} µm</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="form-label">Coating Thickness Chart</label>
                    <div className="chart-container" style={{ height: "200px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={getCoatingChartData()}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="reading" 
                            label={{ value: 'Reading #', position: 'insideBottom', offset: -5 }} 
                          />
                          <YAxis
                            label={{ value: 'Thickness (μm)', angle: -90, position: 'insideLeft' }}
                            domain={['auto', 'auto']}
                          />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="thickness"
                            stroke="#0047AB"
                            activeDot={{ r: 8 }}
                            strokeWidth={2}
                          />
                          <ReferenceLine y={coatingRequirements?.local || 0} stroke="red" strokeDasharray="3 3" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* SECCIÓN: Visual Inspection */}
          <div className="dashboard-card mt-4">
            <div className="card-header" style={{background: 'linear-gradient(to right, #667eea, #764ba2)'}}>
              <h3 className="card-title text-white">Visual Inspection</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Visual Conformity</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="visual" 
                      className="mr-2" 
                      checked={visualConformity === 'conforming'} 
                      onChange={() => handleVisualConformityChange('conforming')}
                    />
                    Conforming
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="visual" 
                      className="mr-2"
                      checked={visualConformity === 'non-conforming'} 
                      onChange={() => handleVisualConformityChange('non-conforming')}
                    />
                    Non-conforming
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Notes/Observations</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  placeholder="Enter any notes or observations"
                  value={visualNotes || ''}
                  onChange={handleNotesChange}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label className="form-label">Inspection Photos</label>
                <div className="flex gap-2 mb-3">
                  <button className="btn btn-secondary" onClick={handleCapturePhoto}>
                    <Camera size={16} className="mr-1" /> Capture Photo
                  </button>
                  <button className="btn btn-secondary" onClick={handleUploadPhoto}>
                    <Upload size={16} className="mr-1" /> Upload Photo
                  </button>
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {(photos?.length > 0) ? 
                    photos.map((photo, index) => (
                      <div key={index} className="border rounded overflow-hidden">
                        <img src={photo.src} alt={photo.caption} className="w-full" />
                      </div>
                    )) : 
                    <>
                      <div className="border rounded overflow-hidden">
                        <img src="/api/placeholder/150/150" alt="Inspection photo 1" className="w-full" />
                      </div>
                      <div className="border rounded overflow-hidden">
                        <img src="/api/placeholder/150/150" alt="Inspection photo 2" className="w-full" />
                      </div>
                    </>
                  }
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            <button 
              className="btn btn-secondary"
              onClick={handleBackToSetup}
            >
              <ArrowLeft size={16} className="mr-1" /> Back to Setup
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleCompleteInspection}
            >
              Complete Inspection <CheckCircle size={16} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionPanelDashboard;