// src/components/inspection/VisualInspectionPanel.jsx
import React from 'react';
import { Camera, Upload } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

const VisualInspectionPanel = () => {
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
  
  // Simular captura de foto
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
  
  // Eliminar foto
  const handleRemovePhoto = (index) => {
    dispatch({
      type: 'REMOVE_PHOTO',
      payload: index
    });
  };

  return (
    <div className="dashboard-card mt-4">
      <div className="card-header" style={{background: 'linear-gradient(to right, #667eea, #764ba2)'}}>
        <h3 className="card-title text-white">Visual Inspection</h3>
      </div>
      <div className="card-body">
        <div className="form-group">
          <label className="form-label">Visual Conformity</label>
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
        
        <div className="form-group">
          <label className="form-label">Notes/Observations</label>
          <textarea 
            className="form-control" 
            rows="3"
            placeholder="Enter any notes or observations"
            value={visualNotes || ''}
            onChange={handleNotesChange}
          ></textarea>
        </div>
        
        <div className="form-group">
          <label className="form-label">Inspection Photos</label>
          <div className="flex gap-2 mb-3">
            <button className="btn btn-secondary" onClick={handleCapturePhoto}>
              <Camera size={16} className="mr-1" /> Capture Photo
            </button>
            <button className="btn btn-secondary" onClick={handleUploadPhoto}>
              <Upload size={16} className="mr-1" /> Upload Photo
            </button>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {(photos?.length > 0) ? 
              photos.map((photo, index) => (
                <div key={index} className="border rounded overflow-hidden relative group">
                  <img src={photo.src} alt={photo.caption} className="w-full" />
                  <button 
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemovePhoto(index)}
                  >
                    ×
                  </button>
                </div>
              )) : 
              <>
                <div className="border rounded overflow-hidden">
                  <img src="/api/placeholder/150/150" alt="Inspection photo 1" className="w-full" />
                </div>
                <div className="border rounded overflow-hidden">
                  <img src="/api/placeholder/150/150" alt="Inspection photo 2" className="w-full" />
                </div>
              </>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualInspectionPanel;