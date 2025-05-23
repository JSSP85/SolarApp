// src/context/InspectionContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { defaultInspectionState } from '../constants/inspectionDefaults';
import { calculateCoatingStats } from '../utils/coatingCalculations';
import { countNonConformities } from '../utils/dimensionCalculations';
import { getSampleCount, getSampleLetter } from '../utils/samplePlanHelper';
import { iso2859Table } from '../constants/iso2859Tables';
import { 
  fetchComponentFamilies, 
  fetchComponentCodes, 
  fetchDimensions,
  fetchCoatingRequirements
} from '../utils/googleSheetsService';

// Importaciones de Firebase
import { 
  saveInspection, 
  updateInspection, 
  getInspection,
  getInspections 
} from '../firebase/inspectionService';

// Crear el contexto
const InspectionContext = createContext();

// Estado inicial actualizado con campos de Firebase
const inspectionStateWithFirebase = {
  ...defaultInspectionState,
  // NUEVO CAMPO: Nombre del proveedor
  supplierName: '',
    // NUEVO CAMPO: Rol del usuario
  userRole: 'admin', // ← AGREGAR ESTA LÍNEA
  // Nuevos campos para Firestore
  currentInspectionId: null,
  isSaving: false,
  saveError: null,
  lastSaved: null,
  hasUnsavedChanges: false,
};

// Función de validación de campos requeridos
export const validateRequiredFields = (state) => {
  const requiredFields = [
    { field: 'componentFamily', label: 'Component Family' },
    { field: 'componentCode', label: 'Component Code' },
    { field: 'surfaceProtection', label: 'Surface Protection' },
    { field: 'batchQuantity', label: 'Batch Quantity' },
    { field: 'inspector', label: 'Inspector Name' },
    { field: 'supplierName', label: 'Supplier Name' }, // NUEVO CAMPO REQUERIDO
  ];

  const missingFields = [];

  for (const { field, label } of requiredFields) {
    if (!state[field] || state[field].toString().trim() === '') {
      missingFields.push(label);
    }
  }

  // Validaciones adicionales basadas en condiciones
  if (state.surfaceProtection === 'ISO1461' && (!state.thickness || state.thickness.toString().trim() === '')) {
    missingFields.push('Material Thickness');
  }

  if (state.surfaceProtection === 'special coating' && (!state.specialCoating || state.specialCoating.toString().trim() === '')) {
    missingFields.push('Special Coating Value');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields
  };
};

// Reducer para manejar las actualizaciones de estado
function inspectionReducer(state, action) {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
      
    case 'UPDATE_SETUP_FIELD':
      return { ...state, [action.payload.field]: action.payload.value };
	  
	  case 'UPDATE_MAP_COORDS':
      return { ...state, mapCoords: action.payload };
      
    case 'SET_COMPONENT_FAMILIES':
      return { ...state, availableComponentFamilies: action.payload };
      
    case 'SET_COMPONENT_CODES':
      return { ...state, availableComponentCodes: action.payload };
      
    case 'SET_DIMENSIONS':
      return { 
        ...state, 
        dimensions: action.payload,
        // Inicializar mediciones dimensionales con arrays vacíos
        dimensionMeasurements: Object.fromEntries(
          action.payload.map(dim => [dim.code, Array(getSampleCount(state.sampleInfo) || 3).fill('')])
        ),
        // Establecer la primera dimensión seleccionada como predeterminada
        selectedDimForChart: action.payload.length > 0 ? action.payload[0].code : ''
      };
      
    case 'SET_SAMPLE_INFO':
      return { 
        ...state, 
        sampleInfo: action.payload.sampleInfo,
        // Actualizar arrays de mediciones basados en el nuevo tamaño de muestra
        localCoatingMeasurements: Array(action.payload.sampleCount).fill(''),
        dimensionMeasurements: Object.fromEntries(
          (state.dimensions || []).map(dim => [dim.code, Array(action.payload.sampleCount).fill('')])
        ),
        meanCoating: '',
        coatingStats: {
          readings: 0,
          mean: 0,
          maximum: 0,
          minimum: 0,
          range: 0,
          stdDeviation: 0,
          meanPlus3Sigma: 0,
          meanMinus3Sigma: 0,
          cv: 0
        },
        // Restablecer estados de inspección
        inspectionStep: 'first',
        inspectionStatus: 'in-progress',
        totalNonConformities: 0,
        totalSamplesChecked: Object.fromEntries(
          (state.dimensions || []).map(dim => [dim.code, 0])
        ),
        dimensionNonConformities: Object.fromEntries(
          (state.dimensions || []).map(dim => [dim.code, 0])
        ),
        completedDimensions: Object.fromEntries(
          (state.dimensions || []).map(dim => [dim.code, false])
        ),
        currentDimension: 0,
        currentDimSample: 1,
        currentCoatingSample: 1
      };
      
    case 'ADD_EQUIPMENT':
      return {
        ...state,
        measurementEquipment: [
          ...state.measurementEquipment,
          { id: state.measurementEquipment.length + 1, toolType: '', toolId: '' }
        ]
      };
      
    case 'REMOVE_EQUIPMENT':
      return {
        ...state,
        measurementEquipment: state.measurementEquipment.filter(
          equip => equip.id !== action.payload
        )
      };
      
    case 'UPDATE_EQUIPMENT':
      return {
        ...state,
        measurementEquipment: state.measurementEquipment.map(equip => 
          equip.id === action.payload.id 
            ? { ...equip, [action.payload.field]: action.payload.value } 
            : equip
        )
      };
      
    case 'SET_DIMENSION_SAMPLE':
      return {
        ...state,
        currentDimension: action.payload.dimension,
        currentDimSample: action.payload.sample,
        selectedHistoryDim: null
      };
      
    case 'NEXT_DIMENSION_SAMPLE': {
      const sampleCount = getSampleCount(state.sampleInfo);
      const currentDim = state.dimensions?.[state.currentDimension]?.code;
      
      if (!currentDim) return state;
      
      // Update current measurement from input value if provided
      const updatedMeasurements = { ...state.dimensionMeasurements };
      if (action.payload?.value) {
        updatedMeasurements[currentDim][state.currentDimSample - 1] = action.payload.value;
      }
      
      // Logic to move to next sample or dimension
      if (state.currentDimSample < sampleCount) {
        // Still more samples for current dimension
        return {
          ...state,
          dimensionMeasurements: updatedMeasurements,
          currentDimSample: state.currentDimSample + 1
        };
      } else if (state.currentDimension < (state.dimensions?.length || 0) - 1) {
        // Move to next dimension
        return {
          ...state,
          dimensionMeasurements: updatedMeasurements,
          currentDimension: state.currentDimension + 1,
          currentDimSample: 1
        };
      } else {
        // We're at the end
        return {
          ...state,
          dimensionMeasurements: updatedMeasurements
        };
      }
    }
    
    case 'PREV_DIMENSION_SAMPLE':
      return {
        ...state,
        currentDimSample: Math.max(1, state.currentDimSample - 1)
      };
      
    case 'UPDATE_DIMENSION_MEASUREMENT': {
      if (!action.payload.dimension) return state;
      
      const updatedMeasurements = { ...state.dimensionMeasurements };
      if (!updatedMeasurements[action.payload.dimension]) {
        updatedMeasurements[action.payload.dimension] = [];
      }
      
      updatedMeasurements[action.payload.dimension][action.payload.sampleIndex] = action.payload.value;
      
      return {
        ...state,
        dimensionMeasurements: updatedMeasurements
      };
    }
    
    case 'TOGGLE_DIMENSION_HISTORY':
      return {
        ...state,
        selectedHistoryDim: state.selectedHistoryDim === action.payload ? null : action.payload
      };
      
    case 'SET_COATING_SAMPLE':
      return {
        ...state,
        currentCoatingSample: action.payload
      };
      
    case 'NEXT_COATING_SAMPLE': {
      const sampleCount = getSampleCount(state.sampleInfo);
      const updatedMeasurements = [...state.localCoatingMeasurements];
      
      // Update current measurement if provided
      if (action.payload?.value) {
        updatedMeasurements[state.currentCoatingSample - 1] = action.payload.value;
      }
      
      return {
        ...state,
        localCoatingMeasurements: updatedMeasurements,
        currentCoatingSample: state.currentCoatingSample < sampleCount 
          ? state.currentCoatingSample + 1 
          : state.currentCoatingSample
      };
    }
    
    case 'PREV_COATING_SAMPLE': {
      const updatedMeasurements = [...state.localCoatingMeasurements];
      
      // Update current measurement if provided
      if (action.payload?.value) {
        updatedMeasurements[state.currentCoatingSample - 1] = action.payload.value;
      }
      
      return {
        ...state,
        localCoatingMeasurements: updatedMeasurements,
        currentCoatingSample: Math.max(1, state.currentCoatingSample - 1)
      };
    }
    
    case 'UPDATE_COATING_MEASUREMENT': {
      const updatedMeasurements = [...state.localCoatingMeasurements];
      updatedMeasurements[action.payload.sampleIndex] = action.payload.value;
      
      return {
        ...state,
        localCoatingMeasurements: updatedMeasurements
      };
    }
    
    case 'UPDATE_COATING_STATS': {
      return {
        ...state,
        coatingStats: action.payload.stats,
        meanCoating: action.payload.stats.mean.toString()
      };
    }
    
    case 'SET_CHART_VIEW_MODE':
      return {
        ...state,
        chartViewMode: action.payload
      };
      
    case 'SET_SELECTED_DIM_FOR_CHART':
      return {
        ...state,
        selectedDimForChart: action.payload
      };
      
    case 'UPDATE_NON_CONFORMITIES': {
      if (!state.dimensions) return state;
      
      // Calcular no conformidades para cada dimensión
      const updatedDimensionNonConformities = {};
      const updatedTotalSamplesChecked = {};
      const updatedCompletedDimensions = {};
      let totalNC = 0;
      
      state.dimensions.forEach(dim => {
        updatedDimensionNonConformities[dim.code] = countNonConformities(
          state.dimensionMeasurements[dim.code], 
          dim
        );
        totalNC += updatedDimensionNonConformities[dim.code];
        
        updatedTotalSamplesChecked[dim.code] = 
          state.dimensionMeasurements[dim.code]?.filter(v => v !== '').length || 0;
          
        const sampleCount = getSampleCount(state.sampleInfo);
        updatedCompletedDimensions[dim.code] = 
          state.dimensionMeasurements[dim.code]?.slice(0, sampleCount).every(value => value !== '') || false;
      });
      
      return {
        ...state,
        dimensionNonConformities: updatedDimensionNonConformities,
        totalNonConformities: totalNC,
        totalSamplesChecked: updatedTotalSamplesChecked,
        completedDimensions: updatedCompletedDimensions
      };
    }
    
    case 'EVALUATE_INSPECTION_STATUS': {
      const sampleLetter = getSampleLetter(state.sampleInfo);
      const currentStep = state.inspectionStep;
      
      if (!iso2859Table[sampleLetter] || !iso2859Table[sampleLetter][currentStep]) {
        return state;
      }
      
      const stepData = iso2859Table[sampleLetter][currentStep];
      
      // Calculate minimum samples required across all dimensions
      const minSamplesRequired = stepData.size * (state.dimensions?.length || 0);
      
      // Count total samples checked across all dimensions
      const totalSamplesCompleted = Object.values(state.totalSamplesChecked)
        .reduce((sum, count) => sum + count, 0);
      
      // Only evaluate if we have enough samples across dimensions
      if (totalSamplesCompleted >= minSamplesRequired) {
        const steps = ['first', 'second', 'third', 'fourth', 'fifth'];
        const currentIndex = steps.indexOf(currentStep);
        const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;
        
        if (stepData.ac === '#') {
          // Si es '#', informar que debe pasar al siguiente paso
          if (nextStep) {
            return {
              ...state,
              stepNotificationMessage: `Complete Step ${nextStep}. Click on the corresponding tab.`,
              showStepNotification: true
            };
          }
        } else if (state.totalNonConformities <= stepData.ac) {
          // PASS - Criterio de aceptación cumplido
          return {
            ...state,
            inspectionStatus: 'pass',
            stepNotificationMessage: "Dimensional control completed, proceed with inspection.",
            showStepNotification: true
          };
        } else if (state.totalNonConformities >= stepData.re) {
          // REJECT - Criterio de rechazo cumplido
          return {
            ...state,
            inspectionStatus: 'reject',
            stepNotificationMessage: "Batch rejected. Does not meet acceptance criteria.",
            showStepNotification: true
          };
        } else if (currentStep !== 'fifth') {
          // Entre Ac y Re, pasar al siguiente paso si no estamos en el quinto
          if (nextStep) {
            return {
              ...state,
              stepNotificationMessage: `Complete Step ${nextStep}. Click on the corresponding tab.`,
              showStepNotification: true
            };
          }
        } else {
          // Si estamos en el quinto paso y no cumple los criterios, es REJECT
          return {
            ...state,
            inspectionStatus: 'reject',
            stepNotificationMessage: "Batch rejected. Does not meet acceptance criteria.",
            showStepNotification: true
          };
        }
      }
      
      return state;
    }
    
    case 'SET_INSPECTION_STEP':
      return {
        ...state,
        inspectionStep: action.payload,
        showStepNotification: false
      };
      
    case 'RESET_MEASUREMENTS_FOR_NEW_STEP': {
      const sampleCount = getSampleCount(state.sampleInfo);
      const stepIndex = ['first', 'second', 'third', 'fourth', 'fifth'].indexOf(state.inspectionStep);
      
      if (!state.dimensions) return state;
      
      // Create a fresh UI state that shows empty fields for the new step
      const newDimensionMeasurements = {};
      state.dimensions.forEach(dim => {
        // Initialize with empty arrays if needed
        if (!state.dimensionMeasurements[dim.code]) {
          newDimensionMeasurements[dim.code] = Array(sampleCount * 5).fill('');
        } else {
          // Copy existing data but clear the slots for the current step
          newDimensionMeasurements[dim.code] = [...state.dimensionMeasurements[dim.code]];
          
          // Clear only the slots for the current step
          const startIndex = stepIndex * sampleCount;
          for (let i = 0; i < sampleCount; i++) {
            newDimensionMeasurements[dim.code][startIndex + i] = '';
          }
        }
      });
      
      return {
        ...state,
        dimensionMeasurements: newDimensionMeasurements,
        currentDimension: 0,
        currentDimSample: 1,
        completedDimensions: Object.fromEntries(
          state.dimensions.map(dim => [dim.code, false])
        ),
        totalSamplesChecked: Object.fromEntries(
          state.dimensions.map(dim => [dim.code, 0])
        )
      };
    }
    
    case 'HIDE_STEP_NOTIFICATION':
      return {
        ...state,
        showStepNotification: false
      };
      
    case 'SET_VISUAL_CONFORMITY':
      return {
        ...state,
        visualConformity: action.payload
      };
      
    case 'SET_VISUAL_NOTES':
      return {
        ...state,
        visualNotes: action.payload
      };
      
    case 'ADD_PHOTO':
      return {
        ...state,
        photos: [...state.photos, action.payload]
      };
      
    case 'REMOVE_PHOTO':
      return {
        ...state,
        photos: state.photos.filter((_, index) => index !== action.payload)
      };
      
    case 'SET_COATING_REQUIREMENTS':
      return {
        ...state,
        coatingRequirements: action.payload
      };
    
    // NUEVOS CASOS PARA MANEJO DE ETAPAS
    case 'SET_INSPECTION_STAGE':
      return {
        ...state,
        inspectionStage: action.payload
      };
      
    case 'SET_STAGE_COMPLETION':
      return {
        ...state,
        stageCompletion: {
          ...state.stageCompletion,
          [action.payload.stage]: action.payload.completed
        }
      };

    case 'NEXT_INSPECTION_STAGE': {
      const currentStage = state.inspectionStage;
      let nextStage = currentStage;
      
      if (currentStage === 'dimensional') {
        nextStage = 'coating';
      } else if (currentStage === 'coating') {
        nextStage = 'visual';
      }
      
      return {
        ...state,
        inspectionStage: nextStage
      };
    }

    case 'PREVIOUS_INSPECTION_STAGE': {
      const currentStage = state.inspectionStage;
      let prevStage = currentStage;
      
      if (currentStage === 'visual') {
        prevStage = 'coating';
      } else if (currentStage === 'coating') {
        prevStage = 'dimensional';
      }
      
      return {
        ...state,
        inspectionStage: prevStage
      };
    }

    // NUEVAS ACCIONES PARA FIREBASE
    case 'SET_CURRENT_INSPECTION_ID':
      return {
        ...state,
        currentInspectionId: action.payload,
        hasUnsavedChanges: false
      };

    case 'SET_SAVING_STATE':
      return {
        ...state,
        isSaving: action.payload
      };

    case 'SET_SAVE_ERROR':
      return {
        ...state,
        saveError: action.payload,
        isSaving: false
      };

    case 'SET_LAST_SAVED':
      return {
        ...state,
        lastSaved: action.payload,
        isSaving: false,
        saveError: null,
        hasUnsavedChanges: false
      };

    case 'SET_UNSAVED_CHANGES':
      return {
        ...state,
        hasUnsavedChanges: action.payload
      };
      
   case 'LOAD_INSPECTION_DATA':
  return {
    ...action.payload,
    isSaving: false,
    saveError: null,
    hasUnsavedChanges: false
  };  
    default:
      return state;
  }
}

// Provider component
export const InspectionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(inspectionReducer, inspectionStateWithFirebase);
  
  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Cargar familias de componentes
        const families = await fetchComponentFamilies();
        dispatch({ 
          type: 'SET_COMPONENT_FAMILIES', 
          payload: families 
        });
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    
    loadInitialData();
  }, []);
  
  // Cargar códigos de componente cuando cambia la familia seleccionada
  useEffect(() => {
    const loadComponentCodes = async () => {
      if (state.componentFamily) {
        try {
          const codes = await fetchComponentCodes(state.componentFamily);
          dispatch({ 
            type: 'SET_COMPONENT_CODES', 
            payload: codes 
          });
        } catch (error) {
          console.error('Error loading component codes:', error);
        }
      }
    };
    
    loadComponentCodes();
  }, [state.componentFamily]);
  
  // Cargar dimensiones cuando cambia el código de componente seleccionado
  useEffect(() => {
    const loadDimensions = async () => {
      if (state.componentCode) {
        try {
          const dimensions = await fetchDimensions(state.componentCode);
          dispatch({ 
            type: 'SET_DIMENSIONS', 
            payload: dimensions 
          });
        } catch (error) {
          console.error('Error loading dimensions:', error);
        }
      }
    };
    
    loadDimensions();
  }, [state.componentCode]);
  
  // Cargar requisitos de recubrimiento cuando cambia la protección de superficie
  useEffect(() => {
    const loadCoatingRequirements = async () => {
      if (state.surfaceProtection) {
        try {
          const requirements = await fetchCoatingRequirements(
            state.surfaceProtection,
            state.thickness,
            state.specialCoating
          );
          
          dispatch({
            type: 'SET_COATING_REQUIREMENTS',
            payload: requirements
          });
        } catch (error) {
          console.error('Error loading coating requirements:', error);
        }
      }
    };
    
    loadCoatingRequirements();
  }, [state.surfaceProtection, state.thickness, state.specialCoating]);
  
  // Efecto para actualizar estadísticas de recubrimiento
  useEffect(() => {
    const stats = calculateCoatingStats(state.localCoatingMeasurements);
    if (stats.readings > 0) {
      dispatch({ 
        type: 'UPDATE_COATING_STATS', 
        payload: { stats } 
      });
    }
  }, [state.localCoatingMeasurements]);
  
  // Efecto para actualizar no conformidades
  useEffect(() => {
    dispatch({ type: 'UPDATE_NON_CONFORMITIES' });
  }, [state.dimensionMeasurements, state.dimensions]);
  
  // Efecto para evaluar estado de inspección
  useEffect(() => {
    dispatch({ type: 'EVALUATE_INSPECTION_STATUS' });
  }, [
    state.totalNonConformities, 
    state.totalSamplesChecked, 
    state.inspectionStep, 
    state.sampleInfo
  ]);
  
  // Efecto para comprobar la finalización de etapas
  useEffect(() => {
    // Verificar si la etapa dimensional está completa
    if (state.dimensions && state.dimensions.length > 0) {
      const allDimensionsComplete = Object.values(state.completedDimensions).every(complete => complete);
      
      if (allDimensionsComplete !== state.stageCompletion.dimensional) {
        dispatch({
          type: 'SET_STAGE_COMPLETION',
          payload: { stage: 'dimensional', completed: allDimensionsComplete }
        });
      }
    }
    
    // Verificar si la etapa coating está completa
    if (state.localCoatingMeasurements) {
      const allCoatingComplete = state.localCoatingMeasurements.every(value => value !== '');
      
      if (allCoatingComplete !== state.stageCompletion.coating) {
        dispatch({
          type: 'SET_STAGE_COMPLETION',
          payload: { stage: 'coating', completed: allCoatingComplete }
        });
      }
    }
    
    // Verificar si la etapa visual está completa
    const visualComplete = state.visualConformity !== null && state.visualConformity !== '';
    
    if (visualComplete !== state.stageCompletion.visual) {
      dispatch({
        type: 'SET_STAGE_COMPLETION',
        payload: { stage: 'visual', completed: visualComplete }
      });
    }
  }, [
    state.dimensions, 
    state.completedDimensions, 
    state.localCoatingMeasurements,
    state.visualConformity,
    state.stageCompletion.dimensional,
    state.stageCompletion.coating,
    state.stageCompletion.visual
  ]);

  // Marcar cambios no guardados cuando se actualiza el state
  useEffect(() => {
    // Solo marcar como no guardado si ya hay una inspección y no estamos cargando
    if (state.currentInspectionId && !state.isSaving) {
      dispatch({ type: 'SET_UNSAVED_CHANGES', payload: true });
    }
  }, [
    state.componentCode, state.componentName, state.componentFamily,
    state.inspector, state.batchQuantity, state.dimensionMeasurements,
    state.localCoatingMeasurements, state.visualConformity, state.visualNotes,
    state.supplierName // INCLUIR EL NUEVO CAMPO
  ]);
  
  // FUNCIONES DE FIRESTORE

  // Función para guardar inspección
  const saveCurrentInspection = async () => {
    try {
      dispatch({ type: 'SET_SAVING_STATE', payload: true });
      dispatch({ type: 'SET_SAVE_ERROR', payload: null });
      
      let inspectionId;
      
      if (state.currentInspectionId) {
        // Actualizar inspección existente
        await updateInspection(state.currentInspectionId, state);
        inspectionId = state.currentInspectionId;
        console.log('Inspección actualizada:', inspectionId);
      } else {
        // Crear nueva inspección
        inspectionId = await saveInspection(state);
        dispatch({ type: 'SET_CURRENT_INSPECTION_ID', payload: inspectionId });
        console.log('Nueva inspección creada:', inspectionId);
      }
      
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
      
      return inspectionId;
    } catch (error) {
      console.error('Error guardando inspección:', error);
      dispatch({ type: 'SET_SAVE_ERROR', payload: error.message });
      throw error;
    }
  };

  // Función para cargar inspección
  const loadInspection = async (inspectionId) => {
    try {
      dispatch({ type: 'SET_SAVING_STATE', payload: true });
      dispatch({ type: 'SET_SAVE_ERROR', payload: null });
      
      const inspectionData = await getInspection(inspectionId);
      
      if (inspectionData) {
        dispatch({ type: 'LOAD_INSPECTION_DATA', payload: inspectionData });
        dispatch({ type: 'SET_CURRENT_INSPECTION_ID', payload: inspectionId });
        console.log('Inspección cargada:', inspectionId);
        return inspectionData;
      } else {
        throw new Error('Inspección no encontrada');
      }
    } catch (error) {
      console.error('Error cargando inspección:', error);
      dispatch({ type: 'SET_SAVE_ERROR', payload: error.message });
      throw error;
    }
  };

  // Función para crear nueva inspección (resetear state)
  const createNewInspection = () => {
    // Resetear al estado inicial pero mantener algunas configuraciones
    const newState = {
      ...inspectionStateWithFirebase,
      // Mantener estas configuraciones del usuario
      inspector: state.inspector,
      inspectionDate: new Date().toISOString().slice(0, 10)
    };
    
    dispatch({ type: 'LOAD_INSPECTION_DATA', payload: newState });
    console.log('Nueva inspección creada');
  };
  
  return (
    <InspectionContext.Provider value={{ 
      state, 
      dispatch,
      // Funciones de Firestore
      saveCurrentInspection,
      loadInspection,
      createNewInspection,
      // Función de validación
      validateRequiredFields: () => validateRequiredFields(state)
    }}>
      {children}
    </InspectionContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useInspection = () => {
  const context = useContext(InspectionContext);
  if (!context) {
    throw new Error('useInspection must be used within an InspectionProvider');
  }
  return context;
};

export default InspectionContext;