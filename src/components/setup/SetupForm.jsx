// src/components/setup/SetupForm.jsx
import React, { useState, useEffect } from 'react';
import { ChevronRight, Settings, Info, AlertTriangle } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { calculateSample } from '../../utils/samplePlanHelper';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrección para los iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SetupForm = () => {
  // Usar el contexto real en lugar de un estado local
  const { state, dispatch, validateRequiredFields } = useInspection();
  
  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const [mapCoords, setMapCoords] = useState({ lat: 40.416775, lng: -3.703790 });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Map reference to control the view programmatically
  const mapRef = React.useRef(null);
  
  // Manejadores de eventos
  const handleInputChange = (field, value) => {
    dispatch({
      type: 'UPDATE_SETUP_FIELD',
      payload: { field, value }
    });
    
    // Limpiar errores de validación cuando el usuario empiece a llenar campos
    if (validationError) {
      setValidationError('');
    }
    
    // Calculate sample size when batch quantity changes
    if (field === 'batchQuantity' && value) {
      const sampleInfo = calculateSample(parseInt(value));
      dispatch({
        type: 'UPDATE_SETUP_FIELD',
        payload: { field: 'sampleInfo', value: sampleInfo }
      });
    }
    
    // Update component name when component code changes
    if (field === 'componentCode') {
      const selectedComponent = state.availableComponentCodes?.find(comp => comp.code === value);
      if (selectedComponent) {
        dispatch({
          type: 'UPDATE_SETUP_FIELD',
          payload: { field: 'componentName', value: selectedComponent.name }
        });
      }
    }
  };
  
  const handleNextStep = () => {
    // Validar campos requeridos usando la función del contexto
    const validation = validateRequiredFields();
    
    if (!validation.isValid) {
      const errorMessage = `Please complete the following required fields:\n\n• ${validation.missingFields.join('\n• ')}`;
      setValidationError(errorMessage);
      
      // Mostrar alerta también
      alert(errorMessage);
      return;
    }
    
    // Si todo está correcto, proceder a inspection
    setValidationError('');
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'inspection' });
  };

  // Función para obtener geocodificación inversa limitando a Italia
  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      // Usar el servicio de geocodificación inversa de Nominatim con parámetros para Italia
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&countrycodes=it`
      );
      const data = await response.json();
      
      console.log("Geocodificación inversa:", data); // Para depuración
      
      if (data.address) {
        // Forzar Italia como país
        dispatch({
          type: 'UPDATE_SETUP_FIELD',
          payload: { field: 'inspectionCountry', value: 'Italia' }
        });
        
        // Actualizar la ciudad con mejor detección de varios tipos de localidades
        const city = data.address.city || 
                    data.address.town || 
                    data.address.village || 
                    data.address.municipality ||
                    '';
        
        dispatch({
          type: 'UPDATE_SETUP_FIELD',
          payload: { field: 'inspectionCity', value: city }
        });
        
        // Crear una dirección más detallada
        const addressParts = [];
        if (data.address.road) addressParts.push(data.address.road);
        if (data.address.house_number) addressParts.push(data.address.house_number);
        if (data.address.suburb) addressParts.push(data.address.suburb);
        if (data.address.postcode) addressParts.push(data.address.postcode);
        if (data.address.county) addressParts.push(data.address.county);
        
        const formattedAddress = addressParts.length > 1 
          ? addressParts.join(', ') 
          : data.display_name;
        
        // Añadir un retraso para asegurar que la actualización se completa
        setTimeout(() => {
          dispatch({
            type: 'UPDATE_SETUP_FIELD',
            payload: { field: 'inspectionAddress', value: formattedAddress }
          });
        }, 100);
        
        // Intentar actualizar también el nombre del sitio con la información disponible
        if (!state.inspectionSite && data.address.amenity) {
          dispatch({
            type: 'UPDATE_SETUP_FIELD',
            payload: { field: 'inspectionSite', value: data.address.amenity }
          });
        }
      }
    } catch (error) {
      console.error("Error en geocodificación inversa:", error);
    }
  };
  
  // Función para buscar lugares por nombre usando Nominatim solo para Italia
  const searchPlaceByName = async (placeName) => {
    if (!placeName) return;
    
    setIsSearching(true);
    setShowSearchResults(true);
    
    try {
      // Usar Nominatim para buscar el lugar por nombre, limitando a Italia
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}&countrycodes=it&limit=8&addressdetails=1`
      );
      const data = await response.json();
      
      console.log("Resultados de búsqueda:", data); // Para depuración
      
      setSearchResults(data);
      setIsSearching(false);
      
      // Si solo hay un resultado, seleccionarlo automáticamente
      if (data.length === 1) {
        selectSearchResult(data[0]);
      }
    } catch (error) {
      console.error("Error buscando el lugar:", error);
      setIsSearching(false);
      setSearchResults([]);
    }
  };
  
  // Función para seleccionar un resultado de búsqueda
  const selectSearchResult = (result) => {
    if (!result) return;
    
    console.log("Seleccionando resultado:", result); // Para depuración
    
    // Actualizar las coordenadas del mapa
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setMapCoords({ 
      lat: lat, 
      lng: lng 
    });
    
    // Guardar coordenadas en el contexto global
    dispatch({
      type: 'UPDATE_MAP_COORDS',
      payload: { lat, lng }
    });
    
    // Center the map on the selected location
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 13);
    }
    
    // Actualizar el nombre del sitio con el nombre seleccionado si está vacío
    if (!state.inspectionSite) {
      const siteName = result.name || result.display_name.split(',')[0];
      dispatch({
        type: 'UPDATE_SETUP_FIELD',
        payload: { field: 'inspectionSite', value: siteName }
      });
    }
    
    // Actualizar campos de dirección
    dispatch({
      type: 'UPDATE_SETUP_FIELD',
      payload: { field: 'inspectionCountry', value: 'Italia' } // Forzar Italia como país
    });
    
    // Determinar la ciudad correctamente
    let city = '';
    if (result.address) {
      city = result.address.city || 
             result.address.town || 
             result.address.village || 
             result.address.municipality ||
             '';
      
      // Actualizar campo de ciudad
      dispatch({
        type: 'UPDATE_SETUP_FIELD',
        payload: { field: 'inspectionCity', value: city }
      });
      
      // Crear una dirección formateada más detallada
      const addressParts = [];
      
      // Incluir detalles adicionales específicos de Italia
      if (result.address.road) addressParts.push(result.address.road);
      if (result.address.house_number) addressParts.push(result.address.house_number);
      if (result.address.suburb) addressParts.push(result.address.suburb);
      if (result.address.postcode) addressParts.push(result.address.postcode);
      if (result.address.county) addressParts.push(result.address.county);
      
      // Si no hay suficientes datos, usar la dirección completa
      const formattedAddress = addressParts.length > 1 
        ? addressParts.join(', ') 
        : result.display_name;
      
      // Actualizar la dirección con un retraso para asegurar que se aplica
      setTimeout(() => {
        dispatch({
          type: 'UPDATE_SETUP_FIELD',
          payload: { field: 'inspectionAddress', value: formattedAddress }
        });
      }, 100);
    } else {
      // Si no hay datos de dirección detallados, usar la dirección completa
      dispatch({
        type: 'UPDATE_SETUP_FIELD',
        payload: { field: 'inspectionAddress', value: result.display_name }
      });
    }
    
    // Ocultar resultados después de seleccionar
    setShowSearchResults(false);
  };

  // Función para usar la ubicación actual
  const useMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setMapCoords({ lat, lng });
          
          // Guardar coordenadas en el contexto global
          dispatch({
            type: 'UPDATE_MAP_COORDS',
            payload: { lat, lng }
          });
          
          // Center the map on the new location
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 13);
            console.log("Map view updated to:", lat, lng);
          }
          
          fetchAddressFromCoords(lat, lng);
        },
        (error) => {
          console.error("Error obtaining location:", error);
          alert("Could not get your location. Please verify that location services are enabled.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Componente para manejar eventos del mapa
  const LocationMarker = () => {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setMapCoords({ lat, lng });
        
        // Guardar coordenadas en el contexto global
        dispatch({
          type: 'UPDATE_MAP_COORDS',
          payload: { lat, lng }
        });
        
        fetchAddressFromCoords(lat, lng);
      },
      load() {
        // Store map reference when loaded
        mapRef.current = map;
      }
    });

    return mapCoords ? (
      <Marker position={[mapCoords.lat, mapCoords.lng]} />
    ) : null;
  };
  
  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3 className="card-title">Inspection Setup</h3>
      </div>
      
      <div className="card-body">
        {/* Mostrar errores de validación */}
        {validationError && (
          <div style={{
            background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
            border: '2px solid #f87171',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <AlertTriangle size={20} style={{ color: '#dc2626', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <h4 style={{ color: '#dc2626', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                Missing Required Fields
              </h4>
              <div style={{ color: '#991b1b', fontSize: '14px', whiteSpace: 'pre-line' }}>
                {validationError}
              </div>
            </div>
          </div>
        )}

        {/* Two-column container */}
        <div className="cards-grid-2">
          {/* LEFT COLUMN: Component Information */}
          <div className="dashboard-card">
            <div className="card-header" style={{background: 'linear-gradient(to right, #5a67d8, #6875f5)'}}>
              <h3 className="card-title" style={{color: 'white'}}>
                Component Information
              </h3>
            </div>
            
            <div className="card-body">
              {/* NUEVO CAMPO: Client */}
              <div className="form-group">
                <label className="form-label">
                  Client
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter client name"
                  value={state.client || ''}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                />
              </div>
              
              {/* Project */}
              <div className="form-group">
                <label className="form-label">
                  Project Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter project name"
                  value={state.projectName || ''}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                />
              </div>
              
              {/* Component Family */}
              <div className="form-group">
                <label className="form-label">
                  Component Family 
                  <span style={{color: '#e53e3e', marginLeft: '4px'}}>*</span>
                </label>
                <div style={{position: 'relative'}}>
                  <select
                    className="form-control"
                    value={state.componentFamily || ''}
                    onChange={(e) => handleInputChange('componentFamily', e.target.value)}
                  >
                    <option value="">Select a family</option>
                    {(state.availableComponentFamilies || []).map((family, index) => (
                      <option key={index} value={family}>{family}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Component Code */}
              <div className="form-group">
                <label className="form-label">
                  Component Code 
                  <span style={{color: '#e53e3e', marginLeft: '4px'}}>*</span>
                </label>
                <div style={{position: 'relative'}}>
                  <select
                    className="form-control"
                    value={state.componentCode || ''}
                    onChange={(e) => handleInputChange('componentCode', e.target.value)}
                    disabled={!state.componentFamily}
                  >
                    <option value="">Select a code</option>
                    {(state.availableComponentCodes || []).map((comp, index) => (
                      <option key={index} value={comp.code}>{comp.code}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Component Name */}
              <div className="form-group">
                <label className="form-label">
                  Component Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{backgroundColor: '#f8fafc'}}
                  placeholder="Name will be automatically filled"
                  value={state.componentName || ''}
                  readOnly
                />
              </div>
              
              {/* Surface Protection */}
              <div className="form-group">
                <label className="form-label">
                  Surface Protection 
                  <span style={{color: '#e53e3e', marginLeft: '4px'}}>*</span>
                </label>
                <div style={{position: 'relative'}}>
                  <select
                    className="form-control"
                    value={state.surfaceProtection || ''}
                    onChange={(e) => handleInputChange('surfaceProtection', e.target.value)}
                  >
                    <option value="">Select surface protection</option>
                    <option value="Z275">Z275 - According to EN 10346:2015</option>
                    <option value="Z450">Z450 - According to EN 10346:2015</option>
                    <option value="Z600">Z600 - According to EN 10346:2015</option>
                    <option value="Z725">Z725 - According to EN 10346:2015</option>
                    <option value="Z800">Z800 - According to EN 10346:2015</option>
                    <option value="ISO1461">Hot-dip Galvanized according to ISO1461</option>
                    <option value="special coating">Hot-dip Galvanized (special coating)</option>
                  </select>
                </div>
              </div>
              
              {/* Additional fields based on protection */}
              {state.surfaceProtection === 'ISO1461' && (
                <div className="form-group">
                  <label className="form-label">
                    Material Thickness (mm)
                    <span style={{color: '#e53e3e', marginLeft: '4px'}}>*</span>
                  </label>
                  <div style={{position: 'relative'}}>
                    <select
                      className="form-control"
                      value={state.thickness || ''}
                      onChange={(e) => handleInputChange('thickness', e.target.value)}
                    >
                      <option value="">Select thickness</option>
                      <option value="1.0">≤ 1.5 mm</option>
                      <option value="2.0">&gt; 1.5 mm - 3 mm</option>
                      <option value="4.0">&gt; 3 mm - 6 mm</option>
                      <option value="7.0">&gt; 6 mm</option>
                    </select>
                  </div>
                </div>
              )}
              
              {/* Special Coating Value field */}
              {state.surfaceProtection === 'special coating' && (
                <div className="form-group">
                  <label className="form-label">
                    Special Coating Value (µm)
                    <span style={{color: '#e53e3e', marginLeft: '4px'}}>*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter required coating value"
                    value={state.specialCoating || ''}
                    onChange={(e) => handleInputChange('specialCoating', e.target.value)}
                    step="1"
                    min="0"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    This value will be used as the minimum average requirement for coating measurements.
                  </div>
                </div>
              )}
              
              {/* Batch Quantity */}
              <div className="form-group">
                <label className="form-label">
                  Batch Quantity 
                  <span style={{color: '#e53e3e', marginLeft: '4px'}}>*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter batch quantity"
                  value={state.batchQuantity || ''}
                  onChange={(e) => handleInputChange('batchQuantity', e.target.value)}
                  min="1"
                />
              </div>
              
              {/* Sampling Information */}
              {state.sampleInfo && (
                <div style={{background: '#ebf8ff', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', marginTop: '16px', border: '1px solid #bee3f8'}}>
                  <div style={{color: '#3182ce', marginRight: '8px'}}>
                    <Info size={18} />
                  </div>
                  <div>
                    <p style={{fontWeight: '500', color: '#2c5282', margin: '0 0 4px 0'}}>Sampling Plan:</p>
                    <p style={{color: '#3182ce', margin: '0'}}>{state.sampleInfo}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* RIGHT COLUMN: Inspection Information */}
          <div className="dashboard-card">
            <div className="card-header" style={{background: 'linear-gradient(to right, #667eea, #764ba2)'}}>
              <h3 className="card-title" style={{color: 'white'}}>
                Inspection Information
              </h3>
            </div>
            
            <div className="card-body">
              {/* Inspector Name */}
              <div className="form-group">
                <label className="form-label">
                  Inspector Name 
                  <span style={{color: '#e53e3e', marginLeft: '4px'}}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter inspector name"
                  value={state.inspector || ''}
                  onChange={(e) => handleInputChange('inspector', e.target.value)}
                />
              </div>
              
              {/* Inspection Date */}
              <div className="form-group">
                <label className="form-label">
                  Inspection Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={state.inspectionDate || ''}
                  onChange={(e) => handleInputChange('inspectionDate', e.target.value)}
                />
              </div>

              {/* NUEVO CAMPO: Supplier Name */}
              <div className="form-group">
                <label className="form-label">
                  Supplier Name
                  <span style={{color: '#e53e3e', marginLeft: '4px'}}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter supplier name where inspection is performed"
                  value={state.supplierName || ''}
                  onChange={(e) => handleInputChange('supplierName', e.target.value)}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Name of the supplier where the inspection is being performed.
                </div>
              </div>
              
              {/* Inspection Location */}
              <div className="form-group">
                <label className="form-label">
                  Inspection Location
                </label>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Country"
                    value={state.inspectionCountry || ''}
                    onChange={(e) => handleInputChange('inspectionCountry', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="City"
                    value={state.inspectionCity || ''}
                    onChange={(e) => handleInputChange('inspectionCity', e.target.value)}
                  />
                </div>
              </div>
              
              {/* Additional location details with toggle */}
              <div className="form-group">
                <button 
                  className="btn btn-secondary"
                  style={{background: 'transparent', color: '#5a67d8', boxShadow: 'none', fontWeight: '500'}}
                  onClick={() => setShowLocationDetails(!showLocationDetails)}
                >
                  <ChevronRight size={16} style={{
                    marginRight: '4px',
                    transform: showLocationDetails ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }} />
                  {showLocationDetails ? "Hide additional details" : "Show additional details"}
                </button>
                
                {showLocationDetails && (
                  <div style={{marginTop: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                    <div className="relative mb-2">
                      <input
                        type="text"
                        className="form-control pr-10"
                        placeholder="Site name (plant, factory, warehouse)"
                        value={state.inspectionSite || ''}
                        onChange={(e) => handleInputChange('inspectionSite', e.target.value)}
                      />
                      <button 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
                        onClick={() => searchPlaceByName(state.inspectionSite)}
                        title="Search this place"
                        disabled={!state.inspectionSite}
                        style={{
                          opacity: state.inspectionSite ? 1 : 0.5,
                          cursor: state.inspectionSite ? 'pointer' : 'not-allowed'
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </button>
                    </div>
                    
                    {/* Mostrar resultados de búsqueda */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div style={{
                        marginTop: '12px', 
                        background: 'white', 
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 50
                      }}>
                        <div style={{
                          padding: '8px 12px', 
                          borderBottom: '1px solid #e2e8f0', 
                          fontWeight: '500',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>Risultati di ricerca in Italia</span>
                          <span style={{fontSize: '12px', color: '#6b7280'}}>
                            {searchResults.length} risultati
                          </span>
                        </div>
                        <ul style={{padding: '0', margin: '0', listStyle: 'none'}}>
                          {searchResults.map((result, index) => (
                            <li 
                              key={index}
                              style={{
                                padding: '10px 12px',
                                borderBottom: index < searchResults.length - 1 ? '1px solid #e2e8f0' : 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                              }}
                              className="hover:bg-blue-50"
                              onClick={() => selectSearchResult(result)}
                            >
                              <div style={{fontWeight: '500'}}>{result.name || result.display_name.split(',')[0]}</div>
                              <div style={{fontSize: '12px', color: '#6b7280'}}>{result.display_name}</div>
                              {result.address && (
                                <div style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: '4px',
                                  marginTop: '4px',
                                  fontSize: '11px'
                                }}>
                                  {result.address.postcode && (
                                    <span style={{
                                      background: '#e5e7eb',
                                      padding: '1px 6px',
                                      borderRadius: '4px'
                                    }}>
                                      {result.address.postcode}
                                    </span>
                                  )}
                                  {(result.address.city || result.address.town || result.address.village) && (
                                    <span style={{
                                      background: '#dbeafe',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      color: '#1e40af'
                                    }}>
                                      {result.address.city || result.address.town || result.address.village}
                                    </span>
                                  )}
                                  {result.address.county && (
                                    <span style={{
                                      background: '#e0e7ff',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      color: '#3730a3'
                                    }}>
                                      {result.address.county}
                                    </span>
                                  )}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="relative mb-2">
                      <textarea
                        className="form-control mb-2"
                        placeholder="Detailed address or coordinates"
                        value={state.inspectionAddress || ''}
                        onChange={(e) => handleInputChange('inspectionAddress', e.target.value)}
                        rows="2"
                      ></textarea>
                      {isSearching && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* OpenStreetMap con Leaflet */}
                    <div style={{borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', marginTop: '8px'}}>
                      <div style={{background: 'linear-gradient(to right, #667eea, #764ba2)', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <span style={{color: 'white', fontWeight: '500', display: 'flex', alignItems: 'center'}}>
                          Select location on map
                        </span>
                        <button 
                          className="btn"
                          style={{color: 'white', background: 'rgba(255,255,255,0.2)', fontSize: '12px', padding: '4px 8px'}}
                          onClick={useMyLocation}
                        >
                          <span style={{display: 'flex', alignItems: 'center'}}>
                            Use my location
                          </span>
                        </button>
                      </div>
                      
                      {/* Contenedor del mapa */}
                      <div style={{ height: '300px', width: '100%' }}>
                        <MapContainer 
                          center={[mapCoords.lat, mapCoords.lng]} 
                          zoom={13} 
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <LocationMarker />
                        </MapContainer>
                      </div>
                      
                      <div style={{
                        padding: '8px', 
                        background: 'white',
                        fontSize: '12px'
                      }}>
                        Lat: {mapCoords.lat.toFixed(6)}, Lng: {mapCoords.lng.toFixed(6)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Next button */}
        <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end'}}>
          <button
            className="btn btn-primary"
            onClick={handleNextStep}
            style={{display: 'flex', alignItems: 'center', padding: '8px 16px'}}
          >
            <span style={{fontWeight: '500', marginRight: '8px'}}>
              Continue to Inspection
            </span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupForm;