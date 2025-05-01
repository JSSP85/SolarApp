// src/components/inspection/StageNavigationButtons.jsx
import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

/**
 * Componente para los botones de navegación entre etapas de inspección
 */
const StageNavigationButtons = () => {
  const { state, dispatch } = useInspection();
  const { inspectionStage, stageCompletion } = state;
  
  // Determinar si se puede avanzar a la siguiente etapa
  const canContinue = () => {
    // Podemos continuar si la etapa actual está completa
    return stageCompletion[inspectionStage];
  };
  
  // Avanzar a la siguiente etapa
  const handleContinue = () => {
    if (canContinue()) {
      if (inspectionStage === 'visual') {
        // Si estamos en la última etapa, vamos al reporte
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'report' });
      } else {
        dispatch({ type: 'NEXT_INSPECTION_STAGE' });
      }
    }
  };
  
  // Volver a la etapa anterior
  const handleBack = () => {
    if (inspectionStage === 'dimensional') {
      // Si estamos en la primera etapa, volver a setup
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'setup' });
    } else {
      dispatch({ type: 'PREVIOUS_INSPECTION_STAGE' });
    }
  };
  
  return (
    <div className="stage-navigation-buttons">
      <div className="flex justify-between items-center mt-6">
        <button 
          className="navigation-btn back-btn"
          onClick={handleBack}
        >
          <ArrowLeft size={18} className="mr-2" /> 
          {inspectionStage === 'dimensional' ? 'Back to Setup' : 'Previous Stage'}
        </button>
        
        <button 
          className={`navigation-btn continue-btn ${!canContinue() ? 'disabled' : ''}`}
          onClick={handleContinue}
          disabled={!canContinue()}
        >
          {inspectionStage === 'visual' ? (
            <>
              Complete Inspection <CheckCircle size={18} className="ml-2" />
            </>
          ) : (
            <>
              Continue to Next Stage <ArrowRight size={18} className="ml-2" />
            </>
          )}
        </button>
      </div>
      
      {!canContinue() && (
        <div className="text-center mt-2 text-amber-600 text-sm font-medium">
          {inspectionStage === 'dimensional' && "Complete all dimensional measurements to continue"}
          {inspectionStage === 'coating' && "Complete all coating measurements to continue"}
          {inspectionStage === 'visual' && "Specify visual conformity to complete inspection"}
        </div>
      )}
      
      <style jsx>{`
        .stage-navigation-buttons {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .navigation-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
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
        
        .continue-btn {
          background: linear-gradient(to right, #16a34a, #22c55e);
          color: white;
        }
        
        .continue-btn:hover {
          background: linear-gradient(to right, #15803d, #16a34a);
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .continue-btn.disabled {
          background: #9ca3af;
          cursor: not-allowed;
          opacity: 0.7;
          transform: none;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
};

export default StageNavigationButtons;