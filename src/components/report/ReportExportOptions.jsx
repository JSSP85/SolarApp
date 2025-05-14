// src/components/report/ReportExportOptions.jsx
import React, { useState } from 'react';
import { Download, Save, Mail, Share2, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { exportToPDF, printReport, sendReportByEmail, generateFilename } from '../../utils/pdfExportService';
import { useInspection } from '../../context/InspectionContext';

/**
 * Component that provides options to export, print and share a report
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.reportData - Report data to generate filenames and share
 * @param {string} props.reportContainerId - DOM container ID that contains the report to export
 * @param {string} props.className - Additional CSS classes
 */
const ReportExportOptions = ({ reportData, reportContainerId = 'report-container', className = '' }) => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Acceso al contexto
  const { saveCurrentInspection, state } = useInspection();
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'success', 'error'

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'success', icon = null) => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 
                   type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 
                   'rgba(59, 130, 246, 0.95)';
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${bgColor};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 9999;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      animation: slideDown 0.3s ease-out;
    `;
    
    const iconSvg = icon || (type === 'success' ? 
      `<svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
        <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.06l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
      </svg>` : 
      `<svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
      </svg>`
    );
    
    notification.innerHTML = `${iconSvg}${message}`;
    document.body.appendChild(notification);
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 4000);
  };

  // Handle PDF download - Guardar primero luego generar PDF
  const handleDownloadPDF = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setSaveStatus('saving');
    
    try {
      // 1. Primero guardar en Firestore
      console.log('Guardando inspección antes de generar PDF...');
      const inspectionId = await saveCurrentInspection();
      setSaveStatus('success');
      
      // Mensaje de confirmación de guardado mejorado
      showNotification(
        `Data saved successfully! (ID: ${inspectionId.substring(0, 8)}...)`,
        'success'
      );
      
      // Esperar un momento para que el usuario vea la confirmación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 2. Luego generar el PDF
      console.log('Generando PDF...');
      const filename = generateFilename(reportData);
      
      await exportToPDF(reportContainerId, {
        filename: filename,
        orientation: 'portrait',
        scale: 2,
        showNotification: true
      });
      
      // Mensaje de confirmación de PDF
      showNotification(
        'PDF generated and downloaded successfully!',
        'success'
      );
      
    } catch (error) {
      console.error('Error en el proceso:', error);
      setSaveStatus('error');
      
      // Mensaje de error mejorado
      showNotification(
        `Error: ${error.message || 'Failed to save inspection and generate PDF'}`,
        'error'
      );
    } finally {
      setIsProcessing(false);
      // Resetear estado después de unos segundos
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // Handle save (solo guardar)
  const handleSave = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setSaveStatus('saving');
    
    try {
      console.log('Guardando inspección...');
      const inspectionId = await saveCurrentInspection();
      setSaveStatus('success');
      
      // Mensaje de confirmación de guardado mejorado
      showNotification(
        `Inspection saved successfully! (ID: ${inspectionId.substring(0, 8)}...)`,
        'success'
      );
      
    } catch (error) {
      console.error('Error saving inspection:', error);
      setSaveStatus('error');
      
      // Mensaje de error mejorado
      showNotification(
        `Error saving inspection: ${error.message || 'Unknown error'}`,
        'error'
      );
    } finally {
      setIsProcessing(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // Handle email sending
  const handleSendEmail = () => {
    setIsEmailModalOpen(true);
  };

  // Send email after entering address
  const handleSendEmailSubmit = (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      showNotification('Please enter a valid email address.', 'error');
      return;
    }
    
    const success = sendReportByEmail(email, reportData);
    
    if (success) {
      setIsEmailModalOpen(false);
      setEmail('');
      
      showNotification(
        'Your email client has been opened to send the report',
        'success'
      );
    } else {
      showNotification(
        'Failed to open email client. Please try again.',
        'error'
      );
    }
  };

  return (
    <div className={`report-export-options ${className}`}>
      <div className="flex flex-wrap gap-2 items-center justify-end">
        <button 
          className="btn btn-secondary flex items-center gap-2" 
          onClick={handleSave}
          disabled={isProcessing}
        >
          {saveStatus === 'saving' && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>}
          {saveStatus === 'success' && <CheckCircle size={16} className="text-green-600" />}
          {saveStatus === 'error' && <AlertTriangle size={16} className="text-red-600" />}
          {!saveStatus && <Save size={16} />}
          <span className="hidden sm:inline">
            {saveStatus === 'saving' ? 'Saving...' : 'Save Inspection'}
          </span>
        </button>
        
        <button 
          className="btn btn-primary flex items-center gap-2" 
          onClick={handleDownloadPDF}
          disabled={isProcessing}
        >
          {saveStatus === 'saving' && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>}
          {saveStatus === 'success' && <CheckCircle size={16} className="text-green-200" />}
          {saveStatus === 'error' && <AlertTriangle size={16} className="text-red-200" />}
          {!saveStatus && <Download size={16} />}
          <span className="hidden sm:inline">
            {saveStatus === 'saving' ? 'Saving & Exporting...' : 'Save & Export PDF'}
          </span>
        </button>
        
        <button 
          className="btn btn-success flex items-center gap-2" 
          onClick={handleSendEmail}
          disabled={isProcessing}
        >
          <Mail size={16} /> 
          <span className="hidden sm:inline">Email</span>
        </button>
      </div>

      {/* Email modal */}
      {isEmailModalOpen && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Mail size={18} className="mr-2 text-blue-600" /> 
              Send Report by Email
            </h3>
            
            <p className="text-gray-600 mb-4 text-sm">
              Enter the email address to which you'd like to send this report.
            </p>
            
            <form onSubmit={handleSendEmailSubmit}>
              <input 
                type="email"
                placeholder="Recipient's email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                  onClick={() => setIsEmailModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSS styles */}
      <style jsx>{`
        .btn {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 500;
          transition: all 0.2s;
          cursor: pointer;
          border: 1px solid transparent;
        }
        
        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .btn-primary {
          background-color: #3b82f6;
          color: white;
        }
        
        .btn-primary:hover:not(:disabled) {
          background-color: #2563eb;
        }
        
        .btn-secondary {
          background-color: #f3f4f6;
          color: #4b5563;
          border-color: #d1d5db;
        }
        
        .btn-secondary:hover:not(:disabled) {
          background-color: #e5e7eb;
        }
        
        .btn-success {
          background-color: #10b981;
          color: white;
        }
        
        .btn-success:hover:not(:disabled) {
          background-color: #059669;
        }
        
        .modal-overlay {
          backdrop-filter: blur(3px);
          transition: all 0.3s;
        }
        
        .modal-content {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
        }

        /* Animación para el spinner */
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ReportExportOptions;
