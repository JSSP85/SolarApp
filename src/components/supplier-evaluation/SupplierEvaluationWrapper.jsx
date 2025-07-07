// src/components/supplier-evaluation/SupplierEvaluationWrapper.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './SupplierEvaluation.module.css';

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
          onClick={() => setActiveTab('dashboard')}
        >
          <span className={styles.navIcon}>📊</span>
          <span className={styles.navText}>Dashboard</span>
          {activeTab === 'dashboard' && <div className={styles.navIndicator}></div>}
        </div>
        
        <div 
          className={`${styles.navItem} ${activeTab === 'newChecklist' ? styles.active : ''}`}
          onClick={() => setActiveTab('newChecklist')}
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
    const [formData, setFormData] = useState({
      supplierName: '',
      category: '',
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
      observations: {
        strengths: '',
        improvements: '',
        actions: '',
        followUpDate: ''
      }
    });

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

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Working Days/Week</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={formData.companyData.workingDays}
                    onChange={(e) => handleInputChange('companyData', 'workingDays', e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Number of Shifts</label>
                  <input
                    type="number"
                    value={formData.companyData.shifts}
                    onChange={(e) => handleInputChange('companyData', 'shifts', e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Production Hours/Day</label>
                  <input
                    type="number"
                    value={formData.companyData.productionHours}
                    onChange={(e) => handleInputChange('companyData', 'productionHours', e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Installed Capacity (ton/month)</label>
                  <input
                    type="number"
                    value={formData.companyData.installedCapacity}
                    onChange={(e) => handleInputChange('companyData', 'installedCapacity', e.target.value)}
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
                      <h4 className={styles.kpiTitle}>
                        {kpiKey.toUpperCase()} - {description}
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
                onClick={() => setActiveTab('dashboard')}
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
            <div className={styles.statLabel}>Class C (<60%)</div>
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
            onClick={() => setActiveTab('newChecklist')}
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
                  onClick={() => setActiveTab('newChecklist')}
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
