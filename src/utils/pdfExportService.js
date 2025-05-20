// src/utils/pdfExportService.js
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Agrega un encabezado personalizado directamente al PDF
 */
function addHeaderToPdf(pdf) {
  // Obtener dimensiones de página
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Configurar color azul corporativo
  pdf.setFillColor(0, 95, 131); // #005F83
  
  // Crear rectángulo azul para el logo (más ancho para texto más largo)
  pdf.rect(10, 10, 35, 15, 'F');
  
  // Añadir texto "VALMONT SOLAR" en blanco sobre el rectángulo azul
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11); // Tamaño más pequeño para que quepa
  pdf.text("VALMONT SOLAR", 27.5, 18, { align: "center" });
  
  // Añadir título del informe
  pdf.setTextColor(0, 95, 131); // #005F83
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("INSPECTION REPORT", pageWidth - 10, 18, { align: "right" });
  
  // Añadir subtítulo
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "normal");
  pdf.text("Steel Components", pageWidth - 10, 25, { align: "right" });
  
  // Añadir línea horizontal
  pdf.setDrawColor(0, 95, 131);
  pdf.setLineWidth(0.5);
  pdf.line(10, 30, pageWidth - 10, 30);
}

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
      
      // Añadir encabezado a esta página
      addHeaderToPdf(pdf);
      
      // Clonar la sección para no modificar el original
      const sectionToCapture = pagesSections[i].cloneNode(true);
      
      // TRATAMIENTO ESPECIAL PARA LA PÁGINA 2 - OCULTAR GRAFICOS DIMENSIONALES
      if (i === 1) {
        // 1. Ocultar los mini gráficos dimensionales
        const dimensionCharts = sectionToCapture.querySelectorAll('.dimension-charts-grid, .dimension-mini-chart');
        dimensionCharts.forEach(chart => {
          chart.style.display = 'none';
        });
        
        // 2. Quitar cualquier referencia a análisis dimensional
        const analysisCharts = sectionToCapture.querySelectorAll('h4.text-sm.font-semibold.mb-2.text-gray-500');
        analysisCharts.forEach(header => {
          if (header.textContent.includes('Dimensional Analysis')) {
            header.style.display = 'none';
          }
        });
        
        // 3. Asegurarse que todos los contenedores usen ancho apropiado
        const containers = sectionToCapture.querySelectorAll('.dashboard-card, .card, .technical-drawing-container, .technical-drawing-container-report, .data-table');
        containers.forEach(container => {
          container.style.width = '100%';
          container.style.maxWidth = '100%';
          container.style.margin = '0 auto';
          container.style.boxSizing = 'border-box';
          // Eliminar cualquier restricción de ancho adicional
          container.style.minWidth = '100%';
        });
        
        // 4. Específicamente para la tabla de dimensiones, asegurarse que use ancho completo
        const tables = sectionToCapture.querySelectorAll('.data-table');
        tables.forEach(table => {
          table.style.width = '100%';
          table.style.tableLayout = 'fixed';
        });
      }
      
      // TRATAMIENTO ESPECIAL PARA TODAS LAS PÁGINAS - EVITAR CORTES EN LOS BORDES
      // Ajustar cards para evitar que se corten en los bordes
      const allCards = sectionToCapture.querySelectorAll('.dashboard-card, .card');
      allCards.forEach(card => {
        card.style.width = '97%'; // Reducir ligeramente el ancho
        card.style.maxWidth = '97%';
        card.style.margin = '0 auto 10px auto'; // Centrar horizontalmente
        card.style.boxSizing = 'border-box';
        card.style.overflowX = 'hidden'; // Prevenir desbordamiento horizontal
      });
      
      // Ajustar componentes específicos como el coating chart que se corta
      const coatingCharts = sectionToCapture.querySelectorAll('.coating-chart');
      coatingCharts.forEach(chart => {
        chart.style.width = '95%';
        chart.style.maxWidth = '95%';
        chart.style.marginLeft = 'auto';
        chart.style.marginRight = 'auto';
        chart.style.overflowX = 'hidden';
      });
      
      // Ajustar la información de inspección que se corta
      const inspectionInfoCards = sectionToCapture.querySelectorAll('.card-header:contains("Inspection Information")').closest('.dashboard-card');
      if (inspectionInfoCards.length > 0) {
        inspectionInfoCards.forEach(card => {
          card.style.width = '95%';
          card.style.maxWidth = '95%';
          card.style.overflowX = 'hidden';
        });
      }
      
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
          
          /* Ocultar encabezado HTML ya que usamos uno nativo en PDF */
          .pdf-header {
            display: none !important;
          }
          
          /* OCULTAR MINI GRÁFICOS EN LA PÁGINA 2 */
          .pdf-page-section[data-page="2"] .dimension-charts-grid,
          .pdf-page-section[data-page="2"] .dimension-mini-chart,
          .pdf-page-section[data-page="2"] .dimension-chart {
            display: none !important;
          }
          
          /* EVITAR CORTE EN LOS BORDES PARA TODAS LAS PÁGINAS */
          .dashboard-card, .card {
            width: 97% !important;
            max-width: 97% !important;
            margin: 0 auto 10px auto !important;
            box-sizing: border-box !important;
            overflow-x: hidden !important;
          }
          
          /* Ajustes para coating chart que se corta */
          .coating-chart {
            width: 95% !important;
            max-width: 95% !important;
            margin-left: auto !important;
            margin-right: auto !important;
            overflow-x: hidden !important;
          }
          
          /* Ajustes para mapas y otros elementos con posible desbordamiento */
          .technical-drawing-container, 
          .technical-drawing-container-report {
            width: 95% !important;
            max-width: 95% !important;
            margin: 10px auto !important;
            overflow: hidden !important;
          }
          
          /* Cards mejoradas */
          .dashboard-card {
            box-shadow: none !important;
            border: 1.5pt solid #005F83 !important;
            border-radius: 6px !important;
            margin-bottom: 5mm !important;
            background-color: #fafaf8 !important; /* Crema muy suave */
            overflow: hidden !important;
            page-break-inside: avoid !important;
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
            overflow-x: hidden !important;
          }
          
          /* Tablas mejoradas */
          .data-table {
            border-collapse: collapse !important;
            width: 98% !important;
            max-width: 98% !important;
            table-layout: fixed !important;
            margin: 0 auto !important;
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
            word-break: break-word !important;
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
            width: 98% !important;
            max-width: 98% !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          
          /* Etiquetas y valores */
          .report-info-label {
            font-weight: bold !important;
            color: #005F83 !important;
          }
          
          .report-info-value {
            font-weight: normal !important;
            word-break: break-word !important;
          }
          
          .report-info-item {
            margin-bottom: 2mm !important;
            border-bottom: 0.5pt dotted #CBD5E1 !important;
            padding-bottom: 1mm !important;
            overflow: hidden !important;
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
          
          /* Estilos específicos para dibujos técnicos y gráficos */
          .technical-drawing-container, 
          .technical-drawing-container-report {
            height: auto !important;
            min-height: 250px !important;
            max-height: none !important;
            margin-bottom: 10mm !important;
            overflow: hidden !important;
            background-color: #fafafa !important;
            border: 1pt solid #E2E8F0 !important;
            border-radius: 4px !important;
            padding: 4mm !important;
          }

          .technical-drawing-image {
            max-width: 100% !important;
            height: auto !important;
            display: block !important;
            margin: 0 auto !important;
          }
          
          /* Ajustes específicos para SVG y gráficos recharts */
          svg {
            max-width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          /* Para contenedores de mapas */
          div[id^="map-"] {
            width: 95% !important;
            max-width: 95% !important;
            margin: 0 auto !important;
            overflow: hidden !important;
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
      tempContainer.style.width = (pageWidth - 5) + 'mm'; // Reducir ligeramente el ancho para evitar cortes
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
          windowHeight: tempContainer.scrollHeight,
          imageTimeout: 15000, // Dar más tiempo para cargar imágenes
          onclone: function(documentClone) {
            // Aplicar estilos a encabezados de tarjetas
            const cardHeaders = documentClone.querySelectorAll('.card-header');
            cardHeaders.forEach(header => {
              header.style.background = 'linear-gradient(135deg, #005F83 0%, #007BA7 100%)';
              header.style.color = 'white';
              header.style.fontWeight = 'bold';
              header.style.padding = '8px';
            });
            
            // Aplicar estilos a tarjetas para evitar que se corten
            const cards = documentClone.querySelectorAll('.dashboard-card, .card');
            cards.forEach(card => {
              card.style.border = '2px solid #005F83';
              card.style.borderRadius = '6px';
              card.style.overflow = 'hidden';
              card.style.backgroundColor = '#fafaf8';
              card.style.marginBottom = '15px';
              card.style.width = '97%';
              card.style.maxWidth = '97%';
              card.style.marginLeft = 'auto';
              card.style.marginRight = 'auto';
            });
            
            // AJUSTES ESPECÍFICOS PARA LAS TARJETAS QUE SE CORTAN
            // 1. Tarjeta de Inspection Information
            const inspectionCards = documentClone.querySelectorAll('.card-header');
            inspectionCards.forEach(header => {
              if (header.textContent && header.textContent.includes('Inspection Information')) {
                const parentCard = header.closest('.dashboard-card, .card');
                if (parentCard) {
                  parentCard.style.width = '95%';
                  parentCard.style.maxWidth = '95%';
                  parentCard.style.overflowX = 'hidden';
                  
                  // También ajustar el contenido interior
                  const infoItems = parentCard.querySelectorAll('.report-info-item');
                  infoItems.forEach(item => {
                    item.style.overflowX = 'hidden';
                    item.style.wordBreak = 'break-word';
                    
                    // Reducir tamaño de fuente si es necesario para textos largos
                    const valueSpan = item.querySelector('.report-info-value');
                    if (valueSpan && valueSpan.textContent.length > 25) {
                      valueSpan.style.fontSize = '0.85em';
                      valueSpan.style.wordBreak = 'break-word';
                    }
                  });
                }
              }
            });
            
            // 2. Gráfico de Coating
            const coatingCharts = documentClone.querySelectorAll('.coating-chart');
            coatingCharts.forEach(chart => {
              chart.style.width = '95%';
              chart.style.maxWidth = '95%';
              chart.style.marginLeft = 'auto';
              chart.style.marginRight = 'auto';
              chart.style.overflowX = 'hidden';
              
              // Ajustar SVG dentro del gráfico si existe
              const svg = chart.querySelector('svg');
              if (svg) {
                svg.style.width = '95%';
                svg.style.overflow = 'visible';
              }
            });
            
            // Aplicar estilos a títulos de sección
            const sectionTitles = documentClone.querySelectorAll('.report-section-title');
            sectionTitles.forEach(title => {
              title.style.background = 'linear-gradient(to right, #EEF2F6, #F8FAFC)';
              title.style.borderLeft = '10px solid #005F83';
              title.style.padding = '8px';
              title.style.marginBottom = '10px';
              title.style.borderRadius = '0 4px 4px 0';
              title.style.fontWeight = 'bold';
              title.style.width = '98%';
              title.style.maxWidth = '98%';
              title.style.marginLeft = 'auto';
              title.style.marginRight = 'auto';
            });
            
            // Aplicar estilos a badges
            const badges = documentClone.querySelectorAll('.badge-success');
            badges.forEach(badge => {
              badge.style.background = 'linear-gradient(135deg, #10B981, #059669)';
              badge.style.color = 'white';
              badge.style.padding = '3px 8px';
              badge.style.borderRadius = '4px';
              badge.style.fontWeight = 'bold';
            });
            
            const badgesDanger = documentClone.querySelectorAll('.badge-danger');
            badgesDanger.forEach(badge => {
              badge.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
              badge.style.color = 'white';
              badge.style.padding = '3px 8px';
              badge.style.borderRadius = '4px';
              badge.style.fontWeight = 'bold';
            });
            
            // Ajustar altura de contenedores que puedan estar comprimidos
            const technicalDrawings = documentClone.querySelectorAll('.technical-drawing-container, .technical-drawing-container-report');
            technicalDrawings.forEach(container => {
              container.style.height = 'auto';
              container.style.minHeight = '300px';
              container.style.width = '95%';
              container.style.maxWidth = '95%';
              container.style.marginLeft = 'auto';
              container.style.marginRight = 'auto';
              container.style.overflowX = 'hidden';
            });
            
            // ELIMINAR GRÁFICOS EN LA PÁGINA 2
            if (i === 1) { // Si estamos en la página 2
              // Ocultar los gráficos
              const dimensionalCharts = documentClone.querySelectorAll('.dimension-charts-grid, .dimension-mini-chart, .dimension-chart');
              dimensionalCharts.forEach(chart => {
                chart.style.display = 'none';
              });
              
              // Ocultar encabezados relacionados
              const headers = documentClone.querySelectorAll('h4');
              headers.forEach(header => {
                if (header.textContent && header.textContent.includes('Dimensional Analysis')) {
                  header.style.display = 'none';
                }
              });
              
              // Expandir la tabla para usar todo el espacio disponible
              const tables = documentClone.querySelectorAll('.data-table');
              tables.forEach(table => {
                table.style.width = '98%';
                table.style.maxWidth = '98%';
                table.style.tableLayout = 'fixed';
                table.style.marginLeft = 'auto';
                table.style.marginRight = 'auto';
              });
            }
          }
        });
        
        // Convertir a imagen
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgProps = pdf.getImageProperties(imgData);
        
        // Calcular dimensiones manteniendo proporción
        let imgWidth = contentWidth - 4; // Reducir ligeramente para evitar cortes
        let imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        
        // Si es demasiado alto, ajustar al alto disponible
        const contentHeight = pageHeight - margin - 35; // Ajustar para el encabezado
        if (imgHeight > contentHeight) {
          imgHeight = contentHeight;
          imgWidth = (imgProps.width * imgHeight) / imgProps.height;
        }
        
        // Centrar en la página y ajustar posición Y para dejar espacio al encabezado
        const x = margin + (contentWidth - imgWidth) / 2;
        const y = 35; // Coordenada Y después del encabezado
        
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