import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { X, Plus, Save, AlertCircle, Eye, Trash2 } from 'lucide-react';
import '../../styles/inspection-dashboard.css';

const InspectionDashboard = () => {
  const [inspections, setInspections] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingInspection, setEditingInspection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    inspectionDate: '',
    supplier: '',
    inspectionLocation: '',
    inspectorType: '', // 'INTERNO' or 'EXTERNO'
    externalInspectorName: '', // Only if inspectorType is 'EXTERNO'
    cost: '',
    inspectionRemark: '',
    purchaseOrder: '',
    components: [{
      client: '',
      projectName: '',
      componentCode: '',
      componentDescription: '',
      quantity: '',
      inspectionOutcome: '', // Moved to component level
      nonConformityNumber: '' // Only shows if inspectionOutcome is 'negative'
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

  const loadInspections = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'inspections'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const inspectionData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInspections(inspectionData);
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
    
    // If changing inspectionOutcome and it's not 'negative', clear nonConformityNumber
    if (field === 'inspectionOutcome' && value !== 'negative') {
      newComponents[index].nonConformityNumber = '';
    }
    
    setFormData({ ...formData, components: newComponents });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // If changing inspectorType to 'INTERNO', clear externalInspectorName
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
        // UPDATE existing inspection
        const inspectionRef = doc(db, 'inspections', editingInspection);
        
        // Find the component data for this inspection
        const componentToUpdate = formData.components[0]; // Assuming we're updating the first component
        
        await updateDoc(inspectionRef, {
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
          client: componentToUpdate.client,
          projectName: componentToUpdate.projectName,
          componentCode: componentToUpdate.componentCode,
          componentDescription: componentToUpdate.componentDescription,
          quantity: componentToUpdate.quantity,
          inspectionOutcome: componentToUpdate.inspectionOutcome,
          nonConformityNumber: componentToUpdate.inspectionOutcome === 'negative' ? componentToUpdate.nonConformityNumber : '',
          updatedAt: new Date().toISOString()
        });

        setSuccess('Inspection updated successfully!');
      } else {
        // CREATE new inspections
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

  const handleView = (inspection) => {
    // Populate form with inspection data for viewing/editing
    setFormData({
      inspectionDate: inspection.inspectionDate || '',
      supplier: inspection.supplier || '',
      inspectionLocation: inspection.inspectionLocation || '',
      inspectorType: inspection.inspectorType || '',
      externalInspectorName: inspection.externalInspectorName || '',
      cost: inspection.cost ? inspection.cost.replace('€', '') : '',
      inspectionRemark: inspection.inspectionRemark || '',
      purchaseOrder: inspection.purchaseOrder || '',
      components: [{
        client: inspection.client || '',
        projectName: inspection.projectName || '',
        componentCode: inspection.componentCode || '',
        componentDescription: inspection.componentDescription || '',
        quantity: inspection.quantity || '',
        inspectionOutcome: inspection.inspectionOutcome || '',
        nonConformityNumber: inspection.nonConformityNumber || ''
      }]
    });
    setEditingInspection(inspection.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inspection?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'inspections', id));
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
              <p className="id-stats-value">{inspections.length}</p>
              <p className="id-stats-label">Total Records</p>
            </div>
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
                    {!editingInspection && (
                      <button
                        type="button"
                        onClick={addComponent}
                        className="id-btn id-btn-success"
                      >
                        <Plus size={18} />
                        <span>Add Component</span>
                      </button>
                    )}
                  </div>

                  {formData.components.map((component, index) => (
                    <div key={index} className="id-component-card">
                      <div className="id-component-header">
                        <h4 className="id-component-title">Component {index + 1}</h4>
                        {formData.components.length > 1 && !editingInspection && (
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
              ) : inspections.length === 0 ? (
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
                        <th>Date</th>
                        <th>Quarter</th>
                        <th>Client</th>
                        <th>Supplier</th>
                        <th>Component</th>
                        <th>Outcome</th>
                        <th>Cost</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspections.map((inspection) => (
                        <tr key={inspection.id}>
                          <td>{inspection.inspectionDate}</td>
                          <td>{inspection.quarter}</td>
                          <td>{inspection.client}</td>
                          <td>{inspection.supplier}</td>
                          <td>
                            <div>
                              <div style={{ fontWeight: '500' }}>{inspection.componentCode}</div>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{inspection.componentDescription}</div>
                            </div>
                          </td>
                          <td>
                            <span className={getBadgeClass(inspection.inspectionOutcome)}>
                              {inspection.inspectionOutcome || 'N/A'}
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
                                onClick={() => handleDelete(inspection.id)}
                                className="id-btn id-btn-danger"
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
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