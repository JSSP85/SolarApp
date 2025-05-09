// src/components/inspection/DimensionMeasurementPanel.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, FileText, PenTool, Table, Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { getSampleCount, getSampleLetter } from '../../utils/samplePlanHelper';
import VoiceRecognitionButton from '../common/VoiceRecognitionButton';


// Componente para la sección de Overall Status - ahora en inglés
const OverallStatusSection = () => {
  const { state } = useInspection();
  const { 
    inspectionStatus, 
    inspectionStep, 
    totalNonConformities, 
    totalSamplesChecked, 
    dimensions, 
    sampleInfo, 
    dimensionMeasurements
  } = state;

  // Obtener el total de muestras requeridas - VERSIÓN CORREGIDA
  const getTotalRequiredSamplesForAllSteps = () => {
    const sampleCount = getSampleCount(sampleInfo);
    
    // Si hay dimensiones, multiplicar por el número de dimensiones
    if (dimensions && dimensions.length > 0) {
      // Calcular correctamente el total basado en el número real de muestras
      const result = dimensions.length * sampleCount;
      console.log("Cálculo correcto:", dimensions.length, "dimensiones *", sampleCount, "muestras =", result);
      return result;
    }
    
    // En caso de no tener datos, devolver 0
    return 0;
  };
  
  // Cálculo correcto para la barra de progreso
  const getInspectionProgress = () => {
    // Contar mediciones realizadas (no vacías)
    let totalMeasurementsTaken = 0;
    
    // Buscar solo en las dimensiones existentes
    if (dimensions && dimensions.length > 0 && dimensionMeasurements) {
      dimensions.forEach(dim => {
        if (dimensionMeasurements[dim.code]) {
          dimensionMeasurements[dim.code].forEach(value => {
            if (value !== '' && value !== null && value !== undefined) {
              totalMeasurementsTaken++;
            }
          });
        }
      });
    }
    
    // Obtener el total requerido - usamos la función corregida
    const totalRequired = getTotalRequiredSamplesForAllSteps();
    
    console.log("DEPURACIÓN BARRA PROGRESO:");
    console.log("- Medidas tomadas:", totalMeasurementsTaken);
    console.log("- Total requerido:", totalRequired);
    
    // Evitar división por cero
    if (totalRequired <= 0) return 0;
    
    // Calcular porcentaje
    const percentage = (totalMeasurementsTaken / totalRequired) * 100;
    console.log("- Porcentaje calculado:", percentage.toFixed(2) + "%");
    
    return percentage;
  };
  
  // Obtener valores de aceptación y rechazo con texto descriptivo
  const getAcceptanceInfo = () => {
    // Verificación de datos
    if (!sampleInfo || !inspectionStep) {
      console.log("Datos insuficientes para criterio de aceptación");
      return { minText: "0", maxText: "0" };
    }
    
    // Obtener la letra de muestra directamente
    let sampleLetter = getSampleLetter(sampleInfo);
    
    // Para depuración
    console.log("Letra de muestra:", sampleLetter);
    console.log("Step actual:", inspectionStep);
    
    // Valores por defecto
    let minText = "0";
    let maxText = "2";
    
    // Utilizamos valores hardcodeados para las letras de muestra más comunes
    // Esto es una solución temporal mientras se resuelve el acceso a la tabla completa
    if (sampleLetter === "G") {
      if (inspectionStep === "first") minText = "#";
      else if (inspectionStep === "second") minText = "0";
      else if (inspectionStep === "third") minText = "0";
      else if (inspectionStep === "fourth") minText = "0";
      else if (inspectionStep === "fifth") minText = "1";
      
      maxText = "2"; // Valor de rechazo para letra G
    } else if (sampleLetter === "H") {
      if (inspectionStep === "first") minText = "#";
      else if (inspectionStep === "second") minText = "0";
      else if (inspectionStep === "third") minText = "0";
      else if (inspectionStep === "fourth") minText = "1";
      else if (inspectionStep === "fifth") minText = "3";
      
      maxText = inspectionStep === "second" || inspectionStep === "third" ? "3" : "4";
    }
    
    return { minText, maxText };
  };

  const { minText, maxText } = getAcceptanceInfo();
  const progressPercentage = getInspectionProgress();
  const progressValue = Math.round(progressPercentage);

  // Total de muestras completadas
  const completedSamplesCount = dimensions && dimensionMeasurements ? 
    dimensions.reduce((count, dim) => {
      if (dimensionMeasurements[dim.code]) {
        return count + dimensionMeasurements[dim.code].filter(v => v !== '' && v !== null && v !== undefined).length;
      }
      return count;
    }, 0) : 0;

  return (
    <div style={{
      marginBottom: '1rem',
      borderRadius: '0.375rem',
      overflow: 'hidden'
    }}>
      <h3 style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.125rem',
        fontWeight: '600',
        marginBottom: '1rem',
        paddingBottom: '0.625rem',
        borderBottom: '1px solid #e5e7eb',
        color: '#3D4A5C'
      }}>
        <Activity size={18} style={{ marginRight: '0.5rem' }} /> 
        Overall Inspection Status
      </h3>
      
      {/* Diseño mejorado para Overall Status */}
      <div style={{
        backgroundColor: '#EBF8FF',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '1rem' }}>
          {/* Cabecera de estado general con progreso */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.75rem',
                backgroundColor: inspectionStatus === 'pass' ? '#D1FAE5' : 
                                inspectionStatus === 'reject' ? '#FEE2E2' : 
                                '#DBEAFE',
                color: inspectionStatus === 'pass' ? '#059669' : 
                      inspectionStatus === 'reject' ? '#DC2626' : 
                      '#3B82F6'
              }}>
                {inspectionStatus === 'pass' && <CheckCircle size={20} />}
                {inspectionStatus === 'reject' && <AlertTriangle size={20} />}
                {inspectionStatus === 'in-progress' && <Activity size={20} />}
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Current Status</div>
                <div style={{ fontWeight: '700', fontSize: '1.25rem' }}>
                  {inspectionStatus === 'pass' ? 'ACCEPTED' : 
                   inspectionStatus === 'reject' ? 'REJECTED' : 
                  'IN PROGRESS'}
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Current Step</div>
              <div style={{ fontWeight: '500', fontSize: '1.125rem' }}>
                {inspectionStep.charAt(0).toUpperCase() + inspectionStep.slice(1)}
              </div>
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              <span style={{ fontWeight: '500' }}>Inspection Progress</span>
              <span style={{ fontWeight: '500' }}>{Math.round(progressPercentage)}%</span>
            </div>
            <div style={{
              width: '100%',
              height: '24px',
              backgroundColor: '#E5E7EB',
              borderRadius: '2px',
              border: '1px solid #D1D5DB',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                height: '100%',
                width: `${progressPercentage > 0 ? progressPercentage : 1}%`, // Mínimo 1% para visibilidad
                backgroundColor: inspectionStatus === 'pass' ? '#10B981' : 
                              inspectionStatus === 'reject' ? '#EF4444' : 
                              '#3B82F6',
                transition: 'width 0.5s ease-in-out'
              }}></div>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: progressPercentage > 30 ? '#FFFFFF' : '#000000',
                fontSize: '12px',
                fontWeight: 'bold',
                textShadow: progressPercentage > 30 ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
              }}>
                {Math.round(progressPercentage)}%
              </div>
            </div>
          </div>
          
          {/* NUEVA VERSIÓN: Grid horizontal para métricas con 3 columnas (eliminando Sample Letter) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            marginTop: '1rem'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem'
            }}>
              {/* Columna 1: Non-Conformities */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6B7280',
                  fontWeight: '500',
                  marginBottom: '0.25rem'
                }}>
                  Total Non-Conformities
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: totalNonConformities > 0 ? '#DC2626' : '#1F2937'
                }}>
                  {totalNonConformities}
                </div>
              </div>
              
              {/* Columna 2: Samples Checked */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6B7280',
                  fontWeight: '500',
                  marginBottom: '0.25rem'
                }}>
                  Samples Checked
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#1F2937'
                }}>
                  {completedSamplesCount}
                  <span style={{
                    color: '#6B7280',
                    fontSize: '0.875rem',
                    fontWeight: 'normal'
                  }}> / </span>
                  <span style={{ fontSize: '0.875rem' }}>
                    {getTotalRequiredSamplesForAllSteps()}
                  </span>
                </div>
              </div>
              
              {/* Columna 3: Acceptance Criteria */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6B7280',
                  fontWeight: '500',
                  marginBottom: '0.25rem'
                }}>
                  Acceptance Criteria
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#1F2937'
                }}>
                  <span style={{ fontWeight: '500' }}>Min NC: </span>
                  <span>{minText !== "N/A" ? minText : "0"}</span>
                  <span style={{ margin: '0 0.25rem' }}>|</span>
                  <span style={{ fontWeight: '500' }}>Max NC: </span>
                  <span>{maxText !== "N/A" ? maxText : "2"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notificación de Step - rediseñada como un banner con animación
const StepNotificationBanner = ({ message, status, isVisible, onClose, onNextStep }) => {
  if (!isVisible) return null;
  
  // Clases según el status
  const bgColor = status === 'pass' ? 'bg-green-100 border-green-500' : 
                status === 'reject' ? 'bg-red-100 border-red-500' : 
                'bg-blue-100 border-blue-500';
                
  const textColor = status === 'pass' ? 'text-green-800' : 
                   status === 'reject' ? 'text-red-800' : 
                   'text-blue-800';
                   
  const iconColor = status === 'pass' ? 'text-green-500' : 
                   status === 'reject' ? 'text-red-500' : 
                   'text-blue-500';
  
  return (
    <div 
      className={`mb-4 border-l-4 rounded-lg shadow-lg p-4 ${bgColor} animate-pulse-slow`}
      style={{
        animation: 'pulse 2s infinite ease-in-out'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className={`mr-3 ${iconColor}`}>
            {status === 'pass' && <CheckCircle size={24} />}
            {status === 'reject' && <AlertTriangle size={24} />}
            {status !== 'pass' && status !== 'reject' && <Info size={24} />}
          </span>
          <div>
            <h3 className={`font-bold text-lg ${textColor}`}>Inspection Notice</h3>
            <p className={textColor}>{message}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {status !== 'reject' && status !== 'pass' && (
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={onNextStep}
            >
              Continue to Next Step
            </button>
          )}
          <button 
            className="p-1 rounded-full hover:bg-gray-200"
            onClick={onClose}
          >
            <span className={`${textColor} text-xl`}>✕</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const DimensionMeasurementPanel = () => {
  const { state, dispatch } = useInspection();
  const { 
    dimensions, 
    currentDimension, 
    currentDimSample, 
    dimensionMeasurements, 
    dimensionNonConformities, 
    totalSamplesChecked, 
    completedDimensions, 
    selectedHistoryDim,
    inspectionStep,
    sampleInfo,
    inspectionStatus,
    stepNotificationMessage,
    showStepNotification
  } = state;
  
  // Estado local para las pestañas de los steps de dimensión
  const [activeStepTab, setActiveStepTab] = useState(inspectionStep);
  
  // Estado para la dimensión seleccionada en el historial
  const [historyDimension, setHistoryDimension] = useState(
    dimensions && dimensions.length > 0 ? dimensions[0].code : ''
  );
  
  // Estado para la notificación de step
  const [stepNotifVisible, setStepNotifVisible] = useState(false);
  const [stepNotifMessage, setStepNotifMessage] = useState('');
  const [stepNotifStatus, setStepNotifStatus] = useState('next');
  
  // Cambiar el paso de inspección cuando cambia activeStepTab
  useEffect(() => {
    dispatch({ type: 'SET_INSPECTION_STEP', payload: activeStepTab });
    
    // Reiniciar a la primera cota al cambiar de step
    dispatch({ 
      type: 'SET_DIMENSION_SAMPLE', 
      payload: { 
        dimension: 0,
        sample: 1
      } 
    });
  }, [activeStepTab, dispatch]);
  
  // Actualizar historyDimension cuando cambia currentDimension
  useEffect(() => {
    if (dimensions && currentDimension < dimensions.length) {
      setHistoryDimension(dimensions[currentDimension].code);
    }
  }, [currentDimension, dimensions]);
  
  // Mostrar notificación cuando hay notificaciones de step
  useEffect(() => {
    if (showStepNotification) {
      // Determinar el status del modal
      let status = 'next';
      if (inspectionStatus === 'pass') {
        status = 'pass';
      } else if (inspectionStatus === 'reject') {
        status = 'reject';
      }
      
      setStepNotifMessage(stepNotificationMessage);
      setStepNotifStatus(status);
      setStepNotifVisible(true);
    }
  }, [showStepNotification, stepNotificationMessage, inspectionStatus]);
  
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
  
  // Actualizar medición dimensional con el índice correcto para el step activo
  const handleDimensionInputChange = (e) => {
    if (currentDimension < dimensions?.length) {
      const dimCode = dimensions[currentDimension].code;
      
      // Calcular el índice correcto basado en el step actual
      const stepIndex = ['first', 'second', 'third', 'fourth', 'fifth'].indexOf(activeStepTab);
      const sampleCount = getSampleCount(sampleInfo);
      const actualIndex = (stepIndex * sampleCount) + (currentDimSample - 1);
      
      // Determinar el valor - ahora acepta tanto eventos de input como strings directos (para el reconocimiento de voz)
      const value = typeof e === 'object' ? e.target.value : e;
      
      dispatch({
        type: 'UPDATE_DIMENSION_MEASUREMENT',
        payload: {
          dimension: dimCode,
          sampleIndex: actualIndex,
          value: value
        }
      });
    }
  };
  
  // Manejar entrada por voz
  const handleVoiceResult = (recognizedValue) => {
    console.log("Valor reconocido por voz:", recognizedValue);
    handleDimensionInputChange(recognizedValue);
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
      payload: {}
    });
  };

  // Ir a la muestra anterior
  const handlePrevDimensionSample = () => {
    if (currentDimSample > 1) {
      dispatch({ type: 'PREV_DIMENSION_SAMPLE' });
    }
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
  
  // Obtener el índice de muestra correcto basado en el step activo actual
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
  
  // Función para manejar el cierre de la notificación
  const handleCloseNotif = () => {
    setStepNotifVisible(false);
    dispatch({ type: 'HIDE_STEP_NOTIFICATION' });
  };
  
  // Función para ir al siguiente step
  const handleGoToNextStep = () => {
    const steps = ['first', 'second', 'third', 'fourth', 'fifth'];
    const currentIndex = steps.indexOf(activeStepTab);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      handleStepChange(nextStep);
    }
    handleCloseNotif();
  };
  
  // Obtener estado actual de la dimensión
  const getDimensionStatus = (dimCode) => {
    // Si no hay datos de mediciones o no está en el arreglo, está en progreso
    if (!dimensionMeasurements || !dimensionMeasurements[dimCode]) return 'in-progress';
    
    // Si hay al menos un valor (no vacío), entonces tiene mediciones
    const hasMeasurements = dimensionMeasurements[dimCode].some(val => val !== '');
    
    // Si no tiene mediciones, está en progreso
    if (!hasMeasurements) return 'in-progress';
    
    // Ahora verificamos si está completo
    const isComplete = completedDimensions?.[dimCode] || false;
    const nonConformCount = dimensionNonConformities?.[dimCode] || 0;
    
    // Solo es CONFORMING si está completo y sin no conformidades
    if (isComplete && nonConformCount === 0) {
      return 'conforming';
    } else if (isComplete && nonConformCount > 0) {
      return 'non-conforming';
    }
    
    // Por defecto, en progreso
    return 'in-progress';
  };

  // Obtener la dimensión actual para mostrar
  const getCurrentDimension = () => {
    if (!dimensions || currentDimension >= dimensions.length) return null;
    return dimensions[currentDimension];
  };

  return (
    <div className="dashboard-card mb-4">
      <div className="card-header" style={{background: 'linear-gradient(to right, #5a67d8, #6875f5)'}}>
        <h3 className="card-title text-white">Dimension Inspection</h3>
      </div>
      
      <div className="card-body">
        {/* Overall Status */}
        <OverallStatusSection />
        
        {/* PESTAÑAS DE STEPS */}
        <div className="mb-4">
          <div className="flex justify-center">
            <div className="btn-group">
              {['first', 'second', 'third', 'fourth', 'fifth'].map((step) => {
                const isActive = activeStepTab === step;
                
                return (
                  <button
                    key={step}
                    className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleStepChange(step)}
                  >
                    Step {step.charAt(0).toUpperCase() + step.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* CURRENT DIMENSION - SIMILAR A REPORT */}
        {currentDimension < dimensions?.length && (
          <div className="dashboard-card mb-4">
            <div className="card-body p-0">
              <table className="data-table">
                <thead>
                  <tr>
                    <th width="10%">Dimension</th>
                    <th>Nominal</th>
                    <th>Tolerance +</th>
                    <th>Tolerance -</th>
                    <th>Min Allowed</th>
                    <th>Max Allowed</th>
                    <th width="15%">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-bold text-center bg-blue-100">
                      {dimensions[currentDimension].code}
                    </td>
                    <td className="text-center">{dimensions[currentDimension].nominal} mm</td>
                    <td className="text-center text-green-600">{dimensions[currentDimension].tolerancePlus} mm</td>
                    <td className="text-center text-red-600">{dimensions[currentDimension].toleranceMinus} mm</td>
                    <td className="text-center text-red-600">
                      {(dimensions[currentDimension].nominal - dimensions[currentDimension].toleranceMinus).toFixed(1)} mm
                    </td>
                    <td className="text-center text-green-600">
                      {(dimensions[currentDimension].nominal + dimensions[currentDimension].tolerancePlus).toFixed(1)} mm
                    </td>
                    <td>
                      <span className={`badge ${
                        getDimensionStatus(dimensions[currentDimension].code) === 'conforming' ? 'badge-success' : 
                        getDimensionStatus(dimensions[currentDimension].code) === 'non-conforming' ? 'badge-danger' : 
                        'badge-info'
                      }`}>
                        {getDimensionStatus(dimensions[currentDimension].code) === 'conforming' ? 'CONFORMING' : 
                        getDimensionStatus(dimensions[currentDimension].code) === 'non-conforming' ? 'NON-CONFORMING' : 
                        'IN PROGRESS'}
                      </span>
                      <div className="text-xs mt-1">
                        NC: <span className={dimensionNonConformities?.[dimensions[currentDimension].code] > 0 ? "text-red-600 font-bold" : ""}>
                          {dimensionNonConformities?.[dimensions[currentDimension].code] || 0}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Notificación de step justo antes de Measurement Input */}
        <StepNotificationBanner 
          isVisible={stepNotifVisible}
          message={stepNotifMessage}
          status={stepNotifStatus}
          onClose={handleCloseNotif}
          onNextStep={handleGoToNextStep}
        />
        
        {/* MEASUREMENT INPUT - CON BOTÓN DE RECONOCIMIENTO DE VOZ */}
        <div className="report-section mb-4">
          <h3 className="report-section-title">
            <PenTool size={18} className="mr-2" /> Measurement Input
          </h3>
          
          {/* Estilo completamente simplificado directamente con estilos inline */}
          <div style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            padding: '16px'
          }}>
            <div style={{
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontWeight: 500, 
                  marginRight: '8px',
                  fontSize: '14px',
                }}>Current Dimension:</span>
                <span style={{
                  fontWeight: 700,
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  {getCurrentDimension()?.code}
                </span>
                <span style={{
                  marginLeft: '8px',
                  fontSize: '14px',
                  fontWeight: 500
                }}>{getCurrentDimension()?.description}</span>
              </div>
              
              <div style={{
                fontSize: '12px',
                color: '#6B7280'
              }}>
                Min: {(getCurrentDimension()?.nominal - getCurrentDimension()?.toleranceMinus).toFixed(1)} mm | 
                Max: {(getCurrentDimension()?.nominal + getCurrentDimension()?.tolerancePlus).toFixed(1)} mm
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <button 
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  backgroundColor: currentDimSample > 1 ? '#DBEAFE' : '#F3F4F6',
                  color: currentDimSample > 1 ? '#3B82F6' : '#9CA3AF',
                  border: '1px solid #E5E7EB',
                  cursor: currentDimSample > 1 ? 'pointer' : 'not-allowed'
                }}
                onClick={handlePrevDimensionSample}
                disabled={currentDimSample <= 1}
              >
                <ArrowLeft size={20} />
              </button>
              
              <div style={{
                flex: 1
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '4px'
                }}>
                  Sample {currentDimSample} of {getSampleCount(sampleInfo)}
                </label>
                
                <div style={{
                  display: 'flex'
                }}>
                  <input 
                    id="dimension-input"
                    type="number" 
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: '#D1D5DB',
                      borderRightWidth: 0,
                      borderRadius: '4px 0 0 4px',
                      fontSize: '16px'
                    }}
                    placeholder="Enter measurement value"
                    value={getCurrentDimensionValue()}
                    onChange={handleDimensionInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleNextDimensionSample();
                      }
                    }}
                    step="0.1"
                  />
                  
                  {/* BOTÓN DE RECONOCIMIENTO DE VOZ */}
                  <div className="flex items-center bg-gray-50 px-2 border-t border-b">
                    <VoiceRecognitionButton onResultRecognized={handleVoiceResult} />
                  </div>
                  
                  <button 
                    style={{
                      backgroundColor: '#16A34A',
                      color: 'white',
                      padding: '8px 16px',
                      fontWeight: 500,
                      borderRadius: '0 4px 4px 0',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onClick={handleNextDimensionSample}
                  >
                    Next <ArrowRight size={16} style={{marginLeft: '4px'}} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* MEASUREMENT RECORDS */}
        <div className="report-section">
          <h3 className="report-section-title">
            <Table size={18} className="mr-2" /> Measurement Records
          </h3>
          
          <div className="btn-group mb-3 flex flex-wrap justify-center">
            {dimensions?.map((dim) => (
              <button
                key={dim.code}
                className={`btn ${historyDimension === dim.code ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleChangeHistoryDimension(dim.code)}
              >
                {dim.code}
              </button>
            ))}
          </div>
          
          <div className="dashboard-card">
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sample</th>
                      {['first', 'second', 'third', 'fourth', 'fifth'].map((step) => (
                        <th 
                          key={step} 
                          className={activeStepTab === step ? 'bg-blue-100' : ''}
                        >
                          Step {step.charAt(0).toUpperCase() + step.slice(1)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {getDimensionMeasurementHistory(historyDimension).map((row, index) => {
                      const dimension = dimensions.find(d => d.code === historyDimension);
                      
                      return (
                        <tr key={index}>
                          <td className="font-medium">{row.sample}</td>
                          {['first', 'second', 'third', 'fourth', 'fifth'].map((step) => {
                            const value = row[step];
                            const isValid = isValueWithinTolerance(value, dimension);
                            
                            // Determinar si esta es la celda actual
                            const isActiveCell = activeStepTab === step && 
                                                historyDimension === dimensions[currentDimension]?.code && 
                                                row.sample === currentDimSample;
                            
                            let cellClass = 'text-center';
                            if (value) {
                              cellClass += isValid ? ' text-green-600 font-medium' : ' text-red-600 font-medium';
                            }
                            if (isActiveCell) {
                              cellClass += ' ring-2 ring-blue-500';
                            }
                            
                            return (
                              <td 
                                key={step} 
                                className={cellClass}
                                onClick={() => {
                                  const dimIndex = dimensions.findIndex(d => d.code === historyDimension);
                                  if (dimIndex >= 0) {
                                    handleSelectDimensionSample(dimIndex, row.sample - 1);
                                    handleStepChange(step);
                                  }
                                }}
                                style={{cursor: 'pointer'}}
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
          </div>
        </div>
        
        {/* Estilos de animación */}
        <style jsx>{`
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(66, 153, 225, 0.5);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(66, 153, 225, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(66, 153, 225, 0);
            }
          }
          
          .animate-pulse-slow {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default DimensionMeasurementPanel;