// src/services/supplierEvaluationPDFService.js
// VERSIÓN CONSERVADORA: Código original + solo gráfico básico

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

    // Helper function mejorada
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

    // FORZAR NUEVA PÁGINA para KPI Results
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
    
    // KPI Results - MEJORADO CONSERVADORAMENTE
    Object.entries(KPI_DESCRIPTIONS).forEach(([kpiKey, description]) => {
      addNewPageIfNeeded(80);
      
      const score = (supplierData && supplierData.kpiScores && supplierData.kpiScores[kpiKey]) || 0;
      const scoreLabel = SCORE_LABELS[score] || 'Not Scored';
      
      // ✅ CONTENEDOR MEJORADO PARA CADA KPI
      currentPage.drawRectangle({
        x: margin,
        y: yPosition - 50,
        width: contentWidth,
        height: 50,
        color: { r: 0.98, g: 0.99, b: 1 },
        borderColor: lightBlue,
        borderWidth: 0.5
      });
      
      // KPI Title
      drawText(`${kpiKey.toUpperCase()} - ${description}`, margin + 10, yPosition - 15, {
        font: helveticaBoldFont,
        size: 10,
        color: lightBlue
      });
      yPosition -= 25;
      
      // Score with color
      let scoreColor = lightGray;
      if (score >= 4) scoreColor = successGreen;
      else if (score >= 3) scoreColor = lightBlue;
      else if (score >= 2) scoreColor = warningOrange;
      else if (score >= 1) scoreColor = errorRed;
      
      currentPage.drawRectangle({
        x: margin + 20,
        y: yPosition - 15,
        width: 25,
        height: 18,
        color: scoreColor
      });
      
      drawText(score.toString(), margin + 27, yPosition - 10, {
        font: helveticaBoldFont,
        size: 10,
        color: white
      });
      
      drawText(`Score: ${score}/4 - ${scoreLabel}`, margin + 55, yPosition - 10, {
        size: 9
      });
      
      yPosition -= 35;
    });

    // ✅ AGREGAR GRÁFICO SIMPLE DESPUÉS DE LOS KPIs
    console.log('PDF Service: Adding simple KPI chart...');
    addNewPageIfNeeded(100);

    // Título del gráfico
    drawText('KPI Performance Summary', margin + 20, yPosition, {
      size: 12,
      font: helveticaBoldFont,
      color: primaryBlue
    });

    yPosition -= 30;

    // Gráfico simple de barras
    const kpiScores = supplierData && supplierData.kpiScores ? supplierData.kpiScores : {};
    const kpiData = [
      { label: 'KPI1', value: kpiScores.kpi1 || 0, name: 'Production' },
      { label: 'KPI2', value: kpiScores.kpi2 || 0, name: 'Quality' },
      { label: 'KPI3', value: kpiScores.kpi3 || 0, name: 'Materials' },
      { label: 'KPI4', value: kpiScores.kpi4 || 0, name: 'HR' },
      { label: 'KPI5', value: kpiScores.kpi5 || 0, name: 'Logistics' }
    ];
    
    const chartX = margin + 20;
    const chartY = yPosition - 80;
    const chartWidth = contentWidth - 40;
    const barWidth = chartWidth / 6;
    
    // Fondo del gráfico
    currentPage.drawRectangle({
      x: chartX,
      y: chartY,
      width: chartWidth,
      height: 80,
      color: { r: 0.98, g: 0.98, b: 0.98 },
      borderColor: lightGray,
      borderWidth: 1
    });
    
    // Dibujar barras simples
    kpiData.forEach((kpi, index) => {
      const barX = chartX + 10 + (index * barWidth);
      const barHeight = (kpi.value / 4) * 50;
      const barY = chartY + 10;
      
      // Color de la barra
      let barColor = lightGray;
      if (kpi.value >= 4) barColor = successGreen;
      else if (kpi.value >= 3) barColor = lightBlue;
      else if (kpi.value >= 2) barColor = warningOrange;
      else if (kpi.value >= 1) barColor = errorRed;
      
      // Dibujar barra
      currentPage.drawRectangle({
        x: barX,
        y: barY,
        width: barWidth - 15,
        height: barHeight,
        color: barColor
      });
      
      // Valor encima de la barra
      drawText(kpi.value.toString(), barX + (barWidth - 15) / 2 - 3, barY + barHeight + 5, {
        size: 9,
        font: helveticaBoldFont,
        color: darkGray
      });
      
      // Etiqueta del KPI
      drawText(kpi.name, barX + (barWidth - 15) / 2 - (kpi.name.length * 2), chartY - 5, {
        size: 8,
        font: helveticaFont,
        color: darkGray
      });
    });

    yPosition -= 100; // Espacio después del gráfico

    // GAI and Classification (código original)
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

    // Observations (código original)
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

    // SECCIÓN DE FIRMA (código original)
    console.log('PDF Service: Adding signature section...');
    
    addNewPageIfNeeded(120);
    
    if (yPosition > pageHeight - 200) {
      yPosition = Math.min(yPosition, pageHeight - 200);
    }
    if (yPosition < 180) {
      yPosition = 180;
    }
    
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
      page.drawText(`Page ${index + 1} of ${pages.length}`, {
        x: pageWidth - 100,
        y: 30,
        size: 8,
        font: helveticaFont,
        color: lightGray
      });
      
      page.drawText(`Generated on ${new Date().toLocaleDateString()}`, {
        x: margin,
        y: 30,
        size: 8,
        font: helveticaFont,
        color: lightGray
      });
      
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
    
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ PDF generated successfully with conservative improvements');
    
  } catch (error) {
    console.error('PDF Service: Error generating PDF:', error);
    console.error('PDF Service: Error stack:', error.stack);
    throw new Error(`Failed to generate PDF report: ${error.message}`);
  }
};