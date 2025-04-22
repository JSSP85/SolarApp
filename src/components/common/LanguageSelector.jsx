// src/components/common/LanguageSelector.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Componente mejorado para seleccionar el idioma del reconocimiento de voz
 */
const LanguageSelector = () => {
  const { selectedLanguage, availableLanguages, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Manejar selección de idioma
  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };
  
  return (
    <div className="language-selector flex items-center">
      {/* Selector de idioma con dropdown */}
      <div className="relative inline-block" ref={dropdownRef}>
        <button
          className="flex items-center px-3 py-2 rounded-md bg-blue-50 hover:bg-blue-100 cursor-pointer border border-blue-200 text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Seleccionar idioma"
        >
          <Globe size={16} className="text-blue-600 mr-2" />
          <span className="mr-1 text-lg" aria-hidden="true">{selectedLanguage.flag}</span>
          <span className="mr-1 text-sm font-medium">{selectedLanguage.name}</span>
          <ChevronDown 
            size={14} 
            className={`text-blue-600 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
          />
        </button>
        
        {/* Dropdown de idiomas */}
        {isOpen && (
          <div className="absolute mt-1 right-0 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 animate-fadeIn">
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                className={`w-full px-4 py-2 text-left text-sm flex items-center hover:bg-blue-50 ${
                  selectedLanguage.code === language.code ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleLanguageSelect(language.code)}
              >
                <span className="text-lg mr-2">{language.flag}</span>
                <span className="flex-1">{language.name}</span>
                {selectedLanguage.code === language.code && (
                  <Check size={14} className="text-blue-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <span className="text-xs text-gray-500 ml-2 hidden sm:inline">
        Idioma para reconocimiento de voz
      </span>
      
      {/* Estilos para la animación */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LanguageSelector;