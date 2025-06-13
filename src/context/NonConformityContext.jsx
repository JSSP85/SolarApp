// src/context/NonConformityContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// ✅ IMPORTS FIREBASE
import { 
  saveNonConformity, 
  updateNonConformity, 
  getNonConformities, 
  getNonConformity,
  deleteNonConformity,
  updateNCStatus,
  addTimelineEntry,
  getNCStats 
} from '../firebase/nonConformityService';

// Initial state - ✅ ACTUALIZADO CON DETECTION SOURCE
const initialState = {
  // Navigation state
  activeTab: 'create',
  
  // Current NC being edited - ✅ CAMPOS COMPLETOS CON DETECTION SOURCE
  currentNC: {
    // Basic Information
    number: '',
    priority: '',
    project: '',
    projectCode: '',
    date: '',
    createdBy: '',
    sector: '',
    supplier: '',
    
    // NC Details - ✅ DETECTION SOURCE AGREGADO
    ncType: '',
    detectionSource: '', // ✅ NUEVO CAMPO
    description: '',
    purchaseOrder: '',
    componentCode: '',
    quantity: '',
    component: '',
    
    // Treatment/Resolution
    materialDisposition: '',
    containmentAction: '',
    
    // Corrective Action
    rootCauseAnalysis: '',
    correctiveAction: '',
    plannedClosureDate: '',
    assignedTo: '',
    
    // Status and Timeline
    status: 'open',
    actualClosureDate: '',
    daysOpen: 0,
    timeline: [],
    
    // Photo Documentation
    photos: [],
    
    // Legacy fields for compatibility
    title: '',
    location: '',
    severity: 'medium',
    detectedBy: '',
    affectedProduct: '',
    potentialImpact: '',
    immediateAction: '',
    correctiveActionPlan: '',
    responsiblePerson: '',
    targetDate: '',
    verificationMethod: '',
    attachments: []
  },
  
  // Validation state
  validationErrors: {},
  isFormValid: false,
  
  // List of all NCs - ✅ ACTUALIZAR NC EXISTENTE CON DETECTION SOURCE
  ncList: [
    {
      id: '1',
      number: 'RNC-001',
      title: 'Improper Welding Procedure',
      description: 'Non-conforming welding technique observed during structural work inspection.',
      location: 'Building A - Floor 3 - Column C3',
      severity: 'high',
      priority: 'critical',
      detectedBy: 'Juan Pérez - Quality Inspector',
      project: 'Hospital Central - Phase 2',
      supplier: 'MetalWorks Ltd.',
      detectionSource: 'inspections', // ✅ NUEVO CAMPO
      affectedProduct: 'Structural Steel Columns',
      potentialImpact: 'Compromised structural integrity, potential safety hazards',
      immediateAction: 'Work stopped immediately. Area cordoned off. Emergency structural assessment requested.',
      rootCauseAnalysis: 'Welder certification expired 2 months ago. Inadequate supervision and documentation review process.',
      correctiveActionPlan: 'Re-certify all welders. Implement daily certification checks. Establish mandatory supervisor verification before critical welding operations.',
      responsiblePerson: 'Miguel Torres - Construction Manager',
      targetDate: '15/05/2025',
      actualClosureDate: '',
      verificationMethod: 'Independent structural engineer assessment + certification audit',
      status: 'in-progress',
      createdDate: '01/05/2025',
      daysOpen: 12,
      timeline: [
        {
          date: '01/05/2025 - 14:30',
          title: '🚨 Critical NC Detected',
          description: 'Improper welding technique identified during routine quality inspection.',
          type: 'detection'
        },
        {
          date: '01/05/2025 - 15:45',
          title: '⚠️ Immediate Action Taken',
          description: 'Work halted immediately. Safety perimeter established.',
          type: 'action'
        },
        {
          date: '02/05/2025 - 09:00',
          title: '🔍 Root Cause Analysis Started',
          description: 'Investigation team formed. Document review initiated.',
          type: 'investigation'
        }
      ]
    },
    {
      id: '2',
      number: 'RNC-002',
      title: 'Incorrect Foundation Depth',
      description: 'Foundation excavation depth does not match approved engineering drawings.',
      location: 'Building B - Foundation Grid B2-B4',
      severity: 'critical',
      priority: 'critical',
      detectedBy: 'Ana García - Site Engineer',
      project: 'Hospital Central - Phase 2',
      supplier: 'Foundation Pro Inc.',
      detectionSource: 'on_site', // ✅ NUEVO CAMPO
      affectedProduct: 'Concrete Foundation',
      potentialImpact: 'Structural failure risk, potential building collapse',
      immediateAction: 'All foundation work suspended. Emergency geotechnical engineer consultation requested.',
      rootCauseAnalysis: 'Foundation depth calculations were based on standard soil parameters rather than site-specific geotechnical data.',
      correctiveActionPlan: 'Revise all foundation designs based on actual site geotechnical report. Implement mandatory site-specific soil analysis for all future projects before design finalization.',
      status: 'open',
      createdDate: '03/05/2025',
      daysOpen: 10,
      timeline: [
        {
          date: '03/05/2025 - 08:30',
          title: '🚨 Critical NC Detected',
          description: 'Critical structural issue identified during foundation inspection.',
          type: 'detection'
        }
      ]
    }
  ],
  
  // Search and filtering
  searchTerm: '',
  filters: {
    status: 'all',
    priority: 'all',
    project: 'all',
    dateRange: 'all'
  },
  
  // UI State
  loading: false,
  error: null,
  showValidationModal: false,
  
  // User role (will be set from AuthContext)
  userRole: 'inspector',
  
  // Metrics calculation
  metrics: {
    totalNCs: 0,
    activeNCs: 0,
    criticalNCs: 0,
    majorNCs: 0,
    minorNCs: 0,
    resolvedNCs: 0,
    avgResolutionTime: 0
  }
};

// Action types - COMPLETOS
const NC_ACTIONS = {
  // Navigation
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  
  // Current NC Management
  SET_CURRENT_NC: 'SET_CURRENT_NC',
  UPDATE_NC_FIELD: 'UPDATE_NC_FIELD',
  CLEAR_CURRENT_NC: 'CLEAR_CURRENT_NC',
  RESET_CURRENT_NC: 'RESET_CURRENT_NC', // ✅ NUEVA ACCIÓN
  SAVE_NC: 'SAVE_NC',
  
  // Validation
  SET_VALIDATION_ERRORS: 'SET_VALIDATION_ERRORS',
  CLEAR_VALIDATION_ERRORS: 'CLEAR_VALIDATION_ERRORS',
  SET_FORM_VALIDITY: 'SET_FORM_VALIDITY',
  
  // NC List Management
  ADD_NC: 'ADD_NC',
  UPDATE_NC: 'UPDATE_NC',
  DELETE_NC: 'DELETE_NC',
  LOAD_NC_LIST: 'LOAD_NC_LIST',
  
  // Timeline Management
  ADD_TIMELINE_ENTRY: 'ADD_TIMELINE_ENTRY',
  UPDATE_TIMELINE_ENTRY: 'UPDATE_TIMELINE_ENTRY',
  
  // Filters and Search
  SET_FILTER: 'SET_FILTER',
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  
  // UI State
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SHOW_VALIDATION_MODAL: 'SHOW_VALIDATION_MODAL',
  HIDE_VALIDATION_MODAL: 'HIDE_VALIDATION_MODAL',
  
  // User Management
  SET_USER_ROLE: 'SET_USER_ROLE'
};

// Reducer function - ✅ CON NUEVA ACCIÓN RESET
const nonConformityReducer = (state, action) => {
  switch (action.type) {
    case NC_ACTIONS.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload
      };
      
    case NC_ACTIONS.SET_CURRENT_NC:
      return {
        ...state,
        currentNC: action.payload
      };
      
    case NC_ACTIONS.UPDATE_NC_FIELD:
      return {
        ...state,
        currentNC: {
          ...state.currentNC,
          [action.payload.field]: action.payload.value
        }
      };
      
    case NC_ACTIONS.CLEAR_CURRENT_NC:
      return {
        ...state,
        currentNC: { ...initialState.currentNC }
      };
      
    // ✅ NUEVA ACCIÓN: Reset completo del formulario
    case NC_ACTIONS.RESET_CURRENT_NC:
      return {
        ...state,
        currentNC: { ...initialState.currentNC },
        validationErrors: {},
        isFormValid: false
      };
      
    case NC_ACTIONS.SAVE_NC:
      const newNC = {
        ...state.currentNC,
        id: action.payload.id || Date.now().toString(),
        number: action.payload.number || `RNC-${Date.now()}`,
        createdDate: action.payload.createdDate || new Date().toLocaleDateString('en-GB'),
        daysOpen: 0,
        timeline: [{
          date: `${new Date().toLocaleDateString('en-GB')} - ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
          title: '🚨 NC Created',
          description: `Non-conformity ${action.payload.number || `RNC-${Date.now()}`} has been created and assigned.`,
          type: 'creation'
        }]
      };
      
      return {
        ...state,
        ncList: [newNC, ...state.ncList],
        currentNC: { ...initialState.currentNC }
      };
      
    case NC_ACTIONS.UPDATE_NC:
      return {
        ...state,
        ncList: state.ncList.map(nc => 
          nc.id === action.payload.id ? { ...nc, ...action.payload.updates } : nc
        )
      };
      
    case NC_ACTIONS.DELETE_NC:
      return {
        ...state,
        ncList: state.ncList.filter(nc => nc.id !== action.payload)
      };
      
    case NC_ACTIONS.LOAD_NC_LIST:
      return {
        ...state,
        ncList: action.payload
      };
      
    case NC_ACTIONS.ADD_TIMELINE_ENTRY:
      return {
        ...state,
        ncList: state.ncList.map(nc => {
          if (nc.id === action.payload.ncId) {
            return {
              ...nc,
              timeline: [action.payload.entry, ...nc.timeline]
            };
          }
          return nc;
        })
      };
      
    case NC_ACTIONS.SET_VALIDATION_ERRORS:
      return {
        ...state,
        validationErrors: action.payload
      };
      
    case NC_ACTIONS.CLEAR_VALIDATION_ERRORS:
      return {
        ...state,
        validationErrors: {}
      };
      
    case NC_ACTIONS.SET_FORM_VALIDITY:
      return {
        ...state,
        isFormValid: action.payload
      };
      
    case NC_ACTIONS.SET_FILTER:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.filterType]: action.payload.value
        }
      };
      
    case NC_ACTIONS.SET_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload
      };
      
    case NC_ACTIONS.CLEAR_FILTERS:
      return {
        ...state,
        filters: { ...initialState.filters },
        searchTerm: ''
      };
      
    case NC_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    case NC_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
      
    case NC_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    case NC_ACTIONS.SHOW_VALIDATION_MODAL:
      return {
        ...state,
        showValidationModal: true
      };
      
    case NC_ACTIONS.HIDE_VALIDATION_MODAL:
      return {
        ...state,
        showValidationModal: false
      };
      
    case NC_ACTIONS.SET_USER_ROLE:
      return {
        ...state,
        userRole: action.payload
      };
      
    default:
      return state;
  }
};

// Create context
const NonConformityContext = createContext();

// Provider component
export const NonConformityProvider = ({ children }) => {
  const [state, dispatch] = useReducer(nonConformityReducer, initialState);

  // Helper functions
  const helpers = {
    // ✅ FUNCIÓN MEJORADA: Generate NC number
    generateNCNumber: () => {
      const year = new Date().getFullYear();
      const existingNumbers = state.ncList
        .map(nc => nc.number)
        .filter(num => num.startsWith(`RNC-${year}`))
        .map(num => parseInt(num.split('-')[2]) || 0)
        .filter(num => !isNaN(num));
      
      const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
      return `RNC-${year}-${nextNumber.toString().padStart(3, '0')}`;
    },

    // ✅ FUNCIÓN ORIGINAL: Validate field
    validateField: (field, value) => {
      const errors = {};
      
      switch (field) {
        case 'priority':
        case 'ncType':
        case 'detectionSource': // ✅ NUEVA VALIDACIÓN
          if (!value || value === '') {
            errors[field] = 'This field is required';
          }
          break;
        case 'description':
          if (!value || value.trim() === '') {
            errors[field] = 'Description is required';
          } else if (value.length > 1000) {
            errors[field] = 'Description must be less than 1000 characters';
          }
          break;
        case 'quantity':
          if (!value || value === '') {
            errors[field] = 'Quantity is required';
          } else if (isNaN(value) || parseInt(value) <= 0) {
            errors[field] = 'Quantity must be a positive number';
          }
          break;
        case 'project':
        case 'projectCode':
        case 'createdBy':
        case 'sector':
        case 'componentCode':
          if (!value || value.trim() === '') {
            errors[field] = 'This field is required';
          }
          break;
        case 'date':
          if (!value) {
            errors[field] = 'Date is required';
          }
          break;
      }
      
      return errors;
    },

    // ✅ FUNCIÓN ORIGINAL: Validate entire form
    validateForm: () => {
      const requiredFields = ['title', 'description', 'location', 'detectedBy', 'responsiblePerson'];
      const errors = {};
      
      requiredFields.forEach(field => {
        const fieldErrors = helpers.validateField(field, state.currentNC[field]);
        Object.assign(errors, fieldErrors);
      });
      
      dispatch({ type: NC_ACTIONS.SET_VALIDATION_ERRORS, payload: errors });
      dispatch({ type: NC_ACTIONS.SET_FORM_VALIDITY, payload: Object.keys(errors).length === 0 });
      
      return Object.keys(errors).length === 0;
    },

    // ✅ FUNCIÓN ORIGINAL: Filter NCs
    filterNCs: (searchTerm = '', filters = {}) => {
      let filtered = [...state.ncList];
      
      // Apply search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(nc => 
          nc.title?.toLowerCase().includes(searchLower) ||
          nc.description?.toLowerCase().includes(searchLower) ||
          nc.number?.toLowerCase().includes(searchLower) ||
          nc.location?.toLowerCase().includes(searchLower) ||
          nc.project?.toLowerCase().includes(searchLower) ||
          nc.supplier?.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply filters
      const { status, priority, project } = filters;
      
      if (status && status !== 'all') {
        filtered = filtered.filter(nc => nc.status === status);
      }
      
      if (priority && priority !== 'all') {
        filtered = filtered.filter(nc => nc.priority === priority);
      }
      
      if (project && project !== 'all') {
        filtered = filtered.filter(nc => nc.project === project);
      }
      
      return filtered;
    },
    
    // ✅ FUNCIÓN ORIGINAL: Apply current filters
    getFilteredNCs: () => {
      const { searchTerm, filters } = state;
      
      let filtered = [...state.ncList];
      
      // Search functionality
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(nc => 
          nc.title?.toLowerCase().includes(searchLower) ||
          nc.description?.toLowerCase().includes(searchLower) ||
          nc.number?.toLowerCase().includes(searchLower) ||
          nc.location?.toLowerCase().includes(searchLower) ||
          nc.detectedBy?.toLowerCase().includes(searchLower) ||
          nc.project?.toLowerCase().includes(searchLower) ||
          nc.supplier?.toLowerCase().includes(searchLower)
        );
      }
      
      // Status filter
      if (filters.status !== 'all') {
        filtered = filtered.filter(nc => nc.status === filters.status);
      }
      
      // Priority filter
      if (filters.priority !== 'all') {
        filtered = filtered.filter(nc => nc.priority === filters.priority);
      }
      
      // Project filter
      if (filters.project !== 'all') {
        filtered = filtered.filter(nc => nc.project === filters.project);
      }
      
      return filtered;
    },
    
    // ✅ FUNCIÓN ORIGINAL: Get NC by ID
    getNCById: (id) => {
      return state.ncList.find(nc => nc.id === id);
    },
    
    // ✅ FUNCIÓN ORIGINAL: Check user permissions
    canAccess: (feature) => {
      const { userRole } = state;
      
      const permissions = {
        create: ['inspector', 'manager', 'admin'],
        tracking: ['inspector', 'manager', 'admin'],
        history: ['inspector', 'manager', 'admin'],
        dashboard: ['manager', 'admin'],
        database: ['manager', 'admin'],
        analytics: ['admin'],
        delete: ['admin'],
        export: ['manager', 'admin']
      };
      
      return permissions[feature]?.includes(userRole) || false;
    },
    
    // ✅ FUNCIÓN ORIGINAL: Calculate metrics
    calculateMetrics: () => {
      const activeNCs = state.ncList.filter(nc => nc.status !== 'closed' && nc.status !== 'resolved').length;
      const criticalNCs = state.ncList.filter(nc => nc.priority === 'critical').length;
      const resolvedNCs = state.ncList.filter(nc => nc.status === 'resolved' || nc.status === 'closed');
      const avgResolutionTime = resolvedNCs.length > 0 
        ? Math.round(resolvedNCs.reduce((sum, nc) => sum + (nc.daysOpen || 0), 0) / resolvedNCs.length)
        : 0;
      
      const currentMonth = new Date().getMonth();
      const closedThisMonth = state.ncList.filter(nc => {
        if (!nc.actualClosureDate) return false;
        const closureDate = new Date(nc.actualClosureDate.split('/').reverse().join('-'));
        return closureDate.getMonth() === currentMonth;
      }).length;
      
      return {
        totalNCs: state.ncList.length,
        activeNCs,
        criticalNCs,
        majorNCs: state.ncList.filter(nc => nc.priority === 'major' && nc.status !== 'closed').length,
        minorNCs: state.ncList.filter(nc => nc.priority === 'minor' && nc.status !== 'closed').length,
        resolvedNCs: resolvedNCs.length,
        avgResolutionTime,
        closedThisMonth,
        targetThisMonth: 10
      };
    },

    // ✅ FUNCIONES ADICIONALES ÚTILES
    getNCsByStatus: (status) => {
      return state.ncList.filter(nc => nc.status === status);
    },

    getNCsByPriority: (priority) => {
      return state.ncList.filter(nc => nc.priority === priority);
    },

    // ✅ NUEVA FUNCIÓN: Get NCs by detection source
    getNCsByDetectionSource: (source) => {
      return state.ncList.filter(nc => nc.detectionSource === source);
    },

    // Update NC status
    updateNCStatus: (id, newStatus) => {
      const nc = state.ncList.find(nc => nc.id === id);
      if (nc) {
        dispatch({
          type: NC_ACTIONS.UPDATE_NC,
          payload: {
            id: id,
            updates: {
              status: newStatus,
              actualClosureDate: (newStatus === 'resolved' || newStatus === 'closed') 
                ? new Date().toLocaleDateString('en-GB') 
                : nc.actualClosureDate
            }
          }
        });
      }
    },

    // Advanced filtering with multiple criteria
    advancedFilter: (filters) => {
      return state.ncList.filter(nc => {
        const matchesSearch = !filters.searchTerm || 
          nc.title?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          nc.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          nc.number?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          nc.project?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          nc.supplier?.toLowerCase().includes(filters.searchTerm.toLowerCase());

        const matchesStatus = !filters.status || filters.status === 'all' || nc.status === filters.status;
        const matchesPriority = !filters.priority || filters.priority === 'all' || nc.priority === filters.priority;
        const matchesProject = !filters.project || filters.project === 'all' || nc.project === filters.project;
        const matchesDetectionSource = !filters.detectionSource || filters.detectionSource === 'all' || nc.detectionSource === filters.detectionSource;

        return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesDetectionSource;
      });
    },

    // Get unique values for filters
    getUniqueProjects: () => {
      return [...new Set(state.ncList.map(nc => nc.project).filter(Boolean))];
    },

    getUniqueSuppliers: () => {
      return [...new Set(state.ncList.map(nc => nc.supplier).filter(Boolean))];
    },

    // ✅ NUEVA FUNCIÓN: Get unique detection sources
    getUniqueDetectionSources: () => {
      return [...new Set(state.ncList.map(nc => nc.detectionSource).filter(Boolean))];
    },

    // Timeline helpers
    addTimelineEntry: (ncId, entry) => {
      dispatch({
        type: NC_ACTIONS.ADD_TIMELINE_ENTRY,
        payload: { ncId, entry }
      });
    },

    // ✅ FUNCIONES FIREBASE
    saveNCToFirebase: async (ncData) => {
      try {
        const firebaseId = await saveNonConformity(ncData);
        
        // También actualizar estado local
        const ncWithId = { ...ncData, id: firebaseId };
        dispatch({ type: NC_ACTIONS.SAVE_NC, payload: ncWithId });
        
        return firebaseId;
      } catch (error) {
        console.error('Error guardando NC en Firebase:', error);
        
        // Fallback: guardar solo localmente
        const localId = Date.now().toString();
        const ncWithLocalId = { ...ncData, id: localId };
        dispatch({ type: NC_ACTIONS.SAVE_NC, payload: ncWithLocalId });
        
        throw error;
      }
    },

    updateNCInFirebase: async (ncId, updates) => {
      try {
        const currentNC = state.ncList.find(nc => nc.id === ncId);
        if (!currentNC) throw new Error('NC not found');

        const updatedNC = { ...currentNC, ...updates };
        
        await updateNonConformity(ncId, updatedNC);
        
        // Actualizar estado local
        dispatch({ 
          type: NC_ACTIONS.UPDATE_NC, 
          payload: { id: ncId, updates } 
        });
        
        return updatedNC;
      } catch (error) {
        console.error('Error actualizando NC en Firebase:', error);
        throw error;
      }
    },

    loadNCFromFirebase: async (ncId) => {
      try {
        const nc = await getNonConformity(ncId);
        if (nc) {
          dispatch({ type: NC_ACTIONS.SET_CURRENT_NC, payload: nc });
        }
        return nc;
      } catch (error) {
        console.error('Error cargando NC desde Firebase:', error);
        throw error;
      }
    },

    deleteNCFromFirebase: async (ncId) => {
      try {
        await deleteNonConformity(ncId);
        dispatch({ type: NC_ACTIONS.DELETE_NC, payload: ncId });
        return true;
      } catch (error) {
        console.error('Error eliminando NC en Firebase:', error);
        throw error;
      }
    },

    refreshFromFirebase: async (filters = {}) => {
      try {
        dispatch({ type: NC_ACTIONS.SET_LOADING, payload: true });
        
        const firebaseNCs = await getNonConformities(filters);
        dispatch({ type: NC_ACTIONS.LOAD_NC_LIST, payload: firebaseNCs });
        
        console.log(`✅ ${firebaseNCs.length} NCs actualizadas desde Firebase`);
        return firebaseNCs;
      } catch (error) {
        console.error('Error refrescando desde Firebase:', error);
        throw error;
      } finally {
        dispatch({ type: NC_ACTIONS.SET_LOADING, payload: false });
      }
    },

    getStatsFromFirebase: async () => {
      try {
        const stats = await getNCStats();
        return stats;
      } catch (error) {
        console.error('Error obteniendo estadísticas desde Firebase:', error);
        return helpers.calculateMetrics(); // Fallback a cálculo local
      }
    }
  };

  // Update metrics when ncList changes
  React.useEffect(() => {
    const newMetrics = helpers.calculateMetrics();
    // Metrics are calculated on-demand, no need to store in state
  }, [state.ncList]);

  const value = {
    state: {
      ...state,
      metrics: helpers.calculateMetrics() // Always fresh metrics
    },
    dispatch,
    helpers,
    actions: NC_ACTIONS
  };

  return (
    <NonConformityContext.Provider value={value}>
      {children}
    </NonConformityContext.Provider>
  );
};

// Custom hook to use the context
export const useNonConformity = () => {
  const context = useContext(NonConformityContext);
  if (!context) {
    throw new Error('useNonConformity must be used within a NonConformityProvider');
  }
  return context;
};

export default NonConformityContext;