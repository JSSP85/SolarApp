// src/services/supplierEvaluationPDFService.js
// VERSIÓN MEJORADA CON DISEÑO PROFESIONAL EXACTO AL MOCKUP

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

/**
 * Generate and download a professional PDF report for supplier evaluation
 * @param {Object} supplierData - Complete supplier evaluation data
 * @returns {Promise<void>}
 */
export const generateSupplierEvaluationPDF = async (supplierData) => {
  try {
    console.log('PDF Service: Starting PDF generation...');
    console.log('PDF Service: Supplier data received:', supplierData);
    
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
    
    // Nuevos colores para observation boxes
    const strengthsGreen = rgb(240/255, 253/255, 244/255);
    const strengthsBorder = rgb(16/255, 185/255, 129/255);
    const improvementsOrange = rgb(255/255, 251/255, 235/255);
    const improvementsBorder = rgb(245/255, 158/255, 11/255);
    const actionsRed = rgb(254/255, 242/255, 242/255);
    const actionsBorder = rgb(239/255, 68/255, 68/255);
    
    // Page dimensions
    const pageWidth = 595.28; // A4 width in points
    const pageHeight = 841.89; // A4 height in points
    const margin = 50;
    const contentWidth = pageWidth - (2 * margin);
    
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - margin;
    
    console.log('PDF Service: Page created, starting content...');
    
    // ✅ Helper function modificada para soportar forceNewPage
    const addNewPageIfNeeded = (spaceNeeded, forceNewPage = false) => {
      if (forceNewPage || yPosition - spaceNeeded < margin + 50) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin;
        return true;
      }
      return false;
    };

    // ✅ Helper function mejorada siguiendo el patrón de QualityBookGenerator
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

    // ✅ NUEVA FUNCIÓN: Dibujar tarjeta KPI profesional
    const drawKPICard = (x, y, width, height, kpiKey, score, details) => {
      const kpiTitle = KPI_DESCRIPTIONS[kpiKey] || 'Unknown KPI';
      const scoreLabel = SCORE_LABELS[score] || 'Not Scored';
      
      // Fondo de la tarjeta
      currentPage.drawRectangle({
        x: x,
        y: y - height,
        width: width,
        height: height,
        color: rgb(0.95, 0.95, 0.95),
        borderColor: rgb(0.85, 0.85, 0.85),
        borderWidth: 1
      });
      
      // Header de la tarjeta
      currentPage.drawRectangle({
        x: x,
        y: y - 25,
        width: width,
        height: 25,
        color: rgb(0.98, 0.98, 0.98),
        borderColor: rgb(0.85, 0.85, 0.85),
        borderWidth: 0.5
      });
      
      // Título del KPI
      drawText(`${kpiKey.toUpperCase()} - ${kpiTitle}`, x + 10, y - 18, {
        font: helveticaBoldFont,
        size: 9,
        color: primaryBlue
      });
      
      // Score badge con color
      let scoreColor = lightGray;
      if (score >= 4) scoreColor = successGreen;
      else if (score >= 3) scoreColor = lightBlue;
      else if (score >= 2) scoreColor = warningOrange;
      else if (score >= 1) scoreColor = errorRed;
      
      // Badge circular para el score
      currentPage.drawRectangle({
        x: x + width - 35,
        y: y - 22,
        width: 25,
        height: 18,
        color: scoreColor,
        borderWidth: 0
      });
      
      drawText(score.toString(), x + width - 28, y - 16, {
        font: helveticaBoldFont,
        size: 12,
        color: white
      });
      
      // Descripción del score
      drawText(scoreLabel, x + 10, y - 40, {
        font: helveticaFont,
        size: 8,
        color: lightGray
      });
      
      // Detalles del KPI (solo los más importantes)
      let detailY = y - 55;
      if (details && typeof details === 'object') {
        let detailCount = 0;
        const maxDetails = 3; // Limitar a 3 detalles por tarjeta
        
        Object.entries(details).forEach(([key, value]) => {
          if (detailCount >= maxDetails) return;
          if (value !== undefined && value !== '' && value !== false && value !== 0) {
            let displayValue = value;
            if (typeof value === 'boolean') {
              displayValue = value ? 'Yes' : 'No';
            }
            
            const fieldName = key.replace(/([A-Z])/g, ' $1')
                                 .replace(/^./, str => str.toUpperCase())
                                 .replace(/([a-z])([A-Z])/g, '$1 $2');
            
            // Línea separadora sutil
            currentPage.drawRectangle({
              x: x + 10,
              y: detailY + 5,
              width: width - 20,
              height: 0.5,
              color: rgb(0.9, 0.9, 0.9)
            });
            
            drawText(`${fieldName}:`, x + 15, detailY, {
              font: helveticaBoldFont,
              size: 7,
              color: darkGray
            });
            
            // Truncar valores largos
            const truncatedValue = displayValue.toString().substring(0, 25);
            drawText(truncatedValue, x + width - 80, detailY, {
              font: helveticaFont,
              size: 7,
              color: darkGray
            });
            
            detailY -= 12;
            detailCount++;
          }
        });
      }
    };

    // ✅ NUEVA FUNCIÓN: Dibujar gráfico de barras KPI
    const drawKPIChart = (x, y, width, height, kpiScores) => {
      // Fondo del gráfico
      currentPage.drawRectangle({
        x: x,
        y: y - height,
        width: width,
        height: height,
        color: white,
        borderColor: rgb(0.85, 0.85, 0.85),
        borderWidth: 1
      });
      
      // Título del gráfico
      drawText('KPI Performance Overview', x + width/2 - 40, y - 15, {
        font: helveticaBoldFont,
        size: 10,
        color: primaryBlue
      });
      
      // Ejes del gráfico
      const chartMargin = 30;
      const chartWidth = width - (2 * chartMargin);
      const chartHeight = height - 50;
      const barWidth = chartWidth / 7; // Espacio para 5 barras + espacios
      
      // Eje Y (vertical) - líneas de puntuación
      for (let i = 0; i <= 4; i++) {
        const lineY = y - height + chartMargin + (i * chartHeight / 4);
        
        // Línea horizontal sutil
        currentPage.drawRectangle({
          x: x + chartMargin,
          y: lineY,
          width: chartWidth,
          height: 0.5,
          color: rgb(0.9, 0.9, 0.9)
        });
        
        // Etiqueta del eje Y
        drawText(i.toString(), x + chartMargin - 15, lineY - 3, {
          font: helveticaFont,
          size: 8,
          color: lightGray
        });
      }
      
      // Dibujar barras para cada KPI
      Object.entries(kpiScores).forEach(([kpiKey, score], index) => {
        const barX = x + chartMargin + (index * barWidth) + (barWidth * 0.2);
        const barHeight = (score / 4) * chartHeight;
        const barY = y - height + chartMargin;
        
        // Barra con gradiente simulado
        currentPage.drawRectangle({
          x: barX,
          y: barY,
          width: barWidth * 0.6,
          height: barHeight,
          color: primaryBlue
        });
        
        // Valor encima de la barra
        drawText(score.toString(), barX + (barWidth * 0.2), barY + barHeight + 5, {
          font: helveticaBoldFont,
          size: 9,
          color: primaryBlue
        });
        
        // Etiqueta del KPI
        drawText(kpiKey.toUpperCase(), barX + (barWidth * 0.1), barY - 15, {
          font: helveticaBoldFont,
          size: 7,
          color: primaryBlue
        });
      });
    };

    // ✅ NUEVA FUNCIÓN: Dibujar cuadro de observación con colores
    const drawObservationBox = (x, y, width, title, content, type) => {
      let bgColor, borderColor, titleColor;
      
      switch (type) {
        case 'strengths':
          bgColor = strengthsGreen;
          borderColor = strengthsBorder;
          titleColor = successGreen;
          break;
        case 'improvements':
          bgColor = improvementsOrange;
          borderColor = improvementsBorder;
          titleColor = warningOrange;
          break;
        case 'actions':
          bgColor = actionsRed;
          borderColor = actionsBorder;
          titleColor = errorRed;
          break;
        default:
          bgColor = rgb(0.95, 0.95, 0.95);
          borderColor = lightGray;
          titleColor = darkGray;
      }
      
      // Calcular altura según contenido
      const lines = Math.ceil(content.length / 80); // Aproximadamente 80 caracteres por línea
      const boxHeight = Math.max(50, 30 + (lines * 10));
      
      // Fondo del cuadro
      currentPage.drawRectangle({
        x: x,
        y: y - boxHeight,
        width: width,
        height: boxHeight,
        color: bgColor
      });
      
      // Borde izquierdo grueso
      currentPage.drawRectangle({
        x: x,
        y: y - boxHeight,
        width: 5,
        height: boxHeight,
        color: borderColor
      });
      
      // Título
      drawText(title, x + 15, y - 20, {
        font: helveticaBoldFont,
        size: 10,
        color: titleColor
      });
      
      // Contenido con word wrap simple
      const maxCharsPerLine = 75;
      const words = content.split(' ');
      let currentLine = '';
      let lineY = y - 35;
      
      words.forEach(word => {
        if ((currentLine + word).length > maxCharsPerLine) {
          if (currentLine) {
            drawText(currentLine, x + 15, lineY, {
              font: helveticaFont,
              size: 9,
              color: darkGray
            });
            lineY -= 12;
            currentLine = word + ' ';
          }
        } else {
          currentLine += word + ' ';
        }
      });
      
      // Última línea
      if (currentLine) {
        drawText(currentLine, x + 15, lineY, {
          font: helveticaFont,
          size: 9,
          color: darkGray
        });
      }
      
      return boxHeight + 15; // Retornar altura total usada + espacio
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

    // Company Certifications
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
    
    // Certificaciones con validación robusta
    const certifications = [];
    
    console.log('PDF Service: Processing certifications:', supplierData.certifications);
    
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
    
    // Dibujar certificaciones
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

    // ===== PÁGINA 2: NUEVO DISEÑO KPI + EVALUATION SUMMARY + OBSERVATIONS =====
    
    console.log('PDF Service: Starting Page 2 with new design...');
    addNewPageIfNeeded(0, true); // Forzar nueva página
    
    // Header de página 2
    currentPage.drawRectangle({
      x: 0,
      y: pageHeight - 60,
      width: pageWidth,
      height: 60,
      color: primaryBlue
    });
    
    drawText('SUPPLIER EVALUATION REPORT', margin, pageHeight - 25, {
      font: helveticaBoldFont,
      size: 18,
      color: white
    });
    
    drawText('Quality Control Assessment - Page 2', margin, pageHeight - 45, {
      font: helveticaFont,
      size: 10,
      color: white
    });
    
    yPosition = pageHeight - 80;

    // ✅ SECCIÓN KPI EVALUATION RESULTS CON NUEVO DISEÑO
    console.log('PDF Service: Drawing KPI cards...');
    
    currentPage.drawRectangle({
      x: margin,
      y: yPosition - 20,
      width: contentWidth,
      height: 25,
      color: primaryBlue
    });
    
    drawText('🔍 KPI EVALUATION RESULTS', margin + 10, yPosition - 15, {
      font: helveticaBoldFont,
      size: 12,
      color: white
    });
    
    yPosition -= 45;
    
    // Grilla de KPIs 2x2 + 1 completo
    const cardWidth = (contentWidth - 20) / 2;
    const cardHeight = 120;
    const kpiScores = supplierData && supplierData.kpiScores ? supplierData.kpiScores : {};
    const kpiDetails = supplierData && supplierData.kpiDetails ? supplierData.kpiDetails : {};
    
    // Primera fila: KPI1 y KPI2
    addNewPageIfNeeded(cardHeight + 20);
    drawKPICard(margin, yPosition, cardWidth, cardHeight, 'kpi1', kpiScores.kpi1 || 0, kpiDetails.kpi1);
    drawKPICard(margin + cardWidth + 20, yPosition, cardWidth, cardHeight, 'kpi2', kpiScores.kpi2 || 0, kpiDetails.kpi2);
    yPosition -= cardHeight + 20;
    
    // Segunda fila: KPI3 y KPI4
    addNewPageIfNeeded(cardHeight + 20);
    drawKPICard(margin, yPosition, cardWidth, cardHeight, 'kpi3', kpiScores.kpi3 || 0, kpiDetails.kpi3);
    drawKPICard(margin + cardWidth + 20, yPosition, cardWidth, cardHeight, 'kpi4', kpiScores.kpi4 || 0, kpiDetails.kpi4);
    yPosition -= cardHeight + 20;
    
    // Tercera fila: KPI5 (ancho completo)
    addNewPageIfNeeded(cardHeight + 20);
    drawKPICard(margin, yPosition, contentWidth, cardHeight, 'kpi5', kpiScores.kpi5 || 0, kpiDetails.kpi5);
    yPosition -= cardHeight + 30;

    // ✅ EVALUATION SUMMARY MEJORADO CON GRÁFICO
    console.log('PDF Service: Drawing evaluation summary...');
    addNewPageIfNeeded(180);
    
    const summaryHeight = 160;
    
    // Fondo degradado simulado para summary
    currentPage.drawRectangle({
      x: margin,
      y: yPosition - summaryHeight,
      width: contentWidth,
      height: summaryHeight,
      color: rgb(0.94, 0.97, 1), // Azul muy claro
      borderColor: lightBlue,
      borderWidth: 2
    });
    
    // Título del summary
    drawText('📊 EVALUATION SUMMARY', margin + contentWidth/2 - 50, yPosition - 20, {
      font: helveticaBoldFont,
      size: 14,
      color: primaryBlue
    });
    
    // Datos del summary
    const totalScore = Object.values(kpiScores).reduce((sum, score) => sum + (score || 0), 0);
    const gai = (supplierData && supplierData.gai) || 0;
    const supplierClass = (supplierData && supplierData.supplierClass) || 'C';
    
    let classColor = errorRed;
    if (supplierClass === 'A') classColor = successGreen;
    else if (supplierClass === 'B') classColor = warningOrange;
    
    // Stats en cuadros
    const statBoxWidth = 80;
    const statBoxHeight = 50;
    const statY = yPosition - 80;
    
    // Total KPI Score
    currentPage.drawRectangle({
      x: margin + 20,
      y: statY - statBoxHeight,
      width: statBoxWidth,
      height: statBoxHeight,
      color: white,
      borderColor: rgb(0.85, 0.85, 0.85),
      borderWidth: 1
    });
    drawText(`${totalScore}/20`, margin + 45, statY - 20, {
      font: helveticaBoldFont,
      size: 16,
      color: primaryBlue
    });
    drawText('Total KPI Score', margin + 25, statY - 40, {
      font: helveticaFont,
      size: 8,
      color: lightGray
    });
    
    // G.A.I.
    currentPage.drawRectangle({
      x: margin + 120,
      y: statY - statBoxHeight,
      width: statBoxWidth,
      height: statBoxHeight,
      color: white,
      borderColor: rgb(0.85, 0.85, 0.85),
      borderWidth: 1
    });
    drawText(`${gai}%`, margin + 150, statY - 20, {
      font: helveticaBoldFont,
      size: 16,
      color: primaryBlue
    });
    drawText('G.A.I.', margin + 155, statY - 40, {
      font: helveticaFont,
      size: 8,
      color: lightGray
    });
    
    // Classification Badge
    const classBoxWidth = 100;
    currentPage.drawRectangle({
      x: margin + 220,
      y: statY - statBoxHeight,
      width: classBoxWidth,
      height: statBoxHeight,
      color: white,
      borderColor: classColor,
      borderWidth: 3
    });
    
    // Badge circular para la clase
    currentPage.drawRectangle({
      x: margin + 255,
      y: statY - 25,
      width: 30,
      height: 20,
      color: classColor
    });
    drawText(supplierClass, margin + 265, statY - 18, {
      font: helveticaBoldFont,
      size: 14,
      color: white
    });
    drawText('Classification', margin + 240, statY - 40, {
      font: helveticaFont,
      size: 8,
      color: lightGray
    });
    
    // Gráfico de barras KPI
    const chartWidth = 180;
    const chartHeight = 100;
    drawKPIChart(margin + contentWidth - chartWidth - 20, yPosition - 40, chartWidth, chartHeight, kpiScores);
    
    yPosition -= summaryHeight + 20;

    // ✅ OBSERVATIONS CON CUADROS DE COLORES
    console.log('PDF Service: Drawing observations...');
    const observations = supplierData && supplierData.observations ? supplierData.observations : {};
    
    if (observations.strengths || observations.improvements || observations.actions) {
      addNewPageIfNeeded(200);
      
      currentPage.drawRectangle({
        x: margin,
        y: yPosition - 20,
        width: contentWidth,
        height: 25,
        color: primaryBlue
      });
      
      drawText('💭 OBSERVATIONS & RECOMMENDATIONS', margin + 10, yPosition - 15, {
        font: helveticaBoldFont,
        size: 12,
        color: white
      });
      
      yPosition -= 45;
      
      // Strengths
      if (observations.strengths) {
        addNewPageIfNeeded(80);
        const usedHeight = drawObservationBox(
          margin, yPosition, contentWidth,
          '✅ Identified Strengths',
          observations.strengths,
          'strengths'
        );
        yPosition -= usedHeight;
      }
      
      // Improvements
      if (observations.improvements) {
        addNewPageIfNeeded(80);
        const usedHeight = drawObservationBox(
          margin, yPosition, contentWidth,
          '⚠️ Areas for Improvement',
          observations.improvements,
          'improvements'
        );
        yPosition -= usedHeight;
      }
      
      // Actions
      if (observations.actions) {
        addNewPageIfNeeded(80);
        const usedHeight = drawObservationBox(
          margin, yPosition, contentWidth,
          '🚨 Required Actions',
          observations.actions,
          'actions'
        );
        yPosition -= usedHeight;
      }
    }

    // ✅ SECCIÓN DE FIRMA AL FINAL
    console.log('PDF Service: Adding signature section...');
    addNewPageIfNeeded(80);
    
    yPosition -= 20;
    
    currentPage.drawRectangle({
      x: margin,
      y: yPosition - 20,
      width: contentWidth,
      height: 25,
      color: lightGray
    });
    
    drawText('AUDIT SIGNATURE & APPROVAL', margin + 10, yPosition - 15, {
      font: helveticaBoldFont,
      size: 12,
      color: white
    });
    
    yPosition -= 50;
    
    // Signature boxes
    const signatureWidth = (contentWidth - 40) / 2;
    
    currentPage.drawRectangle({
      x: margin,
      y: yPosition - 40,
      width: signatureWidth,
      height: 40,
      color: white,
      borderColor: lightGray,
      borderWidth: 1
    });
    
    drawText('Auditor Signature:', margin + 10, yPosition - 15, {
      font: helveticaBoldFont,
      size: 9
    });
    
    drawText(`Date: ${new Date().toLocaleDateString()}`, margin + 10, yPosition - 35, {
      size: 8,
      color: lightGray
    });
    
    currentPage.drawRectangle({
      x: margin + signatureWidth + 40,
      y: yPosition - 40,
      width: signatureWidth,
      height: 40,
      color: white,
      borderColor: lightGray,
      borderWidth: 1
    });
    
    drawText('Quality Manager Approval:', margin + signatureWidth + 50, yPosition - 15, {
      font: helveticaBoldFont,
      size: 9
    });
    
    drawText(`Date: _______________`, margin + signatureWidth + 50, yPosition - 35, {
      size: 8,
      color: lightGray
    });

    // ✅ FOOTER EN TODAS LAS PÁGINAS
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
    
    console.log('✅ PDF generated successfully with professional new design');
    
  } catch (error) {
    console.error('PDF Service: Error generating PDF:', error);
    console.error('PDF Service: Error stack:', error.stack);
    throw new Error(`Failed to generate PDF report: ${error.message}`);
  }
};
