// src/components/supplier-evaluation/SupplierEvaluationWrapper.jsx
// Complete Supplier Evaluation Module with Embedded Styles
import React, { useState, useContext, createContext, useReducer } from 'react';
import { ArrowLeft, Building2, Plus, BarChart3, FileSpreadsheet, CheckCircle, Users, Calendar, User, ChevronDown, ChevronUp, Factory, Shield, Truck, Package, Save, FileText, TrendingUp, Award, AlertTriangle, XCircle, AlertCircle, Eye, Edit, Search, Filter, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './SupplierEvaluation.css';

// Supplier Evaluation Context
const SupplierEvaluationContext = createContext();

// Initial state for the reducer
const initialState = {
  activeTab: 'checklist',
  suppliers: [],
  filters: {
    category: 'all',
    classification: 'all',
    dateRange: 'all'
  },
  currentUser: null
};

// Reducer functioon
const supplierEvaluationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'ADD_SUPPLIER':
      return { ...state, suppliers: [...state.suppliers, action.payload] };
    case 'UPDATE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.map(supplier =>
          supplier.id === action.payload.id ? action.payload : supplier
        )
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    default:
      return state;
  }
};

// Provider component
export const SupplierEvaluationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(supplierEvaluationReducer, initialState);
  const { currentUser } = useAuth();

  // Initialize user on mount
  React.useEffect(() => {
    if (currentUser) {
      dispatch({ type: 'SET_USER', payload: currentUser });
    }
  }, [currentUser]);

  const value = {
    ...state,
    dispatch,
    // Helper functions
    getSuppliersByCategory: (category) => {
      if (category === 'all') return state.suppliers;
      return state.suppliers.filter(supplier => supplier.category === category);
    },
    getSuppliersByClassification: (classification) => {
      if (classification === 'all') return state.suppliers;
      return state.suppliers.filter(supplier => supplier.classification === classification);
    },
    calculateStats: () => {
      const total = state.suppliers.length;
      const classA = state.suppliers.filter(s => s.classification === 'A').length;
      const classB = state.suppliers.filter(s => s.classification === 'B').length;
      const classC = state.suppliers.filter(s => s.classification === 'C').length;
      
      return { total, classA, classB, classC };
    }
  };

  return (
    <SupplierEvaluationContext.Provider value={value}>
      {children}
    </SupplierEvaluationContext.Provider>
  );
};

// Hook to use the context
export const useSupplierEvaluation = () => {
  const context = useContext(SupplierEvaluationContext);
  if (!context) {
    throw new Error('useSupplierEvaluation must be used within a SupplierEvaluationProvider');
  }
  return context;
};

// New Checklist Panel Component (embedded)
const NewChecklistPanel = () => {
  const { dispatch } = useSupplierEvaluation();
  
  const [scores, setScores] = useState({
    kpi1: 0, kpi2: 0, kpi3: 0, kpi4: 0, kpi5: 0
  });

  const [expandedKPI, setExpandedKPI] = useState(null);

  const [supplierData, setSupplierData] = useState({
    name: '', location: '', contact: '', revenue: '', employees: '',
    category: 'metal-carpentry', workingDays: '', shifts: '', productionHours: '', capacity: ''
  });

  const [certifications, setCertifications] = useState({
    iso9001: false, iso14001: false, iso45001: false, en1090: false, ce: false
  });

  const [kpiDetails, setKpiDetails] = useState({
    kpi1: { productionLines: '', capacityPerLine: '', profileTypes: '', maxDimensions: '', laserMachines: '', bendingPresses: '', weldingStations: '', heatTreatment: false, automatedSystems: false, effectiveHours: '', operatingDays: '', extraShifts: false },
    kpi2: { qualityManager: '', qcTeamSize: '', qcCertifications: '', ownLaboratory: false, iso17025: false, tensileTest: false, tensileCapacity: '', durometer: false, spectrometer: false, ultrasound: false, cmm: false, itp: false, testFrequency: '', statisticalControl: false },
    kpi3: { supplier1: '', supplier2: '', supplier3: '', millCertificates: '', ownGalvanizing: false, galvanizingSupplier: '', galvanizingDistance: '', otherCoatings: '', fullTraceability: false, qrCodes: false, digitalRecords: false },
    kpi4: { productionEngineer: '', engineerExperience: '', weldingSupervisor: '', supervisorCertification: '', labTechnicians: '', qualifiedOperators: '', trainingProgram: false, currentCertifications: '', annualTurnover: '' },
    kpi5: { logisticsManager: '', logisticsTeam: '', ownFleet: false, vehicleCount: '', subcontractors: '', standardLeadTime: '', urgentLeadTime: '', changeFlexibility: '', maritimePackaging: false, corrosionProtection: false, labeling: '' }
  });

  const componentCategories = [
    { value: 'metal-carpentry', label: 'Metal Carpentry Components' },
    { value: 'steel-profiles', label: 'Open Steel Profiles' },
    { value: 'steel-tubes', label: 'Steel Tubes' },
    { value: 'electronics', label: 'Electronic Components' },
    { value: 'electrical', label: 'Electrical Components' },
    { value: 'fasteners', label: 'Fasteners & Hardware' }
  ];

  const updateScore = (kpi, value) => setScores(prev => ({ ...prev, [kpi]: parseInt(value) }));
  const updateKpiDetail = (kpi, field, value) => setKpiDetails(prev => ({ ...prev, [kpi]: { ...prev[kpi], [field]: value } }));
  const toggleKPI = (kpiKey) => setExpandedKPI(expandedKPI === kpiKey ? null : kpiKey);

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const maxScore = 20;
  const gai = ((totalScore / maxScore) * 100).toFixed(1);

  const getCategory = () => {
    if (gai >= 80) return { label: 'CLASS A (Qualified)', color: 'text-green-600 bg-green-50', icon: CheckCircle };
    if (gai >= 60) return { label: 'CLASS B (With Reserves)', color: 'text-yellow-600 bg-yellow-50', icon: AlertCircle };
    return { label: 'CLASS C (Not Qualified)', color: 'text-red-600 bg-red-50', icon: XCircle };
  };

  const category = getCategory();
  const CategoryIcon = category.icon;

  const handleSaveEvaluation = () => {
    if (!supplierData.name.trim()) {
      alert('Please enter supplier name');
      return;
    }

    const newSupplier = {
      id: Date.now().toString(),
      name: supplierData.name,
      location: supplierData.location,
      category: supplierData.category,
      contact: supplierData.contact,
      revenue: supplierData.revenue,
      employees: supplierData.employees,
      scores: scores,
      totalScore: totalScore,
      gai: parseFloat(gai),
      classification: gai >= 80 ? 'A' : gai >= 60 ? 'B' : 'C',
      certifications: certifications,
      kpiDetails: kpiDetails,
      evaluationDate: new Date().toISOString(),
      status: 'active'
    };

    dispatch({ type: 'ADD_SUPPLIER', payload: newSupplier });
    
    // Reset form
    setScores({ kpi1: 0, kpi2: 0, kpi3: 0, kpi4: 0, kpi5: 0 });
    setSupplierData({ name: '', location: '', contact: '', revenue: '', employees: '', category: 'metal-carpentry', workingDays: '', shifts: '', productionHours: '', capacity: '' });
    setCertifications({ iso9001: false, iso14001: false, iso45001: false, en1090: false, ce: false });

    alert('Supplier evaluation saved successfully!');
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'dashboard' });
  };

  const ScoreButton = ({ value, currentScore, onChange }) => (
    <button onClick={() => onChange(value)} className={`w-10 h-10 rounded-full border-2 font-semibold transition-all duration-200 ${currentScore === value ? 'bg-blue-500 text-white border-blue-500 shadow-lg' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}>
      {value}
    </button>
  );

  const CheckboxField = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="text-blue-600 focus:ring-blue-500" />
      <span className="text-sm">{label}</span>
    </label>
  );

  const InputField = ({ label, value, onChange, placeholder = "", type = "text" }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
    </div>
  );

  const SelectField = ({ label, value, onChange, options }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        {options.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
      </select>
    </div>
  );

  const kpiConfigs = [
    { key: 'kpi1', title: 'Production Capacity and Equipment', icon: Factory, color: 'text-blue-600' },
    { key: 'kpi2', title: 'Quality Control System', icon: Shield, color: 'text-green-600' },
    { key: 'kpi3', title: 'Raw Materials Management and Traceability', icon: Package, color: 'text-purple-600' },
    { key: 'kpi4', title: 'Human Resources and Competencies', icon: Users, color: 'text-orange-600' },
    { key: 'kpi5', title: 'Logistics Planning and Deliveries', icon: Truck, color: 'text-red-600' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="text-blue-600" size={32} />
            Supplier Evaluation - Steel Profiles
          </h1>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Calendar size={16} />
            {new Date().toLocaleDateString('en-US')}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="text-blue-600" size={20} />
          Supplier Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <InputField label="Supplier Name" value={supplierData.name} onChange={(value) => setSupplierData(prev => ({...prev, name: value}))} placeholder="Supplier name" />
          <InputField label="Location" value={supplierData.location} onChange={(value) => setSupplierData(prev => ({...prev, location: value}))} placeholder="City, Country" />
          <InputField label="Annual Revenue (USD)" value={supplierData.revenue} onChange={(value) => setSupplierData(prev => ({...prev, revenue: value}))} placeholder="50,000,000" />
          <InputField label="Number of Employees" value={supplierData.employees} onChange={(value) => setSupplierData(prev => ({...prev, employees: value}))} placeholder="140" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Component Category" value={supplierData.category} onChange={(value) => setSupplierData(prev => ({...prev, category: value}))} options={componentCategories} />
          <InputField label="Contact Person" value={supplierData.contact} onChange={(value) => setSupplierData(prev => ({...prev, contact: value}))} placeholder="Contact name and email" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Certifications</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries({ iso9001: 'ISO 9001:2015', iso14001: 'ISO 14001:2015', iso45001: 'ISO 45001', en1090: 'EN 1090', ce: 'CE Marking' }).map(([key, label]) => (
            <CheckboxField key={key} label={label} checked={certifications[key]} onChange={(checked) => setCertifications(prev => ({...prev, [key]: checked}))} />
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {kpiConfigs.map((kpi, index) => {
          const Icon = kpi.icon;
          const isExpanded = expandedKPI === kpi.key;
          
          return (
            <div key={kpi.key} className="bg-white rounded-lg shadow-sm">
              <button onClick={() => toggleKPI(kpi.key)} className="w-full p-6 text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={kpi.color} size={24} />
                    <h3 className="text-lg font-semibold text-gray-900">KPI {index + 1} - {kpi.title}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">Score: {scores[kpi.key]}/4</div>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-md font-medium text-gray-800 mb-3">Final Score</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-3">
                        {[1, 2, 3, 4].map(value => (
                          <ScoreButton key={value} value={value} currentScore={scores[kpi.key]} onChange={(val) => updateScore(kpi.key, val)} />
                        ))}
                      </div>
                      <div className="text-sm text-gray-500 ml-4">1: Not Acceptable | 2: Improvement Needed | 3: Acceptable | 4: Excellent</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Evaluation Results</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{totalScore}</div>
            <div className="text-sm text-gray-600">Total Score</div>
            <div className="text-xs text-gray-500">Maximum: {maxScore}</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{gai}%</div>
            <div className="text-sm text-gray-600">G.A.I.</div>
            <div className="text-xs text-gray-500">Global Index</div>
          </div>
          
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${category.color}`}>
              <CategoryIcon size={16} />
              <span className="font-medium text-sm">{category.label}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Classification Criteria:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>• <span className="font-medium text-green-600">Class A:</span> G.A.I. ≥ 80% (Qualified)</div>
            <div>• <span className="font-medium text-yellow-600">Class B:</span> 60% ≤ G.A.I. &lt; 80% (Qualified with reserves)</div>
            <div>• <span className="font-medium text-red-600">Class C:</span> G.A.I. &lt; 60% (Not qualified)</div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={handleSaveEvaluation} className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
            <Save size={18} />
            Save Evaluation
          </button>
          <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <FileText size={18} />
            Generate Complete Report
          </button>
        </div>
      </div>
    </div>
  );
};

// Dashboard Panel Component (embedded and simplified)
const DashboardPanel = () => {
  const { suppliers, filters, dispatch, calculateStats } = useSupplierEvaluation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const componentCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'metal-carpentry', label: 'Metal Carpentry' },
    { value: 'steel-profiles', label: 'Steel Profiles' },
    { value: 'steel-tubes', label: 'Steel Tubes' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'fasteners', label: 'Fasteners' }
  ];

  const classificationOptions = [
    { value: 'all', label: 'All Classifications' },
    { value: 'A', label: 'Class A (Qualified)' },
    { value: 'B', label: 'Class B (With Reserves)' },
    { value: 'C', label: 'Class C (Not Qualified)' }
  ];

  const filteredSuppliers = React.useMemo(() => {
    let filtered = suppliers;
    if (filters.category !== 'all') {
      filtered = filtered.filter(supplier => supplier.category === filters.category);
    }
    if (filters.classification !== 'all') {
      filtered = filtered.filter(supplier => supplier.classification === filters.classification);
    }
    if (searchTerm.trim()) {
      filtered = filtered.filter(supplier => 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [suppliers, filters, searchTerm]);

  const stats = calculateStats();

  const getClassificationDisplay = (classification) => {
    switch (classification) {
      case 'A': return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Class A' };
      case 'B': return { icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50', label: 'Class B' };
      case 'C': return { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', label: 'Class C' };
      default: return { icon: AlertCircle, color: 'text-gray-600', bgColor: 'bg-gray-50', label: 'Unrated' };
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'metal-carpentry': return Factory;
      case 'steel-profiles':
      case 'steel-tubes': return Package;
      case 'electronics':
      case 'electrical': return Shield;
      case 'fasteners': return Truck;
      default: return Building2;
    }
  };

  const updateFilter = (filterType, value) => {
    dispatch({ type: 'SET_FILTERS', payload: { [filterType]: value } });
  };

  const StatCard = ({ title, value, icon: Icon, color, bgColor, subtitle }) => (
    <div className={`${bgColor} rounded-lg p-6 border-l-4 ${color.replace('text-', 'border-')}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className={`${color} opacity-80`} size={32} />
      </div>
    </div>
  );

  const SupplierCard = ({ supplier }) => {
    const classDisplay = getClassificationDisplay(supplier.classification);
    const CategoryIcon = getCategoryIcon(supplier.category);
    const ClassIcon = classDisplay.icon;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-lg ${classDisplay.bgColor}`}>
              <CategoryIcon className={classDisplay.color} size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{supplier.name}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <MapPin size={14} />
                <span>{supplier.location}</span>
              </div>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${classDisplay.bgColor}`}>
            <ClassIcon size={14} className={classDisplay.color} />
            <span className={`text-xs font-medium ${classDisplay.color}`}>{classDisplay.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">G.A.I. Score</p>
            <p className={`text-xl font-bold ${supplier.gai >= 80 ? 'text-green-600' : supplier.gai >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{supplier.gai}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Category</p>
            <p className="text-sm font-medium text-gray-900 capitalize">{supplier.category.replace('-', ' ')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Calendar size={12} />
          <span>Evaluated: {new Date(supplier.evaluationDate).toLocaleDateString()}</span>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setSelectedSupplier(supplier)} className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1">
            <Eye size={14} />
            View Details
          </button>
          <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1">
            <Edit size={14} />
            Edit
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Supplier Dashboard</h1>
        <p className="text-gray-600">Manage and monitor your supplier evaluations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Suppliers" value={stats.total} icon={Building2} color="text-blue-600" bgColor="bg-blue-50" subtitle="Evaluated suppliers" />
        <StatCard title="Class A Suppliers" value={stats.classA} icon={Award} color="text-green-600" bgColor="bg-green-50" subtitle="Qualified suppliers" />
        <StatCard title="Class B Suppliers" value={stats.classB} icon={AlertTriangle} color="text-yellow-600" bgColor="bg-yellow-50" subtitle="With reserves" />
        <StatCard title="Class C Suppliers" value={stats.classC} icon={XCircle} color="text-red-600" bgColor="bg-red-50" subtitle="Not qualified" />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search suppliers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            
            <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {componentCategories.map(cat => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}
            </select>

            <select value={filters.classification} onChange={(e) => updateFilter('classification', e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {classificationOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
          </div>
        </div>
      </div>

      {filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
          <p className="text-gray-600 mb-4">
            {suppliers.length === 0 
              ? "No suppliers have been evaluated yet. Start by creating a new supplier checklist."
              : "No suppliers match your current filters. Try adjusting your search criteria."
            }
          </p>
          {suppliers.length === 0 && (
            <button onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'checklist' })} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Evaluate First Supplier
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSuppliers.map(supplier => (<SupplierCard key={supplier.id} supplier={supplier} />))}
        </div>
      )}

      {/* Simplified supplier details modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedSupplier.name}</h2>
              <button onClick={() => setSelectedSupplier(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{selectedSupplier.gai}%</div>
                <div className="text-sm text-gray-600">G.A.I. Score</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{selectedSupplier.totalScore}</div>
                <div className="text-sm text-gray-600">Total Score</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sidebar component
const SupplierEvaluationSidebar = () => {
  const { activeTab, dispatch } = useSupplierEvaluation();

  const sidebarItems = [
    { id: 'checklist', label: 'New Supplier Checklist', icon: Plus, description: 'Evaluate new supplier' },
    { id: 'dashboard', label: 'Supplier Dashboard', icon: BarChart3, description: 'View all suppliers' }
  ];

  return (
    <div className="se-sidebar">
      <div className="se-sidebar-header">
        <div className="se-sidebar-title">
          <Building2 size={24} className="se-sidebar-icon" />
          <span>Supplier Evaluation</span>
        </div>
      </div>

      <div className="se-sidebar-menu">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} className={`se-sidebar-item ${activeTab === item.id ? 'se-sidebar-item-active' : ''}`} onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: item.id })}>
              <div className="se-sidebar-item-icon">
                <Icon size={20} />
              </div>
              <div className="se-sidebar-item-content">
                <div className="se-sidebar-item-label">{item.label}</div>
                <div className="se-sidebar-item-desc">{item.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="se-sidebar-footer">
        <div className="se-sidebar-info">
          <Users size={16} />
          <span>Supplier Management System</span>
        </div>
      </div>
    </div>
  );
};

// Main content component
const SupplierEvaluationContent = () => {
  const { activeTab, currentUser, dispatch } = useSupplierEvaluation();

  const renderActivePanel = () => {
    switch (activeTab) {
      case 'checklist': return <NewChecklistPanel />;
      case 'dashboard': return <DashboardPanel />;
      default: return <NewChecklistPanel />;
    }
  };

  const getBreadcrumbTitle = (tab) => {
    const titles = { 'checklist': 'New Checklist', 'dashboard': 'Dashboard' };
    return titles[tab] || 'New Checklist';
  };

  return (
    <div className="se-app-container">
      <SupplierEvaluationSidebar />
      
      <div className="se-main-content">
        <div className="se-content-header-blue">
          <div className="se-header-info">
            <h1 className="se-main-title">Supplier Evaluation Management</h1>
            <div className="se-breadcrumb">Quality Control → Supplier Evaluation → {getBreadcrumbTitle(activeTab)}</div>
          </div>
          
          <div className="se-header-actions">
            {activeTab !== 'checklist' && (
              <button className="se-btn se-btn-primary" onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'checklist' })}>
                <span className="se-btn-icon">➕</span>
                Quick Evaluate Supplier
              </button>
            )}
            
            <div className="se-user-role-indicator">
              <span className={`se-role-badge se-role-${currentUser?.role || 'unknown'}`}>
                {currentUser?.displayName || 'Unknown User'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="se-panel-content">
          {renderActivePanel()}
        </div>
      </div>

      {/* Embedded CSS Styles */}
      <style jsx>{`
        .se-app-container {
          display: flex;
          height: 100vh;
          background: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .se-sidebar {
          width: 320px;
          background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
        }

        .se-sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.2);
        }

        .se-sidebar-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: white;
          font-size: 1.125rem;
          font-weight: 700;
        }

        .se-sidebar-icon {
          color: #60a5fa;
        }

        .se-sidebar-menu {
          flex: 1;
          padding: 1.5rem 0;
        }

        .se-sidebar-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 100%;
          padding: 1rem 1.5rem;
          border: none;
          background: transparent;
          color: #cbd5e1;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        }

        .se-sidebar-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-left-color: #60a5fa;
        }

        .se-sidebar-item-active {
          background: rgba(59, 130, 246, 0.2) !important;
          color: white !important;
          border-left-color: #3b82f6 !important;
        }

        .se-sidebar-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .se-sidebar-item-active .se-sidebar-item-icon {
          background: rgba(59, 130, 246, 0.3);
        }

        .se-sidebar-item-content {
          flex: 1;
        }

        .se-sidebar-item-label {
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .se-sidebar-item-desc {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .se-sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .se-sidebar-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          font-size: 0.75rem;
        }

        .se-main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .se-content-header-blue {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .se-header-info {
          flex: 1;
        }

        .se-main-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .se-breadcrumb {
          font-size: 0.875rem;
          opacity: 0.9;
          font-weight: 500;
        }

        .se-header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .se-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .se-btn-primary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .se-btn-primary:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .se-btn-icon {
          font-size: 16px;
        }

        .se-user-role-indicator .se-role-badge {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(5px);
        }

        .se-role-admin {
          background: rgba(236, 72, 153, 0.2) !important;
          color: rgba(255, 182, 217, 1) !important;
          border: 1px solid rgba(236, 72, 153, 0.3) !important;
        }

        .se-role-manager {
          background: rgba(255, 161, 86, 0.2) !important;
          color: rgba(255, 206, 154, 1) !important;
          border: 1px solid rgba(255, 161, 86, 0.3) !important;
        }

        .se-panel-content {
          flex: 1;
          overflow: auto;
          background: #f8fafc;
        }

        @media (max-width: 768px) {
          .se-sidebar {
            width: 280px;
          }
          
          .se-content-header-blue {
            padding: 1rem;
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .se-header-actions {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

// Main App Component with Provider
const SupplierEvaluationWrapper = ({ onBack }) => {
  return (
    <SupplierEvaluationProvider>
      <div className="supplier-evaluation-wrapper">
        {onBack && (
          <button className="se-back-to-menu" onClick={onBack} title="Back to Main Menu">
            <ArrowLeft size={16} />
            <span>Back to Main Menu</span>
          </button>
        )}
        
        <SupplierEvaluationContent />
      </div>

      <style jsx>{`
        .supplier-evaluation-wrapper {
          height: 100vh;
          position: relative;
          isolation: isolate;
        }

        .se-back-to-menu {
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(30, 41, 59, 0.95);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .se-back-to-menu:hover {
          background: rgba(30, 41, 59, 1);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </SupplierEvaluationProvider>
  );
};

export default SupplierEvaluationWrapper;