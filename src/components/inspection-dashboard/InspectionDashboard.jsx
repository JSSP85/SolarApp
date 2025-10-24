import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { X, Plus, Save, AlertCircle } from 'lucide-react';
import '../../styles/inspection-dashboard.css';

const InspectionDashboard = () => {
  const [inspections, setInspections] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    inspectionDate: '',
    supplier: '',
    inspectionLocation: '',
    externalInspector: '',
    cost: '',
    inspectionRemark: '',
    inspectionOutcome: '',
    purchaseOrder: '',
    components: [{
      client: '',
      projectName: '',
      componentCode: '',
      componentDescription: '',
      quantity: '',
      nonConformity: ''
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
      setError('Error al cargar las inspecciones');
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
        nonConformity: ''
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
    setFormData({ ...formData, components: newComponents });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.inspectionDate || !formData.supplier || formData.components.length === 0) {
      setError('Por favor completa los campos obligatorios');
      return;
    }

    const hasValidComponent = formData.components.some(comp => 
      comp.client || comp.projectName || comp.componentCode
    );

    if (!hasValidComponent) {
      setError('Debes agregar al menos un componente con datos');
      return;
    }

    try {
      setLoading(true);
      const { quarter, month } = getQuarterAndMonth(formData.inspectionDate);

      const promises = formData.components
        .filter(comp => comp.client || comp.projectName || comp.componentCode)
        .map(component => {
          return addDoc(collection(db, 'inspections'), {
            quarter,
            month,
            inspectionDate: formData.inspectionDate,
            supplier: formData.supplier,
            inspectionLocation: formData.inspectionLocation,
            externalInspector: formData.externalInspector,
            cost: formData.cost ? `€${formData.cost}` : '',
            inspectionRemark: formData.inspectionRemark,
            inspectionOutcome: formData.inspectionOutcome,
            purchaseOrder: formData.purchaseOrder,
            client: component.client,
            projectName: component.projectName,
            componentCode: component.componentCode,
            componentDescription: component.componentDescription,
            quantity: component.quantity,
            nonConformity: component.nonConformity,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        });

      await Promise.all(promises);
      
      setSuccess(`¡Inspección registrada exitosamente! (${promises.length} componente(s))`);
      
      setFormData({
        inspectionDate: '',
        supplier: '',
        inspectionLocation: '',
        externalInspector: '',
        cost: '',
        inspectionRemark: '',
        inspectionOutcome: '',
        purchaseOrder: '',
        components: [{
          client: '',
          projectName: '',
          componentCode: '',
          componentDescription: '',
          quantity: '',
          nonConformity: ''
        }]
      });
      
      setShowForm(false);
      loadInspections();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving inspection:', err);
      setError('Error al guardar la inspección');
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
            <p className="id-sidebar-subtitle">Sistema de Gestión de Inspecciones</p>
          </div>
          
          <div className="id-sidebar-divider"></div>
          
          <nav className="id-sidebar-nav">
            <div 
              className={`id-nav-item ${showForm ? 'id-active' : ''}`}
              onClick={() => setShowForm(true)}
            >
              <Plus className="id-nav-icon" size={20} />
              <span className="id-nav-text">Nueva Inspección</span>
            </div>
            
            <div 
              className={`id-nav-item ${!showForm ? 'id-active' : ''}`}
              onClick={() => setShowForm(false)}
            >
              <AlertCircle className="id-nav-icon" size={20} />
              <span className="id-nav-text">Ver Inspecciones</span>
            </div>
          </nav>

          <div className="id-sidebar-footer">
            <div className="id-stats-box">
              <h3 className="id-stats-title">Estadísticas</h3>
              <p className="id-stats-value">{inspections.length}</p>
              <p className="id-stats-label">Total de registros</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="id-main-content">
          <div className="id-content-header">
            <div className="id-header-info">
              <h1 className="id-main-title">
                {showForm ? 'Registrar Nueva Inspección' : 'Inspecciones Registradas'}
              </h1>
              <p className="id-breadcrumb">
                Quality Management → Inspections → {showForm ? 'New' : 'List'}
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
                  <h3 className="id-section-title">Datos Generales de la Inspección</h3>
                  
                  <div className="id-form-grid">
                    <div className="id-form-group">
                      <label className="id-form-label id-form-label-required">Fecha de Inspección</label>
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
                      <label className="id-form-label id-form-label-required">Proveedor</label>
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
                      <label className="id-form-label">Ubicación de Inspección</label>
                      <input
                        type="text"
                        name="inspectionLocation"
                        value={formData.inspectionLocation}
                        onChange={handleChange}
                        className="id-form-input"
                      />
                    </div>

                    <div className="id-form-group">
                      <label className="id-form-label">Inspector Externo</label>
                      <input
                        type="text"
                        name="externalInspector"
                        value={formData.externalInspector}
                        onChange={handleChange}
                        className="id-form-input"
                      />
                    </div>

                    <div className="id-form-group">
                      <label className="id-form-label">Costo (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        placeholder="Ej: 500"
                        className="id-form-input"
                      />
                    </div>

                    <div className="id-form-group">
                      <label className="id-form-label">Orden de Compra</label>
                      <input
                        type="text"
                        name="purchaseOrder"
                        value={formData.purchaseOrder}
                        onChange={handleChange}
                        className="id-form-input"
                      />
                    </div>

                    <div className="id-form-group">
                      <label className="id-form-label">Resultado de Inspección</label>
                      <select
                        name="inspectionOutcome"
                        value={formData.inspectionOutcome}
                        onChange={handleChange}
                        className="id-form-select"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="positive">Positive</option>
                        <option value="positive with comments">Positive with comments</option>
                        <option value="negative">Negative</option>
                      </select>
                    </div>
                  </div>

                  <div className="id-form-group" style={{ marginTop: '1rem' }}>
                    <label className="id-form-label">Observaciones</label>
                    <textarea
                      name="inspectionRemark"
                      value={formData.inspectionRemark}
                      onChange={handleChange}
                      className="id-form-textarea"
                    />
                  </div>
                </div>

                <div className="id-form-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="id-section-title" style={{ marginBottom: 0 }}>Componentes Inspeccionados</h3>
                    <button
                      type="button"
                      onClick={addComponent}
                      className="id-btn id-btn-success"
                    >
                      <Plus size={18} />
                      <span>Agregar Componente</span>
                    </button>
                  </div>

                  {formData.components.map((component, index) => (
                    <div key={index} className="id-component-card">
                      <div className="id-component-header">
                        <h4 className="id-component-title">Componente {index + 1}</h4>
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
                          <label className="id-form-label">Cliente</label>
                          <input
                            type="text"
                            value={component.client}
                            onChange={(e) => updateComponent(index, 'client', e.target.value)}
                            className="id-form-input"
                          />
                        </div>

                        <div className="id-form-group">
                          <label className="id-form-label">Nombre del Proyecto</label>
                          <input
                            type="text"
                            value={component.projectName}
                            onChange={(e) => updateComponent(index, 'projectName', e.target.value)}
                            className="id-form-input"
                          />
                        </div>

                        <div className="id-form-group">
                          <label className="id-form-label">Código de Componente</label>
                          <input
                            type="text"
                            value={component.componentCode}
                            onChange={(e) => updateComponent(index, 'componentCode', e.target.value)}
                            className="id-form-input"
                          />
                        </div>

                        <div className="id-form-group">
                          <label className="id-form-label">Descripción</label>
                          <input
                            type="text"
                            value={component.componentDescription}
                            onChange={(e) => updateComponent(index, 'componentDescription', e.target.value)}
                            className="id-form-input"
                          />
                        </div>

                        <div className="id-form-group">
                          <label className="id-form-label">Cantidad</label>
                          <input
                            type="text"
                            value={component.quantity}
                            onChange={(e) => updateComponent(index, 'quantity', e.target.value)}
                            className="id-form-input"
                          />
                        </div>

                        <div className="id-form-group">
                          <label className="id-form-label">No Conformidad</label>
                          <input
                            type="text"
                            value={component.nonConformity}
                            onChange={(e) => updateComponent(index, 'nonConformity', e.target.value)}
                            className="id-form-input"
                          />
                        </div>
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
                    <span>{loading ? 'Guardando...' : 'Guardar Inspección'}</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="id-btn id-btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="id-panel">
              {loading ? (
                <div className="id-loading-container">
                  <div className="id-spinner"></div>
                  <p className="id-loading-text">Cargando inspecciones...</p>
                </div>
              ) : inspections.length === 0 ? (
                <div className="id-empty-state">
                  <div className="id-empty-icon">📋</div>
                  <h3 className="id-empty-title">No hay inspecciones registradas</h3>
                  <p className="id-empty-message">Comienza registrando tu primera inspección</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="id-btn id-btn-primary"
                  >
                    <Plus size={18} />
                    <span>Registrar Primera Inspección</span>
                  </button>
                </div>
              ) : (
                <div className="id-table-container">
                  <table className="id-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Quarter</th>
                        <th>Cliente</th>
                        <th>Proveedor</th>
                        <th>Componente</th>
                        <th>Resultado</th>
                        <th>Costo</th>
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