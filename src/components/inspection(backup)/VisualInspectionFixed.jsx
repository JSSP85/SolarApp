// src/components/inspection/VisualInspectionFixed.jsx
import React from 'react';
import { Camera, Upload } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

const VisualInspectionFixed = () => {
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
  
  // Simular captura de foto (en una implementación real, esto invocaría APIs de cámara)
  const handleCapturePhoto = () => {
    const placeholder = {
      id: Date.now(),
      src: "/api/placeholder/150/150",
      caption: `Photo ${(photos?.length || 0) + 1}`
    };
    
    dispatch({
      type: 'ADD_PHOTO',
      payload: placeholder
    });
  };
  
  // Simular subida de foto
  const handleUploadPhoto = () => {
    const placeholder = {
      id: Date.now(),
      src: "/api/placeholder/150/150",
      caption: `Uploaded ${(photos?.length || 0) + 1}`
    };
    
    dispatch({
      type: 'ADD_PHOTO',
      payload: placeholder
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
            value={visualNotes || ''}
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
            {(photos || []).map((photo, index) => (
              <div key={index} className="border rounded p-1">
                <img src={photo.src} alt={`Inspection photo ${index + 1}`} className="w-full" />
              </div>
            ))}
            {!(photos?.length) && (
              <>
                <div className="border rounded p-1">
                  <img src="/api/placeholder/150/150" alt="Inspection photo 1" className="w-full" />
                </div>
                <div className="border rounded p-1">
                  <img src="/api/placeholder/150/150" alt="Inspection photo 2" className="w-full" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualInspectionFixed;