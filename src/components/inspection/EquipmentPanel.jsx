// src/components/inspection/EquipmentPanel.jsx
import React from 'react';
import { Info, Settings } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

const EquipmentPanel = () => {
  const { state, dispatch } = useInspection();
  const { measurementEquipment } = state;

  // Añadir nuevo equipo de medición
  const handleAddEquipment = () => {
    dispatch({ type: 'ADD_EQUIPMENT' });
  };
  
  // Eliminar equipo de medición
  const handleRemoveEquipment = (id) => {
    dispatch({ 
      type: 'REMOVE_EQUIPMENT', 
      payload: id 
    });
  };
  
  // Actualizar información de equipo
  const handleUpdateEquipment = (id, field, value) => {
    dispatch({ 
      type: 'UPDATE_EQUIPMENT', 
      payload: { id, field, value } 
    });
  };

  return (
    <div className="dashboard-card mb-4">
      {/* Reemplazado el card-header con un report-section-title */}
      <div className="card-body">
        <h3 className="report-section-title">
          <Settings size={18} className="mr-2" /> Measurement Equipment
        </h3>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          {(measurementEquipment || []).map((equip, index) => (
            <div key={index} style={{
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px', 
              background: '#f8fafc', 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0'
            }}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flex: '1'}}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tool type"
                  value={equip.toolType || ''}
                  onChange={(e) => handleUpdateEquipment(equip.id, 'toolType', e.target.value)}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tool ID"
                  value={equip.toolId || ''}
                  onChange={(e) => handleUpdateEquipment(equip.id, 'toolId', e.target.value)}
                />
              </div>
              {index === 0 ? (
                <button 
                  className="btn"
                  style={{
                    padding: '4px', 
                    borderRadius: '50%', 
                    background: '#ebf4ff', 
                    color: '#5a67d8'
                  }}
                  onClick={handleAddEquipment}
                >
                  +
                </button>
              ) : (
                <button 
                  className="btn"
                  style={{
                    padding: '4px', 
                    borderRadius: '50%', 
                    background: '#fee2e2', 
                    color: '#e53e3e'
                  }}
                  onClick={() => handleRemoveEquipment(equip.id)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div style={{
          marginTop: '8px',
          fontSize: '12px',
          color: '#718096',
          padding: '8px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <Info size={12} style={{marginRight: '4px', color: '#a0aec0'}} />
            Example: Coating Meter (Tool Type), CM-789 (Tool ID)
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentPanel;