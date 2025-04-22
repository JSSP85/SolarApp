// src/components/inspection/InspectionHeader.jsx
import React from 'react';
import { useInspection } from '../../context/InspectionContext';

/**
 * Encabezado para el panel de inspección
 */
const InspectionHeader = () => {
  const { state } = useInspection();
  
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold">Dimension Inspection</h2>
      <div className="text-sm bg-gray-100 p-2 rounded">
        Component: {state.componentName || "Not selected"}
      </div>
    </div>
  );
};

export default InspectionHeader;