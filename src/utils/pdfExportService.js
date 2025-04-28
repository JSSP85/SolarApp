// src/utils/pdfExportService.js
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Exporta un elemento DOM como PDF usando html2canvas y jsPDF
 * @param {string} elementId - ID del elemento DOM a exportar
 * @param {Object} options - Opciones de configuración
 * @param {string} options.filename - Nombre del archivo (sin extensión)
 * @param {string} options.orientation - Orientación del PDF ('portrait' o 'landscape')
 * @param {number} options.scale - Escala para html2canvas (recomendado 2-4 para mejor calidad)
 * @param {boolean} options.showNotification - Mostrar notificaciones durante el proceso
 * @returns {Promise<void>}
 */
export const exportToPDF = async (elementId, options = {}) => {
  const {
    filename = 'report',
    orientation = 'portrait',
    scale = 2,
    showNotification = true
  } = options;

  // Elemento que se exportará
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Elemento con ID ${elementId} no encontrado`);
    return;
  }

  // Mostrar notificación de inicio si está habilitado
  let notificationElement = null;
  if (showNotification) {
    notificationElement = createNotification('Generando PDF, por favor espere...');
  }

  try {
    // Capturar el elemento como imagen con html2canvas
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Crear PDF
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm'
    });

    // Obtener dimensiones
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Si la altura es mayor que una página, manejamos páginas múltiples
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    if (pdfHeight > pageHeight) {
      // Divide la imagen en múltiples páginas
      let heightLeft = pdfHeight;
      let position = 0;
      let page = 1;

      // Primera página
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      
      // Páginas adicionales si es necesario
      while (heightLeft > 0) {
        position = -pageHeight * page;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
        page++;
      }
    } else {
      // Cabe en una sola página
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    // Guardar PDF
    pdf.save(`${filename}.pdf`);

    if (showNotification) {
      // Actualizar notificación a éxito
      updateNotification(notificationElement, 'PDF generado correctamente', 'success');
    }
  } catch (error) {
    console.error('Error al generar PDF:', error);
    
    if (showNotification) {
      // Actualizar notificación a error
      updateNotification(notificationElement, 'Error al generar PDF. Inténtelo de nuevo.', 'error');
    }
  }
};

/**
 * Configura la impresión de un elemento con estilos personalizados
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.showNotification - Mostrar notificaciones durante el proceso
 */
export const printReport = (options = {}) => {
  const { showNotification = true } = options;
  
  try {
    if (showNotification) {
      const notification = createNotification('Preparando para imprimir...');
      
      // Damos tiempo para que la notificación se muestre antes de abrir el diálogo de impresión
      setTimeout(() => {
        window.print();
        updateNotification(notification, 'Diálogo de impresión abierto', 'success');
        
        // Eliminar la notificación después de unos segundos
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
      const notification = createNotification('Error al abrir el diálogo de impresión', 'error');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    }
  }
};

/**
 * Crea una notificación temporal en la pantalla
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación ('info', 'success', 'error')
 * @returns {HTMLElement} - Elemento de notificación creado
 */
function createNotification(message, type = 'info') {
  // Crear el elemento de notificación
  const notification = document.createElement('div');
  
  // Estilo base
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
  
  // Configurar color según el tipo
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
  
  // Añadir mensaje
  notification.innerText = message;
  
  // Añadir al DOM
  document.body.appendChild(notification);
  
  return notification;
}

/**
 * Actualiza una notificación existente
 * @param {HTMLElement} notification - Elemento de notificación a actualizar
 * @param {string} message - Nuevo mensaje
 * @param {string} type - Nuevo tipo ('info', 'success', 'error')
 */
function updateNotification(notification, message, type = 'info') {
  if (!notification) return;
  
  // Actualizar mensaje
  notification.innerText = message;
  
  // Actualizar estilo según el tipo
  if (type === 'success') {
    notification.style.backgroundColor = 'rgba(39, 174, 96, 0.9)';
  } else if (type === 'error') {
    notification.style.backgroundColor = 'rgba(235, 87, 87, 0.9)';
  } else {
    notification.style.backgroundColor = 'rgba(47, 128, 237, 0.9)';
  }
  
  // Eliminar después de 3 segundos si es éxito o error
  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      if (notification.parentNode) {
        // Animación de desvanecimiento
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
 * Genera un nombre de archivo basado en los datos del reporte
 * @param {Object} reportData - Datos del reporte
 * @returns {string} - Nombre del archivo generado
 */
export const generateFilename = (reportData) => {
  const componentInfo = reportData.componentName || reportData.componentCode || 'Component';
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const statusText = reportData.inspectionStatus === 'pass' ? 'ACCEPTED' : 
                    (reportData.inspectionStatus === 'reject' ? 'REJECTED' : 'PROGRESS');
  
  return `Report_${componentInfo}_${statusText}_${dateStr}`;
};

/**
 * Genera un correo electrónico para compartir el reporte
 * @param {string} email - Correo electrónico del destinatario
 * @param {Object} reportData - Datos del reporte
 */
export const sendReportByEmail = (email, reportData) => {
  if (!email) {
    console.error('No se proporcionó una dirección de correo electrónico');
    return;
  }
  
  try {
    // Preparar datos para el asunto del correo
    const componentInfo = reportData.componentName || reportData.componentCode || 'Component';
    const dateStr = new Date().toLocaleDateString();
    const statusText = reportData.inspectionStatus === 'pass' ? 'ACCEPTED' : 
                      (reportData.inspectionStatus === 'reject' ? 'REJECTED' : 'IN PROGRESS');
    
    // Construir el cuerpo del correo con un resumen del reporte
    const emailBody = `
      Reporte de Inspección: ${componentInfo}
      Fecha: ${dateStr}
      Estado: ${statusText}
      
      Este correo contiene un resumen del reporte de inspección generado por el sistema de Control de Calidad de Valmont Solar.
      
      * Información del Componente:
      - Proyecto: ${reportData.projectName || "NEPI"}
      - Familia: ${reportData.componentFamily || "TORQUE TUBES"}
      - Código: ${reportData.componentCode || "ttg45720"}
      - Nombre: ${reportData.componentName || "Torque tube 140x100x3.5mm"}
      
      * Información de Inspección:
      - Inspector: ${reportData.inspector || "John Smith"}
      - Fecha: ${reportData.inspectionDate || dateStr}
      - Ubicación: ${reportData.inspectionCity && reportData.inspectionCountry ? 
                  `${reportData.inspectionCity}, ${reportData.inspectionCountry}` : "Madrid, Spain"}
      
      * Resultado:
      - Estado final: ${statusText}
      - No conformidades: ${calculateTotalNonConformities(reportData)}
      
      Nota: Este es un correo automático generado por el sistema. Para obtener el reporte completo en PDF, por favor contacte con el departamento de calidad.
    `;
    
    // Codificar el asunto y cuerpo para mailto
    const encodedSubject = encodeURIComponent(`Reporte de Inspección: ${componentInfo} - ${statusText}`);
    const encodedBody = encodeURIComponent(emailBody);
    
    // Abrir cliente de correo del usuario
    window.location.href = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
    
    return true;
  } catch (error) {
    console.error('Error al preparar el correo electrónico:', error);
    return false;
  }
};

/**
 * Calcula el total de no conformidades de un reporte
 * @param {Object} reportData - Datos del reporte
 * @returns {number} - Total de no conformidades
 */
function calculateTotalNonConformities(reportData) {
  if (!reportData.dimensionNonConformities) return 0;
  return Object.values(reportData.dimensionNonConformities).reduce((sum, count) => sum + count, 0);
}