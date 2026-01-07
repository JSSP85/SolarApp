// src/components/measurement-instruments/CalibrationAlerts.jsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingDown, Clock, Package } from 'lucide-react';
import { getExpiringSoonInstruments, getExpiredInstruments } from '../../firebase/instrumentsService';

const CalibrationAlerts = ({ stats, onRefresh }) => {
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [expired, setExpired] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const expiringSoonData = await getExpiringSoonInstruments();
      const expiredData = await getExpiredInstruments();
      setExpiringSoon(expiringSoonData);
      setExpired(expiredData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading alerts:', error);
      setLoading(false);
    }
  };

  const getDaysDisplay = (days) => {
    if (days === null) return 'N/A';
    if (days < 0) return `${Math.abs(days)} days overdue`;
    return `${days} days remaining`;
  };

  if (loading) {
    return (
      <div className="mims-loading-state">
        <div className="mims-spinner"></div>
        <p>Loading calibration alerts...</p>
      </div>
    );
  }

  return (
    <div className="mims-panel-container">
      {/* Stats */}
      <div className="mims-stats-container">
        <div className="mims-stat-card">
          <div className="mims-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <TrendingDown size={24} style={{ color: '#ef4444' }} />
          </div>
          <div className="mims-stat-value">{stats.expired}</div>
          <div className="mims-stat-label">Expired Calibrations</div>
        </div>

        <div className="mims-stat-card alert">
          <div className="mims-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <Clock size={24} style={{ color: '#f59e0b' }} />
          </div>
          <div className="mims-stat-value">{stats.expiring_soon}</div>
          <div className="mims-stat-label">Expiring Soon</div>
        </div>

        <div className="mims-stat-card">
          <div className="mims-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <Package size={24} style={{ color: '#10b981' }} />
          </div>
          <div className="mims-stat-value">{stats.valid}</div>
          <div className="mims-stat-label">Valid Instruments</div>
        </div>
      </div>

      {/* Expired Instruments */}
      {expired.length > 0 && (
        <div className="mims-panel-card" style={{ marginBottom: '2rem' }}>
          <div className="mims-panel-header">
            <div className="mims-panel-title" style={{ color: '#ef4444' }}>
              <TrendingDown size={24} />
              Expired Calibrations ({expired.length})
            </div>
            <p className="mims-panel-subtitle">
              These instruments have expired calibrations and require immediate attention
            </p>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {expired.map((inst) => (
                <div
                  key={inst.id}
                  style={{
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{
                          background: '#991b1b',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          fontFamily: 'monospace'
                        }}>
                          {inst.instrument_number}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '1rem', color: '#991b1b' }}>
                          {inst.instrument_name}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#991b1b' }}>
                        {inst.manufacturer} {inst.model}
                      </div>
                    </div>
                    <span className="mims-badge expired">
                      EXPIRED
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                    <div>
                      <span style={{ color: '#6b7280', fontWeight: 500 }}>Last Calibration:</span>
                      <div style={{ color: '#991b1b', fontWeight: 600 }}>
                        {inst.current_calibration_date ? new Date(inst.current_calibration_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280', fontWeight: 500 }}>Expired On:</span>
                      <div style={{ color: '#991b1b', fontWeight: 600 }}>
                        {inst.current_expiration_date ? new Date(inst.current_expiration_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280', fontWeight: 500 }}>Overdue:</span>
                      <div style={{ color: '#ef4444', fontWeight: 700 }}>
                        {getDaysDisplay(inst.days_until_expiration)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expiring Soon */}
      {expiringSoon.length > 0 && (
        <div className="mims-panel-card">
          <div className="mims-panel-header">
            <div className="mims-panel-title" style={{ color: '#f59e0b' }}>
              <Clock size={24} />
              Expiring Soon ({expiringSoon.length})
            </div>
            <p className="mims-panel-subtitle">
              These instruments will expire within the next 30 days
            </p>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {expiringSoon.map((inst) => (
                <div
                  key={inst.id}
                  style={{
                    background: '#fef3c7',
                    border: '1px solid #fcd34d',
                    borderRadius: '8px',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{
                          background: '#92400e',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          fontFamily: 'monospace'
                        }}>
                          {inst.instrument_number}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '1rem', color: '#92400e' }}>
                          {inst.instrument_name}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
                        {inst.manufacturer} {inst.model}
                      </div>
                    </div>
                    <span className="mims-badge expiring_soon">
                      EXPIRING SOON
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                    <div>
                      <span style={{ color: '#6b7280', fontWeight: 500 }}>Last Calibration:</span>
                      <div style={{ color: '#92400e', fontWeight: 600 }}>
                        {inst.current_calibration_date ? new Date(inst.current_calibration_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280', fontWeight: 500 }}>Expires On:</span>
                      <div style={{ color: '#92400e', fontWeight: 600 }}>
                        {inst.current_expiration_date ? new Date(inst.current_expiration_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280', fontWeight: 500 }}>Time Remaining:</span>
                      <div style={{ color: '#f59e0b', fontWeight: 700 }}>
                        {getDaysDisplay(inst.days_until_expiration)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Alerts */}
      {expired.length === 0 && expiringSoon.length === 0 && (
        <div className="mims-empty-state">
          <AlertCircle size={64} style={{ color: '#10b981' }} />
          <h3 style={{ color: '#065f46' }}>All Clear!</h3>
          <p>No calibration alerts at this time. All instruments are up to date.</p>
        </div>
      )}
    </div>
  );
};

export default CalibrationAlerts;
