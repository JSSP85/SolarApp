// src/components/database/InspectionDetails.jsx
import React from 'react';
import { formatDate } from '../../utils/dateFormatter';
import StaticMapReport from '../report/StaticMapReport';

const InspectionDetails = ({ inspectionData }) => {
  if (!inspectionData) {
    return (
      <div className="dashboard-card">
        <div className="card-body text-center text-gray-500">
          No inspection data available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Inspection Details</h2>
      
      {/* Two-column container - COPIADO EXACTAMENTE DEL SETUP */}
      <div className="cards-grid-2">
        {/* LEFT COLUMN: Component Information */}
        <div className="dashboard-card">
          <div className="card-header" style={{background: 'linear-gradient(to right, #5a67d8, #6875f5)'}}>
            <h3 className="card-title" style={{color: 'white'}}>
              Component Information
            </h3>
          </div>
          
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Client</label>
              <input
                type="text"
                className="form-control"
                value={inspectionData.client || 'Valmont Solar'}
                readOnly
                style={{backgroundColor: '#f8fafc'}}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input
                type="text"
                className="form-control"
                value={inspectionData.projectName || 'NEPI'}
                readOnly
                style={{backgroundColor: '#f8fafc'}}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Component Family</label>
              <input
                type="text"
                className="form-control"
                value={inspectionData.componentFamily || 'NA'}
                readOnly
                style={{backgroundColor: '#f8fafc'}}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Component Code</label>
              <input
                type="text"
                className="form-control"
                value={inspectionData.componentCode || 'NA'}
                readOnly
                style={{backgroundColor: '#f8fafc'}}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Component Name</label>
              <input
                type="text"
                className="form-control"
                value={inspectionData.componentName || 'NA'}
                readOnly
                style={{backgroundColor: '#f8fafc'}}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Surface Protection</label>
              <input
                type="text"
                className="form-control"
                value={inspectionData.surfaceProtection || 'NA'}
                readOnly
                style={{backgroundColor: '#f8fafc'}}
              />
            </div>
            
            {inspectionData.surfaceProtection === 'ISO1461' && (
              <div className="form-group">
                <label className="form-label">Material Thickness (mm)</label>
                <input
                  type="text"
                  className="form-control"
                  value={`${inspectionData.thickness || '2.0'} mm`}
                  readOnly
                  style={{backgroundColor: '#f8fafc'}}
                />
              </div>
            )}
            
            {inspectionData.surfaceProtection === 'special coating' && (
              <div className="form-group">
                <label className="form-label">Special Coating Value (µm)</label>
                <input
                  type="text"
                  className="form-control"
                  value={`${inspectionData.specialCoating || '45'} µm`}
                  readOnly
                  style={{backgroundColor: '#f8fafc'}}
                />
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Batch Quantity</label>
              <input
                type="text"
                className="form-control"
                value={inspectionData.batchQuantity || 'NA'}
                readOnly
                style={{backgroundColor: '#f8fafc'}}
              />
            </div>
            
            {inspectionData.sampleInfo && (
              <div style={{background: '#ebf8ff', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', marginTop: '16px', border: '1px solid #bee3f8'}}>
                <div style={{color: '#3182ce', marginRight: '8px'}}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                  </svg>
                </div>
                <div>
                  <p style={{fontWeight: '500', color: '#2c5282', margin: '0 0 4px 0'}}>Sampling Plan:</p>
                  <p style={{color: '#3182ce', margin: '0'}}>{inspectionData.sampleInfo}</p>
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
            <div className="form-group">
              <label className="form-label">Inspector Name</label>
              <input
                type="text"
                className="form-control"
                value={inspectionData.inspector || 'NA'}
                readOnly
                style={{backgroundColor: '#f8fafc'}}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Inspection Date</label>
              <input
                type="text"
                className="form-control"
                value={inspectionData.inspectionDate ? formatDate(inspectionData.inspectionDate) : new Date().toLocaleDateString()}
                readOnly
                style={{backgroundColor: '#f8fafc'}}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Inspection Location</label>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Country"
                  value={inspectionData.inspectionCountry || 'Italy'}
                  readOnly
                  style={{backgroundColor: '#f8fafc'}}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="City"
                  value={inspectionData.inspectionCity || 'Roma'}
                  readOnly
                  style={{backgroundColor: '#f8fafc'}}
                />
              </div>
            </div>
            
            {/* Additional location details */}
            <div style={{marginTop: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
              <div className="form-group">
                <label className="form-label">Site Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={inspectionData.inspectionSite || 'NA'}
                  readOnly
                  style={{backgroundColor: '#ffffff'}}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Detailed Address</label>
                <textarea
                  className="form-control"
                  value={inspectionData.inspectionAddress || 'NA'}
                  readOnly
                  rows="2"
                  style={{backgroundColor: '#ffffff'}}
                />
              </div>
              
              {/* Mapa estático - IGUAL QUE EN SETUP */}
              <div style={{borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', marginTop: '8px'}}>
                <div style={{background: 'linear-gradient(to right, #667eea, #764ba2)', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span style={{color: 'white', fontWeight: '500', display: 'flex', alignItems: 'center'}}>
                    Inspection Location
                  </span>
                </div>
                
                {/* Usando el componente StaticMapReport */}
                <StaticMapReport coords={inspectionData.mapCoords} />
              </div>
            </div>
            
            {/* Status final */}
            <div className="form-group" style={{marginTop: '16px'}}>
              <label className="form-label">Final Result</label>
              <div style={{
                padding: '12px', 
                borderRadius: '8px', 
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: inspectionData.inspectionStatus === 'pass' ? '#d1fae5' : 
                                inspectionData.inspectionStatus === 'reject' ? '#fee2e2' : '#fef3c7',
                color: inspectionData.inspectionStatus === 'pass' ? '#065f46' : 
                       inspectionData.inspectionStatus === 'reject' ? '#b91c1c' : '#92400e',
                border: `1px solid ${inspectionData.inspectionStatus === 'pass' ? '#a7f3d0' : 
                                     inspectionData.inspectionStatus === 'reject' ? '#fecaca' : '#fde68a'}`
              }}>
                {inspectionData.inspectionStatus === 'pass' ? 'ACCEPTED' : 
                 inspectionData.inspectionStatus === 'reject' ? 'REJECTED' : 'IN PROGRESS'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionDetails;