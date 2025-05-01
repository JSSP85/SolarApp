// src/constants/inspectionDefaults.js
export const defaultInspectionState = {
  // Tab state
  activeTab: 'setup',
  
  // Setup info (valores iniciales vacíos)
  projectName: '',
  componentFamily: '',
  surfaceProtection: '',
  componentCode: '',
  componentName: '',
  thickness: '',
  specialCoating: '',
  batchQuantity: '',
  sampleInfo: '',
  inspector: '',
  inspectionDate: new Date().toISOString().slice(0, 10),
  
  // Measurement equipment
  measurementEquipment: [
    { id: 1, toolType: '', toolId: '' }
  ],
  
  // Estados iniciales vacíos
  currentDimension: 0,
  currentDimSample: 1,
  dimensionMeasurements: {},
  selectedHistoryDim: null,
  
  // Coating state
  currentCoatingSample: 1,
  meanCoating: '',
  localCoatingMeasurements: [],
  
  // Chart state
  chartViewMode: 'all',
  selectedDimForChart: '',
  
  // ISO 2859-1 inspection states
  inspectionStep: 'first',
  inspectionStatus: 'in-progress',
  totalNonConformities: 0,
  totalSamplesChecked: {},
  dimensionNonConformities: {},
  completedDimensions: {},
  showStepNotification: false,
  stepNotificationMessage: '',
  
  // Visual inspection
  visualConformity: 'conforming',
  visualNotes: '',
  photos: [],
  
  // Map coordinates - Coordenadas predeterminadas (Roma)
  mapCoords: { lat: 41.9028, lng: 12.4964 },
  
  // Nuevos estados para el flujo de inspección por etapas
  inspectionStage: 'dimensional', // valores posibles: 'dimensional', 'coating', 'visual'
  stageCompletion: {
    dimensional: false,
    coating: false,
    visual: false
  }
};