// src/components/gallery/PhotoGallery.jsx
import React, { useState, useEffect } from 'react';
import { 
  Images, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  User, 
  Package, 
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  AlertTriangle,
  Info,
  Grid3X3,
  List,
  SlidersHorizontal
} from 'lucide-react';
import { 
  getPhotosGroupedByFamily, 
  getGalleryStats, 
  filterPhotos, 
  downloadImage 
} from '../../services/photoGalleryService';
import './PhotoGallery.css';

const PhotoGallery = () => {
  // Estados principales
  const [photosByFamily, setPhotosByFamily] = useState({});
  const [filteredPhotos, setFilteredPhotos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    dateStart: '',
    dateEnd: '',
    componentCode: '',
    componentFamily: '',
    inspector: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados de vista
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedFamily, setSelectedFamily] = useState('all');
  
  // Estados del modal de imagen
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  // Estados de notificaciones
  const [notification, setNotification] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadGalleryData();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    if (Object.keys(photosByFamily).length > 0) {
      const filtered = filterPhotos(photosByFamily, filters);
      setFilteredPhotos(filtered);
    }
  }, [photosByFamily, filters]);

  const loadGalleryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [photos, galleryStats] = await Promise.all([
        getPhotosGroupedByFamily(),
        getGalleryStats()
      ]);
      
      setPhotosByFamily(photos);
      setFilteredPhotos(photos);
      setStats(galleryStats);
      
    } catch (err) {
      console.error('Error loading gallery data:', err);
      setError('Failed to load photo gallery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateStart: '',
      dateEnd: '',
      componentCode: '',
      componentFamily: '',
      inspector: '',
      status: ''
    });
  };

  const openPhotoModal = (photo) => {
    setSelectedPhoto(photo);
    setShowModal(true);
    setZoomLevel(1);
    setRotation(0);
  };

  const closePhotoModal = () => {
    setShowModal(false);
    setSelectedPhoto(null);
    setZoomLevel(1);
    setRotation(0);
  };

  const handleDownload = async (photo) => {
    try {
      const success = await downloadImage(photo);
      if (success) {
        showNotification('Image downloaded successfully!', 'success');
      } else {
        showNotification('Failed to download image. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Download error:', error);
      showNotification('Failed to download image. Please try again.', 'error');
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pass': { label: 'ACCEPTED', class: 'status-accepted', icon: Check },
      'reject': { label: 'REJECTED', class: 'status-rejected', icon: AlertTriangle },
      'in-progress': { label: 'IN PROGRESS', class: 'status-progress', icon: Info }
    };
    
    const config = statusConfig[status] || statusConfig['in-progress'];
    const IconComponent = config.icon;
    
    return (
      <span className={`status-badge ${config.class}`}>
        <IconComponent size={12} />
        {config.label}
      </span>
    );
  };

  const getTotalPhotosCount = () => {
    return Object.values(filteredPhotos).reduce((total, photos) => total + photos.length, 0);
  };

  const getFamilyNames = () => {
    return Object.keys(photosByFamily).sort();
  };

  const getDisplayPhotos = () => {
    if (selectedFamily === 'all') {
      return filteredPhotos;
    }
    
    return selectedFamily in filteredPhotos 
      ? { [selectedFamily]: filteredPhotos[selectedFamily] }
      : {};
  };

  if (loading) {
    return (
      <div className="gallery-container">
        <div className="gallery-loading">
          <div className="loading-spinner"></div>
          <h3>Loading Photo Gallery...</h3>
          <p>Organizing photos by component family</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-container">
        <div className="gallery-error">
          <AlertTriangle size={48} />
          <h3>Error Loading Gallery</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={loadGalleryData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const displayPhotos = getDisplayPhotos();
  const totalPhotos = getTotalPhotosCount();

  return (
    <div className="gallery-container">
      {/* Header con estadísticas */}
      <div className="gallery-header">
        <div className="header-content">
          <div className="title-section">
            <Images size={32} className="gallery-icon" />
            <div>
              <h1>Photo Gallery</h1>
              <p>Organized by Component Family</p>
            </div>
          </div>
          
          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{stats.totalFamilies}</div>
                <div className="stat-label">Families</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{totalPhotos}</div>
                <div className="stat-label">Photos</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{Object.keys(displayPhotos).length}</div>
                <div className="stat-label">Showing</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="gallery-toolbar">
        <div className="toolbar-left">
          {/* Filtro por familia */}
          <select 
            value={selectedFamily} 
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="family-selector"
          >
            <option value="all">All Families</option>
            {getFamilyNames().map(family => (
              <option key={family} value={family}>{family}</option>
            ))}
          </select>
          
          {/* Botón de filtros */}
          <button
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>
        </div>
        
        <div className="toolbar-right">
          {/* Cambio de vista */}
          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Date Range</label>
              <div className="date-range">
                <input
                  type="date"
                  value={filters.dateStart}
                  onChange={(e) => handleFilterChange('dateStart', e.target.value)}
                  placeholder="Start date"
                />
                <input
                  type="date"
                  value={filters.dateEnd}
                  onChange={(e) => handleFilterChange('dateEnd', e.target.value)}
                  placeholder="End date"
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Component Code</label>
              <input
                type="text"
                value={filters.componentCode}
                onChange={(e) => handleFilterChange('componentCode', e.target.value)}
                placeholder="Search by component code..."
              />
            </div>
            
            <div className="filter-group">
              <label>Inspector</label>
              <input
                type="text"
                value={filters.inspector}
                onChange={(e) => handleFilterChange('inspector', e.target.value)}
                placeholder="Search by inspector..."
              />
            </div>
            
            <div className="filter-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pass">Accepted</option>
                <option value="reject">Rejected</option>
                <option value="in-progress">In Progress</option>
              </select>
            </div>
          </div>
          
          <div className="filters-actions">
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="gallery-content">
        {totalPhotos === 0 ? (
          <div className="empty-state">
            <Images size={64} className="empty-icon" />
            <h3>No Photos Found</h3>
            <p>Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          Object.entries(displayPhotos).map(([family, photos]) => (
            <div key={family} className="family-section">
              <div className="family-header">
                <h2>{family}</h2>
                <span className="photo-count">{photos.length} photos</span>
              </div>
              
              <div className={`photos-container ${viewMode}`}>
                {photos.map((photo) => (
                  <div key={photo.id} className="photo-card">
                    <div className="photo-image-container">
                      <img
                        src={photo.src}
                        alt={photo.caption}
                        className="photo-image"
                        onClick={() => openPhotoModal(photo)}
                        loading="lazy"
                      />
                      <div className="photo-overlay">
                        <button
                          className="overlay-btn view-btn"
                          onClick={() => openPhotoModal(photo)}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="overlay-btn download-btn"
                          onClick={() => handleDownload(photo)}
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="photo-info">
                      <div className="photo-meta">
                        <h4>{photo.componentName}</h4>
                        <p className="component-code">{photo.componentCode}</p>
                      </div>
                      
                      <div className="photo-details">
                        <div className="detail-item">
                          <Calendar size={14} />
                          <span>{photo.inspectionDate}</span>
                        </div>
                        <div className="detail-item">
                          <User size={14} />
                          <span>{photo.inspector}</span>
                        </div>
                      </div>
                      
                      <div className="photo-status">
                        {getStatusBadge(photo.inspectionStatus)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de imagen */}
      {showModal && selectedPhoto && (
        <div className="photo-modal" onClick={closePhotoModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <h3>{selectedPhoto.componentName}</h3>
                <p>{selectedPhoto.componentCode}</p>
              </div>
              
              <div className="modal-controls">
                <button
                  className="modal-control-btn"
                  onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                >
                  <ZoomOut size={18} />
                </button>
                
                <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                
                <button
                  className="modal-control-btn"
                  onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                >
                  <ZoomIn size={18} />
                </button>
                
                <button
                  className="modal-control-btn"
                  onClick={() => setRotation(prev => prev + 90)}
                >
                  <RotateCcw size={18} />
                </button>
                
                <button
                  className="modal-control-btn download"
                  onClick={() => handleDownload(selectedPhoto)}
                >
                  <Download size={18} />
                </button>
                
                <button className="modal-close-btn" onClick={closePhotoModal}>
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="modal-image-container">
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.caption}
                className="modal-image"
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease'
                }}
              />
            </div>
            
            <div className="modal-footer">
              <div className="photo-meta-details">
                <div className="meta-item">
                  <strong>Inspector:</strong> {selectedPhoto.inspector}
                </div>
                <div className="meta-item">
                  <strong>Date:</strong> {selectedPhoto.inspectionDate}
                </div>
                <div className="meta-item">
                  <strong>Status:</strong> {getStatusBadge(selectedPhoto.inspectionStatus)}
                </div>
                {selectedPhoto.dimensions && (
                  <div className="meta-item">
                    <strong>Dimensions:</strong> {selectedPhoto.dimensions}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notificaciones */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;