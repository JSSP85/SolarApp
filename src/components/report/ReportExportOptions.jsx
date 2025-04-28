// src/components/report/ReportExportOptions.jsx
import React, { useState } from 'react';
import { Download, Save, Mail, Share2, FileText } from 'lucide-react';
import { exportToPDF, printReport, sendReportByEmail, generateFilename } from '../../utils/pdfExportService';

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

  // Handle PDF download
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

  // Handle save (formerly print function)
  const handleSave = () => {
    // This will be used for a different function in the future
    // For now, we'll just show a notification
    const confirmationMsg = document.createElement('div');
    confirmationMsg.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(22, 163, 74, 0.9);color:white;padding:10px 20px;border-radius:8px;z-index:9999;font-weight:bold;';
    confirmationMsg.innerText = 'Save functionality will be implemented soon';
    document.body.appendChild(confirmationMsg);
    
    // Hide the message after 3 seconds
    setTimeout(() => {
      document.body.removeChild(confirmationMsg);
    }, 3000);
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
          <Save size={16} /> 
          <span className="hidden sm:inline">Save</span>
        </button>
        
        <button 
          className="btn btn-primary flex items-center gap-2" 
          onClick={handleDownloadPDF}
          disabled={isProcessing}
        >
          <Download size={16} /> 
          <span className="hidden sm:inline">Download PDF</span>
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

      {/* CSS styles to ensure compatibility with current theme */}
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
