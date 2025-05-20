// src/utils/pdfExportService.js
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Exports a DOM element as PDF with improved styling
 */
export const exportToPDF = async (elementId, options = {}) => {
  const {
    filename = 'report',
    orientation = 'portrait',
    scale = 2,
    showNotification = true
  } = options;

  let notificationElement = null;
  if (showNotification) {
    notificationElement = createNotification('Generando PDF, espere por favor...');
  }

  try {
    // Obtener el elemento a exportar
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Elemento con ID ${elementId} no encontrado`);
    }

    // SOLUCIÓN RADICAL: Inyectar los estilos directamente en el elemento
    // antes de la captura para asegurar que se aplican
    const originalHTML = element.innerHTML;
    
    // 1. Aplicar clase al cuerpo
    document.body.classList.add('printing-pdf');
    
    // 2. Inyectar estilos inline directamente 
    const inlineStyles = `
      <style>
        /* Estilos forzados para PDF */
        .pdf-header {
          display: block !important;
          width: 100%;
          padding: 15mm 10mm 5mm 10mm;
          margin-bottom: 5mm;
          border-bottom: 3px solid #005F83;
        }
        
        .pdf-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .dashboard-card {
          box-shadow: none !important;
          border: 1.5pt solid #000000 !important; 
          margin-bottom: 5mm !important;
          padding: 0 !important;
          background-color: white !important;
        }
        
        .card-header {
          border-bottom: 1.5pt solid #000000 !important;
          background: #005F83 !important;
          color: white !important;
          padding: 3mm !important;
          font-weight: bold !important;
        }
        
        .card-body {
          padding: 4mm !important;
        }
        
        .report-section-title {
          background-color: #EEF2F6 !important;
          color: #000000 !important;
          padding: 2mm !important;
          border-left: 3mm solid #005F83 !important;
          font-weight: bold !important;
          font-size: 12pt !important;
          margin-bottom: 3mm !important;
        }
        
        .data-table {
          border-collapse: collapse !important;
          width: 100% !important;
        }
        
        .data-table th {
          background-color: #EEF2F6 !important;
          color: #000000 !important;
          font-weight: bold !important;
          border: 1pt solid #000000 !important;
          padding: 2mm !important;
          font-size: 9pt !important;
        }
        
        .data-table td {
          border: 1pt solid #000000 !important;
          padding: 2mm !important;
          font-size: 9pt !important;
        }
        
        .report-info-label {
          font-weight: bold !important;
          color: #005F83 !important;
        }
        
        .badge-success {
          background-color: #10B981 !important;
          color: white !important;
          padding: 1mm 2mm !important;
          border-radius: 2mm !important;
          font-weight: bold !important;
          display: inline-block !important;
        }
        
        .badge-danger {
          background-color: #EF4444 !important;
          color: white !important;
          padding: 1mm 2mm !important;
          border-radius: 2mm !important;
          font-weight: bold !important;
          display: inline-block !important;
        }
        
        .badge-warning {
          background-color: #F59E0B !important;
          color: white !important;
          padding: 1mm 2mm !important;
          border-radius: 2mm !important;
          font-weight: bold !important;
          display: inline-block !important;
        }
        
        .no-print {
          display: none !important;
        }
      </style>
    `;
    
    // Crear un contenedor temporal para la versión "adaptada para PDF"
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = inlineStyles + originalHTML;
    document.body.appendChild(tempContainer);
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '210mm'; // Ancho A4
    
    // 3. Crear el PDF con dimensiones exactas
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // 4. Configurar opciones mejoradas para html2canvas
    const canvas = await html2canvas(tempContainer, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: tempContainer.offsetWidth,
      height: tempContainer.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: tempContainer.offsetWidth,
      windowHeight: tempContainer.offsetHeight
    });
    
    // 5. Ajustar las dimensiones para que se centre en la página
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calcular dimensiones manteniendo proporción pero ajustando al ancho de página
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    
    // Centrar en la página
    const x = 0;
    const y = 0;
    
    // 6. Añadir imagen al PDF con dimensiones corregidas
    pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
    
    // 7. Limpiar elementos temporales y restaurar estado
    document.body.removeChild(tempContainer);
    document.body.classList.remove('printing-pdf');
    
    // Guardar el PDF
    pdf.save(`${filename}.pdf`);
    
    if (showNotification) {
      updateNotification(notificationElement, 'PDF generado correctamente', 'success');
    }
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    if (showNotification) {
      updateNotification(notificationElement, 'Error generando PDF. Por favor intente de nuevo.', 'error');
    }
    document.body.classList.remove('printing-pdf');
  }
};

/**
 * Sets up printing of an element with custom styles
 */
export const printReport = (options = {}) => {
  const { showNotification = true } = options;
  
  try {
    if (showNotification) {
      const notification = createNotification('Preparando impresión...');
      
      setTimeout(() => {
        window.print();
        updateNotification(notification, 'Diálogo de impresión abierto', 'success');
        
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 3000);
      }, 500);
    } else {
      window.print();
    }
  } catch (error) {
    console.error('Error al imprimir:', error);
    if (showNotification) {
      const notification = createNotification('Error al abrir diálogo de impresión', 'error');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    }
  }
};

/**
 * Creates a temporary notification on screen
 */
function createNotification(message, type = 'info') {
  const notification = document.createElement('div');
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 9999;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  if (type === 'success') {
    notification.style.backgroundColor = 'rgba(39, 174, 96, 0.9)';
    notification.style.color = 'white';
  } else if (type === 'error') {
    notification.style.backgroundColor = 'rgba(235, 87, 87, 0.9)';
    notification.style.color = 'white';
  } else {
    notification.style.backgroundColor = 'rgba(47, 128, 237, 0.9)';
    notification.style.color = 'white';
  }
  
  notification.innerText = message;
  document.body.appendChild(notification);
  
  return notification;
}

/**
 * Updates an existing notification
 */
function updateNotification(notification, message, type = 'info') {
  if (!notification) return;
  
  notification.innerText = message;
  
  if (type === 'success') {
    notification.style.backgroundColor = 'rgba(39, 174, 96, 0.9)';
  } else if (type === 'error') {
    notification.style.backgroundColor = 'rgba(235, 87, 87, 0.9)';
  } else {
    notification.style.backgroundColor = 'rgba(47, 128, 237, 0.9)';
  }
  
  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  }
}

/**
 * Generates a filename based on report data
 */
export const generateFilename = (reportData) => {
  const componentInfo = reportData.componentName || reportData.componentCode || 'Component';
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const statusText = reportData.inspectionStatus === 'pass' ? 'ACCEPTED' : 
                    (reportData.inspectionStatus === 'reject' ? 'REJECTED' : 'PROGRESS');
  
  return `Report_${componentInfo}_${statusText}_${dateStr}`;
};

/**
 * Generates an email to share the report
 */
export const sendReportByEmail = (email, reportData) => {
  // (Código existente para el email, mantenerlo igual)
  if (!email) {
    console.error('No email address provided');
    return;
  }
  
  try {
    // Prepare data for email subject
    const componentInfo = reportData.componentName || reportData.componentCode || 'Component';
    const dateStr = new Date().toLocaleDateString();
    const statusText = reportData.inspectionStatus === 'pass' ? 'ACCEPTED' : 
                      (reportData.inspectionStatus === 'reject' ? 'REJECTED' : 'IN PROGRESS');
    
    // Build email body with report summary
    const emailBody = `
      Inspection Report: ${componentInfo}
      Date: ${dateStr}
      Status: ${statusText}
      
      This email contains a summary of the inspection report generated by the Valmont Solar Quality Control system.
      
      * Component Information:
      - Project: ${reportData.projectName || "NEPI"}
      - Family: ${reportData.componentFamily || "TORQUE TUBES"}
      - Code: ${reportData.componentCode || "ttg45720"}
      - Name: ${reportData.componentName || "Torque tube 140x100x3.5mm"}
      
      * Inspection Information:
      - Inspector: ${reportData.inspector || "John Smith"}
      - Date: ${reportData.inspectionDate || dateStr}
      - Location: ${reportData.inspectionCity && reportData.inspectionCountry ? 
                  `${reportData.inspectionCity}, ${reportData.inspectionCountry}` : "Madrid, Spain"}
      
      * Result:
      - Final status: ${statusText}
      - Non-conformities: ${calculateTotalNonConformities(reportData)}
      
      Note: This is an automated email generated by the system. For the complete PDF report, please contact the quality department.
    `;
    
    // Encode subject and body for mailto
    const encodedSubject = encodeURIComponent(`Inspection Report: ${componentInfo} - ${statusText}`);
    const encodedBody = encodeURIComponent(emailBody);
    
    // Open user's email client
    window.location.href = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
    
    return true;
  } catch (error) {
    console.error('Error preparing email:', error);
    return false;
  }
};

/**
 * Calculates total non-conformities in a report
 */
function calculateTotalNonConformities(reportData) {
  if (!reportData.dimensionNonConformities) return 0;
  return Object.values(reportData.dimensionNonConformities).reduce((sum, count) => sum + count, 0);
}
