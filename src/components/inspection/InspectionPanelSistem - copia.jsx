// src/components/inspection/InspectionPanelSistem.jsx
import React from 'react';
import { ArrowLeft, CheckCircle, FileText } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

// Importar los componentes de panel, pero eliminando InspectionStatusPanel
// ya que ahora está integrado en DimensionMeasurementPanel
import { 
  EquipmentPanel, 
  DimensionMeasurementPanel, 
  DimensionalChartPanel, 
  CoatingMeasurementPanel, 
  VisualInspectionPanel 
} from './';

const InspectionPanelSistem = () => {
  const { state, dispatch } = useInspection();
  
  // Funciones de navegación
  const handleBackToSetup = () => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'setup' });
  };
  
  const handleCompleteInspection = () => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'report' });
  };
  
  return (
    <div>
      <div className="dashboard-card mb-4">
        <div className="card-header" style={{background: 'linear-gradient(to right, #667eea, #764ba2)'}}>
          <div className="flex justify-between items-center">
            <h3 className="card-title text-white">Inspection Overview</h3>
            <div>
              <span className="badge bg-blue-100 text-blue-800">
                Component: {state.componentName || state.componentCode || "Not selected"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="card-body">
          {/* Ya no incluimos InspectionStatusPanel aquí */}
          
          {/* Equipos de medición */}
          <EquipmentPanel />
          
          {/* Notificaciones de step YA NO van aquí, sino en el modal dentro de DimensionMeasurementPanel */}
          
          {/* Dibujo técnico - MODIFICADO al estilo minimalista */}
          <div className="dashboard-card mb-4">
            <div className="card-body">
              <h3 className="report-section-title">
                <FileText size={18} className="mr-2" /> Technical Drawing
              </h3>
              <div className="aspect-video bg-gray-50 flex items-center justify-center border rounded">
                <img src="/api/placeholder/600/300" alt="Component technical drawing" className="max-h-full rounded" />
              </div>
            </div>
          </div>
          
          {/* Panel de medición dimensional - Ahora incluye Overall Status dentro */}
          <DimensionMeasurementPanel />
          
          {/* Panel de gráficos dimensionales */}
          <DimensionalChartPanel />
          
          {/* Panel de medición de recubrimiento */}
          <CoatingMeasurementPanel />
          
          {/* Panel de inspección visual */}
          <VisualInspectionPanel />
          
          {/* Botones de navegación */}
          <div className="flex justify-between mt-6">
            <button 
              className="btn btn-secondary"
              onClick={handleBackToSetup}
            >
              <ArrowLeft size={16} className="mr-1" /> Back to Setup
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleCompleteInspection}
            >
              Complete Inspection <CheckCircle size={16} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionPanelSistem;