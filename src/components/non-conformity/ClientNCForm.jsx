// src/components/non-conformity/ClientNCForm.jsx
import React, { memo } from 'react';

const statusOptions = [
  { value: 'open', label: '🔴 Open' },
  { value: 'in_progress', label: '🟡 In Progress' },
  { value: 'closed', label: '🟢 Closed' },
  { value: 'cancelled', label: '⚫ Cancelled' }
];

const ncClassOptions = [
  { value: 'critical', label: '🚨 CRITICAL' },
  { value: 'major', label: '🔴 MAJOR' },
  { value: 'minor', label: '🟡 MINOR' }
];

const detectionPhaseOptions = [
  { value: 'production', label: 'Production' },
  { value: 'on_site', label: 'On Site' },
  { value: 'incoming_goods', label: 'Incoming Goods' },
  { value: 'installation', label: 'Installation' },
  { value: 'malpractice', label: 'Malpractice' },
  { value: 'logistics', label: 'Logistics' }
];

const responsibleSectorOptions = [
  { value: 'quality_control', label: 'Control de Calidad' },
  { value: 'engineering', label: 'Ingenieria' },
  { value: 'logistics', label: 'Logistica' },
  { value: 'project_management', label: 'Project Management' },
  { value: 'production', label: 'Produccion' },
  { value: 'scada', label: 'Area SCADA' },
  { value: 'electrical_electronic', label: 'Area Electronica/Electrica' },
  { value: 'other', label: 'Otros' }
];

/**
 * Client NC Form Component
 * Similar to NC Registry but without NC Number and Accountable fields
 * NC Issuer is used to identify the client who issued the NC
 */
const ClientNCForm = memo(({ nc, onChange }) => {
  return (
    <div className="nc-form-container">
      <div className="nc-form-section">
        <h3 className="nc-section-title">Basic Information</h3>
        
        <div className="nc-form-grid">
          {/* NC Issuer - Cliente que emite la NC */}
          <div className="nc-form-group">
            <label className="nc-form-label">NC Issuer (Client) *</label>
            <input
              type="text"
              value={nc.ncIssuer || ''}
              onChange={(e) => onChange({ ...nc, ncIssuer: e.target.value })}
              className="nc-form-input"
              placeholder="Client or company name..."
            />
          </div>

          {/* Nombre del responsable que abrió la NC (opcional) */}
          <div className="nc-form-group">
            <label className="nc-form-label">NC Issuer Name (Optional)</label>
            <input
              type="text"
              value={nc.issuerName || ''}
              onChange={(e) => onChange({ ...nc, issuerName: e.target.value })}
              className="nc-form-input"
              placeholder="Name of person who issued the NC..."
            />
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Status *</label>
            <select
              value={nc.status || 'open'}
              onChange={(e) => onChange({ ...nc, status: e.target.value })}
              className="nc-form-select"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Date of Detection *</label>
            <input
              type="date"
              value={nc.dateOfDetection || ''}
              onChange={(e) => onChange({ ...nc, dateOfDetection: e.target.value })}
              className="nc-form-input"
            />
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Detection Phase *</label>
            <select
              value={nc.detectionPhase || ''}
              onChange={(e) => onChange({ ...nc, detectionPhase: e.target.value })}
              className="nc-form-select"
            >
              <option value="">Select...</option>
              {detectionPhaseOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Sector Responsable */}
          <div className="nc-form-group">
            <label className="nc-form-label">Responsible Sector *</label>
            <select
              value={nc.responsibleSector || ''}
              onChange={(e) => onChange({ ...nc, responsibleSector: e.target.value })}
              className="nc-form-select"
            >
              <option value="">Select...</option>
              {responsibleSectorOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Campo adicional si se selecciona "Otros" */}
          {nc.responsibleSector === 'other' && (
            <div className="nc-form-group">
              <label className="nc-form-label">Specify Other Sector *</label>
              <input
                type="text"
                value={nc.responsibleSectorOther || ''}
                onChange={(e) => onChange({ ...nc, responsibleSectorOther: e.target.value })}
                className="nc-form-input"
                placeholder="Specify the sector..."
              />
            </div>
          )}

          <div className="nc-form-group">
            <label className="nc-form-label">Order Number</label>
            <input
              type="text"
              value={nc.orderNumber || ''}
              onChange={(e) => onChange({ ...nc, orderNumber: e.target.value })}
              className="nc-form-input"
              placeholder="PO26171"
            />
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Project Code</label>
            <input
              type="text"
              value={nc.projectCode || ''}
              onChange={(e) => onChange({ ...nc, projectCode: e.target.value })}
              className="nc-form-input"
            />
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">Project Name</label>
            <input
              type="text"
              value={nc.projectName || ''}
              onChange={(e) => onChange({ ...nc, projectName: e.target.value })}
              className="nc-form-input"
            />
          </div>

          <div className="nc-form-group">
            <label className="nc-form-label">NC Class *</label>
            <select
              value={nc.ncClass || ''}
              onChange={(e) => onChange({ ...nc, ncClass: e.target.value })}
              className="nc-form-select"
            >
              <option value="">Select...</option>
              {ncClassOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="nc-form-section">
        <h3 className="nc-section-title">NC Details</h3>
        
        <div className="nc-form-group-full">
          <label className="nc-form-label">NC Main Subject *</label>
          <input
            type="text"
            value={nc.ncMainSubject || ''}
            onChange={(e) => onChange({ ...nc, ncMainSubject: e.target.value })}
            className="nc-form-input"
            placeholder="Main subject..."
          />
        </div>

        <div className="nc-form-group-full">
          <label className="nc-form-label">NC Brief Summary & Root Cause</label>
          <textarea
            value={nc.ncBriefSummary || ''}
            onChange={(e) => onChange({ ...nc, ncBriefSummary: e.target.value })}
            className="nc-form-textarea"
            placeholder="Brief summary and root cause..."
            rows="3"
          />
        </div>

        <div className="nc-form-group-full">
          <label className="nc-form-label">Treatment</label>
          <textarea
            value={nc.treatment || ''}
            onChange={(e) => onChange({ ...nc, treatment: e.target.value })}
            className="nc-form-textarea"
            placeholder="Treatment description..."
            rows="2"
          />
        </div>

        <div className="nc-form-group">
          <label className="nc-form-label">Date of Closure</label>
          <input
            type="date"
            value={nc.dateOfClosure || ''}
            onChange={(e) => onChange({ ...nc, dateOfClosure: e.target.value })}
            className="nc-form-input"
          />
        </div>

        <div className="nc-form-group-full">
          <label className="nc-form-label">Root Cause Analysis</label>
          <textarea
            value={nc.rootCauseAnalysis || ''}
            onChange={(e) => onChange({ ...nc, rootCauseAnalysis: e.target.value })}
            className="nc-form-textarea"
            placeholder="Root cause analysis..."
            rows="3"
          />
        </div>

        <div className="nc-form-group-full">
          <label className="nc-form-label">Corrective Action</label>
          <textarea
            value={nc.correctiveAction || ''}
            onChange={(e) => onChange({ ...nc, correctiveAction: e.target.value })}
            className="nc-form-textarea"
            placeholder="Containment and corrective actions..."
            rows="3"
          />
        </div>
      </div>
    </div>
  );
});

ClientNCForm.displayName = 'ClientNCForm';

export default ClientNCForm;