// src/components/supplier-evaluation/SupplierEvaluationWrapper.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../common/BackButton';
import { saveSupplierEvaluation, updateSupplierEvaluation, getAllSupplierEvaluations, deleteSupplierEvaluation } from '../../firebase/supplierEvaluationService';
import { generateSupplierEvaluationPDF } from '../../services/supplierEvaluationPDFService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const SupplierEvaluationWrapper = ({ onBackToMenu }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedKPIs, setExpandedKPIs] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  
  // ✅ NUEVOS ESTADOS PARA FUNCIONALIDADES CRUD Y MODALES
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  // Form state for new supplier checklist
  const [formData, setFormData] = useState({
    id: null, // ✅ Agregar ID para edición
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
      employees: ''
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
        machineCapacity: '',
        productionVolume: '',
        equipmentCondition: '',
        maintenanceProgram: '',
        technologyLevel: '',
        expansionCapability: ''
      },
      kpi2: {
        qualitySystem: '',
        testingEquipment: '',
        inspectionProcedures: '',
        qualificationCertificates: '',
        controlDocumentation: '',
        nonconformityHandling: ''
      },
      kpi3: {
        supplierCertification: '',
        materialTraceability: '',
        testCertificates: '',
        inventoryManagement: '',
        qualityAgreements: '',
        inspectionReports: ''
      },
      kpi4: {
        keyPersonnel: '',
        technicalCompetencies: '',
        trainingPrograms: '',
        teamSize: '',
        experienceLevel: '',
        continuousImprovement: ''
      },
      kpi5: {
        logisticsTeamSize: '',
        ownFleet: false,
        fleetVehicles: '',
        logisticsSubcontractors: '',
        standardLeadTime: '',
        urgentLeadTime: '',
        changeFlexibility: '',
        maritimePackaging: false,
        corrosionProtection: false,
        labelingIdentification: ''
      }
    },
    observations: {
      strengths: '',
      improvements: '',
      actions: '',
      followUpDate: ''
    }
  });

  // Initialize auditor name when component mounts or user changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      auditorName: currentUser?.displayName || ''
    }));
  }, [currentUser]);

  // Load suppliers from Firebase on mount
  useEffect(() => {
    const loadSuppliers = async () => {
      setLoading(true);
      try {
        const suppliersData = await getAllSupplierEvaluations();
        setSuppliers(suppliersData);
      } catch (error) {
        console.error('Error loading suppliers:', error);
        const savedSuppliers = localStorage.getItem('supplierEvaluations');
        if (savedSuppliers) {
          setSuppliers(JSON.parse(savedSuppliers));
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadSuppliers();
  }, []);

  // ✅ FUNCIONES CRUD NUEVAS
  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailModal(true);
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      ...supplier,
      id: supplier.id
    });
    setActiveTab('newChecklist');
  };

  const handleDeleteSupplier = (supplier) => {
    setSupplierToDelete(supplier);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;
    
    try {
      setLoading(true);
      await deleteSupplierEvaluation(supplierToDelete.id);
      setSuppliers(prev => prev.filter(s => s.id !== supplierToDelete.id));
      alert('✅ Supplier evaluation deleted successfully!');
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Error deleting supplier evaluation. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setSupplierToDelete(null);
    }
  };

  const addSupplier = async (supplierData) => {
    try {
      console.log('addSupplier: Starting save process...');
      
      const newSupplier = {
        ...supplierData,
        createdBy: currentUser?.displayName || 'Unknown User',
        createdAt: new Date().toISOString()
      };

      let docId;
      if (supplierData.id) {
        // ✅ ACTUALIZAR SUPPLIER EXISTENTE
        await updateSupplierEvaluation(supplierData.id, newSupplier);
        docId = supplierData.id;
        
        // Actualizar en estado local
        setSuppliers(prev => prev.map(s => 
          s.id === docId ? { ...newSupplier, id: docId } : s
        ));
        
        console.log('Supplier updated successfully');
      } else {
        // ✅ CREAR NUEVO SUPPLIER
        docId = await saveSupplierEvaluation(newSupplier);
        
        const supplierWithId = {
          ...newSupplier,
          id: docId
        };
        
        setSuppliers(prev => [...prev, supplierWithId]);
        console.log('New supplier created successfully');
      }
      
      return docId;
      
    } catch (error) {
      console.error('Error saving supplier:', error);
      
      // Fallback to localStorage
      const newSupplier = {
        ...supplierData,
        id: supplierData.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.displayName || 'Unknown User'
      };
      
      if (supplierData.id) {
        setSuppliers(prev => prev.map(s => 
          s.id === supplierData.id ? newSupplier : s
        ));
      } else {
        setSuppliers(prev => [...prev, newSupplier]);
      }
      
      return newSupplier.id;
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      supplierName: '',
      category: SUPPLIER_CATEGORIES[0],
      location: '',
      contactPerson: '',
      auditDate: new Date().toISOString().split('T')[0],
      auditorName: currentUser?.displayName || '',
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
        employees: ''
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
          machineCapacity: '',
          productionVolume: '',
          equipmentCondition: '',
          maintenanceProgram: '',
          technologyLevel: '',
          expansionCapability: ''
        },
        kpi2: {
          qualitySystem: '',
          testingEquipment: '',
          inspectionProcedures: '',
          qualificationCertificates: '',
          controlDocumentation: '',
          nonconformityHandling: ''
        },
        kpi3: {
          supplierCertification: '',
          materialTraceability: '',
          testCertificates: '',
          inventoryManagement: '',
          qualityAgreements: '',
          inspectionReports: ''
        },
        kpi4: {
          keyPersonnel: '',
          technicalCompetencies: '',
          trainingPrograms: '',
          teamSize: '',
          experienceLevel: '',
          continuousImprovement: ''
        },
        kpi5: {
          logisticsTeamSize: '',
          ownFleet: false,
          fleetVehicles: '',
          logisticsSubcontractors: '',
          standardLeadTime: '',
          urgentLeadTime: '',
          changeFlexibility: '',
          maritimePackaging: false,
          corrosionProtection: false,
          labelingIdentification: ''
        }
      },
      observations: {
        strengths: '',
        improvements: '',
        actions: '',
        followUpDate: ''
      }
    });
    setEditingSupplier(null);
  };

  const handleSaveAndExportComplete = () => {
    const message = editingSupplier 
      ? '✅ Supplier evaluation updated and PDF generated successfully!'
      : '✅ Supplier evaluation saved and PDF generated successfully!';
    
    alert(message);
    resetForm();
    setActiveTab('dashboard');
    setExpandedKPIs({});
  };

  // Form handling functions
  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleKPIDetailChange = (kpiKey, field, value) => {
    setFormData(prev => ({
      ...prev,
      kpiDetails: {
        ...prev.kpiDetails,
        [kpiKey]: {
          ...prev.kpiDetails[kpiKey],
          [field]: value
        }
      }
    }));
  };

  const handleDirectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleKPIExpansion = (kpiKey) => {
    setExpandedKPIs(prev => ({
      ...prev,
      [kpiKey]: !prev[kpiKey]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.supplierName || !formData.category) {
      alert('Please fill in required fields: Supplier Name and Category');
      return;
    }

    const gai = calculateGAI(formData.kpiScores);
    const supplierClass = getSupplierClass(gai);
    
    const supplierData = {
      ...formData,
      gai,
      supplierClass
    };

    try {
      setLoading(true);
      console.log('handleSubmit: Starting save & export process...');
      
      const savedId = await addSupplier(supplierData);
      console.log('handleSubmit: Supplier saved with ID:', savedId);
      
      await generateSupplierEvaluationPDF(supplierData);
      console.log('handleSubmit: PDF generated successfully');
      
      handleSaveAndExportComplete();
      
    } catch (error) {
      console.error('handleSubmit: Error in save & export process:', error);
      
      let errorMessage = 'There was an error during the save & export process. ';
      
      if (error.message.includes('PDF')) {
        errorMessage += 'The data was saved but PDF generation failed. ';
      } else if (error.message.includes('Firebase')) {
        errorMessage += 'Firebase save failed, but data was saved locally. ';
      }
      
      errorMessage += 'Please try again or contact support if the issue persists.';
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newTab) => {
    if (newTab !== 'newChecklist') {
      setEditingSupplier(null);
      resetForm();
    }
    setActiveTab(newTab);
  };

  const calculateGAI = (kpiScores) => {
    const totalScore = Object.values(kpiScores).reduce((sum, score) => sum + (score || 0), 0);
    const maxScore = 20;
    return Math.round((totalScore / maxScore) * 100);
  };

  const getSupplierClass = (gai) => {
    if (gai >= 80) return 'A';
    if (gai >= 60) return 'B';
    return 'C';
  };

  // ✅ FUNCIONES PARA GRÁFICOS
const prepareKPIComparisonData = (categoryFilter = 'All Categories') => {
  let filteredSuppliers = suppliers;
  
  // Filtrar por categoría si no es "All Categories"
  if (categoryFilter !== 'All Categories') {
    filteredSuppliers = suppliers.filter(supplier => supplier.category === categoryFilter);
  }
  
  return filteredSuppliers.map(supplier => ({
    name: supplier.supplierName.length > 12 
      ? supplier.supplierName.substring(0, 12) + '...' 
      : supplier.supplierName,
    fullName: supplier.supplierName,
    category: supplier.category,
    KPI1: supplier.kpiScores?.kpi1 || 0,
    KPI2: supplier.kpiScores?.kpi2 || 0,
    KPI3: supplier.kpiScores?.kpi3 || 0,
    KPI4: supplier.kpiScores?.kpi4 || 0,
    KPI5: supplier.kpiScores?.kpi5 || 0,
    GAI: supplier.gai || calculateGAI(supplier.kpiScores),
    class: supplier.supplierClass || getSupplierClass(supplier.gai || calculateGAI(supplier.kpiScores))
  }));
};

  const getAvailableCategories = () => {
  const categoriesWithSuppliers = SUPPLIER_CATEGORIES.filter(category => 
    suppliers.some(supplier => supplier.category === category)
  );
  return ['All Categories', ...categoriesWithSuppliers];
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

  const prepareCapacityData = () => {
    return suppliers
      .filter(s => s.companyData?.employees && s.companyData?.annualRevenue)
      .map(supplier => ({
        x: parseInt(supplier.companyData.employees) || 0,
        y: parseInt(supplier.companyData.annualRevenue) || 0,
        name: supplier.supplierName,
        gai: supplier.gai || calculateGAI(supplier.kpiScores),
        class: supplier.supplierClass || getSupplierClass(supplier.gai || calculateGAI(supplier.kpiScores))
      }));
  };

  // ✅ FUNCIÓN PARA RENDERIZAR DETALLES DE KPI (misma que antes)
  const renderKPIDetailsSection = (kpiKey) => {
    if (!expandedKPIs[kpiKey]) return null;

    const details = formData.kpiDetails[kpiKey];

    switch (kpiKey) {
      case 'kpi1':
        return (
          <div className={styles.kpiDetailsSection}>
            <h5 className={styles.detailsSectionTitle}>Production Equipment</h5>
            <div className={styles.detailsGrid}>
              <div className={styles.formGroup}>
                <label>Machine capacity</label>
                <input
                  type="text"
                  value={details.machineCapacity}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'machineCapacity', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Production volume (tons/month)</label>
                <input
                  type="number"
                  value={details.productionVolume}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'productionVolume', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Equipment condition</label>
                <select
                  value={details.equipmentCondition}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'equipmentCondition', e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Select...</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Maintenance program</label>
                <select
                  value={details.maintenanceProgram}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'maintenanceProgram', e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Select...</option>
                  <option value="preventive">Preventive</option>
                  <option value="corrective">Corrective</option>
                  <option value="predictive">Predictive</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Technology level</label>
                <select
                  value={details.technologyLevel}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'technologyLevel', e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Select...</option>
                  <option value="modern">Modern</option>
                  <option value="standard">Standard</option>
                  <option value="outdated">Outdated</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Expansion capability</label>
                <select
                  value={details.expansionCapability}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'expansionCapability', e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Select...</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'kpi2':
        return (
          <div className={styles.kpiDetailsSection}>
            <h5 className={styles.detailsSectionTitle}>Quality System</h5>
            <div className={styles.detailsGrid}>
              <div className={styles.formGroup}>
                <label>Quality system</label>
                <select
                  value={details.qualitySystem}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'qualitySystem', e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Select...</option>
                  <option value="iso9001">ISO 9001</option>
                  <option value="internal">Internal system</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Testing equipment</label>
                <select
                  value={details.testingEquipment}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'testingEquipment', e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Select...</option>
                  <option value="complete">Complete</option>
                  <option value="partial">Partial</option>
                  <option value="external">External</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Inspection procedures</label>
                <select
                  value={details.inspectionProcedures}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'inspectionProcedures', e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Select...</option>
                  <option value="documented">Documented</option>
                  <option value="verbal">Verbal</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Qualification certificates</label>
                <input
                  type="text"
                  value={details.qualificationCertificates}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'qualificationCertificates', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Control documentation</label>
                <select
                  value={details.controlDocumentation}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'controlDocumentation', e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Select...</option>
                  <option value="complete">Complete</option>
                  <option value="partial">Partial</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Nonconformity handling</label>
                <select
                  value={details.nonconformityHandling}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'nonconformityHandling', e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Select...</option>
                  <option value="systematic">Systematic</option>
                  <option value="caseByCase">Case by case</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'kpi3':
        return (
          <div className={styles.kpiDetailsSection}>
            <h5 className={styles.detailsSectionTitle}>Steel Suppliers</h5>
            <div className={styles.detailsGrid}>
              <div className={styles.formGroup}>
                <label>Main supplier 1</label>
                <input
                  type="text"
                  value={details.mainSupplier1}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'mainSupplier1', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Main supplier 2</label>
                <input
                  type="text"
                  value={details.mainSupplier2}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'mainSupplier2', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Main supplier 3</label>
                <input
                  type="text"
                  value={details.mainSupplier3}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'mainSupplier3', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mill certificates received</label>
                <select
                  value={details.millCertificates}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'millCertificates', e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Select...</option>
                  <option value="always">Always</option>
                  <option value="sometimes">Sometimes</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>

            <h5 className={styles.detailsSectionTitle}>Traceability</h5>
            <div className={styles.detailsGrid}>
              <div className={styles.formGroup}>
                <label>Supplier certification</label>
                <select
                  value={details.supplierCertification}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'supplierCertification', e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Select...</option>
                  <option value="iso9001">ISO 9001</option>
                  <option value="en1090">EN 1090</option>
                  <option value="other">Other</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Material traceability</label>
                <select
                  value={details.materialTraceability}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'materialTraceability', e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Select...</option>
                  <option value="complete">Complete</option>
                  <option value="partial">Partial</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Test certificates</label>
                <select
                  value={details.testCertificates}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'testCertificates', e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Select...</option>
                  <option value="always">Always provided</option>
                  <option value="onRequest">On request</option>
                  <option value="sometimes">Sometimes</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'kpi4':
        return (
          <div className={styles.kpiDetailsSection}>
            <h5 className={styles.detailsSectionTitle}>Key Personnel</h5>
            <div className={styles.detailsGrid}>
              <div className={styles.formGroup}>
                <label>Production manager</label>
                <input
                  type="text"
                  value={details.productionManager}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'productionManager', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Quality manager</label>
                <input
                  type="text"
                  value={details.qualityManager}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'qualityManager', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Certified lab technicians</label>
                <input
                  type="number"
                  value={details.certifiedLabTechnicians}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'certifiedLabTechnicians', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Qualified operators</label>
                <input
                  type="number"
                  value={details.qualifiedOperators}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'qualifiedOperators', e.target.value)}
                  className={styles.formInput}
                />
              </div>
            </div>

            <h5 className={styles.detailsSectionTitle}>Training</h5>
            <div className={styles.detailsGrid}>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={details.trainingProgram}
                    onChange={(e) => handleKPIDetailChange(kpiKey, 'trainingProgram', e.target.checked)}
                    className={styles.checkbox}
                  />
                  Training program exists
                </label>
              </div>
              <div className={styles.formGroup}>
                <label>Current certifications</label>
                <input
                  type="text"
                  value={details.currentCertifications}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'currentCertifications', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Annual staff turnover (%)</label>
                <input
                  type="number"
                  value={details.annualTurnover}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'annualTurnover', e.target.value)}
                  className={styles.formInput}
                />
              </div>
            </div>
          </div>
        );

      case 'kpi5':
        return (
          <div className={styles.kpiDetailsSection}>
            <h5 className={styles.detailsSectionTitle}>Logistics Capacity</h5>
            <div className={styles.detailsGrid}>
              <div className={styles.formGroup}>
                <label>Logistics responsible</label>
                <input
                  type="text"
                  value={details.logisticsResponsible}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'logisticsResponsible', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Logistics team size</label>
                <input
                  type="number"
                  value={details.logisticsTeamSize}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'logisticsTeamSize', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={details.ownFleet}
                    onChange={(e) => handleKPIDetailChange(kpiKey, 'ownFleet', e.target.checked)}
                    className={styles.checkbox}
                  />
                  Own fleet
                </label>
              </div>
              <div className={styles.formGroup}>
                <label>Fleet vehicles</label>
                <input
                  type="number"
                  value={details.fleetVehicles}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'fleetVehicles', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Logistics subcontractors</label>
                <input
                  type="text"
                  value={details.logisticsSubcontractors}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'logisticsSubcontractors', e.target.value)}
                  className={styles.formInput}
                />
              </div>
            </div>

            <h5 className={styles.detailsSectionTitle}>Delivery Times</h5>
            <div className={styles.detailsGrid}>
              <div className={styles.formGroup}>
                <label>Standard lead time (days)</label>
                <input
                  type="number"
                  value={details.standardLeadTime}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'standardLeadTime', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Urgent lead time (days)</label>
                <input
                  type="number"
                  value={details.urgentLeadTime}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'urgentLeadTime', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Change flexibility</label>
                <select
                  value={details.changeFlexibility}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'changeFlexibility', e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Select...</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <h5 className={styles.detailsSectionTitle}>Packaging & Protection</h5>
            <div className={styles.detailsGrid}>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={details.maritimePackaging}
                    onChange={(e) => handleKPIDetailChange(kpiKey, 'maritimePackaging', e.target.checked)}
                    className={styles.checkbox}
                  />
                  Maritime packaging system
                </label>
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={details.corrosionProtection}
                    onChange={(e) => handleKPIDetailChange(kpiKey, 'corrosionProtection', e.target.checked)}
                    className={styles.checkbox}
                  />
                  Anti-corrosion protection during transport
                </label>
              </div>
              <div className={styles.formGroup}>
                <label>Identification and labeling</label>
                <select
                  value={details.labelingIdentification}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'labelingIdentification', e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Select...</option>
                  <option value="complete">Complete</option>
                  <option value="basic">Basic</option>
                  <option value="insufficient">Insufficient</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ✅ MODAL PARA VER DETALLES COMPLETOS
  const renderDetailModal = () => {
    if (!showDetailModal || !selectedSupplier) return null;

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
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative',
          width: '90%'
        }}>
          <button
            onClick={() => setShowDetailModal(false)}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ✕
          </button>

          <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>
            {selectedSupplier.supplierName} - Complete Evaluation
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <h3 style={{ color: '#374151', marginBottom: '1rem' }}>General Information</h3>
              <p><strong>Category:</strong> {selectedSupplier.category}</p>
              <p><strong>Location:</strong> {selectedSupplier.location || 'N/A'}</p>
              <p><strong>Contact:</strong> {selectedSupplier.contactPerson || 'N/A'}</p>
              <p><strong>Audit Date:</strong> {selectedSupplier.auditDate}</p>
              <p><strong>Auditor:</strong> {selectedSupplier.auditorName}</p>
              <p><strong>GAI Score:</strong> {selectedSupplier.gai || calculateGAI(selectedSupplier.kpiScores)}%</p>
              <p><strong>Class:</strong> {selectedSupplier.supplierClass || getSupplierClass(selectedSupplier.gai || calculateGAI(selectedSupplier.kpiScores))}</p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
              <h3 style={{ color: '#374151', marginBottom: '1rem' }}>KPI Scores</h3>
              {Object.entries(selectedSupplier.kpiScores || {}).map(([kpi, score]) => (
                <p key={kpi}>
                  <strong>{kpi.toUpperCase()}:</strong> {score}/4 - {KPI_DESCRIPTIONS[kpi]}
                </p>
              ))}
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
              <h3 style={{ color: '#374151', marginBottom: '1rem' }}>Company Data</h3>
              <p><strong>Employees:</strong> {selectedSupplier.companyData?.employees || 'N/A'}</p>
              <p><strong>Annual Revenue:</strong> ${selectedSupplier.companyData?.annualRevenue || 'N/A'}</p>
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

  // ✅ MODAL PARA CONFIRMAR ELIMINACIÓN
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

  // ✅ RENDERIZAR NUEVA PESTAÑA DE ANALYTICS
  const renderAnalytics = () => {
    const kpiData = prepareKPIComparisonData(selectedCategory);
    const availableCategories = getAvailableCategories();
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
          
 {/* KPI Comparison Chart CON SELECTOR DE CATEGORÍA */}
<div style={{ 
  backgroundColor: 'white', 
  padding: '1.5rem', 
  borderRadius: '12px', 
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' 
}}>
  <div style={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '1rem' 
  }}>
    <h3 style={{ margin: 0, color: '#1f2937' }}>KPI Comparison by Supplier</h3>
    
    {/* SELECTOR DE CATEGORÍA */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <label style={{ 
        fontSize: '0.875rem', 
        fontWeight: '500', 
        color: '#6b7280' 
      }}>
        Category:
      </label>
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        style={{
          padding: '0.5rem 0.75rem',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '0.875rem',
          backgroundColor: 'white',
          color: '#374151',
          cursor: 'pointer',
          minWidth: '160px'
        }}
      >
        {availableCategories.map(category => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  </div>
  
  {/* INFORMACIÓN DE FILTRO */}
  <div style={{
    padding: '0.75rem',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    color: '#6b7280'
  }}>
    {selectedCategory === 'All Categories' ? 
      `Showing all ${kpiData.length} suppliers across all categories` :
      `Showing ${kpiData.length} suppliers in category: ${selectedCategory}`
    }
  </div>

  {/* GRÁFICO */}
  {kpiData.length > 0 ? (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={kpiData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis domain={[0, 4]} />
        <Tooltip 
          formatter={(value, name) => [value, name]}
          labelFormatter={(label) => {
            const supplier = kpiData.find(s => s.name === label);
            return supplier ? 
              `${supplier.fullName} (${supplier.category})` : label;
          }}
        />
        <Legend />
        <Bar dataKey="KPI1" fill="#8884d8" name="Production Capacity" />
        <Bar dataKey="KPI2" fill="#82ca9d" name="Quality Control" />
        <Bar dataKey="KPI3" fill="#ffc658" name="Raw Materials" />
        <Bar dataKey="KPI4" fill="#ff7300" name="Human Resources" />
        <Bar dataKey="KPI5" fill="#00bcd4" name="Logistics" />
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '300px',
      color: '#6b7280',
      fontSize: '1rem'
    }}>
      No suppliers found in category: {selectedCategory}
    </div>
  )}
</div>

          {/* Average Performance Radar */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' 
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Average KPI Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={60} domain={[0, 4]} />
                <Radar
                  name="Average Score"
                  dataKey="A"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Class Distribution */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' 
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Supplier Class Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={classData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
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

          {/* Capacity vs Revenue Scatter */}
          {capacityData.length > 0 && (
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' 
            }}>
              <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Employee Count vs Annual Revenue</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis dataKey="x" name="Employees" />
                  <YAxis dataKey="y" name="Revenue (USD)" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name) => [
                      name === 'x' ? `${value} employees` : `$${value.toLocaleString()}`,
                      name === 'x' ? 'Employees' : 'Annual Revenue'
                    ]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0) {
                        const data = payload[0].payload;
                        return `${data.name} (GAI: ${data.gai}%, Class ${data.class})`;
                      }
                      return label;
                    }}
                  />
                  <Scatter name="Suppliers" data={capacityData} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* GAI Distribution */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' 
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>GAI Score Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpiData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'GAI Score']}
                  labelFormatter={(label) => {
                    const supplier = kpiData.find(s => s.name === label);
                    return supplier ? supplier.fullName : label;
                  }}
                />
                <Bar dataKey="GAI" fill="#10b981" name="GAI Score (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Trends by Category */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' 
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Performance by Category</h3>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              {SUPPLIER_CATEGORIES.map(category => {
                const categorySuppliers = suppliers.filter(s => s.category === category);
                if (categorySuppliers.length === 0) return null;
                
                const avgGAI = categorySuppliers.reduce((sum, s) => 
                  sum + (s.gai || calculateGAI(s.kpiScores)), 0
                ) / categorySuppliers.length;
                
                return (
                  <div key={category} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '6px'
                  }}>
                    <span>{category}</span>
                    <span style={{ fontWeight: 'bold' }}>
                      {avgGAI.toFixed(1)}% ({categorySuppliers.length} suppliers)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNewChecklistForm = () => {
    return (
      <div className={styles.panelContainer}>
        <div className={styles.formHeader}>
          <h1 className={styles.formTitle}>
            {editingSupplier ? `Edit Evaluation - ${editingSupplier.supplierName}` : 'Supplier Evaluation Checklist'}
          </h1>
          <p className={styles.formSubtitle}>
            {editingSupplier 
              ? 'Update the comprehensive evaluation for this supplier'
              : 'Create a comprehensive evaluation for structural steel profile suppliers'
            }
          </p>
        </div>

        <div className={styles.formContainer} style={{ 
          background: 'linear-gradient(135deg, rgba(0, 95, 131, 0.9) 0%, rgba(0, 119, 162, 0.85) 50%, rgba(0, 144, 198, 0.8) 100%)', 
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 95, 131, 0.3)'
        }}>
          <form onSubmit={handleSubmit} className={styles.evaluationForm}>
            {/* General Information */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>General Information</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Audit Date *</label>
                  <input
                    type="date"
                    value={formData.auditDate}
                    onChange={(e) => handleDirectChange('auditDate', e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Auditor Representative *</label>
                  <input
                    type="text"
                    value={formData.auditorName}
                    onChange={(e) => handleDirectChange('auditorName', e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Supplier Name *</label>
                  <input
                    type="text"
                    value={formData.supplierName}
                    onChange={(e) => handleDirectChange('supplierName', e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Activity Field</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleDirectChange('category', e.target.value)}
                    className={styles.formSelect}
                    required
                  >
                    {SUPPLIER_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleDirectChange('location', e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => handleDirectChange('contactPerson', e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Activity Field</label>
                  <input
                    type="text"
                    value={formData.activityField}
                    onChange={(e) => handleDirectChange('activityField', e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Audit Type</label>
                  <select
                    value={formData.auditType}
                    onChange={(e) => handleDirectChange('auditType', e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="">Select audit type</option>
                    <option value="initial">Initial Audit</option>
                    <option value="follow-up">Follow-up Audit</option>
                    <option value="annual">Annual Review</option>
                    <option value="special">Special Audit</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Company Certifications */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Company Certifications</h3>
              <div className={styles.certificationsGrid}>
                {[
                  { key: 'iso9001', label: 'ISO 9001 - Quality Management' },
                  { key: 'iso14001', label: 'ISO 14001 - Environmental Management' },
                  { key: 'iso45001', label: 'ISO 45001 - Occupational Health & Safety' },
                  { key: 'en1090', label: 'EN 1090 - Structural Steel' },
                  { key: 'ceMarking', label: 'CE Marking' },
                  { key: 'others', label: 'Other certifications' }
                ].map(({ key, label }) => (
                  <label key={key} className={styles.certificationLabel}>
                    <input
                      type="checkbox"
                      checked={formData.certifications[key]}
                      onChange={(e) => handleInputChange('certifications', key, e.target.checked)}
                      className={styles.checkbox}
                    />
                    {label}
                    {key === 'others' && (
                      <input
                        type="text"
                        placeholder="Other certifications..."
                        value={formData.certifications.others}
                        onChange={(e) => handleInputChange('certifications', 'others', e.target.value)}
                        className={styles.formInput}
                        style={{ marginLeft: '8px', width: '200px' }}
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Main Company Data */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Main Company Data</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Annual Revenue (USD/year)</label>
                  <input
                    type="number"
                    value={formData.companyData.annualRevenue}
                    onChange={(e) => handleInputChange('companyData', 'annualRevenue', e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Number of Employees</label>
                  <input
                    type="number"
                    value={formData.companyData.employees}
                    onChange={(e) => handleInputChange('companyData', 'employees', e.target.value)}
                    className={styles.formInput}
                  />
                </div>
              </div>
            </div>

            {/* KPI Scoring */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Key Performance Indicators (KPI) Evaluation</h3>
              
              <div className={styles.kpiContainer}>
                {Object.entries(KPI_DESCRIPTIONS).map(([kpiKey, description]) => (
                  <div key={kpiKey} className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>
                      <h4 
                        className={styles.kpiTitle}
                        onClick={() => toggleKPIExpansion(kpiKey)}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <span>{kpiKey.toUpperCase()} - {description}</span>
                        <span className={styles.expandIcon}>
                          {expandedKPIs[kpiKey] ? '▼' : '▶'}
                        </span>
                      </h4>
                    </div>
                    
                    <div className={styles.kpiScoring}>
                      {[1, 2, 3, 4].map(score => (
                        <label key={score} className={styles.scoreOption}>
                          <input
                            type="radio"
                            name={kpiKey}
                            value={score}
                            checked={formData.kpiScores[kpiKey] === score}
                            onChange={(e) => handleInputChange('kpiScores', kpiKey, parseInt(e.target.value))}
                            className={styles.scoreRadio}
                          />
                          <span className={styles.scoreLabel}>
                            <span className={styles.scoreNumber}>{score}</span>
                            <span className={styles.scoreDescription}>{SCORE_LABELS[score]}</span>
                          </span>
                        </label>
                      ))}
                    </div>

                    {renderKPIDetailsSection(kpiKey)}
                  </div>
                ))}
              </div>

              {/* KPI Summary */}
              <div className={styles.kpiSummary}>
                <div className={styles.summaryCard}>
                  <h4>Evaluation Summary</h4>
                  <div className={styles.summaryStats}>
                    <div className={styles.summaryItem}>
                      <span>Total KPI Score:</span>
                      <span className={styles.summaryValue}>
                        {Object.values(formData.kpiScores).reduce((sum, score) => sum + (score || 0), 0)} / 20
                      </span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>G.A.I. (Global Assessment Index):</span>
                      <span className={styles.summaryValue}>
                        {calculateGAI(formData.kpiScores)}%
                      </span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Supplier Category:</span>
                      <span className={`${styles.summaryValue} ${styles.categoryBadge}`}>
                        Class {getSupplierClass(calculateGAI(formData.kpiScores))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Observations and Recommendations */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Observations and Recommendations</h3>
              <div className={styles.observationsGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Identified Strengths</label>
                  <textarea
                    value={formData.observations.strengths}
                    onChange={(e) => handleInputChange('observations', 'strengths', e.target.value)}
                    className={styles.formTextarea}
                    rows="4"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Improvement Areas</label>
                  <textarea
                    value={formData.observations.improvements}
                    onChange={(e) => handleInputChange('observations', 'improvements', e.target.value)}
                    className={styles.formTextarea}
                    rows="4"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Required Actions (if applicable)</label>
                  <textarea
                    value={formData.observations.actions}
                    onChange={(e) => handleInputChange('observations', 'actions', e.target.value)}
                    className={styles.formTextarea}
                    rows="4"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Scheduled Follow-up Date</label>
                  <input
                    type="date"
                    value={formData.observations.followUpDate}
                    onChange={(e) => handleInputChange('observations', 'followUpDate', e.target.value)}
                    className={styles.formInput}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => {
                  setEditingSupplier(null);
                  resetForm();
                  handleTabChange('dashboard');
                }}
                className={styles.btnSecondary}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={loading}
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
      </div>
    );
  };

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
          <div className={styles.categoriesContainer}>
            {SUPPLIER_CATEGORIES.map(category => {
              const categorySuppliers = suppliers.filter(s => s.category === category);
              
              if (categorySuppliers.length === 0) return null;

              return (
                <div key={category} className={styles.categorySection}>
                  <div className={styles.categoryHeader}>
                    <h3 className={styles.categoryTitle}>{category}</h3>
                    <span className={styles.categoryCount}>({categorySuppliers.length} suppliers)</span>
                  </div>

                  <div className={styles.suppliersGrid}>
                    {categorySuppliers.map(supplier => {
                      const gai = supplier.gai || calculateGAI(supplier.kpiScores);
                      const supplierClass = supplier.supplierClass || getSupplierClass(gai);
                      
                      return (
                        <div key={supplier.id} className={`${styles.supplierCard} ${styles[`class${supplierClass}`]}`}>
                          <div className={styles.supplierHeader}>
                            <h4 className={styles.supplierName}>{supplier.supplierName}</h4>
                            <div className={`${styles.supplierBadge} ${styles[`badge${supplierClass}`]}`}>
                              Class {supplierClass}
                            </div>
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

                          {/* ✅ NUEVOS BOTONES DE ACCIÓN */}
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
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                              title="View Details"
                            >
                              👁️ View
                            </button>
                            <button
                              onClick={() => handleEditSupplier(supplier)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                              title="Edit Evaluation"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSupplier(supplier)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                              title="Delete Evaluation"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {suppliers.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📋</div>
              <h3 className={styles.emptyTitle}>No Suppliers Evaluated Yet</h3>
              <p className={styles.emptyDescription}>
                Start by creating your first supplier evaluation checklist
              </p>
              <button
                onClick={() => handleTabChange('newChecklist')}
                className={styles.btnPrimary}
              >
                Create First Evaluation
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderSidebar = () => (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logoContainer}>
          <img 
            src="/images/logo2.png" 
            alt="Valmont Solar Logo" 
            className={styles.companyLogo}
          />
        </div>
      </div>
      
      <div className={styles.sidebarDivider}></div>
      
      <div className={styles.sectionTitle}>
        <span>📋 Supplier Evaluation</span>
      </div>
      
      <div className={styles.sidebarNav}>
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

        {/* ✅ NUEVA PESTAÑA DE ANALYTICS */}
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

      <BackButton onClick={onBackToMenu} />

      {/* ✅ MODALES */}
      {renderDetailModal()}
      {renderDeleteConfirmModal()}
    </div>
  );
};

export default SupplierEvaluationWrapper;
