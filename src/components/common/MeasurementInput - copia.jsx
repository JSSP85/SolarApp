// src/components/common/MeasurementInput.jsx
import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Mic, MicOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Componente reutilizable para entrada de mediciones con navegación
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.value - Valor actual
 * @param {Function} props.onChange - Función al cambiar el valor
 * @param {Function} props.onNext - Función al avanzar a la siguiente muestra
 * @param {Function} props.onPrev - Función al retroceder a la muestra anterior
 * @param {boolean} props.canGoNext - Si se puede avanzar
 * @param {boolean} props.canGoPrev - Si se puede retroceder
 * @param {string} props.label - Etiqueta para el campo
 * @param {number} props.currentNumber - Número de muestra actual
 * @param {number} props.totalCount - Total de muestras
 * @param {string} props.placeholder - Texto de marcador de posición
 * @param {string} [props.step='0.1'] - Incremento para el campo numérico
 * @param {string} [props.min='0'] - Valor mínimo
 */
const MeasurementInput = ({
  value,
  onChange,
  onNext,
  onPrev,
  canGoNext,
  canGoPrev,
  label,
  currentNumber,
  totalCount,
  placeholder,
  step = '0.1',
  min = '0'
}) => {
  const inputRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  
  // Obtener el idioma seleccionado del contexto
  const { selectedLanguage } = useLanguage();

  // Estilos CSS para la animación de pulso
  const pulseAnimationStyle = {
    animation: isListening ? 'pulse 1.5s infinite ease-in-out' : 'none',
  };

  // Keyframes para la animación de pulso
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.05);
          opacity: 0.8;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleNext = () => {
    if (canGoNext && inputRef.current) {
      onNext(inputRef.current.value);
    }
  };
  
  const handlePrev = () => {
    if (canGoPrev && inputRef.current) {
      onPrev(inputRef.current.value);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && canGoNext) {
      handleNext();
    }
  };

  // Función para iniciar el reconocimiento de voz
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Tu navegador no soporta el reconocimiento de voz. Intenta con Chrome o Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    // Usar el idioma seleccionado
    recognitionInstance.lang = selectedLanguage.code;
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    
    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Reconocido:', transcript);
      
      // Formato de número adaptado a los diferentes idiomas
      const numberPattern = /\d+([.,]\d+)?/;
      const match = transcript.match(numberPattern);
      
      if (match) {
        const numberValue = match[0].replace(',', '.');
        if (inputRef.current) {
          inputRef.current.value = numberValue;
          onChange(numberValue);
        }
      }
      
      setIsListening(false);
    };
    
    recognitionInstance.onend = () => {
      setIsListening(false);
    };
    
    recognitionInstance.onerror = (event) => {
      console.error('Error de reconocimiento de voz:', event.error);
      setIsListening(false);
    };
    
    setRecognition(recognitionInstance);
    recognitionInstance.start();
    setIsListening(true);
  };

  const stopVoiceRecognition = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const toggleVoiceRecognition = () => {
    if (isListening) {
      stopVoiceRecognition();
    } else {
      startVoiceRecognition();
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <button 
        className={`p-2 rounded ${
          canGoPrev 
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        onClick={handlePrev}
        disabled={!canGoPrev}
      >
        <ArrowLeft size={20} />
      </button>
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1">
          {label} {currentNumber} of {totalCount}
        </label>
        <div className="flex">
          <input 
            ref={inputRef}
            type="number" 
            className="flex-1 p-1 border rounded-l w-20" 
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            step={step}
            min={min}
          />
          {/* Botón de micrófono con indicador de idioma */}
          <button 
            className={`flex items-center justify-center px-2 ${isListening 
              ? 'bg-red-500 text-white' 
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            onClick={toggleVoiceRecognition}
            title={`${isListening ? "Detener" : "Iniciar"} reconocimiento de voz (${selectedLanguage.name})`}
            style={pulseAnimationStyle}
          >
            <span className="mr-1">{selectedLanguage.flag}</span>
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <button 
            className="bg-green-600 text-white px-3 py-2 rounded-r"
            onClick={handleNext}
            disabled={!canGoNext}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeasurementInput;