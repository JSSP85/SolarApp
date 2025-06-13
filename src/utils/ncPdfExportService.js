// src/utils/ncPdfExportService.js
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

    // ===== PÁGINA 3: DETALLES Y DESCRIPCIÓN =====
    pdf.addPage();
    currentPage++;
    currentY = margin;
    
    addPageHeader(pdf, `NC ${ncData.number} - Details & Description`, currentPage);
    currentY += 20;

    currentY = addNCDetails(pdf, ncData, margin, currentY, contentWidth);

    // ===== PÁGINA 4: TRATAMIENTO Y ACCIONES CORRECTIVAS =====
    pdf.addPage();
    currentPage++;
    currentY = margin;
    
    addPageHeader(pdf, `NC ${ncData.number} - Treatment & Corrective Actions`, currentPage);
    currentY += 20;

    currentY = addTreatmentAndActions(pdf, ncData, margin, currentY, contentWidth);

    // ===== PÁGINAS ADICIONALES: FOTOS =====
    if (config.includePhotos && ncData.photos && ncData.photos.length > 0) {
      const photoPages = await addPhotosPages(pdf, ncData, currentPage);
      currentPage += photoPages;
    }

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
    ['Supplier:', ncData.supplier || 'N/A']
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
  if (ncData.correctiveActionPlan) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Corrective Action Plan:', margin, currentY);
    currentY += 8;
    pdf.setFont('helvetica', 'normal');
    const actionLines = pdf.splitTextToSize(ncData.correctiveActionPlan, contentWidth);
    pdf.text(actionLines, margin, currentY);
    currentY += (actionLines.length * 6) + 10;
  }

  return currentY;
};

/**
 * Añade páginas de fotos
 */
const addPhotosPages = async (pdf, ncData, startingPage) => {
  let pagesAdded = 0;
  const photos = ncData.photos || [];
  const photosPerPage = 4; // 2x2 grid

  for (let i = 0; i < photos.length; i += photosPerPage) {
    pdf.addPage();
    pagesAdded++;
    
    const currentPage = startingPage + pagesAdded;
    addPageHeader(pdf, `NC ${ncData.number} - Photo Documentation`, currentPage);

    const pagePhotos = photos.slice(i, i + photosPerPage);
    await addPhotosToPage(pdf, pagePhotos, i);
  }

  return pagesAdded;
};

/**
 * Añade fotos a una página en grid 2x2
 */
const addPhotosToPage = async (pdf, photos, startIndex) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const photoWidth = (pageWidth - margin * 3) / 2; // 2 columnas
  const photoHeight = 80;
  
  let row = 0;
  let col = 0;

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const x = margin + (col * (photoWidth + margin));
    const y = 50 + (row * (photoHeight + 30));

    try {
      if (photo.type && photo.type.startsWith('image/')) {
        // Añadir imagen
        pdf.addImage(photo.url, 'JPEG', x, y, photoWidth, photoHeight);
      } else {
        // Placeholder para PDFs
        pdf.setFillColor(240, 240, 240);
        pdf.rect(x, y, photoWidth, photoHeight, 'F');
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(12);
        pdf.text('PDF Document', x + photoWidth/2, y + photoHeight/2, { align: 'center' });
      }

      // Información de la foto
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      
      const photoInfo = [
        `Photo ${startIndex + i + 1}: ${photo.name}`,
        `Size: ${formatFileSize(photo.size)}`
      ];
      
      if (photo.compressionRatio) {
        photoInfo.push(`Compressed: ${photo.compressionRatio}%`);
      }

      let infoY = y + photoHeight + 5;
      photoInfo.forEach(info => {
        const infoLines = pdf.splitTextToSize(info, photoWidth);
        pdf.text(infoLines, x, infoY);
        infoY += 4;
      });

    } catch (photoError) {
      console.error('Error añadiendo foto:', photoError);
      
      // Fallback: mostrar placeholder
      pdf.setFillColor(240, 240, 240);
      pdf.rect(x, y, photoWidth, photoHeight, 'F');
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(10);
      pdf.text('Error loading image', x + photoWidth/2, y + photoHeight/2, { align: 'center' });
    }

    col++;
    if (col >= 2) {
      col = 0;
      row++;
    }
  }
};

/**
 * Añade timeline y sección de firmas
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