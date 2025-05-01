// src/components/inspection/InspectionPanelSistem.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/inspection-wizard.css'; // Ruta relativa desde el componente
import { useInspection } from '../../context/InspectionContext';

// Importar los componentes de inspección
import { 
  EquipmentPanel, 
  DimensionMeasurementPanel, 
  CoatingMeasurementPanel, 
  VisualInspectionPanel 
} from './';

// Importar el componente para dibujo técnico
import TechnicalDrawingComponent from '../common/TechnicalDrawingComponent';

// Importar los nuevos componentes para el wizard
import InspectionProgressIndicator from './InspectionProgressIndicator';
import StageNavigationButtons from './StageNavigationButtons';

const InspectionPanelSistem = () => {
  const { state } = useInspection();
  const { inspectionStage, componentName, componentCode } = state;
  
  // Estado para controlar las animaciones de transición
  const [animation, setAnimation] = useState({
    fadeOut: false,
    currentStage: inspectionStage
  });
  
  // Efecto para manejar las transiciones animadas entre etapas
  useEffect(() => {
    if (animation.currentStage !== inspectionStage) {
      // Primero desvanecemos la etapa actual
      setAnimation(prev => ({ ...prev, fadeOut: true }));
      
      // Después de un breve delay, cambiamos a la nueva etapa y hacemos fade in
      setTimeout(() => {
        setAnimation({
          fadeOut: false,
          currentStage: inspectionStage
        });
      }, 300); // Tiempo de la animación de desvanecimiento
    }
  }, [inspectionStage]);
  
  // Método para renderizar el contenido según la etapa actual
  const renderStageContent = () => {
    // Aplicamos las clases de animación
    const animationClass = animation.fadeOut ? 'stage-fadeout' : 'stage-fadein';
    
    switch (animation.currentStage) {
      case 'dimensional':
        return (
          <div className={`stage-content ${animationClass}`}>
            {/* Panel de equipamiento siempre visible */}
            <EquipmentPanel />
            
            {/* Dibujo técnico */}
            <TechnicalDrawingComponent />
            
            {/* Mediciones dimensionales */}
            <DimensionMeasurementPanel />
          </div>
        );
        
      case 'coating':
        return (
          <div className={`stage-content ${animationClass}`}>
            {/* Mediciones de recubrimiento */}
            <CoatingMeasurementPanel />
          </div>
        );
        
      case 'visual':
        return (
          <div className={`stage-content ${animationClass}`}>
            {/* Inspección visual */}
            <VisualInspectionPanel />
          </div>
        );
        
      default:
        return (
          <div className="p-4 text-center text-gray-500">
            Error: Unknown inspection stage
          </div>
        );
    }
  };
  
  return (
    <div>
      <div className="dashboard-card mb-4">
        <div className="card-header" style={{background: 'linear-gradient(to right, #667eea, #764ba2)'}}>
          <div className="flex justify-between items-center">
            <h3 className="card-title text-white">Component Inspection</h3>
            <div>
              <span className="badge bg-blue-100 text-blue-800">
                Component: {componentName || componentCode || "Not selected"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="card-body">
          {/* Indicador de progreso */}
          <InspectionProgressIndicator />
          
          {/* Contenido de la etapa actual */}
          {renderStageContent()}
          
          {/* Botones de navegación */}
          <StageNavigationButtons />
        </div>
      </div>
      
      {/* Estilos para las animaciones */}
      <style jsx>{`
        .stage-content {
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .stage-fadeout {
          opacity: 0;
          transform: translateY(10px);
        }
        
        .stage-fadein {
          opacity: 1;
          transform: translateY(0);
        }
        
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default InspectionPanelSistem;