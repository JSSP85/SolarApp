// src/components/magazzino/MovimentiRegistry.jsx
import React, { useState, useEffect } from 'react';
import {
  List,
  Search,
  Calendar,
  User,
  Package,
  TrendingUp,
  TrendingDown,
  Filter,
  RefreshCw,
  Clock,
  Activity,
  Trash2,
  X
} from 'lucide-react';
import { getMovimenti, getMovimentiStats, getAllArticoli, deleteMovimento } from '../../firebase/magazzinoService';

const MovimentiRegistry = () => {
  const [movements, setMovements] = useState([]);
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [articoli, setArticoli] = useState([]);
  const [articoliMap, setArticoliMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    searchTerm: '',
    dateRange: 'today',
    operatore: '',
    tipo: ''
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    loadData();
    
    const interval = setInterval(() => {
      loadData(true); // Silent refresh
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Apply filters when movements or filters change
  useEffect(() => {
    applyFilters();
  }, [movements, filters]);

  // Load movements and articles from Firebase
  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      // Load articles first (for descriptions)
      const articlesData = await getAllArticoli();
      setArticoli(articlesData);
      
      // Create Map for fast lookup: codice -> articolo
      const map = new Map();
      articlesData.forEach(art => {
        map.set(art.codice, art);
      });
      setArticoliMap(map);
      
      // Then load movements
      await loadMovements(true);
      
      if (!silent) setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  // Load movements from Firebase
  const loadMovements = async (skipLoading = false) => {
    try {
      // Calculate date range
      const now = new Date();
      let dataInizio = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          dataInizio.setHours(0, 0, 0, 0);
          break;
        case 'week':
          dataInizio.setDate(now.getDate() - 7);
          break;
        case 'month':
          dataInizio.setMonth(now.getMonth() - 1);
          break;
        case 'all':
          dataInizio = null;
          break;
        default:
          dataInizio.setHours(0, 0, 0, 0);
      }
      
      // Get movements
      const movData = await getMovimenti({
        dataInizio: dataInizio,
        dataFine: now,
        limit: 100
      });
      
      // Get stats
      const statsData = await getMovimentiStats(
        dataInizio || new Date(0),
        now
      );
      
      setMovements(movData);
      setStats(statsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading movements:', error);
    }
  };

  // Apply filters to movements
  const applyFilters = () => {
    let filtered = [...movements];
    
    // Search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(mov => {
        const articolo = articoliMap.get(mov.codice_articolo);
        const descrizione = articolo?.descrizione || '';
        
        return mov.codice_articolo?.toLowerCase().includes(term) ||
               descrizione.toLowerCase().includes(term) ||
               mov.operatore?.toLowerCase().includes(term) ||
               mov.motivo?.toLowerCase().includes(term);
      });
    }
    
    // Operator filter
    if (filters.operatore) {
      filtered = filtered.filter(mov => mov.operatore === filters.operatore);
    }
    
    // Type filter
    if (filters.tipo) {
      filtered = filtered.filter(mov => mov.tipo === filters.tipo);
    }
    
    setFilteredMovements(filtered);
  };

  // Get unique operators
  const getOperators = () => {
    const operators = [...new Set(movements.map(m => m.operatore))];
    return operators.filter(o => o);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // If less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }
    
    // If less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    }
    
    // If today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // Otherwise full date
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get article description
  const getArticleDescription = (codice) => {
    const articolo = articoliMap.get(codice);
    return articolo?.descrizione || 'No description';
  };

  // Handle delete movement
  const handleDeleteMovement = async (movimentoId) => {
    try {
      setDeletingId(movimentoId);
      await deleteMovimento(movimentoId);
      
      // Refresh movements
      await loadData(true);
      
      setConfirmDelete(null);
      setDeletingId(null);
    } catch (error) {
      console.error('Error deleting movement:', error);
      alert('Error deleting movement. Please try again.');
      setDeletingId(null);
    }
  };

  return (
    <>
      {/* Stats Header Card */}
      {stats && (
        <div className="wms-panel-card" style={{ marginBottom: '2rem' }}>
          <div className="wms-panel-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div>
                <h2 className="wms-panel-title">
                  <Activity size={24} />
                  Movement Statistics
                </h2>
                <p className="wms-panel-subtitle">Real-time warehouse activity overview</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  className="wms-btn wms-btn-primary" 
                  onClick={() => loadData()}
                  disabled={loading}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  <RefreshCw size={16} className={loading ? 'wms-spinner' : ''} />
                  Refresh
                </button>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  color: '#6b7280'
                }}>
                  <Clock size={14} />
                  {formatTime(lastUpdate)}
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ padding: '1.5rem 2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <List size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>Total Movements</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>{stats.totale}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <TrendingUp size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>Entries</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{stats.entrate}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <TrendingDown size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>Exits</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{stats.uscite}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <User size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>Operators</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>{stats.operatori.length}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Package size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>Articles Modified</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>{stats.articoli_modificati}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Card */}
      <div className="wms-panel-card" style={{ marginBottom: '2rem' }}>
        <div className="wms-panel-header">
          <h2 className="wms-panel-title">
            <Filter size={24} />
            Search & Filters
          </h2>
        </div>
        
        <div style={{ padding: '2rem' }}>
          {/* Search Box */}
          <div className="wms-search-box">
            <Search size={18} className="wms-search-icon" />
            <input
              type="text"
              placeholder="Search by code, description, operator, or reason..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="wms-search-input"
            />
          </div>

          {/* Filter Row */}
          <div className="wms-filter-row">
            <div className="wms-filter-item">
              <Calendar size={16} />
              <select
                value={filters.dateRange}
                onChange={(e) => {
                  setFilters({ ...filters, dateRange: e.target.value });
                  setTimeout(() => loadMovements(), 100);
                }}
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last Month</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div className="wms-filter-item">
              <User size={16} />
              <select
                value={filters.operatore}
                onChange={(e) => setFilters({ ...filters, operatore: e.target.value })}
              >
                <option value="">All Operators</option>
                {getOperators().map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>

            <div className="wms-filter-item">
              <Filter size={16} />
              <select
                value={filters.tipo}
                onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="ENTRATA">Entry</option>
                <option value="USCITA">Exit</option>
                <option value="AGGIUSTAMENTO">Adjustment</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Movements List */}
      <div className="wms-panel-card">
        <div className="wms-panel-header">
          <h2 className="wms-panel-title">
            <List size={24} />
            Movement History
          </h2>
          <p className="wms-panel-subtitle">
            Showing {filteredMovements.length} movement{filteredMovements.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={{ padding: '2rem' }}>
          {loading ? (
            <div className="wms-loading-state">
              <div className="wms-spinner"></div>
              <p>Loading movements...</p>
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="wms-empty-state">
              <List size={64} />
              <h3>No Movements Found</h3>
              <p>No warehouse activity matches your current filters</p>
            </div>
          ) : (
            <div className="wms-movements-grid">
              {filteredMovements.map((mov, idx) => (
                <div key={mov.firebaseId || idx} className="wms-movement-card" style={{ position: 'relative' }}>
                  {/* Delete Button */}
                  <button
                    onClick={() => setConfirmDelete(mov.firebaseId)}
                    disabled={deletingId === mov.firebaseId}
                    style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      cursor: deletingId === mov.firebaseId ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      opacity: deletingId === mov.firebaseId ? 0.5 : 1
                    }}
                    onMouseOver={(e) => {
                      if (deletingId !== mov.firebaseId) {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.borderColor = '#ef4444';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    }}
                    title="Delete this movement notification"
                  >
                    {deletingId === mov.firebaseId ? (
                      <div className="wms-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                    ) : (
                      <Trash2 size={16} style={{ color: '#ef4444' }} />
                    )}
                  </button>

                  <div className="wms-movement-header" style={{ paddingRight: '3rem' }}>
                    <div>
                      {mov.tipo === 'ENTRATA' ? (
                        <span className="wms-type-badge entry">
                          <TrendingUp size={14} />
                          ENTRY
                        </span>
                      ) : mov.tipo === 'USCITA' ? (
                        <span className="wms-type-badge exit">
                          <TrendingDown size={14} />
                          EXIT
                        </span>
                      ) : (
                        <span className="wms-type-badge adjustment">
                          <RefreshCw size={14} />
                          ADJUSTMENT
                        </span>
                      )}
                    </div>
                    <div className="wms-movement-time">{formatTime(mov.timestamp)}</div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <code className="wms-article-code">{mov.codice_articolo}</code>
                      <div style={{ textAlign: 'right' }}>
                        <div className={`wms-quantity-value ${mov.quantita > 0 ? 'positive' : 'negative'}`}>
                          {mov.quantita > 0 ? '+' : ''}{mov.quantita}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>units</div>
                      </div>
                    </div>
                    
                    {/* COMPONENT DESCRIPTION - NEW! */}
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: '#1f2937',
                      fontWeight: 500,
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      background: '#f9fafb',
                      borderRadius: '6px',
                      borderLeft: '3px solid #0077a2'
                    }}>
                      {getArticleDescription(mov.codice_articolo)}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <User size={14} style={{ color: '#6b7280' }} />
                      <span>{mov.operatore || 'Unknown'}</span>
                    </div>
                    {mov.motivo && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#9ca3af', fontWeight: 500 }}>Reason:</span>
                        <span>{mov.motivo}</span>
                      </div>
                    )}
                    {mov.riferimento && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ color: '#9ca3af', fontWeight: 500 }}>Ref:</span>
                        <span>{mov.riferimento}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ 
                    paddingTop: '0.75rem', 
                    borderTop: '1px solid #f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                    <span style={{ color: '#6b7280', fontWeight: 500 }}>Stock:</span>
                    <span style={{ fontWeight: 600, color: '#4b5563' }}>{mov.giacenza_precedente_magazino}</span>
                    <span style={{ color: '#9ca3af' }}>→</span>
                    <span style={{ fontWeight: 600, color: '#0077a2' }}>{mov.giacenza_nuova_magazino}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Trash2 size={24} style={{ color: '#ef4444' }} />
              </div>
              <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.25rem' }}>Delete Movement?</h3>
            </div>
            
            <p style={{ color: '#6b7280', margin: '0 0 1.5rem 0', lineHeight: '1.5' }}>
              This will permanently delete this movement notification. This action cannot be undone.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deletingId}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#374151',
                  fontWeight: 600,
                  cursor: deletingId ? 'not-allowed' : 'pointer',
                  opacity: deletingId ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMovement(confirmDelete)}
                disabled={deletingId}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  fontWeight: 600,
                  cursor: deletingId ? 'not-allowed' : 'pointer',
                  opacity: deletingId ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {deletingId ? (
                  <>
                    <div className="wms-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MovimentiRegistry;
