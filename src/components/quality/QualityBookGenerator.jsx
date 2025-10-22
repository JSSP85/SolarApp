// src/components/quality/QualityBookGenerator.jsx - CÓDIGO COMPLETO CON 2 NUEVAS CATEGORÍAS
import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  Plus, 
  Trash2, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  Book,
  Building,
  Calendar,
  User,
  FileCheck,
  Truck,
  Award,
  Package,
  ArrowLeft,
  Settings,
  FileWarning,
  RotateCcw,
  Wrench,        // 🆕 NUEVO ICONO PARA HARDWARE
  Zap           // 🆕 NUEVO ICONO PARA ELECTRONIC
} from 'lucide-react';

// PDF generation imports
import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import './QualityBookGenerator.css';

// BackButton Component
const BackButton = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      background: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '50px',
      height: '50px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.3s',
      zIndex: 1000
    }}
    onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
  >
    <ArrowLeft size={24} color="#005F83" />
  </button>
);

const QualityBookGenerator = ({ onBackClick }) => {
  const [projectInfo, setProjectInfo] = useState({
    projectName: '',
    clientName: '',
    createdBy: '',
    approvedBy: '',
    createdDate: new Date().toISOString().split('T')[0],
    approvedDate: ''
  });

  // ESTADO ACTUALIZADO CON LAS 2 NUEVAS CATEGORÍAS
  const [documents, setDocuments] = useState({
    transportSuppliers: [],
    rawMaterialStandard: [],
    rawMaterialKit: [],
    rawMaterialHardware: [],        // 🆕 NUEVA CATEGORÍA HARDWARE
    rawMaterialElectronic: [],      // 🆕 NUEVA CATEGORÍA ELECTRONIC
    conformityDeclarations: [],
    testReports: [],
    transportValmont: []
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [realPreviewStructure, setRealPreviewStructure] = useState(null);
  const fileInputRef = useRef(null);
  const [currentUploadCategory, setCurrentUploadCategory] = useState('');
  const [dragOverCategory, setDragOverCategory] = useState(null);

  // FUNCIÓN CORREGIDA CON VALIDACIONES para formato de fecha DD/MM/YYYY
  const formatDateDDMMYYYY = (dateString) => {
    if (!dateString || dateString.toString().trim() === '') return '';
    
    try {
      const date = new Date(dateString.toString());
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn('Invalid date provided:', dateString);
        return '';
      }
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return '';
    }
  };

  // CATEGORÍAS DE DOCUMENTOS ACTUALIZADAS - CON 2 NUEVAS SECCIONES
  const documentCategories = [
    {
      key: 'transportSuppliers',
      title: 'TRANSPORT DOCUMENT_SUPPLIERS',
      icon: <Truck className="w-5 h-5" />,
      description: 'Transport documents from suppliers to Valmont Solar',
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      headerColor: 'bg-blue-600',
      sectionColor: '#3B82F6'
    },
    {
      key: 'rawMaterialStandard',
      title: 'RAW MATERIAL CERTIFICATES - STANDARD FAMILY',
      icon: <Award className="w-5 h-5" />,
      description: 'Raw material certificates for standard component family',
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
      headerColor: 'bg-green-600',
      sectionColor: '#10B981'
    },
    {
      key: 'rawMaterialKit',
      title: 'RAW MATERIAL CERTIFICATES - KIT FAMILY', 
      icon: <Package className="w-5 h-5" />,
      description: 'Raw material certificates for kit component family',
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
      headerColor: 'bg-purple-600',
      sectionColor: '#8B5CF6'
    },
    // 🆕 NUEVA CATEGORÍA 1: HARDWARE
    {
      key: 'rawMaterialHardware',
      title: 'RAW MATERIAL CERTIFICATES - HARDWARE',
      icon: <Wrench className="w-5 h-5" />,
      description: 'Raw material certificates for hardware components',
      color: 'bg-indigo-50 border-indigo-200',
      iconColor: 'text-indigo-600',
      headerColor: 'bg-indigo-600',
      sectionColor: '#6366F1'
    },
    // 🆕 NUEVA CATEGORÍA 2: ELECTRONIC & ELECTRONICAL
    {
      key: 'rawMaterialElectronic',
      title: 'RAW MATERIAL CERTIFICATES - ELECTRONIC & ELECTRONICAL',
      icon: <Zap className="w-5 h-5" />,
      description: 'Raw material certificates for electronic and electronical components',
      color: 'bg-yellow-50 border-yellow-200',
      iconColor: 'text-yellow-600',
      headerColor: 'bg-yellow-600',
      sectionColor: '#EAB308'
    },
    {
      key: 'conformityDeclarations',
      title: 'DECLARATION OF CONFORMITY',
      icon: <FileCheck className="w-5 h-5" />,
      description: 'Conformity declarations and certifications',
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600',
      headerColor: 'bg-orange-600',
      sectionColor: '#F59E0B'
    },
    {
      key: 'testReports',
      title: 'TEST REPORTS',
      icon: <FileWarning className="w-5 h-5" />,
      description: 'Testing reports and quality verification documents',
      color: 'bg-cyan-50 border-cyan-200',
      iconColor: 'text-cyan-600',
      headerColor: 'bg-cyan-600',
      sectionColor: '#06B6D4'
    },
    {
      key: 'transportValmont',
      title: 'TRANSPORT DOCUMENT_VALMONT',
      icon: <Truck className="w-5 h-5" />,
      description: 'Transport documents from Valmont Solar to client',
      color: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600',
      headerColor: 'bg-red-600',
      sectionColor: '#EF4444'
    }
  ];

  // MEJORA #2: Function to check if a document with the same name already exists
  const checkForDuplicateFiles = (files) => {
    const allExistingFiles = [];
    Object.values(documents).forEach(categoryFiles => {
      allExistingFiles.push(...categoryFiles.map(doc => doc.name));
    });

    const duplicates = files.filter(file => 
      allExistingFiles.includes(file.name)
    );

    return duplicates;
  };

  // MEJORA #1: Function to clean all documents from all categories (INCLUYE NUEVAS CATEGORÍAS)
  const cleanAllDocuments = () => {
    if (getTotalDocuments() === 0) {
      alert('No documents to clean.');
      return;
    }

    const confirmClean = window.confirm(
      `Are you sure you want to remove ALL ${getTotalDocuments()} documents from all categories?\n\nThis action cannot be undone.`
    );

    if (confirmClean) {
      const emptyDocuments = {};
      documentCategories.forEach(category => {
        emptyDocuments[category.key] = [];
      });
      setDocuments(emptyDocuments);
      
      // Also clear preview if it's showing
      setShowPreview(false);
      setRealPreviewStructure(null);
      
      alert('✅ All documents have been successfully removed from all categories.');
    }
  };

  // Handle file upload via button
  const handleFileUpload = (categoryKey) => {
    setCurrentUploadCategory(categoryKey);
    fileInputRef.current?.click();
  };

  // Handle file input change
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0 && currentUploadCategory) {
      addFilesToCategory(files, currentUploadCategory);
    }
    event.target.value = '';
  };

  // MEJORA #2: Add files to category (shared function for button upload and drag & drop) CON VALIDACIONES Y DETECCIÓN DE DUPLICADOS
  const addFilesToCategory = (files, categoryKey) => {
    // Check for duplicates first
    const duplicateFiles = checkForDuplicateFiles(files);
    
    if (duplicateFiles.length > 0) {
      const duplicateNames = duplicateFiles.map(file => `• ${file.name}`).join('\n');
      alert(`⚠️ Duplicate Files Detected!\n\nThe following documents are already uploaded:\n\n${duplicateNames}\n\nPlease choose different files or rename them before uploading.`);
      return;
    }

    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name || 'Unnamed file',
      size: file.size || 0,
      type: file.type || 'application/octet-stream',
      file: file,
      uploadDate: formatDateDDMMYYYY(new Date().toISOString().split('T')[0]) || new Date().toLocaleDateString()
    }));

    setDocuments(prev => ({
      ...prev,
      [categoryKey]: [...prev[categoryKey], ...newFiles]
    }));
  };

  // Drag & Drop handlers
  const handleDragOver = (e, categoryKey) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCategory(categoryKey);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCategory(null);
  };

  const handleDrop = (e, categoryKey) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCategory(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addFilesToCategory(files, categoryKey);
    }
  };

  const removeDocument = (categoryKey, documentId) => {
    setDocuments(prev => ({
      ...prev,
      [categoryKey]: prev[categoryKey].filter(doc => doc.id !== documentId)
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalDocuments = () => {
    return Object.values(documents).reduce((total, category) => total + category.length, 0);
  };

  // ==================== REAL PDF GENERATION FUNCTIONS - CORREGIDAS ====================

  // Function to load image from URL
  const loadImageFromUrl = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to load image: ${response.status}`);
      return await response.arrayBuffer();
    } catch (error) {
      console.warn(`Could not load image from ${url}:`, error);
      return null;
    }
  };

  // Function to convert File to ArrayBuffer
  const fileToArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  // COVER PAGE CORREGIDA - CON VALIDACIONES PARA PREVENIR UNDEFINED
  const createCoverPage = async (pdfDoc, projectInfo) => {
    const page = pdfDoc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    
    try {
      // Add background image - FULL COVERAGE
      const backgroundImageBytes = await loadImageFromUrl('/images/backgrounds/solar-background1.jpeg');
      if (backgroundImageBytes) {
        const backgroundImage = await pdfDoc.embedJpg(backgroundImageBytes);
        page.drawImage(backgroundImage, {
          x: 0,
          y: 0,
          width: width,
          height: height,
        });
      } else {
        // Fallback: solid color background
        page.drawRectangle({
          x: 0,
          y: 0,
          width: width,
          height: height,
          color: rgb(0.02, 0.37, 0.51) // Valmont Solar blue
        });
      }
    } catch (error) {
      console.warn('Could not add background image, using solid color:', error);
      page.drawRectangle({
        x: 0,
        y: 0,
        width: width,
        height: height,
        color: rgb(0.02, 0.37, 0.51)
      });
    }

    // LOGO PEQUEÑO Y BIEN POSICIONADO
    try {
      const logoBytes = await loadImageFromUrl('/images/logo2.png');
      if (logoBytes) {
        const logo = await pdfDoc.embedPng(logoBytes);
        const logoScale = 0.05;
        const logoWidth = logo.width * logoScale;
        const logoHeight = logo.height * logoScale;
        
        page.drawImage(logo, {
          x: width - logoWidth - 40,
          y: height - logoHeight - 40,
          width: logoWidth,
          height: logoHeight,
        });
      }
    } catch (error) {
      console.warn('Could not add logo:', error);
    }

    // DISEÑO LIMPIO - Solo texto elegante sin cuadros
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Main title - CENTRADO ELEGANTE
    const titleText = 'QUALITY CONTROL BOOK';
    const titleWidth = titleFont.widthOfTextAtSize(titleText, 42);
    page.drawText(titleText, {
      x: (width - titleWidth) / 2,
      y: height - 180,
      size: 42,
      font: titleFont,
      color: rgb(1, 1, 1), // White
    });

    // Subtítulo elegante
    const subtitleText = 'Component Traceability & Quality Control';
    const subtitleWidth = regularFont.widthOfTextAtSize(subtitleText, 16);
    page.drawText(subtitleText, {
      x: (width - subtitleWidth) / 2,
      y: height - 220,
      size: 16,
      font: regularFont,
      color: rgb(1, 1, 0.8), // Light yellow
    });

    // Project info - TEXTO NARANJA Y NEGRITA CON VALIDACIÓN
    if (projectInfo.projectName) {
      const projectText = `PROJECT: ${projectInfo.projectName}`;
      const projectWidth = titleFont.widthOfTextAtSize(projectText, 20);
      page.drawText(projectText, {
        x: (width - projectWidth) / 2,
        y: height - 250,
        size: 20,
        font: titleFont,
        color: rgb(1, 1, 0.8),
      });
    }

    if (projectInfo.clientName) {
      const clientText = `CLIENT: ${projectInfo.clientName}`;
      const clientWidth = titleFont.widthOfTextAtSize(clientText, 20);
      page.drawText(clientText, {
        x: (width - clientWidth) / 2,
        y: height - 280,
        size: 20,
        font: titleFont,
        color: rgb(1, 1, 0.8),
      });
    }

    return page;
  };

  // Document info page con fechas corregidas Y VALIDACIONES
  const createDocumentInfoPage = async (pdfDoc, projectInfo) => {
    const page = pdfDoc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Header with Valmont Solar branding
    page.drawRectangle({
      x: 0,
      y: height - 100,
      width: width,
      height: 100,
      color: rgb(0.02, 0.37, 0.51) // Valmont blue
    });

    page.drawText('DOCUMENT INFORMATION', {
      x: 50,
      y: height - 60,
      size: 24,
      font: titleFont,
      color: rgb(1, 1, 1),
    });

    let yPosition = height - 150;

    // Table headers
    page.drawRectangle({
      x: 50,
      y: yPosition - 30,
      width: 200,
      height: 30,
      color: rgb(0.9, 0.9, 0.9)
    });

    page.drawRectangle({
      x: 350,
      y: yPosition - 30,
      width: 200,
      height: 30,
      color: rgb(0.9, 0.9, 0.9)
    });

    page.drawText('FILLED BY:', {
      x: 60,
      y: yPosition - 20,
      size: 12,
      font: titleFont,
      color: rgb(0, 0, 0),
    });

    page.drawText('APPROVED BY:', {
      x: 360,
      y: yPosition - 20,
      size: 12,
      font: titleFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 50;

    // Filled by info con fechas corregidas Y VALIDACIONES
    const createdByText = (projectInfo.createdBy && projectInfo.createdBy.toString().trim() !== '') 
      ? projectInfo.createdBy.toString() 
      : 'Not specified';
    
    const approvedByText = (projectInfo.approvedBy && projectInfo.approvedBy.toString().trim() !== '') 
      ? projectInfo.approvedBy.toString() 
      : 'Not specified';

    page.drawText(`NAME: ${createdByText}`, {
      x: 60,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(`NAME: ${approvedByText}`, {
      x: 360,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 20;

    // FECHAS CORREGIDAS CON VALIDACIÓN - Formato DD/MM/YYYY
    const createdDate = (projectInfo.createdDate && projectInfo.createdDate.toString().trim() !== '') 
      ? formatDateDDMMYYYY(projectInfo.createdDate.toString()) 
      : formatDateDDMMYYYY(new Date().toISOString().split('T')[0]);
    
    const approvedDate = (projectInfo.approvedDate && projectInfo.approvedDate.toString().trim() !== '') 
      ? formatDateDDMMYYYY(projectInfo.approvedDate.toString()) 
      : 'Pending';

    page.drawText(`DATE: ${createdDate}`, {
      x: 60,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(`DATE: ${approvedDate}`, {
      x: 360,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    // Revisions table
    yPosition -= 80;
    
    page.drawText('REVISIONS', {
      x: 50,
      y: yPosition,
      size: 16,
      font: titleFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 40;

    // Revisions table header
    const tableHeaders = ['No.', 'DATE', 'PAG./SEC.', 'NOTES'];
    const columnWidths = [50, 100, 100, 200];
    let xPos = 50;

    page.drawRectangle({
      x: 50,
      y: yPosition - 20,
      width: 450,
      height: 20,
      color: rgb(0.8, 0.8, 0.8)
    });

    tableHeaders.forEach((header, index) => {
      page.drawText(header, {
        x: xPos + 5,
        y: yPosition - 15,
        size: 10,
        font: titleFont,
        color: rgb(0, 0, 0),
      });
      xPos += columnWidths[index];
    });

    // First revision row
    yPosition -= 20;
    xPos = 50;

    page.drawRectangle({
      x: 50,
      y: yPosition - 20,
      width: 450,
      height: 20,
      color: rgb(0.95, 0.95, 0.95)
    });

    const revisionDate = (projectInfo.createdDate && projectInfo.createdDate.toString().trim() !== '') 
      ? formatDateDDMMYYYY(projectInfo.createdDate.toString()) 
      : formatDateDDMMYYYY(new Date().toISOString().split('T')[0]);

    const revisionData = ['00', revisionDate, '', ''];
    revisionData.forEach((data, index) => {
      page.drawText(data.toString(), {
        x: xPos + 5,
        y: yPosition - 15,
        size: 10,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      xPos += columnWidths[index];
    });

    return page;
  };

  // FUNCIÓN NUEVA: Crear Attestato di Conformità
const createAttestatoConformita = async (pdfDoc, projectInfo) => {
  const page = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();
  
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Valmont Blue color
  const valmontBlue = rgb(0.0, 0.235, 0.514); // #003d7a

  // Logo VALMONT en la esquina superior izquierda
  page.drawRectangle({
    x: 40,
    y: height - 80,
    width: 140,
    height: 35,
    color: valmontBlue
  });

  page.drawText('VALMONT', {
    x: 55,
    y: height - 65,
    size: 20,
    font: titleFont,
    color: rgb(1, 1, 1),
    letterSpacing: 2
  });

  // Línea horizontal decorativa debajo del logo
  page.drawRectangle({
    x: 40,
    y: height - 85,
    width: width - 80,
    height: 3,
    color: valmontBlue
  });

  // Título centrado: ATTESTATO DI CONFORMITÀ
  const titleText = 'ATTESTATO DI CONFORMITÀ';
  const titleWidth = titleFont.widthOfTextAtSize(titleText, 24);
  page.drawText(titleText, {
    x: (width - titleWidth) / 2,
    y: height - 130,
    size: 24,
    font: titleFont,
    color: valmontBlue
  });

  // Rectángulo de información del proyecto
  const infoBoxY = height - 220;
  const infoBoxHeight = 120;
  
  // Fondo gris claro para el recuadro
  page.drawRectangle({
    x: 40,
    y: infoBoxY - infoBoxHeight,
    width: width - 80,
    height: infoBoxHeight,
    color: rgb(0.97, 0.97, 0.98),
    borderColor: valmontBlue,
    borderWidth: 0
  });

  // Línea izquierda del recuadro (borde azul)
  page.drawRectangle({
    x: 40,
    y: infoBoxY - infoBoxHeight,
    width: 5,
    height: infoBoxHeight,
    color: valmontBlue
  });

  // Información del proyecto
  let currentY = infoBoxY - 30;
  const labelX = 60;
  const valueX = 180;
  const lineSpacing = 30;

  // PROGETTO
  page.drawText('PROGETTO:', {
    x: labelX,
    y: currentY,
    size: 12,
    font: titleFont,
    color: valmontBlue
  });
  page.drawText(projectInfo.projectName || '[NOME DEL PROGETTO]', {
    x: valueX,
    y: currentY,
    size: 12,
    font: regularFont,
    color: rgb(0.2, 0.2, 0.2)
  });

  currentY -= lineSpacing;

  // CLIENTE
  page.drawText('CLIENTE:', {
    x: labelX,
    y: currentY,
    size: 12,
    font: titleFont,
    color: valmontBlue
  });
  page.drawText(projectInfo.clientName || '[NOME DEL CLIENTE]', {
    x: valueX,
    y: currentY,
    size: 12,
    font: regularFont,
    color: rgb(0.2, 0.2, 0.2)
  });

  currentY -= lineSpacing;

  // DATA (usando approvedDate en formato DD/MM/YYYY)
  page.drawText('DATA:', {
    x: labelX,
    y: currentY,
    size: 12,
    font: titleFont,
    color: valmontBlue
  });
  
  const formattedDate = projectInfo.approvedDate 
    ? formatDateDDMMYYYY(projectInfo.approvedDate.toString())
    : formatDateDDMMYYYY(new Date().toISOString().split('T')[0]);
  
  page.drawText(formattedDate, {
    x: valueX,
    y: currentY,
    size: 12,
    font: regularFont,
    color: rgb(0.2, 0.2, 0.2)
  });

  // Texto del attestato (contenido principal)
  currentY = infoBoxY - infoBoxHeight - 60;
  const textMargin = 60;
  const textWidth = width - (textMargin * 2);
  const textSize = 11;
  const textLineHeight = 18;

  // Párrafo 1
  const paragraph1 = "Con la presente si attesta che il materiale inviato in campo per il progetto sopra indicato è conforme alle specifiche, ai disegni e alla documentazione tecnica corrispondenti allo stesso.";
  
  const lines1 = wrapText(paragraph1, regularFont, textSize, textWidth);
  lines1.forEach((line, index) => {
    page.drawText(line, {
      x: textMargin,
      y: currentY - (index * textLineHeight),
      size: textSize,
      font: regularFont,
      color: rgb(0.27, 0.27, 0.27)
    });
  });

  currentY -= (lines1.length * textLineHeight) + 25;

  // Párrafo 2
  const paragraph2 = "Il materiale è stato verificato secondo gli standard di qualità stabiliti e corrisponde a quanto progettato per l'installazione dell'impianto.";
  
  const lines2 = wrapText(paragraph2, regularFont, textSize, textWidth);
  lines2.forEach((line, index) => {
    page.drawText(line, {
      x: textMargin,
      y: currentY - (index * textLineHeight),
      size: textSize,
      font: regularFont,
      color: rgb(0.27, 0.27, 0.27)
    });
  });

  return page;
};

// Función auxiliar para dividir texto en líneas
const wrapText = (text, font, fontSize, maxWidth) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

  // MEJORA #3: FUNCIÓN DE INDEX CORREGIDA CON VALIDACIONES Y ESTRUCTURA DEL PDF
  const createIndexPage = async (pdfDoc, realStructure) => {
    const page = pdfDoc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Header
    page.drawRectangle({
      x: 0,
      y: height - 100,
      width: width,
      height: 100,
      color: rgb(0.02, 0.37, 0.51) // Valmont blue
    });

    page.drawText('INDEX', {
      x: 50,
      y: height - 60,
      size: 24,
      font: titleFont,
      color: rgb(1, 1, 1),
    });

    let yPosition = height - 150;

    // TRADITIONAL INDEX - USAR LA ESTRUCTURA REAL CON PÁGINAS CORRECTAS - SOLO SECCIONES CON DOCUMENTOS Y VALIDADAS
    if (realStructure && realStructure.sections && Array.isArray(realStructure.sections)) {
      realStructure.sections.forEach((section) => {
        if (section && section.documentCount > 0) {
          // VALIDAR DATOS DE LA SECCIÓN
          const sectionTitle = (section.title && section.title.toString().trim() !== '') 
            ? section.title.toString().trim() 
            : 'UNNAMED SECTION';
          
          const startPage = section.realStartPage || 1;
          const endPage = section.realEndPage || startPage;
          
          // CORREGIDO: Mostrar rango correcto de páginas
          const pageRange = (section.documentCount === 1 || startPage === endPage) ? 
            `${startPage}` : 
            `${startPage} - ${endPage}`;

          page.drawText(sectionTitle, {
            x: 50,
            y: yPosition,
            size: 12,
            font: regularFont,
            color: rgb(0, 0, 0),
          });

          page.drawText(pageRange, {
            x: 450,
            y: yPosition,
            size: 12,
            font: regularFont,
            color: rgb(0, 0, 0),
          });

          // Draw dotted line
          for (let x = 300; x < 440; x += 10) {
            page.drawText('.', {
              x: x,
              y: yPosition,
              size: 12,
              font: regularFont,
              color: rgb(0.5, 0.5, 0.5),
            });
          }

          yPosition -= 30;
        }
      });
    }

    // MEJORA #3: ADD PDF STRUCTURE SECTION
    yPosition -= 50; // Add more space before PDF structure

    // PDF Structure Header
    page.drawText('PDF STRUCTURE DETAIL', {
      x: 50,
      y: yPosition,
      size: 16,
      font: titleFont,
      color: rgb(0.02, 0.37, 0.51), // Valmont blue
    });

    yPosition -= 30;

    // Add base pages
    const structureItems = [
      'Page 1: Professional Cover Page',
      'Page 2: Document Information',
      'Page 3: Index with Page References'
    ];

    // Add sections from real structure
    if (realStructure && realStructure.sections) {
      realStructure.sections.forEach((section) => {
        if (section && section.documentCount > 0) {
          const sectionTitle = section.title || 'UNNAMED SECTION';
          
          // Add separator page
          structureItems.push(`Page ${section.separatorPage}: ${sectionTitle} (Separator)`);
          
          // Add document pages
          const pageRange = section.realStartPage === section.realEndPage 
            ? `${section.realStartPage}` 
            : `${section.realStartPage}-${section.realEndPage}`;
          
          structureItems.push(`Pages ${pageRange}: Documents (${section.documentCount} files - ${section.realTotalPages} pages)`);
        }
      });
    }

    // Draw structure items
    structureItems.forEach((item, index) => {
      if (yPosition < 100) return; // Stop if we're running out of space
      
      // Use different formatting for different types of items
      const isPageItem = item.includes('Page ') && !item.includes('Pages ');
      const isDocumentItem = item.includes('Documents (');
      
      let fontSize = 10;
      let font = regularFont;
      let color = rgb(0, 0, 0);
      let xOffset = 50;

      if (isPageItem) {
        font = titleFont;
        fontSize = 10;
        color = rgb(0.02, 0.37, 0.51); // Valmont blue for page items
      } else if (isDocumentItem) {
        fontSize = 9;
        color = rgb(0.4, 0.4, 0.4); // Gray for document items
        xOffset = 70; // Indent document items
      }

      page.drawText(item, {
        x: xOffset,
        y: yPosition,
        size: fontSize,
        font: font,
        color: color,
      });

      yPosition -= 18;
    });

    // Add total pages at the bottom
    if (yPosition > 120 && realStructure) {
      yPosition -= 20;
      page.drawText(`Total Pages: ${realStructure.totalRealPages}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: titleFont,
        color: rgb(0.02, 0.37, 0.51), // Valmont blue
      });
    }

    return page;
  };

  // Create section separator page - CON VALIDACIONES Y TEXTO LARGO CORREGIDO
  const createSectionSeparator = async (pdfDoc, sectionTitle) => {
    const page = pdfDoc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Full page background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: height,
      color: rgb(0.02, 0.37, 0.51) // Valmont blue
    });

    // VALIDAR TÍTULO ANTES DE PROCESAR
    const validTitle = (sectionTitle && sectionTitle.toString().trim() !== '') 
      ? sectionTitle.toString().trim() 
      : 'UNNAMED SECTION';

    // FUNCIÓN PARA DIVIDIR TEXTO LARGO EN MÚLTIPLES LÍNEAS
    const splitTextToFitWidth = (text, font, fontSize, maxWidth) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Si una sola palabra es muy larga, la añadimos como línea individual
            lines.push(word);
          }
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }
      
      return lines;
    };

    // CONFIGURACIÓN PARA TEXTO RESPONSIVO
    const maxTextWidth = width - 100; // Margen de 50px por cada lado
    const fontSize = 24;
    const lineHeight = fontSize + 10; // Espacio entre líneas

    // Dividir el título en líneas que quepan en la página
    const textLines = splitTextToFitWidth(validTitle, titleFont, fontSize, maxTextWidth);
    
    // Calcular posición Y inicial para centrar verticalmente todo el bloque de texto
    const totalTextHeight = (textLines.length - 1) * lineHeight;
    const startY = (height / 2) + (totalTextHeight / 2);

    // Dibujar cada línea centrada
    textLines.forEach((line, index) => {
      const lineWidth = titleFont.widthOfTextAtSize(line, fontSize);
      const x = (width - lineWidth) / 2; // Centrar horizontalmente cada línea
      const y = startY - (index * lineHeight); // Posición vertical de cada línea
      
      page.drawText(line, {
        x: x,
        y: y,
        size: fontSize,
        font: titleFont,
        color: rgb(1, 1, 1),
      });
    });

    return page;
  };

  // Add document to PDF - RETORNA PÁGINAS REALES
  const addDocumentToPdf = async (pdfDoc, documentFile) => {
    try {
      const arrayBuffer = await fileToArrayBuffer(documentFile.file);
      
      if (documentFile.type === 'application/pdf') {
        // Handle PDF files - CONTAR PÁGINAS REALES
        const existingPdf = await PDFDocument.load(arrayBuffer);
        const pageCount = existingPdf.getPageCount();
        const pages = await pdfDoc.copyPages(existingPdf, existingPdf.getPageIndices());
        pages.forEach((page) => pdfDoc.addPage(page));
        return pageCount; // RETORNA PÁGINAS REALES
      } else if (documentFile.type.startsWith('image/')) {
        // Handle image files
        const page = pdfDoc.addPage(PageSizes.A4);
        const { width, height } = page.getSize();
        
        let image;
        if (documentFile.type.includes('png')) {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else {
          image = await pdfDoc.embedJpg(arrayBuffer);
        }
        
        // Scale image to fit page while maintaining aspect ratio
        const imageAspectRatio = image.width / image.height;
        const pageAspectRatio = width / height;
        
        let imageWidth, imageHeight;
        if (imageAspectRatio > pageAspectRatio) {
          imageWidth = width - 100;
          imageHeight = imageWidth / imageAspectRatio;
        } else {
          imageHeight = height - 100;
          imageWidth = imageHeight * imageAspectRatio;
        }
        
        page.drawImage(image, {
          x: (width - imageWidth) / 2,
          y: (height - imageHeight) / 2,
          width: imageWidth,
          height: imageHeight,
        });
        
        return 1;
      } else {
        // For other file types, create a placeholder page
        const page = pdfDoc.addPage(PageSizes.A4);
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        
        page.drawText(`Document: ${documentFile.name}`, {
          x: 50,
          y: height - 100,
          size: 16,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        page.drawText(`Type: ${documentFile.type}`, {
          x: 50,
          y: height - 130,
          size: 12,
          font: font,
          color: rgb(0.5, 0.5, 0.5),
        });
        
        page.drawText(`Size: ${formatFileSize(documentFile.size)}`, {
          x: 50,
          y: height - 150,
          size: 12,
          font: font,
          color: rgb(0.5, 0.5, 0.5),
        });
        
        page.drawText('Note: This file type cannot be directly embedded.', {
          x: 50,
          y: height - 200,
          size: 12,
          font: font,
          color: rgb(0.7, 0, 0),
        });
        
        return 1;
      }
    } catch (error) {
      console.error('Error adding document:', error);
      
      // Create error page
      const page = pdfDoc.addPage(PageSizes.A4);
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      page.drawText(`Error loading: ${documentFile.name}`, {
        x: 50,
        y: height - 100,
        size: 16,
        font: font,
        color: rgb(0.8, 0, 0),
      });
      
      page.drawText(error.message, {
        x: 50,
        y: height - 130,
        size: 12,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      return 1;
    }
  };

  // FUNCIÓN PARA PREVIEW PRECISA CON VALIDACIONES - Cuenta páginas reales como el PDF final
  const generateRealPreviewStructure = async () => {
    if (!isReadyToGenerate()) return null;
    
    try {
      const structure = {
        sections: [],
        totalRealPages: 0
      };

      let currentRealPage = 5;  // Cover + Doc Info + Attestato + INDEX + primera sección

      // FILTRAR SOLO SECCIONES CON DOCUMENTOS Y VALIDAR (INCLUYE LAS NUEVAS CATEGORÍAS)
      const activeSections = documentCategories.filter(cat => 
        cat && cat.key && documents[cat.key] && documents[cat.key].length > 0
      );

      for (const category of activeSections) {
        const sectionDocs = documents[category.key];
        if (sectionDocs && sectionDocs.length > 0) {
          console.log(`Preview counting: ${category.title || 'Unknown section'} with ${sectionDocs.length} documents`);
          
          const sectionSeparatorPage = currentRealPage;
          currentRealPage += 1;

          const sectionStartPage = currentRealPage;
          let sectionTotalPages = 0;

          // Contar páginas reales de cada documento CON VALIDACIONES
          for (const doc of sectionDocs) {
            if (doc && doc.file) {
              if (doc.type === 'application/pdf') {
                // Para PDFs, estimamos o leemos las páginas reales si es posible
                try {
                  const arrayBuffer = await fileToArrayBuffer(doc.file);
                  const existingPdf = await PDFDocument.load(arrayBuffer);
                  const realPageCount = existingPdf.getPageCount();
                  sectionTotalPages += realPageCount;
                  console.log(`Preview: ${doc.name || 'Unknown PDF'} has ${realPageCount} real pages`);
                } catch (error) {
                  console.warn(`Could not count pages in ${doc.name || 'Unknown file'}, estimating 1 page`, error);
                  sectionTotalPages += 1; // Fallback a 1 página
                }
              } else {
                sectionTotalPages += 1; // Imágenes y otros = 1 página
              }
            } else {
              console.warn('Invalid document found, skipping');
            }
          }

          const sectionEndPage = currentRealPage + sectionTotalPages - 1;
          currentRealPage += sectionTotalPages;

          structure.sections.push({
            title: category.title || 'UNNAMED SECTION',
            separatorPage: sectionSeparatorPage,
            realStartPage: sectionStartPage,
            realEndPage: sectionEndPage,
            documentCount: sectionDocs.length,
            realTotalPages: sectionTotalPages
          });

          console.log(`Preview: Section ${category.title || 'Unknown'}: pages ${sectionStartPage}-${sectionEndPage} (${sectionTotalPages} pages)`);
        }
      }

      structure.totalRealPages = currentRealPage - 1;
      return structure;
    } catch (error) {
      console.error('Error generating preview structure:', error);
      return null;
    }
  };

  // MAIN PDF GENERATION FUNCTION - CON VALIDACIONES PARA PREVENIR ERRORES
  const generateRealQualityBook = async () => {
    // VALIDACIONES MEJORADAS
    if (!projectInfo.projectName || projectInfo.projectName.trim() === '') {
      alert('Please enter a valid project name');
      return;
    }

    if (!projectInfo.clientName || projectInfo.clientName.trim() === '') {
      alert('Please enter a valid client name');
      return;
    }

    if (getTotalDocuments() === 0) {
      alert('Please upload at least one document');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create new PDF document
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      
      console.log('Starting PDF generation...');

      // VALIDAR DATOS ANTES DE USAR
      const validatedProjectInfo = {
        projectName: projectInfo.projectName || 'Unnamed Project',
        clientName: projectInfo.clientName || 'Unnamed Client',
        createdBy: projectInfo.createdBy || 'Not specified',
        approvedBy: projectInfo.approvedBy || 'Not specified',
        createdDate: projectInfo.createdDate || new Date().toISOString().split('T')[0],
        approvedDate: projectInfo.approvedDate || ''
      };

      // 1. Create cover page - DISEÑO LIMPIO
      await createCoverPage(pdfDoc, validatedProjectInfo);
      console.log('✓ Clean cover page created');

      // 2. Create document information page - CON FECHAS CORREGIDAS
     await createDocumentInfoPage(pdfDoc, validatedProjectInfo);
console.log('✓ Document info page created with DD/MM/YYYY format');

// 🆕 2.5 Create Attestato di Conformità
await createAttestatoConformita(pdfDoc, validatedProjectInfo);
console.log('✓ Attestato di Conformità created');

      // 3. PROCESAR SECCIONES PRIMERO SIN INDEX - SOLO SECCIONES CON DOCUMENTOS (INCLUYE NUEVAS CATEGORÍAS)
      const realStructure = {
        sections: [],
        totalRealPages: 0
      };

      let currentRealPage = 5; // Cover + Doc Info + INDEX (que crearemos después) + primera sección

      // FILTRAR SOLO SECCIONES CON DOCUMENTOS (INCLUYE LAS NUEVAS CATEGORÍAS)
      const activeSections = documentCategories.filter(cat => documents[cat.key].length > 0);
      console.log(`Active sections: ${activeSections.length}`);

      for (const category of activeSections) {
        const sectionDocs = documents[category.key];
        if (sectionDocs.length > 0) {
          console.log(`Processing section: ${category.title} with ${sectionDocs.length} documents`);
          
          // VALIDAR TÍTULO DE SECCIÓN
          const sectionTitle = category.title || 'UNNAMED SECTION';
          
          // Add section separator
          await createSectionSeparator(pdfDoc, sectionTitle);
          const sectionSeparatorPage = currentRealPage;
          currentRealPage += 1;

          // Track real pages for this section
          const sectionStartPage = currentRealPage;
          let sectionTotalPages = 0;

          // Add documents and count real pages
          for (const doc of sectionDocs) {
            const pagesAdded = await addDocumentToPdf(pdfDoc, doc);
            sectionTotalPages += pagesAdded;
            console.log(`✓ Added document: ${doc.name} (${pagesAdded} real pages)`);
          }

          const sectionEndPage = currentRealPage + sectionTotalPages - 1;
          currentRealPage += sectionTotalPages;

          // Store real structure CON VALIDACIÓN
          realStructure.sections.push({
            title: sectionTitle, // USAR TÍTULO VALIDADO
            separatorPage: sectionSeparatorPage,
            realStartPage: sectionStartPage,
            realEndPage: sectionEndPage,
            documentCount: sectionDocs.length,
            realTotalPages: sectionTotalPages
          });

          console.log(`✓ Section ${sectionTitle}: pages ${sectionStartPage}-${sectionEndPage} (${sectionTotalPages} pages)`);
        }
      }

      realStructure.totalRealPages = currentRealPage - 1;

      // 4. AHORA CREAR EL INDEX UNA SOLA VEZ Y INSERTARLO EN LA POSICIÓN 3
      console.log('Creating SINGLE index with correct page numbers...');
      console.log('PDF pages before index insertion:', pdfDoc.getPageCount());
      
      const realIndexPage = await createIndexPage(pdfDoc, realStructure);
      pdfDoc.insertPage(3, realIndexPage); // Insertar en posición 2 (que será página 3: 0=pag1, 1=pag2, 2=pag3)
      
      console.log('PDF pages after index insertion:', pdfDoc.getPageCount());
      console.log('✓ SINGLE index created and inserted at page 3');

      // 5. VERIFICAR QUE NO HAY PÁGINAS EXTRA AL FINAL
      const finalPageCount = pdfDoc.getPageCount();
      console.log(`Final page count: ${finalPageCount}`);

      // 6. Generate and download PDF
      const pdfBytes = await pdfDoc.save();
      console.log(`✓ PDF generated successfully - Total pages: ${finalPageCount}`);

      // Create download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Quality_Book_${validatedProjectInfo.projectName.replace(/\s+/g, '_')}_${validatedProjectInfo.clientName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsProcessing(false);

      // Success message profesional
      const message = `Quality Book "${a.download}" generated successfully!\n\nGenerated content:\n• Professional cover page with corporate branding\n• Document information page with proper date formatting\n• Automatic index with page references\n• ${realStructure.sections.length} organized document sections\n• ${getTotalDocuments()} documents included\n• ${finalPageCount} total pages\n\nPDF downloaded successfully!`;
      alert(message);

    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsProcessing(false);
      
      let errorMessage = 'Error generating Quality Book: ';
      if (error.message.includes('text') && error.message.includes('undefined')) {
        errorMessage += 'Some required text fields are empty or invalid. Please check that all project information is properly filled out.';
      } else if (error.message.includes('Failed to load')) {
        errorMessage += 'Could not load background image or logo. Check that the image files exist in the public folder.';
      } else if (error.message.includes('embed')) {
        errorMessage += 'Error processing one of the uploaded documents. Please check that all files are valid.';
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage + '\n\nCheck the console for more details.');
    }
  };

  const isReadyToGenerate = () => {
    return projectInfo.projectName && 
           projectInfo.clientName && 
           getTotalDocuments() > 0;
  };

  // FUNCIÓN TOGGLE PREVIEW CORREGIDA
  const togglePreview = async () => {
    if (!showPreview) {
      // Al mostrar preview, generar estructura real
      if (isReadyToGenerate()) {
        setPreviewLoading(true);
        try {
          const realStructure = await generateRealPreviewStructure();
          setRealPreviewStructure(realStructure);
        } catch (error) {
          console.error('Error generating preview:', error);
          alert('Error generating preview. Some documents may be corrupted.');
        }
        setPreviewLoading(false);
      }
      setShowPreview(true);
    } else {
      // Al ocultar preview
      setShowPreview(false);
      setRealPreviewStructure(null);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return <FileText size={24} color="#dc2626" />;
    if (fileType?.includes('image')) return <FileText size={24} color="#059669" />;
    return <FileText size={24} color="#3b82f6" />;
  };

return (
  <div className="quality-book-main-container">
    
      {/* Header with DARK background and transparency */}
      <div style={{
        background: 'rgba(0, 20, 40, 0.9)',
        backdropFilter: 'blur(15px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <img 
                src="/images/logo2.png" 
                alt="Valmont Solar Logo" 
                style={{ 
                  height: '60px',
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) brightness(1.1)'
                }}
              />
              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #005F83 0%, #0077a2 100%)',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(0, 95, 131, 0.4)'
              }}>
                <Book size={32} color="white" />
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 'bold', 
                  color: 'white',
                  margin: 0,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                  letterSpacing: '-0.02em'
                }}>
                  Quality Book Generator
                </h1>
                <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0, fontSize: '1.2rem', fontWeight: '500' }}>
                  Automated traceability documentation system
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #005F83 0%, #0077a2 100%)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '0.5rem'
                }}>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                    {getTotalDocuments()}
                  </p>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)', margin: 0, fontWeight: '500' }}>
                  Total Documents
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #0077a2 0%, #667eea 100%)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '0.5rem'
                }}>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                    {Object.values(documents).filter(cat => cat.length > 0).length}
                  </p>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)', margin: 0, fontWeight: '500' }}>
                  Active Categories
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Project Information Panel */}
          <div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '2.5rem',
              position: 'sticky',
              top: '2rem',
              backdropFilter: 'blur(15px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <div style={{
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #005F83 0%, #0077a2 100%)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 95, 131, 0.3)'
                }}>
                  <Building size={24} color="white" />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a202c', margin: 0 }}>
                  Project Information
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '0.75rem' 
                  }}>
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={projectInfo.projectName}
                    onChange={(e) => setProjectInfo(prev => ({...prev, projectName: e.target.value}))}
                    placeholder="Project Name?"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      transition: 'all 0.3s',
                      outline: 'none',
                      boxSizing: 'border-box',
                      background: 'rgba(248, 250, 252, 0.8)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#005F83';
                      e.target.style.boxShadow = '0 0 0 4px rgba(0, 95, 131, 0.1)';
                      e.target.style.background = 'white';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = 'rgba(248, 250, 252, 0.8)';
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '0.75rem' 
                  }}>
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={projectInfo.clientName}
                    onChange={(e) => setProjectInfo(prev => ({...prev, clientName: e.target.value}))}
                    placeholder="Client company name"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      transition: 'all 0.3s',
                      outline: 'none',
                      boxSizing: 'border-box',
                      background: 'rgba(248, 250, 252, 0.8)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#005F83';
                      e.target.style.boxShadow = '0 0 0 4px rgba(0, 95, 131, 0.1)';
                      e.target.style.background = 'white';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = 'rgba(248, 250, 252, 0.8)';
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '0.75rem' 
                    }}>
                      Created By
                    </label>
                    <input
                      type="text"
                      value={projectInfo.createdBy}
                      onChange={(e) => setProjectInfo(prev => ({...prev, createdBy: e.target.value}))}
                      placeholder="Your name"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: 'rgba(248, 250, 252, 0.8)'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '0.75rem' 
                    }}>
                      Approved By
                    </label>
                    <input
                      type="text"
                      value={projectInfo.approvedBy}
                      onChange={(e) => setProjectInfo(prev => ({...prev, approvedBy: e.target.value}))}
                      placeholder="Approver name"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: 'rgba(248, 250, 252, 0.8)'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '0.75rem' 
                    }}>
                      Creation Date (DD/MM/YYYY)
                    </label>
                    <input
                      type="date"
                      value={projectInfo.createdDate}
                      onChange={(e) => setProjectInfo(prev => ({...prev, createdDate: e.target.value}))}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: 'rgba(248, 250, 252, 0.8)'
                      }}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                      Will be displayed as: {formatDateDDMMYYYY(projectInfo.createdDate)}
                    </p>
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '0.75rem' 
                    }}>
                      Approval Date (DD/MM/YYYY)
                    </label>
                    <input
                      type="date"
                      value={projectInfo.approvedDate}
                      onChange={(e) => setProjectInfo(prev => ({...prev, approvedDate: e.target.value}))}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: 'rgba(248, 250, 252, 0.8)'
                      }}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                      Will be displayed as: {projectInfo.approvedDate ? formatDateDDMMYYYY(projectInfo.approvedDate) : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #f3f4f6' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* MEJORA #1: Clean All Documents Button (INCLUYE NUEVAS CATEGORÍAS) */}
                  <button
                    onClick={cleanAllDocuments}
                    disabled={getTotalDocuments() === 0}
                    style={{
                      width: '100%',
                      padding: '1rem 1.5rem',
                      background: getTotalDocuments() === 0 
                        ? '#9ca3af' 
                        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '1rem',
                      cursor: getTotalDocuments() === 0 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      boxShadow: getTotalDocuments() === 0 ? 'none' : '0 8px 25px rgba(239, 68, 68, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      if (getTotalDocuments() > 0) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 12px 35px rgba(239, 68, 68, 0.4)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (getTotalDocuments() > 0) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.3)';
                      }
                    }}
                  >
                    <RotateCcw size={20} />
                    <span>Clean All Documents ({getTotalDocuments()})</span>
                  </button>

                  <button
                    onClick={togglePreview}
                    disabled={previewLoading}
                    style={{
                      width: '100%',
                      padding: '1rem 1.5rem',
                      background: previewLoading 
                        ? '#9ca3af' 
                        : 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '1rem',
                      cursor: previewLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      boxShadow: previewLoading ? 'none' : '0 8px 25px rgba(139, 92, 246, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      if (!previewLoading) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 12px 35px rgba(139, 92, 246, 0.4)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!previewLoading) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.3)';
                      }
                    }}
                  >
                    {previewLoading ? (
                      <>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          border: '3px solid rgba(255, 255, 255, 0.3)',
                          borderTop: '3px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        <span>Generating Preview...</span>
                      </>
                    ) : (
                      <>
                        <Eye size={20} />
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                      </>
                    )}
                  </button>

                  <button
                    onClick={generateRealQualityBook}
                    disabled={!isReadyToGenerate() || isProcessing}
                    style={{
                      width: '100%',
                      padding: '1.25rem',
                      background: isReadyToGenerate() && !isProcessing 
                        ? 'linear-gradient(135deg, #005F83 0%, #0077a2 100%)' 
                        : '#9ca3af',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '700',
                      fontSize: '1.1rem',
                      cursor: isReadyToGenerate() && !isProcessing ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      boxShadow: isReadyToGenerate() && !isProcessing 
                        ? '0 12px 35px rgba(0, 95, 131, 0.4)' 
                        : 'none'
                    }}
                    onMouseOver={(e) => {
                      if (isReadyToGenerate() && !isProcessing) {
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = '0 16px 45px rgba(0, 95, 131, 0.5)';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = isReadyToGenerate() && !isProcessing 
                        ? '0 12px 35px rgba(0, 95, 131, 0.4)' 
                        : 'none';
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          border: '3px solid rgba(255, 255, 255, 0.3)',
                          borderTop: '3px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download size={20} />
                        <span>Generate Quality Book PDF</span>
                      </>
                    )}
                  </button>
                  
                  {!isReadyToGenerate() && (
                    <div style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '8px',
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <AlertCircle size={16} color="#f59e0b" />
                        <span style={{ fontWeight: '600', color: '#92400e' }}>Information Required</span>
                      </div>
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: '#92400e', 
                        margin: 0
                      }}>
                        Complete the project information and upload documents to generate
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Document Categories with DRAG & DROP - INCLUYE LAS 2 NUEVAS CATEGORÍAS */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {documentCategories.map((category) => (
                <div 
                  key={category.key} 
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)',
                    border: `2px solid ${dragOverCategory === category.key ? category.sectionColor : 'rgba(255, 255, 255, 0.2)'}`,
                    overflow: 'hidden',
                    backdropFilter: 'blur(15px)',
                    transition: 'all 0.3s ease',
                    transform: dragOverCategory === category.key ? 'scale(1.02)' : 'scale(1)'
                  }}
                  onMouseOver={(e) => {
                    if (dragOverCategory !== category.key) {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 25px 60px rgba(0, 0, 0, 0.15)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (dragOverCategory !== category.key) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  // DRAG & DROP events
                  onDragOver={(e) => handleDragOver(e, category.key)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, category.key)}
                >
                  <div style={{
                    background: `linear-gradient(135deg, ${category.sectionColor} 0%, ${category.sectionColor}dd 100%)`,
                    padding: '2rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                          padding: '1rem',
                          background: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                        }}>
                          {React.cloneElement(category.icon, { size: 24, color: 'white' })}
                        </div>
                        <div>
                          <h3 style={{ 
                            fontSize: '1.25rem', 
                            fontWeight: 'bold', 
                            color: 'white', 
                            margin: 0,
                            letterSpacing: '0.5px'
                          }}>
                            {category.title}
                          </h3>
                          <p style={{ 
                            fontSize: '1rem', 
                            color: 'rgba(255, 255, 255, 0.9)', 
                            margin: 0,
                            marginTop: '0.25rem'
                          }}>
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          padding: '0.75rem 1.25rem',
                          background: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '25px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'white',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}>
                          {documents[category.key].length} files
                        </div>
                        <button
                          onClick={() => handleFileUpload(category.key)}
                          style={{
                            padding: '1rem 1.5rem',
                            background: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '12px',
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          <Plus size={18} />
                          <span>Upload Files</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '2rem' }}>
                    {documents[category.key].length === 0 ? (
                      <div 
                        style={{ 
                          textAlign: 'center', 
                          padding: '4rem 2rem',
                          border: dragOverCategory === category.key ? `2px dashed ${category.sectionColor}` : '2px dashed transparent',
                          borderRadius: '12px',
                          background: dragOverCategory === category.key ? `${category.sectionColor}10` : 'transparent',
                          transition: 'all 0.3s'
                        }}
                      >
                        <div style={{
                          width: '80px',
                          height: '80px',
                          background: dragOverCategory === category.key 
                            ? `linear-gradient(135deg, ${category.sectionColor}20 0%, ${category.sectionColor}30 100%)`
                            : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                          borderRadius: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 2rem'
                        }}>
                          <Upload size={40} color={dragOverCategory === category.key ? category.sectionColor : "#9ca3af"} />
                        </div>
                        <p style={{ 
                          color: dragOverCategory === category.key ? category.sectionColor : '#6b7280', 
                          fontSize: '1.25rem', 
                          margin: '0 0 0.75rem 0', 
                          fontWeight: '600' 
                        }}>
                          {dragOverCategory === category.key ? 'Drop files here' : 'No documents uploaded'}
                        </p>
                        <p style={{ color: '#9ca3af', fontSize: '1rem', margin: 0 }}>
                          Click "Upload Files" or drag & drop documents to this area
                        </p>
                      </div>
                    ) : (
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: documents[category.key].length === 1 ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))', 
                        gap: '1.5rem' 
                      }}>
                        {documents[category.key].map((doc) => (
                          <div key={doc.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1.5rem',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            border: '2px solid #e2e8f0',
                            transition: 'all 0.3s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f1f5f9';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                            e.currentTarget.style.borderColor = category.sectionColor;
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                              {getFileIcon(doc.type)}
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <p style={{ 
                                  fontSize: '1rem', 
                                  fontWeight: '600', 
                                  color: '#1f2937', 
                                  margin: 0,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {doc.name}
                                </p>
                                <p style={{ 
                                  fontSize: '0.875rem', 
                                  color: '#6b7280', 
                                  margin: 0,
                                  marginTop: '0.25rem'
                                }}>
                                  {formatFileSize(doc.size)} • {doc.uploadDate}
                                </p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem' }}>
                              <button 
                                style={{
                                  padding: '0.75rem',
                                  background: 'none',
                                  border: 'none',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  color: '#3b82f6',
                                  transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.background = '#dbeafe'}
                                onMouseOut={(e) => e.target.style.background = 'none'}
                              >
                                <Eye size={18} />
                              </button>
                              <button 
                                onClick={() => removeDocument(category.key, doc.id)}
                                style={{
                                  padding: '0.75rem',
                                  background: 'none',
                                  border: 'none',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  color: '#ef4444',
                                  transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.background = '#fef2f2'}
                                onMouseOut={(e) => e.target.style.background = 'none'}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Section - CORREGIDA CON ESTIMACIÓN (INCLUYE NUEVAS CATEGORÍAS) */}
        {showPreview && (
          <div style={{
            marginTop: '4rem',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '3rem',
            backdropFilter: 'blur(15px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                borderRadius: '16px',
                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
              }}>
                <Eye size={24} color="white" />
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a202c', margin: 0 }}>
                Quality Book Preview
              </h2>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: '16px',
              padding: '3rem',
              border: '2px solid #e2e8f0'
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '2.5rem',
                marginBottom: '3rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #005F83 0%, #0077a2 100%)',
                    borderRadius: '16px',
                    padding: '2rem',
                    marginBottom: '1.5rem',
                    boxShadow: '0 12px 35px rgba(0, 95, 131, 0.3)'
                  }}>
                    <Book size={40} color="white" style={{ margin: '0 auto' }} />
                  </div>
                  <h3 style={{ fontWeight: 'bold', color: '#1f2937', margin: '0 0 1rem 0', fontSize: '1.25rem' }}>
                    Professional Cover
                  </h3>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Background image:</strong> Professional solar theme
                    </p>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Valmont Logo:</strong> Corporate branding
                    </p>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      <strong>Project info:</strong> {projectInfo.projectName || 'Not set'}
                    </p>
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    borderRadius: '16px',
                    padding: '2rem',
                    marginBottom: '1.5rem',
                    boxShadow: '0 12px 35px rgba(139, 92, 246, 0.3)'
                  }}>
                    <Calendar size={40} color="white" style={{ margin: '0 auto' }} />
                  </div>
                  <h3 style={{ fontWeight: 'bold', color: '#1f2937', margin: '0 0 1rem 0', fontSize: '1.25rem' }}>
                    Date Management
                  </h3>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Format:</strong> DD/MM/YYYY standard
                    </p>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Consistency:</strong> European date format
                    </p>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      <strong>Application:</strong> All document sections
                    </p>
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '16px',
                    padding: '2rem',
                    marginBottom: '1.5rem',
                    boxShadow: '0 12px 35px rgba(245, 158, 11, 0.3)'
                  }}>
                    <FileCheck size={40} color="white" style={{ margin: '0 auto' }} />
                  </div>
                  <h3 style={{ fontWeight: 'bold', color: '#1f2937', margin: '0 0 1rem 0', fontSize: '1.25rem' }}>
                    Document Processing
                  </h3>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>PDF integration:</strong> Seamless merging
                    </p>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Page counting:</strong> Accurate calculation
                    </p>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      <strong>Index generation:</strong> Automatic referencing
                    </p>
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '16px',
                    padding: '2rem',
                    marginBottom: '1.5rem',
                    boxShadow: '0 12px 35px rgba(16, 185, 129, 0.3)'
                  }}>
                    <Settings size={40} color="white" style={{ margin: '0 auto' }} />
                  </div>
                  <h3 style={{ fontWeight: 'bold', color: '#1f2937', margin: '0 0 1rem 0', fontSize: '1.25rem' }}>
                    Automation Features
                  </h3>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Auto-indexing:</strong> Real-time page references
                    </p>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Section management:</strong> Professional dividers
                    </p>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      <strong>Quality control:</strong> Standardized layout
                    </p>
                  </div>
                </div>
              </div>

              {/* REAL Structure Preview con REAL PDF info (INCLUYE NUEVAS CATEGORÍAS) */}
              {showPreview && isReadyToGenerate() && (
                <div style={{ 
                  padding: '2rem', 
                  background: 'white', 
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.05)'
                }}>
                  <h4 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#1f2937', 
                    marginBottom: '2rem',
                    borderBottom: '2px solid #f3f4f6',
                    paddingBottom: '1rem'
                  }}>
                    📊 PDF Structure Preview:
                  </h4>

                  {previewLoading ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '3rem',
                      color: '#6b7280'
                    }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #f3f4f6',
                        borderTop: '4px solid #8b5cf6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 2rem'
                      }}></div>
                      <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                        Analyzing your documents...
                      </p>
                      <p style={{ fontSize: '1rem' }}>
                        Please wait while we calculate the document structure
                      </p>
                    </div>
                  ) : realPreviewStructure ? (
                    <div style={{ 
                      fontFamily: 'Monaco, Menlo, monospace', 
                      fontSize: '1rem', 
                      color: '#374151',
                      lineHeight: '1.8'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ color: '#10b981', fontWeight: 'bold' }}>📄 Page 1:</span>
                          <span>Professional Cover Page</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ color: '#10b981', fontWeight: 'bold' }}>📄 Page 2:</span>
                          <span>Document Information</span>
                        </div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
    <span style={{ color: '#10b981', fontWeight: 'bold' }}>📄 Page 3:</span>
    <span>Attestato di Conformità</span>
    </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                          <span style={{ color: '#10b981', fontWeight: 'bold' }}>📄 Page 4:</span>
                          <span>Index with Page References</span>
                        </div>
                        {realPreviewStructure.sections.map((section, index) => (
                          <div key={index} style={{ marginLeft: '1rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>📄 Page {section.separatorPage}:</span>
                              <span style={{ fontWeight: '600' }}>{section.title} (Separator)</span>
                            </div>
                            <div style={{ marginLeft: '2rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#6b7280', fontWeight: 'bold' }}>
                                  📄 Pages {section.realStartPage}{section.realStartPage !== section.realEndPage ? `-${section.realEndPage}` : ''}:
                                </span>
                                <span>Documents ({section.documentCount} files - {section.realTotalPages} pages)</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div style={{ 
                          marginTop: '2rem', 
                          padding: '1rem',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          color: 'white'
                        }}>
                          🎉 Total Pages: {realPreviewStructure.totalRealPages}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '2rem',
                      color: '#6b7280'
                    }}>
                      <p>Complete project information and upload documents to see the real preview.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Back Button */}
      {onBackClick && <BackButton onClick={onBackClick} />}

      {/* CSS for animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 1024px) {
            .main-grid { grid-template-columns: 1fr !important; }
          }
        `}
      </style>
    </div>
  );
};

export default QualityBookGenerator;