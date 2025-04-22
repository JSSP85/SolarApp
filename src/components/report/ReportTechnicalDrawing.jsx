// src/components/report/ReportTechnicalDrawing.jsx
import React from 'react';
import { useInspection } from '../../context/InspectionContext';
import { Package } from 'lucide-react';

const ReportTechnicalDrawing = () => {
  const { state } = useInspection();
  const { componentCode, componentFamily, componentName } = state;
  
  // Function to get the appropriate image based on component details
  const getDrawingImage = () => {
    // Corregir extensión a .jpeg para mayor consistencia
    const basePath = "/images/drawings/torque-tube-technical.jpeg";
    
    if (componentFamily === 'TORQUE TUBES') {
      if (componentCode === 'ttg45720') {
        return {
          src: basePath,
          alt: "Dibujo técnico para Torque tube 140x100x3.5mm"
        };
      } else if (componentCode === 'ttg45721') {
        return {
          src: basePath,
          alt: "Dibujo técnico para Torque tube 140x100x4.0mm"
        };
      }
    } else if (componentFamily === 'POSTS') {
      return {
        src: basePath,
        alt: "Dibujo técnico para Posts"
      };
    } else if (componentFamily === 'MODULE RAILS') {
      return {
        src: basePath,
        alt: "Dibujo técnico para Module Rails"
      };
    } else if (componentFamily === 'KIT') {
      return {
        src: basePath,
        alt: "Dibujo técnico para Kit"
      };
    }
    
    // Imagen predeterminada si no hay coincidencia específica
    return {
      src: basePath,
      alt: `Dibujo técnico para ${componentName || componentCode || "componente"}`
    };
  };

  // Obtener la imagen apropiada
  const drawing = getDrawingImage();

  // Mock dimensions table data - solo para componentes específicos
  const mockDimensions = componentCode === 'ttg45720' ? [
    { code: 'A', description: 'Longitud', nominal: 4570, tolerancePlus: 10, toleranceMinus: 3 },
    { code: 'B', description: 'Anchura', nominal: 100, tolerancePlus: 1, toleranceMinus: 1 },
    { code: 'C', description: 'Altura', nominal: 140, tolerancePlus: 1, toleranceMinus: 1 },
    { code: 'D', description: 'Espesor', nominal: 3.5, tolerancePlus: 0.2, toleranceMinus: 0.2 },
  ] : [];

  return (
    <div className="report-section">
      <h3 className="report-section-title">
        <Package size={18} className="mr-2" /> Dibujo Técnico
      </h3>
      <div className="dashboard-card">
        <div className="card-body p-4">
          {componentName && (
            <div className="text-center mb-3">
              <h4 className="font-medium text-gray-700">
                {componentName} - {componentCode}
              </h4>
            </div>
          )}
          
          {/* Contenedor de imagen mejorado con dimensiones controladas */}
          <div className="technical-drawing-container">
            <img 
              src={drawing.src} 
              alt={drawing.alt} 
              className="technical-drawing-image"
            />
          </div>
          
          {/* Mostrar dimensiones solo para componentes específicos */}
          {componentCode === 'ttg45720' && mockDimensions.length > 0 && (
            <div className="mt-4 text-sm">
              <h5 className="font-medium text-gray-700 mb-2">Dimensiones principales:</h5>
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 border text-sm font-medium text-gray-700">Código</th>
                      <th className="px-4 py-2 border text-sm font-medium text-gray-700">Descripción</th>
                      <th className="px-4 py-2 border text-sm font-medium text-gray-700">Nominal (mm)</th>
                      <th className="px-4 py-2 border text-sm font-medium text-gray-700">Tolerancia +</th>
                      <th className="px-4 py-2 border text-sm font-medium text-gray-700">Tolerancia -</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDimensions.map(dim => (
                      <tr key={dim.code}>
                        <td className="px-4 py-2 border text-sm font-medium">{dim.code}</td>
                        <td className="px-4 py-2 border text-sm">{dim.description}</td>
                        <td className="px-4 py-2 border text-sm text-right">{dim.nominal}</td>
                        <td className="px-4 py-2 border text-sm text-right text-green-600">+{dim.tolerancePlus}</td>
                        <td className="px-4 py-2 border text-sm text-right text-red-600">-{dim.toleranceMinus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Nota de referencia */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            Este dibujo se incluye como referencia. Para más detalles, consulte la documentación técnica completa.
          </div>
        </div>
      </div>

      {/* Estilos específicos para controlar las dimensiones de la imagen */}
      <style jsx>{`
        .technical-drawing-container {
          width: 100%;
          height: 300px;
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
        }
        
        .technical-drawing-image {
          max-height: 280px;
          max-width: 100%;
          object-fit: contain;
          display: block;
          transition: transform 0.3s ease;
        }
        
        .technical-drawing-container:hover .technical-drawing-image {
          transform: scale(1.02);
        }
        
        /* Ajustes para impresión */
        @media print {
          .technical-drawing-container {
            height: auto;
            max-height: 300px;
            page-break-inside: avoid;
            box-shadow: none;
          }
          
          .technical-drawing-image {
            max-height: 280px;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportTechnicalDrawing;