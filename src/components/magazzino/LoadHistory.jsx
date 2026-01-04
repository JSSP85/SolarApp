// src/components/magazzino/LoadHistory.jsx
import React, { useState, useEffect } from 'react';
import { Clock, Database, CheckCircle, Package, User, Calendar } from 'lucide-react';
import { getLastImport } from '../../firebase/magazzinoService';

const LoadHistory = () => {
  const [lastImport, setLastImport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLastImport();
  }, []);

  const loadLastImport = async () => {
    try {
      setLoading(true);
      const importData = await getLastImport();
      setLastImport(importData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading last import:', error);
      setLoading(false);
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="wms-panel-card">
        <div className="wms-panel-header">
          <h2 className="wms-panel-title">
            <Clock size={24} />
            SAP Database Load History
          </h2>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="spinner" style={{
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #0077a2',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading history...</p>
        </div>
      </div>
    );
  }

  if (!lastImport) {
    return (
      <div className="wms-panel-card">
        <div className="wms-panel-header">
          <h2 className="wms-panel-title">
            <Clock size={24} />
            SAP Database Load History
          </h2>
        </div>
        <div className="wms-empty-state">
          <Database size={64} />
          <h3>No Import History</h3>
          <p>No SAP Excel file has been uploaded yet</p>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Upload your first SAP export from the "Import from SAP" section
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wms-panel-card">
      <div className="wms-panel-header">
        <h2 className="wms-panel-title">
          <Clock size={24} />
          SAP Database Load History
        </h2>
        <p className="wms-panel-subtitle">
          Last database synchronization with SAP
        </p>
      </div>

      <div style={{ padding: '2rem' }}>
        {/* Success Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
          border: '2px solid #86efac',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <CheckCircle size={48} style={{ color: '#16a34a', flexShrink: 0 }} />
          <div>
            <h3 style={{ margin: 0, color: '#166534', fontSize: '1.2rem' }}>
              Database Successfully Loaded
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', color: '#15803d', fontSize: '0.95rem' }}>
              Last import completed successfully
            </p>
          </div>
        </div>

        {/* Import Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Date & Time */}
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #93c5fd'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Calendar size={20} style={{ color: '#0077a2' }} />
              <h4 style={{ margin: 0, color: '#1e40af', fontSize: '0.9rem', fontWeight: 600 }}>
                IMPORT DATE & TIME
              </h4>
            </div>
            <p style={{ 
              margin: 0, 
              color: '#1e3a8a', 
              fontSize: '1.1rem', 
              fontWeight: 700,
              fontFamily: 'monospace'
            }}>
              {formatDateTime(lastImport.data_importazione)}
            </p>
          </div>

          {/* User */}
          <div style={{
            background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #d8b4fe'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <User size={20} style={{ color: '#9333ea' }} />
              <h4 style={{ margin: 0, color: '#7e22ce', fontSize: '0.9rem', fontWeight: 600 }}>
                UPLOADED BY
              </h4>
            </div>
            <p style={{ 
              margin: 0, 
              color: '#6b21a8', 
              fontSize: '1.1rem', 
              fontWeight: 700
            }}>
              {lastImport.utente || 'System'}
            </p>
          </div>

          {/* Total Articles */}
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #fcd34d'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Package size={20} style={{ color: '#d97706' }} />
              <h4 style={{ margin: 0, color: '#b45309', fontSize: '0.9rem', fontWeight: 600 }}>
                TOTAL ARTICLES
              </h4>
            </div>
            <p style={{ 
              margin: 0, 
              color: '#92400e', 
              fontSize: '1.8rem', 
              fontWeight: 700
            }}>
              {lastImport.totale_articoli.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Import Statistics */}
        <div style={{
          marginTop: '2rem',
          background: 'white',
          borderRadius: '12px',
          border: '2px solid #e5e7eb',
          padding: '1.5rem'
        }}>
          <h4 style={{ 
            margin: '0 0 1.5rem 0', 
            color: '#374151', 
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Database size={18} />
            Import Statistics
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>New Articles</span>
                <span style={{ 
                  color: '#059669', 
                  fontSize: '1.3rem', 
                  fontWeight: 700 
                }}>
                  +{lastImport.articoli_nuovi}
                </span>
              </div>
              <div style={{ 
                height: '8px', 
                background: '#d1fae5', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: '#10b981',
                  width: `${(lastImport.articoli_nuovi / lastImport.totale_articoli) * 100}%`,
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>

            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Updated Articles</span>
                <span style={{ 
                  color: '#0077a2', 
                  fontSize: '1.3rem', 
                  fontWeight: 700 
                }}>
                  {lastImport.articoli_aggiornati}
                </span>
              </div>
              <div style={{ 
                height: '8px', 
                background: '#dbeafe', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: '#0077a2',
                  width: `${(lastImport.articoli_aggiornati / lastImport.totale_articoli) * 100}%`,
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div style={{
          background: '#eff6ff',
          padding: '1rem',
          borderRadius: '8px',
          marginTop: '2rem',
          borderLeft: '4px solid #0077a2'
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e40af' }}>
            <strong>⚠️ Important:</strong> This import loaded new SAP stock quantities and RESET all warehouse movements to 0.
SAP quantities already include previous adjustments, so movements start fresh from this baseline.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadHistory;