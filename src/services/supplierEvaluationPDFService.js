// Modificaciones para src/services/supplierEvaluationPDFService.js

// 1. ✅ FIX PARA EL ERROR "Error displaying text" EN CERTIFICACIONES
// Reemplazar la función drawText existente con esta versión mejorada:

const drawText = (text, x, y, options = {}) => {
  try {
    const {
      font = helveticaFont,
      size = 10,
      color = darkGray
    } = options;
    
    // Asegurar que el texto sea válido
    let textStr = '';
    if (text === null || text === undefined) {
      textStr = 'N/A';
    } else {
      textStr = String(text).trim();
      if (textStr === '') {
        textStr = 'N/A';
      }
    }
    
    // Limitar longitud y caracteres especiales
    textStr = textStr.substring(0, 100).replace(/[^\x00-\x7F]/g, ''); // Remover caracteres no ASCII
    
    // Verificar que la fuente esté disponible antes de usar
    if (!font) {
      console.warn('Font not available, using default');
      currentPage.drawText(textStr, {
        x,
        y,
        size,
        color
      });
    } else {
      currentPage.drawText(textStr, {
        x,
        y,
        size,
        font,
        color
      });
    }
  } catch (error) {
    console.error('Error drawing text:', error);
    console.error('Text value:', text);
    console.error('Options:', options);
    
    // Fallback más seguro sin fuente específica
    try {
      currentPage.drawText('Error displaying text', {
        x,
        y,
        size: 8,
        color: rgb(0.8, 0, 0) // Rojo para error
      });
    } catch (fallbackError) {
      console.error('Even fallback text failed:', fallbackError);
    }
  }
};

// 2. ✅ NUEVA ESTRUCTURA DE PÁGINAS
// Reemplazar la lógica de generación de contenido con esta nueva estructura:

export const generateSupplierEvaluationPDF = async (supplierData) => {
  try {
    console.log('PDF Service: Starting PDF generation...');
    
    const pdfDoc = await PDFDocument.create();
    const pageWidth = 595.28; // A4 width in points
    const pageHeight = 841.89; // A4 height in points
    const margin = 50;
    const contentWidth = pageWidth - (2 * margin);
    
    // Cargar fuentes con manejo de errores
    let helveticaFont, helveticaBoldFont;
    try {
      helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    } catch (fontError) {
      console.warn('Error loading fonts:', fontError);
      helveticaFont = null;
      helveticaBoldFont = null;
    }
    
    // Colores
    const primaryBlue = rgb(0, 0.373, 0.514);
    const lightBlue = rgb(0.2, 0.6, 0.8);
    const darkGray = rgb(0.2, 0.2, 0.2);
    const lightGray = rgb(0.5, 0.5, 0.5);
    const white = rgb(1, 1, 1);
    const errorRed = rgb(0.8, 0, 0);
    const successGreen = rgb(0.0, 0.7, 0.0);
    const warningOrange = rgb(1.0, 0.6, 0.0);

    // ===========================================
    // PÁGINA 1: GENERAL INFORMATION + CERTIFICATIONS
    // ===========================================
    
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - margin;
    
    console.log('PDF Service: Creating Page 1...');
    
    // Helper function para nueva página
    const addNewPageIfNeeded = (spaceNeeded, forceNewPage = false) => {
      if (forceNewPage || yPosition - spaceNeeded < margin + 50) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin;
        return true;
      }
      return false;
    };

    // Header de la página 1
    currentPage.drawRectangle({
      x: 0,
      y: pageHeight - 80,
      width: pageWidth,
      height: 80,
      color: primaryBlue
    });
    
    drawText('SUPPLIER EVALUATION REPORT', margin, pageHeight - 35, {
      font: helveticaBoldFont,
      size: 20,
      color: white
    });
    
    drawText('Structural Steel Profile Suppliers Assessment', margin, pageHeight - 55, {
      font: helveticaFont,
      size: 12,
      color: white
    });
    
    yPosition = pageHeight - 100;

    // ===== GENERAL INFORMATION SECTION =====
    currentPage.drawRectangle({
      x: margin,
      y: yPosition - 20,
      width: contentWidth,
      height: 25,
      color: primaryBlue
    });
    
    drawText('GENERAL INFORMATION', margin + 10, yPosition - 15, {
      font: helveticaBoldFont,
      size: 12,
      color: white
    });
    
    yPosition -= 45;
    
    // Campos básicos
    const basicFields = [
      ['Supplier Name:', supplierData.supplierName || 'N/A'],
      ['Category:', supplierData.category || 'N/A'],
      ['Location:', supplierData.location || 'N/A'],
      ['Contact Person:', supplierData.contactPerson || 'N/A'],
      ['Audit Date:', supplierData.auditDate || 'N/A'],
      ['Auditor:', supplierData.auditorName || 'N/A'],
      ['Audit Type:', supplierData.auditType || 'N/A']
    ];
    
    basicFields.forEach(([label, value]) => {
      drawText(label, margin + 10, yPosition, {
        font: helveticaBoldFont,
        size: 9
      });
      drawText(value, margin + 150, yPosition, {
        size: 9
      });
      yPosition -= 15;
    });
    
    yPosition -= 20;

    // ===== COMPANY CERTIFICATIONS SECTION =====
    currentPage.drawRectangle({
      x: margin,
      y: yPosition - 20,
      width: contentWidth,
      height: 25,
      color: primaryBlue
    });
    
    drawText('COMPANY CERTIFICATIONS', margin + 10, yPosition - 15, {
      font: helveticaBoldFont,
      size: 12,
      color: white
    });
    
    yPosition -= 45;
    
    // ✅ FIX PARA CERTIFICACIONES - Validación mejorada
    const certifications = [];
    
    // Verificar que supplierData.certifications existe y es un objeto
    if (supplierData.certifications && typeof supplierData.certifications === 'object') {
      if (supplierData.certifications.iso9001 === true) {
        certifications.push('✓ ISO 9001:2015');
      }
      if (supplierData.certifications.iso14001 === true) {
        certifications.push('✓ ISO 14001:2015');
      }
      if (supplierData.certifications.iso45001 === true) {
        certifications.push('✓ ISO 45001/OHSAS 18001');
      }
      if (supplierData.certifications.en1090 === true) {
        certifications.push('✓ EN 1090 (Steel Structures)');
      }
      if (supplierData.certifications.ceMarking === true) {
        certifications.push('✓ CE Marking');
      }
      if (supplierData.certifications.others && supplierData.certifications.others.trim() !== '') {
        certifications.push(`✓ Others: ${supplierData.certifications.others.trim()}`);
      }
    }
    
    if (certifications.length === 0) {
      certifications.push('No certifications specified');
    }
    
    // Dibujar certificaciones con validación extra
    certifications.forEach((cert, index) => {
      try {
        console.log(`Drawing certification ${index + 1}:`, cert);
        drawText(cert, margin + 20, yPosition, { size: 9 });
        yPosition -= 15;
      } catch (certError) {
        console.error(`Error drawing certification ${index + 1}:`, certError);
        drawText('Error loading certification', margin + 20, yPosition, { 
          size: 9, 
          color: errorRed 
        });
        yPosition -= 15;
      }
    });

    // ===========================================
    // PÁGINA 2: KPI EVALUATION RESULTS + FIRMA
    // ===========================================
    
    // ✅ FORZAR NUEVA PÁGINA para KPI Results
    addNewPageIfNeeded(0, true); // forceNewPage = true
    
    console.log('PDF Service: Creating Page 2...');
    
    // Header de la página 2
    currentPage.drawRectangle({
      x: 0,
      y: pageHeight - 40,
      width: pageWidth,
      height: 40,
      color: primaryBlue
    });
    
    drawText('SUPPLIER EVALUATION REPORT - PAGE 2', margin, pageHeight - 25, {
      font: helveticaBoldFont,
      size: 14,
      color: white
    });
    
    yPosition = pageHeight - 70;

    // ===== KPI EVALUATION RESULTS SECTION =====
    currentPage.drawRectangle({
      x: margin,
      y: yPosition - 20,
      width: contentWidth,
      height: 25,
      color: primaryBlue
    });
    
    drawText('KPI EVALUATION RESULTS', margin + 10, yPosition - 15, {
      font: helveticaBoldFont,
      size: 12,
      color: white
    });
    
    yPosition -= 45;
    
    // KPI Descriptions (definir si no existe)
    const KPI_DESCRIPTIONS = {
      kpi1: 'Production Capacity & Equipment',
      kpi2: 'Quality Control & Testing',
      kpi3: 'Raw Materials & Supply Chain',
      kpi4: 'Human Resources & Training',
      kpi5: 'Logistics & Delivery'
    };
    
    const SCORE_LABELS = {
      0: 'Not Scored',
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Excellent'
    };
    
    // Dibujar KPIs
    Object.entries(KPI_DESCRIPTIONS).forEach(([kpiKey, description]) => {
      addNewPageIfNeeded(60);
      
      const score = supplierData.kpiScores?.[kpiKey] || 0;
      const scoreLabel = SCORE_LABELS[score] || 'Not Scored';
      
      // KPI Title
      drawText(`${kpiKey.toUpperCase()} - ${description}`, margin + 20, yPosition, {
        font: helveticaBoldFont,
        size: 10,
        color: lightBlue
      });
      yPosition -= 20;
      
      // Score con color
      let scoreColor = lightGray;
      if (score >= 4) scoreColor = successGreen;
      else if (score >= 3) scoreColor = lightBlue;
      else if (score >= 2) scoreColor = warningOrange;
      else if (score >= 1) scoreColor = errorRed;
      
      currentPage.drawRectangle({
        x: margin + 30,
        y: yPosition - 15,
        width: 25,
        height: 18,
        color: scoreColor
      });
      
      drawText(score.toString(), margin + 37, yPosition - 10, {
        font: helveticaBoldFont,
        size: 10,
        color: white
      });
      
      drawText(`Score: ${score}/4 - ${scoreLabel}`, margin + 65, yPosition - 10, {
        size: 9
      });
      
      yPosition -= 35;
    });

    // GAI y Clasificación
    const totalScore = Object.values(supplierData.kpiScores || {}).reduce((sum, score) => sum + (score || 0), 0);
    const gai = supplierData.gai || 0;
    const supplierClass = supplierData.supplierClass || 'C';
    
    let classColor = errorRed;
    if (supplierClass === 'A') classColor = successGreen;
    else if (supplierClass === 'B') classColor = warningOrange;
    
    addNewPageIfNeeded(80);
    
    currentPage.drawRectangle({
      x: margin,
      y: yPosition - 5,
      width: contentWidth,
      height: 25,
      color: classColor
    });
    
    drawText('EVALUATION SUMMARY', margin + 10, yPosition - 2, {
      font: helveticaBoldFont,
      size: 12,
      color: white
    });
    
    yPosition -= 35;
    
    drawText(`Total KPI Score: ${totalScore}/20`, margin + 20, yPosition, {
      font: helveticaBoldFont,
      size: 11
    });
    
    drawText(`G.A.I.: ${gai}%`, margin + 200, yPosition, {
      font: helveticaBoldFont,
      size: 11
    });
    
    drawText(`Classification: Class ${supplierClass}`, margin + 320, yPosition, {
      font: helveticaBoldFont,
      size: 11,
      color: classColor
    });
    
    yPosition -= 40;

    // Observations (si existen)
    if (supplierData.observations?.strengths || supplierData.observations?.improvements || supplierData.observations?.actions) {
      addNewPageIfNeeded(100);
      
      currentPage.drawRectangle({
        x: margin,
        y: yPosition - 20,
        width: contentWidth,
        height: 25,
        color: primaryBlue
      });
      
      drawText('OBSERVATIONS & RECOMMENDATIONS', margin + 10, yPosition - 15, {
        font: helveticaBoldFont,
        size: 12,
        color: white
      });
      
      yPosition -= 45;
      
      if (supplierData.observations?.strengths) {
        addNewPageIfNeeded(30);
        drawText('Identified Strengths:', margin + 20, yPosition, {
          font: helveticaBoldFont,
          size: 10,
          color: lightBlue
        });
        yPosition -= 15;
        drawText(supplierData.observations.strengths, margin + 30, yPosition, { size: 9 });
        yPosition -= 20;
      }
      
      if (supplierData.observations?.improvements) {
        addNewPageIfNeeded(30);
        drawText('Areas for Improvement:', margin + 20, yPosition, {
          font: helveticaBoldFont,
          size: 10,
          color: lightBlue
        });
        yPosition -= 15;
        drawText(supplierData.observations.improvements, margin + 30, yPosition, { size: 9 });
        yPosition -= 20;
      }
      
      if (supplierData.observations?.actions) {
        addNewPageIfNeeded(30);
        drawText('Required Actions:', margin + 20, yPosition, {
          font: helveticaBoldFont,
          size: 10,
          color: lightBlue
        });
        yPosition -= 15;
        drawText(supplierData.observations.actions, margin + 30, yPosition, { size: 9 });
        yPosition -= 20;
      }
    }

    // ✅ NUEVA SECCIÓN DE FIRMA AL FINAL DE LA PÁGINA 2
    addNewPageIfNeeded(120);
    
    // Si no hay suficiente espacio, ir al final de la página
    if (yPosition < 150) {
      yPosition = 150;
    }
    
    // Sección de firma
    currentPage.drawRectangle({
      x: margin,
      y: yPosition - 20,
      width: contentWidth,
      height: 25,
      color: primaryBlue
    });
    
    drawText('EVALUATION APPROVAL', margin + 10, yPosition - 15, {
      font: helveticaBoldFont,
      size: 12,
      color: white
    });
    
    yPosition -= 50;
    
    // Línea para la firma
    currentPage.drawLine({
      start: { x: margin + 20, y: yPosition },
      end: { x: margin + 250, y: yPosition },
      thickness: 1,
      color: darkGray
    });
    
    drawText('Evaluator Signature', margin + 20, yPosition - 15, {
      font: helveticaBoldFont,
      size: 10
    });
    
    // Información del evaluador
    yPosition -= 30;
    drawText(`Evaluated by: ${supplierData.auditorName || 'N/A'}`, margin + 20, yPosition, {
      size: 9
    });
    
    yPosition -= 15;
    drawText(`Date: ${supplierData.auditDate || new Date().toLocaleDateString()}`, margin + 20, yPosition, {
      size: 9
    });
    
    // Línea para fecha de aprobación
    yPosition -= 25;
    currentPage.drawLine({
      start: { x: margin + 350, y: yPosition + 15 },
      end: { x: margin + 500, y: yPosition + 15 },
      thickness: 1,
      color: darkGray
    });
    
    drawText('Approval Date', margin + 350, yPosition, {
      font: helveticaBoldFont,
      size: 10
    });

    // Footer en todas las páginas
    const pages = pdfDoc.getPages();
    pages.forEach((page, index) => {
      page.drawText(`Page ${index + 1} of ${pages.length}`, {
        x: pageWidth - 100,
        y: 30,
        size: 8,
        font: helveticaFont || undefined,
        color: lightGray
      });
      
      page.drawText(`Generated on ${new Date().toLocaleDateString()}`, {
        x: margin,
        y: 30,
        size: 8,
        font: helveticaFont || undefined,
        color: lightGray
      });
      
      page.drawText('Valmont Solar - Quality Control Department', {
        x: margin,
        y: 15,
        size: 8,
        font: helveticaFont || undefined,
        color: lightGray
      });
    });

    // Guardar y descargar
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const fileName = `Supplier_Evaluation_${(supplierData.supplierName || 'Unknown').replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log('✅ PDF generado exitosamente con nueva estructura');
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw new Error(`Failed to generate PDF report: ${error.message}`);
  }
};