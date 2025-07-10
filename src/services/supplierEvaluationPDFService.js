// src/services/supplierEvaluationPDFService.js
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
    console.log('Generating Supplier Evaluation PDF...');
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
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
    
    // Helper function to check if new page is needed
    const addNewPageIfNeeded = (spaceNeeded) => {
      if (yPosition - spaceNeeded < margin + 50) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin;
        return true;
      }
      return false;
    };

    // Helper function to draw text
    const drawText = (text, x, y, options = {}) => {
      const {
        font = helveticaFont,
        size = 10,
        color = darkGray,
        maxWidth = contentWidth
      } = options;
      
      // Handle long text by wrapping
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      
      words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const textWidth = font.widthOfTextAtSize(testLine, size);
        
        if (textWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      });
      
      if (currentLine) lines.push(currentLine);
      
      lines.forEach((line, index) => {
        currentPage.drawText(line, {
          x,
          y: y - (index * (size + 2)),
          size,
          font,
          color
        });
      });
      
      return lines.length * (size + 2);
    };

    // Helper function to draw sections with proper spacing
    const drawSection = (title, content, startY) => {
      let y = startY;
      
      // Section header with background
      addNewPageIfNeeded(30);
      currentPage.drawRectangle({
        x: margin,
        y: y - 20,
        width: contentWidth,
        height: 25,
        color: primaryBlue
      });
      
      drawText(title, margin + 10, y - 15, {
        font: helveticaBoldFont,
        size: 12,
        color: white
      });
      
      y -= 35;
      
      // Section content
      if (Array.isArray(content)) {
        content.forEach(item => {
          if (item.type === 'field') {
            addNewPageIfNeeded(20);
            drawText(`${item.label}:`, margin + 10, y, {
              font: helveticaBoldFont,
              size: 9
            });
            const textHeight = drawText(item.value, margin + 200, y, {
              size: 9,
              maxWidth: contentWidth - 200
            });
            y -= Math.max(15, textHeight);
          } else if (item.type === 'subsection') {
            addNewPageIfNeeded(25);
            drawText(item.title, margin + 20, y, {
              font: helveticaBoldFont,
              size: 10,
              color: lightBlue
            });
            y -= 20;
          } else if (item.type === 'text') {
            addNewPageIfNeeded(15);
            const textHeight = drawText(item.text, margin + 20, y, {
              size: 9,
              maxWidth: contentWidth - 30
            });
            y -= Math.max(15, textHeight);
          } else if (item.type === 'kpi-score') {
            addNewPageIfNeeded(30);
            // Draw KPI score with color coding
            let scoreColor = lightGray;
            if (item.score >= 4) scoreColor = successGreen;
            else if (item.score >= 3) scoreColor = lightBlue;
            else if (item.score >= 2) scoreColor = warningOrange;
            else if (item.score >= 1) scoreColor = errorRed;
            
            currentPage.drawRectangle({
              x: margin + 10,
              y: y - 15,
              width: 30,
              height: 20,
              color: scoreColor
            });
            
            drawText(item.score.toString(), margin + 20, y - 10, {
              font: helveticaBoldFont,
              size: 12,
              color: white
            });
            
            drawText(`${item.label} - ${item.description}`, margin + 50, y - 10, {
              font: helveticaBoldFont,
              size: 10,
              color: darkGray
            });
            
            y -= 25;
          }
        });
      }
      
      return y - 20;
    };

    // Helper function to format field names
    const formatFieldName = (key) => {
      return key.replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .replace(/Qc/g, 'QC')
                .replace(/Iso/g, 'ISO')
                .replace(/Tig/g, 'TIG')
                .replace(/Mig/g, 'MIG')
                .replace(/Cmm/g, 'CMM');
    };

    // Document Header
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
    const basicInfo = [
      { type: 'field', label: 'Supplier Name', value: supplierData.supplierName || 'N/A' },
      { type: 'field', label: 'Category', value: supplierData.category || 'N/A' },
      { type: 'field', label: 'Location', value: supplierData.location || 'N/A' },
      { type: 'field', label: 'Contact Person', value: supplierData.contactPerson || 'N/A' },
      { type: 'field', label: 'Audit Date', value: supplierData.auditDate || 'N/A' },
      { type: 'field', label: 'Auditor', value: supplierData.auditorName || 'N/A' },
      { type: 'field', label: 'Activity Field', value: supplierData.activityField || 'N/A' },
      { type: 'field', label: 'Audit Type', value: supplierData.auditType || 'N/A' }
    ];
    
    yPosition = drawSection('GENERAL INFORMATION', basicInfo, yPosition);

    // Company Certifications
    const certificationsList = [];
    if (supplierData.certifications) {
      if (supplierData.certifications.iso9001) certificationsList.push({ type: 'text', text: '✓ ISO 9001:2015' });
      if (supplierData.certifications.iso14001) certificationsList.push({ type: 'text', text: '✓ ISO 14001:2015' });
      if (supplierData.certifications.iso45001) certificationsList.push({ type: 'text', text: '✓ ISO 45001/OHSAS 18001' });
      if (supplierData.certifications.en1090) certificationsList.push({ type: 'text', text: '✓ EN 1090 (Steel Structures)' });
      if (supplierData.certifications.ceMarking) certificationsList.push({ type: 'text', text: '✓ CE Marking' });
      if (supplierData.certifications.others) certificationsList.push({ type: 'text', text: `✓ Others: ${supplierData.certifications.others}` });
    }
    
    if (certificationsList.length === 0) {
      certificationsList.push({ type: 'text', text: 'No certifications specified' });
    }
    
    yPosition = drawSection('COMPANY CERTIFICATIONS', certificationsList, yPosition);

    // Company Data
    const companyData = [
      { type: 'field', label: 'Annual Revenue (USD/year)', value: supplierData.companyData?.annualRevenue || 'N/A' },
      { type: 'field', label: 'Number of Employees', value: supplierData.companyData?.employees || 'N/A' }
    ];
    
    yPosition = drawSection('COMPANY DATA', companyData, yPosition);

    // KPI Evaluation Results with Details
    const kpiResults = [];
    
    Object.entries(KPI_DESCRIPTIONS).forEach(([kpiKey, description]) => {
      const score = supplierData.kpiScores?.[kpiKey] || 0;
      const scoreLabel = SCORE_LABELS[score] || 'Not Scored';
      
      kpiResults.push({
        type: 'subsection',
        title: `${kpiKey.toUpperCase()} - ${description}`
      });
      
      kpiResults.push({
        type: 'kpi-score',
        label: 'Score',
        score: score,
        description: scoreLabel
      });

      // Add KPI details if they exist
      const details = supplierData.kpiDetails?.[kpiKey];
      if (details && typeof details === 'object') {
        Object.entries(details).forEach(([key, value]) => {
          if (value !== undefined && value !== '' && value !== false && value !== 0) {
            let displayValue = value;
            if (typeof value === 'boolean') {
              displayValue = value ? 'Yes' : 'No';
            }
            
            const fieldName = formatFieldName(key);
            
            kpiResults.push({
              type: 'field',
              label: fieldName,
              value: displayValue.toString()
            });
          }
        });
      }
    });
    
    yPosition = drawSection('KPI EVALUATION RESULTS', kpiResults, yPosition);

    // GAI and Classification with visual elements
    const totalScore = Object.values(supplierData.kpiScores).reduce((sum, score) => sum + (score || 0), 0);
    const gai = supplierData.gai || 0;
    const supplierClass = supplierData.supplierClass || 'C';
    
    // Add visual classification box
    addNewPageIfNeeded(80);
    
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

    // Observations and Recommendations
    const observations = [];
    if (supplierData.observations?.strengths) {
      observations.push({ type: 'subsection', title: 'Identified Strengths' });
      observations.push({ type: 'text', text: supplierData.observations.strengths });
    }
    if (supplierData.observations?.improvements) {
      observations.push({ type: 'subsection', title: 'Areas for Improvement' });
      observations.push({ type: 'text', text: supplierData.observations.improvements });
    }
    if (supplierData.observations?.actions) {
      observations.push({ type: 'subsection', title: 'Required Actions' });
      observations.push({ type: 'text', text: supplierData.observations.actions });
    }
    if (supplierData.observations?.followUpDate) {
      observations.push({ type: 'field', label: 'Follow-up Date', value: supplierData.observations.followUpDate });
    }
    
    if (observations.length > 0) {
      yPosition = drawSection('OBSERVATIONS & RECOMMENDATIONS', observations, yPosition);
    }

    // Footer on each page
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
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const fileName = `Supplier_Evaluation_${supplierData.supplierName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    
    URL.revokeObjectURL(url);
    
    console.log('PDF generated and downloaded successfully:', fileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF report: ${error.message}`);
  }
};