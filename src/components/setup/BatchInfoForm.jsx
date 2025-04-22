// src/components/setup/BatchInfoForm.jsx
import React from 'react';
import { useInspection } from '../../context/InspectionContext';
import { calculateSample } from '../../utils/samplePlanHelper';

/**
 * Formulario para información del lote y muestra
 */
const BatchInfoForm = () => {
  const { state, dispatch } = useInspection();
  const { batchQuantity, sampleInfo, inspector, inspectionDate } = state;
  
  // Manejar cambio de cantidad del lote y calcular tamaño de muestra
  const handleBatchChange = (e) => {
    const value = e.target.value;
    dispatch({ 
      type: 'UPDATE_SETUP_FIELD', 
      payload: { field: 'batchQuantity', value }
    });
    
    if (value && !isNaN(value) && parseInt(value) > 0) {
      const sampleInfo = calculateSample(parseInt(value));
      const sampleCount = parseInt(sampleInfo.split('Sample: ')[1]);
      
      dispatch({ 
        type: 'SET_SAMPLE_INFO', 
        payload: { sampleInfo, sampleCount }
      });
    } else {
      dispatch({ 
        type: 'UPDATE_SETUP_FIELD', 
        payload: { field: 'sampleInfo', value: '' }
      });
    }
  };
  
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">Inspector Name</label>
        <input 
          type="text" 
          className="w-full p-2 border rounded" 
          placeholder="Enter inspector name"
          value={inspector}
          onChange={(e) => dispatch({ 
            type: 'UPDATE_SETUP_FIELD', 
            payload: { field: 'inspector', value: e.target.value }
          })}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Inspection Date</label>
        <input 
          type="date" 
          className="w-full p-2 border rounded" 
          value={inspectionDate}
          onChange={(e) => dispatch({ 
            type: 'UPDATE_SETUP_FIELD', 
            payload: { field: 'inspectionDate', value: e.target.value }
          })}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Batch Quantity</label>
        <input 
          type="number" 
          className="w-full p-2 border rounded" 
          placeholder="Enter batch quantity"
          value={batchQuantity}
          onChange={handleBatchChange}
          min="1"
        />
      </div>
      
      {sampleInfo && (
        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <span className="font-medium">Sample Size:</span> {sampleInfo}
        </div>
      )}
    </>
  );
};

export default BatchInfoForm;