// src/components/report/ReportTechnicalDrawing.jsx
import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { getComponentDrawing } from '../../utils/drawingService';

const ReportTechnicalDrawing = () => {
  const { state } = useInspection();
  const { componentCode, componentName } = state;
  
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
              imageCode: drawingInfo.imageCode,
              componentName: drawingInfo.componentName
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
    <div className="report-section">
      <h3 className="report-section-title">
        <Package size={18} className="mr-2" /> Technical Drawing
      </h3>
      <div className="dashboard-card">
        <div className="card-body p-4">
          {componentName && (
            <div className="text-center mb-3">
              <h4 className="font-medium text-gray-700">
                {drawingState.componentName || componentName} - {componentCode}
              </h4>
            </div>
          )}
          
          {/* Contenedor de imagen mejorado con dimensiones controladas */}
          <div className="technical-drawing-container">
            {drawingState.loading ? (
              <div className="flex items-center justify-center h-full w-full">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            ) : drawingState.error ? (
              <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50 text-gray-500 text-center p-4">
                <AlertTriangle size={48} className="text-amber-500 mb-4" />
                <p className="font-medium">{drawingState.errorMessage}</p>
                <p className="mt-2 text-sm">Please check component information in the database.</p>
              </div>
            ) : (
              <img 
                src={drawingState.src} 
                alt={drawingState.alt} 
                className="technical-drawing-fixed-report-contain"
              />
            )}
          </div>
          
          {/* Mostrar el código de imagen si está disponible */}
          {!drawingState.error && !drawingState.loading && drawingState.imageCode && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              Drawing reference: {drawingState.imageCode}
            </div>
          )}
          
          {/* Nota de referencia */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            This drawing is included as a reference. For more details, please consult the complete technical documentation.
          </div>
        </div>
      </div>

      {/* Mantenemos los estilos existentes */}
      <style jsx>{`
        .technical-drawing-container {
          width: 100%;
    height: 400px;
    padding: 1rem;
    background-color: #f8fafc;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    position: relative;
    cursor: zoom-in;
  }
  
  .technical-drawing-fixed-report-contain {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    transition: transform 0.3s ease;
  }
  
  .technical-drawing-container:hover .technical-drawing-fixed-report-contain {
    transform: scale(3.2);
    cursor: zoom-out;
  }
  
  /* Ajustes para impresión */
  @media print {
    .technical-drawing-container {
      height: auto;
      max-height: 400px;
      page-break-inside: avoid;
      box-shadow: none;
      cursor: default;
    }
    
    .technical-drawing-fixed-report-contain {
      transform: none !important;
      max-height: 380px;
    }
  }
`}</style>
    </div>
  );
}; 

export default ReportTechnicalDrawing;
