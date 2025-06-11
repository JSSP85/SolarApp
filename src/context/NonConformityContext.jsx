// src/context/NonConformityContext.jsx - ACTUALIZADO CON NUEVOS CAMPOS
import React, { createContext, useContext, useReducer } from 'react';

// Initial state for Non-Conformity Management
const initialState = {
  // Navigation state
  activeTab: 'create',
  
  // Current NC being worked on
  currentNC: {
    id: '',
    number: '',
    priority: '',
    project: '',
    projectCode: '', // ✅ NUEVO CAMPO
    date: '', // ✅ NUEVO CAMPO
    supplier: '',
    ncType: '',
    description: '',
    purchaseOrder: '', // ✅ NUEVO CAMPO (opcional)
    componentCode: '', // ✅ NUEVO CAMPO (obligatorio)
    quantity: '', // ✅ NUEVO CAMPO (obligatorio)
    component: '',
    status: 'open',
    createdBy: '', // ✅ NUEVO CAMPO (Inspector Name)
    sector: '', // ✅ NUEVO CAMPO
    createdDate: '',
    assignedTo: '',
    plannedClosureDate: '',
    actualClosureDate: '',
    rootCause: '',
    correctiveAction: '',
    preventiveAction: '',
    // ✅ NUEVOS CAMPOS PARA CORRECTIVE ACTION REQUEST
    rootCauseAnalysis: '',
    correctiveActionPlan: '',
    materialDisposition: '',
    containmentAction: '',
    photos: []
  },
  
  // Form validation
  validationErrors: {},
  isFormValid: false,
  
  // NC List for database view
  ncList: [
    {
      id: '564',
      number: 'RNC-564',
      priority: 'major',
      project: 'JESI',
      projectCode: '12926', // ✅ NUEVO CAMPO
      date: '2025-05-05', // ✅ NUEVO CAMPO
      supplier: 'SCI-FAPI',
      ncType: 'defective_product',
      description: 'Field detection that slots of 232 pali L4 LATERAL POST are smaller than minimum required, preventing assembly.',
      purchaseOrder: 'PO-2024-564', // ✅ NUEVO CAMPO
      componentCode: 'L4-155X110X50X4.5', // ✅ NUEVO CAMPO
      quantity: '232', // ✅ NUEVO CAMPO
      component: 'L4 LATERAL POST - 155X110X50X4.5MM, 4200MM, S420MC, HDG_100',
      status: 'progress',
      createdBy: 'Juan Sebastian Sanchez', // ✅ NUEVO CAMPO
      sector: 'Quality Control', // ✅ NUEVO CAMPO
      createdDate: '05/05/2025',
      assignedTo: 'Quality Control',
      plannedClosureDate: '29/05/2025',
      actualClosureDate: '08/05/2025',
      daysOpen: 3,
      materialDisposition: 'rework_by_convert',
      // ✅ NUEVOS CAMPOS PARA CORRECTIVE ACTION REQUEST
      rootCauseAnalysis: 'Investigation revealed that the punching tool dimensions were not calibrated correctly during the manufacturing process. The tool specification was 0.5mm smaller than the required minimum slot size.',
      correctiveActionPlan: 'Implement mandatory tool calibration verification before each production batch. Update quality control procedures to include dimensional verification of critical components during first article inspection.',
      timeline: [
        {
          date: '08/05/2025 - 14:30',
          title: '🔧 Corrective Action Implemented',
          description: 'Proceeded with component rework according to Valmont Solar indications. Actual treatment closure.',
          type: 'action'
        },
        {
          date: '06/05/2025 - 10:15',
          title: '📋 Action Plan Approved',
          description: 'REWORK BY CONVERT disposition approved. Planned closure date: 29/05/2025.',
          type: 'approval'
        },
        {
          date: '05/05/2025 - 16:45',
          title: '🔍 Root Cause Analysis Started',
          description: 'Investigation initiated to determine the cause of dimension error in the slots.',
          type: 'analysis'
        },
        {
          date: '05/05/2025 - 09:00',
          title: '🚨 NC Detected and Recorded',
          description: 'Field detection that slots of 232 pali L4 LATERAL POST are smaller than minimum required, preventing assembly.',
          type: 'detection'
        }
      ]
    },
    {
      id: '563',
      number: 'RNC-563',
      priority: 'critical',
      project: 'SOLAR PARK A',
      projectCode: '12345', // ✅ NUEVO CAMPO
      date: '2025-05-03', // ✅ NUEVO CAMPO
      supplier: 'SUPPLIER_B',
      ncType: 'design_error',
      description: 'Critical structural issue in main foundation design.',
      purchaseOrder: 'PO-2024-563', // ✅ NUEVO CAMPO
      componentCode: 'FOUND-001', // ✅ NUEVO CAMPO
      quantity: '15', // ✅ NUEVO CAMPO
      component: 'Main Foundation Structure',
      status: 'critical',
      createdBy: 'Maria Rodriguez', // ✅ NUEVO CAMPO
      sector: 'Engineering', // ✅ NUEVO CAMPO
      createdDate: '03/05/2025',
      assignedTo: 'Engineering Team',
      plannedClosureDate: '15/05/2025',
      daysOpen: 8,
      materialDisposition: 'reject',
      // ✅ NUEVOS CAMPOS PARA CORRECTIVE ACTION REQUEST
      rootCauseAnalysis: 'Design calculations did not account for local soil conditions. Foundation depth calculations were based on standard soil parameters rather than site-specific geotechnical data.',
      correctiveActionPlan: 'Revise all foundation designs based on actual site geotechnical report. Implement mandatory site-specific soil analysis for all future projects before design finalization.',
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

// Action types
const NC_ACTIONS = {
  // Navigation
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  
  // Current NC Management
  SET_CURRENT_NC: 'SET_CURRENT_NC',
  UPDATE_NC_FIELD: 'UPDATE_NC_FIELD',
  CLEAR_CURRENT_NC: 'CLEAR_CURRENT_NC',
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

// Reducer function
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

// Context provider component
export const NonConformityProvider = ({ children }) => {
  const [state, dispatch] = useReducer(nonConformityReducer, initialState);
  
  // Helper functions
  const helpers = {
    // Auto-generate NC number
    generateNCNumber: () => {
      const lastNumber = state.ncList.length > 0 
        ? Math.max(...state.ncList.map(nc => parseInt(nc.number.split('-')[1]) || 0))
        : 563;
      return `RNC-${lastNumber + 1}`;
    },

    // Calculate metrics
    calculateMetrics: () => {
      const { ncList } = state;
      
      const metrics = {
        totalNCs: ncList.length,
        activeNCs: ncList.filter(nc => nc.status !== 'closed' && nc.status !== 'resolved').length,
        criticalNCs: ncList.filter(nc => nc.priority === 'critical' && nc.status !== 'closed').length,
        majorNCs: ncList.filter(nc => nc.priority === 'major' && nc.status !== 'closed').length,
        minorNCs: ncList.filter(nc => nc.priority === 'minor' && nc.status !== 'closed').length,
        resolvedNCs: ncList.filter(nc => nc.status === 'resolved' || nc.status === 'closed').length,
        avgResolutionTime: ncList.filter(nc => nc.daysOpen).reduce((acc, nc) => acc + nc.daysOpen, 0) / Math.max(ncList.filter(nc => nc.daysOpen).length, 1)
      };

      return metrics;
    },

    // Validation helpers
    validateNC: (nc) => {
      const errors = {};
      
      if (!nc.priority) errors.priority = 'Priority is required';
      if (!nc.project) errors.project = 'Project is required';
      if (!nc.projectCode) errors.projectCode = 'Project Code CM is required';
      if (!nc.date) errors.date = 'Date is required';
      if (!nc.ncType) errors.ncType = 'Non-Conformity Type is required';
      if (!nc.description) errors.description = 'Problem Description is required';
      if (!nc.componentCode) errors.componentCode = 'Component Code is required';
      if (!nc.quantity) errors.quantity = 'Quantity is required';
      if (!nc.createdBy) errors.createdBy = 'Inspector Name is required';
      if (!nc.sector) errors.sector = 'Sector is required';

      return {
        isValid: Object.keys(errors).length === 0,
        errors
      };
    },

    // Permission helpers
    canAccess: (permission) => {
      // Basic permission check - can be expanded
      const rolePermissions = {
        'admin': ['create', 'tracking', 'history', 'dashboard', 'database', 'analytics'],
        'manager': ['create', 'tracking', 'history', 'dashboard'],
        'inspector': ['create', 'tracking', 'history']
      };

      return rolePermissions[state.userRole]?.includes(permission) || false;
    },

    // Search and filter helpers
    filterNCs: (searchTerm, filters) => {
      return state.ncList.filter(nc => {
        // Search term filter
        const matchesSearch = !searchTerm || 
          nc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nc.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nc.component.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const matchesStatus = filters.status === 'all' || nc.status === filters.status;

        // Priority filter
        const matchesPriority = filters.priority === 'all' || nc.priority === filters.priority;

        // Project filter
        const matchesProject = filters.project === 'all' || nc.project === filters.project;

        return matchesSearch && matchesStatus && matchesPriority && matchesProject;
      });
    }
  };

  // Update metrics when ncList changes
  React.useEffect(() => {
    const newMetrics = helpers.calculateMetrics();
    if (JSON.stringify(newMetrics) !== JSON.stringify(state.metrics)) {
      dispatch({ type: 'SET_METRICS', payload: newMetrics });
    }
  }, [state.ncList]);

  const value = {
    state: {
      ...state,
      metrics: helpers.calculateMetrics()
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