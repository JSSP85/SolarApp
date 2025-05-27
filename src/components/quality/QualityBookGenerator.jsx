// src/components/quality/QualityBookGenerator.jsx
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
  Settings
} from 'lucide-react';

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

  const [documents, setDocuments] = useState({
    transportSuppliers: [],
    rawMaterialStandard: [],
    rawMaterialKit: [],
    conformityDeclarations: [],
    transportValmont: []
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);
  const [currentUploadCategory, setCurrentUploadCategory] = useState('');
  const [dragOverCategory, setDragOverCategory] = useState(null);

  // Document categories - ALL IN ENGLISH
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

  // Add files to category (shared function for button upload and drag & drop)
  const addFilesToCategory = (files, categoryKey) => {
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      uploadDate: new Date().toLocaleDateString('en-US')
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

  const generatePDFStructure = () => {
    const structure = {
      coverPage: {
        title: 'QUALITY CONTROL BOOK',
        project: `PROJECT: ${projectInfo.projectName}`,
        client: projectInfo.clientName,
        backgroundImage: '/images/backgrounds/solar-background1.jpeg',
        logo: '/images/logo2.png'
      },
      documentInfo: {
        filledBy: {
          name: projectInfo.createdBy || 'Not specified',
          date: projectInfo.createdDate ? new Date(projectInfo.createdDate).toLocaleDateString('en-US') : ''
        },
        approvedBy: {
          name: projectInfo.approvedBy || 'Not specified',
          date: projectInfo.approvedDate ? new Date(projectInfo.approvedDate).toLocaleDateString('en-US') : 'Pending'
        },
        revisions: [
          {
            no: '00',
            date: '[DATE]',
            page: '',
            notes: ''
          }
        ]
      },
      sections: [],
      indexContent: []
    };

    let currentPage = 4; // Cover + Document Info + Index pages

    const activeSections = documentCategories.filter(cat => documents[cat.key].length > 0);

    activeSections.forEach((category, index) => {
      const sectionDocs = documents[category.key];
      const startPage = currentPage + 1; // +1 for section cover
      const endPage = startPage + sectionDocs.length - 1;

      structure.indexContent.push({
        section: category.title,
        pageRange: sectionDocs.length === 1 ? `${startPage}` : `${startPage} - ${endPage}`,
        documentCount: sectionDocs.length,
        color: category.sectionColor
      });

      structure.sections.push({
        title: category.title,
        coverPage: currentPage,
        documents: sectionDocs,
        startPage,
        endPage,
        color: category.sectionColor,
        headerColor: category.headerColor
      });

      currentPage += sectionDocs.length + 1; // +1 for section cover
    });

    structure.totalPages = currentPage - 1;
    return structure;
  };

  // Generate Quality Book with MOCK PDF download
  const generateQualityBook = async () => {
    if (!projectInfo.projectName || !projectInfo.clientName) {
      alert('Please complete project name and client name');
      return;
    }

    if (getTotalDocuments() === 0) {
      alert('Please upload at least one document');
      return;
    }

    setIsProcessing(true);
    
    try {
      const pdfStructure = generatePDFStructure();
      
      // Simulate PDF generation process
      console.log('Generated PDF Structure:', pdfStructure);
      
      setTimeout(() => {
        setIsProcessing(false);
        
        // Create filename
        const filename = `Quality_Book_${projectInfo.projectName.replace(/\s+/g, '_')}_${projectInfo.clientName.replace(/\s+/g, '_')}.pdf`;
        
        // CREATE MOCK PDF DOWNLOAD - This simulates a real download
        const mockPdfContent = `Quality Book Generated Successfully!

Project: ${projectInfo.projectName}
Client: ${projectInfo.clientName}
Generated: ${new Date().toLocaleDateString('en-US')}

Structure:
• Cover Page with background image
• Document Information page
• Index with ${pdfStructure.indexContent.length} sections
• ${pdfStructure.sections.length} section separators  
• ${getTotalDocuments()} total documents
• ${pdfStructure.totalPages} total pages

This is a mock PDF. In production, this would contain the actual documents.`;

        // Create and download mock file
        const blob = new Blob([mockPdfContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.replace('.pdf', '.txt'); // Download as txt for demo
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Success message - IN ENGLISH
        const message = `Quality Book "${filename}" generated successfully!\n\nStructure:\n• Cover page with background image\n• Document information\n• Index with ${pdfStructure.indexContent.length} sections\n• ${pdfStructure.sections.length} section separators\n• ${getTotalDocuments()} total documents\n• ${pdfStructure.totalPages} total pages\n\nA demo file has been downloaded.`;
        alert(message);
        
      }, 3000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsProcessing(false);
      alert('Error generating Quality Book. Please try again.');
    }
  };

  const isReadyToGenerate = () => {
    return projectInfo.projectName && 
           projectInfo.clientName && 
           getTotalDocuments() > 0;
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return <FileText size={24} color="#dc2626" />;
    if (fileType?.includes('image')) return <FileText size={24} color="#059669" />;
    return <FileText size={24} color="#3b82f6" />;
  };

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #005F83 0%, #0077a2 50%, #667eea 100%)',
      minHeight: '100vh'
    }}>
      {/* Header with DARK background and transparency - FIXED */}
      <div style={{
        background: 'rgba(0, 20, 40, 0.9)', // Dark with transparency
        backdropFilter: 'blur(15px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {/* Valmont Solar Logo - Now visible on dark background */}
              <img 
                src="/images/logo2.png" 
                alt="Valmont Solar Logo" 
                style={{ 
                  height: '60px',
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) brightness(1.1)' // Enhanced visibility
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
                  color: 'white', // Changed to white for dark background
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
          {/* Project Information Panel - ALL ENGLISH */}
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
                    placeholder="e.g: DELOS_PIZZO"
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
                      Creation Date
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
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '0.75rem' 
                    }}>
                      Approval Date
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
                  </div>
                </div>
              </div>

              {/* Action Buttons - ALL ENGLISH */}
              <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #f3f4f6' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button
                    onClick={togglePreview}
                    style={{
                      width: '100%',
                      padding: '1rem 1.5rem',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 12px 35px rgba(139, 92, 246, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.3)';
                    }}
                  >
                    <Eye size={20} />
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>

                  <button
                    onClick={generateQualityBook}
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
                        <span>Generate Quality Book</span>
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

          {/* Document Categories with DRAG & DROP */}
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

        {/* Preview Section - ALL ENGLISH */}
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
                    Cover Page
                  </h3>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Project:</strong> {projectInfo.projectName || 'Not set'}
                    </p>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Client:</strong> {projectInfo.clientName || 'Not set'}
                    </p>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      <strong>Background:</strong> solar-background1.jpeg
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
                    <FileText size={40} color="white" style={{ margin: '0 auto' }} />
                  </div>
                  <h3 style={{ fontWeight: 'bold', color: '#1f2937', margin: '0 0 1rem 0', fontSize: '1.25rem' }}>
                    Document Information
                  </h3>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Created:</strong> {projectInfo.createdBy || 'Not set'}
                    </p>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Approved:</strong> {projectInfo.approvedBy || 'Not set'}
                    </p>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      <strong>Revisions:</strong> Table included
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
                    <FileCheck size={40} color="white" style={{ margin: '0 auto' }} />
                  </div>
                  <h3 style={{ fontWeight: 'bold', color: '#1f2937', margin: '0 0 1rem 0', fontSize: '1.25rem' }}>
                    Index
                  </h3>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Sections:</strong> {Object.values(documents).filter(cat => cat.length > 0).length}
                    </p>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Page references:</strong> Included
                    </p>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      <strong>Format:</strong> Automatic
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
                    <Package size={40} color="white" style={{ margin: '0 auto' }} />
                  </div>
                  <h3 style={{ fontWeight: 'bold', color: '#1f2937', margin: '0 0 1rem 0', fontSize: '1.25rem' }}>
                    Documents
                  </h3>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Total:</strong> {getTotalDocuments()} files
                    </p>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Organization:</strong> By category
                    </p>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      <strong>Separators:</strong> Automatic
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Structure Preview */}
              {isReadyToGenerate() && (
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
                    Document Structure:
                  </h4>
                  <div style={{ 
                    fontFamily: 'Monaco, Menlo, monospace', 
                    fontSize: '1rem', 
                    color: '#374151',
                    lineHeight: '1.8'
                  }}>
                    {(() => {
                      const structure = generatePDFStructure();
                      return (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>📄 Page 1:</span>
                            <span>Cover Page (with solar-background1.jpeg)</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>📄 Page 2:</span>
                            <span>Document Information</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>📄 Page 3:</span>
                            <span>Index</span>
                          </div>
                          {structure.sections.map((section, index) => (
                            <div key={index} style={{ marginLeft: '1rem', marginBottom: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ color: section.color, fontWeight: 'bold' }}>📄 Page {section.coverPage}:</span>
                                <span style={{ fontWeight: '600' }}>{section.title} (Separator)</span>
                              </div>
                              <div style={{ marginLeft: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ color: '#6b7280', fontWeight: 'bold' }}>📄 Pages {section.startPage}-{section.endPage}:</span>
                                  <span>Documents ({section.documents.length} files)</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div style={{ 
                            marginTop: '2rem', 
                            padding: '1rem',
                            background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            color: '#1f2937'
                          }}>
                            📊 Total Pages: {structure.totalPages}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
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