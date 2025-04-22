// src/components/setup/ComponentSelector.jsx
import React from 'react';
import { useInspection } from '../../context/InspectionContext';

/**
 * Componente para seleccionar la familia y código de componente
 */
const ComponentSelector = () => {
  const { state, dispatch } = useInspection();
  const { 
    componentFamily, 
    componentCode, 
    componentName, 
    availableComponentFamilies,
    availableComponentCodes
  } = state;
  
  // Manejar cambio de familia de componente
  const handleFamilyChange = (e) => {
    const value = e.target.value;
    dispatch({ 
      type: 'UPDATE_SETUP_FIELD', 
      payload: { field: 'componentFamily', value }
    });
    
    // Reiniciar código de componente cuando cambia la familia
    dispatch({ 
      type: 'UPDATE_SETUP_FIELD', 
      payload: { field: 'componentCode', value: '' }
    });
    
    dispatch({ 
      type: 'UPDATE_SETUP_FIELD', 
      payload: { field: 'componentName', value: '' }
    });
  };
  
  // Manejar cambio de código de componente y auto-completar nombre
  const handleComponentCodeChange = (e) => {
    const value = e.target.value;
    dispatch({ 
      type: 'UPDATE_SETUP_FIELD', 
      payload: { field: 'componentCode', value }
    });
    
    // Auto-completar nombre basado en el código seleccionado
    if (value && availableComponentCodes) {
      const selectedComponent = availableComponentCodes.find(item => item.code === value);
      if (selectedComponent) {
        dispatch({ 
          type: 'UPDATE_SETUP_FIELD', 
          payload: { field: 'componentName', value: selectedComponent.name }
        });
      }
    }
  };
  
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">Component Family</label>
        <select 
          className="w-full p-2 border rounded"
          value={componentFamily}
          onChange={handleFamilyChange}
        >
          <option value="">Select Component Family</option>
          {availableComponentFamilies?.map((family, index) => (
            <option key={index} value={family}>{family}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Component Code</label>
        <select 
          className="w-full p-2 border rounded"
          value={componentCode}
          onChange={handleComponentCodeChange}
          disabled={!componentFamily}
        >
          <option value="">Select Component Code</option>
          {availableComponentCodes?.map((item, index) => (
            <option key={index} value={item.code}>
              {item.code} - {item.name}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Component Name</label>
        <input 
          type="text" 
          className="w-full p-2 border rounded" 
          placeholder="Enter component name"
          value={componentName}
          onChange={(e) => dispatch({ 
            type: 'UPDATE_SETUP_FIELD', 
            payload: { field: 'componentName', value: e.target.value }
          })}
        />
        <div className="text-xs text-gray-500 mt-1">
          Auto-filled based on selected code. Can be manually modified if needed.
        </div>
      </div>
    </>
  );
};

export default ComponentSelector;