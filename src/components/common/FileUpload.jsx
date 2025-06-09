// src/components/common/FileUpload.jsx
import React, { useState, useRef } from 'react';
import { Upload, X, FileImage, AlertCircle } from 'lucide-react';

const FileUpload = ({ 
  onFilesChange, 
  acceptedTypes = "image/*", 
  maxFiles = 5, 
  maxSizePerFile = 5 * 1024 * 1024 // 5MB
}) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const errors = [];
    
    // Check file size
    if (file.size > maxSizePerFile) {
      errors.push(`File "${file.name}" is too large. Maximum size is ${formatFileSize(maxSizePerFile)}.`);
    }
    
    // Check file type
    if (acceptedTypes && !acceptedTypes.includes('*')) {
      const acceptedTypesArray = acceptedTypes.split(',').map(type => type.trim());
      const fileType = file.type;
      const isValidType = acceptedTypesArray.some(type => 
        type === fileType || 
        (type.endsWith('/*') && fileType.startsWith(type.slice(0, -1)))
      );
      
      if (!isValidType) {
        errors.push(`File "${file.name}" has an unsupported format.`);
      }
    }
    
    return errors;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFiles = (newFiles) => {
    const fileArray = Array.from(newFiles);
    const allErrors = [];
    
    // Check total number of files
    if (files.length + fileArray.length > maxFiles) {
      allErrors.push(`Maximum ${maxFiles} files allowed. Currently have ${files.length}, trying to add ${fileArray.length}.`);
      setErrors(allErrors);
      return;
    }
    
    // Validate each file
    fileArray.forEach(file => {
      const fileErrors = validateFile(file);
      allErrors.push(...fileErrors);
    });
    
    if (allErrors.length > 0) {
      setErrors(allErrors);
      return;
    }
    
    // Add files with preview URLs
    const filesWithPreviews = fileArray.map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    
    const updatedFiles = [...files, ...filesWithPreviews];
    setFiles(updatedFiles);
    setErrors([]);
    onFilesChange(updatedFiles);
  };

  const removeFile = (fileId) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const openFileExplorer = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Upload Area */}
      <div
        style={{
          border: `2px dashed ${dragActive ? '#4299e1' : '#e2e8f0'}`,
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: dragActive ? '#f7fafc' : '#ffffff',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileExplorer}
      >
        <Upload 
          size={48} 
          style={{ 
            color: '#a0aec0', 
            marginBottom: '1rem',
            display: 'block',
            margin: '0 auto 1rem auto'
          }} 
        />
        <p style={{ 
          color: '#4a5568', 
          marginBottom: '0.5rem',
          fontWeight: '600'
        }}>
          Drop files here or click to browse
        </p>
        <p style={{ 
          color: '#718096', 
          fontSize: '0.875rem',
          margin: 0
        }}>
          Maximum {maxFiles} files, {formatFileSize(maxSizePerFile)} each
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      {/* Error Messages */}
      {errors.length > 0 && (
        <div style={{ 
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: '#fed7d7',
          border: '1px solid #feb2b2',
          borderRadius: '6px'
        }}>
          {errors.map((error, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#c53030',
              fontSize: '0.875rem',
              marginBottom: index < errors.length - 1 ? '0.25rem' : 0
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ 
            margin: '0 0 0.75rem 0',
            color: '#2d3748',
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          <div style={{ 
            display: 'grid',
            gap: '0.75rem'
          }}>
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: '#f7fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px'
                }}
              >
                {/* File Preview or Icon */}
                {fileItem.previewUrl ? (
                  <img
                    src={fileItem.previewUrl}
                    alt={fileItem.name}
                    style={{
                      width: '48px',
                      height: '48px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                ) : (
                  <FileImage size={48} style={{ color: '#a0aec0' }} />
                )}
                
                {/* File Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0,
                    fontWeight: '600',
                    color: '#2d3748',
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {fileItem.name}
                  </p>
                  <p style={{
                    margin: 0,
                    color: '#718096',
                    fontSize: '0.75rem'
                  }}>
                    {formatFileSize(fileItem.size)}
                  </p>
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(fileItem.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    color: '#e53e3e',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.color = '#c53030'}
                  onMouseOut={(e) => e.target.style.color = '#e53e3e'}
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;