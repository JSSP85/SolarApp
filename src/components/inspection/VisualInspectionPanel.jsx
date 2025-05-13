// src/components/inspection/VisualInspectionPanel.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Check, ImagePlus, Info } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

// Configuración más agresiva para imágenes más ligeras
const MAX_IMAGE_WIDTH = 500; // Reducido de 800
const MAX_IMAGE_HEIGHT = 375; // Reducido de 600 (mantiene proporción 4:3)
const IMAGE_QUALITY = 0.6; // Reducido de 0.7 para mejor compresión
const THUMB_SIZE = 150; // Tamaño para miniaturas en la interfaz

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
  // Estado para mostrar estadísticas de procesamiento
  const [processStats, setProcessStats] = useState(null);
  
   
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
  
  // Función mejorada para redimensionar y comprimir una imagen
  const processImage = (imageDataUrl) => {
    return new Promise((resolve, reject) => {
      try {
        console.log("Procesando imagen...");
        setProcessing(true);
        
        // Guardar tamaño original para estadísticas
        let originalSize = Math.round(imageDataUrl.length / 1024);
        
        const img = new Image();
        img.onload = () => {
          console.log(`Dimensiones originales: ${img.width}x${img.height}`);
          
          // Calcular nuevas dimensiones manteniendo la proporción
          let newWidth = img.width;
          let newHeight = img.height;
          
          if (newWidth > MAX_IMAGE_WIDTH) {
            newHeight = Math.round((MAX_IMAGE_WIDTH / newWidth) * newHeight);
            newWidth = MAX_IMAGE_WIDTH;
          }
          
          if (newHeight > MAX_IMAGE_HEIGHT) {
            newWidth = Math.round((MAX_IMAGE_HEIGHT / newHeight) * newWidth);
            newHeight = MAX_IMAGE_HEIGHT;
          }
          
          console.log(`Dimensiones nuevas: ${newWidth}x${newHeight}`);
          
          // Crear un canvas para redimensionar la imagen
          const canvas = document.createElement('canvas');
          canvas.width = newWidth;
          canvas.height = newHeight;
          
          // Dibujar la imagen redimensionada en el canvas
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = 'white'; // Fondo blanco
          ctx.fillRect(0, 0, newWidth, newHeight);
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          
          // Convertir a JPEG con la calidad especificada
          const compressedDataUrl = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
          
          // Calcular el nuevo tamaño para estadísticas
          const newSize = Math.round(compressedDataUrl.length / 1024);
          const reduction = Math.round((1 - (newSize / originalSize)) * 100);
          
          console.log(`Tamaño original: ${originalSize}KB, Nuevo tamaño: ${newSize}KB, Reducción: ${reduction}%`);
          
          // Actualizar estadísticas para mostrar al usuario
          setProcessStats({
            originalSize,
            newSize,
            reduction,
            originalDimensions: `${img.width}x${img.height}`,
            newDimensions: `${newWidth}x${newHeight}`
          });
          
          setProcessing(false);
          resolve(compressedDataUrl);
        };
        
        img.onerror = (error) => {
          console.error("Error al cargar la imagen:", error);
          setProcessing(false);
          reject(new Error("No se pudo cargar la imagen"));
        };
        
        img.src = imageDataUrl;
      } catch (error) {
        console.error("Error en procesamiento de imagen:", error);
        setProcessing(false);
        reject(error);
      }
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
        timestamp: new Date().toISOString(),
        dimensions: processStats?.newDimensions || '',
        size: processStats?.newSize || 0
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
      
      // Verificar tamaño máximo (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 10MB.`);
        return null;
      }
      
      // Leer el archivo
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            // Procesar la imagen para reducir tamaño y calidad
            const processedImage = await processImage(event.target.result);
            
            const newPhoto = {
              id: Date.now() + Math.random(), // Garantizar ID único
              src: processedImage,
              caption: file.name,
              type: 'upload',
              timestamp: new Date().toISOString(),
              dimensions: processStats?.newDimensions || '',
              size: processStats?.newSize || 0
            };
            
            resolve(newPhoto);
          } catch (error) {
            console.error(`Error processing image ${file.name}:`, error);
            alert(`Error processing image ${file.name}. Please try another image.`);
            resolve(null);
          }
        };
        reader.onerror = () => {
          console.error(`Error reading file ${file.name}`);
          alert(`Error reading file ${file.name}. Please try another image.`);
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    };
    
    // Procesar todos los archivos
    try {
      const photoPromises = Array.from(files).map(processFile);
      const newPhotos = (await Promise.all(photoPromises)).filter(photo => photo !== null);
      
      // Agregar todas las fotos procesadas al estado
      newPhotos.forEach(photo => {
        dispatch({
          type: 'ADD_PHOTO',
          payload: photo
        });
      });
      
      // Mostrar mensaje de éxito
      if (newPhotos.length > 0) {
        const message = document.createElement('div');
        message.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(16,185,129,0.9);color:white;padding:8px 16px;border-radius:4px;font-size:14px;z-index:9999;box-shadow:0 4px 8px rgba(0,0,0,0.2);';
        message.textContent = `${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''} processed successfully`;
        document.body.appendChild(message);
        setTimeout(() => document.body.removeChild(message), 3000);
      }
    } catch (error) {
      console.error('Error processing photos:', error);
      alert('Error processing photos. Please try again.');
    } finally {
      // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
      e.target.value = '';
      setProcessing(false);
    }
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
          
          {/* Mostrar estadísticas de procesamiento */}
          {processStats && (
            <div className="p-2 mb-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800 flex items-start">
              <Info size={14} className="mr-1 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Image processed</p>
                <p>Original: {processStats.originalDimensions} ({processStats.originalSize}KB)</p>
                <p>Optimized: {processStats.newDimensions} ({processStats.newSize}KB)</p>
                <p>Reduction: {processStats.reduction}%</p>
              </div>
            </div>
          )}
          
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
          
          {/* Galería de fotos mejorada - asegurarse que las clases específicas son usadas */}
          <div>
            {photos && photos.length > 0 ? (
              <div className="inspection-photo-grid">
                {photos.map((photo, index) => (
                  <div key={photo.id || index} className="inspection-photo-item">
                    <div className="inspection-photo-container">
                      <img 
                        src={photo.src} 
                        alt={photo.caption || `Photo ${index + 1}`} 
                        className="inspection-photo-img"
                      />
                      <div className="inspection-photo-caption">
                        {photo.caption || `Photo ${index + 1}`}
                        {photo.dimensions && ` • ${photo.dimensions}`}
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
              <div className="flex flex-col items-center justify-center py-10 bg-gray-50 border border-dashed border-gray-300 rounded text-gray-500">
                <ImagePlus size={48} className="mb-3 text-gray-400" />
                <p className="text-sm mb-2">No photos yet</p>
                <p className="text-xs">Use the buttons above to capture or upload photos</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Estilos adicionales para compatibilidad */}
      <style jsx>{`
        .btn {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn-primary {
          background-color: #4f46e5;
          color: white;
        }
        
        .btn-secondary {
          background-color: #f3f4f6;
          color: #4b5563;
        }
        
        .btn-success {
          background-color: #10b981;
          color: white;
        }
        
        .btn-danger {
          background-color: #ef4444;
          color: white;
        }
        
        .form-control {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
        }
      `}</style>
    </div>
  );
};

export default VisualInspectionPanel;