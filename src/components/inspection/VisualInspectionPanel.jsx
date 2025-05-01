// src/components/inspection/VisualInspectionPanel.jsx
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, ImagePlus } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

const MAX_IMAGE_WIDTH = 800; // Tamaño máximo de ancho en píxeles
const MAX_IMAGE_HEIGHT = 600; // Tamaño máximo de alto en píxeles
const IMAGE_QUALITY = 0.7; // Calidad de compresión JPEG (0-1)

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
  
  // Estado para mostrar un mensaje de procesamiento
  const [processing, setProcessing] = useState(false);
  
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
  
  // Función para redimensionar y comprimir una imagen
  const processImage = (imageDataUrl) => {
    return new Promise((resolve) => {
      setProcessing(true);
      const img = new Image();
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo la proporción
        let newWidth = img.width;
        let newHeight = img.height;
        
        if (newWidth > MAX_IMAGE_WIDTH) {
          newHeight = (MAX_IMAGE_WIDTH / newWidth) * newHeight;
          newWidth = MAX_IMAGE_WIDTH;
        }
        
        if (newHeight > MAX_IMAGE_HEIGHT) {
          newWidth = (MAX_IMAGE_HEIGHT / newHeight) * newWidth;
          newHeight = MAX_IMAGE_HEIGHT;
        }
        
        // Crear un canvas para redimensionar la imagen
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Dibujar la imagen redimensionada en el canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Convertir a JPEG con la calidad especificada
        const compressedDataUrl = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
        
        setProcessing(false);
        resolve(compressedDataUrl);
      };
      
      img.src = imageDataUrl;
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
      alert('Could not access camera. Please check permissions.');
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
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // Mostrar vista previa
      setPreviewPhoto(dataUrl);
    } catch (error) {
      console.error('Error al capturar la foto:', error);
      alert('Could not capture photo. Please try again.');
    }
  };
  
  // Guardar la foto capturada
  const handleSaveCapturedPhoto = async () => {
    if (!previewPhoto) return;
    
    // Procesar la imagen antes de guardarla
    try {
      const processedImage = await processImage(previewPhoto);
      
      const newPhoto = {
        id: Date.now(),
        src: processedImage,
        caption: `Photo ${(photos?.length || 0) + 1}`,
        type: 'capture',
        timestamp: new Date().toISOString()
      };
      
      dispatch({
        type: 'ADD_PHOTO',
        payload: newPhoto
      });
      
      handleStopCamera();
    } catch (error) {
      console.error('Error processing captured image:', error);
      alert('Error processing image. Please try again.');
    }
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
  const handleFileUpload = async (e) => {
    setProcessing(true);
    const files = e.target.files;
    if (!files || files.length === 0) {
      setProcessing(false);
      return;
    }
    
    const processFile = async (file) => {
      // Verificar que el archivo sea una imagen
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image. Please upload images only.`);
        return null;
      }
      
      // Leer el archivo
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          // Procesar la imagen para reducir tamaño y calidad
          const processedImage = await processImage(event.target.result);
          
          const newPhoto = {
            id: Date.now() + Math.random(), // Garantizar ID único
            src: processedImage,
            caption: file.name,
            type: 'upload',
            timestamp: new Date().toISOString()
          };
          
          resolve(newPhoto);
        };
        reader.readAsDataURL(file);
      });
    };
    
    // Procesar todos los archivos
    const photoPromises = Array.from(files).map(processFile);
    const newPhotos = (await Promise.all(photoPromises)).filter(photo => photo !== null);
    
    // Agregar todas las fotos procesadas al estado
    newPhotos.forEach(photo => {
      dispatch({
        type: 'ADD_PHOTO',
        payload: photo
      });
    });
    
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    e.target.value = '';
    setProcessing(false);
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
              disabled={processing}
            >
              <Camera size={16} className="mr-1" /> 
              {showCamera ? 'Close Camera' : 'Capture Photo'}
            </button>
            
            <button 
              className="btn btn-secondary flex items-center" 
              onClick={handleUploadClick}
              disabled={processing}
            >
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
            
            {/* Indicador de procesamiento */}
            {processing && (
              <div className="flex items-center text-blue-600">
                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing images...
              </div>
            )}
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
          
          {/* Galería de fotos - GRID MEJORADO */}
          <div className="photo-gallery">
            {photos && photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {photos.map((photo, index) => (
                  <div key={photo.id || index} className="photo-item">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 rounded border">
                      <img 
                        src={photo.src} 
                        alt={photo.caption || `Photo ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 truncate">
                        {photo.caption || `Photo ${index + 1}`}
                      </div>
                      <button 
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="photo-empty-state">
                <div className="flex flex-col items-center justify-center py-10 bg-gray-50 border border-dashed border-gray-300 rounded text-gray-500">
                  <ImagePlus size={48} className="mb-3 text-gray-400" />
                  <p className="text-sm mb-2">No photos yet</p>
                  <p className="text-xs">Use the buttons above to capture or upload photos</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Estilos adicionales */}
      <style jsx>{`
        .photo-gallery {
          margin-top: 1rem;
        }
        
        .photo-item {
          break-inside: avoid;
          margin-bottom: 0.75rem;
        }
        
        .aspect-[4/3] {
          position: relative;
          padding-bottom: 75%; /* 4:3 aspect ratio */
          height: 0;
        }
        
        .aspect-[4/3] img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        @media (max-width: 640px) {
          .grid-cols-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default VisualInspectionPanel;
