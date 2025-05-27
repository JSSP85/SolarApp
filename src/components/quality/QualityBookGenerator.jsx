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
  Settings,
  FileImage,
  FilePdf
} from 'lucide-react';

// Componente BackButton
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

  // Categorías de documentos basadas en tu Quality Book adjunto
  const documentCategories = [
    {
      key: 'transportSuppliers',
      title: 'TRANSPORT DOCUMENT_SUPPLIERS',
      icon: <Truck className="w-5 h-5" />,
      description: 'Documentos de transporte desde proveedores a Valmont Solar',
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      headerColor: 'bg-blue-600',
      sectionColor: '#3B82F6'
    },
    {
      key: 'rawMaterialStandard',
      title: 'RAW MATERIAL CERTIFICATES - STANDARD FAMILY',
      icon: <Award className="w-5 h-5" />,
      description: 'Certificados de materia prima para familia de componentes estándar',
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
      headerColor: 'bg-green-600',
      sectionColor: '#10B981'
    },
    {
      key: 'rawMaterialKit',
      title: 'RAW MATERIAL CERTIFICATES - KIT FAMILY', 
      icon: <Package className="w-5 h-5" />,
      description: 'Certificados de materia prima para familia de componentes kit',
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
      headerColor: 'bg-purple-600',
      sectionColor: '#8B5CF6'
    },
    {
      key: 'conformityDeclarations',
      title: 'DECLARATION OF CONFORMITY',
      icon: <FileCheck className="w-5 h-5" />,
      description: 'Declaraciones de conformidad y certificaciones',
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600',
      headerColor: 'bg-orange-600',
      sectionColor: '#F59E0B'
    },
    {
      key: 'transportValmont',
      title: 'TRANSPORT DOCUMENT_VALMONT',
      icon: <Truck className="w-5 h-5" />,
      description: 'Documentos de transporte desde Valmont Solar al cliente',
      color: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600',
      headerColor: 'bg-red-600',
      sectionColor: '#EF4444'
    }
  ];

  const handleFileUpload = (categoryKey) => {
    setCurrentUploadCategory(categoryKey);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0 && currentUploadCategory) {
      const newFiles = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        uploadDate: new Date().toLocaleDateString('es-ES')
      }));

      setDocuments(prev => ({
        ...prev,
        [currentUploadCategory]: [...prev[currentUploadCategory], ...newFiles]
      }));
    }
    event.target.value = '';
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
          date: projectInfo.createdDate ? new Date(projectInfo.createdDate).toLocaleDateString('es-ES') : ''
        },
        approvedBy: {
          name: projectInfo.approvedBy || 'Not specified',
          date: projectInfo.approvedDate ? new Date(projectInfo.approvedDate).toLocaleDateString('es-ES') : 'Pending'
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

  const generateQualityBook = async () => {
    if (!projectInfo.projectName || !projectInfo.clientName) {
      alert('Por favor completa el nombre del proyecto y el cliente');
      return;
    }

    if (getTotalDocuments() === 0) {
      alert('Por favor sube al menos un documento');
      return;
    }

    setIsProcessing(true);
    
    try {
      const pdfStructure = generatePDFStructure();
      
      // Simular proceso de generación de PDF con la estructura real
      console.log('Estructura PDF Generada:', pdfStructure);
      
      // Aquí se implementaría la generación real del PDF
      // usando las especificaciones de tu documento adjunto
      
      setTimeout(() => {
        setIsProcessing(false);
        
        // Crear nombre de archivo basado en tu formato
        const filename = `Quality_Book_${projectInfo.projectName.replace(/\s+/g, '_')}_${projectInfo.clientName.replace(/\s+/g, '_')}.pdf`;
        
        // Mensaje de éxito con detalles de la estructura
        const message = `Quality Book "${filename}" generado exitosamente!\n\nEstructura:\n• Portada con imagen de fondo\n• Información del documento\n• Índice con ${pdfStructure.indexContent.length} secciones\n• ${pdfStructure.sections.length} separadores de sección\n• ${getTotalDocuments()} documentos totales\n• ${pdfStructure.totalPages} páginas totales`;
        alert(message);
        
        // Aquí se descargaría el PDF real
        // Por ahora, mostrar la estructura en consola
        console.log('PDF Structure to Generate:', {
          cover: pdfStructure.coverPage,
          documentInfo: pdfStructure.documentInfo,
          index: pdfStructure.indexContent,
          sections: pdfStructure.sections
        });
        
      }, 3000);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      setIsProcessing(false);
      alert('Error generando Quality Book. Por favor inténtalo de nuevo.');
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
    if (fileType?.includes('pdf')) return <FilePdf size={24} color="#dc2626" />;
    if (fileType?.includes('image')) return <FileImage size={24} color="#059669" />;
    return <FileText size={24} color="#3b82f6" />;
  };

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #005F83 0%, #0077a2 50%, #667eea 100%)',
      minHeight: '100vh'
    }}>
      {/* Header con diseño mejorado */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(15px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {/* Logo Valmont Solar */}
              <img 
                src="/images/logo2.png" 
                alt="Valmont Solar Logo" 
                style={{ 
                  height: '60px',
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
                }}
              />
              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #005F83 0%, #0077a2 100%)',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(0, 95, 131, 0.3)'
              }}>
                <Book size={32} color="white" />
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 'bold', 
                  color: '#1a202c',
                  margin: 0,
                  background: 'linear-gradient(135deg, #005F83 0%, #0077a2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.02em'
                }}>
                  Generador de Quality Books
                </h1>
                <p style={{ color: '#4a5568', margin: 0, fontSize: '1.2rem', fontWeight: '500' }}>
                  Sistema automatizado de documentación de trazabilidad
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
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, fontWeight: '500' }}>
                  Documentos Totales
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
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, fontWeight: '500' }}>
                  Categorías Activas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Panel de Información del Proyecto */}
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
                  Información del Proyecto
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
                    Nombre del Proyecto *
                  </label>
                  <input
                    type="text"
                    value={projectInfo.projectName}
                    onChange={(e) => setProjectInfo(prev => ({...prev, projectName: e.target.value}))}
                    placeholder="ej: DELOS_PIZZO"
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
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    value={projectInfo.clientName}
                    onChange={(e) => setProjectInfo(prev => ({...prev, clientName: e.target.value}))}
                    placeholder="Nombre de la empresa cliente"
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
                      Creado Por
                    </label>
                    <input
                      type="text"
                      value={projectInfo.createdBy}
                      onChange={(e) => setProjectInfo(prev => ({...prev, createdBy: e.target.value}))}
                      placeholder="Tu nombre"
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
                      Aprobado Por
                    </label>
                    <input
                      type="text"
                      value={projectInfo.approvedBy}
                      onChange={(e) => setProjectInfo(prev => ({...prev, approvedBy: e.target.value}))}
                      placeholder="Nombre del aprobador"
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
                      Fecha de Creación
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
                      Fecha de Aprobación
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

              {/* Botones de Acción */}
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
                    {showPreview ? 'Ocultar Vista Previa' : 'Mostrar Vista Previa'}
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
                        <span>Generando PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download size={20} />
                        <span>Generar Quality Book</span>
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
                        <span style={{ fontWeight: '600', color: '#92400e' }}>Información Requerida</span>
                      </div>
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: '#92400e', 
                        margin: 0
                      }}>
                        Completa la información del proyecto y sube documentos para generar
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Categorías de Documentos */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {documentCategories.map((category) => (
                <div key={category.key} style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '20px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  overflow: 'hidden',
                  backdropFilter: 'blur(15px)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 25px 60px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.1)';
                }}
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
                          {documents[category.key].length} archivos
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
                          <span>Subir Archivos</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '2rem' }}>
                    {documents[category.key].length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                          borderRadius: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 2rem'
                        }}>
                          <Upload size={40} color="#9ca3af" />
                        </div>
                        <p style={{ color: '#6b7280', fontSize: '1.25rem', margin: '0 0 0.75rem 0', fontWeight: '600' }}>
                          No hay documentos subidos
                        </p>
                        <p style={{ color: '#9ca3af', fontSize: '1rem', margin: 0 }}>
                          Haz clic en "Subir Archivos" para agregar documentos a esta categoría
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

        {/* Sección de Vista Previa */}
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
                Vista Previa del Quality Book
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
                    Portada
                  </h3>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Proyecto:</strong> {projectInfo.projectName || 'No establecido'}
                    </p>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Cliente:</strong> {projectInfo.clientName || 'No establecido'}
                    </p>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      <strong>Fondo:</strong> solar-background1.jpeg
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
                    Info del Documento
                  </h3>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Creado:</strong> {projectInfo.createdBy || 'No establecido'}
                    </p>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Aprobado:</strong> {projectInfo.approvedBy || 'No establecido'}
                    </p>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      <strong>Revisiones:</strong> Tabla incluida
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
                    Índice
                  </h3>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Secciones:</strong> {Object.values(documents).filter(cat => cat.length > 0).length}
                    </p>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Referencias:</strong> Páginas incluidas
                    </p>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      <strong>Formato:</strong> Automático
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
                    Documentos
                  </h3>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Total:</strong> {getTotalDocuments()} archivos
                    </p>
                    <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                      <strong>Organización:</strong> Por categoría
                    </p>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      <strong>Separadores:</strong> Automáticos
                    </p>
                  </div>
                </div>
              </div>

              {/* Vista Previa de Estructura */}
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
                    Estructura del Documento:
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
                            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>📄 Página 1:</span>
                            <span>Portada (con fondo solar-background1.jpeg)</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>📄 Página 2:</span>
                            <span>Información del Documento</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>📄 Página 3:</span>
                            <span>Índice</span>
                          </div>
                          {structure.sections.map((section, index) => (
                            <div key={index} style={{ marginLeft: '1rem', marginBottom: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ color: section.color, fontWeight: 'bold' }}>📄 Página {section.coverPage}:</span>
                                <span style={{ fontWeight: '600' }}>{section.title} (Separador)</span>
                              </div>
                              <div style={{ marginLeft: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ color: '#6b7280', fontWeight: 'bold' }}>📄 Páginas {section.startPage}-{section.endPage}:</span>
                                  <span>Documentos ({section.documents.length} archivos)</span>
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
                            📊 Total de Páginas: {structure.totalPages}
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

      {/* Input oculto para archivos */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Botón de Regreso */}
      {onBackClick && <BackButton onClick={onBackClick} />}

      {/* CSS para animaciones */}
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