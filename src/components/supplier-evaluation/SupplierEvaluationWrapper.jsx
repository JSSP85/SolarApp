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
  const [expandedKPIs, setExpandedKPIs] = useState({}); // State for KPI expansions

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
        maxMinDimensions: '',
        // Main Equipment
        laserCuttingMachines: '',
        bendingPresses: '',
        bendingPressCapacity: '',
        weldingStations: '',
        heatTreatmentOvens: false,
        automatedHandling: false,
        // Production Schedule
        effectiveProductionHours: '',
        workingDays: '',
        shiftFlexibility: false,
        shifts: '',
        installedCapacity: ''
      },
      kpi2: {
        // Quality Department
        qualityResponsible: '',
        qualityTeamSize: '',
        staffCertifications: '',
        // Laboratory & Testing Equipment
        ownLaboratory: false,
        iso17025Accreditation: false,
        tensionMachine: false,
        tensionMachineCapacity: '',
        durometers: false,
        spectrometer: false,
        ultrasoundEquipment: false,
        cmmMachine: false,
        // Procedures
        inspectionTestPlan: false,
        testingFrequency: '',
        statisticalProcessControl: false
      },
      kpi3: {
        // Steel Suppliers
        mainSupplier1: '',
        mainSupplier2: '',
        mainSupplier3: '',
        millCertificates: '',
        // Galvanizing/Coatings
        ownGalvanizing: false,
        galvanizingSupplier: '',
        galvanizingDistance: '',
        otherCoatings: '',
        // Traceability
        completeTraceability: false,
        qrCodeIdentification: false,
        digitalRecords: false
      },
      kpi4: {
        // Key Personnel
        productionEngineer: '',
        productionEngineerExp: '',
        weldingSupervisor: '',
        weldingSupervisorCert: '',
        certifiedLabTechnicians: '',
        qualifiedOperators: '',
        // Training
        trainingProgram: false,
        currentCertifications: '',
        annualTurnover: ''
      },
      kpi5: {
        // Logistics Capacity
        logisticsResponsible: '',
        logisticsTeamSize: '',
        ownFleet: false,
        fleetVehicles: '',
        logisticsSubcontractors: '',
        // Delivery Times
        standardLeadTime: '',
        urgentLeadTime: '',
        changeFlexibility: '',
        // Packaging & Protection
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
          productionLines: '',
          capacityPerLine: '',
          profileTypes: '',
          maxMinDimensions: '',
          laserCuttingMachines: '',
          bendingPresses: '',
          bendingPressCapacity: '',
          weldingStations: '',
          heatTreatmentOvens: false,
          automatedHandling: false,
          effectiveProductionHours: '',
          workingDays: '',
          shiftFlexibility: false,
          shifts: '',
          installedCapacity: ''
        },
        kpi2: {
          qualityResponsible: '',
          qualityTeamSize: '',
          staffCertifications: '',
          ownLaboratory: false,
          iso17025Accreditation: false,
          tensionMachine: false,
          tensionMachineCapacity: '',
          durometers: false,
          spectrometer: false,
          ultrasoundEquipment: false,
          cmmMachine: false,
          inspectionTestPlan: false,
          testingFrequency: '',
          statisticalProcessControl: false
        },
        kpi3: {
          mainSupplier1: '',
          mainSupplier2: '',
          mainSupplier3: '',
          millCertificates: '',
          ownGalvanizing: false,
          galvanizingSupplier: '',
          galvanizingDistance: '',
          otherCoatings: '',
          completeTraceability: false,
          qrCodeIdentification: false,
          digitalRecords: false
        },
        kpi4: {
          productionEngineer: '',
          productionEngineerExp: '',
          weldingSupervisor: '',
          weldingSupervisorCert: '',
          certifiedLabTechnicians: '',
          qualifiedOperators: '',
          trainingProgram: false,
          currentCertifications: '',
          annualTurnover: ''
        },
        kpi5: {
          logisticsResponsible: '',
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
  };

  const calculateGAI = (kpiScores) => {
    const totalScore = Object.values(kpiScores).reduce((sum, score) => sum + (score || 0), 0);
    const maxScore = 20; // 5 KPIs * 4 max score each
    return Math.round((totalScore / maxScore) * 100);
  };

  const getSupplierClass = (gai) => {
    if (gai >= 80) return 'A';
    if (gai >= 60) return 'B';
    return 'C';
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
          <span className={styles.navText}>New Evaluation</span>
          {activeTab === 'newChecklist' && <div className={styles.navIndicator}></div>}
        </div>
      </div>
    </div>
  );

  const renderKPIDetailsSection = (kpiKey) => {
    const isExpanded = expandedKPIs[kpiKey];
    const details = formData.kpiDetails[kpiKey];

    if (!isExpanded) return null;

    switch (kpiKey) {
      case 'kpi1':
        return (
          <div className={styles.kpiDetailsSection}>
            <h5 className={styles.detailsSectionTitle}>Production Lines</h5>
            <div className={styles.detailsGrid}>
              <div className={styles.formGroup}>
                <label>Number of rolling/forming lines</label>
                <input
                  type="number"
                  value={details.productionLines}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'productionLines', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Capacity per line (ton/day)</label>
                <input
                  type="number"
                  value={details.capacityPerLine}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'capacityPerLine', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Profile types produced</label>
                <input
                  type="text"
                  value={details.profileTypes}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'profileTypes', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Max/Min dimensions</label>
                <input
                  type="text"
                  value={details.maxMinDimensions}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'maxMinDimensions', e.target.value)}
                  className={styles.formInput}
                />
              </div>
            </div>

            <h5 className={styles.detailsSectionTitle}>Main Equipment</h5>
            <div className={styles.detailsGrid}>
              <div className={styles.formGroup}>
                <label>Laser cutting machines (units)</label>
                <input
                  type="number"
                  value={details.laserCuttingMachines}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'laserCuttingMachines', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Bending presses (units)</label>
                <input
                  type="number"
                  value={details.bendingPresses}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'bendingPresses', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Bending press capacity (ton)</label>
                <input
                  type="number"
                  value={details.bendingPressCapacity}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'bendingPressCapacity', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>TIG/MIG welding stations (units)</label>
                <input
                  type="number"
                  value={details.weldingStations}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'weldingStations', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={details.heatTreatmentOvens}
                    onChange={(e) => handleKPIDetailChange(kpiKey, 'heatTreatmentOvens', e.target.checked)}
                    className={styles.checkbox}
                  />
                  Heat treatment ovens
                </label>
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={details.automatedHandling}
                    onChange={(e) => handleKPIDetailChange(kpiKey, 'automatedHandling', e.target.checked)}
                    className={styles.checkbox}
                  />
                  Automated handling systems
                </label>
              </div>
            </div>

            <h5 className={styles.detailsSectionTitle}>Production Schedule</h5>
            <div className={styles.detailsGrid}>
              <div className={styles.formGroup}>
                <label>Effective production hours/day</label>
                <input
                  type="number"
                  value={details.effectiveProductionHours}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'effectiveProductionHours', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Working days/week</label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={details.workingDays}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'workingDays', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Number of shifts</label>
                <input
                  type="number"
                  value={details.shifts}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'shifts', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Installed capacity (ton/month)</label>
                <input
                  type="number"
                  value={details.installedCapacity}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'installedCapacity', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={details.shiftFlexibility}
                    onChange={(e) => handleKPIDetailChange(kpiKey, 'shiftFlexibility', e.target.checked)}
                    className={styles.checkbox}
                  />
                  Flexibility for additional shifts
                </label>
              </div>
            </div>
          </div>
        );

      case 'kpi2':
        return (
          <div className={styles.kpiDetailsSection}>
            <h5 className={styles.detailsSectionTitle}>Quality Department</h5>
            <div className={styles.detailsGrid}>
              <div className={styles.formGroup}>
                <label>Quality responsible (title/experience)</label>
                <input
                  type="text"
                  value={details.qualityResponsible}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'qualityResponsible', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>QC team personnel (number)</label>
                <input
                  type="number"
                  value={details.qualityTeamSize}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'qualityTeamSize', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Staff certifications</label>
                <input
                  type="text"
                  value={details.staffCertifications}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'staffCertifications', e.target.value)}
                  className={styles.formInput}
                />
              </div>
            </div>

            <h5 className={styles.detailsSectionTitle}>Laboratory & Testing Equipment</h5>
            <div className={styles.detailsGrid}>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={details.ownLaboratory}
                    onChange={(e) => handleKPIDetailChange(kpiKey, 'ownLaboratory', e.target.checked)}
                    className={styles.checkbox}
                  />
                  Own laboratory
                </label>
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={details.iso17025Accreditation}
                    onChange={(e) => handleKPIDetailChange(kpiKey, 'iso17025Accreditation', e.target.checked)}
                    className={styles.checkbox}
                  />
                  ISO 17025 accreditation
                </label>
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={details.tensionMachine}
                    onChange={(e) => handleKPIDetailChange(kpiKey, 'tensionMachine', e.target.checked)}
                    className={styles.checkbox}
                  />
                  Tension machine
                </label>
              </div>
              <div className={styles.formGroup}>
                <label>Tension machine capacity (kN)</label>
                <input
                  type="number"
                  value={details.tensionMachineCapacity}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'tensionMachineCapacity', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={details.durometers}
                    onChange={(e) => handleKPIDetailChange(kpiKey, 'durometers', e.target.checked)}
                    className={styles.checkbox}
                  />
                  Durometers
                </label>
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={details.spectrometer}
                    onChange={(e) => handleKPIDetailChange(kpiKey, 'spectrometer', e.target.checked)}
                    className={styles.checkbox}
                  />
                  Spectrometer (chemical analysis)
                </label>
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={details.ultrasoundEquipment}
                    onChange={(e) => handleKPIDetailChange(kpiKey, 'ultrasoundEquipment', e.target.checked)}
                    className={styles.checkbox}
                  />
                  Ultrasound/NDT equipment
                </label>
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={details.cmmMachine}
                    onChange={(e) => handleKPIDetailChange(kpiKey, 'cmmMachine', e.target.checked)}
                    className={styles.checkbox}
                  />
                  CMM (coordinate measuring machine)
                </label>
              </div>
            </div>

            <h5 className={styles.detailsSectionTitle}>Procedures</h5>
            <div className={styles.detailsGrid}>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={details.inspectionTestPlan}
                    onChange={(e) => handleKPIDetailChange(kpiKey, 'inspectionTestPlan', e.target.checked)}
                    className={styles.checkbox}
                  />
                  Inspection and Test Plan (ITP) exists
                </label>
              </div>
              <div className={styles.formGroup}>
                <label>Testing frequency</label>
                <input
                  type="text"
                  value={details.testingFrequency}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'testingFrequency', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={details.statisticalProcessControl}
                    onChange={(e) => handleKPIDetailChange(kpiKey, 'statisticalProcessControl', e.target.checked)}
                    className={styles.checkbox}
                  />
                  Statistical process control
                </label>
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

            <h5 className={styles.detailsSectionTitle}>Galvanizing/Coatings</h5>
            <div className={styles.detailsGrid}>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={details.ownGalvanizing}
                    onChange={(e) => handleKPIDetailChange(kpiKey, 'ownGalvanizing', e.target.checked)}
                    className={styles.checkbox}
                  />
                  Own galvanizing
                </label>
              </div>
              <div className={styles.formGroup}>
                <label>Galvanizing supplier</label>
                <input
                  type="text"
                  value={details.galvanizingSupplier}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'galvanizingSupplier', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Distance to galvanizing (km)</label>
                <input
                  type="number"
                  value={details.galvanizingDistance}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'galvanizingDistance', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Other available coatings</label>
                <input
                  type="text"
                  value={details.otherCoatings}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'otherCoatings', e.target.value)}
                  className={styles.formInput}
                />
              </div>
            </div>

            <h5 className={styles.detailsSectionTitle}>Traceability</h5>
            <div className={styles.detailsGrid}>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={details.completeTraceability}
                    onChange={(e) => handleKPIDetailChange(kpiKey, 'completeTraceability', e.target.checked)}
                    className={styles.checkbox}
                  />
                  Complete traceability system
                </label>
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={details.qrCodeIdentification}
                    onChange={(e) => handleKPIDetailChange(kpiKey, 'qrCodeIdentification', e.target.checked)}
                    className={styles.checkbox}
                  />
                  QR code/identification on products
                </label>
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={details.digitalRecords}
                    onChange={(e) => handleKPIDetailChange(kpiKey, 'digitalRecords', e.target.checked)}
                    className={styles.checkbox}
                  />
                  Digital records
                </label>
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
                <label>Production engineer</label>
                <input
                  type="text"
                  value={details.productionEngineer}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'productionEngineer', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Experience (years)</label>
                <input
                  type="number"
                  value={details.productionEngineerExp}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'productionEngineerExp', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Welding supervisor</label>
                <input
                  type="text"
                  value={details.weldingSupervisor}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'weldingSupervisor', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Welding supervisor certification</label>
                <input
                  type="text"
                  value={details.weldingSupervisorCert}
                  onChange={(e) => handleKPIDetailChange(kpiKey, 'weldingSupervisorCert', e.target.value)}
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
                <label>Fleet vehicles (number)</label>
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
                <label>Standard lead time (weeks)</label>
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
                <label>Flexibility for changes</label>
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

  const renderNewChecklistForm = () => {
    return (
      <div className={styles.panelContainer}>
        <div className={styles.formHeader}>
          <h1 className={styles.formTitle}>Supplier Evaluation Checklist</h1>
          <p className={styles.formSubtitle}>Create a comprehensive evaluation for structural steel profile suppliers</p>
        </div>

        <div className={styles.formContainer} style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
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
                  <label className={styles.formLabel}>Main Contact</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => handleDirectChange('contactPerson', e.target.value)}
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formSubsection}>
                <h4 className={styles.subsectionTitle}>Audit Type</h4>
                <div className={styles.radioGroup}>
                  {['1st Audit', 'Periodic Audit', 'Follow-up Audit'].map(type => (
                    <label key={type} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="auditType"
                        value={type}
                        checked={formData.auditType === type}
                        onChange={(e) => handleDirectChange('auditType', e.target.value)}
                        className={styles.radioInput}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Company Certifications */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Company Certifications</h3>
              <div className={styles.certificationsGrid}>
                {Object.keys(formData.certifications).map(cert => (
                  <label key={cert} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.certifications[cert]}
                      onChange={(e) => handleInputChange('certifications', cert, e.target.checked)}
                      className={styles.checkbox}
                    />
                    {cert === 'iso9001' && 'ISO 9001:2015'}
                    {cert === 'iso14001' && 'ISO 14001:2015'}
                    {cert === 'iso45001' && 'ISO 45001/OHSAS 18001'}
                    {cert === 'en1090' && 'EN 1090 (Steel Structures)'}
                    {cert === 'ceMarking' && 'CE Marking'}
                    {cert === 'others' && (
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
          <div className={styles.statIcon}>❌</div>
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
                  const gai = calculateGAI(supplier.kpiScores);
                  const supplierClass = getSupplierClass(gai);
                  
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
                          📈 G.A.I.: {gai}%
                        </div>
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
      <div className={styles.appContainer}>
        {renderSidebar()}
        
        <div className={styles.mainContent}>
          {/* Content Header */}
          <div className={styles.contentHeader}>
            <div className={styles.headerInfo}>
              <h1 className={styles.mainTitle}>Supplier Evaluation Management</h1>
              <div className={styles.breadcrumb}>
                Quality Control → Supplier Management → {activeTab === 'dashboard' ? 'Dashboard' : 'New Evaluation'}
              </div>
            </div>
          </div>

          {/* Main Content */}
          {renderContent()}
        </div>
      </div>

      {/* Circular Back Button */}
      <button
        onClick={onBackToMenu}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s',
          zIndex: 1000
        }}
        onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
      >
        <span style={{ fontSize: '24px', color: '#005F83' }}>←</span>
      </button>
    </div>
  );
};

export default SupplierEvaluationWrapper;