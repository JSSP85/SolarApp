// src/utils/ncPdfExportService.js - ✅ CÓDIGO COMPLETO CORREGIDO
import jsPDF from 'jspdf';

/**
 * Exporta una Non-Conformity completa a PDF
 * @param {Object} ncData - Datos de la NC
 * @param {Object} options - Opciones de exportación
 */
export const exportNCToPDF = async (ncData, options = {}) => {
  try {
    console.log('Iniciando exportación de NC a PDF...', ncData.number);
    
    // Configuración por defecto
    const config = {
      filename: `NC_${ncData.number}_${ncData.project}_${new Date().toISOString().split('T')[0]}`,
      showProgress: options.showProgress !== false,
      includePhotos: options.includePhotos !== false,
      ...options
    };

    // Crear instancia PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Dimensiones de página
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    let currentY = margin;
    let currentPage = 1;

    // ===== ✅ MODIFICACIÓN 4: PÁGINA 1 DIRECTO SIN PORTADA =====
    // Header de página
    addPageHeader(pdf, `NC ${ncData.number}`, currentPage);
    currentY += 20;
    
    // Información básica
    currentY = addBasicInformation(pdf, ncData, margin, currentY, contentWidth);

    // ===== PÁGINA 2: DETALLES, DESCRIPCIÓN Y FOTOS ===== ✅ REORDENADO
    pdf.addPage();
    currentPage++;
    currentY = margin;
    
    addPageHeader(pdf, `NC ${ncData.number} - Details & Description`, currentPage);
    currentY += 20;

    currentY = addNCDetails(pdf, ncData, margin, currentY, contentWidth);

    // ✅ MODIFICACIÓN 5: AGREGAR FOTOS AQUÍ DESPUÉS DE LA DESCRIPCIÓN
    if (config.includePhotos && ncData.photos && ncData.photos.length > 0) {
      currentY = await addPhotosInline(pdf, ncData, margin, currentY, contentWidth, pageHeight, currentPage);
    }

    // ===== PÁGINA 3: TRATAMIENTO Y ACCIONES CORRECTIVAS =====
    pdf.addPage();
    currentPage++;
    currentY = margin;
    
    addPageHeader(pdf, `NC ${ncData.number} - Treatment & Corrective Actions`, currentPage);
    currentY += 20;

    currentY = addTreatmentAndActions(pdf, ncData, margin, currentY, contentWidth);

    // ===== PÁGINA FINAL: TIMELINE Y FIRMAS =====
    pdf.addPage();
    currentPage++;
    currentY = margin;
    
    addPageHeader(pdf, `NC ${ncData.number} - Timeline & Signatures`, currentPage);
    currentY += 20;

    currentY = addTimelineAndSignatures(pdf, ncData, margin, currentY, contentWidth, pageHeight);

    // Guardar PDF
    pdf.save(`${config.filename}.pdf`);
    
    console.log('✅ PDF exportado exitosamente');
    return true;

  } catch (error) {
    console.error('Error exportando NC a PDF:', error);
    throw error;
  }
};

/**
 * Añade header a cada página
 */
const addPageHeader = (pdf, title, pageNumber) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Línea superior
  pdf.setDrawColor(0, 95, 131);
  pdf.setLineWidth(2);
  pdf.line(20, 15, pageWidth - 20, 15);

  // Título
  pdf.setTextColor(0, 95, 131);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, 20, 25);

  // Número de página
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Page ${pageNumber}`, pageWidth - 20, 25, { align: 'right' });
};

/**
 * ✅ MODIFICACIÓN 4: Añade información básica SIN duplicar el título
 */
const addBasicInformation = (pdf, ncData, margin, startY, contentWidth) => {
  let currentY = startY;

  // ✅ QUITADO: Ya no se duplica el título "Basic Information"
  
  // Datos básicos en dos columnas
  const basicData = [
    ['NC Number:', ncData.number || 'N/A'],
    ['Priority:', (ncData.priority || 'N/A').toUpperCase()],
    ['Project:', ncData.project || 'N/A'],
    ['Project Code CM:', ncData.projectCode || 'N/A'],
    ['Date:', ncData.date || 'N/A'],
    ['Inspector:', ncData.createdBy || 'N/A'],
    ['Sector:', ncData.sector || 'N/A'],
    ['Supplier:', ncData.supplier || 'N/A'],
    ['Detection Source:', ncData.detectionSource || 'N/A'] // ✅ NUEVO CAMPO
  ];

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(11);

  for (let i = 0; i < basicData.length; i += 2) {
    // Columna izquierda
    const leftItem = basicData[i];
    if (leftItem) {
      pdf.setFont('helvetica', 'bold');
      pdf.text(leftItem[0], margin, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(leftItem[1], margin + 40, currentY);
    }

    // Columna derecha
    const rightItem = basicData[i + 1];
    if (rightItem) {
      pdf.setFont('helvetica', 'bold');
      pdf.text(rightItem[0], margin + contentWidth/2, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(rightItem[1], margin + contentWidth/2 + 40, currentY);
    }

    currentY += 8;
  }

  return currentY + 10;
};

/**
 * Añade detalles de la NC
 */
const addNCDetails = (pdf, ncData, margin, startY, contentWidth) => {
  let currentY = startY;

  // Título de sección
  pdf.setTextColor(0, 95, 131);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Non-Conformity Details', margin, currentY);
  currentY += 15;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(11);

  // Tipo de NC
  pdf.setFont('helvetica', 'bold');
  pdf.text('NC Type:', margin, currentY);
  pdf.setFont('helvetica', 'normal');
  pdf.text(ncData.ncType || 'N/A', margin + 30, currentY);
  currentY += 12;

  // Detalles del componente
  const componentData = [
    ['Component Code:', ncData.componentCode || 'N/A'],
    ['Quantity:', ncData.quantity || 'N/A'],
    ['Component Description:', ncData.component || 'N/A'],
    ['Purchase Order:', ncData.purchaseOrder || 'N/A']
  ];

  componentData.forEach(item => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(item[0], margin, currentY);
    pdf.setFont('helvetica', 'normal');
    
    if (item[1].length > 50) {
      const lines = pdf.splitTextToSize(item[1], contentWidth - 50);
      pdf.text(lines, margin + 50, currentY);
      currentY += (lines.length * 6);
    } else {
      pdf.text(item[1], margin + 50, currentY);
      currentY += 8;
    }
  });

  currentY += 10;

  // Descripción del problema
  pdf.setFont('helvetica', 'bold');
  pdf.text('Problem Description:', margin, currentY);
  currentY += 8;

  if (ncData.description) {
    pdf.setFont('helvetica', 'normal');
    const descLines = pdf.splitTextToSize(ncData.description, contentWidth);
    pdf.text(descLines, margin, currentY);
    currentY += (descLines.length * 6) + 10;
  }

  return currentY;
};

/**
 * ✅ MODIFICACIÓN 5: NUEVA FUNCIÓN para añadir fotos inline después de la descripción
 */
const addPhotosInline = async (pdf, ncData, margin, startY, contentWidth, pageHeight, currentPageNum) => {
  let currentY = startY;
  let currentPage = currentPageNum;
  const photos = ncData.photos || [];
  const imagePhotos = photos.filter(photo => photo.type === 'image');
  const pdfDocuments = photos.filter(photo => photo.type === 'pdf');

  if (photos.length === 0) return currentY;

  // Título de sección de fotos
  pdf.setTextColor(0, 95, 131);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Photo Documentation', margin, currentY);
  currentY += 15;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);

  // ✅ MANEJAR IMÁGENES CORRECTAMENTE
  if (imagePhotos.length > 0) {
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Images (${imagePhotos.length}):`, margin, currentY);
    currentY += 10;

    // Mostrar imágenes en grid 2x2
    const imagesPerRow = 2;
    const imageWidth = (contentWidth - 10) / imagesPerRow;
    const imageHeight = imageWidth * 0.75; // Mantener proporción

    for (let i = 0; i < imagePhotos.length; i++) {
      const photo = imagePhotos[i];
      const col = i % imagesPerRow;
      const row = Math.floor(i / imagesPerRow);
      
      const x = margin + (col * (imageWidth + 5));
      let y = currentY + (row * (imageHeight + 20));

      // Verificar si necesitamos nueva página
      if (y + imageHeight > pageHeight - 20) {
        pdf.addPage();
        currentPage++;
        addPageHeader(pdf, `NC ${ncData.number} - Photo Documentation (continued)`, currentPage);
        currentY = 40;
        y = currentY;
      }

      try {
        // ✅ ARREGLAR VISUALIZACIÓN DE IMÁGENES
        if (photo.url) {
          // Si es blob URL, convertir a base64
          let imageData = photo.url;
          
          if (photo.url.startsWith('blob:')) {
            const response = await fetch(photo.url);
            const blob = await response.blob();
            imageData = await blobToDataURL(blob);
          }
          
          // Agregar imagen al PDF
          pdf.addImage(imageData, 'JPEG', x, y, imageWidth, imageHeight);
          
          // Añadir nombre de archivo debajo
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.text(photo.name || 'Image', x, y + imageHeight + 5);
          
          // Información de compresión si existe
          if (photo.compressionRatio) {
            pdf.setFontSize(7);
            pdf.setTextColor(5, 150, 105);
            pdf.text(`(${photo.compressionRatio}% compressed)`, x, y + imageHeight + 10);
            pdf.setTextColor(0, 0, 0);
          }
        }
      } catch (error) {
        console.error('Error adding image to PDF:', error);
        // Mostrar placeholder
        pdf.setFillColor(240, 240, 240);
        pdf.rect(x, y, imageWidth, imageHeight, 'F');
        pdf.setTextColor(128, 128, 128);
        pdf.setFontSize(10);
        pdf.text('Image not available', x + imageWidth/2, y + imageHeight/2, { align: 'center' });
        pdf.setTextColor(0, 0, 0);
      }
    }

    // Actualizar currentY
    const totalRows = Math.ceil(imagePhotos.length / imagesPerRow);
    currentY += (totalRows * (imageHeight + 20)) + 10;
  }

  // Listar PDFs adjuntos
  if (pdfDocuments.length > 0) {
    // Verificar si necesitamos nueva página para los PDFs
    if (currentY > pageHeight - 50) {
      pdf.addPage();
      currentPage++;
      addPageHeader(pdf, `NC ${ncData.number} - Attachments`, currentPage);
      currentY = 40;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text(`Attached PDFs (${pdfDocuments.length}):`, margin, currentY);
    currentY += 8;

    pdfDocuments.forEach(doc => {
      pdf.setFont('helvetica', 'normal');
      pdf.text(`• ${doc.name} (${(doc.size / 1024 / 1024).toFixed(2)} MB)`, margin + 5, currentY);
      currentY += 6;
    });
  }

  return currentY + 10;
};

/**
 * Añade tratamiento y acciones correctivas
 */
const addTreatmentAndActions = (pdf, ncData, margin, startY, contentWidth) => {
  let currentY = startY;

  // Treatment/Resolution
  pdf.setTextColor(0, 95, 131);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Treatment / Resolution', margin, currentY);
  currentY += 15;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(11);

  // Material Disposition
  pdf.setFont('helvetica', 'bold');
  pdf.text('Material Disposition:', margin, currentY);
  pdf.setFont('helvetica', 'normal');
  pdf.text(ncData.materialDisposition || 'Not specified', margin + 50, currentY);
  currentY += 12;

  // Containment Action
  if (ncData.containmentAction) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Containment Action:', margin, currentY);
    currentY += 8;
    pdf.setFont('helvetica', 'normal');
    const containmentLines = pdf.splitTextToSize(ncData.containmentAction, contentWidth);
    pdf.text(containmentLines, margin, currentY);
    currentY += (containmentLines.length * 6) + 15;
  } else {
    currentY += 15;
  }

  // Corrective Action Request
  pdf.setTextColor(0, 95, 131);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Corrective Action Request', margin, currentY);
  currentY += 15;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(11);

  // Root Cause Analysis
  if (ncData.rootCauseAnalysis) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Root Cause Analysis:', margin, currentY);
    currentY += 8;
    pdf.setFont('helvetica', 'normal');
    const rootCauseLines = pdf.splitTextToSize(ncData.rootCauseAnalysis, contentWidth);
    pdf.text(rootCauseLines, margin, currentY);
    currentY += (rootCauseLines.length * 6) + 10;
  }

  // Corrective Action Plan
  if (ncData.correctiveAction || ncData.correctiveActionPlan) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Corrective Action Plan:', margin, currentY);
    currentY += 8;
    pdf.setFont('helvetica', 'normal');
    const actionText = ncData.correctiveAction || ncData.correctiveActionPlan;
    const actionLines = pdf.splitTextToSize(actionText, contentWidth);
    pdf.text(actionLines, margin, currentY);
    currentY += (actionLines.length * 6) + 10;
  }

  // Assigned To and Target Date
  if (ncData.assignedTo || ncData.plannedClosureDate) {
    const assignmentData = [];
    if (ncData.assignedTo) assignmentData.push(['Assigned To:', ncData.assignedTo]);
    if (ncData.plannedClosureDate) assignmentData.push(['Target Date:', ncData.plannedClosureDate]);
    
    assignmentData.forEach(item => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(item[0], margin, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(item[1], margin + 35, currentY);
      currentY += 8;
    });
  }

  return currentY;
};

/**
 * ✅ MODIFICACIÓN 6: Añade timeline y firmas con espaciado ajustado
 */
const addTimelineAndSignatures = (pdf, ncData, margin, startY, contentWidth, pageHeight) => {
  let currentY = startY;

  // Timeline (si existe)
  if (ncData.timeline && ncData.timeline.length > 0) {
    pdf.setTextColor(0, 95, 131);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Timeline', margin, currentY);
    currentY += 15;

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);

    ncData.timeline.forEach(entry => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${entry.date || 'N/A'}`, margin, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(entry.title || 'N/A', margin + 50, currentY);
      currentY += 6;
      
      if (entry.description) {
        const descLines = pdf.splitTextToSize(entry.description, contentWidth - 20);
        pdf.text(descLines, margin + 10, currentY);
        currentY += (descLines.length * 4) + 5;
      }
    });

    currentY += 10; // ✅ Espacio reducido
  }

  // ✅ Verificar si necesitamos nueva página para las firmas
  if (currentY > pageHeight - 80) { // Si estamos muy abajo en la página
    pdf.addPage();
    addPageHeader(pdf, `NC ${ncData.number} - Signatures`, pdf.getNumberOfPages());
    currentY = 40;
  }

  // Sección de firmas con espaciado ajustado
  pdf.setTextColor(0, 95, 131);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Signatures', margin, currentY);
  currentY += 15; // ✅ Reducido de 20

  // Campos de firma con menos espacio
  const signatures = [
    'Inspector:',
    'Quality Manager:',
    'Project Manager:'
  ];

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(11);

  signatures.forEach(sig => {
    pdf.setFont('helvetica', 'normal');
    pdf.text(sig, margin, currentY);
    
    // Línea para firma - más corta y mejor posicionada
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(margin + 35, currentY, margin + 100, currentY); // ✅ Línea más corta
    
    // Fecha
    pdf.text('Date:', margin + 120, currentY);
    pdf.line(margin + 135, currentY, margin + 180, currentY); // ✅ Línea más corta
    
    currentY += 15; // ✅ Reducido de 20
  });

  return currentY;
};

/**
 * Convierte Blob a DataURL
 */
const blobToDataURL = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Formatea el tamaño de archivo
 */
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
