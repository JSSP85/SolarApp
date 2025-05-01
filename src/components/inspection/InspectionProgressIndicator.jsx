// src/components/inspection/InspectionProgressIndicator.jsx
import React from 'react';
import { Ruler, Droplet, Eye, CheckCircle } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

const InspectionProgressIndicator = () => {
  const { state } = useInspection();
  const { inspectionStage, stageCompletion } = state;

  // Configuración de etapas
  const stages = [
    { id: 'dimensional', label: 'Dimensional', icon: Ruler },
    { id: 'coating', label: 'Coating', icon: Droplet },
    { id: 'visual', label: 'Visual', icon: Eye }
  ];

  // Función para determinar el estado de cada etapa
  const getStageStatus = (stageId) => {
    if (inspectionStage === stageId) return 'current';
    
    // Si es una etapa anterior y está completada
    const stageIndex = stages.findIndex(s => s.id === stageId);
    const currentIndex = stages.findIndex(s => s.id === inspectionStage);
    
    if (stageIndex < currentIndex && stageCompletion[stageId]) return 'completed';
    if (stageIndex < currentIndex) return 'incomplete';
    
    return 'upcoming';
  };

  return (
    <div className="inspection-progress-container mb-4">
      <div className="progress-track">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage.id);
          const Icon = stage.icon;
          
          return (
            <React.Fragment key={stage.id}>
              {/* Conectores entre círculos, excepto antes del primer círculo */}
              {index > 0 && (
                <div 
                  className={`progress-connector ${
                    status === 'completed' || status === 'current' ? 'active' : ''
                  } ${status === 'completed' ? 'completed' : ''}`}
                ></div>
              )}
              
              {/* Círculo con icono */}
              <div className="progress-step-container">
                <div 
                  className={`progress-step ${status}`}
                  title={`${stage.label} Inspection ${status === 'completed' ? '(Completed)' : 
                    status === 'current' ? '(In Progress)' : '(Pending)'}`}
                >
                  {status === 'completed' ? (
                    <CheckCircle size={18} />
                  ) : (
                    <Icon size={18} />
                  )}
                </div>
                <div className={`step-label ${status}`}>{stage.label}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      
      <style jsx>{`
        .inspection-progress-container {
          padding: 1rem 0;
          margin-bottom: 1.5rem;
        }
        
        .progress-track {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 0;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .progress-step-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 1;
        }
        
        .progress-step {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f3f4f6;
          color: #9ca3af;
          border: 2px solid #e5e7eb;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .progress-step.current {
          background-color: #dbeafe;
          color: #3b82f6;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
          transform: scale(1.1);
        }
        
        .progress-step.completed {
          background-color: #d1fae5;
          color: #10b981;
          border-color: #10b981;
        }
        
        .progress-step.upcoming {
          background-color: #f3f4f6;
          color: #9ca3af;
          border-color: #e5e7eb;
        }
        
        .progress-connector {
          height: 2px;
          flex-grow: 1;
          background-color: #e5e7eb;
          margin: 0 -2px;
          width: 100px;
          max-width: 100px;
          transition: all 0.3s ease;
        }
        
        .progress-connector.active {
          background-color: #3b82f6;
        }
        
        .progress-connector.completed {
          background-color: #10b981;
        }
        
        .step-label {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.3s ease;
        }
        
        .step-label.current {
          color: #3b82f6;
          font-weight: 600;
        }
        
        .step-label.completed {
          color: #10b981;
        }
      `}</style>
    </div>
  );
};

export default InspectionProgressIndicator;