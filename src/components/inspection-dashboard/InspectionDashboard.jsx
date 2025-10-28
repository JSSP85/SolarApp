// src/components/inspection-dashboard/InspectionDashboard.jsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { X, Plus, Save, AlertCircle, Eye, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import BackButton from '../common/BackButton';
import '../../styles/inspection-dashboard.css';

const InspectionDashboard = ({ onBackToMenu }) => {
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

const loadInspections = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'inspections'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const inspectionData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          components: data.components || []
        };
      });
      
      // Filter out empty inspections (no date or supplier)
      const validInspections = inspectionData.filter(
        inspection => inspection.inspectionDate && inspection.supplier
      );
      
      setInspections(validInspections);
      
      // Process inspections and calculate overall outcome
      const processedInspections = validInspections.map(inspection => ({
        ...inspection,
        overallOutcome: calculateOverallOutcome(inspection.components),
        quarter: inspection.quarter || getQuarterAndMonth(inspection.inspectionDate).quarter,
        month: inspection.month || getQuarterAndMonth(inspection.inspectionDate).month
      }));
      
      setGroupedInspections(processedInspections);
      
    } catch (err) {
      console.error('Error loading inspections:', err);
      setError('Error loading inspections');
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
    
    const { quarter, month } = getQuarterAndMonth(formData.inspectionDate);
    
   try {
      setLoading(true);
      
      const inspectionDoc = {
        inspectionDate: formData.inspectionDate,
        quarter,
        month,
        supplier: formData.supplier,
        inspectionLocation: formData.inspectionLocation,
        inspectorType: formData.inspectorType,
        externalInspectorName: formData.inspectorType === 'EXTERNO' ? formData.externalInspectorName : '',
        cost: formData.cost ? `€${formData.cost}` : '',
        inspectionRemark: formData.inspectionRemark,
        purchaseOrder: formData.purchaseOrder,
        components: formData.components.map(comp => ({
          client: comp.client,
          projectName: comp.projectName,
          componentCode: comp.componentCode,
          componentDescription: comp.componentDescription,
          quantity: comp.quantity,
          inspectionOutcome: comp.inspectionOutcome,
          nonConformityNumber: comp.inspectionOutcome === 'negative' ? comp.nonConformityNumber : ''
        })),
        inspectionOutcome: calculateOverallOutcome(formData.components),
        updatedAt: new Date().toISOString()
      };
      
      if (editingInspection) {
        // Update existing inspection
        await updateDoc(doc(db, 'inspections', editingInspection.id), inspectionDoc);
        setSuccess(`Inspection updated successfully! (${formData.components.length} component(s))`);
      } else {
        // Create new inspection
        await addDoc(collection(db, 'inspections'), {
          ...inspectionDoc,
          createdAt: new Date().toISOString()
        });
        setSuccess(`Inspection registered successfully! (${formData.components.length} component(s))`);
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

const handleDelete = async (inspection) => {
    if (!window.confirm('Are you sure you want to delete this inspection and all its components?'))
      return;
    
    try {
      setLoading(true);
      
      // Delete the single document (which contains all components)
      await deleteDoc(doc(db, 'inspections', inspection.id));
      
      setSuccess('Inspection deleted successfully!');
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
          {/* Logo de Valmont */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            right: '1rem',
            display: 'flex',
            justifyContent: 'center',
            zIndex: 150
          }}>
            <img 
              src="/images/logo.png"
              alt="Valmont Logo" 
              style={{
                height: '50px',
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)'
              }}
            />
          </div>

          {/* Botón Back - dentro del wrapper específico */}
          <div className="id-back-button-wrapper">
            <BackButton onClick={onBackToMenu} />
          </div>

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
            
            {/* BOTÓN "Clean Empty Records" ELIMINADO */}
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
            <form onSubmit={handleSubmit} className="id-form-container">
              <div className="id-form-section">
                <h3 className="id-section-title">General Information</h3>
                <div className="id-form-grid">
                  <div className="id-form-group">
                    <label className="id-form-label">Inspection Date *</label>
                    <input
                      type="date"
                      name="inspectionDate"
                      value={formData.inspectionDate}
                      onChange={handleChange}
                      className="id-form-input"
                      required
                    />
                  </div>
                  
                  <div className="id-form-group">
                    <label className="id-form-label">Supplier *</label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleChange}
                      className="id-form-input"
                      required
                    />
                  </div>
                  
                  <div className="id-form-group">
                    <label className="id-form-label">Inspection Location *</label>
                    <input
                      type="text"
                      name="inspectionLocation"
                      value={formData.inspectionLocation}
                      onChange={handleChange}
                      className="id-form-input"
                      required
                    />
                  </div>
                  
                  <div className="id-form-group">
                    <label className="id-form-label">Inspector Type *</label>
                    <select
                      name="inspectorType"
                      value={formData.inspectorType}
                      onChange={handleChange}
                      className="id-form-select"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="INTERNO">INTERNO</option>
                      <option value="EXTERNO">EXTERNO</option>
                    </select>
                  </div>
                  
                  {formData.inspectorType === 'EXTERNO' && (
                    <div className="id-form-group">
                      <label className="id-form-label">External Inspector Name</label>
                      <input
                        type="text"
                        name="externalInspectorName"
                        value={formData.externalInspectorName}
                        onChange={handleChange}
                        className="id-form-input"
                      />
                    </div>
                  )}
                  
                  <div className="id-form-group">
                    <label className="id-form-label">Cost (€)</label>
                    <input
                      type="number"
                      name="cost"
                      value={formData.cost}
                      onChange={handleChange}
                      className="id-form-input"
                      min="0"
                      step="0.01"
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
                    rows="3"
                  />
                </div>
              </div>

              <div className="id-form-section">
                <div className="id-component-header">
                  <h3 className="id-section-title" style={{ marginBottom: 0 }}>Components</h3>
                  <button
                    type="button"
                    onClick={addComponent}
                    className="id-btn id-btn-primary"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    <Plus size={16} />
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
                          className="id-btn id-btn-danger id-btn-icon"
                        >
                          <X size={16} />
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
                          type="number"
                          value={component.quantity}
                          onChange={(e) => updateComponent(index, 'quantity', e.target.value)}
                          className="id-form-input"
                          min="0"
                        />
                      </div>
                      
                      <div className="id-form-group">
                        <label className="id-form-label">Inspection Outcome</label>
                        <select
                          value={component.inspectionOutcome}
                          onChange={(e) => updateComponent(index, 'inspectionOutcome', e.target.value)}
                          className="id-form-select"
                        >
                          <option value="">Select Outcome</option>
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
                  type="button"
                  onClick={resetForm}
                  className="id-btn id-btn-secondary"
                  disabled={loading}
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="id-btn id-btn-primary"
                  disabled={loading}
                >
                  <Save size={18} />
                  <span>{editingInspection ? 'Update' : 'Register'} Inspection</span>
                </button>
              </div>
            </form>
          ) : (
            <>
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
                                  <ChevronDown size={20} /> : 
                                  <ChevronRight size={20} />
                                }
                              </button>
                            </td>
                            <td>{inspection.inspectionDate}</td>
                            <td>{inspection.quarter}</td>
                            <td>{inspection.supplier}</td>
                            <td>{inspection.inspectionLocation}</td>
                            <td>
                              {inspection.inspectorType === 'EXTERNO' 
                                ? `EXT: ${inspection.externalInspectorName || 'N/A'}` 
                                : 'INTERNAL'}
                            </td>
                            <td>{inspection.purchaseOrder || 'N/A'}</td>
                            <td>
                              <span className={getBadgeClass(inspection.overallOutcome)}>
                                {inspection.overallOutcome}
                              </span>
                            </td>
                            <td>{inspection.cost || 'N/A'}</td>
                            <td>
                              <div className="id-action-buttons">
                                <button
                                  onClick={() => handleView(inspection)}
                                  className="id-action-btn id-action-btn-view"
                                  title="View/Edit"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(inspection)}
                                  className="id-action-btn id-action-btn-delete"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Expanded component details row */}
                          {expandedRows[inspection.id] && (
                            <tr className="id-expanded-row">
                              <td colSpan="10" className="id-expanded-content">
                                <div className="id-component-detail-card">
                                  <h4 style={{ 
                                    color: '#005F83', 
                                    marginBottom: '1rem',
                                    fontWeight: '600'
                                  }}>
                                    Components ({inspection.components.length})
                                  </h4>
                                  {inspection.components.map((comp, idx) => (
                                    <div key={idx} style={{ 
                                      borderTop: idx > 0 ? '1px solid rgba(0, 95, 131, 0.1)' : 'none',
                                      paddingTop: idx > 0 ? '1rem' : '0',
                                      marginTop: idx > 0 ? '1rem' : '0'
                                    }}>
                                      <div className="id-component-detail-grid">
                                        <div className="id-detail-item">
                                          <span className="id-detail-label">Client</span>
                                          <span className="id-detail-value" title={comp.client || 'N/A'}>
                                            {comp.client || 'N/A'}
                                          </span>
                                        </div>
                                        <div className="id-detail-item">
                                          <span className="id-detail-label">Project</span>
                                          <span className="id-detail-value" title={comp.projectName || 'N/A'}>
                                            {comp.projectName || 'N/A'}
                                          </span>
                                        </div>
                                        <div className="id-detail-item">
                                          <span className="id-detail-label">Code</span>
                                          <span className="id-detail-value" title={comp.componentCode || 'N/A'}>
                                            {comp.componentCode || 'N/A'}
                                          </span>
                                        </div>
                                        <div className="id-detail-item">
                                          <span className="id-detail-label">Description</span>
                                          <span className="id-detail-value" title={comp.componentDescription || 'N/A'}>
                                            {comp.componentDescription || 'N/A'}
                                          </span>
                                        </div>
                                        <div className="id-detail-item">
                                          <span className="id-detail-label">Quantity</span>
                                          <span className="id-detail-value">{comp.quantity || 'N/A'}</span>
                                        </div>
                                        <div className="id-detail-item">
                                          <span className="id-detail-label">Outcome</span>
                                          <span className={getBadgeClass(comp.inspectionOutcome)}>
                                            {comp.inspectionOutcome || 'N/A'}
                                          </span>
                                        </div>
                                      </div>
                                      {comp.inspectionOutcome === 'negative' && comp.nonConformityNumber && (
                                        <div style={{ 
                                          marginTop: '0.75rem', 
                                          paddingTop: '0.75rem', 
                                          borderTop: '1px dashed rgba(220, 38, 38, 0.2)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.5rem'
                                        }}>
                                          <span className="id-detail-label" style={{ color: '#dc2626', margin: 0 }}>
                                            NC NUMBER:
                                          </span>
                                          <span className="id-detail-value" style={{ 
                                            color: '#dc2626', 
                                            fontWeight: '700',
                                            fontSize: '0.9rem'
                                          }}>
                                            {comp.nonConformityNumber}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectionDashboard;