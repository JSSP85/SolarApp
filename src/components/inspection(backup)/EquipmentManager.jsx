// src/components/inspection/EquipmentManager.jsx
import React from 'react';
import { PlusCircle, XCircle } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

/**
 * Componente para gestionar equipos de medición
 */
const EquipmentManager = () => {
  const { state, dispatch } = useInspection();
  const { measurementEquipment } = state;
  
  // Añadir nuevo equipo
  const addEquipment = () => {
    dispatch({ type: 'ADD_EQUIPMENT' });
  };
  
  // Eliminar equipo
  const removeEquipment = (id) => {
    if (measurementEquipment.length > 1) {
      dispatch({ 
        type: 'REMOVE_EQUIPMENT', 
        payload: id 
      });
    }
  };
  
  // Actualizar información de equipo
  const updateEquipment = (id, field, value) => {
    dispatch({
      type: 'UPDATE_EQUIPMENT',
      payload: { id, field, value }
    });
  };
  
  return (
    <div className="border rounded p-4 bg-white">
      <h3 className="font-bold mb-4">Measurement Equipment</h3>
      
      <div className="space-y-3">
        {measurementEquipment.map((equip, index) => (
          <div key={equip.id} className="flex items-center space-x-2">
            <div className="grid grid-cols-2 gap-2 flex-1">
              <div>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded" 
                  placeholder="Enter tool type"
                  value={equip.toolType}
                  onChange={(e) => updateEquipment(equip.id, 'toolType', e.target.value)}
                />
              </div>
              <div>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded" 
                  placeholder="Enter tool ID"
                  value={equip.toolId}
                  onChange={(e) => updateEquipment(equip.id, 'toolId', e.target.value)}
                />
              </div>
            </div>
            {index === 0 && (
              <button 
                className="bg-green-100 text-green-700 p-2 rounded hover:bg-green-200"
                onClick={addEquipment}
              >
                <PlusCircle size={20} />
              </button>
            )}
            {index > 0 && (
              <button 
                className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200"
                onClick={() => removeEquipment(equip.id)}
              >
                <XCircle size={20} />
              </button>
            )}
          </div>
        ))}
        <div className="text-xs text-gray-500 mt-1">
          E.g. Coating Meter (Tool Type), CM-789 (Tool ID)
        </div>
      </div>
    </div>
  );
};

export default EquipmentManager;