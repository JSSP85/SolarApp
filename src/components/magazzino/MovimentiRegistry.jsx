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
  Clock
} from 'lucide-react';
import { getMovimenti, getMovimentiStats } from '../../firebase/magazzinoService';
import './MovimentiRegistry.css';

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

  return (
    <div className="movimenti-registry">
      {/* Header with Stats */}
      <div className="registry-header">
        <div className="header-title">
          <List size={32} />
          <div>
            <h2>Movement Registry</h2>
            <p>Real-time warehouse activity tracking</p>
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn-refresh" 
            onClick={() => loadMovements()}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
          <div className="last-update">
            <Clock size={14} />
            Updated: {formatTime(lastUpdate)}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-label">Total Movements:</span>
            <span className="stat-value">{stats.totale}</span>
          </div>
          <div className="stat-item success">
            <TrendingUp size={16} />
            <span className="stat-label">Entries:</span>
            <span className="stat-value">{stats.entrate}</span>
          </div>
          <div className="stat-item warning">
            <TrendingDown size={16} />
            <span className="stat-label">Exits:</span>
            <span className="stat-value">{stats.uscite}</span>
          </div>
          <div className="stat-item info">
            <User size={16} />
            <span className="stat-label">Operators:</span>
            <span className="stat-value">{stats.operatori.length}</span>
          </div>
          <div className="stat-item">
            <Package size={16} />
            <span className="stat-label">Articles Modified:</span>
            <span className="stat-value">{stats.articoli_modificati}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by code, operator, or reason..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            />
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-item">
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

          <div className="filter-item">
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

          <div className="filter-item">
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

      {/* Movements List */}
      <div className="movements-list">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading movements...</p>
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="empty-state">
            <List size={64} />
            <h3>No Movements Found</h3>
            <p>No warehouse activity matches your current filters</p>
          </div>
        ) : (
          <div className="movements-grid">
            {filteredMovements.map((mov, idx) => (
              <div key={mov.firebaseId || idx} className="movement-card">
                <div className="movement-header">
                  <div className="movement-type">
                    {mov.tipo === 'ENTRATA' ? (
                      <div className="type-badge entry">
                        <TrendingUp size={16} />
                        ENTRY
                      </div>
                    ) : mov.tipo === 'USCITA' ? (
                      <div className="type-badge exit">
                        <TrendingDown size={16} />
                        EXIT
                      </div>
                    ) : (
                      <div className="type-badge adjustment">
                        <RefreshCw size={16} />
                        ADJUSTMENT
                      </div>
                    )}
                  </div>
                  <div className="movement-time">{formatTime(mov.timestamp)}</div>
                </div>

                <div className="movement-body">
                  <div className="movement-article">
                    <code className="article-code">{mov.codice_articolo}</code>
                    <div className="movement-quantity">
                      <span className={`quantity-value ${mov.quantita > 0 ? 'positive' : 'negative'}`}>
                        {mov.quantita > 0 ? '+' : ''}{mov.quantita}
                      </span>
                      <span className="quantity-label">units</span>
                    </div>
                  </div>

                  <div className="movement-details">
                    <div className="detail-row">
                      <User size={14} />
                      <span>{mov.operatore || 'Unknown'}</span>
                    </div>
                    {mov.motivo && (
                      <div className="detail-row">
                        <span className="detail-label">Reason:</span>
                        <span>{mov.motivo}</span>
                      </div>
                    )}
                    {mov.riferimento && (
                      <div className="detail-row">
                        <span className="detail-label">Ref:</span>
                        <span>{mov.riferimento}</span>
                      </div>
                    )}
                  </div>

                  <div className="movement-stock">
                    <div className="stock-change">
                      <span className="stock-label">Stock:</span>
                      <span className="stock-value">{mov.giacenza_precedente_magazino}</span>
                      <span className="stock-arrow">→</span>
                      <span className="stock-value new">{mov.giacenza_nuova_magazino}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovimentiRegistry;