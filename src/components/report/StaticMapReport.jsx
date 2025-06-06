// src/components/report/StaticMapReport.jsx
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Replica el mapa de Leaflet del SETUP en el REPORT
 * @param {Object} props - Las propiedades del componente
 * @param {Object} props.coords - El objeto de coordenadas con propiedades lat y lng
 */
const StaticMapReport = ({ coords }) => {
  // Coordenadas predeterminadas si no se proporcionan
  const lat = coords?.lat || 40.416775;
  const lng = coords?.lng || -3.703790;
  
  // Usamos una referencia para el contenedor del mapa
  const mapContainerRef = useRef(null);
  // Usamos una referencia para la instancia del mapa
  const mapInstanceRef = useRef(null);
  
  // Generamos un ID único para este contenedor de mapa
  const mapId = React.useMemo(() => `map-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, []);
  
  // Efecto para inicializar el mapa cuando el componente se monta
  useEffect(() => {
    // Esperamos a que el componente esté totalmente montado
    setTimeout(() => {
      // Corrección para los iconos de Leaflet
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      
      // Si ya existe una instancia del mapa, la destruimos
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      
      // Creamos una nueva instancia del mapa
      if (mapContainerRef.current && !mapInstanceRef.current) {
        // Inicializamos el mapa en modo no interactivo
        const map = L.map(mapContainerRef.current, {
          center: [lat, lng],
          zoom: 14,
          zoomControl: false,
          dragging: false,
          touchZoom: false,
          doubleClickZoom: false,
          scrollWheelZoom: false,
          boxZoom: false,
          keyboard: false,
          tap: false
        });
        
        // Guardamos la instancia del mapa en la referencia
        mapInstanceRef.current = map;
        
        // Añadimos la capa de baldosas (tiles)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        // Añadimos un marcador
        L.marker([lat, lng]).addTo(map);
      }
    }, 100); // Pequeño retraso para asegurar que el DOM está listo
    
    // Limpieza al desmontar
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, mapId]); // Incluimos mapId en las dependencias
  
  return (
    <div style={{
      width: '100%',
      marginTop: '8px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#f8fafc'
    }}>
      {/* Encabezado */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid #e5e7eb',
        fontWeight: '600',
        color: '#1f2937',
        backgroundColor: '#f1f5f9',
        textAlign: 'center'
      }}>
        Map
      </div>
      
      {/* Contenedor del mapa */}
      <div 
        id={mapId}
        ref={mapContainerRef} 
        style={{
          height: '180px',
          width: '100%'
        }}
      />
      
      {/* Barra de información de coordenadas */}
      <div style={{
        padding: '8px 12px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        backgroundColor: '#ffffff'
      }}>
        <div>
          <span style={{fontWeight: 'bold'}}>Position:</span> {lat.toFixed(6)}, {lng.toFixed(6)}
        </div>
        <div style={{color: '#3b82f6'}}>
          Custom location
        </div>
      </div>
    </div>
  );
};

export default StaticMapReport;