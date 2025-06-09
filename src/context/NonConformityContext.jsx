// src/context/NonConformityContext.jsx
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
    projectCode: '',
    supplier: '',
    ncType: '',
    description: '',
    component: '',
    status: 'open',
    createdBy: '',
    createdDate: '',
    assignedTo: '',
    plannedClosureDate: '',
    actualClosureDate: '',
    rootCause: '',
    correctiveAction: '',
    preventiveAction: '',
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
      projectCode: '12926',
      supplier: 'SCI-FAPI',
      ncType: 'defective_product',
      description: 'Field detection that slots of 232 pali L4 LATERAL POST are smaller than minimum required, preventing assembly.',
      component: 'L4 LATERAL POST - 155X110X50X4.5MM, 4200MM, S420MC, HDG_100',
      status: 'progress',
      createdBy: 'Juan Sebastian Sanchez',
      createdDate: '05/05/2025',
      assignedTo: 'Quality Control',
      plannedClosureDate: '29/05/2025',
      actualClosureDate: '08/05/2025',
      daysOpen: 3,
      materialDisposition: 'rework_by_convert',
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
      projectCode: '12345',
      supplier: 'SUPPLIER_B',
      ncType: 'design_error',
      description: 'Critical structural issue in main foundation design.',
      component: 'Main Structure',
      status: 'open',
      createdBy: 'Inspector Team',
      createdDate: '03/05/2025',
      daysOpen: 5,
      timeline: []
    },
    {
      id: '562',
      number: 'RNC-562',
      priority: 'minor',
      project: 'JESI',
      projectCode: '12926',
      supplier: 'SCI-FAPI',
      ncType: 'damaged_package',
      description: 'Minor damage to bracket packaging during transport.',
      component: 'Brackets',
      status: 'resolved',
      createdBy: 'Logistics Team',
      createdDate: '01/05/2025',
      actualClosureDate: '04/05/2025',
      daysOpen: 7,
      timeline: []
    }
  ],
  
  // Filters and search
  filters: {
    status: 'all',
    priority: 'all',
    project: 'all',
    supplier: 'all',
    dateRange: 'all'
  },
  searchTerm: '',
  
  // Dashboard metrics
  metrics: {
    activeNCs: 23,
    criticalNCs: 3,
    avgResolutionTime: 12,
    closedThisMonth: 8,
    targetThisMonth: 10
  },
  
  // User permissions
  userRole: 'inspector', // 'inspector', 'manager', 'admin'
  
  // UI state
  loading: false,
  error: null,
  showValidationModal: false
};

// Action types
export const NC_ACTIONS = {
  // Navigation
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  
  // NC Form Management
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
        : 564;
      return `RNC-${lastNumber + 1}`;
    },
    
    // Validate required fields for NC creation
    validateNC: (nc = state.currentNC) => {
      const errors = {};
      
      if (!nc.priority) errors.priority = 'Priority is required';
      if (!nc.project) errors.project = 'Project is required';
      if (!nc.description) errors.description = 'Description is required';
      if (!nc.ncType) errors.ncType = 'Non-conformity type is required';
      
      const isValid = Object.keys(errors).length === 0;
      
      dispatch({ type: NC_ACTIONS.SET_VALIDATION_ERRORS, payload: errors });
      dispatch({ type: NC_ACTIONS.SET_FORM_VALIDITY, payload: isValid });
      
      return { isValid, errors };
    },
    
    // Get filtered NC list
    getFilteredNCs: () => {
      let filtered = [...state.ncList];
      
      // Apply status filter
      if (state.filters.status !== 'all') {
        filtered = filtered.filter(nc => nc.status === state.filters.status);
      }
      
      // Apply priority filter
      if (state.filters.priority !== 'all') {
        filtered = filtered.filter(nc => nc.priority === state.filters.priority);
      }
      
      // Apply project filter
      if (state.filters.project !== 'all') {
        filtered = filtered.filter(nc => nc.project === state.filters.project);
      }
      
      // Apply search term
      if (state.searchTerm) {
        const searchLower = state.searchTerm.toLowerCase();
        filtered = filtered.filter(nc => 
          nc.number.toLowerCase().includes(searchLower) ||
          nc.project.toLowerCase().includes(searchLower) ||
          nc.supplier.toLowerCase().includes(searchLower) ||
          nc.description.toLowerCase().includes(searchLower) ||
          nc.component.toLowerCase().includes(searchLower)
        );
      }
      
      return filtered;
    },
    
    // Get NC by ID
    getNCById: (id) => {
      return state.ncList.find(nc => nc.id === id);
    },
    
    // Check user permissions
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
    
    // Calculate metrics
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
        activeNCs,
        criticalNCs,
        avgResolutionTime,
        closedThisMonth,
        targetThisMonth: 10
      };
    }
  };
  
  return (
    <NonConformityContext.Provider value={{ state, dispatch, helpers }}>
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