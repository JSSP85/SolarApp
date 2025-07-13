// src/components/supplier-evaluation/SupplierEvaluationWrapper.jsx - VERSIÓN MEJORADA
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../common/BackButton';
import { saveSupplierEvaluation, updateSupplierEvaluation, getAllSupplierEvaluations, deleteSupplierEvaluation } from '../../firebase/supplierEvaluationService';
import { generateSupplierEvaluationPDF } from '../../services/supplierEvaluationPDFService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, ScatterChart, Scatter, LineChart, Line } from 'recharts';
import styles from '../../styles/SupplierEvaluation.module.css';

const SUPPLIER_CATEGORIES = [
  'Metal Carpentry',
  'Open Steel Profiles', 
  'Steel Tubes',
  'Electronics',
  'Electrical Components',
  'Hardware/Fasteners'
];

const KPI_DESCRIPTIONS = {
  kpi1: 'Production Capacity & Equipment',
  kpi2: 'Quality Control System',
  kpi3: 'Raw Materials Management & Traceability',
  kpi4: 'Human Resources & Competencies',
  kpi5: 'Logistics Planning & Deliveries'
};

const SCORE_LABELS = {
  1: 'Not Acceptable/Reject',
  2: 'Improvement/Update Required',
  3: 'Acceptable',
  4: 'Excellent (Benchmark)'
};

// ✅ NUEVOS DETALLES AMPLIADOS PARA CADA KPI BASADOS EN EL PDF
const KPI_DETAILED_OPTIONS = {
  kpi1: {
    productionLines: {
      label: 'Production Lines',
      options: ['Number of rolling/forming lines', 'Capacity per line (ton/day)', 'Profile types produced', 'Max/min dimensions']
    },
    mainEquipment: {
      label: 'Main Equipment', 
      options: ['Laser cutting machines', 'Bending presses (capacity ton)', 'TIG/MIG welding stations', 'Heat treatment furnaces', 'Automated handling systems']
    },
    productionSchedule: {
      label: 'Production Schedule',
      options: ['Effective hours/day', 'Operating days/week', 'Additional shift flexibility']
    },
    machineCapacity: {
      label: 'Machine Capacity',
      options: ['Production volume', 'Equipment condition', 'Maintenance program', 'Technology level', 'Expansion capability']
    }
  },
  kpi2: {
    qualityDepartment: {
      label: 'Quality Department',
      options: ['Quality manager (title/experience)', 'QC team size', 'Personnel certifications']
    },
    laboratoryEquipment: {
      label: 'Laboratory & Testing Equipment', 
      options: ['Own laboratory', 'ISO 17025 accreditation', 'Tensile testing machine (kN capacity)', 'Hardness testers', 'Chemical analysis spectrometer', 'Ultrasonic/NDT equipment', 'CMM (coordinate measuring machine)']
    },
    procedures: {
      label: 'Procedures',
      options: ['Inspection & Test Plan (ITP)', 'Testing frequency', 'Statistical process control']
    },
    qualitySystem: {
      label: 'Quality System',
      options: ['Testing equipment', 'Inspection procedures', 'Qualification certificates', 'Control documentation', 'Nonconformity handling']
    }
  },
  kpi3: {
    steelSuppliers: {
      label: 'Steel Suppliers',
      options: ['Main supplier 1', 'Main supplier 2', 'Main supplier 3', 'Mill certificates (always/sometimes/never)']
    },
    galvanizingCoatings: {
      label: 'Galvanizing/Coatings',
      options: ['Own galvanizing', 'Galvanizing supplier', 'Distance to galvanizer (km)', 'Other available coatings']
    },
    traceability: {
      label: 'Traceability',
      options: ['Complete traceability system', 'QR code/identification on products', 'Digital records']
    },
    supplierCertification: {
      label: 'Supplier Management',
      options: ['Material traceability', 'Test certificates', 'Inventory management', 'Quality agreements', 'Inspection reports']
    }
  },
  kpi4: {
    keyPersonnel: {
      label: 'Key Personnel',
      options: ['Production engineer (experience years)', 'Welding supervisor (certification)', 'Certified lab technicians', 'Qualified operators']
    },
    training: {
      label: 'Training',
      options: ['Training program', 'Current certifications', 'Annual staff turnover %']
    },
    competencies: {
      label: 'Technical Competencies', 
      options: ['Technical competencies', 'Training programs', 'Team size', 'Experience level', 'Continuous improvement']
    }
  },
  kpi5: {
    logisticsCapacity: {
      label: 'Logistics Capacity',
      options: ['Logistics manager', 'Logistics team size', 'Own fleet (vehicles)', 'Logistics subcontractors']
    },
    deliveryTimes: {
      label: 'Delivery Times',
      options: ['Standard lead time (weeks)', 'Emergency lead time (days)', 'Change flexibility (high/medium/low)']
    },
    packagingProtection: {
      label: 'Packaging & Protection',
      options: ['Maritime transport packaging', 'Anti-corrosion protection during transport', 'Identification and labeling (complete/basic/insufficient)']
    },
    logistics: {
      label: 'Logistics Planning',
      options: ['Team size', 'Own fleet', 'Fleet vehicles', 'Subcontractors', 'Standard delivery times', 'Emergency capacity']
    }
  }
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const SupplierEvaluationWrapper = ({ onBackToMenu }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedKPIs, setExpandedKPIs] = useState({});
  
  // ✅ ESTADOS PARA FUNCIONALIDADES CRUD Y MODALES
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  // ✅ NUEVOS ESTADOS PARA FILTROS EN ANALYTICS
  const [analyticsFilters, setAnalyticsFilters] = useState({
    selectedSuppliers: [],
    selectedKPIs: ['KPI1', 'KPI2', 'KPI3', 'KPI4', 'KPI5'],
    supplierClass: 'all', // 'all', 'A', 'B', 'C'
    category: 'all'
  });

  // Form state for new supplier checklist
  const [formData, setFormData] = useState({
    id: null,
    supplierName: '',
    category: '',
    location: '',
    contactPerson: '',
    auditDate: new Date().toISOString().split('T')[0],
    auditorName: '',
    activityField: '',
    auditType: '',
    certifications: {
      iso9001: false,
      iso14001: false,
      iso45001: false,
      en1090: false,
      ceMarking: false,
      others: ''
    },
    companyData: {
      annualRevenue: '',
      employees: '',
      workingDays: '',
      shifts: '',
      productionHours: '',
      installedCapacity: ''
    },
    kpiScores: {
      kpi1: 0,
      kpi2: 0,
      kpi3: 0,
      kpi4: 0,
      kpi5: 0
    },
    kpiDetails: {
      kpi1: {
        productionLines: '',
        mainEquipment: '',
        productionSchedule: '',
        machineCapacity: '',
        productionVolume: '',
        equipmentCondition: '',
        maintenanceProgram: '',
        technologyLevel: '',
        expansionCapability: ''
      },
      kpi2: {
        qualityDepartment: '',
        laboratoryEquipment: '',
        procedures: '',
        qualitySystem: '',
        testingEquipment: '',
        inspectionProcedures: '',
        qualificationCertificates: '',
        controlDocumentation: '',
        nonconformityHandling: ''
      },
      kpi3: {
        steelSuppliers: '',
        galvanizingCoatings: '',
        traceability: '',
        supplierCertification: '',
        materialTraceability: '',
        testCertificates: '',
        inventoryManagement: '',
        qualityAgreements: '',
        inspectionReports: ''
      },
      kpi4: {
        keyPersonnel: '',
        training: '',
        competencies: '',
        technicalCompetencies: '',
        trainingPrograms: '',
        teamSize: '',
        experienceLevel: '',
        continuousImprovement: ''
      },
      kpi5: {
        logisticsCapacity: '',
        deliveryTimes: '',
        packagingProtection: '',
        logistics: '',
        ownFleet: false,
        fleetVehicles: '',
        logisticsSubcontractors: '',
        standardLeadTime: '',
        emergencyLeadTime: '',
        changeFlexibility: '',
        packagingSystem: '',
        protectionTransport: '',
        identification: ''
      }
    },
    observations: {
      strengths: '',
      improvements: '',
      actions: '',
      followUpDate: ''
    },
    decision: '',
    conditions: ''
  });

  // Load suppliers on component mount
  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const suppliersData = await getAllSupplierEvaluations();
      console.log('Loaded suppliers:', suppliersData);
      setSuppliers(suppliersData || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      alert('Error loading suppliers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'newChecklist') {
      setEditingSupplier(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      supplierName: '',
      category: '',
      location: '',
      contactPerson: '',
      auditDate: new Date().toISOString().split('T')[0],
      auditorName: '',
      activityField: '',
      auditType: '',
      certifications: {
        iso9001: false,
        iso14001: false,
        iso45001: false,
        en1090: false,
        ceMarking: false,
        others: ''
      },
      companyData: {
        annualRevenue: '',
        employees: '',
        workingDays: '',
        shifts: '',
        productionHours: '',
        installedCapacity: ''
      },
      kpiScores: {
        kpi1: 0,
        kpi2: 0,
        kpi3: 0,
        kpi4: 0,
        kpi5: 0
      },
      kpiDetails: {
        kpi1: {
          productionLines: '',
          mainEquipment: '',
          productionSchedule: '',
          machineCapacity: '',
          productionVolume: '',
          equipmentCondition: '',
          maintenanceProgram: '',
          technologyLevel: '',
          expansionCapability: ''
        },
        kpi2: {
          qualityDepartment: '',
          laboratoryEquipment: '',
          procedures: '',
          qualitySystem: '',
          testingEquipment: '',
          inspectionProcedures: '',
          qualificationCertificates: '',
          controlDocumentation: '',
          nonconformityHandling: ''
        },
        kpi3: {
          steelSuppliers: '',
          galvanizingCoatings: '',
          traceability: '',
          supplierCertification: '',
          materialTraceability: '',
          testCertificates: '',
          inventoryManagement: '',
          qualityAgreements: '',
          inspectionReports: ''
        },
        kpi4: {
          keyPersonnel: '',
          training: '',
          competencies: '',
          technicalCompetencies: '',
          trainingPrograms: '',
          teamSize: '',
          experienceLevel: '',
          continuousImprovement: ''
        },
        kpi5: {
          logisticsCapacity: '',
          deliveryTimes: '',
          packagingProtection: '',
          logistics: '',
          ownFleet: false,
          fleetVehicles: '',
          logisticsSubcontractors: '',
          standardLeadTime: '',
          emergencyLeadTime: '',
          changeFlexibility: '',
          packagingSystem: '',
          protectionTransport: '',
          identification: ''
        }
      },
      observations: {
        strengths: '',
        improvements: '',
        actions: '',
        followUpDate: ''
      },
      decision: '',
      conditions: ''
    });
  };

  const calculateGAI = (kpiScores) => {
    if (!kpiScores) return 0;
    const total = Object.values(kpiScores).reduce((sum, score) => sum + (score || 0), 0);
    const maxScore = 20; // 5 KPIs × 4 max score each
    return Math.round((total / maxScore) * 100);
  };

  const getSupplierClass = (gai) => {
    if (gai >= 80) return 'A';
    if (gai >= 60) return 'B';
    return 'C';
  };

  const getClassColor = (supplierClass) => {
    switch (supplierClass) {
      case 'A': return '#10b981';
      case 'B': return '#f59e0b';
      case 'C': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getClassBadgeStyle = (supplierClass) => ({
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: getClassColor(supplierClass)
  });

  const toggleKPIExpansion = (kpi) => {
    setExpandedKPIs(prev => ({
      ...prev,
      [kpi]: !prev[kpi]
    }));
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleKPIScoreChange = (kpi, score) => {
    setFormData(prev => ({
      ...prev,
      kpiScores: {
        ...prev.kpiScores,
        [kpi]: parseInt(score) || 0
      }
    }));
  };

  const handleKPIDetailChange = (kpi, field, value) => {
    setFormData(prev => ({
      ...prev,
      kpiDetails: {
        ...prev.kpiDetails,
        [kpi]: {
          ...prev.kpiDetails[kpi],
          [field]: value
        }
      }
    }));
  };

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailModal(true);
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      id: supplier.id,
      supplierName: supplier.supplierName || '',
      category: supplier.category || '',
      location: supplier.location || '',
      contactPerson: supplier.contactPerson || '',
      auditDate: supplier.auditDate || new Date().toISOString().split('T')[0],
      auditorName: supplier.auditorName || '',
      activityField: supplier.activityField || '',
      auditType: supplier.auditType || '',
      certifications: supplier.certifications || {
        iso9001: false,
        iso14001: false,
        iso45001: false,
        en1090: false,
        ceMarking: false,
        others: ''
      },
      companyData: supplier.companyData || {
        annualRevenue: '',
        employees: '',
        workingDays: '',
        shifts: '',
        productionHours: '',
        installedCapacity: ''
      },
      kpiScores: supplier.kpiScores || {
        kpi1: 0,
        kpi2: 0,
        kpi3: 0,
        kpi4: 0,
        kpi5: 0
      },
      kpiDetails: supplier.kpiDetails || formData.kpiDetails,
      observations: supplier.observations || {
        strengths: '',
        improvements: '',
        actions: '',
        followUpDate: ''
      },
      decision: supplier.decision || '',
      conditions: supplier.conditions || ''
    });
    setActiveTab('newChecklist');
  };

  const handleDeleteSupplier = (supplier) => {
    setSupplierToDelete(supplier);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;

    setLoading(true);
    try {
      await deleteSupplierEvaluation(supplierToDelete.id);
      await loadSuppliers();
      setShowDeleteConfirm(false);
      setSupplierToDelete(null);
      alert('Supplier evaluation deleted successfully!');
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Error deleting supplier evaluation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.supplierName.trim()) {
      alert('Please enter supplier name');
      return;
    }

    setLoading(true);
    
    try {
      const gai = calculateGAI(formData.kpiScores);
      const supplierClass = getSupplierClass(gai);
      
      const submissionData = {
        ...formData,
        gai,
        supplierClass,
        userId: currentUser?.uid,
        createdAt: editingSupplier ? formData.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let savedSupplier;
      if (editingSupplier) {
        savedSupplier = await updateSupplierEvaluation(formData.id, submissionData);
        alert('Supplier evaluation updated successfully!');
      } else {
        savedSupplier = await saveSupplierEvaluation(submissionData);
        alert('Supplier evaluation saved successfully!');
      }

      // Generate and download PDF
      await generateSupplierEvaluationPDF(savedSupplier);
      
      resetForm();
      setEditingSupplier(null);
      await loadSuppliers();
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error saving supplier evaluation:', error);
      alert('Error saving supplier evaluation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNCIÓN PARA PREPARAR DATOS DE GRÁFICOS CON FILTROS
  const prepareKPIComparisonData = () => {
    let filteredSuppliers = [...suppliers];
    
    // Aplicar filtros
    if (analyticsFilters.selectedSuppliers.length > 0) {
      filteredSuppliers = filteredSuppliers.filter(s => 
        analyticsFilters.selectedSuppliers.includes(s.supplierName)
      );
    }
    
    if (analyticsFilters.supplierClass !== 'all') {
      filteredSuppliers = filteredSuppliers.filter(s => {
        const supplierClass = s.supplierClass || getSupplierClass(s.gai || calculateGAI(s.kpiScores));
        return supplierClass === analyticsFilters.supplierClass;
      });
    }
    
    if (analyticsFilters.category !== 'all') {
      filteredSuppliers = filteredSuppliers.filter(s => s.category === analyticsFilters.category);
    }

    return filteredSuppliers.map(supplier => {
      const data = {
        name: supplier.supplierName.length > 12 ? 
          supplier.supplierName.substring(0, 12) + '...' 
          : supplier.supplierName,
        fullName: supplier.supplierName,
        GAI: supplier.gai || calculateGAI(supplier.kpiScores),
        class: supplier.supplierClass || getSupplierClass(supplier.gai || calculateGAI(supplier.kpiScores))
      };

      // Solo incluir KPIs seleccionados
      analyticsFilters.selectedKPIs.forEach(kpi => {
        data[kpi] = supplier.kpiScores?.[kpi.toLowerCase()] || 0;
      });

      return data;
    });
  };

  const prepareRadarData = () => {
    if (suppliers.length === 0) return [];
    
    const avgKPIs = {
      KPI1: 0, KPI2: 0, KPI3: 0, KPI4: 0, KPI5: 0
    };
    
    suppliers.forEach(supplier => {
      avgKPIs.KPI1 += supplier.kpiScores?.kpi1 || 0;
      avgKPIs.KPI2 += supplier.kpiScores?.kpi2 || 0;
      avgKPIs.KPI3 += supplier.kpiScores?.kpi3 || 0;
      avgKPIs.KPI4 += supplier.kpiScores?.kpi4 || 0;
      avgKPIs.KPI5 += supplier.kpiScores?.kpi5 || 0;
    });
    
    Object.keys(avgKPIs).forEach(key => {
      avgKPIs[key] = avgKPIs[key] / suppliers.length;
    });

    return [
      { subject: 'Production Capacity', A: avgKPIs.KPI1, fullMark: 4 },
      { subject: 'Quality Control', A: avgKPIs.KPI2, fullMark: 4 },
      { subject: 'Raw Materials', A: avgKPIs.KPI3, fullMark: 4 },
      { subject: 'Human Resources', A: avgKPIs.KPI4, fullMark: 4 },
      { subject: 'Logistics', A: avgKPIs.KPI5, fullMark: 4 }
    ];
  };

  const prepareClassDistributionData = () => {
    const distribution = { A: 0, B: 0, C: 0 };
    
    suppliers.forEach(supplier => {
      const supplierClass = supplier.supplierClass || getSupplierClass(supplier.gai || calculateGAI(supplier.kpiScores));
      distribution[supplierClass]++;
    });

    return [
      { name: 'Class A (≥80%)', value: distribution.A, color: '#10b981' },
      { name: 'Class B (60-79%)', value: distribution.B, color: '#f59e0b' },
      { name: 'Class C (<60%)', value: distribution.C, color: '#ef4444' }
    ].filter(item => item.value > 0);
  };

  // ✅ GRÁFICO MEJORADO PARA EMPLEADOS VS REVENUE
  const prepareCapacityData = () => {
    return suppliers
      .filter(s => s.companyData?.employees && s.companyData?.annualRevenue)
      .map(supplier => ({
        employees: parseInt(supplier.companyData.employees) || 0,
        revenue: parseInt(supplier.companyData.annualRevenue) || 0,
        name: supplier.supplierName,
        gai: supplier.gai || calculateGAI(supplier.kpiScores),
        class: supplier.supplierClass || getSupplierClass(supplier.gai || calculateGAI(supplier.kpiScores))
      }));
  };

  // ✅ FUNCIÓN PARA RENDERIZAR FILTROS DE ANALYTICS
  const renderAnalyticsFilters = () => (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '1.5rem', 
      borderRadius: '12px', 
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem'
    }}>
      <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Filtros de Análisis</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        
        {/* Filtro de Proveedores */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Proveedores Específicos
          </label>
          <select
            multiple
            value={analyticsFilters.selectedSuppliers}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              setAnalyticsFilters(prev => ({ ...prev, selectedSuppliers: values }));
            }}
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px',
              minHeight: '100px'
            }}
          >
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.supplierName}>
                {supplier.supplierName}
              </option>
            ))}
          </select>
          <small style={{ color: '#6b7280' }}>Mantén Ctrl para seleccionar múltiples</small>
        </div>

        {/* Filtro de KPIs */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
            KPIs a Mostrar
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {['KPI1', 'KPI2', 'KPI3', 'KPI4', 'KPI5'].map(kpi => (
              <label key={kpi} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={analyticsFilters.selectedKPIs.includes(kpi)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAnalyticsFilters(prev => ({
                        ...prev,
                        selectedKPIs: [...prev.selectedKPIs, kpi]
                      }));
                    } else {
                      setAnalyticsFilters(prev => ({
                        ...prev,
                        selectedKPIs: prev.selectedKPIs.filter(k => k !== kpi)
                      }));
                    }
                  }}
                />
                <span style={{ fontSize: '0.875rem' }}>{KPI_DESCRIPTIONS[kpi.toLowerCase()]}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filtro de Clase */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Clase de Proveedor
          </label>
          <select
            value={analyticsFilters.supplierClass}
            onChange={(e) => setAnalyticsFilters(prev => ({ ...prev, supplierClass: e.target.value }))}
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px'
            }}
          >
            <option value="all">Todas las Clases</option>
            <option value="A">Clase A (≥80%)</option>
            <option value="B">Clase B (60-79%)</option>
            <option value="C">Clase C (&lt;60%)</option>
          </select>
        </div>

        {/* Filtro de Categoría */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Categoría
          </label>
          <select
            value={analyticsFilters.category}
            onChange={(e) => setAnalyticsFilters(prev => ({ ...prev, category: e.target.value }))}
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px'
            }}
          >
            <option value="all">Todas las Categorías</option>
            {SUPPLIER_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Botón para limpiar filtros */}
      <div style={{ marginTop: '1rem' }}>
        <button
          onClick={() => setAnalyticsFilters({
            selectedSuppliers: [],
            selectedKPIs: ['KPI1', 'KPI2', 'KPI3', 'KPI4', 'KPI5'],
            supplierClass: 'all',
            category: 'all'
          })}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );

  // ✅ FUNCIÓN PARA RENDERIZAR DETALLES AMPLIADOS DE KPI
  const renderKPIDetailsSection = (kpi, kpiData) => {
    const kpiKey = kpi.toLowerCase();
    const isExpanded = expandedKPIs[kpiKey];
    const detailOptions = KPI_DETAILED_OPTIONS[kpiKey];

    return (
      <div key={kpi} style={{ 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px', 
        marginBottom: '1rem',
        backgroundColor: '#f9fafb'
      }}>
        <div 
          style={{ 
            padding: '1rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            backgroundColor: isExpanded ? '#f3f4f6' : 'transparent'
          }}
          onClick={() => toggleKPIExpansion(kpiKey)}
        >
          <div>
            <span style={{ fontWeight: 'bold', color: '#1f2937' }}>
              {kpi.toUpperCase()} - {KPI_DESCRIPTIONS[kpiKey]}
            </span>
            <div style={{ marginTop: '0.5rem' }}>
              Score: 
              <select
                value={formData.kpiScores[kpiKey] || 0}
                onChange={(e) => handleKPIScoreChange(kpiKey, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{ 
                  marginLeft: '0.5rem', 
                  padding: '0.25rem 0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px'
                }}
              >
                <option value={0}>Select Score</option>
                <option value={1}>1 - {SCORE_LABELS[1]}</option>
                <option value={2}>2 - {SCORE_LABELS[2]}</option>
                <option value={3}>3 - {SCORE_LABELS[3]}</option>
                <option value={4}>4 - {SCORE_LABELS[4]}</option>
              </select>
            </div>
          </div>
          <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            ▼
          </span>
        </div>

        {isExpanded && (
          <div style={{ padding: '0 1rem 1rem' }}>
            {Object.entries(detailOptions).map(([section, sectionData]) => (
              <div key={section} style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ 
                  color: '#374151', 
                  marginBottom: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  {sectionData.label}
                </h4>
                
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {sectionData.options.map((option, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      <input
                        type="checkbox"
                        id={`${kpiKey}-${section}-${idx}`}
                        checked={(formData.kpiDetails[kpiKey][section] || '').includes(option)}
                        onChange={(e) => {
                          const currentValue = formData.kpiDetails[kpiKey][section] || '';
                          const options = currentValue.split(',').filter(o => o.trim());
                          
                          if (e.target.checked) {
                            options.push(option);
                          } else {
                            const index = options.indexOf(option);
                            if (index > -1) options.splice(index, 1);
                          }
                          
                          handleKPIDetailChange(kpiKey, section, options.join(', '));
                        }}
                        style={{ marginRight: '0.5rem' }}
                      />
                      <label 
                        htmlFor={`${kpiKey}-${section}-${idx}`}
                        style={{ cursor: 'pointer', flex: 1 }}
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Campo de texto adicional para detalles específicos */}
                <textarea
                  placeholder={`Additional details for ${sectionData.label.toLowerCase()}...`}
                  value={formData.kpiDetails[kpiKey][section] || ''}
                  onChange={(e) => handleKPIDetailChange(kpiKey, section, e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    minHeight: '60px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDetailModal = () => {
    if (!showDetailModal || !selectedSupplier) return null;

    const gai = selectedSupplier.gai || calculateGAI(selectedSupplier.kpiScores);
    const supplierClass = selectedSupplier.supplierClass || getSupplierClass(gai);

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#1f2937', margin: 0 }}>{selectedSupplier.supplierName}</h2>
            <button
              onClick={() => setShowDetailModal(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
              <h3 style={{ color: '#374151', marginBottom: '1rem' }}>Basic Information</h3>
              <p><strong>Category:</strong> {selectedSupplier.category}</p>
              <p><strong>Location:</strong> {selectedSupplier.location}</p>
              <p><strong>Contact:</strong> {selectedSupplier.contactPerson}</p>
              <p><strong>Audit Date:</strong> {new Date(selectedSupplier.auditDate).toLocaleDateString()}</p>
              <p><strong>Auditor:</strong> {selectedSupplier.auditorName}</p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
              <h3 style={{ color: '#374151', marginBottom: '1rem' }}>Performance</h3>
              <p><strong>G.A.I:</strong> {gai}%</p>
              <p><strong>Class:</strong> <span style={getClassBadgeStyle(supplierClass)}>{supplierClass}</span></p>
              <div style={{ marginTop: '1rem' }}>
                <h4>KPI Scores:</h4>
                {Object.entries(selectedSupplier.kpiScores || {}).map(([kpi, score]) => (
                  <p key={kpi} style={{ margin: '0.25rem 0' }}>
                    <strong>{kpi.toUpperCase()}:</strong> {score}/4 - {SCORE_LABELS[score]}
                  </p>
                ))}
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#fffbeb', borderRadius: '8px' }}>
              <h3 style={{ color: '#374151', marginBottom: '1rem' }}>Company Data</h3>
              <p><strong>Annual Revenue:</strong> ${selectedSupplier.companyData?.annualRevenue || 'N/A'}</p>
              <p><strong>Employees:</strong> {selectedSupplier.companyData?.employees || 'N/A'}</p>
              <p><strong>Working Days/Week:</strong> {selectedSupplier.companyData?.workingDays || 'N/A'}</p>
              <p><strong>Shifts:</strong> {selectedSupplier.companyData?.shifts || 'N/A'}</p>
              <p><strong>Production Hours/Day:</strong> {selectedSupplier.companyData?.productionHours || 'N/A'}</p>
              <p><strong>Installed Capacity:</strong> {selectedSupplier.companyData?.installedCapacity || 'N/A'} ton/month</p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#fefce8', borderRadius: '8px' }}>
              <h3 style={{ color: '#374151', marginBottom: '1rem' }}>Certifications</h3>
              {Object.entries(selectedSupplier.certifications || {}).map(([cert, value]) => 
                value && cert !== 'others' && (
                  <p key={cert}>✅ {cert.toUpperCase()}</p>
                )
              )}
              {selectedSupplier.certifications?.others && (
                <p>✅ Others: {selectedSupplier.certifications.others}</p>
              )}
            </div>
          </div>

          {selectedSupplier.observations && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#faf5ff', borderRadius: '8px' }}>
              <h3 style={{ color: '#374151', marginBottom: '1rem' }}>Observations</h3>
              {selectedSupplier.observations.strengths && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Strengths:</strong>
                  <p style={{ marginTop: '0.5rem' }}>{selectedSupplier.observations.strengths}</p>
                </div>
              )}
              {selectedSupplier.observations.improvements && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Areas for Improvement:</strong>
                  <p style={{ marginTop: '0.5rem' }}>{selectedSupplier.observations.improvements}</p>
                </div>
              )}
              {selectedSupplier.observations.actions && (
                <div>
                  <strong>Required Actions:</strong>
                  <p style={{ marginTop: '0.5rem' }}>{selectedSupplier.observations.actions}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDeleteConfirmModal = () => {
    if (!showDeleteConfirm || !supplierToDelete) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '400px',
          width: '90%'
        }}>
          <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Confirm Deletion</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Are you sure you want to delete the evaluation for <strong>{supplierToDelete.supplierName}</strong>? 
            This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setSupplierToDelete(null);
              }}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                color: '#374151',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={loading}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                backgroundColor: '#dc2626',
                color: 'white',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ✅ RENDERIZAR ANALYTICS MEJORADO CON FILTROS
  const renderAnalytics = () => {
    const kpiData = prepareKPIComparisonData();
    const radarData = prepareRadarData();
    const classData = prepareClassDistributionData();
    const capacityData = prepareCapacityData();

    return (
      <div className={styles.panelContainer}>
        <div className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle}>Supplier Analytics & Comparisons</h1>
          <p className={styles.dashboardSubtitle}>
            Visual analysis and comparisons between suppliers
          </p>
        </div>

        {/* Filtros */}
        {renderAnalyticsFilters()}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
          
          {/* KPI Comparison Chart - MEJORADO CON FILTROS */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' 
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>
              KPI Comparison by Supplier
              {analyticsFilters.selectedSuppliers.length > 0 && (
                <span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                  ({analyticsFilters.selectedSuppliers.length} filtered)
                </span>
              )}
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={kpiData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis domain={[0, 4]} />
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label) => {
                    const supplier = kpiData.find(s => s.name === label);
                    return supplier ? `${supplier.fullName} (Class ${supplier.class})` : label;
                  }}
                />
                <Legend />
                {analyticsFilters.selectedKPIs.map((kpi, index) => (
                  <Bar 
                    key={kpi}
                    dataKey={kpi} 
                    fill={COLORS[index % COLORS.length]} 
                    name={KPI_DESCRIPTIONS[kpi.toLowerCase()]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Average KPI Performance Radar */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' 
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Average KPI Performance</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis domain={[0, 4]} />
                <Radar
                  name="Average Performance"
                  dataKey="A"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Supplier Class Distribution */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' 
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Supplier Class Distribution</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={classData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {classData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Employee Count vs Annual Revenue - MEJORADO */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' 
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Company Size vs Revenue Analysis</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart
                data={capacityData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="employees" 
                  name="Employees"
                  label={{ value: 'Number of Employees', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="revenue" 
                  name="Revenue"
                  scale="log"
                  domain={['dataMin', 'dataMax']}
                  label={{ value: 'Annual Revenue (USD)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => `$${value >= 1000000 ? `${(value/1000000).toFixed(1)}M` : `${(value/1000).toFixed(0)}K`}`}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'revenue') {
                      return [`$${value >= 1000000 ? `${(value/1000000).toFixed(1)}M` : `${(value/1000).toFixed(0)}K`}`, 'Annual Revenue'];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return `${payload[0].payload.name} (Class ${payload[0].payload.class})`;
                    }
                    return '';
                  }}
                />
                <Scatter 
                  dataKey="revenue" 
                  fill={(entry) => getClassColor(entry.class)}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderNewChecklistForm = () => (
    <div className={styles.panelContainer}>
      <div className={styles.checklistHeader}>
        <h1 className={styles.checklistTitle}>
          {editingSupplier ? `Edit Supplier: ${editingSupplier.supplierName}` : 'New Supplier Evaluation'}
        </h1>
        <p className={styles.checklistSubtitle}>
          Complete supplier audit checklist and performance evaluation
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.checklistForm}>
        <div className={styles.formGrid}>
          {/* General Information */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>📋 General Information</h3>
            
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Supplier Name *</label>
              <input
                type="text"
                className={styles.input}
                value={formData.supplierName}
                onChange={(e) => setFormData(prev => ({ ...prev, supplierName: e.target.value }))}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Category</label>
              <select
                className={styles.input}
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="">Select Category</option>
                {SUPPLIER_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Location</label>
              <input
                type="text"
                className={styles.input}
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Contact Person</label>
              <input
                type="text"
                className={styles.input}
                value={formData.contactPerson}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Audit Date</label>
              <input
                type="date"
                className={styles.input}
                value={formData.auditDate}
                onChange={(e) => setFormData(prev => ({ ...prev, auditDate: e.target.value }))}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Auditor Name</label>
              <input
                type="text"
                className={styles.input}
                value={formData.auditorName}
                onChange={(e) => setFormData(prev => ({ ...prev, auditorName: e.target.value }))}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Activity Field</label>
              <input
                type="text"
                className={styles.input}
                value={formData.activityField}
                onChange={(e) => setFormData(prev => ({ ...prev, activityField: e.target.value }))}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Audit Type</label>
              <select
                className={styles.input}
                value={formData.auditType}
                onChange={(e) => setFormData(prev => ({ ...prev, auditType: e.target.value }))}
              >
                <option value="">Select Audit Type</option>
                <option value="first">1st Audit</option>
                <option value="periodic">Periodic Audit</option>
                <option value="followup">Follow-up Audit</option>
              </select>
            </div>
          </div>

          {/* Company Certifications */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>🏆 Company Certifications</h3>
            
            {Object.entries({
              iso9001: 'ISO 9001:2015',
              iso14001: 'ISO 14001:2015', 
              iso45001: 'ISO 45001/OHSAS 18001',
              en1090: 'EN 1090 (Steel Structures)',
              ceMarking: 'CE Marking'
            }).map(([key, label]) => (
              <div key={key} className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.certifications[key]}
                    onChange={(e) => handleInputChange('certifications', key, e.target.checked)}
                  />
                  <span className={styles.checkboxText}>{label}</span>
                </label>
              </div>
            ))}

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Others</label>
              <input
                type="text"
                className={styles.input}
                value={formData.certifications.others}
                onChange={(e) => handleInputChange('certifications', 'others', e.target.value)}
                placeholder="Specify other certifications"
              />
            </div>
          </div>

          {/* Company Data */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>🏢 Company Data</h3>
            
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Annual Revenue (USD/year)</label>
              <input
                type="number"
                className={styles.input}
                value={formData.companyData.annualRevenue}
                onChange={(e) => handleInputChange('companyData', 'annualRevenue', e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Number of Employees</label>
              <input
                type="number"
                className={styles.input}
                value={formData.companyData.employees}
                onChange={(e) => handleInputChange('companyData', 'employees', e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Working Days/Week</label>
              <input
                type="number"
                className={styles.input}
                value={formData.companyData.workingDays}
                onChange={(e) => handleInputChange('companyData', 'workingDays', e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Number of Shifts</label>
              <input
                type="number"
                className={styles.input}
                value={formData.companyData.shifts}
                onChange={(e) => handleInputChange('companyData', 'shifts', e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Production Hours/Day</label>
              <input
                type="number"
                className={styles.input}
                value={formData.companyData.productionHours}
                onChange={(e) => handleInputChange('companyData', 'productionHours', e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Installed Capacity (ton/month)</label>
              <input
                type="number"
                className={styles.input}
                value={formData.companyData.installedCapacity}
                onChange={(e) => handleInputChange('companyData', 'installedCapacity', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* KPI Evaluation Section */}
        <div className={styles.kpiSection}>
          <h3 className={styles.sectionTitle}>📊 Key Performance Indicators (KPI) Evaluation</h3>
          <p className={styles.sectionDescription}>
            Rate each KPI from 1-4 and provide detailed information for each category.
            Use the expandable sections to capture specific details about equipment, processes, and capabilities.
          </p>

          {['KPI1', 'KPI2', 'KPI3', 'KPI4', 'KPI5'].map(kpi => 
            renderKPIDetailsSection(kpi, formData.kpiDetails[kpi.toLowerCase()])
          )}
        </div>

        {/* Observations and Conclusions */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>📝 Observations and Recommendations</h3>
          
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Identified Strengths</label>
            <textarea
              className={styles.textarea}
              value={formData.observations.strengths}
              onChange={(e) => handleInputChange('observations', 'strengths', e.target.value)}
              placeholder="Describe the supplier's main strengths and advantages..."
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Areas for Improvement</label>
            <textarea
              className={styles.textarea}
              value={formData.observations.improvements}
              onChange={(e) => handleInputChange('observations', 'improvements', e.target.value)}
              placeholder="Identify areas that need improvement or attention..."
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Required Actions (if applicable)</label>
            <textarea
              className={styles.textarea}
              value={formData.observations.actions}
              onChange={(e) => handleInputChange('observations', 'actions', e.target.value)}
              placeholder="Specify any corrective actions that must be taken..."
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Follow-up Date</label>
            <input
              type="date"
              className={styles.input}
              value={formData.observations.followUpDate}
              onChange={(e) => handleInputChange('observations', 'followUpDate', e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Executive Decision</label>
            <select
              className={styles.input}
              value={formData.decision}
              onChange={(e) => setFormData(prev => ({ ...prev, decision: e.target.value }))}
            >
              <option value="">Select Decision</option>
              <option value="approved">Approved</option>
              <option value="approved_conditions">Approved with Conditions</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {formData.decision === 'approved_conditions' && (
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Conditions (if applicable)</label>
              <textarea
                className={styles.textarea}
                value={formData.conditions}
                onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
                placeholder="Specify the conditions that must be met..."
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className={styles.submitSection}>
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? (
              <>
                <span className={styles.loadingSpinner}></span>
                {editingSupplier ? 'Updating & Generating PDF...' : 'Saving & Generating PDF...'}
              </>
            ) : (
              editingSupplier ? 'Update & Export Evaluation' : 'Save & Export Evaluation'
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderDashboard = () => (
    <div className={styles.panelContainer}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Supplier Evaluation Dashboard</h1>
        <p className={styles.dashboardSubtitle}>
          Overview of all suppliers categorized by type and performance classification
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
          <div className={styles.loadingSpinner}></div>
          <span style={{ marginLeft: '1rem', color: '#6b7280' }}>Loading suppliers...</span>
        </div>
      ) : (
        <>
          {/* Overall Statistics */}
          <div className={styles.statsContainer}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{suppliers.length}</div>
                <div className={styles.statLabel}>Total Suppliers</div>
              </div>
            </div>

            <div className={styles.statCard} style={{ borderLeft: '4px solid #10b981' }}>
              <div className={styles.statIcon}>🌟</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {suppliers.filter(s => getSupplierClass(s.gai || calculateGAI(s.kpiScores)) === 'A').length}
                </div>
                <div className={styles.statLabel}>Class A (≥80%)</div>
              </div>
            </div>

            <div className={styles.statCard} style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className={styles.statIcon}>⚠️</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {suppliers.filter(s => getSupplierClass(s.gai || calculateGAI(s.kpiScores)) === 'B').length}
                </div>
                <div className={styles.statLabel}>Class B (60-79%)</div>
              </div>
            </div>

            <div className={styles.statCard} style={{ borderLeft: '4px solid #ef4444' }}>
              <div className={styles.statIcon}>❌</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {suppliers.filter(s => getSupplierClass(s.gai || calculateGAI(s.kpiScores)) === 'C').length}
                </div>
                <div className={styles.statLabel}>Class C (&lt;60%)</div>
              </div>
            </div>
          </div>

          {/* Suppliers by Category */}
          <div className={styles.categoriesGrid}>
            {SUPPLIER_CATEGORIES.map(category => {
              const categorySuppliers = suppliers.filter(s => s.category === category);
              return (
                <div key={category} className={styles.categoryCard}>
                  <div className={styles.categoryHeader}>
                    <h3 className={styles.categoryTitle}>{category}</h3>
                    <span className={styles.categoryCount}>{categorySuppliers.length} suppliers</span>
                  </div>

                  <div className={styles.suppliersGrid}>
                    {categorySuppliers.map(supplier => {
                      const gai = supplier.gai || calculateGAI(supplier.kpiScores);
                      const supplierClass = supplier.supplierClass || getSupplierClass(gai);
                      
                      return (
                        <div key={supplier.id} className={`${styles.supplierCard} ${styles[`class${supplierClass}`]}`}>
                          <div className={styles.supplierHeader}>
                            <h4 className={styles.supplierName}>{supplier.supplierName}</h4>
                            <span style={getClassBadgeStyle(supplierClass)}>
                              {supplierClass}
                            </span>
                          </div>

                          <div className={styles.supplierInfo}>
                            <div className={styles.supplierLocation}>
                              📍 {supplier.location || 'Location not specified'}
                            </div>
                            <div className={styles.supplierGai}>
                              📈 G.A.I: {gai}%
                            </div>
                            <div className={styles.supplierDate}>
                              📅 {new Date(supplier.auditDate || supplier.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className={styles.kpiBreakdown}>
                            <div className={styles.kpiTitle}>KPI Scores:</div>
                            <div className={styles.kpiScores}>
                              {Object.entries(supplier.kpiScores || {}).map(([kpi, score]) => (
                                <span key={kpi} className={styles.kpiScore}>
                                  {kpi.toUpperCase()}: {score || 0}/4
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div style={{ 
                            marginTop: '1rem', 
                            display: 'flex', 
                            gap: '0.5rem', 
                            justifyContent: 'center',
                            borderTop: '1px solid #e2e8f0',
                            paddingTop: '1rem'
                          }}>
                            <button
                              onClick={() => handleViewSupplier(supplier)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEditSupplier(supplier)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSupplier(supplier)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {categorySuppliers.length === 0 && (
                      <div className={styles.emptyCategory}>
                        <p>No suppliers in this category yet</p>
                        <button
                          onClick={() => setActiveTab('newChecklist')}
                          className={styles.addSupplierBtn}
                        >
                          Add First Supplier
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  const renderSidebar = () => (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Supplier Evaluation</h2>
        <p className={styles.sidebarSubtitle}>Quality Control System</p>
      </div>

      <div className={styles.nav}>
        <div 
          className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
          onClick={() => handleTabChange('dashboard')}
        >
          <span className={styles.navIcon}>📊</span>
          <span className={styles.navText}>Dashboard</span>
          {activeTab === 'dashboard' && <div className={styles.navIndicator}></div>}
        </div>

        <div 
          className={`${styles.navItem} ${activeTab === 'newChecklist' ? styles.active : ''}`}
          onClick={() => handleTabChange('newChecklist')}
        >
          <span className={styles.navIcon}>📝</span>
          <span className={styles.navText}>New Evaluation</span>
          {activeTab === 'newChecklist' && <div className={styles.navIndicator}></div>}
        </div>

        <div 
          className={`${styles.navItem} ${activeTab === 'analytics' ? styles.active : ''}`}
          onClick={() => handleTabChange('analytics')}
        >
          <span className={styles.navIcon}>📈</span>
          <span className={styles.navText}>Analytics</span>
          {activeTab === 'analytics' && <div className={styles.navIndicator}></div>}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'newChecklist':
        return renderNewChecklistForm();
      case 'analytics':
        return renderAnalytics();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.appContainer}>
        {renderSidebar()}
        
        <div className={styles.mainContent}>
          <div className={styles.contentHeader}>
            <div className={styles.headerInfo}>
              <h1 className={styles.mainTitle}>Supplier Evaluation Management</h1>
              <div className={styles.breadcrumb}>
                Quality Control → Supplier Management → {
                  activeTab === 'dashboard' ? 'Dashboard' : 
                  activeTab === 'analytics' ? 'Analytics' : 
                  'New Evaluation'
                }
              </div>
            </div>
          </div>

          {renderContent()}
        </div>
      </div>

      {/* ✅ BOTÓN CORREGIDO - Usar función directamente */}
      <BackButton onClick={() => {
        console.log('BackButton clicked, calling onBackToMenu...');
        if (typeof onBackToMenu === 'function') {
          onBackToMenu();
        } else {
          console.error('onBackToMenu is not a function:', onBackToMenu);
        }
      }} />

      {/* Modales */}
      {renderDetailModal()}
      {renderDeleteConfirmModal()}
    </div>
  );
};

export default SupplierEvaluationWrapper;