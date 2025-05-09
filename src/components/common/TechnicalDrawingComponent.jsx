// src/components/common/TechnicalDrawingComponent.jsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { getComponentDrawing } from '../../utils/drawingService';

const TechnicalDrawingComponent = () => {
  const { state } = useInspection();
  const { componentCode } = state;
  
  const [drawingState, setDrawingState] = useState({
    loading: true,
    error: false,
    errorMessage: "",
    src: "",
    alt: ""
  });

  useEffect(() => {
    if (!componentCode) {
      setDrawingState({
        loading: false,
        error: true,
        errorMessage: "No component selected",
        src: "",
        alt: ""
      });
      return;
    }

    setDrawingState(prev => ({ ...prev, loading: true }));

    // Obtener información del dibujo
    const drawingInfo = getComponentDrawing(componentCode);
    
    if (!drawingInfo.found) {
      setDrawingState({
        loading: false,
        error: true,
        errorMessage: drawingInfo.errorMessage,
        src: "",
        alt: ""
      });
      return;
    }
    
    // Verificar si la imagen existe
    const img = new Image();
    img.onload = () => {
      setDrawingState({
        loading: false,
        error: false,
        errorMessage: "",
        src: drawingInfo.src,
        alt: drawingInfo.alt
      });
    };
    
    img.onerror = () => {
      setDrawingState({
        loading: false,
        error: true,
        errorMessage: "Technical drawing file not found",
        src: "",
        alt: ""
      });
    };
    
    img.src = drawingInfo.src;
  }, [componentCode]);

  return (
    <div className="dashboard-card mb-4">
      <div className="card-header" style={{background: 'linear-gradient(to right, #5a67d8, #6875f5)'}}>
        <h3 className="card-title text-white">Technical Drawing</h3>
      </div>
      <div className="card-body">
        {drawingState.loading ? (
          <div className="flex items-center justify-center h-64 bg-gray-100">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : drawingState.error ? (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 text-gray-500 text-center p-4">
            <AlertTriangle size={48} className="text-amber-500 mb-4" />
            <p className="font-medium text-lg">{drawingState.errorMessage}</p>
            <p className="mt-2 text-sm">Please check component information in the database.</p>
          </div>
        ) : (
          <div className="flex items-center justify-center p-4">
            <img 
              src={drawingState.src} 
              alt={drawingState.alt} 
              className="max-h-64 max-w-full object-contain" 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicalDrawingComponent;