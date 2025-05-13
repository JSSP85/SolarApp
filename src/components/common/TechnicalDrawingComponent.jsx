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
    alt: "",
    imageCode: ""
  });

  useEffect(() => {
    let isMounted = true;
    
    const fetchDrawing = async () => {
      if (!componentCode) {
        if (isMounted) {
          setDrawingState({
            loading: false,
            error: true,
            errorMessage: "No component selected",
            src: "",
            alt: "",
            imageCode: ""
          });
        }
        return;
      }

      if (isMounted) {
        setDrawingState(prev => ({ ...prev, loading: true }));
      }

      try {
        // Obtener información del dibujo
        const drawingInfo = await getComponentDrawing(componentCode);
        
        if (!drawingInfo.found) {
          if (isMounted) {
            setDrawingState({
              loading: false,
              error: true,
              errorMessage: drawingInfo.errorMessage,
              src: "",
              alt: "",
              imageCode: ""
            });
          }
          return;
        }
        
        // Verificar si la imagen existe
        const img = new Image();
        img.onload = () => {
          if (isMounted) {
            setDrawingState({
              loading: false,
              error: false,
              errorMessage: "",
              src: drawingInfo.src,
              alt: drawingInfo.alt,
              imageCode: drawingInfo.imageCode
            });
          }
        };
        
        img.onerror = () => {
          if (isMounted) {
            setDrawingState({
              loading: false,
              error: true,
              errorMessage: `Technical drawing file not found: ${drawingInfo.imageCode}`,
              src: "",
              alt: "",
              imageCode: drawingInfo.imageCode
            });
          }
        };
        
        img.src = drawingInfo.src;
      } catch (error) {
        console.error("Error loading drawing:", error);
        if (isMounted) {
          setDrawingState({
            loading: false,
            error: true,
            errorMessage: "Error loading technical drawing",
            src: "",
            alt: "",
            imageCode: ""
          });
        }
      }
    };

    fetchDrawing();
    
    // Limpiar al desmontar
    return () => {
      isMounted = false;
    };
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
          <div className="technical-drawing-image-container">
  <img 
    src={drawingState.src} 
    alt={drawingState.alt} 
    className="technical-drawing-fixed-image-contain" 
  />
</div>
        )}
        
        {drawingState.imageCode && !drawingState.loading && !drawingState.error && (
          <div className="mt-2 text-xs text-center text-gray-500">
            Drawing reference: {drawingState.imageCode}
          </div>
        )}
      </div>
    </div>
    {/* AÑADIR ESTOS ESTILOS */}
      <style jsx>{`
        .technical-drawing-image-container {
          width: 100%;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 8px;
          position: relative;
          cursor: zoom-in;
        }
        
        .technical-drawing-fixed-image-contain {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.3s ease;
        }
        
        .technical-drawing-image-container:hover .technical-drawing-fixed-image-contain {
          transform: scale(3);
          cursor: zoom-out;
        }
      `}</style>
      </div> 
  );
}; 

export default TechnicalDrawingComponent;