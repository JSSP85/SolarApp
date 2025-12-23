// src/components/magazzino/DashboardTable.jsx
import React, { useState, useEffect } from 'react';
import { Download, Search, Filter, Package, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { getAllArticoli } from '../../firebase/magazzinoService';
import * as XLSX from 'xlsx';

const DashboardTable = () => {
  const [articoli, setArticoli] = useState([]);
  const [filteredArticoli, setFilteredArticoli] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  useEffect(() => {
    loadArticoli();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, categoryFilter, stockFilter, articoli]);

  const loadArticoli = async () => {
    try {
      setLoading(true);
      const data = await getAllArticoli();
      setArticoli(data);
      setFilteredArticoli(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading articles:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...articoli];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(art => 
        art.codice.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.descrizione.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(art => art.categoria === categoryFilter);
    }

    // Stock filter
    if (stockFilter === 'low') {
      filtered = filtered.filter(art => 
        art.giacenza_attuale_magazino <= art.giacenza_minima && art.giacenza_attuale_magazino > 0
      );
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(art => art.giacenza_attuale_magazino === 0);
    } else if (stockFilter === 'modified') {
      filtered = filtered.filter(art => art.movimenti_totali !== 0);
    }

    setFilteredArticoli(filtered);
  };

  const exportToExcel = () => {
    const exportData = filteredArticoli.map(art => ({
      'Material': art.codice,
      'Material Description': art.descrizione,
      'Category': art.categoria,
      'SAP Stock': art.giacenza_sap || 0,
      'Warehouse Movements': art.movimenti_totali || 0,
      'Current Warehouse Stock': art.giacenza_attuale_magazino || 0,
      'Stock Difference': art.movimenti_totali || 0,
      'Unit': art.unita_misura || 'pz',
      'Min Stock': art.giacenza_minima || 0,
      'Max Stock': art.giacenza_massima || 0,
      'Status': art.giacenza_attuale_magazino === 0 ? 'OUT OF STOCK' : 
                art.giacenza_attuale_magazino <= art.giacenza_minima ? 'LOW STOCK' : 'OK'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');

    // Auto-width columns
    const maxWidth = exportData.reduce((w, r) => Math.max(w, r['Material Description']?.length || 0), 10);
    ws['!cols'] = [
      { wch: 10 }, // Material
      { wch: Math.min(maxWidth, 50) }, // Description
      { wch: 20 }, // Category
      { wch: 12 }, // SAP Stock
      { wch: 18 }, // Movements
      { wch: 20 }, // Current Stock
      { wch: 15 }, // Difference
      { wch: 8 },  // Unit
      { wch: 10 }, // Min
      { wch: 10 }, // Max
      { wch: 15 }  // Status
    ];

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    XLSX.writeFile(wb, `Warehouse_Inventory_${timestamp}.xlsx`);
  };

  const getStockStatus = (article) => {
    if (article.giacenza_attuale_magazino === 0) {
      return { label: 'OUT OF STOCK', color: '#ef4444', bg: '#fee2e2' };
    }
    if (article.giacenza_attuale_magazino <= article.giacenza_minima) {
      return { label: 'LOW STOCK', color: '#f59e0b', bg: '#fef3c7' };
    }
    return { label: 'OK', color: '#10b981', bg: '#d1fae5' };
  };

  const categories = [...new Set(articoli.map(a => a.categoria))].sort();

  if (loading) {
    return (
      <div className="wms-panel-card">
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="spinner" style={{
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #0077a2',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wms-panel-card">
      <div className="wms-panel-header">
        <h2 className="wms-panel-title">
          <Package size={24} />
          Complete Inventory Database
        </h2>
        <p className="wms-panel-subtitle">
          SAP data with warehouse movement tracking
        </p>
      </div>

      <div style={{ padding: '2rem' }}>
        {/* Filters Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Search by code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0077a2'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Category Filter */}
          <div style={{ position: 'relative' }}>
            <Filter size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                cursor: 'pointer',
                background: 'white'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div style={{ position: 'relative' }}>
            <AlertCircle size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                cursor: 'pointer',
                background: 'white'
              }}
            >
              <option value="all">All Stock Levels</option>
              <option value="low">Low Stock Only</option>
              <option value="out">Out of Stock Only</option>
              <option value="modified">With Movements Only</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={exportToExcel}
            style={{
              background: 'linear-gradient(135deg, #0077a2 0%, #005F83 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'transform 0.2s',
              boxShadow: '0 2px 4px rgba(0, 119, 162, 0.2)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <Download size={18} />
            Export for SAP
          </button>
        </div>

        {/* Results Count */}
        <div style={{
          background: '#f9fafb',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#374151', fontSize: '0.95rem', fontWeight: 600 }}>
            Showing {filteredArticoli.length.toLocaleString()} of {articoli.length.toLocaleString()} articles
          </span>
          {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all' ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setStockFilter('all');
              }}
              style={{
                background: 'transparent',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                color: '#6b7280',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#f3f4f6';
                e.target.style.borderColor = '#9ca3af';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = '#d1d5db';
              }}
            >
              Clear Filters
            </button>
          ) : null}
        </div>

        {/* Table */}
        <div style={{
          overflowX: 'auto',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          background: 'white'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.9rem'
          }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #0077a2 0%, #005F83 100%)' }}>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  color: 'white',
                  fontWeight: 600,
                  borderBottom: '2px solid #93c5fd'
                }}>Code</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  color: 'white',
                  fontWeight: 600,
                  borderBottom: '2px solid #93c5fd'
                }}>Description</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  color: 'white',
                  fontWeight: 600,
                  borderBottom: '2px solid #93c5fd'
                }}>Category</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: 'white',
                  fontWeight: 600,
                  borderBottom: '2px solid #93c5fd'
                }}>SAP Stock</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: 'white',
                  fontWeight: 600,
                  borderBottom: '2px solid #93c5fd'
                }}>Movements</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: 'white',
                  fontWeight: 600,
                  borderBottom: '2px solid #93c5fd'
                }}>Current Stock</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: 'white',
                  fontWeight: 600,
                  borderBottom: '2px solid #93c5fd'
                }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticoli.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                    No articles found
                  </td>
                </tr>
              ) : (
                filteredArticoli.map((article, index) => {
                  const status = getStockStatus(article);
                  const hasMovements = article.movimenti_totali !== 0;
                  
                  return (
                    <tr 
                      key={article.codice}
                      style={{
                        background: index % 2 === 0 ? 'white' : '#f9fafb',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f0f9ff'}
                      onMouseOut={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#f9fafb'}
                    >
                      <td style={{
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        color: '#1f2937'
                      }}>
                        {article.codice}
                      </td>
                      <td style={{
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                        color: '#4b5563'
                      }}>
                        {article.descrizione}
                      </td>
                      <td style={{
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <span style={{
                          background: '#f3f4f6',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: '#374151',
                          fontWeight: 500
                        }}>
                          {article.categoria}
                        </span>
                      </td>
                      <td style={{
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#6b7280'
                      }}>
                        {(article.giacenza_sap || 0).toLocaleString()}
                      </td>
                      <td style={{
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                        textAlign: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          {hasMovements ? (
                            <>
                              {article.movimenti_totali > 0 ? (
                                <TrendingUp size={16} style={{ color: '#10b981' }} />
                              ) : (
                                <TrendingDown size={16} style={{ color: '#ef4444' }} />
                              )}
                              <span style={{
                                fontFamily: 'monospace',
                                fontSize: '1rem',
                                fontWeight: 700,
                                color: article.movimenti_totali > 0 ? '#10b981' : '#ef4444'
                              }}>
                                {article.movimenti_totali > 0 ? '+' : ''}{article.movimenti_totali.toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <span style={{
                              fontFamily: 'monospace',
                              fontSize: '1rem',
                              color: '#9ca3af'
                            }}>
                              0
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: '#1f2937'
                      }}>
                        {(article.giacenza_attuale_magazino || 0).toLocaleString()}
                      </td>
                      <td style={{
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                        textAlign: 'center'
                      }}>
                        <span style={{
                          background: status.bg,
                          color: status.color,
                          padding: '0.4rem 0.8rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          display: 'inline-block',
                          minWidth: '100px'
                        }}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#374151', fontSize: '0.95rem', fontWeight: 600 }}>
            📊 Column Explanation
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              <strong style={{ color: '#374151' }}>SAP Stock:</strong> Original quantity from SAP export
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              <strong style={{ color: '#374151' }}>Movements:</strong> +/- changes made via mobile app
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              <strong style={{ color: '#374151' }}>Current Stock:</strong> SAP Stock + Movements
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTable;