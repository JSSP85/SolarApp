// src/components/inspection/VisualInspection.jsx
import React from 'react';
import { Camera, Upload } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

/**
 * Componente para inspección visual
 */
const VisualInspection = () => {
  const { state, dispatch } = useInspection();
  const { visualConformity, visualNotes, photos } = state;
  
  // Manejar cambio en conformidad visual
  const handleVisualConformityChange = (value) => {
    dispatch({
      type: 'SET_VISUAL_CONFORMITY',
      payload: value
    });
  };
  
  // Manejar cambio en notas visuales
  const handleNotesChange = (e) => {
    dispatch({
      type: 'SET_VISUAL_NOTES',
      payload: e.target.value
    });
  };
  
  // Simulación de captura de foto
  const handleCapturePhoto = () => {
    // En una implementación real, esto activaría la cámara
    // Por ahora, simularemos añadir una foto
    dispatch({
      type: 'ADD_PHOTO',
      payload: `/api/placeholder/${150 + Math.floor(Math.random() * 50)}/${150 + Math.floor(Math.random() * 50)}`
    });
  };
  
  // Simulación de carga de foto
  const handleUploadPhoto = () => {
    // En una implementación real, esto abriría un diálogo de archivo
    // Por ahora, simularemos añadir una foto
    dispatch({
      type: 'ADD_PHOTO',
      payload: `/api/placeholder/${150 + Math.floor(Math.random() * 50)}/${150 + Math.floor(Math.random() * 50)}`
    });
  };
  
  // Eliminar foto
  const handleRemovePhoto = (index) => {
    dispatch({
      type: 'REMOVE_PHOTO',
      payload: index
    });
  };
  
  return (
    <div className="border rounded p-4 bg-white mt-4">
      <h3 className="font-bold mb-4">Visual Inspection</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Visual Conformity</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input 
                type="radio" 
                name="visual" 
                className="mr-2" 
                checked={visualConformity === 'conforming'}
                onChange={() => handleVisualConformityChange('conforming')}
              />
              Conforming
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="visual" 
                className="mr-2"
                checked={visualConformity === 'non-conforming'}
                onChange={() => handleVisualConformityChange('non-conforming')}
              />
              Non-conforming
            </label>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Notes/Observations</label>
          <textarea 
            className="w-full p-2 border rounded" 
            rows="3"
            placeholder="Enter any notes or observations"
            value={visualNotes}
            onChange={handleNotesChange}
          ></textarea>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Inspection Photos</label>
          <div className="flex items-center space-x-2">
            <button 
              className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded flex items-center"
              onClick={handleCapturePhoto}
            >
              <Camera size={18} className="mr-2" /> Capture Photo
            </button>
            <button 
              className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded flex items-center"
              onClick={handleUploadPhoto}
            >
              <Upload size={18} className="mr-2" /> Upload Photo
            </button>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-3">
            {photos.map((photo, index) => (
              <div key={index} className="border rounded p-1 relative group">
                <img src={photo} alt={`Inspection photo ${index + 1}`} className="w-full" />
                <button 
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemovePhoto(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualInspection;