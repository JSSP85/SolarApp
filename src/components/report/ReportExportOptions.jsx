// src/components/report/ReportExportOptions.jsx
import React, { useState } from 'react';
import { Download, Printer, Mail, Share2, FileText } from 'lucide-react';
import { exportToPDF, printReport, sendReportByEmail, generateFilename } from '../../utils/pdfExportService';

/**
 * Componente que proporciona opciones para exportar, imprimir y compartir un informe
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.reportData - Datos del informe para generar nombres de archivo y compartir
 * @param {string} props.reportContainerId - ID del contenedor DOM que contiene el informe a exportar
 * @param {string} props.className - Clases CSS adicionales
 */
const ReportExportOptions = ({ reportData, reportContainerId = 'report-container', className = '' }) => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Manejar descarga de PDF
  const handleDownloadPDF = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const filename = generateFilename(reportData);
    
    await exportToPDF(reportContainerId, {
      filename: filename,
      orientation: 'portrait',
      scale: 2,
      showNotification: true
    });
    
    setIsProcessing(false);
  };

  // Manejar impresión
  const handlePrintReport = () => {
    if (isProcessing) return;
    printReport({ showNotification: true });
  };

  // Manejar envío por correo electrónico
  const handleSendEmail = () => {
    setIsEmailModalOpen(true);
  };

  // Enviar el correo después de introducir la dirección
  const handleSendEmailSubmit = (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      alert('Por favor, introduce un correo electrónico válido.');
      return;
    }
    
    const success = sendReportByEmail(email, reportData);
    
    if (success) {
      setIsEmailModalOpen(false);
      setEmail('');
      
      // Mostrar mensaje de confirmación
      const confirmationMsg = document.createElement('div');
      confirmationMsg.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(22, 163, 74, 0.9);color:white;padding:10px 20px;border-radius:8px;z-index:9999;font-weight:bold;';
      confirmationMsg.innerText = 'Se ha abierto tu cliente de correo para enviar el reporte';
      document.body.appendChild(confirmationMsg);
      
      // Ocultar el mensaje después de 3 segundos
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
          onClick={handlePrintReport}
          disabled={isProcessing}
        >
          <Printer size={16} /> 
          <span className="hidden sm:inline">Imprimir</span>
        </button>
        
        <button 
          className="btn btn-primary flex items-center gap-2" 
          onClick={handleDownloadPDF}
          disabled={isProcessing}
        >
          <Download size={16} /> 
          <span className="hidden sm:inline">Descargar PDF</span>
        </button>
        
        <button 
          className="btn btn-success flex items-center gap-2" 
          onClick={handleSendEmail}
          disabled={isProcessing}
        >
          <Mail size={16} /> 
          <span className="hidden sm:inline">Enviar via Email</span>
        </button>
      </div>

      {/* Modal de correo electrónico */}
      {isEmailModalOpen && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Mail size={18} className="mr-2 text-blue-600" /> 
              Enviar Reporte por Email
            </h3>
            
            <p className="text-gray-600 mb-4 text-sm">
              Introduce la dirección de correo electrónico a la que deseas enviar este reporte.
            </p>
            
            <form onSubmit={handleSendEmailSubmit}>
              <input 
                type="email"
                placeholder="Email del destinatario"
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
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Estilos CSS para asegurar compatibilidad con el tema actual */}
      <style jsx>{`
        .btn {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 500;
          transition: all 0.2s;
          cursor: pointer;
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
      `}</style>
    </div>
  );
};

export default ReportExportOptions;