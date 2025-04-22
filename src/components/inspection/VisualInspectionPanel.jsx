// src/components/inspection/VisualInspectionPanel.jsx
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

const VisualInspectionPanel = () => {
  const { state, dispatch } = useInspection();
  const { visualConformity, visualNotes, photos } = state;
  
  // Referencias para el input de archivo y el elemento de video
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  
  // Estados locales para gestionar la cámara y captura
  const [showCamera, setShowCamera] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  
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
  
  // Iniciar la cámara
  const handleStartCamera = async () => {
    setShowCamera(true);
    
    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Usar cámara trasera si está disponible
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      alert('No se pudo acceder a la cámara. Verifica los permisos.');
      setShowCamera(false);
    }
  };
  
  // Detener la cámara
  const handleStopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setStreamActive(false);
    setShowCamera(false);
    setPreviewPhoto(null);
  };
  
  // Capturar foto desde la cámara
  const handleCapturePhoto = () => {
    if (!videoRef.current || !streamActive) return;
    
    try {
      // Crear un canvas para capturar la imagen
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      // Dibujar el frame actual del video en el canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convertir el canvas a una URL de datos
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      // Mostrar vista previa
      setPreviewPhoto(dataUrl);
    } catch (error) {
      console.error('Error al capturar la foto:', error);
      alert('No se pudo capturar la foto. Inténtalo de nuevo.');
    }
  };
  
  // Guardar la foto capturada
  const handleSaveCapturedPhoto = () => {
    if (!previewPhoto) return;
    
    const newPhoto = {
      id: Date.now(),
      src: previewPhoto,
      caption: `Photo ${(photos?.length || 0) + 1}`,
      type: 'capture'
    };
    
    dispatch({
      type: 'ADD_PHOTO',
      payload: newPhoto
    });
    
    handleStopCamera();
  };
  
  // Descartar la foto capturada
  const handleDiscardPhoto = () => {
    setPreviewPhoto(null);
  };
  
  // Simular la acción de hacer clic en el input de archivo
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Manejar la subida de archivos
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
      // Verificar que el archivo sea una imagen
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} no es una imagen. Por favor, sube solo imágenes.`);
        return;
      }
      
      // Leer el archivo
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhoto = {
          id: Date.now() + Math.random(), // Garantizar ID único incluso con múltiples cargas rápidas
          src: event.target.result,
          caption: file.name,
          type: 'upload'
        };
        
        dispatch({
          type: 'ADD_PHOTO',
          payload: newPhoto
        });
      };
      reader.readAsDataURL(file);
    });
    
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    e.target.value = '';
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
          
          {/* Botones para capturar/subir fotos */}
          <div className="flex gap-2 mb-3">
            <button 
              className="btn btn-secondary flex items-center" 
              onClick={showCamera ? handleStopCamera : handleStartCamera}
            >
              <Camera size={16} className="mr-1" /> 
              {showCamera ? 'Close Camera' : 'Capture Photo'}
            </button>
            
            <button className="btn btn-secondary flex items-center" onClick={handleUploadClick}>
              <Upload size={16} className="mr-1" /> Upload Photo
            </button>
            
            {/* Input oculto para subir archivos */}
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              multiple 
              onChange={handleFileUpload}
            />
          </div>
          
          {/* Interfaz de la cámara */}
          {showCamera && (
            <div className="mb-4 border p-2 rounded bg-gray-50">
              <div className="relative">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  className="w-full h-64 bg-black rounded"
                  style={{ display: previewPhoto ? 'none' : 'block' }}
                ></video>
                
                {previewPhoto && (
                  <img 
                    src={previewPhoto} 
                    alt="Preview" 
                    className="w-full h-64 object-contain bg-black rounded"
                  />
                )}
                
                <div className="flex justify-center mt-2">
                  {!previewPhoto ? (
                    <button 
                      className="btn btn-primary"
                      onClick={handleCapturePhoto}
                      disabled={!streamActive}
                    >
                      Take Photo
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-success flex items-center"
                        onClick={handleSaveCapturedPhoto}
                      >
                        <Check size={16} className="mr-1" /> Save
                      </button>
                      <button 
                        className="btn btn-danger flex items-center"
                        onClick={handleDiscardPhoto}
                      >
                        <X size={16} className="mr-1" /> Discard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Galería de fotos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {(photos?.length > 0) ? 
              photos.map((photo, index) => (
                <div key={photo.id || index} className="relative group border rounded overflow-hidden">
                  <img 
                    src={photo.src} 
                    alt={photo.caption || `Photo ${index + 1}`} 
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                    {photo.caption || `Photo ${index + 1}`}
                  </div>
                  <button 
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemovePhoto(index)}
                  >
                    <X size={14} />
                  </button>
                </div>
              )) : 
              <div className="col-span-full text-center text-gray-500 py-4">
                No photos yet. Use the buttons above to capture or upload photos.
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualInspectionPanel;