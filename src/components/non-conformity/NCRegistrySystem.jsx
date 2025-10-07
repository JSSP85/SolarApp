import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit, Trash2, Eye, X, Download,
  BarChart3, TrendingUp, AlertCircle, CheckCircle, Clock, Save
} from 'lucide-react';
import {
  addNCToRegistry,
  updateNCInRegistry,
  deleteNCFromRegistry,
  getAllNCs,
  updateNCStatus,
  getNextNCNumber
} from '../../firebase/ncRegistryService';
import NCStatisticsCharts from './NCStatisticsCharts';

const NCRegistrySystem = ({ onBack }) => {
  const [activeView, setActiveView] = useState('registry');
  const [ncList, setNcList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNC, setSelectedNC] = useState(null);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    detectionPlace: '',
    year: ''
  });

  // Empty NC template
  const emptyNC = {
    number: '',
    year: new Date().getFullYear(),
    month: '',
    status: 'open',
    ncIssuer: '',
    dateOfDetection: new Date().toISOString().split('T')[0],
    detectionPhase: '',
    orderNumber: '',
    projectCode: '',
    projectName: '',
    ncClass: '',
    accountable: '',
    ncMainSubject: '',
    ncBriefSummary: '',
    treatment: '',
    dateOfClosure: '',
    rootCauseAnalysis: '',
    correctiveAction: ''
  };

  const [currentNC, setCurrentNC] = useState(emptyNC);

  // Options
  const statusOptions = [
    { value: 'open', label: '🔴 Open', color: 'bg-red-100 text-red-800 border-red-300' },
    { value: 'in_progress', label: '🟡 In Progress', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { value: 'closed', label: '🟢 Closed', color: 'bg-green-100 text-green-800 border-green-300' },
    { value: 'cancelled', label: '⚫ Cancelled', color: 'bg-gray-100 text-gray-800 border-gray-300' }
  ];

  const ncClassOptions = [
    { value: 'critical', label: '🚨 CRITICAL', color: 'bg-red-600 text-white' },
    { value: 'major', label: '🔴 MAJOR', color: 'bg-orange-500 text-white' },
    { value: 'minor', label: '🟡 MINOR', color: 'bg-yellow-500 text-white' }
  ];

  const detectionPhaseOptions = [
    { value: 'incoming_goods', label: '📦 Incoming goods' },
    { value: 'production', label: '🏭 Production' },
    { value: 'logistics', label: '🚛 Logistics' },
    { value: 'on_site', label: '🏗️ On site' },
    { value: 'by_client', label: '👥 By client' },
    { value: 'installation', label: '🔧 Installation' },
    { value: 'malpractice', label: '⚠️ Malpractice' }
  ];

  const monthOptions = [
    '01-jan', '02-feb', '03-mar', '04-apr', '05-may', '06-jun',
    '07-jul', '08-aug', '09-sep', '10-oct', '11-nov', '12-dec'
  ];

  // Load NCs from Firebase
  useEffect(() => {
    loadNCs();
  }, []);

  const loadNCs = async () => {
    try {
      setLoading(true);
      const ncs = await getAllNCs();
      setNcList(ncs);
    } catch (error) {
      console.error('Error loading NCs:', error);
      alert('❌ Error loading NCs from database');
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const getStatusBadge = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${option.color}`}>
        {option.label}
      </span>
    ) : null;
  };

  const getNCClassBadge = (ncClass) => {
    const option = ncClassOptions.find(opt => opt.value === ncClass);
    return option ? (
      <span className={`px-2 py-1 rounded text-xs font-bold ${option.color}`}>
        {option.label}
      </span>
    ) : null;
  };

  const getDetectionPhaseLabel = (phase) => {
    const option = detectionPhaseOptions.find(opt => opt.value === phase);
    return option ? option.label : phase;
  };

  // Filter NCs
  const filteredNCList = ncList.filter(nc => {
    if (filters.search && 
        !nc.number.includes(filters.search) && 
        !nc.projectName?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !nc.ncMainSubject?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status && nc.status !== filters.status) return false;
    if (filters.priority && nc.ncClass !== filters.priority) return false;
    if (filters.detectionPlace && nc.detectionPhase !== filters.detectionPlace) return false;
    if (filters.year && nc.year !== parseInt(filters.year)) return false;
    return true;
  });

  // Handlers
  const handleAddNC = async () => {
    const nextNumber = await getNextNCNumber();
    setCurrentNC({ ...emptyNC, number: nextNumber });
    setShowAddModal(true);
  };

  const handleSaveNC = async () => {
    if (!currentNC.number || !currentNC.ncMainSubject || !currentNC.ncClass) {
      alert('⚠️ Please complete required fields: Number, Subject, and NC Class');
      return;
    }

    try {
      if (currentNC.id) {
        // Update existing
        const { id, ...updateData } = currentNC;
        await updateNCInRegistry(id, updateData);
        alert('✅ NC updated successfully');
      } else {
        // Create new
        await addNCToRegistry(currentNC);
        alert('✅ NC created successfully');
      }

      await loadNCs();
      setShowAddModal(false);
      setShowEditPanel(false);
      setCurrentNC(emptyNC);
    } catch (error) {
      console.error('Error saving NC:', error);
      alert('❌ Error saving NC');
    }
  };

  const handleEditNC = (nc) => {
    setCurrentNC(nc);
    setShowEditPanel(true);
  };

  const handleDeleteNC = async (id) => {
    if (!window.confirm('Are you sure you want to delete this NC?')) return;

    try {
      await deleteNCFromRegistry(id);
      await loadNCs();
      alert('✅ NC deleted successfully');
    } catch (error) {
      console.error('Error deleting NC:', error);
      alert('❌ Error deleting NC');
    }
  };

  const handleViewNC = (nc) => {
    setSelectedNC(nc);
  };

  const handleUpdateStatus = async (ncId, newStatus) => {
    try {
      await updateNCStatus(ncId, newStatus);
      await loadNCs();
      alert('✅ Status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Error updating status');
    }
  };

  // NC Form Component
  const NCForm = ({ nc, onChange }) => (
    <div className="space-y-4">
      {/* Row 1: Number, Year, Month */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">
            NC Number <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={nc.number}
            onChange={(e) => onChange({ ...nc, number: e.target.value })}
            placeholder="562"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Year</label>
          <input
            type="number"
            value={nc.year}
            onChange={(e) => onChange({ ...nc, year: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Month</label>
          <select
            value={nc.month}
            onChange={(e) => onChange({ ...nc, month: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select...</option>
            {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Row 2: Status, NC Class */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">
            Status <span className="text-red-400">*</span>
          </label>
          <select
            value={nc.status}
            onChange={(e) => onChange({ ...nc, status: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">
            NC Class <span className="text-red-400">*</span>
          </label>
          <select
            value={nc.ncClass}
            onChange={(e) => onChange({ ...nc, ncClass: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select...</option>
            {ncClassOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3: NC Issuer, Date, Detection Phase */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">NC Issuer (Opening)</label>
          <input
            type="text"
            value={nc.ncIssuer}
            onChange={(e) => onChange({ ...nc, ncIssuer: e.target.value })}
            placeholder="Name"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Date of Detection</label>
          <input
            type="date"
            value={nc.dateOfDetection}
            onChange={(e) => onChange({ ...nc, dateOfDetection: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Detection Phase</label>
          <select
            value={nc.detectionPhase}
            onChange={(e) => onChange({ ...nc, detectionPhase: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select...</option>
            {detectionPhaseOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 4: Order, Project Code, Project Name (OPTIONAL) */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-400">
            Order Number <span className="text-xs">(optional)</span>
          </label>
          <input
            type="text"
            value={nc.orderNumber}
            onChange={(e) => onChange({ ...nc, orderNumber: e.target.value })}
            placeholder="PO26171"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-400">
            Project Code <span className="text-xs">(optional)</span>
          </label>
          <input
            type="text"
            value={nc.projectCode}
            onChange={(e) => onChange({ ...nc, projectCode: e.target.value })}
            placeholder="12515"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-400">
            Project Name <span className="text-xs">(optional)</span>
          </label>
          <input
            type="text"
            value={nc.projectName}
            onChange={(e) => onChange({ ...nc, projectName: e.target.value })}
            placeholder="Project name"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Accountable */}
      <div>
        <label className="block text-sm font-semibold mb-2">Accountable (Responsible/Supplier)</label>
        <input
          type="text"
          value={nc.accountable}
          onChange={(e) => onChange({ ...nc, accountable: e.target.value })}
          placeholder="Supplier or responsible party"
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* NC Main Subject */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          NC Main Subject <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={nc.ncMainSubject}
          onChange={(e) => onChange({ ...nc, ncMainSubject: e.target.value })}
          placeholder="Main subject/title of the NC"
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* NC Brief Summary */}
      <div>
        <label className="block text-sm font-semibold mb-2">NC Brief Summary & Root Cause</label>
        <textarea
          value={nc.ncBriefSummary}
          onChange={(e) => onChange({ ...nc, ncBriefSummary: e.target.value })}
          placeholder="Brief summary and root cause..."
          rows="3"
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Treatment */}
      <div>
        <label className="block text-sm font-semibold mb-2">Treatment</label>
        <textarea
          value={nc.treatment}
          onChange={(e) => onChange({ ...nc, treatment: e.target.value })}
          placeholder="Treatment description..."
          rows="2"
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Date of Closure */}
      <div>
        <label className="block text-sm font-semibold mb-2">Date of Treatment Closure</label>
        <input
          type="date"
          value={nc.dateOfClosure}
          onChange={(e) => onChange({ ...nc, dateOfClosure: e.target.value })}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Root Cause Analysis */}
      <div>
        <label className="block text-sm font-semibold mb-2">Root Cause Analysis</label>
        <textarea
          value={nc.rootCauseAnalysis}
          onChange={(e) => onChange({ ...nc, rootCauseAnalysis: e.target.value })}
          placeholder="Root cause analysis..."
          rows="3"
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Corrective Action */}
      <div>
        <label className="block text-sm font-semibold mb-2">Containment Action / Corrective Action</label>
        <textarea
          value={nc.correctiveAction}
          onChange={(e) => onChange({ ...nc, correctiveAction: e.target.value })}
          placeholder="Containment and corrective actions..."
          rows="3"
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading NC Registry...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Back to Menu Button */}
      {onBack && (
        <button 
          onClick={onBack}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all shadow-lg"
        >
          <X size={20} />
          Back to Main Menu
        </button>
      )}

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-slate-800/90 backdrop-blur-sm border-r border-slate-700 shadow-2xl z-40">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-blue-400">CONVERT</h1>
          <p className="text-xs text-slate-400 mt-1">Quality Management</p>
        </div>
        
        <nav className="p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-all">
            <span className="text-xl">🏠</span>
            <span>Dashboard</span>
          </button>
          
          <div className="space-y-1">
            <div className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-lg font-semibold">
              <span className="text-xl">📊</span>
              <span>NC Registry</span>
            </div>
            
            <button 
              onClick={() => setActiveView('registry')}
              className={`w-full flex items-center gap-3 px-4 py-2 ml-4 rounded-lg transition-all ${
                activeView === 'registry' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700/50'
              }`}
            >
              <span>📋 NC List</span>
            </button>
            
            <button 
              onClick={() => setActiveView('stats')}
              className={`w-full flex items-center gap-3 px-4 py-2 ml-4 rounded-lg transition-all ${
                activeView === 'stats' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700/50'
              }`}
            >
              <span>📈 Statistics</span>
            </button>
          </div>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-all">
            <span className="text-xl">📦</span>
            <span>Inspections</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-all">
            <span className="text-xl">📄</span>
            <span>Reports</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-all">
            <span className="text-xl">⚙️</span>
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {activeView === 'registry' ? (
          // REGISTRY VIEW
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">📋 NC Registry</h2>
                <p className="text-slate-300">Non-Conformity Management & Tracking</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleAddNC}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg"
                >
                  <Plus size={20} />
                  New NC
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search NC..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                
                <select 
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">All Status</option>
                  {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                
                <select 
                  value={filters.priority}
                  onChange={(e) => setFilters({...filters, priority: e.target.value})}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">All Classes</option>
                  {ncClassOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                
                <select 
                  value={filters.detectionPlace}
                  onChange={(e) => setFilters({...filters, detectionPlace: e.target.value})}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">All Phases</option>
                  {detectionPhaseOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                
                <select 
                  value={filters.year}
                  onChange={(e) => setFilters({...filters, year: e.target.value})}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">All Years</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>
            </div>

            {/* Results counter */}
            <div className="mb-4 text-slate-300">
              Showing <span className="font-bold text-white">{filteredNCList.length}</span> of <span className="font-bold text-white">{ncList.length}</span> NCs
            </div>

            {/* NC Table */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/80">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold">N°</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold">Year</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold">Class</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold">Subject</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold">Project</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold">Detection</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold">Accountable</th>
                      <th className="px-4 py-4 text-center text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredNCList.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center text-slate-400">
                          No NCs found with applied filters
                        </td>
                      </tr>
                    ) : (
                      filteredNCList.map((nc) => (
                        <tr key={nc.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-4 font-mono font-bold text-blue-400">{nc.number}</td>
                          <td className="px-4 py-4 text-slate-300">{nc.year}</td>
                          <td className="px-4 py-4">{getStatusBadge(nc.status)}</td>
                          <td className="px-4 py-4">{getNCClassBadge(nc.ncClass)}</td>
                          <td className="px-4 py-4 text-slate-300 max-w-xs truncate">{nc.ncMainSubject}</td>
                          <td className="px-4 py-4 text-slate-300 max-w-xs truncate">{nc.projectName}</td>
                          <td className="px-4 py-4 text-slate-300 text-sm">{getDetectionPhaseLabel(nc.detectionPhase)}</td>
                          <td className="px-4 py-4 text-slate-300 text-sm">{nc.accountable}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => handleViewNC(nc)}
                                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
                                title="View"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => handleEditNC(nc)}
                                className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all" 
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteNC(nc.id)}
                                className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all" 
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          // STATISTICS VIEW
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">📈 Statistics & Analytics</h2>
              <p className="text-slate-300">Non-Conformity Metrics Dashboard</p>
            </div>

            <NCStatisticsCharts ncList={ncList} />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditPanel) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-8 max-w-5xl w-full border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">
                {currentNC.id ? `✏️ Edit NC #${currentNC.number}` : '➕ Register New NC'}
              </h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditPanel(false);
                  setCurrentNC(emptyNC);
                }}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <NCForm nc={currentNC} onChange={setCurrentNC} />

            <div className="flex justify-end gap-4 mt-8">
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditPanel(false);
                  setCurrentNC(emptyNC);
                }}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveNC}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all"
              >
                <Save size={18} />
                Save NC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedNC && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-8 max-w-4xl w-full border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">NC #{selectedNC.number}</h3>
                <p className="text-slate-400">{selectedNC.projectName}</p>
              </div>
              <button 
                onClick={() => setSelectedNC(null)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-400">Status</label>
                  <div className="mt-2">{getStatusBadge(selectedNC.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-400">NC Class</label>
                  <div className="mt-2">{getNCClassBadge(selectedNC.ncClass)}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-400">Year</label>
                  <p className="mt-1 text-lg">{selectedNC.year}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-400">Month</label>
                  <p className="mt-1 text-lg">{selectedNC.month}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-400">Date of Detection</label>
                  <p className="mt-1 text-lg">{selectedNC.dateOfDetection}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-400">NC Issuer</label>
                  <p className="mt-1 text-lg">{selectedNC.ncIssuer || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-400">Detection Phase</label>
                  <p className="mt-1 text-lg">{getDetectionPhaseLabel(selectedNC.detectionPhase)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-400">Accountable</label>
                <p className="mt-1 text-lg">{selectedNC.accountable || '-'}</p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <label className="text-sm font-semibold text-slate-400">NC Main Subject</label>
                <p className="mt-2 text-lg">{selectedNC.ncMainSubject}</p>
              </div>

              {selectedNC.ncBriefSummary && (
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <label className="text-sm font-semibold text-slate-400">NC Brief Summary & Root Cause</label>
                  <p className="mt-2">{selectedNC.ncBriefSummary}</p>
                </div>
              )}

              {selectedNC.treatment && (
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <label className="text-sm font-semibold text-slate-400">Treatment</label>
                  <p className="mt-2">{selectedNC.treatment}</p>
                </div>
              )}

              {selectedNC.rootCauseAnalysis && (
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <label className="text-sm font-semibold text-slate-400">Root Cause Analysis</label>
                  <p className="mt-2">{selectedNC.rootCauseAnalysis}</p>
                </div>
              )}

              {selectedNC.correctiveAction && (
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <label className="text-sm font-semibold text-slate-400">Corrective Action</label>
                  <p className="mt-2">{selectedNC.correctiveAction}</p>
                </div>
              )}

              {selectedNC.dateOfClosure && (
                <div>
                  <label className="text-sm font-semibold text-slate-400">Date of Closure</label>
                  <p className="mt-1 text-lg">{selectedNC.dateOfClosure}</p>
                </div>
              )}

              {/* Quick Status Update */}
              <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700">
                <h4 className="font-semibold mb-3">🔄 Quick Status Update</h4>
                <div className="flex gap-2 flex-wrap">
                  {statusOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        handleUpdateStatus(selectedNC.id, opt.value);
                        setSelectedNC({...selectedNC, status: opt.value});
                      }}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        selectedNC.status === opt.value ? opt.color + ' font-bold' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button 
                  onClick={() => setSelectedNC(null)}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    handleEditNC(selectedNC);
                    setSelectedNC(null);
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all"
                >
                  Edit NC
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NCRegistrySystem;
