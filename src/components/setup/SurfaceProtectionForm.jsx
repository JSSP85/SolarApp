// src/components/setup/SurfaceProtectionForm.jsx
import React from 'react';
import { useInspection } from '../../context/InspectionContext';

/**
 * Formulario para opciones de protección superficial
 */
const SurfaceProtectionForm = () => {
  const { state, dispatch } = useInspection();
  const { surfaceProtection, thickness, specialCoating } = state;
  
  // Lista estática de opciones (en producción vendría de Google Sheets)
  const surfaceProtectionOptions = [
    "Z275 - According to EN 10346:2015",
    "Z450 - According to EN 10346:2015",
    "Z600 - According to EN 10346:2015",
    "Z725 - According to EN 10346:2015",
    "Z800 - According to EN 10346:2015",
    "Hot-dip Galvanized according to ISO1461",
    "Hot-dip Galvanized (special coating)"
  ];
  
  const handleSurfaceProtectionChange = (e) => {
    const value = e.target.value;
    dispatch({ 
      type: 'UPDATE_SETUP_FIELD', 
      payload: { field: 'surfaceProtection', value }
    });
    
    // Reiniciar espesor y recubrimiento especial cuando cambia la protección
    dispatch({ 
      type: 'UPDATE_SETUP_FIELD', 
      payload: { field: 'thickness', value: '' }
    });
    
    dispatch({ 
      type: 'UPDATE_SETUP_FIELD', 
      payload: { field: 'specialCoating', value: '' }
    });
  };
  
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">Surface Protection</label>
        <select 
          className="w-full p-2 border rounded"
          value={surfaceProtection}
          onChange={handleSurfaceProtectionChange}
        >
          <option value="">Select Surface Protection</option>
          {surfaceProtectionOptions.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      </div>
      
      {surfaceProtection === "Hot-dip Galvanized according to ISO1461" && (
        <div>
          <label className="block text-sm font-medium mb-1">Thickness (mm)</label>
          <input 
            type="number" 
            className="w-full p-2 border rounded" 
            placeholder="Enter material thickness"
            value={thickness}
            onChange={(e) => dispatch({ 
              type: 'UPDATE_SETUP_FIELD', 
              payload: { field: 'thickness', value: e.target.value }
            })}
            step="0.1"
            min="0"
          />
        </div>
      )}
      
      {surfaceProtection === "Hot-dip Galvanized (special coating)" && (
        <div>
          <label className="block text-sm font-medium mb-1">Special Coating Value (µm)</label>
          <input 
            type="number" 
            className="w-full p-2 border rounded" 
            placeholder="Enter required coating value"
            value={specialCoating}
            onChange={(e) => dispatch({ 
              type: 'UPDATE_SETUP_FIELD', 
              payload: { field: 'specialCoating', value: e.target.value }
            })}
            step="1"
            min="0"
          />
        </div>
      )}
    </>
  );
};

export default SurfaceProtectionForm;