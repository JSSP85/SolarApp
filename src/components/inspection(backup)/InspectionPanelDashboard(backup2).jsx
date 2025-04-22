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
    measurementEquipment
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
  
  // Actualizar medición dimensional actual
  const handleDimensionInputChange = (e) => {
    if (currentDimension < dimensions?.length) {
      const dimCode = dimensions[currentDimension].code;
      
      // Calcular el índice correcto basado en el step actual
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
    dispatch({
      type: 'NEXT_DIMENSION_SAMPLE',
      payload: { value: inputValue }
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

  // Obtener el índice de muestra correcto basado en el step actual
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
          
          {/* Pestañas de pasos - Rediseñadas */}
          <div className="flex justify-center mb-4">
            <div className="flex w-full max-w-3xl bg-gray-100 rounded-lg p-1">
              {['first', 'second', 'third', 'fourth', 'fifth'].map((step) => {
                const isActive = activeStepTab === step;
                
                return (
                  <button
                    key={step}
                    className={`flex-1 py-2 text-center rounded-md font-medium transition-all duration-200 text-base ${
                      isActive 
                        ? 'bg-white shadow-sm text-blue-700' 
                        : 'hover:bg-white/50 text-gray-700'
                    }`}
                    style={{
                      background: isActive ? 'linear-gradient(to right, #f0f4ff, #ffffff)' : '',
                      boxShadow: isActive ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                      minWidth: '120px'
                    }}
                    onClick={() => handleStepChange(step)}
                  >
                    Step {step.charAt(0).toUpperCase() + step.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* SECCIÓN: Dimension Input y Status con Current Dimension incorporado */}
          <div className="dashboard-card mb-4">
            <div className="card-header" style={{background: 'linear-gradient(to right, #5a67d8, #6875f5)'}}>
              <h3 className="card-title text-white">Dimension Inspection</h3>
            </div>
            <div className="card-body p-4">
              {/* Current Dimension como encabezado central */}
              {currentDimension < (dimensions?.length || 0) && (
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm border border-blue-100 text-center w-full">
                    <div className="flex items-center justify-center mb-3">
                      <span className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-xl font-bold mr-5">
                        {dimensions[currentDimension].code}
                      </span>
                      <h3 className="text-2xl font-semibold text-blue-900">
                        Current Dimension
                      </h3>
                    </div>
                    
                    <div className="flex justify-center mb-3">
                      <div className="text-center px-6 py-2 bg-white rounded-lg shadow-inner border border-blue-50">
                        <span className="text-lg font-bold text-blue-800">
                          {dimensions[currentDimension].description}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-center items-center space-x-8 text-lg mb-4">
                      <div className="text-center bg-blue-100 p-3 rounded-lg border border-blue-200">
                        <div className="text-sm text-gray-600 mb-1">Nominal</div>
                        <div className="font-bold text-blue-800 text-xl">{dimensions[currentDimension].nominal} mm</div>
                      </div>
                      
                      <div className="text-center bg-green-100 p-3 rounded-lg border border-green-200">
                        <div className="text-sm text-gray-600 mb-1">Tolerance +</div>
                        <div className="font-bold text-green-700">{dimensions[currentDimension].tolerancePlus} mm</div>
                      </div>
                      
                      <div className="text-center bg-red-100 p-3 rounded-lg border border-red-200">
                        <div className="text-sm text-gray-600 mb-1">Tolerance -</div>
                        <div className="font-bold text-red-700">{dimensions[currentDimension].toleranceMinus} mm</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                      <div className="text-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <div className="text-sm text-gray-600 mb-1">Maximum Allowed</div>
                        <div className="font-bold text-green-600 text-lg">
                          {(dimensions[currentDimension].nominal + dimensions[currentDimension].tolerancePlus)} mm
                        </div>
                      </div>
                      
                      <div className="text-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <div className="text-sm text-gray-600 mb-1">Minimum Allowed</div>
                        <div className="font-bold text-red-600 text-lg">
                          {(dimensions[currentDimension].nominal - dimensions[currentDimension].toleranceMinus)} mm
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Layout de dos columnas verticales */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* COLUMNA IZQUIERDA: Dimension Status */}
                <div className="md:w-1/2">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Dimension Status</h4>
                  <div className="space-y-2">
                    {dimensions?.map((dim, dimIndex) => {
                      const nonConformCount = dimensionNonConformities?.[dim.code] || 0;
                      const samplesChecked = totalSamplesChecked?.[dim.code] || 0;
                      const isComplete = completedDimensions?.[dim.code];
                      
                      return (
                        <div key={dimIndex} className="dashboard-card border border-gray-200">
                          <div className="card-body p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <button 
                                  className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 
                                    ${dimIndex === currentDimension ? 'bg-blue-500 text-white' : 
                                      isComplete && nonConformCount === 0 ? 'bg-green-500 text-white' : 
                                      isComplete && nonConformCount > 0 ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                                  onClick={() => handleViewDimensionHistory(dimIndex)}
                                >
                                  {dim.code}
                                </button>
                                <div>
                                  <div className="font-medium">{dim.description}</div>
                                  <div className="text-xs text-gray-600">
                                    {dim.nominal} mm ({dim.tolerancePlus > 0 ? '+' : ''}{dim.tolerancePlus}, 
                                    {dim.toleranceMinus > 0 ? '+' : ''}{dim.toleranceMinus})
                                  </div>
                                </div>
                              </div>
                              <div>
                                {isComplete ? (
                                  nonConformCount === 0 ? (
                                    <span className="badge badge-success">CONFORMING</span>
                                  ) : (
                                    <span className="badge badge-danger">NON-CONFORMING</span>
                                  )
                                ) : (
                                  <span className="badge badge-info">IN PROGRESS</span>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
                              <div>
                                Non-conformities: <span className={nonConformCount > 0 ? 'text-red-600 font-bold' : ''}>
                                  {nonConformCount}
                                </span>
                              </div>
                              <div>
                                Samples: {samplesChecked}/{getSampleCount(sampleInfo)}
                              </div>
                            </div>
                            
                            {selectedHistoryDim === dimIndex && (
                              <div className="mt-3 pt-2 border-t border-gray-200">
                                <div className="flex flex-wrap gap-2">
                                  {Array.from({ length: getSampleCount(sampleInfo) }).map((_, index) => {
                                    const value = dimensionMeasurements?.[dim.code]?.[index];
                                    
                                    return (
                                      <button
                                        key={index}
                                        className={`p-1 rounded text-xs flex flex-col items-center ${getDimensionSampleStatus(dim.code, index)}`}
                                        onClick={() => handleSelectDimensionSample(dimIndex, index)}
                                      >
                                        <span className="font-bold">{index + 1}</span>
                                        <span className="text-xs">{value || "-"}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* COLUMNA DERECHA: Dimension Input */}
                <div className="md:w-1/2">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Dimension Input</h4>
                  
                  {/* Measurement input section */}
                  <div className="flex items-center space-x-2 mb-6">
                    <button 
                      className={`btn ${currentDimSample > 1 ? 'btn-secondary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                      onClick={() => currentDimSample > 1 && dispatch({ type: 'PREV_DIMENSION_SAMPLE' })}
                      disabled={currentDimSample <= 1}
                    >
                      <ArrowLeft size={16} />
                    </button>
                    
                    <div className="flex-1">
                      <label className="form-label">
                        Sample {currentDimSample} of {getSampleCount(sampleInfo)}
                      </label>
                      <div className="flex">
                        <input 
                          id="dimension-input"
                          type="number" 
                          className="form-control rounded-r-none" 
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
                          className="btn btn-primary rounded-l-none"
                          onClick={handleNextDimensionSample}
                          disabled={currentDimension >= (dimensions?.length || 0)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botones para seleccionar cota para el historial */}
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Measurement Records</h4>
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {dimensions?.map((dim) => (
                        <button
                          key={dim.code}
                          className={`px-4 py-2 rounded-md font-medium ${
                            historyDimension === dim.code
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          onClick={() => handleChangeHistoryDimension(dim.code)}
                        >
                          Dimension {dim.code}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Tabla de registro de medidas para la dimensión seleccionada */}
                  {dimensions && dimensions.length > 0 && (
                    <div className="mb-6">
                      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sample
                              </th>
                              {['first', 'second', 'third', 'fourth', 'fifth'].map((step) => (
                                <th key={step} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Step {step.charAt(0).toUpperCase() + step.slice(1)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {getDimensionMeasurementHistory(historyDimension).map((row, index) => {
                              const dimension = dimensions.find(d => d.code === historyDimension);
                              
                              return (
                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {row.sample}
                                  </td>
                                  {['first', 'second', 'third', 'fourth', 'fifth'].map((step) => {
                                    const value = row[step];
                                    const isValid = isValueWithinTolerance(value, dimension);
                                    const bgColor = value 
                                      ? (isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')
                                      : '';
                                    
                                    // Determinar si esta es la celda actual basándose en el step activo, dimensión y muestra
                                    const isActiveCell = activeStepTab === step && 
                                                        historyDimension === dimensions[currentDimension]?.code && 
                                                        row.sample === currentDimSample;
                                    
                                    return (
                                      <td 
                                        key={step} 
                                        className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${bgColor} ${isActiveCell ? 'ring-2 ring-blue-500' : ''}`}
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
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* SECCIÓN: Dimensional Measurements Chart (con botones reubicados) */}
          <div className="dashboard-card">
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
                
                {/* Botones de vista de gráfico reubicados aquí */}
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
              
              {/* Vista de todas las dimensiones */}
              {chartViewMode === 'all' && (
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
                      />
                      <Tooltip />
                      <Legend />
                      
                      {dimensions?.map(dim => (
                        <Line
                          key={dim.code}
                          type="monotone"
                          dataKey={dim.code}
                          name={`${dim.code}: ${dim.description}`}
                          stroke={dimensionColors[dim.code]}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                      
                      {dimensions?.map(dim => (
                        <ReferenceLine
                          key={`ref-${dim.code}`}
                          y={dim.nominal}
                          stroke={dimensionColors[dim.code]}
                          strokeDasharray="3 3"
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {/* Vista de dimensión individual */}
              {chartViewMode === 'individual' && dimensions && dimensions.length > 0 && (
                <div>
                  {/* Gráfico individual */}
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
                          domain={['auto', 'auto']}
                          label={{ value: 'Value', angle: -90, position: 'insideLeft', offset: -5 }}
                        />
                        <Tooltip />
                        <Legend />
                        
                        <Line
                          type="monotone"
                          dataKey={selectedDimForChart}
                          name={`${selectedDimForChart}: ${dimensions.find(d => d.code === selectedDimForChart)?.description}`}
                          stroke={dimensionColors[selectedDimForChart]}
                          activeDot={{ r: 8 }}
                        />
                        
                        {/* Línea de valor nominal */}
                        <ReferenceLine
                          y={dimensions.find(d => d.code === selectedDimForChart)?.nominal}
                          stroke={dimensionColors[selectedDimForChart]}
                          strokeDasharray="3 3"
                          label={{ 
                            value: `Nominal: ${dimensions.find(d => d.code === selectedDimForChart)?.nominal}`, 
                            position: 'right' 
                          }}
                        />
                        
                        {/* Línea de tolerancia superior */}
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
                        
                        {/* Línea de tolerancia inferior */}
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
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              
              {/* Minigráficos para cada dimensión en modo individual alternativo */}
              {chartViewMode === 'individual' && dimensions && dimensions.length > 0 && selectedDimForChart === 'all' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {dimensions.map(dim => (
                    <div key={dim.code} className="border rounded p-2">
                      <h4 className="text-sm font-medium mb-1">{dim.code}: {dim.description}</h4>
                      <div style={{ height: "180px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={getDimensionChartData()}
                            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="sample" />
                            <YAxis domain={['auto', 'auto']} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey={dim.code}
                              stroke={dimensionColors[dim.code]}
                              dot={{ r: 3 }}
                            />
                            <ReferenceLine y={dim.nominal} stroke="blue" strokeDasharray="3 3" />
                            <ReferenceLine y={dim.nominal + dim.tolerancePlus} stroke="red" strokeDasharray="3 3" />
                            <ReferenceLine y={dim.nominal - dim.toleranceMinus} stroke="red" strokeDasharray="3 3" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th># Readings</th>
                            <th>Mean</th>
                            <th>Maximum</th>
                            <th>Minimum</th>
                            <th>Range</th>
                            <th>Std Deviation</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{coatingStats.readings}</td>
                            <td>{coatingStats.mean} µm</td>
                            <td>{coatingStats.maximum} µm</td>
                            <td>{coatingStats.minimum} µm</td>
                            <td>{coatingStats.range} µm</td>
                            <td>{coatingStats.stdDeviation} µm</td>
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
                      onChange={() => dispatch({ 
                        type: 'SET_VISUAL_CONFORMITY', 
                        payload: 'conforming' 
                      })}
                    />
                    Conforming
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="visual" 
                      className="mr-2"
                      checked={visualConformity === 'non-conforming'} 
                      onChange={() => dispatch({ 
                        type: 'SET_VISUAL_CONFORMITY', 
                        payload: 'non-conforming' 
                      })}
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
                  onChange={(e) => dispatch({
                    type: 'SET_VISUAL_NOTES', 
                    payload: e.target.value
                  })}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label className="form-label">Inspection Photos</label>
                <div className="flex gap-2 mb-3">
                  <button className="btn btn-secondary">
                    <Camera size={16} className="mr-1" /> Capture Photo
                  </button>
                  <button className="btn btn-secondary">
                    <Upload size={16} className="mr-1" /> Upload Photo
                  </button>
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  <div className="border rounded overflow-hidden">
                    <img src="/api/placeholder/150/150" alt="Inspection photo 1" className="w-full" />
                  </div>
                  <div className="border rounded overflow-hidden">
                    <img src="/api/placeholder/150/150" alt="Inspection photo 2" className="w-full" />
                  </div>
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