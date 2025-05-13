// src/components/report/ReportTechnicalDrawing.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Package, AlertTriangle, ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';
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

  // Estados para el zoom y navegación
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  
  // Referencias
  const containerRef = useRef(null);
  const imageRef = useRef(null);

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

  // Manejar zoom
  const handleZoom = (direction) => {
    const zoomLevels = [1, 2, 3];
    const currentIndex = zoomLevels.indexOf(zoomLevel);
    
    if (direction === 'in' && currentIndex < zoomLevels.length - 1) {
      setZoomLevel(zoomLevels[currentIndex + 1]);
    } else if (direction === 'out' && currentIndex > 0) {
      setZoomLevel(zoomLevels[currentIndex - 1]);
    }
    
    // Resetear posición cuando cambia el zoom
    if (direction === 'reset') {
      setZoomLevel(1);
      setImagePosition({ x: 0, y: 0 });
    }
  };

  // Manejar inicio del arrastre
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
    }
  };

  // Manejar movimiento del mouse
  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      e.preventDefault();
      
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      
      // Limitar el movimiento para que la imagen no se salga del contenedor
      if (containerRef.current && imageRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const imageRect = imageRef.current.getBoundingClientRect();
        
        const maxX = (imageRect.width * zoomLevel - containerRect.width) / 2;
        const maxY = (imageRect.height * zoomLevel - containerRect.height) / 2;
        
        newPosition.x = Math.max(-maxX, Math.min(maxX, newPosition.x));
        newPosition.y = Math.max(-maxY, Math.min(maxY, newPosition.y));
      }
      
      setImagePosition(newPosition);
    }
  };

  // Manejar fin del arrastre
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Event listeners para el mouse
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, imagePosition, zoomLevel]);

  // Resetear zoom cuando cambia la imagen
  useEffect(() => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  }, [drawingState.src]);

  return (
    <div className="report-section">
      <h3 className="report-section-title" style={{ color: '#3D4A5C', background: 'rgba(249, 250, 251, 0.8)', padding: '0.5rem', borderRadius: '0.25rem' }}>
        <Package size={18} style={{ marginRight: '0.5rem' }} /> Technical Drawing
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
          
          {drawingState.loading ? (
            <div className="technical-drawing-container">
              <div className="flex items-center justify-center h-full w-full">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            </div>
          ) : drawingState.error ? (
            <div className="technical-drawing-container">
              <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50 text-gray-500 text-center p-4">
                <AlertTriangle size={48} className="text-amber-500 mb-4" />
                <p className="font-medium">{drawingState.errorMessage}</p>
                <p className="mt-2 text-sm">Please check component information in the database.</p>
              </div>
            </div>
          ) : (
            <div className="technical-drawing-viewer">
              {/* Controles de zoom */}
              <div className="zoom-controls">
                <button 
                  onClick={() => handleZoom('out')}
                  disabled={zoomLevel <= 1}
                  className="zoom-btn"
                  title="Zoom Out"
                >
                  <ZoomOut size={20} />
                </button>
                <span className="zoom-level">{zoomLevel}x</span>
                <button 
                  onClick={() => handleZoom('in')}
                  disabled={zoomLevel >= 3}
                  className="zoom-btn"
                  title="Zoom In"
                >
                  <ZoomIn size={20} />
                </button>
                <button 
                  onClick={() => handleZoom('reset')}
                  className="zoom-btn"
                  title="Reset Zoom"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
              
              {/* Contenedor de la imagen */}
              <div 
                ref={containerRef}
                className="technical-drawing-container-report"
                style={{
                  cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
                }}
              >
                <img 
                  ref={imageRef}
                  src={drawingState.src} 
                  alt={drawingState.alt} 
                  className="technical-drawing-image"
                  style={{
                    transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                    transformOrigin: 'center center'
                  }}
                  onMouseDown={handleMouseDown}
                  draggable={false}
                />
              </div>
            </div>
          )}
          
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

      <style jsx>{`
        .technical-drawing-viewer {
          position: relative;
          width: 100%;
        }
        
        .zoom-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 12px;
          padding: 8px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        
        .zoom-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background-color: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .zoom-btn:hover:not(:disabled) {
          background-color: #f3f4f6;
          border-color: #9ca3af;
        }
        
        .zoom-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .zoom-level {
          font-weight: 600;
          color: #374151;
          min-width: 30px;
          text-align: center;
        }
        
        .technical-drawing-container,
        .technical-drawing-container-report {
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
        }
        
        .technical-drawing-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          transition: transform 0.2s ease-out;
          user-select: none;
          -webkit-user-drag: none;
        }
        
        /* Instrucciones de uso */
        .technical-drawing-container-report::after {
          content: attr(data-instructions);
          position: absolute;
          bottom: 10px;
          right: 10px;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        
        .technical-drawing-container-report:hover::after {
          opacity: ${zoomLevel > 1 ? 1 : 0};
          content: "${zoomLevel > 1 ? 'Click and drag to navigate' : ''}";
        }
        
        /* Ajustes para impresión */
        @media print {
          .zoom-controls {
            display: none !important;
          }
          
          .technical-drawing-container-report {
            height: auto;
            max-height: 400px;
            page-break-inside: avoid;
            box-shadow: none;
            cursor: default;
          }
          
          .technical-drawing-image {
            transform: none !important;
            max-height: 380px;
          }
        }
      `}</style>
    </div>
  );
}; 

export default ReportTechnicalDrawing;
