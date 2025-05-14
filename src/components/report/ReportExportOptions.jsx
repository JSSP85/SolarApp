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
      
      // Mostrar mensaje de éxito temporal
      const successMsg = document.createElement('div');
      successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(16, 185, 129, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 8px;
      `;
      successMsg.innerHTML = `
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.06l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
        </svg>
        Inspection saved successfully! (ID: ${inspectionId.substring(0, 8)}...)
      `;
      document.body.appendChild(successMsg);
      
      setTimeout(() => {
        if (successMsg.parentNode) {
          document.body.removeChild(successMsg);
        }
      }, 3000);
      
      // 2. Luego generar el PDF
      console.log('Generando PDF...');
      const filename = generateFilename(reportData);
      
      await exportToPDF(reportContainerId, {
        filename: filename,
        orientation: 'portrait',
        scale: 2,
        showNotification: true
      });
      
    } catch (error) {
      console.error('Error en el proceso:', error);
      setSaveStatus('error');
      
      // Mostrar mensaje de error
      const errorMsg = document.createElement('div');
      errorMsg.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(239, 68, 68, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 8px;
      `;
      errorMsg.innerHTML = `
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
        Error saving inspection: ${error.message}
      `;
      document.body.appendChild(errorMsg);
      
      setTimeout(() => {
        if (errorMsg.parentNode) {
          document.body.removeChild(errorMsg);
        }
      }, 5000);
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
      
      // Mostrar mensaje de éxito
      const confirmationMsg = document.createElement('div');
      confirmationMsg.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(16, 185, 129, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 8px;
      `;
      confirmationMsg.innerHTML = `
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.06l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
        </svg>
        Inspection saved successfully! (ID: ${inspectionId.substring(0, 8)}...)
      `;
      document.body.appendChild(confirmationMsg);
      
      setTimeout(() => {
        if (confirmationMsg.parentNode) {
          document.body.removeChild(confirmationMsg);
        }
      }, 3000);
    } catch (error) {
      console.error('Error saving inspection:', error);
      setSaveStatus('error');
      
      const errorMsg = document.createElement('div');
      errorMsg.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(239, 68, 68, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 8px;
      `;
      errorMsg.innerHTML = `
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
        Error saving inspection: ${error.message}
      `;
      document.body.appendChild(errorMsg);
      
      setTimeout(() => {
        if (errorMsg.parentNode) {
          document.body.removeChild(errorMsg);
        }
      }, 5000);
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
      alert('Please enter a valid email address.');
      return;
    }
    
    const success = sendReportByEmail(email, reportData);
    
    if (success) {
      setIsEmailModalOpen(false);
      setEmail('');
      
      // Show confirmation message
      const confirmationMsg = document.createElement('div');
      confirmationMsg.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(22, 163, 74, 0.9);color:white;padding:10px 20px;border-radius:8px;z-index:9999;font-weight:bold;';
      confirmationMsg.innerText = 'Your email client has been opened to send the report';
      document.body.appendChild(confirmationMsg);
      
      // Hide the message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(confirmationMsg);
      }, 3000);
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
            {saveStatus === 'saving' ? 'Saving...' : 'Save'}
          </span>
        </button>
        
        <button 
          className="btn btn-primary flex items-center gap-2" 
          onClick={handleDownloadPDF}
          disabled={isProcessing}
        >
          {saveStatus === 'saving' && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>}
          {saveStatus === 'success' && <CheckCircle size={16} className="text-green-600" />}
          {saveStatus === 'error' && <AlertTriangle size={16} className="text-red-600" />}
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
