// src/components/common/TechnicalDrawingComponent.jsx
import React from 'react';
import { useInspection } from '../../context/InspectionContext';
import { FileText } from 'lucide-react';

const TechnicalDrawingComponent = () => {
  const { state } = useInspection();
  const { componentCode, componentFamily, componentName } = state;
  
  // Function to get the appropriate image based on component details
  const getDrawingImage = () => {
    // Path to the image - FIXED: Correct path and extension
    const basePath = "/images/drawings/torque-tube-technical.jpeg";
    
    if (componentFamily === 'TORQUE TUBES') {
      if (componentCode === 'ttg45720') {
        return {
          src: basePath,
          alt: "Technical drawing for Torque tube 140x100x3.5mm"
        };
      } else if (componentCode === 'ttg45721') {
        return {
          src: basePath, // Same image for this component
          alt: "Technical drawing for Torque tube 140x100x4.0mm"
        };
      }
    } else if (componentFamily === 'POSTS') {
      return {
        src: basePath, // Same image for this component
        alt: "Technical drawing for Posts"
      };
    }
    
    // Default image if no specific match
    return {
      src: basePath, // Same image as fallback
      alt: `Technical drawing for ${componentName || componentCode || "component"}`
    };
  };

  // Get the appropriate image
  const drawing = getDrawingImage();
  
  return (
    <div className="dashboard-card mb-4">
      <div className="card-header" style={{ background: 'linear-gradient(to right, #4a6fa0, #6f8cb6)' }}>
        <div className="flex justify-between items-center">
          <h3 className="card-title text-white flex items-center">
            <FileText size={18} className="mr-2" /> Technical Drawing
          </h3>
        </div>
      </div>
      
      <div className="card-body">
        <div className="text-center">
          {componentName && (
            <h4 className="font-medium text-gray-700 mb-2">
              {componentName} - {componentCode}
            </h4>
          )}
          
          <div className="technical-drawing-container">
            <img 
              src={drawing.src}
              alt={drawing.alt}
              className="technical-drawing-image"
            />
          </div>
        </div>
      </div>
      
      {/* Custom styles for the technical drawing */}
      <style jsx>{`
        .technical-drawing-container {
          width: 100%;
          padding: 1rem;
          background-color: #f8fafc;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }
        
        .technical-drawing-container:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .technical-drawing-image {
          width: 100%;
          max-width: 800px;
          height: auto;
          display: block;
          margin: 0 auto;
          transition: transform 0.3s ease;
        }
        
        .technical-drawing-container:hover .technical-drawing-image {
          transform: scale(1.03);
        }
      `}</style>
    </div>
  );
};

export default TechnicalDrawingComponent;