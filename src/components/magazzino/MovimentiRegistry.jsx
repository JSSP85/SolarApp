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
  Eye,
  EyeOff
} from 'lucide-react';
import { getMovimenti, getMovimentiStats, hideMovimentoNotification } from '../../firebase/magazzinoService';

const MovimentiRegistry = () => {
  const [movements, setMovements] = useState([]);
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Filters
  const [filters, setFilters] = useState({
    searchTerm: '',
    dateRange: 'today',
    operatore: '',
    tipo: ''
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    loadMovements();
    
    const interval = setInterval(() => {
      loadMovements(true); // Silent refresh
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Apply filters when movements or filters change
  useEffect(() => {
    applyFilters();
  }, [movements, filters]);

  // Load movements from Firebase
  const loadMovements = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
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
      
      // Get movements - INCLUDE ALL (hidden will show as transparent)
      const movData = await getMovimenti({
        dataInizio: dataInizio,
        dataFine: now,
        limit: 100,
        includeHidden: true  // Show all movements
      });
      
      // Get stats
      const statsData = await getMovimentiStats(
        dataInizio || new Date(0),
        now
      );
      
      setMovements(movData);
      setStats(statsData);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error loading movements:', error);
      setLoading(false);
    }
  };

  // Apply filters to movements
  const applyFilters = () => {
    let filtered = [...movements];
    
    // Search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(mov => 
        mov.codice_articolo?.toLowerCase().includes(term) ||
        mov.operatore?.toLowerCase().includes(term) ||
        mov.motivo?.toLowerCase().includes(term)
      );
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

  // Format timestamp - ALWAYS SHOW EXACT TIME WITH SECONDS
  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    
    // ALWAYS show exact time with seconds (no relative time)
    // If today
    if (date.toDateString() === new Date().toDateString()) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    }
    
    // Otherwise show full date with time and seconds
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Toggle hide/show notification
  const handleToggleHide = async (movimentoId, currentHiddenState) => {
    try {
      await hideMovimentoNotification(movimentoId);
      // Reload movements to update the view
      loadMovements(true);
    } catch (error) {
      console.error('Error toggling notification:', error);
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
                  onClick={() => loadMovements()}
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
              placeholder="Search by code, operator, or reason..."
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
              {filteredMovements.map((mov, idx) => {
                const isHidden = mov.hidden_from_notifications === true;
                
                return (
                  <div 
                    key={mov.firebaseId || idx} 
                    className="wms-movement-card"
                    style={{
                      opacity: isHidden ? 0.4 : 1,
                      transition: 'opacity 0.3s ease'
                    }}
                  >
                    <div className="wms-movement-header">
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <code className="wms-article-code">{mov.codice_articolo}</code>
                        <div style={{ textAlign: 'right' }}>
                          <div className={`wms-quantity-value ${mov.quantita > 0 ? 'positive' : 'negative'}`}>
                            {mov.quantita > 0 ? '+' : ''}{mov.quantita}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>units</div>
                        </div>
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
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#6b7280', fontWeight: 500 }}>Stock:</span>
                        <span style={{ fontWeight: 600, color: '#4b5563' }}>{mov.giacenza_precedente_magazino}</span>
                        <span style={{ color: '#9ca3af' }}>→</span>
                        <span style={{ fontWeight: 600, color: '#0077a2' }}>{mov.giacenza_nuova_magazino}</span>
                      </div>
                      
                      <button
                        onClick={() => handleToggleHide(mov.firebaseId, isHidden)}
                        style={{
                          background: isHidden ? '#f3f4f6' : 'transparent',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          padding: '0.35rem 0.65rem',
                          cursor: 'pointer',
                          color: isHidden ? '#059669' : '#6b7280',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          if (!isHidden) {
                            e.currentTarget.style.background = '#fef3c7';
                            e.currentTarget.style.borderColor = '#fcd34d';
                            e.currentTarget.style.color = '#d97706';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isHidden) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.color = '#6b7280';
                          }
                        }}
                        title={isHidden ? "Mark as unread" : "Mark as read"}
                      >
                        {isHidden ? (
                          <>
                            <Eye size={12} />
                            Show
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} />
                            Hide
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MovimentiRegistry;
