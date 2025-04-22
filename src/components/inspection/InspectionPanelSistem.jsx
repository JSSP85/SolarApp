// src/components/inspection/InspectionPanelSistem.jsx
import React from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

// Import only the necessary panels, excluding the chart panel
import { 
  EquipmentPanel, 
  DimensionMeasurementPanel, 
  // DimensionalChartPanel - Removed
  CoatingMeasurementPanel, 
  VisualInspectionPanel 
} from './';

// Import the component for technical drawing
import TechnicalDrawingComponent from '../common/TechnicalDrawingComponent';

const InspectionPanelSistem = () => {
  const { state, dispatch } = useInspection();
  
  // Navigation functions
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
            <h3 className="card-title text-white">Inspección de Componente</h3>
            <div>
              <span className="badge bg-blue-100 text-blue-800">
                Componente: {state.componentName || state.componentCode || "No seleccionado"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="card-body">
          {/* Measurement equipment panel */}
          <EquipmentPanel />
          
          {/* Technical drawing - shown only when relevant */}
          <TechnicalDrawingComponent />
          
          {/* Dimensional measurement panel */}
          <DimensionMeasurementPanel />
          
          {/* Dimensional charts panel removed */}
          
          {/* Coating measurement panel */}
          <CoatingMeasurementPanel />
          
          {/* Visual inspection panel */}
          <VisualInspectionPanel />
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            <button 
              className="inspection-nav-btn back-btn"
              onClick={handleBackToSetup}
            >
              <ArrowLeft size={18} className="mr-2" /> Volver a Configuración
            </button>
            <button 
              className="inspection-nav-btn complete-btn"
              onClick={handleCompleteInspection}
            >
              Completar Inspección <CheckCircle size={18} className="ml-2" />
            </button>
          </div>
          
          {/* Specific styles for navigation buttons */}
          <style jsx>{`
            .inspection-nav-btn {
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 10px 20px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 0.95rem;
              transition: all 0.2s ease;
              border: none;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .back-btn {
              background: linear-gradient(to right, #64748b, #94a3b8);
              color: white;
            }
            
            .back-btn:hover {
              background: linear-gradient(to right, #475569, #64748b);
              transform: translateY(-1px);
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .complete-btn {
              background: linear-gradient(to right, #16a34a, #22c55e);
              color: white;
            }
            
            .complete-btn:hover {
              background: linear-gradient(to right, #15803d, #16a34a);
              transform: translateY(-1px);
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default InspectionPanelSistem;