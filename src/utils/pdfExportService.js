// src/utils/pdfExportService.js
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Exporta un elemento DOM como PDF con paginación mejorada
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
    // Obtener el elemento principal
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Elemento con ID ${elementId} no encontrado`);
    }

    // Marcar el cuerpo para aplicar estilos de impresión
    document.body.classList.add('printing-pdf');

    // Configurar el documento PDF
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Obtener dimensiones de página
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Configurar márgenes
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    
    // Encontrar secciones de página
    const pagesSections = element.querySelectorAll('.pdf-page-section');
    
    if (pagesSections.length === 0) {
      updateNotification(
        notificationElement, 
        'Error: No se encontraron secciones de página. Por favor contacte al desarrollador.', 
        'error'
      );
      document.body.classList.remove('printing-pdf');
      return;
    }
    
    // Procesar cada sección como una página separada
    for (let i = 0; i < pagesSections.length; i++) {
      if (showNotification && i > 0) {
        updateNotification(
          notificationElement, 
          `Procesando página ${i + 1} de ${pagesSections.length}...`, 
          'info'
        );
      }
      
      // Añadir nueva página excepto para la primera
      if (i > 0) {
        pdf.addPage();
      }
      
      // Clonar la sección para no modificar el original
      const sectionToCapture = pagesSections[i].cloneNode(true);
      
      // Crear div temporal para contener la sección
      const tempContainer = document.createElement('div');
      
      // Añadir estilos mejorados inline para asegurar su aplicación
      const enhancedStyles = `
        <style>
          /* Estilos base */
          body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
          }
          
          /* Encabezado mejorado */
          .pdf-header {
            display: block !important;
            width: 100%;
            padding: 15mm 10mm 5mm 10mm;
            margin-bottom: 5mm;
            border-bottom: 3px solid #005F83;
            position: relative;
          }
          
          .pdf-header:after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 1px;
            background: linear-gradient(90deg, rgba(0,95,131,0.7) 0%, rgba(0,95,131,0.3) 100%);
          }
          
          .pdf-header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          
          .pdf-logo-container {
            width: 30mm;
            background-color: #005F83;
            padding: 10px;
            border-radius: 4px;
          }
          
          .pdf-title-container {
            text-align: right;
          }
          
          .pdf-title {
            font-size: 24pt;
            font-weight: bold;
            margin: 0;
            color: #005F83;
            letter-spacing: 1px;
          }
          
          .pdf-subtitle {
            font-size: 16pt;
            font-weight: normal;
            margin: 0;
            color: #666;
          }
          
          /* Cards mejoradas */
          .dashboard-card {
            box-shadow: none !important;
            border: 1.5pt solid #005F83 !important;
            border-radius: 6px !important;
            margin-bottom: 5mm !important;
            background-color: #fafaf8 !important; /* Crema muy suave */
            overflow: hidden !important;
          }
          
          .card-header {
            border-bottom: 1.5pt solid #005F83 !important;
            background: linear-gradient(135deg, #005F83 0%, #007BA7 100%) !important;
            color: white !important;
            padding: 3mm !important;
            font-weight: bold !important;
          }
          
          .card-body {
            padding: 4mm !important;
            background-color: #fefefe !important;
          }
          
          /* Tablas mejoradas */
          .data-table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          
          .data-table th {
            background: linear-gradient(to bottom, #EEF2F6, #E2E8F0) !important;
            color: #000000 !important;
            font-weight: bold !important;
            border: 1pt solid #005F83 !important;
            padding: 2mm !important;
            font-size: 9pt !important;
          }
          
          .data-table td {
            border: 1pt solid #CBD5E1 !important;
            padding: 2mm !important;
            font-size: 9pt !important;
          }
          
          .data-table tr:nth-child(even) td {
            background-color: #F8FAFC !important;
          }
          
          /* Títulos de sección */
          .report-section-title {
            background: linear-gradient(to right, #EEF2F6, #F8FAFC) !important;
            color: #000000 !important;
            padding: 2mm !important;
            border-left: 3mm solid #005F83 !important;
            font-weight: bold !important;
            font-size: 12pt !important;
            margin-bottom: 3mm !important;
            border-radius: 0 4px 4px 0 !important;
          }
          
          /* Etiquetas y valores */
          .report-info-label {
            font-weight: bold !important;
            color: #005F83 !important;
          }
          
          .report-info-value {
            font-weight: normal !important;
          }
          
          .report-info-item {
            margin-bottom: 2mm !important;
            border-bottom: 0.5pt dotted #CBD5E1 !important;
            padding-bottom: 1mm !important;
          }
          
          /* Badges mejorados */
          .badge {
            padding: 1mm 2mm !important;
            border-radius: 2mm !important;
            font-weight: bold !important;
            display: inline-block !important;
          }
          
          .badge-success {
            background: linear-gradient(135deg, #10B981, #059669) !important;
            color: white !important;
          }
          
          .badge-danger {
            background: linear-gradient(135deg, #EF4444, #DC2626) !important;
            color: white !important;
          }
          
          .badge-warning {
            background: linear-gradient(135deg, #F59E0B, #D97706) !important;
            color: white !important;
          }
          
          /* Ajustes para gráficos */
          .dimension-chart, 
          .chart-container,
          .technical-drawing-container,
          .technical-drawing-container-report,
          .dimension-mini-chart,
          .coating-chart {
            background-color: #fefefe !important;
            border: 1pt solid #E2E8F0 !important;
            border-radius: 4px !important;
            padding: 2mm !important;
          }
          
          /* Ocultar elementos innecesarios */
          .no-print {
            display: none !important;
          }
        </style>
      `;
      
      tempContainer.innerHTML = enhancedStyles;
      tempContainer.appendChild(sectionToCapture);
      
      // Añadir temporalmente al documento pero fuera de la vista
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = pageWidth + 'mm';
      document.body.appendChild(tempContainer);
      
      try {
        // Capturar la sección como imagen
        const canvas = await html2canvas(tempContainer, {
          scale: scale,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: tempContainer.scrollWidth,
          height: tempContainer.scrollHeight,
          windowWidth: tempContainer.scrollWidth,
          windowHeight: tempContainer.scrollHeight
        });
        
        // Convertir a imagen
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgProps = pdf.getImageProperties(imgData);
        
        // Calcular dimensiones manteniendo proporción
        let imgWidth = contentWidth;
        let imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        
        // Si es demasiado alto, ajustar al alto disponible
        const contentHeight = pageHeight - (margin * 2);
        if (imgHeight > contentHeight) {
          imgHeight = contentHeight;
          imgWidth = (imgProps.width * imgHeight) / imgProps.height;
        }
        
        // Centrar en la página
        const x = margin + (contentWidth - imgWidth) / 2;
        const y = margin;
        
        // Añadir al PDF
        pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
        
        // Limpiar el contenedor temporal
        document.body.removeChild(tempContainer);
        
      } catch (error) {
        console.error(`Error procesando página ${i+1}:`, error);
        if (tempContainer.parentNode) {
          document.body.removeChild(tempContainer);
        }
      }
    }
    
    // Quitar clase de impresión
    document.body.classList.remove('printing-pdf');
    
    // Guardar el PDF
    pdf.save(`${filename}.pdf`);
    
    if (showNotification) {
      updateNotification(notificationElement, 'PDF generado correctamente', 'success');
    }
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    document.body.classList.remove('printing-pdf');
    
    if (showNotification) {
      updateNotification(
        notificationElement, 
        'Error generando PDF. Por favor intente de nuevo: ' + error.message, 
        'error'
      );
    }
  }
};

/**
 * Prepara la impresión de un elemento con estilos personalizados
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
 * Crea una notificación temporal en pantalla
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
 * Actualiza una notificación existente
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
 * Genera un nombre de archivo basado en los datos del informe
 */
export const generateFilename = (reportData) => {
  const componentInfo = reportData.componentName || reportData.componentCode || 'Component';
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const statusText = reportData.inspectionStatus === 'pass' ? 'ACCEPTED' : 
                    (reportData.inspectionStatus === 'reject' ? 'REJECTED' : 'PROGRESS');
  
  return `Report_${componentInfo}_${statusText}_${dateStr}`;
};

/**
 * Genera un correo electrónico para compartir el informe
 */
export const sendReportByEmail = (email, reportData) => {
  if (!email) {
    console.error('No email address provided');
    return false;
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
 * Calcula el total de no conformidades en un informe
 */
function calculateTotalNonConformities(reportData) {
  if (!reportData.dimensionNonConformities) return 0;
  return Object.values(reportData.dimensionNonConformities).reduce((sum, count) => sum + count, 0);
}
