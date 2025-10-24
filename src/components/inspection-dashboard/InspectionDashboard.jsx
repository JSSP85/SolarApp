import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { X, Plus, Save, AlertCircle, Eye, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import '../../styles/inspection-dashboard.css';

const InspectionDashboard = () => {
  const [inspections, setInspections] = useState([]);
  const [groupedInspections, setGroupedInspections] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingInspection, setEditingInspection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    inspectionDate: '',
    supplier: '',
    inspectionLocation: '',
    inspectorType: '',
    externalInspectorName: '',
    cost: '',
    inspectionRemark: '',
    purchaseOrder: '',
    components: [{
      client: '',
      projectName: '',
      componentCode: '',
      componentDescription: '',
      quantity: '',
      inspectionOutcome: '',
      nonConformityNumber: ''
    }]
  });

  const getQuarterAndMonth = (dateString) => {
    if (!dateString) return { quarter: '', month: '' };
    
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const quarter = Math.ceil(month / 3);
    
    const monthNames = {
      1: 'gennaio', 2: 'febbraio', 3: 'marzo', 4: 'aprile',
      5: 'maggio', 6: 'giugno', 7: 'luglio', 8: 'agosto',
      9: 'settembre', 10: 'ottobre', 11: 'novembre', 12: 'dicembre'
    };
    
    return {
      quarter: `Q${quarter}`,
      month: monthNames[month]
    };
  };

  // Calculate overall inspection outcome based on component outcomes
  const calculateOverallOutcome = (components) => {
    if (!components || components.length === 0) return 'N/A';
    
    const outcomes = components.map(c => c.inspectionOutcome).filter(Boolean);
    if (outcomes.length === 0) return 'N/A';
    
    // If any component is negative, overall is negative
    if (outcomes.some(o => o === 'negative')) return 'negative';
    
    // If any component has comments, overall has comments
    if (outcomes.some(o => o === 'positive with comments')) return 'positive with comments';
    
    // If all are positive, overall is positive
    if (outcomes.every(o => o === 'positive')) return 'positive';
    
    return 'N/A';
  };

  // Group inspections by general data (date, supplier, location, etc.)
  const groupInspectionsByGeneral = (inspectionsList) => {
    const grouped = {};
    
    inspectionsList.forEach(inspection => {
      // Create a unique key based on general inspection data
      const key = `${inspection.inspectionDate}_${inspection.supplier}_${inspection.inspectionLocation}_${inspection.inspectorType}_${inspection.purchaseOrder}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          id: inspection.id, // Use first component's ID as group ID
          inspectionDate: inspection.inspectionDate,
          quarter: inspection.quarter,
          supplier: inspection.supplier,
          inspectionLocation: inspection.inspectionLocation,
          inspectorType: inspection.inspectorType,
          externalInspectorName: inspection.externalInspectorName,
          cost: inspection.cost,
          purchaseOrder: inspection.purchaseOrder,
          inspectionRemark: inspection.inspectionRemark,
          createdAt: inspection.createdAt,
          components: []
        };
      }
      
      // Add component to this inspection group
      grouped[key].components.push({
        id: inspection.id,
        client: inspection.client,
        projectName: inspection.projectName,
        componentCode: inspection.componentCode,
        componentDescription: inspection.componentDescription,
        quantity: inspection.quantity,
        inspectionOutcome: inspection.inspectionOutcome,
        nonConformityNumber: inspection.nonConformityNumber
      });
    });
    
    // Convert to array and calculate overall outcomes
    const groupedArray = Object.values(grouped).map(group => ({
      ...group,
      overallOutcome: calculateOverallOutcome(group.components)
    }));
    
    return groupedArray;
  };

  const loadInspections = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'inspections'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const inspectionData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter out empty inspections (no date or supplier)
      const validInspections = inspectionData.filter(
        inspection => inspection.inspectionDate && inspection.supplier
      );
      
      setInspections(validInspections);
      
      // Group inspections by general data
      const grouped = groupInspectionsByGeneral(validInspections);
      setGroupedInspections(grouped);
      
    } catch (err) {
      console.error('Error loading inspections:', err);
      setError('Error loading inspections');
    } finally {
      setLoading(false);
    }
  };

  // Clean empty inspections from database
  const cleanEmptyInspections = async () => {
    if (!window.confirm('This will delete all empty inspection records. Continue?')) {
      return;
    }
    
    try {
      setLoading(true);
      const q = query(collection(db, 'inspections'));
      const querySnapshot = await getDocs(q);
      
      let deletedCount = 0;
      const deletePromises = [];
      
      querySnapshot.docs.forEach(docSnapshot => {
        const data = docSnapshot.data();
        // Delete if missing critical fields
        if (!data.inspectionDate || !data.supplier) {
          deletePromises.push(deleteDoc(doc(db, 'inspections', docSnapshot.id)));
          deletedCount++;
        }
      });
      
      await Promise.all(deletePromises);
      
      setSuccess(`Deleted ${deletedCount} empty inspection records`);
      loadInspections();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error cleaning empty inspections:', err);
      setError('Error cleaning empty inspections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInspections();
  }, []);

  const toggleRow = (inspectionId) => {
    setExpandedRows(prev => ({
      ...prev,
      [inspectionId]: !prev[inspectionId]
    }));
  };

  const addComponent = () => {
    setFormData({
      ...formData,
      components: [...formData.components, {
        client: '',
        projectName: '',
        componentCode: '',
        componentDescription: '',
        quantity: '',
        inspectionOutcome: '',
        nonConformityNumber: ''
      }]
    });
  };

  const removeComponent = (index) => {
    const newComponents = formData.components.filter((_, i) => i !== index);
    setFormData({ ...formData, components: newComponents });
  };

  const updateComponent = (index, field, value) => {
    const newComponents = [...formData.components];
    newComponents[index][field] = value;
    
    if (field === 'inspectionOutcome' && value !== 'negative') {
      newComponents[index].nonConformityNumber = '';
    }
    
    setFormData({ ...formData, components: newComponents });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'inspectorType' && value === 'INTERNO') {
      setFormData({ ...formData, [name]: value, externalInspectorName: '' });
    }
  };

  const resetForm = () => {
    setFormData({
      inspectionDate: '',
      supplier: '',
      inspectionLocation: '',
      inspectorType: '',
      externalInspectorName: '',
      cost: '',
      inspectionRemark: '',
      purchaseOrder: '',
      components: [{
        client: '',
        projectName: '',
        componentCode: '',
        componentDescription: '',
        quantity: '',
        inspectionOutcome: '',
        nonConformityNumber: ''
      }]
    });
    setEditingInspection(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.inspectionDate || !formData.supplier || formData.components.length === 0) {
      setError('Please complete all required fields');
      return;
    }

    if (!formData.inspectorType) {
      setError('Please select inspector type');
      return;
    }

    if (formData.inspectorType === 'EXTERNO' && !formData.externalInspectorName) {
      setError('Please enter external inspector name');
      return;
    }

    const hasValidComponent = formData.components.some(comp => 
      comp.client || comp.projectName || comp.componentCode
    );

    if (!hasValidComponent) {
      setError('Please add at least one component with data');
      return;
    }

    try {
      setLoading(true);
      const { quarter, month } = getQuarterAndMonth(formData.inspectionDate);

      if (editingInspection) {
        // UPDATE: Update all components of this inspection
        const updatePromises = formData.components.map((component, index) => {
          if (editingInspection.components[index]) {
            return updateDoc(doc(db, 'inspections', editingInspection.components[index].id), {
              quarter,
              month,
              inspectionDate: formData.inspectionDate,
              supplier: formData.supplier,
              inspectionLocation: formData.inspectionLocation,
              inspectorType: formData.inspectorType,
              externalInspectorName: formData.inspectorType === 'EXTERNO' ? formData.externalInspectorName : '',
              cost: formData.cost ? `€${formData.cost}` : '',
              inspectionRemark: formData.inspectionRemark,
              purchaseOrder: formData.purchaseOrder,
              client: component.client,
              projectName: component.projectName,
              componentCode: component.componentCode,
              componentDescription: component.componentDescription,
              quantity: component.quantity,
              inspectionOutcome: component.inspectionOutcome,
              nonConformityNumber: component.inspectionOutcome === 'negative' ? component.nonConformityNumber : '',
              updatedAt: new Date().toISOString()
            });
          } else {
            // New component added to existing inspection
            return addDoc(collection(db, 'inspections'), {
              quarter,
              month,
              inspectionDate: formData.inspectionDate,
              supplier: formData.supplier,
              inspectionLocation: formData.inspectionLocation,
              inspectorType: formData.inspectorType,
              externalInspectorName: formData.inspectorType === 'EXTERNO' ? formData.externalInspectorName : '',
              cost: formData.cost ? `€${formData.cost}` : '',
              inspectionRemark: formData.inspectionRemark,
              purchaseOrder: formData.purchaseOrder,
              client: component.client,
              projectName: component.projectName,
              componentCode: component.componentCode,
              componentDescription: component.componentDescription,
              quantity: component.quantity,
              inspectionOutcome: component.inspectionOutcome,
              nonConformityNumber: component.inspectionOutcome === 'negative' ? component.nonConformityNumber : '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        });

        await Promise.all(updatePromises);
        setSuccess('Inspection updated successfully!');
      } else {
        // CREATE: Create one record per component
        const promises = formData.components
          .filter(comp => comp.client || comp.projectName || comp.componentCode)
          .map(component => {
            return addDoc(collection(db, 'inspections'), {
              quarter,
              month,
              inspectionDate: formData.inspectionDate,
              supplier: formData.supplier,
              inspectionLocation: formData.inspectionLocation,
              inspectorType: formData.inspectorType,
              externalInspectorName: formData.inspectorType === 'EXTERNO' ? formData.externalInspectorName : '',
              cost: formData.cost ? `€${formData.cost}` : '',
              inspectionRemark: formData.inspectionRemark,
              purchaseOrder: formData.purchaseOrder,
              client: component.client,
              projectName: component.projectName,
              componentCode: component.componentCode,
              componentDescription: component.componentDescription,
              quantity: component.quantity,
              inspectionOutcome: component.inspectionOutcome,
              nonConformityNumber: component.inspectionOutcome === 'negative' ? component.nonConformityNumber : '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          });

        await Promise.all(promises);
        setSuccess(`Inspection registered successfully! (${promises.length} component(s))`);
      }
      
      resetForm();
      loadInspections();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving inspection:', err);
      setError('Error saving inspection');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (groupedInspection) => {
    // Populate form with grouped inspection data
    setFormData({
      inspectionDate: groupedInspection.inspectionDate || '',
      supplier: groupedInspection.supplier || '',
      inspectionLocation: groupedInspection.inspectionLocation || '',
      inspectorType: groupedInspection.inspectorType || '',
      externalInspectorName: groupedInspection.externalInspectorName || '',
      cost: groupedInspection.cost ? groupedInspection.cost.replace('€', '') : '',
      inspectionRemark: groupedInspection.inspectionRemark || '',
      purchaseOrder: groupedInspection.purchaseOrder || '',
      components: groupedInspection.components.map(comp => ({
        client: comp.client || '',
        projectName: comp.projectName || '',
        componentCode: comp.componentCode || '',
        componentDescription: comp.componentDescription || '',
        quantity: comp.quantity || '',
        inspectionOutcome: comp.inspectionOutcome || '',
        nonConformityNumber: comp.nonConformityNumber || ''
      }))
    });
    setEditingInspection(groupedInspection);
    setShowForm(true);
  };

  const handleDelete = async (groupedInspection) => {
    if (!window.confirm('Are you sure you want to delete this inspection and all its components?')) {
      return;
    }

    try {
      setLoading(true);
      
      // Delete all components of this inspection
      const deletePromises = groupedInspection.components.map(comp => 
        deleteDoc(doc(db, 'inspections', comp.id))
      );
      
      await Promise.all(deletePromises);
      
      setSuccess('Inspection deleted successfully');
      loadInspections();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting inspection:', err);
      setError('Error deleting inspection');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeClass = (outcome) => {
    if (outcome === 'positive') return 'id-badge id-badge-success';
    if (outcome === 'positive with comments') return 'id-badge id-badge-warning';
    if (outcome === 'negative') return 'id-badge id-badge-danger';
    return 'id-badge id-badge-default';
  };

  return (
    <div className="inspection-dashboard-wrapper">
      <div className="id-app-container">
        {/* Sidebar */}
        <div className="id-sidebar">
          <div className="id-sidebar-header">
            <h2 className="id-sidebar-title">Inspection Dashboard</h2>
            <p className="id-sidebar-subtitle">Inspection Management System</p>
          </div>
          
          <div className="id-sidebar-divider"></div>
          
          <nav className="id-sidebar-nav">
            <div 
              className={`id-nav-item ${showForm ? 'id-active' : ''}`}
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              <Plus className="id-nav-icon" size={20} />
              <span className="id-nav-text">New Inspection</span>
            </div>
            
            <div 
              className={`id-nav-item ${!showForm ? 'id-active' : ''}`}
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              <AlertCircle className="id-nav-icon" size={20} />
              <span className="id-nav-text">View Inspections</span>
            </div>
          </nav>

          <div className="id-sidebar-footer">
            <div className="id-stats-box">
              <h3 className="id-stats-title">Statistics</h3>
              <p className="id-stats-value">{groupedInspections.length}</p>
              <p className="id-stats-label">Total Inspections</p>
            </div>
            
            {/* Admin: Clean empty records button */}
            <button
              onClick={cleanEmptyInspections}
              className="id-btn id-btn-danger"
              style={{ width: '100%', marginTop: '1rem', fontSize: '0.8rem' }}
            >
              <Trash2 size={16} />
              <span>Clean Empty Records</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="id-main-content">
          <div className="id-content-header">
            <div className="id-header-info">
              <h1 className="id-main-title">
                {showForm 
                  ? (editingInspection ? 'Edit Inspection' : 'Register New Inspection')
                  : 'Registered Inspections'}
              </h1>
              <p className="id-breadcrumb">
                Quality Management → Inspections → {showForm ? (editingInspection ? 'Edit' : 'New') : 'List'}
              </p>
            </div>
          </div>

          {error && (
            <div className="id-alert id-alert-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="id-alert id-alert-success">
              <Save size={20} />
              <span>{success}</span>
            </div>
          )}

          {showForm ? (
            <div className="id-panel">
              <form onSubmit={handleSubmit}>
                <div className="id-form-section">
                  <h3 className="id-section-title">General Inspection Data</h3>
                  
                  <div className="id-form-grid">
                    <div className="id-form-group">
                      <label className="id-form-label id-form-label-required">Inspection Date (FAT/PreShipment)</label>
                      <input
                        type="date"
                        name="inspectionDate"
                        value={formData.inspectionDate}
                        onChange={handleChange}
                        required
                        className="id-form-input"
                      />
                    </div>

                    <div className="id-form-group">
                      <label className="id-form-label id-form-label-required">Supplier</label>
                      <input
                        type="text"
                        name="supplier"
                        value={formData.supplier}
                        onChange={handleChange}
                        required
                        className="id-form-input"
                      />
                    </div>

                    <div className="id-form-group">
                      <label className="id-form-label">Inspection Location</label>
                      <input
                        type="text"
                        name="inspectionLocation"
                        value={formData.inspectionLocation}
                        onChange={handleChange}
                        className="id-form-input"
                      />
                    </div>

                    <div className="id-form-group">
                      <label className="id-form-label id-form-label-required">Inspector Type</label>
                      <select
                        name="inspectorType"
                        value={formData.inspectorType}
                        onChange={handleChange}
                        required
                        className="id-form-select"
                      >
                        <option value="">Select...</option>
                        <option value="INTERNO">INTERNO</option>
                        <option value="EXTERNO">EXTERNO</option>
                      </select>
                    </div>

                    {formData.inspectorType === 'EXTERNO' && (
                      <div className="id-form-group">
                        <label className="id-form-label id-form-label-required">External Inspector Name</label>
                        <input
                          type="text"
                          name="externalInspectorName"
                          value={formData.externalInspectorName}
                          onChange={handleChange}
                          required
                          placeholder="Enter inspector or company name"
                          className="id-form-input"
                        />
                      </div>
                    )}

                    <div className="id-form-group">
                      <label className="id-form-label">Cost (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        placeholder="e.g. 500"
                        className="id-form-input"
                      />
                    </div>

                    <div className="id-form-group">
                      <label className="id-form-label">Purchase Order</label>
                      <input
                        type="text"
                        name="purchaseOrder"
                        value={formData.purchaseOrder}
                        onChange={handleChange}
                        className="id-form-input"
                      />
                    </div>
                  </div>

                  <div className="id-form-group" style={{ marginTop: '1rem' }}>
                    <label className="id-form-label">Inspection Remarks</label>
                    <textarea
                      name="inspectionRemark"
                      value={formData.inspectionRemark}
                      onChange={handleChange}
                      className="id-form-textarea"
                      placeholder="General observations about the inspection..."
                    />
                  </div>
                </div>

                <div className="id-form-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="id-section-title" style={{ marginBottom: 0 }}>Inspected Components</h3>
                    <button
                      type="button"
                      onClick={addComponent}
                      className="id-btn id-btn-success"
                    >
                      <Plus size={18} />
                      <span>Add Component</span>
                    </button>
                  </div>

                  {formData.components.map((component, index) => (
                    <div key={index} className="id-component-card">
                      <div className="id-component-header">
                        <h4 className="id-component-title">Component {index + 1}</h4>
                        {formData.components.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeComponent(index)}
                            className="id-btn-remove"
                          >
                            <X size={20} />
                          </button>
                        )}
                      </div>

                      <div className="id-form-grid">
                        <div className="id-form-group">
                          <label className="id-form-label">Client</label>
                          <input
                            type="text"
                            value={component.client}
                            onChange={(e) => updateComponent(index, 'client', e.target.value)}
                            className="id-form-input"
                          />
                        </div>

                        <div className="id-form-group">
                          <label className="id-form-label">Project Name</label>
                          <input
                            type="text"
                            value={component.projectName}
                            onChange={(e) => updateComponent(index, 'projectName', e.target.value)}
                            className="id-form-input"
                          />
                        </div>

                        <div className="id-form-group">
                          <label className="id-form-label">Component Code</label>
                          <input
                            type="text"
                            value={component.componentCode}
                            onChange={(e) => updateComponent(index, 'componentCode', e.target.value)}
                            className="id-form-input"
                          />
                        </div>

                        <div className="id-form-group">
                          <label className="id-form-label">Component Description</label>
                          <input
                            type="text"
                            value={component.componentDescription}
                            onChange={(e) => updateComponent(index, 'componentDescription', e.target.value)}
                            className="id-form-input"
                          />
                        </div>

                        <div className="id-form-group">
                          <label className="id-form-label">Quantity</label>
                          <input
                            type="text"
                            value={component.quantity}
                            onChange={(e) => updateComponent(index, 'quantity', e.target.value)}
                            className="id-form-input"
                          />
                        </div>

                        <div className="id-form-group">
                          <label className="id-form-label">Inspection Outcome</label>
                          <select
                            value={component.inspectionOutcome}
                            onChange={(e) => updateComponent(index, 'inspectionOutcome', e.target.value)}
                            className="id-form-select"
                          >
                            <option value="">Select...</option>
                            <option value="positive">Positive</option>
                            <option value="positive with comments">Positive with Comments</option>
                            <option value="negative">Negative</option>
                          </select>
                        </div>

                        {component.inspectionOutcome === 'negative' && (
                          <div className="id-form-group">
                            <label className="id-form-label">Non-Conformity Number</label>
                            <input
                              type="text"
                              value={component.nonConformityNumber}
                              onChange={(e) => updateComponent(index, 'nonConformityNumber', e.target.value)}
                              placeholder="e.g. NC-2025-001"
                              className="id-form-input"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="id-form-actions">
                  <button
                    type="submit"
                    disabled={loading}
                    className="id-btn id-btn-primary"
                  >
                    <Save size={20} />
                    <span>{loading ? 'Saving...' : (editingInspection ? 'Update Inspection' : 'Save Inspection')}</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={resetForm}
                    className="id-btn id-btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="id-panel">
              {loading ? (
                <div className="id-loading-container">
                  <div className="id-spinner"></div>
                  <p className="id-loading-text">Loading inspections...</p>
                </div>
              ) : groupedInspections.length === 0 ? (
                <div className="id-empty-state">
                  <div className="id-empty-icon">📋</div>
                  <h3 className="id-empty-title">No Inspections Registered</h3>
                  <p className="id-empty-message">Start by registering your first inspection</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="id-btn id-btn-primary"
                  >
                    <Plus size={18} />
                    <span>Register First Inspection</span>
                  </button>
                </div>
              ) : (
                <div className="id-table-container">
                  <table className="id-table">
                    <thead>
                      <tr>
                        <th style={{ width: '30px' }}></th>
                        <th>Date</th>
                        <th>Quarter</th>
                        <th>Supplier</th>
                        <th>Location</th>
                        <th>Inspector</th>
                        <th>PO</th>
                        <th>Outcome</th>
                        <th>Cost</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedInspections.map((inspection) => (
                        <React.Fragment key={inspection.id}>
                          {/* Main row */}
                          <tr>
                            <td>
                              <button
                                onClick={() => toggleRow(inspection.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                              >
                                {expandedRows[inspection.id] ? 
                                  <ChevronDown size={18} color="#4b5563" /> : 
                                  <ChevronRight size={18} color="#4b5563" />
                                }
                              </button>
                            </td>
                            <td>{inspection.inspectionDate}</td>
                            <td>{inspection.quarter}</td>
                            <td>{inspection.supplier}</td>
                            <td>{inspection.inspectionLocation || '-'}</td>
                            <td>
                              <div style={{ fontSize: '0.85rem' }}>
                                <div style={{ fontWeight: '500' }}>{inspection.inspectorType}</div>
                                {inspection.inspectorType === 'EXTERNO' && (
                                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                    {inspection.externalInspectorName}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>{inspection.purchaseOrder || '-'}</td>
                            <td>
                              <span className={getBadgeClass(inspection.overallOutcome)}>
                                {inspection.overallOutcome}
                              </span>
                            </td>
                            <td>{inspection.cost || '-'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  onClick={() => handleView(inspection)}
                                  className="id-btn id-btn-secondary"
                                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                  title="View/Edit"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(inspection)}
                                  className="id-btn id-btn-danger"
                                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Expanded components detail row */}
                          {expandedRows[inspection.id] && (
                            <tr>
                              <td colSpan="10" style={{ backgroundColor: '#f9fafb', padding: '1rem' }}>
                                <div style={{ marginLeft: '2rem' }}>
                                  <h4 style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>
                                    Inspected Components ({inspection.components.length})
                                  </h4>
                                  <table style={{ width: '100%', fontSize: '0.85rem' }}>
                                    <thead>
                                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <th style={{ textAlign: 'left', padding: '0.5rem', color: '#6b7280' }}>Client</th>
                                        <th style={{ textAlign: 'left', padding: '0.5rem', color: '#6b7280' }}>Project</th>
                                        <th style={{ textAlign: 'left', padding: '0.5rem', color: '#6b7280' }}>Code</th>
                                        <th style={{ textAlign: 'left', padding: '0.5rem', color: '#6b7280' }}>Description</th>
                                        <th style={{ textAlign: 'left', padding: '0.5rem', color: '#6b7280' }}>Qty</th>
                                        <th style={{ textAlign: 'left', padding: '0.5rem', color: '#6b7280' }}>Outcome</th>
                                        <th style={{ textAlign: 'left', padding: '0.5rem', color: '#6b7280' }}>NC Number</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {inspection.components.map((comp, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                          <td style={{ padding: '0.5rem' }}>{comp.client}</td>
                                          <td style={{ padding: '0.5rem' }}>{comp.projectName}</td>
                                          <td style={{ padding: '0.5rem' }}>{comp.componentCode}</td>
                                          <td style={{ padding: '0.5rem' }}>{comp.componentDescription}</td>
                                          <td style={{ padding: '0.5rem' }}>{comp.quantity}</td>
                                          <td style={{ padding: '0.5rem' }}>
                                            <span className={getBadgeClass(comp.inspectionOutcome)}>
                                              {comp.inspectionOutcome || 'N/A'}
                                            </span>
                                          </td>
                                          <td style={{ padding: '0.5rem' }}>{comp.nonConformityNumber || '-'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectionDashboard;