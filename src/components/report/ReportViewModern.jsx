// src/components/report/ReportViewFixed.jsx
import React from 'react';
import { Download, ArrowLeft } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { getSampleCount, getSampleLetter } from '../../utils/samplePlanHelper';
import { formatDate } from '../../utils/dateFormatter';

const ReportViewFixed = () => {
  const { state, dispatch } = useInspection();
  
  const {
    componentName,
    componentFamily,
    componentCode,
    inspector,
    inspectionDate,
    batchQuantity,
    sampleInfo,
    inspectionStatus,
    dimensions,
    dimensionMeasurements,
    dimensionNonConformities,
    coatingRequirements,
    meanCoating,
    visualConformity,
    visualNotes,
    photos,
    measurementEquipment
  } = state;
  
  const handleBackToInspection = () => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'inspection' });
  };
  
  const handleDownloadPDF = () => {
    // En una implementación real, esto invocaría una función para generar y descargar un PDF
    alert('PDF report download functionality would be implemented here');
  };
  
  const getStatusClass = (status) => {
    return status === 'pass' ? 'report-status-passed' : 
           status === 'reject' ? 'report-status-failed' : 
           '';
  };
  
  const getStatusText = (status) => {
    return status === 'pass' ? 'ACCEPTED' : 
           status === 'reject' ? 'REJECTED' : 
           'IN PROGRESS';
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Inspection Report</h2>
      
      <div className="card">
        <div className="report-header py-4">
          <h1 className="report-title">COMPONENT INSPECTION REPORT</h1>
        </div>
        
        <div className="report-body p-6">
          <div className="report-info-grid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Project Information</h3>
              </div>
              <div className="card-body">
                <div className="space-y-2">
                  <div>
                    <span className="report-info-label">Project:</span>
                    <span className="report-info-value ml-2">NEPI</span>
                  </div>
                  <div>
                    <span className="report-info-label">Component Family:</span>
                    <span className="report-info-value ml-2">{componentFamily || "TORQUE TUBES"}</span>
                  </div>
                  <div>
                    <span className="report-info-label">Component:</span>
                    <span className="report-info-value ml-2">{componentName || "Torque tube 140x100x3.5mm"}</span>
                  </div>
                  <div>
                    <span className="report-info-label">Code:</span>
                    <span className="report-info-value ml-2">{componentCode || "ttg45720"}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Inspection Information</h3>
              </div>
              <div className="card-body">
                <div className="space-y-2">
                  <div>
                    <span className="report-info-label">Date:</span>
                    <span className="report-info-value ml-2">
                      {inspectionDate ? formatDate(inspectionDate) : new Date().toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="report-info-label">Inspector:</span>
                    <span className="report-info-value ml-2">{inspector || "John Smith"}</span>
                  </div>
                  <div>
                    <span className="report-info-label">Batch Quantity:</span>
                    <span className="report-info-value ml-2">{batchQuantity || "280"}</span>
                  </div>
                  <div>
                    <span className="report-info-label">Sample Size:</span>
                    <span className="report-info-value ml-2">{sampleInfo || "Letter: G - Sample: 3"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="report-section">
            <h3 className="report-section-title">Technical Drawing</h3>
            <div className="card">
              <div className="card-body text-center">
                <img src="/api/placeholder/400/300" alt="Component technical drawing" className="max-h-40 mx-auto" />
              </div>
            </div>
          </div>
          
          <div className="report-section">
            <h3 className="report-section-title">Dimensional Measurements</h3>
            {dimensions && dimensions.length > 0 ? (
              <div className="card">
                <div className="card-body p-0">
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Dimension</th>
                          <th>Nominal (mm)</th>
                          <th>Tolerance</th>
                          {Array.from({ length: getSampleCount(sampleInfo) }).map((_, i) => (
                            <th key={i} className="text-center">{i+1}</th>
                          ))}
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dimensions.map((dim, index) => {
                          const nonConformCount = dimensionNonConformities[dim.code] || 0;
                          
                          return (
                            <tr key={index}>
                              <td className="font-medium">{dim.code}</td>
                              <td>{dim.nominal}</td>
                              <td>
                                {dim.tolerancePlus > 0 ? '+' : ''}{dim.tolerancePlus}, 
                                {dim.toleranceMinus > 0 ? '+' : ''}{dim.toleranceMinus}
                              </td>
                              {Array.from({ length: getSampleCount(sampleInfo) }).map((_, i) => {
                                const value = dimensionMeasurements?.[dim.code]?.[i] || "-";
                                const isValid = value !== "-" && (
                                  parseFloat(value) >= (dim.nominal - dim.toleranceMinus) &&
                                  parseFloat(value) <= (dim.nominal + dim.tolerancePlus)
                                );
                                
                                return (
                                  <td 
                                    key={i} 
                                    className={`text-center ${value !== "-" && !isValid ? 'text-red-600 font-medium' : ''}`}
                                  >
                                    {value}
                                  </td>
                                );
                              })}
                              <td>
                                <span className={nonConformCount > 0 ? 'report-status-failed' : 'report-status-passed'}>
                                  {nonConformCount > 0 ? 'NON-CONFORMING' : 'CONFORMING'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border rounded text-gray-500">
                No dimensional data available.
              </div>
            )}
          </div>
          
          <div className="report-section">
            <h3 className="report-section-title">Inspection Status - ISO 2859-1</h3>
            <div className="card">
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-lg">Inspection Result: 
                      <span className={`ml-2 font-bold ${getStatusClass(inspectionStatus)}`}>
                        {getStatusText(inspectionStatus)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p><span className="font-medium">Sample Letter:</span> {getSampleLetter(sampleInfo)}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Total Non-conformities:</span> <span className="font-bold">{Object.values(dimensionNonConformities).reduce((sum, count) => sum + count, 0)}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="report-section">
            <h3 className="report-section-title">Coating Measurements</h3>
            <div className="card">
              <div className="card-body p-0">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Required</th>
                      <th>Measured</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-medium">Mean</td>
                      <td>{coatingRequirements?.mean || "-"} µm</td>
                      <td>{meanCoating || "-"} µm</td>
                      <td>
                        <span className={
                          meanCoating && coatingRequirements?.mean && parseFloat(meanCoating) >= coatingRequirements.mean
                            ? 'report-status-passed'
                            : meanCoating ? 'report-status-failed' : ''
                        }>
                          {meanCoating && coatingRequirements?.mean
                            ? (parseFloat(meanCoating) >= coatingRequirements.mean ? 'PASS' : 'FAIL')
                            : '-'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="report-section">
            <h3 className="report-section-title">Visual Inspection</h3>
            <div className="card">
              <div className="card-body">
                <p><span className="font-medium">Result:</span> 
                  <span className={visualConformity === 'conforming' ? 'report-status-passed ml-2' : 'report-status-failed ml-2'}>
                    {visualConformity === 'conforming' ? 'CONFORMING' : visualConformity === 'non-conforming' ? 'NON-CONFORMING' : 'NOT EVALUATED'}
                  </span>
                </p>
                <p className="mt-2"><span className="font-medium">Notes:</span> {visualNotes || "No visual defects observed."}</p>
                
                {(photos && photos.length > 0) && (
                  <div className="mt-3">
                    <div className="grid grid-cols-4 gap-2">
                      {photos.map((photo, index) => (
                        <div key={index} className="border rounded p-1">
                          <img src={photo.src} alt={`Inspection photo ${index + 1}`} className="w-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="report-section">
            <h3 className="report-section-title">Measurement Equipment</h3>
            <div className="card">
              <div className="card-body">
                {measurementEquipment && measurementEquipment.length > 0 ? (
                  <div className="space-y-1">
                    {measurementEquipment.map((equip, index) => (
                      <p key={index}>
                        <span className="font-medium">Tool {index + 1}:</span> {equip.toolType || "Coating Meter"} - {equip.toolId || `CM-${789 + index}`}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p>No measurement equipment recorded.</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="report-footer">
            <div>
              <p className="font-medium text-lg">VALMONT SOLAR</p>
            </div>
            <div>
              <p>
                <span className="font-medium">Final Result:</span> 
                <span className={`ml-2 font-bold ${getStatusClass(inspectionStatus)}`}>
                  {getStatusText(inspectionStatus)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button 
          className="btn btn-secondary flex items-center"
          onClick={handleBackToInspection}
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Inspection
        </button>
        <button 
          className="btn btn-primary flex items-center"
          onClick={handleDownloadPDF}
        >
          <Download size={18} className="mr-2" /> Download PDF Report
        </button>
      </div>
    </div>
  );
};

export default ReportViewFixed;