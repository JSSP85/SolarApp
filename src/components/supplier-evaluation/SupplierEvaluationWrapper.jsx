// src/components/supplier-evaluation/SupplierEvaluationWrapper.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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

const SupplierEvaluationWrapper = ({ onBackToMenu }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedKPI, setExpandedKPI] = useState(null);

  // Form state for new supplier checklist
  const [formData, setFormData] = useState({
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
        // Production Lines
        productionLines: '',
        capacityPerLine: '',
        profileTypes: '',
        maxDimensions: '',
        minDimensions: '',
        // Main Equipment
        laserMachines: '',
        bendingPresses: '',
        bendingCapacity: '',
        weldingStations: '',
        heatTreatment: false,
        automatedSystems: false,
        // Production Schedule
        effectiveHours: '',
        workingDays: '',
        extraShifts: false
      },
      kpi2: {
        // Quality Department
        qualityManager: '',
        qualityManagerTitle: '',
        qcTeamSize: '',
        qcCertifications: '',
        // Laboratory and Testing Equipment
        ownLaboratory: false,
        iso17025: false,
        tensileTest: false,
        tensileCapacity: '',
        durometer: false,
        spectrometer: false,
        ultrasoundEND: false,
        cmm: false,
        // Procedures
        itp: false,
        testingFrequency: '',
        statisticalControl: false
      },
      kpi3: {
        // Steel Suppliers
        steelSupplier1: '',
        steelSupplier2: '',
        steelSupplier3: '',
        millCertificates: 'always',
        // Galvanizing/Coatings
        ownGalvanizing: false,
        galvanizingSupplier: '',
        galvanizingDistance: '',
        otherCoatings: '',
        // Traceability
        completeTraceability: false,
        qrIdentification: false,
        digitalRecords: false
      },
      kpi4: {
        // Key Personnel
        productionEngineer: '',
        productionExperience: '',
        weldingSupervisor: '',
        weldingCertification: '',
        labTechnicians: '',
        qualifiedOperators: '',
        // Training
        trainingProgram: false,
        currentCertifications: '',
        annualTurnover: ''
      },
      kpi5: {
        // Logistics Capacity
        logisticsManager: '',
        logisticsTeamSize: '',
        ownFleet: false,
        fleetVehicles: '',
        logisticsSubcontractors: '',
        // Delivery Times
        standardLeadTime: '',
        urgentLeadTime: '',
        changeFlexibility: 'medium',
        // Packaging and Protection
        maritimePackaging: false,
        corrosionProtection: false,
        labeling: 'basic'
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

  // Load suppliers from localStorage on mount
  useEffect(() => {
    const savedSuppliers = localStorage.getItem('supplierEvaluations');
    if (savedSuppliers) {
      setSuppliers(JSON.parse(savedSuppliers));
    }
  }, []);

  // Save suppliers to localStorage whenever suppliers change
  useEffect(() => {
    localStorage.setItem('supplierEvaluations', JSON.stringify(suppliers));
  }, [suppliers]);

  const addSupplier = (supplierData) => {
    const newSupplier = {
      ...supplierData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.displayName || 'Unknown User'
    };
    setSuppliers(prev => [...prev, newSupplier]);
    setActiveTab('dashboard');
    
    // Reset form after successful submission
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      // General Information
      supplierName: '',
      category: '',
      location: '',
      contactPerson: '',
      auditDate: new Date().toISOString().split('T')[0],
      auditorName: currentUser?.displayName || '',
      activityField: '',
      auditType: '',
      // Company Data
      companyData: {
        annualRevenue: '',
        employees: ''
      },
      // Certifications
      certifications: {
        iso9001: false,
        iso14001: false,
        iso45001: false,
        en1090: false,
        ceMarking: false,
        others: ''
      },
      // KPI Scores
      kpiScores: {
        kpi1: 0,
        kpi2: 0,
        kpi3: 0,
        kpi4: 0,
        kpi5: 0
      },
      // Detailed KPI information
      kpiDetails: {
        kpi1: {
          productionLines: '',
          capacityPerLine: '',
          profileTypes: '',
          maxDimensions: '',
          minDimensions: '',
          laserMachines: '',
          bendingPresses: '',
          bendingCapacity: '',
          weldingStations: '',
          heatTreatment: false,
          automatedSystems: false,
          effectiveHours: '',
          workingDays: '',
          extraShifts: false
        },
        kpi2: {
          qualityManager: '',
          qualityManagerTitle: '',
          qcTeamSize: '',
          qcCertifications: '',
          ownLaboratory: false,
          iso17025: false,
          tensileTest: false,
          tensileCapacity: '',
          durometer: false,
          spectrometer: false,
          ultrasoundEND: false,
          cmm: false,
          itp: false,
          testingFrequency: '',
          statisticalControl: false
        },
        kpi3: {
          steelSupplier1: '',
          steelSupplier2: '',
          steelSupplier3: '',
          millCertificates: 'always',
          ownGalvanizing: false,
          galvanizingSupplier: '',
          galvanizingDistance: '',
          otherCoatings: '',
          completeTraceability: false,
          qrIdentification: false,
          digitalRecords: false
        },
        kpi4: {
          productionEngineer: '',
          productionExperience: '',
          weldingSupervisor: '',
          weldingCertification: '',
          labTechnicians: '',
          qualifiedOperators: '',
          trainingProgram: false,
          currentCertifications: '',
          annualTurnover: ''
        },
        kpi5: {
          logisticsManager: '',
          logisticsTeamSize: '',
          ownFleet: false,
          fleetVehicles: '',
          logisticsSubcontractors: '',
          standardLeadTime: '',
          urgentLeadTime: '',
          changeFlexibility: 'medium',
          maritimePackaging: false,
          corrosionProtection: false,
          labeling: 'basic'
        }
      },
      observations: {
        strengths: '',
        improvements: '',
        actions: '',
        followUpDate: ''
      }
    });
    setExpandedKPI(null); // Reset expanded state
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

  const handleDirectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleKpiDetailChange = (kpiKey, field, value) => {
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

  const toggleKpiExpansion = (kpiKey) => {
    setExpandedKPI(expandedKPI === kpiKey ? null : kpiKey);
  };

  const handleSubmit = (e) => {
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

    addSupplier(supplierData);
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    
    // Reset form when switching to new checklist tab
    if (newTab === 'newChecklist') {
      resetForm();
    }
  };

  const calculateGAI = (kpiScores) => {
    const total = Object.values(kpiScores).reduce((sum, score) => sum + (score || 0), 0);
    const maximum = 20; // 5 KPIs × 4 points max
    return Math.round((total / maximum) * 100);
  };

  const getSupplierClass = (gai) => {
    if (gai >= 80) return 'A';
    if (gai >= 60) return 'B';
    return 'C';
  };

  const getClassColor = (supplierClass) => {
    switch (supplierClass) {
      case 'A': return '#10b981'; // Green
      case 'B': return '#f59e0b'; // Yellow
      case 'C': return '#ef4444'; // Red
      default: return '#6b7280'; // Gray
    }
  };

  const getSuppliersByCategory = (category) => {
    return suppliers.filter(supplier => supplier.category === category);
  };

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
          <span className={styles.navIcon}>➕</span>
          <span className={styles.navText}>New Supplier Checklist</span>
          {activeTab === 'newChecklist' && <div className={styles.navIndicator}></div>}
        </div>
      </div>

      <div className={styles.sidebarFooter}>
        <div className={styles.userInfo}>
          <div className={styles.userRole}>
            <span className={styles.userRoleLabel}>Current User:</span>
            <span className={`${styles.userRoleValue} ${styles[`role${currentUser?.role}`]}`}>
              {currentUser?.displayName || 'Unknown User'}
            </span>
          </div>
          
          <div className={styles.quickStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total Suppliers:</span>
              <span className={styles.statValue}>{suppliers.length}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Class A:</span>
              <span className={styles.statValue}>
                {suppliers.filter(s => getSupplierClass(calculateGAI(s.kpiScores)) === 'A').length}
              </span>
            </div>
            <div className={`${styles.statItem} ${styles.critical}`}>
              <span className={styles.statLabel}>Class C:</span>
              <span className={styles.statValue}>
                {suppliers.filter(s => getSupplierClass(calculateGAI(s.kpiScores)) === 'C').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNewChecklistForm = () => {
    return (
      <div className={styles.panelContainer}>
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <h1 className={styles.panelTitle}>
              <span className={styles.panelIcon}>📋</span>
              New Supplier Evaluation Checklist
            </h1>
            <p className={styles.panelSubtitle}>
              Complete evaluation form based on 5 Key Performance Indicators
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.formContainer}>
            {/* General Information */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>General Information</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    value={formData.supplierName}
                    onChange={(e) => handleDirectChange('supplierName', e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>

              {/* KPI 3 - Raw Materials Management & Traceability */}
              <div className={styles.kpiCard}>
                <div className={styles.kpiHeader}>
                  <h4 className={styles.kpiTitle}>
                    KPI 3 - Raw Materials Management & Traceability
                  </h4>
                </div>
                
                {/* Steel Suppliers */}
                <div className={styles.formSection}>
                  <h5 className={styles.subSectionTitle}>Steel Suppliers</h5>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Main Steel Supplier 1</label>
                      <input
                        type="text"
                        value={formData.kpiDetails.kpi3.steelSupplier1}
                        onChange={(e) => handleKpiDetailChange('kpi3', 'steelSupplier1', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Main Steel Supplier 2</label>
                      <input
                        type="text"
                        value={formData.kpiDetails.kpi3.steelSupplier2}
                        onChange={(e) => handleKpiDetailChange('kpi3', 'steelSupplier2', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Main Steel Supplier 3</label>
                      <input
                        type="text"
                        value={formData.kpiDetails.kpi3.steelSupplier3}
                        onChange={(e) => handleKpiDetailChange('kpi3', 'steelSupplier3', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Mill certificates received</label>
                      <select
                        value={formData.kpiDetails.kpi3.millCertificates}
                        onChange={(e) => handleKpiDetailChange('kpi3', 'millCertificates', e.target.value)}
                        className={styles.formInput}
                      >
                        <option value="always">Always</option>
                        <option value="sometimes">Sometimes</option>
                        <option value="never">Never</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Galvanizing/Coatings */}
                <div className={styles.formSection}>
                  <h5 className={styles.subSectionTitle}>Galvanizing/Coatings</h5>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Own galvanizing facility</label>
                      <select
                        value={formData.kpiDetails.kpi3.ownGalvanizing}
                        onChange={(e) => handleKpiDetailChange('kpi3', 'ownGalvanizing', e.target.value === 'true')}
                        className={styles.formInput}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Galvanizing supplier</label>
                      <input
                        type="text"
                        value={formData.kpiDetails.kpi3.galvanizingSupplier}
                        onChange={(e) => handleKpiDetailChange('kpi3', 'galvanizingSupplier', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Distance to galvanizer (km)</label>
                      <input
                        type="number"
                        value={formData.kpiDetails.kpi3.galvanizingDistance}
                        onChange={(e) => handleKpiDetailChange('kpi3', 'galvanizingDistance', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Other coatings available</label>
                      <input
                        type="text"
                        value={formData.kpiDetails.kpi3.otherCoatings}
                        onChange={(e) => handleKpiDetailChange('kpi3', 'otherCoatings', e.target.value)}
                        className={styles.formInput}
                        placeholder="e.g., Powder coating, Paint"
                      />
                    </div>
                  </div>
                </div>

                {/* Traceability */}
                <div className={styles.formSection}>
                  <h5 className={styles.subSectionTitle}>Traceability</h5>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Complete traceability system</label>
                      <select
                        value={formData.kpiDetails.kpi3.completeTraceability}
                        onChange={(e) => handleKpiDetailChange('kpi3', 'completeTraceability', e.target.value === 'true')}
                        className={styles.formInput}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>QR/identification on products</label>
                      <select
                        value={formData.kpiDetails.kpi3.qrIdentification}
                        onChange={(e) => handleKpiDetailChange('kpi3', 'qrIdentification', e.target.value === 'true')}
                        className={styles.formInput}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Digital records</label>
                      <select
                        value={formData.kpiDetails.kpi3.digitalRecords}
                        onChange={(e) => handleKpiDetailChange('kpi3', 'digitalRecords', e.target.value === 'true')}
                        className={styles.formInput}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* KPI 3 Score */}
                <div className={styles.kpiScoring}>
                  <h5 className={styles.subSectionTitle}>KPI 3 - Overall Score</h5>
                  {[1, 2, 3, 4].map(score => (
                    <label key={score} className={styles.scoreOption}>
                      <input
                        type="radio"
                        name="kpi3"
                        value={score}
                        checked={formData.kpiScores.kpi3 === score}
                        onChange={(e) => handleInputChange('kpiScores', 'kpi3', parseInt(e.target.value))}
                        className={styles.scoreRadio}
                      />
                      <span className={styles.scoreLabel}>
                        <span className={styles.scoreNumber}>{score}</span>
                        <span className={styles.scoreDescription}>{SCORE_LABELS[score]}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* KPI 4 - Human Resources & Competencies */}
              <div className={styles.kpiCard}>
                <div className={styles.kpiHeader}>
                  <h4 className={styles.kpiTitle}>
                    KPI 4 - Human Resources & Competencies
                  </h4>
                </div>
                
                {/* Key Personnel */}
                <div className={styles.formSection}>
                  <h5 className={styles.subSectionTitle}>Key Personnel</h5>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Production Engineer</label>
                      <input
                        type="text"
                        value={formData.kpiDetails.kpi4.productionEngineer}
                        onChange={(e) => handleKpiDetailChange('kpi4', 'productionEngineer', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Experience (years)</label>
                      <input
                        type="number"
                        value={formData.kpiDetails.kpi4.productionExperience}
                        onChange={(e) => handleKpiDetailChange('kpi4', 'productionExperience', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Welding Supervisor</label>
                      <input
                        type="text"
                        value={formData.kpiDetails.kpi4.weldingSupervisor}
                        onChange={(e) => handleKpiDetailChange('kpi4', 'weldingSupervisor', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Welding certification</label>
                      <input
                        type="text"
                        value={formData.kpiDetails.kpi4.weldingCertification}
                        onChange={(e) => handleKpiDetailChange('kpi4', 'weldingCertification', e.target.value)}
                        className={styles.formInput}
                        placeholder="e.g., AWS D1.1, EN ISO 9606"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Lab technicians (certified)</label>
                      <input
                        type="number"
                        value={formData.kpiDetails.kpi4.labTechnicians}
                        onChange={(e) => handleKpiDetailChange('kpi4', 'labTechnicians', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Qualified operators</label>
                      <input
                        type="number"
                        value={formData.kpiDetails.kpi4.qualifiedOperators}
                        onChange={(e) => handleKpiDetailChange('kpi4', 'qualifiedOperators', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                </div>

                {/* Training */}
                <div className={styles.formSection}>
                  <h5 className={styles.subSectionTitle}>Training</h5>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Training program</label>
                      <select
                        value={formData.kpiDetails.kpi4.trainingProgram}
                        onChange={(e) => handleKpiDetailChange('kpi4', 'trainingProgram', e.target.value === 'true')}
                        className={styles.formInput}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Current certifications</label>
                      <input
                        type="text"
                        value={formData.kpiDetails.kpi4.currentCertifications}
                        onChange={(e) => handleKpiDetailChange('kpi4', 'currentCertifications', e.target.value)}
                        className={styles.formInput}
                        placeholder="List active certifications"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Annual staff turnover (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.kpiDetails.kpi4.annualTurnover}
                        onChange={(e) => handleKpiDetailChange('kpi4', 'annualTurnover', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                </div>

                {/* KPI 4 Score */}
                <div className={styles.kpiScoring}>
                  <h5 className={styles.subSectionTitle}>KPI 4 - Overall Score</h5>
                  {[1, 2, 3, 4].map(score => (
                    <label key={score} className={styles.scoreOption}>
                      <input
                        type="radio"
                        name="kpi4"
                        value={score}
                        checked={formData.kpiScores.kpi4 === score}
                        onChange={(e) => handleInputChange('kpiScores', 'kpi4', parseInt(e.target.value))}
                        className={styles.scoreRadio}
                      />
                      <span className={styles.scoreLabel}>
                        <span className={styles.scoreNumber}>{score}</span>
                        <span className={styles.scoreDescription}>{SCORE_LABELS[score]}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* KPI 5 - Logistics Planning & Deliveries */}
              <div className={styles.kpiCard}>
                <div className={styles.kpiHeader}>
                  <h4 className={styles.kpiTitle}>
                    KPI 5 - Logistics Planning & Deliveries
                  </h4>
                </div>
                
                {/* Logistics Capacity */}
                <div className={styles.formSection}>
                  <h5 className={styles.subSectionTitle}>Logistics Capacity</h5>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Logistics Manager</label>
                      <input
                        type="text"
                        value={formData.kpiDetails.kpi5.logisticsManager}
                        onChange={(e) => handleKpiDetailChange('kpi5', 'logisticsManager', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Logistics team size</label>
                      <input
                        type="number"
                        value={formData.kpiDetails.kpi5.logisticsTeamSize}
                        onChange={(e) => handleKpiDetailChange('kpi5', 'logisticsTeamSize', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Own fleet</label>
                      <select
                        value={formData.kpiDetails.kpi5.ownFleet}
                        onChange={(e) => handleKpiDetailChange('kpi5', 'ownFleet', e.target.value === 'true')}
                        className={styles.formInput}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Number of vehicles</label>
                      <input
                        type="number"
                        value={formData.kpiDetails.kpi5.fleetVehicles}
                        onChange={(e) => handleKpiDetailChange('kpi5', 'fleetVehicles', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Logistics subcontractors</label>
                      <input
                        type="text"
                        value={formData.kpiDetails.kpi5.logisticsSubcontractors}
                        onChange={(e) => handleKpiDetailChange('kpi5', 'logisticsSubcontractors', e.target.value)}
                        className={styles.formInput}
                        placeholder="List main logistics partners"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Times */}
                <div className={styles.formSection}>
                  <h5 className={styles.subSectionTitle}>Delivery Times</h5>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Standard lead time (weeks)</label>
                      <input
                        type="number"
                        value={formData.kpiDetails.kpi5.standardLeadTime}
                        onChange={(e) => handleKpiDetailChange('kpi5', 'standardLeadTime', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Urgent lead time (days)</label>
                      <input
                        type="number"
                        value={formData.kpiDetails.kpi5.urgentLeadTime}
                        onChange={(e) => handleKpiDetailChange('kpi5', 'urgentLeadTime', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Flexibility for changes</label>
                      <select
                        value={formData.kpiDetails.kpi5.changeFlexibility}
                        onChange={(e) => handleKpiDetailChange('kpi5', 'changeFlexibility', e.target.value)}
                        className={styles.formInput}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Packaging and Protection */}
                <div className={styles.formSection}>
                  <h5 className={styles.subSectionTitle}>Packaging and Protection</h5>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Maritime packaging system</label>
                      <select
                        value={formData.kpiDetails.kpi5.maritimePackaging}
                        onChange={(e) => handleKpiDetailChange('kpi5', 'maritimePackaging', e.target.value === 'true')}
                        className={styles.formInput}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Corrosion protection during transport</label>
                      <select
                        value={formData.kpiDetails.kpi5.corrosionProtection}
                        onChange={(e) => handleKpiDetailChange('kpi5', 'corrosionProtection', e.target.value === 'true')}
                        className={styles.formInput}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Identification and labeling</label>
                      <select
                        value={formData.kpiDetails.kpi5.labeling}
                        onChange={(e) => handleKpiDetailChange('kpi5', 'labeling', e.target.value)}
                        className={styles.formInput}
                      >
                        <option value="insufficient">Insufficient</option>
                        <option value="basic">Basic</option>
                        <option value="complete">Complete</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* KPI 5 Score */}
                <div className={styles.kpiScoring}>
                  <h5 className={styles.subSectionTitle}>KPI 5 - Overall Score</h5>
                  {[1, 2, 3, 4].map(score => (
                    <label key={score} className={styles.scoreOption}>
                      <input
                        type="radio"
                        name="kpi5"
                        value={score}
                        checked={formData.kpiScores.kpi5 === score}
                        onChange={(e) => handleInputChange('kpiScores', 'kpi5', parseInt(e.target.value))}
                        className={styles.scoreRadio}
                      />
                      <span className={styles.scoreLabel}>
                        <span className={styles.scoreNumber}>{score}</span>
                        <span className={styles.scoreDescription}>{SCORE_LABELS[score]}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* KPI 2 - Quality Control System */}
              <div className={styles.kpiCard}>
                <div className={styles.kpiHeader}>
                  <h4 className={styles.kpiTitle}>
                    KPI 2 - Quality Control System
                  </h4>
                </div>
                
                {/* Quality Department */}
                <div className={styles.formSection}>
                  <h5 className={styles.subSectionTitle}>Quality Department</h5>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Quality Manager</label>
                      <input
                        type="text"
                        value={formData.kpiDetails.kpi2.qualityManager}
                        onChange={(e) => handleKpiDetailChange('kpi2', 'qualityManager', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Title/Experience</label>
                      <input
                        type="text"
                        value={formData.kpiDetails.kpi2.qualityManagerTitle}
                        onChange={(e) => handleKpiDetailChange('kpi2', 'qualityManagerTitle', e.target.value)}
                        className={styles.formInput}
                        placeholder="e.g., Quality Engineer, 10 years"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>QC team size (people)</label>
                      <input
                        type="number"
                        value={formData.kpiDetails.kpi2.qcTeamSize}
                        onChange={(e) => handleKpiDetailChange('kpi2', 'qcTeamSize', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Personnel certifications</label>
                      <input
                        type="text"
                        value={formData.kpiDetails.kpi2.qcCertifications}
                        onChange={(e) => handleKpiDetailChange('kpi2', 'qcCertifications', e.target.value)}
                        className={styles.formInput}
                        placeholder="e.g., ASQ CQI, ISO Lead Auditor"
                      />
                    </div>
                  </div>
                </div>

                {/* Laboratory and Testing Equipment */}
                <div className={styles.formSection}>
                  <h5 className={styles.subSectionTitle}>Laboratory and Testing Equipment</h5>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Own laboratory</label>
                      <select
                        value={formData.kpiDetails.kpi2.ownLaboratory}
                        onChange={(e) => handleKpiDetailChange('kpi2', 'ownLaboratory', e.target.value === 'true')}
                        className={styles.formInput}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>ISO 17025 accreditation</label>
                      <select
                        value={formData.kpiDetails.kpi2.iso17025}
                        onChange={(e) => handleKpiDetailChange('kpi2', 'iso17025', e.target.value === 'true')}
                        className={styles.formInput}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Tensile testing machine</label>
                      <select
                        value={formData.kpiDetails.kpi2.tensileTest}
                        onChange={(e) => handleKpiDetailChange('kpi2', 'tensileTest', e.target.value === 'true')}
                        className={styles.formInput}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Tensile capacity (kN)</label>
                      <input
                        type="number"
                        value={formData.kpiDetails.kpi2.tensileCapacity}
                        onChange={(e) => handleKpiDetailChange('kpi2', 'tensileCapacity', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Durometer</label>
                      <select
                        value={formData.kpiDetails.kpi2.durometer}
                        onChange={(e) => handleKpiDetailChange('kpi2', 'durometer', e.target.value === 'true')}
                        className={styles.formInput}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Spectrometer (chemical analysis)</label>
                      <select
                        value={formData.kpiDetails.kpi2.spectrometer}
                        onChange={(e) => handleKpiDetailChange('kpi2', 'spectrometer', e.target.value === 'true')}
                        className={styles.formInput}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Ultrasound/NDT equipment</label>
                      <select
                        value={formData.kpiDetails.kpi2.ultrasoundEND}
                        onChange={(e) => handleKpiDetailChange('kpi2', 'ultrasoundEND', e.target.value === 'true')}
                        className={styles.formInput}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>CMM (coordinate measuring machine)</label>
                      <select
                        value={formData.kpiDetails.kpi2.cmm}
                        onChange={(e) => handleKpiDetailChange('kpi2', 'cmm', e.target.value === 'true')}
                        className={styles.formInput}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Procedures */}
                <div className={styles.formSection}>
                  <h5 className={styles.subSectionTitle}>Procedures</h5>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Inspection and Testing Plan (ITP)</label>
                      <select
                        value={formData.kpiDetails.kpi2.itp}
                        onChange={(e) => handleKpiDetailChange('kpi2', 'itp', e.target.value === 'true')}
                        className={styles.formInput}
                      >
                        <option value="false">Does not exist</option>
                        <option value="true">Exists</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Testing frequency</label>
                      <input
                        type="text"
                        value={formData.kpiDetails.kpi2.testingFrequency}
                        onChange={(e) => handleKpiDetailChange('kpi2', 'testingFrequency', e.target.value)}
                        className={styles.formInput}
                        placeholder="e.g., Every batch, Weekly"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Statistical process control</label>
                      <select
                        value={formData.kpiDetails.kpi2.statisticalControl}
                        onChange={(e) => handleKpiDetailChange('kpi2', 'statisticalControl', e.target.value === 'true')}
                        className={styles.formInput}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* KPI 2 Score */}
                <div className={styles.kpiScoring}>
                  <h5 className={styles.subSectionTitle}>KPI 2 - Overall Score</h5>
                  {[1, 2, 3, 4].map(score => (
                    <label key={score} className={styles.scoreOption}>
                      <input
                        type="radio"
                        name="kpi2"
                        value={score}
                        checked={formData.kpiScores.kpi2 === score}
                        onChange={(e) => handleInputChange('kpiScores', 'kpi2', parseInt(e.target.value))}
                        className={styles.scoreRadio}
                      />
                      <span className={styles.scoreLabel}>
                        <span className={styles.scoreNumber}>{score}</span>
                        <span className={styles.scoreDescription}>{SCORE_LABELS[score]}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleDirectChange('category', e.target.value)}
                    className={styles.formInput}
                    required
                  >
                    <option value="">Select Category</option>
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
                  <label className={styles.formLabel}>Audit Date</label>
                  <input
                    type="date"
                    value={formData.auditDate}
                    onChange={(e) => handleDirectChange('auditDate', e.target.value)}
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
              </div>
            </div>

            {/* Company Data */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Company Data</h3>
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
              
              {/* KPI 1 - Production Capacity & Equipment */}
              <div className={styles.kpiCard}>
                <div className={styles.kpiHeader}>
                  <h4 className={styles.kpiTitle}>
                    KPI 1 - Production Capacity & Equipment
                  </h4>
                </div>
                
                {/* Production Lines */}
                <div className={styles.formSection}>
                  <h5 className={styles.subSectionTitle}>Production Lines</h5>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Number of rolling/forming lines</label>
                      <input
                        type="number"
                        value={formData.kpiDetails.kpi1.productionLines}
                        onChange={(e) => handleKpiDetailChange('kpi1', 'productionLines', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Capacity per line (ton/day)</label>
                      <input
                        type="number"
                        value={formData.kpiDetails.kpi1.capacityPerLine}
                        onChange={(e) => handleKpiDetailChange('kpi1', 'capacityPerLine', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Type of profiles produced</label>
                      <input
                        type="text"
                        value={formData.kpiDetails.kpi1.profileTypes}
                        onChange={(e) => handleKpiDetailChange('kpi1', 'profileTypes', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Maximum dimensions</label>
                      <input
                        type="text"
                        value={formData.kpiDetails.kpi1.maxDimensions}
                        onChange={(e) => handleKpiDetailChange('kpi1', 'maxDimensions', e.target.value)}
                        className={styles.formInput}
                        placeholder="e.g., 300x200mm"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Minimum dimensions</label>
                      <input
                        type="text"
                        value={formData.kpiDetails.kpi1.minDimensions}
                        onChange={(e) => handleKpiDetailChange('kpi1', 'minDimensions', e.target.value)}
                        className={styles.formInput}
                        placeholder="e.g., 20x20mm"
                      />
                    </div>
                  </div>
                </div>

                {/* Main Equipment */}
                <div className={styles.formSection}>
                  <h5 className={styles.subSectionTitle}>Main Equipment</h5>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Laser cutting machines (units)</label>
                      <input
                        type="number"
                        value={formData.kpiDetails.kpi1.laserMachines}
                        onChange={(e) => handleKpiDetailChange('kpi1', 'laserMachines', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Bending presses (units)</label>
                      <input
                        type="number"
                        value={formData.kpiDetails.kpi1.bendingPresses}
                        onChange={(e) => handleKpiDetailChange('kpi1', 'bendingPresses', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Bending capacity (ton)</label>
                      <input
                        type="number"
                        value={formData.kpiDetails.kpi1.bendingCapacity}
                        onChange={(e) => handleKpiDetailChange('kpi1', 'bendingCapacity', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>TIG/MIG welding stations (units)</label>
                      <input
                        type="number"
                        value={formData.kpiDetails.kpi1.weldingStations}
                        onChange={(e) => handleKpiDetailChange('kpi1', 'weldingStations', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Heat treatment furnaces</label>
                      <select
                        value={formData.kpiDetails.kpi1.heatTreatment}
                        onChange={(e) => handleKpiDetailChange('kpi1', 'heatTreatment', e.target.value === 'true')}
                        className={styles.formInput}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Automated handling systems</label>
                      <select
                        value={formData.kpiDetails.kpi1.automatedSystems}
                        onChange={(e) => handleKpiDetailChange('kpi1', 'automatedSystems', e.target.value === 'true')}
                        className={styles.formInput}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Production Schedule */}
                <div className={styles.formSection}>
                  <h5 className={styles.subSectionTitle}>Production Schedule</h5>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Effective production hours/day</label>
                      <input
                        type="number"
                        value={formData.kpiDetails.kpi1.effectiveHours}
                        onChange={(e) => handleKpiDetailChange('kpi1', 'effectiveHours', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Operating days/week</label>
                      <input
                        type="number"
                        min="1"
                        max="7"
                        value={formData.kpiDetails.kpi1.workingDays}
                        onChange={(e) => handleKpiDetailChange('kpi1', 'workingDays', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Flexibility for additional shifts</label>
                      <select
                        value={formData.kpiDetails.kpi1.extraShifts}
                        onChange={(e) => handleKpiDetailChange('kpi1', 'extraShifts', e.target.value === 'true')}
                        className={styles.formInput}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* KPI 1 Score */}
                <div className={styles.kpiScoring}>
                  <h5 className={styles.subSectionTitle}>KPI 1 - Overall Score</h5>
                  {[1, 2, 3, 4].map(score => (
                    <label key={score} className={styles.scoreOption}>
                      <input
                        type="radio"
                        name="kpi1"
                        value={score}
                        checked={formData.kpiScores.kpi1 === score}
                        onChange={(e) => handleInputChange('kpiScores', 'kpi1', parseInt(e.target.value))}
                        className={styles.scoreRadio}
                      />
                      <span className={styles.scoreLabel}>
                        <span className={styles.scoreNumber}>{score}</span>
                        <span className={styles.scoreDescription}>{SCORE_LABELS[score]}</span>
                      </span>
                    </label>
                  ))}
                </div>
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
                      <span>Supplier Classification:</span>
                      <span 
                        className={styles.supplierClass}
                        style={{ color: getClassColor(getSupplierClass(calculateGAI(formData.kpiScores))) }}
                      >
                        Class {getSupplierClass(calculateGAI(formData.kpiScores))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Observations */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Observations & Recommendations</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>Identified Strengths</label>
                  <textarea
                    value={formData.observations.strengths}
                    onChange={(e) => handleInputChange('observations', 'strengths', e.target.value)}
                    className={styles.formTextarea}
                    rows="3"
                  />
                </div>

                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>Areas for Improvement</label>
                  <textarea
                    value={formData.observations.improvements}
                    onChange={(e) => handleInputChange('observations', 'improvements', e.target.value)}
                    className={styles.formTextarea}
                    rows="3"
                  />
                </div>

                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>Required Actions</label>
                  <textarea
                    value={formData.observations.actions}
                    onChange={(e) => handleInputChange('observations', 'actions', e.target.value)}
                    className={styles.formTextarea}
                    rows="3"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Follow-up Date</label>
                  <input
                    type="date"
                    value={formData.observations.followUpDate}
                    onChange={(e) => handleInputChange('observations', 'followUpDate', e.target.value)}
                    className={styles.formInput}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => handleTabChange('dashboard')}
                className={styles.btnSecondary}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.btnPrimary}
              >
                Save Supplier Evaluation
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
              {suppliers.filter(s => getSupplierClass(calculateGAI(s.kpiScores)) === 'A').length}
            </div>
            <div className={styles.statLabel}>Class A (≥80%)</div>
          </div>
        </div>

        <div className={styles.statCard} style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className={styles.statIcon}>⚠️</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {suppliers.filter(s => getSupplierClass(calculateGAI(s.kpiScores)) === 'B').length}
            </div>
            <div className={styles.statLabel}>Class B (60-79%)</div>
          </div>
        </div>

        <div className={styles.statCard} style={{ borderLeft: '4px solid #ef4444' }}>
          <div className={styles.statIcon}>🚨</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {suppliers.filter(s => getSupplierClass(calculateGAI(s.kpiScores)) === 'C').length}
            </div>
            <div className={styles.statLabel}>Class C (&lt;60%)</div>
          </div>
        </div>
      </div>

      {/* Suppliers by Category */}
      <div className={styles.categoriesContainer}>
        {SUPPLIER_CATEGORIES.map(category => {
          const categorySuppliers = getSuppliersByCategory(category);
          if (categorySuppliers.length === 0) return null;

          return (
            <div key={category} className={styles.categoryCard}>
              <div className={styles.categoryHeader}>
                <h3 className={styles.categoryTitle}>{category}</h3>
                <span className={styles.categoryCount}>
                  {categorySuppliers.length} supplier{categorySuppliers.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className={styles.suppliersGrid}>
                {categorySuppliers.map(supplier => {
                  const gai = calculateGAI(supplier.kpiScores);
                  const supplierClass = getSupplierClass(gai);
                  
                  return (
                    <div key={supplier.id} className={styles.supplierCard}>
                      <div className={styles.supplierHeader}>
                        <div className={styles.supplierName}>{supplier.supplierName}</div>
                        <div 
                          className={styles.supplierClass}
                          style={{ 
                            backgroundColor: getClassColor(supplierClass),
                            color: 'white'
                          }}
                        >
                          Class {supplierClass}
                        </div>
                      </div>
                      
                      <div className={styles.supplierDetails}>
                        <div className={styles.supplierLocation}>📍 {supplier.location || 'No location'}</div>
                        <div className={styles.supplierGAI}>G.A.I.: {gai}%</div>
                        <div className={styles.supplierDate}>
                          📅 {new Date(supplier.auditDate).toLocaleDateString()}
                        </div>
                      </div>

                      <div className={styles.kpiBreakdown}>
                        <div className={styles.kpiTitle}>KPI Scores:</div>
                        <div className={styles.kpiScores}>
                          {Object.entries(supplier.kpiScores).map(([kpi, score]) => (
                            <span key={kpi} className={styles.kpiScore}>
                              {kpi.toUpperCase()}: {score}/4
                            </span>
                          ))}
                        </div>
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
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'newChecklist':
        return renderNewChecklistForm();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Back to Menu Button */}
      <button 
        className={styles.backButton}
        onClick={onBackToMenu}
      >
        <span className={styles.backIcon}>←</span>
        Back to Menu
      </button>

      <div className={styles.appContainer}>
        {renderSidebar()}
        
        <div className={styles.mainContent}>
          {/* Content Header */}
          <div className={styles.contentHeader}>
            <div className={styles.headerInfo}>
              <h1 className={styles.mainTitle}>Supplier Evaluation Management</h1>
              <div className={styles.breadcrumb}>
                Quality Control → Supplier Management → {activeTab === 'dashboard' ? 'Dashboard' : 'New Checklist'}
              </div>
            </div>
            
            <div className={styles.headerActions}>
              {activeTab !== 'newChecklist' && (
                <button 
                  className={styles.btnPrimary}
                  onClick={() => handleTabChange('newChecklist')}
                >
                  <span className={styles.btnIcon}>➕</span>
                  Quick Create Checklist
                </button>
              )}
              
              <div className={styles.userRoleIndicator}>
                <span className={`${styles.roleBadge} ${styles[`role${currentUser?.role}`]}`}>
                  {currentUser?.displayName || 'Unknown User'}
                </span>
              </div>
            </div>
          </div>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SupplierEvaluationWrapper;