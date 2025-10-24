import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { X, Plus, Save, AlertCircle } from 'lucide-react';

const InspectionDashboard = () => {
  const [inspections, setInspections] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estado del formulario
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

  // Función para calcular Quarter y Month desde una fecha
  const getQuarterAndMonth = (dateString) => {
    if (!dateString) return { quarter: '', month: '' };
    
    const date = new Date(dateString);
    const month = date.getMonth() + 1; // 0-11 -> 1-12
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

  // Cargar inspecciones
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

  // Agregar nuevo componente al formulario
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

  // Eliminar componente
  const removeComponent = (index) => {
    const newComponents = formData.components.filter((_, i) => i !== index);
    setFormData({ ...formData, components: newComponents });
  };

  // Actualizar datos del componente
  const updateComponent = (index, field, value) => {
    const newComponents = [...formData.components];
    newComponents[index][field] = value;
    setFormData({ ...formData, components: newComponents });
  };

  // Manejar cambios en campos generales
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Guardar inspección
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validación básica
    if (!formData.inspectionDate || !formData.supplier || formData.components.length === 0) {
      setError('Por favor completa los campos obligatorios');
      return;
    }

    // Validar que al menos haya un componente con datos
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

      // Crear un registro por cada componente
      const promises = formData.components
        .filter(comp => comp.client || comp.projectName || comp.componentCode) // Solo componentes con datos
        .map(component => {
          return addDoc(collection(db, 'inspections'), {
            // Datos generales
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
            // Datos del componente
            client: component.client,
            projectName: component.projectName,
            componentCode: component.componentCode,
            componentDescription: component.componentDescription,
            quantity: component.quantity,
            nonConformity: component.nonConformity,
            // Metadata
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        });

      await Promise.all(promises);
      
      setSuccess(`¡Inspección registrada exitosamente! (${promises.length} componente(s))`);
      
      // Resetear formulario
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzFmMjkzNyIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>
      
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Inspection Dashboard</h2>
            <p className="text-slate-400 text-sm">Sistema de Gestión de Inspecciones</p>
          </div>
          
          <nav className="space-y-2">
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <Plus size={20} />
              <span>Nueva Inspección</span>
            </button>
            
            <button
              onClick={() => setShowForm(false)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-700/50 text-slate-300 transition-colors"
            >
              <AlertCircle size={20} />
              <span>Ver Inspecciones</span>
            </button>
          </nav>

          <div className="mt-8 p-4 bg-slate-700/30 rounded-lg">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Estadísticas</h3>
            <p className="text-2xl font-bold text-white">{inspections.length}</p>
            <p className="text-xs text-slate-400">Total de registros</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 relative z-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              {showForm ? 'Registrar Nueva Inspección' : 'Inspecciones Registradas'}
            </h1>
            <p className="text-slate-400">
              {showForm ? 'Completa los datos de la inspección y componentes' : 'Historial de inspecciones realizadas'}
            </p>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="text-red-500" size={20} />
              <span className="text-red-300">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-center space-x-3">
              <Save className="text-green-500" size={20} />
              <span className="text-green-300">{success}</span>
            </div>
          )}

          {/* Formulario */}
          {showForm ? (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sección: Datos Generales de la Inspección */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4 pb-2 border-b border-slate-700">
                    Datos Generales de la Inspección
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Fecha de Inspección (FAT/PreShipment) *
                      </label>
                      <input
                        type="date"
                        name="inspectionDate"
                        value={formData.inspectionDate}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Proveedor (Supplier) *
                      </label>
                      <input
                        type="text"
                        name="supplier"
                        value={formData.supplier}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Ubicación de Inspección
                      </label>
                      <input
                        type="text"
                        name="inspectionLocation"
                        value={formData.inspectionLocation}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Inspector Externo
                      </label>
                      <input
                        type="text"
                        name="externalInspector"
                        value={formData.externalInspector}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Costo (se agregará el símbolo €)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        placeholder="Ej: 500"
                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Orden de Compra (Purchase Order)
                      </label>
                      <input
                        type="text"
                        name="purchaseOrder"
                        value={formData.purchaseOrder}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Resultado de Inspección (Inspection Outcome)
                      </label>
                      <select
                        name="inspectionOutcome"
                        value={formData.inspectionOutcome}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="positive">Positive</option>
                        <option value="positive with comments">Positive with comments</option>
                        <option value="negative">Negative</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Observaciones de Inspección (Inspection Remark)
                      </label>
                      <textarea
                        name="inspectionRemark"
                        value={formData.inspectionRemark}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Sección: Componentes */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white pb-2 border-b border-slate-700">
                      Componentes Inspeccionados
                    </h3>
                    <button
                      type="button"
                      onClick={addComponent}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Plus size={18} />
                      <span>Agregar Componente</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.components.map((component, index) => (
                      <div key={index} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-slate-200">
                            Componente {index + 1}
                          </h4>
                          {formData.components.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeComponent(index)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <X size={20} />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Cliente (Client)
                            </label>
                            <input
                              type="text"
                              value={component.client}
                              onChange={(e) => updateComponent(index, 'client', e.target.value)}
                              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Nombre del Proyecto (Project Name)
                            </label>
                            <input
                              type="text"
                              value={component.projectName}
                              onChange={(e) => updateComponent(index, 'projectName', e.target.value)}
                              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Código de Componente
                            </label>
                            <input
                              type="text"
                              value={component.componentCode}
                              onChange={(e) => updateComponent(index, 'componentCode', e.target.value)}
                              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Descripción del Componente
                            </label>
                            <input
                              type="text"
                              value={component.componentDescription}
                              onChange={(e) => updateComponent(index, 'componentDescription', e.target.value)}
                              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Cantidad (Quantity)
                            </label>
                            <input
                              type="text"
                              value={component.quantity}
                              onChange={(e) => updateComponent(index, 'quantity', e.target.value)}
                              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              No Conformidad (Non-Conformity)
                            </label>
                            <input
                              type="text"
                              value={component.nonConformity}
                              onChange={(e) => updateComponent(index, 'nonConformity', e.target.value)}
                              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    <Save size={20} />
                    <span>{loading ? 'Guardando...' : 'Guardar Inspección'}</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Lista de inspecciones */
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-slate-400 mt-4">Cargando inspecciones...</p>
                </div>
              ) : inspections.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto text-slate-600" size={48} />
                  <p className="text-slate-400 mt-4">No hay inspecciones registradas aún</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Registrar Primera Inspección
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Fecha</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Quarter</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Cliente</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Proveedor</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Componente</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Resultado</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Costo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspections.map((inspection) => (
                        <tr key={inspection.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 px-4 text-slate-300">{inspection.inspectionDate}</td>
                          <td className="py-3 px-4 text-slate-300">{inspection.quarter}</td>
                          <td className="py-3 px-4 text-slate-300">{inspection.client}</td>
                          <td className="py-3 px-4 text-slate-300">{inspection.supplier}</td>
                          <td className="py-3 px-4 text-slate-300">
                            <div className="text-sm">
                              <div className="font-medium">{inspection.componentCode}</div>
                              <div className="text-slate-400 text-xs">{inspection.componentDescription}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              inspection.inspectionOutcome === 'positive' ? 'bg-green-500/20 text-green-400' :
                              inspection.inspectionOutcome === 'positive with comments' ? 'bg-yellow-500/20 text-yellow-400' :
                              inspection.inspectionOutcome === 'negative' ? 'bg-red-500/20 text-red-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {inspection.inspectionOutcome || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300">{inspection.cost || '-'}</td>
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