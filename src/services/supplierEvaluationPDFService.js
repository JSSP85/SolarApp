// src/services/supplierEvaluationPDFService.js
// ARCHIVO COMPLETO CON MEJORAS: Gráfico de KPIs + Presentación mejorada

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const KPI_DESCRIPTIONS = {
  kpi1: 'Production Capacity & Equipment',
  kpi2: 'Quality Control System',
  kpi3: 'Raw Materials Management & Traceability',
  kpi4: 'Human Resources & Competencies',
  kpi5: 'Logistics Planning & Deliveries'
};

const SCORE_LABELS = {
  1: 'Not Acceptable/Reject',
  2: 'Improvement/Update Required',
  3: 'Acceptable',
  4: 'Excellent (Benchmark)'
};

// ✅ NUEVA FUNCIÓN: Crear gráfico de barras de KPIs
const drawKPIChart = (currentPage, kpiScores, x, y, width, height, fonts, colors) => {
  try {
    console.log('Drawing KPI chart...');
    
    const { helveticaFont, helveticaBoldFont } = fonts;
    const { primaryBlue, lightBlue, successGreen, warningOrange, errorRed, lightGray, darkGray } = colors;
    
    // Datos del gráfico
    const kpiData = [
      { label: 'KPI1', value: kpiScores.kpi1 || 0, name: 'Production' },
      { label: 'KPI2', value: kpiScores.kpi2 || 0, name: 'Quality' },
      { label: 'KPI3', value: kpiScores.kpi3 || 0, name: 'Materials' },
      { label: 'KPI4', value: kpiScores.kpi4 || 0, name: 'HR' },
      { label: 'KPI5', value: kpiScores.kpi5 || 0, name: 'Logistics' }
    ];
    
    // Configuración del gráfico
    const chartWidth = width;
    const chartHeight = height;
    const barWidth = chartWidth / 6; // 5 barras + espacios
    const maxValue = 4;
    
    // Fondo del gráfico
    currentPage.drawRectangle({
      x: x,
      y: y,
      width: chartWidth,
      height: chartHeight,
      color: { r: 0.98, g: 0.98, b: 0.98 },
      borderColor: lightGray,
      borderWidth: 1
    });
    
    // Título del gráfico
    currentPage.drawText('KPI Performance Overview', {
      x: x + chartWidth / 2 - 60,
      y: y + chartHeight - 15,
      size: 11,
      font: helveticaBoldFont,
      color: darkGray
    });
    
    // Líneas de grid horizontales
    for (let i = 0; i <= 4; i++) {
      const gridY = y + 25 + (i * (chartHeight - 50) / 4);
      currentPage.drawLine({
        start: { x: x + 10, y: gridY },
        end: { x: x + chartWidth - 10, y: gridY },
        thickness: 0.5,
        color: { r: 0.9, g: 0.9, b: 0.9 }
      });
      
      // Etiquetas del eje Y
      currentPage.drawText((4 - i).toString(), {
        x: x + 5,
        y: gridY - 3,
        size: 8,
        font: helveticaFont,
        color: darkGray
      });
    }
    
    // Dibujar barras
    kpiData.forEach((kpi, index) => {
      const barX = x + 20 + (index * barWidth);
      const barHeight = (kpi.value / maxValue) * (chartHeight - 50);
      const barY = y + 25;
      
      // Color de la barra según el valor
      let barColor = lightGray;
      if (kpi.value >= 4) barColor = successGreen;
      else if (kpi.value >= 3) barColor = lightBlue;
      else if (kpi.value >= 2) barColor = warningOrange;
      else if (kpi.value >= 1) barColor = errorRed;
      
      // Dibujar barra
      currentPage.drawRectangle({
        x: barX,
        y: barY,
        width: barWidth - 10,
        height: barHeight,
        color: barColor
      });
      
      // Valor encima de la barra
      currentPage.drawText(kpi.value.toString(), {
        x: barX + (barWidth - 10) / 2 - 3,
        y: barY + barHeight + 5,
        size: 9,
        font: helveticaBoldFont,
        color: darkGray
      });
      
      // Etiqueta del KPI
      currentPage.drawText(kpi.name, {
        x: barX + (barWidth - 10) / 2 - (kpi.name.length * 2.5),
        y: y + 10,
        size: 8,
        font: helveticaFont,
        color: darkGray
      });
    });
    
    console.log('KPI chart drawn successfully');
  } catch (error) {
    console.error('Error drawing KPI chart:', error);
  }
};

// ✅ NUEVA FUNCIÓN: Dibujar sección de KPI mejorada
const drawEnhancedKPISection = (currentPage, kpiKey, description, score, scoreLabel, details, yPos, margin, contentWidth, fonts, colors, addNewPageCallback) => {
  try {
    const { helveticaFont, helveticaBoldFont } = fonts;
    const { primaryBlue, lightBlue, successGreen, warningOrange, errorRed, lightGray, darkGray, white } = colors;
    
    let yPosition = yPos;
    
    // Verificar espacio necesario
    addNewPageCallback(120);
    
    // Contenedor principal del KPI
    const kpiBoxHeight = 100;
    currentPage.drawRectangle({
      x: margin,
      y: yPosition - kpiBoxHeight,
      width: contentWidth,
      height: kpiBoxHeight,
      color: { r: 0.98, g: 0.99, b: 1 },
      borderColor: lightBlue,
      borderWidth: 1
    });
    
    // Header del KPI
    currentPage.drawRectangle({
      x: margin,
      y: yPosition - 25,
      width: contentWidth,
      height: 25,
      color: lightBlue
    });
    
    // Título del KPI
    currentPage.drawText(`${kpiKey.toUpperCase()} - ${description}`, {
      x: margin + 10,
      y: yPosition - 20,
      size: 11,
      font: helveticaBoldFont,
      color: white
    });
    
    yPosition -= 35;
    
    // Score badge mejorado
    let scoreColor = lightGray;
    if (score >= 4) scoreColor = successGreen;
    else if (score >= 3) scoreColor = lightBlue;
    else if (score >= 2) scoreColor = warningOrange;
    else if (score >= 1) scoreColor = errorRed;
    
    // Badge circular para el score
    currentPage.drawEllipse({
      x: margin + 30,
      y: yPosition - 15,
      xScale: 15,
      yScale: 15,
      color: scoreColor
    });
    
    currentPage.drawText(score.toString(), {
      x: margin + 27,
      y: yPosition - 18,
      size: 11,
      font: helveticaBoldFont,
      color: white
    });
    
    // Descripción del score
    currentPage.drawText(`Score: ${score}/4 - ${scoreLabel}`, {
      x: margin + 55,
      y: yPosition - 18,
      size: 10,
      font: helveticaBoldFont,
      color: darkGray
    });
    
    yPosition -= 30;
    
    // Detalles del KPI en formato de tabla
    if (details && typeof details === 'object') {
      const detailEntries = Object.entries(details).filter(([key, value]) => 
        value !== undefined && value !== '' && value !== false && value !== 0
      );
      
      if (detailEntries.length > 0) {
        yPosition -= 10;
        
        // Título de detalles
        currentPage.drawText('Details:', {
          x: margin + 15,
          y: yPosition,
          size: 9,
          font: helveticaBoldFont,
          color: darkGray
        });
        
        yPosition -= 15;
        
        // Tabla de detalles
        detailEntries.forEach(([key, value], index) => {
          if (index > 0 && index % 3 === 0) {
            addNewPageCallback(20);
            yPosition -= 15;
          }
          
          let displayValue = value;
          if (typeof value === 'boolean') {
            displayValue = value ? '✓ Yes' : '✗ No';
          }
          
          const fieldName = key.replace(/([A-Z])/g, ' $1')
                               .replace(/^./, str => str.toUpperCase())
                               .replace(/([a-z])([A-Z])/g, '$1 $2');
          
          // Fondo alternado para mejor lectura
          if (index % 2 === 0) {
            currentPage.drawRectangle({
              x: margin + 10,
              y: yPosition - 12,
              width: contentWidth - 20,
              height: 12,
              color: { r: 0.96, g: 0.97, b: 0.98 }
            });
          }
          
          // Campo
          currentPage.drawText(`${fieldName}:`, {
            x: margin + 15,
            y: yPosition - 8,
            size: 8,
            font: helveticaBoldFont,
            color: darkGray
          });
          
          // Valor
          currentPage.drawText(displayValue.toString(), {
            x: margin + 200,
            y: yPosition - 8,
            size: 8,
            font: helveticaFont,
            color: darkGray
          });
          
          yPosition -= 12;
        });
      }
    }
    
    return yPosition - 20; // Espacio adicional entre KPIs
  } catch (error) {
    console.error('Error drawing enhanced KPI section:', error);
    return yPos - 100; // Fallback
  }
};

/**
 * Generate and download a professional PDF report for supplier evaluation
 * @param {Object} supplierData - Complete supplier evaluation data
 * @returns {Promise<void>}
 */
export const generateSupplierEvaluationPDF = async (supplierData) => {
  try {
    console.log('PDF Service: Starting PDF generation...');
    console.log('PDF Service: Supplier data received:', supplierData);
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    console.log('PDF Service: PDF document created');
    
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    console.log('PDF Service: Fonts embedded');
    
    // Define colors - Valmont branding
    const primaryBlue = rgb(0/255, 95/255, 131/255);
    const lightBlue = rgb(0/255, 144/255, 198/255);
    const darkGray = rgb(51/255, 51/255, 51/255);
    const lightGray = rgb(128/255, 128/255, 128/255);
    const white = rgb(1, 1, 1);
    const successGreen = rgb(16/255, 185/255, 129/255);
    const warningOrange = rgb(245/255, 158/255, 11/255);
    const errorRed = rgb(239/255, 68/255, 68/255);
    
    // Page dimensions
    const pageWidth = 595.28; // A4 width in points
    const pageHeight = 841.89; // A4 height in points
    const margin = 50;
    const contentWidth = pageWidth - (2 * margin);
    
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - margin;
    
    console.log('PDF Service: Page created, starting content...');
    
    // Helper function modificada para soportar forceNewPage
    const addNewPageIfNeeded = (spaceNeeded, forceNewPage = false) => {
      if (forceNewPage || yPosition - spaceNeeded < margin + 50) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin;
        return true;
      }
      return false;
    };

    // Helper function mejorada siguiendo el patrón de QualityBookGenerator
    const drawText = (text, x, y, options = {}) => {
      try {
        const {
          font = helveticaFont,
          size = 10,
          color = darkGray
        } = options;
        
        // Validación robusta para evitar errores
        let textStr = 'N/A';
        if (text !== null && text !== undefined) {
          textStr = String(text).trim();
          if (textStr === '') textStr = 'N/A';
        }
        
        // Limitar longitud y limpiar caracteres problemáticos
        textStr = textStr.substring(0, 100).replace(/[^\x00-\x7F]/g, '');
        
        currentPage.drawText(textStr, {
          x,
          y,
          size,
          font,
          color
        });
      } catch (error) {
        console.error('Error drawing text:', error);
        // Draw error placeholder
        currentPage.drawText('Error displaying text', {
          x,
          y,
          size: 8,
          font: helveticaFont,
          color: errorRed
        });
      }
    };

    // ===== PÁGINA 1: GENERAL INFORMATION + CERTIFICATIONS =====
    
    // Document Header
    console.log('PDF Service: Drawing header...');
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

    // Basic Information Section
    console.log('PDF Service: Drawing basic information...');
    addNewPageIfNeeded(150);
    
    // Section header
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
    
    // Basic info fields
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
      addNewPageIfNeeded(20);
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

    // Company Certifications - MEJORADO
    console.log('PDF Service: Drawing certifications...');
    addNewPageIfNeeded(100);
    
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
    
    // ✅ CERTIFICACIONES CON VALIDACIÓN ROBUSTA
    const certifications = [];
    
    console.log('PDF Service: Processing certifications:', supplierData.certifications);
    
    // Validar que supplierData y certifications existen
    if (supplierData && supplierData.certifications && typeof supplierData.certifications === 'object') {
      try {
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
        if (supplierData.certifications.others && 
            typeof supplierData.certifications.others === 'string' && 
            supplierData.certifications.others.trim() !== '') {
          certifications.push(`✓ Others: ${supplierData.certifications.others.trim()}`);
        }
      } catch (certError) {
        console.error('Error processing individual certifications:', certError);
        certifications.push('Error processing certifications');
      }
    } else {
      console.log('No certifications data found or invalid format');
    }
    
    if (certifications.length === 0) {
      certifications.push('No certifications specified');
    }
    
    // Dibujar certificaciones con manejo de errores
    certifications.forEach((cert, index) => {
      try {
        addNewPageIfNeeded(15);
        console.log(`Drawing certification ${index + 1}:`, cert);
        drawText(cert, margin + 20, yPosition, { size: 9 });
        yPosition -= 15;
      } catch (certError) {
        console.error(`Error drawing certification ${index + 1}:`, certError);
        yPosition -= 15;
      }
    });
    
    yPosition -= 20;

    // ===== PÁGINA 2: KPI EVALUATION RESULTS + GRÁFICO + FIRMA =====
    
    // ✅ FORZAR NUEVA PÁGINA para KPI Results
    console.log('PDF Service: Drawing KPI results...');
    addNewPageIfNeeded(0, true); // Forzar nueva página
    
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
    
    // ✅ KPI Results - VERSIÓN MEJORADA
    const fonts = { helveticaFont, helveticaBoldFont };
    const colors = { primaryBlue, lightBlue, successGreen, warningOrange, errorRed, lightGray, darkGray, white };

    Object.entries(KPI_DESCRIPTIONS).forEach(([kpiKey, description]) => {
      const score = (supplierData && supplierData.kpiScores && supplierData.kpiScores[kpiKey]) || 0;
      const scoreLabel = SCORE_LABELS[score] || 'Not Scored';
      const details = supplierData && supplierData.kpiDetails && supplierData.kpiDetails[kpiKey];
      
      yPosition = drawEnhancedKPISection(
        currentPage, 
        kpiKey, 
        description, 
        score, 
        scoreLabel, 
        details, 
        yPosition, 
        margin, 
        contentWidth, 
        fonts, 
        colors,
        (space) => {
          if (addNewPageIfNeeded(space)) {
            // Si se creó nueva página, actualizar currentPage
            const pages = pdfDoc.getPages();
            currentPage = pages[pages.length - 1];
          }
        }
      );
    });

    // ✅ AGREGAR GRÁFICO DESPUÉS DE LOS KPIs Y ANTES DE EVALUATION SUMMARY
    console.log('PDF Service: Adding KPI chart...');
    addNewPageIfNeeded(150);

    // Título del gráfico
    drawText('KPI Performance Summary', {
      x: margin + 20,
      y: yPosition,
      size: 12,
      font: helveticaBoldFont,
      color: primaryBlue
    });

    yPosition -= 30;

    // Dibujar el gráfico
    const kpiScores = supplierData && supplierData.kpiScores ? supplierData.kpiScores : {};
    drawKPIChart(currentPage, kpiScores, margin + 20, yPosition - 120, contentWidth - 40, 120, fonts, colors);

    yPosition -= 140; // Espacio después del gráfico

    // GAI and Classification
    console.log('PDF Service: Drawing classification...');
    addNewPageIfNeeded(80);
    
    const totalScore = Object.values(kpiScores).reduce((sum, score) => sum + (score || 0), 0);
    const gai = (supplierData && supplierData.gai) || 0;
    const supplierClass = (supplierData && supplierData.supplierClass) || 'C';
    
    let classColor = errorRed;
    if (supplierClass === 'A') classColor = successGreen;
    else if (supplierClass === 'B') classColor = warningOrange;
    
    currentPage.drawRectangle({
      x: margin,
      y: yPosition - 60,
      width: contentWidth,
      height: 60,
      color: classColor,
      opacity: 0.1
    });
    
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

    // Observations
    const observations = supplierData && supplierData.observations ? supplierData.observations : {};
    if (observations.strengths || observations.improvements || observations.actions) {
      console.log('PDF Service: Drawing observations...');
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
      
      if (observations.strengths) {
        addNewPageIfNeeded(30);
        drawText('Identified Strengths:', margin + 20, yPosition, {
          font: helveticaBoldFont,
          size: 10,
          color: lightBlue
        });
        yPosition -= 15;
        drawText(observations.strengths, margin + 30, yPosition, { size: 9 });
        yPosition -= 20;
      }
      
      if (observations.improvements) {
        addNewPageIfNeeded(30);
        drawText('Areas for Improvement:', margin + 20, yPosition, {
          font: helveticaBoldFont,
          size: 10,
          color: lightBlue
        });
        yPosition -= 15;
        drawText(observations.improvements, margin + 30, yPosition, { size: 9 });
        yPosition -= 20;
      }
      
      if (observations.actions) {
        addNewPageIfNeeded(30);
        drawText('Required Actions:', margin + 20, yPosition, {
          font: helveticaBoldFont,
          size: 10,
          color: lightBlue
        });
        yPosition -= 15;
        drawText(observations.actions, margin + 30, yPosition, { size: 9 });
        yPosition -= 20;
      }
    }

    // ✅ SECCIÓN DE FIRMA AL FINAL
    console.log('PDF Service: Adding signature section...');
    
    // Asegurar espacio para la firma
    addNewPageIfNeeded(120);
    
    // Posicionar correctamente
    if (yPosition > pageHeight - 200) {
      yPosition = Math.min(yPosition, pageHeight - 200);
    }
    if (yPosition < 180) {
      yPosition = 180;
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
    const auditorName = (supplierData && supplierData.auditorName) || 'N/A';
    const auditDate = (supplierData && supplierData.auditDate) || new Date().toLocaleDateString();
    
    drawText(`Evaluated by: ${auditorName}`, margin + 20, yPosition, {
      size: 9
    });
    
    yPosition -= 15;
    drawText(`Date: ${auditDate}`, margin + 20, yPosition, {
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

    // Footer on each page
    console.log('PDF Service: Adding footers...');
    const pages = pdfDoc.getPages();
    pages.forEach((page, index) => {
      // Page number
      page.drawText(`Page ${index + 1} of ${pages.length}`, {
        x: pageWidth - 100,
        y: 30,
        size: 8,
        font: helveticaFont,
        color: lightGray
      });
      
      // Generation date
      page.drawText(`Generated on ${new Date().toLocaleDateString()}`, {
        x: margin,
        y: 30,
        size: 8,
        font: helveticaFont,
        color: lightGray
      });
      
      // Company footer
      page.drawText('Valmont Solar - Quality Control Department', {
        x: margin,
        y: 15,
        size: 8,
        font: helveticaFont,
        color: lightGray
      });
    });

    // Save and download
    console.log('PDF Service: Saving and downloading PDF...');
    const pdfBytes = await pdfDoc.save();
    console.log('PDF Service: PDF bytes generated, size:', pdfBytes.length);
    
    const supplierName = (supplierData && supplierData.supplierName) || 'Unknown';
    const fileName = `Supplier_Evaluation_${supplierName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log('PDF Service: File name:', fileName);
    
    // Create download
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ PDF generated successfully with enhanced design and KPI chart');
    
  } catch (error) {
    console.error('PDF Service: Error generating PDF:', error);
    console.error('PDF Service: Error stack:', error.stack);
    throw new Error(`Failed to generate PDF report: ${error.message}`);
  }
};