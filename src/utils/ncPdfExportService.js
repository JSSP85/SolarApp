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

    // ===== PÁGINA 1: PORTADA =====
    await createCoverPage(pdf, ncData, currentPage);

    // ===== PÁGINA 2: INFORMACIÓN BÁSICA =====
    pdf.addPage();
    currentPage++;
    currentY = margin;
    
    // Header de página
    addPageHeader(pdf, `NC ${ncData.number} - Basic Information`, currentPage);
    currentY += 20;

    // Información básica
    currentY = addBasicInformation(pdf, ncData, margin, currentY, contentWidth);

    // ===== PÁGINA 3: DETALLES, DESCRIPCIÓN Y FOTOS ===== ✅ REORDENADO
    pdf.addPage();
    currentPage++;
    currentY = margin;
    
    addPageHeader(pdf, `NC ${ncData.number} - Details & Description`, currentPage);
    currentY += 20;

    currentY = addNCDetails(pdf, ncData, margin, currentY, contentWidth);

    // ✅ AGREGAR FOTOS AQUÍ DESPUÉS DE LA DESCRIPCIÓN
    if (config.includePhotos && ncData.photos && ncData.photos.length > 0) {
      currentY = await addPhotosInline(pdf, ncData, margin, currentY, contentWidth, pageHeight);
    }

    // ===== PÁGINA 4: TRATAMIENTO Y ACCIONES CORRECTIVAS =====
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

    currentY = addTimelineAndSignatures(pdf, ncData, margin, currentY, contentWidth);

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
 * Crea la página de portada
 */
const createCoverPage = async (pdf, ncData, pageNumber) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  try {
    // Fondo azul gradiente
    pdf.setFillColor(0, 95, 131);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Logo (si existe)
    try {
      const logoResponse = await fetch('/images/logo2.png');
      if (logoResponse.ok) {
        const logoBlob = await logoResponse.blob();
        const logoDataUrl = await blobToDataURL(logoBlob);
        pdf.addImage(logoDataUrl, 'PNG', pageWidth/2 - 25, 30, 50, 25);
      }
    } catch (logoError) {
      console.log('Logo no disponible, continuando sin logo');
    }

    // Título principal
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('NON-CONFORMITY REPORT', pageWidth/2, 80, { align: 'center' });

    // Número de NC
    pdf.setFontSize(24);
    pdf.text(ncData.number || 'NC-XXX', pageWidth/2, 100, { align: 'center' });

    // Información principal
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    
    const mainInfo = [
      `Project: ${ncData.project || 'N/A'}`,
      `Priority: ${(ncData.priority || 'N/A').toUpperCase()}`,
      `Date: ${ncData.date || 'N/A'}`,
      `Status: ${(ncData.status || 'Open').toUpperCase()}`
    ];

    let infoY = 130;
    mainInfo.forEach(info => {
      pdf.text(info, pageWidth/2, infoY, { align: 'center' });
      infoY += 12;
    });

    // Descripción resumida
    if (ncData.description) {
      pdf.setFontSize(12);
      const shortDesc = ncData.description.length > 200 
        ? ncData.description.substring(0, 200) + '...'
        : ncData.description;
      
      const descLines = pdf.splitTextToSize(shortDesc, pageWidth - 80);
      pdf.text(descLines, pageWidth/2, 190, { align: 'center' });
    }

    // Footer de portada
    pdf.setFontSize(10);
    pdf.text('Valmont Solar - Quality Control Department', pageWidth/2, pageHeight - 30, { align: 'center' });
    pdf.text(`Generated on ${new Date().toLocaleDateString('en-GB')}`, pageWidth/2, pageHeight - 20, { align: 'center' });

  } catch (error) {
    console.error('Error creando portada:', error);
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
 * Añade información básica
 */
const addBasicInformation = (pdf, ncData, margin, startY, contentWidth) => {
  let currentY = startY;

  // Título de sección
  pdf.setTextColor(0, 95, 131);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Basic Information', margin, currentY);
  currentY += 15;

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
 * ✅ NUEVA FUNCIÓN: Añadir fotos inline después de la descripción
 */
const addPhotosInline = async (pdf, ncData, margin, startY, contentWidth, pageHeight) => {
  let currentY = startY;
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
      const row = Math.floor(i / imagesPerRow);
      const col = i % imagesPerRow;
      
      const x = margin + (col * (imageWidth + 5));
      const y = currentY + (row * (imageHeight + 20));

      // Verificar si necesitamos nueva página
      if (y + imageHeight > pageHeight - 20) {
        pdf.addPage();
        addPageHeader(pdf, `NC ${ncData.number} - Photo Documentation (continued)`, pdf.getNumberOfPages());
        currentY = 40;
        const newRow = Math.floor(i / imagesPerRow) - Math.floor(i / imagesPerRow);
        const newY = currentY + (newRow * (imageHeight + 20));
        
        try {
          // ✅ ARREGLAR VISUALIZACIÓN DE IMÁGENES
          if (photo.url && photo.url.startsWith('data:image')) {
            pdf.addImage(photo.url, 'JPEG', x, newY, imageWidth, imageHeight);
            
            // Añadir nombre de archivo debajo
            pdf.setFontSize(8);
            pdf.text(photo.name || 'Image', x, newY + imageHeight + 5);
            
            // Información de compresión si existe
            if (photo.compressionRatio) {
              pdf.text(`Compressed: -${photo.compressionRatio}%`, x, newY + imageHeight + 10);
            }
          }
        } catch (error) {
          console.error('Error añadiendo imagen al PDF:', error);
          // Mostrar placeholder si falla la imagen
          pdf.setDrawColor(200, 200, 200);
          pdf.rect(x, newY, imageWidth, imageHeight);
          pdf.setFontSize(10);
          pdf.text('Image not available', x + imageWidth/2, newY + imageHeight/2, { align: 'center' });
        }
      } else {
        try {
          // ✅ ARREGLAR VISUALIZACIÓN DE IMÁGENES
          if (photo.url && photo.url.startsWith('data:image')) {
            pdf.addImage(photo.url, 'JPEG', x, y, imageWidth, imageHeight);
            
            // Añadir nombre de archivo debajo
            pdf.setFontSize(8);
            pdf.text(photo.name || 'Image', x, y + imageHeight + 5);
            
            // Información de compresión si existe
            if (photo.compressionRatio) {
              pdf.text(`Compressed: -${photo.compressionRatio}%`, x, y + imageHeight + 10);
            }
          }
        } catch (error) {
          console.error('Error añadiendo imagen al PDF:', error);
          // Mostrar placeholder si falla la imagen
          pdf.setDrawColor(200, 200, 200);
          pdf.rect(x, y, imageWidth, imageHeight);
          pdf.setFontSize(10);
          pdf.text('Image not available', x + imageWidth/2, y + imageHeight/2, { align: 'center' });
        }
      }
    }

    // Actualizar currentY basado en las imágenes añadidas
    const totalRows = Math.ceil(imagePhotos.length / imagesPerRow);
    currentY += (totalRows * (imageHeight + 20)) + 10;
  }

  // ✅ MANEJAR DOCUMENTOS PDF
  if (pdfDocuments.length > 0) {
    pdf.setFont('helvetica', 'bold');
    pdf.text(`PDF Documents (${pdfDocuments.length}):`, margin, currentY);
    currentY += 10;

    pdfDocuments.forEach(doc => {
      pdf.setFont('helvetica', 'normal');
      pdf.text(`📄 ${doc.name} (${formatFileSize(doc.size)})`, margin + 10, currentY);
      currentY += 8;
    });

    currentY += 10;
  }

  return currentY;
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

  return currentY;
};

/**
 * Añade timeline y firmas
 */
const addTimelineAndSignatures = (pdf, ncData, margin, startY, contentWidth) => {
  let currentY = startY;

  // Timeline
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

    currentY += 20;
  }

  // Sección de firmas
  pdf.setTextColor(0, 95, 131);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Signatures', margin, currentY);
  currentY += 20;

  // Campos de firma
  const signatures = [
    'Inspector:',
    'Quality Manager:',
    'Project Manager:'
  ];

  signatures.forEach(sig => {
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(sig, margin, currentY);
    
    // Línea para firma
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(margin + 40, currentY, margin + 120, currentY);
    
    // Fecha
    pdf.text('Date:', margin + 140, currentY);
    pdf.line(margin + 160, currentY, margin + 200, currentY);
    
    currentY += 20;
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