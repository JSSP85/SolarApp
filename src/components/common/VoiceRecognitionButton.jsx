// src/components/common/VoiceRecognitionButton.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Botón de reconocimiento de voz mejorado con estilo tipo WhatsApp
 */
const VoiceRecognitionButton = ({ onResultRecognized }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState(null);
  const [animateRipple, setAnimateRipple] = useState(false);
  
  // Referencias para audio
  const audioStartRef = useRef(null);
  const audioEndRef = useRef(null);
  const audioSuccessRef = useRef(null);
  
  // Obtener idioma del contexto
  const { selectedLanguage } = useLanguage();
  
  // Inicializar sonidos
  useEffect(() => {
    // Cargar sonidos si están disponibles
    try {
      audioStartRef.current = new Audio('/sounds/recognition-start.mp3');
      audioEndRef.current = new Audio('/sounds/recognition-end.mp3');
      audioSuccessRef.current = new Audio('/sounds/recognition-success.mp3');
      
      // Ajustar volumen
      if (audioStartRef.current) audioStartRef.current.volume = 0.3;
      if (audioEndRef.current) audioEndRef.current.volume = 0.3;
      if (audioSuccessRef.current) audioSuccessRef.current.volume = 0.3;
    } catch (error) {
      console.log('Error cargando sonidos, pero continuando', error);
    }
    
    // Limpiar recursos cuando se desmonta el componente
    return () => {
      if (recognitionInstance) {
        recognitionInstance.abort();
      }
    };
  }, []);

  // Mapeo de texto a números para múltiples idiomas
  const numberWords = {
    'es-ES': {
      'cero': 0, 'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
      'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
      'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15,
      'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20,
      'treinta': 30, 'cuarenta': 40, 'cincuenta': 50, 'sesenta': 60, 'setenta': 70,
      'ochenta': 80, 'noventa': 90, 'cien': 100, 'mil': 1000, 'millón': 1000000,
      'punto': '.', 'coma': ',', 'decimal': '.'
    },
    'en-US': {
      'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
      'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
      'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
      'eighty': 80, 'ninety': 90, 'hundred': 100, 'thousand': 1000, 'million': 1000000,
      'point': '.', 'dot': '.', 'decimal': '.'
    },
    'it-IT': {
      'zero': 0, 'uno': 1, 'due': 2, 'tre': 3, 'quattro': 4, 'cinque': 5,
      'sei': 6, 'sette': 7, 'otto': 8, 'nove': 9, 'dieci': 10,
      'undici': 11, 'dodici': 12, 'tredici': 13, 'quattordici': 14, 'quindici': 15,
      'sedici': 16, 'diciassette': 17, 'diciotto': 18, 'diciannove': 19, 'venti': 20,
      'trenta': 30, 'quaranta': 40, 'cinquanta': 50, 'sessanta': 60, 'settanta': 70,
      'ottanta': 80, 'novanta': 90, 'cento': 100, 'mille': 1000, 'milione': 1000000,
      'punto': '.', 'virgola': ',', 'decimale': '.'
    }
  };

  // Función para intentar convertir texto de números a dígitos
  const tryConvertTextToNumber = (text) => {
    const langCode = selectedLanguage.code;
    const langDict = numberWords[langCode] || numberWords['en-US'];
    
    // Primero verificar si ya tenemos un número en el texto
    const numericPattern = /\d+([.,]\d+)?/;
    const numericMatch = text.match(numericPattern);
    
    if (numericMatch) {
      // Ya hay un número en formato digital, normalizar decimal
      return numericMatch[0].replace(',', '.');
    }
    
    // Intentar convertir palabras a números
    // Convierte el texto a minúsculas y divide en palabras
    const words = text.toLowerCase().trim().split(/\s+/);
    
    // Buscar palabras que coincidan con números en nuestro diccionario
    for (const word of words) {
      if (word in langDict) {
        // Encontramos un número en palabra, devuelve el valor numérico
        return langDict[word].toString();
      }
    }
    
    // No se pudo convertir
    return null;
  };
  
  // Iniciar reconocimiento de voz
  const startListening = () => {
    setError(null);
    setAnimateRipple(true);
    
    // Verificar compatibilidad
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Tu navegador no soporta reconocimiento de voz');
      return;
    }
    
    try {
      // Reproducir sonido de inicio
      if (audioStartRef.current) {
        audioStartRef.current.play().catch(e => console.log('Error reproduciendo audio de inicio:', e));
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = selectedLanguage.code;
      recognition.continuous = false;
      recognition.interimResults = true;
      
      recognition.onstart = () => {
        setIsListening(true);
        console.log('Reconocimiento de voz iniciado');
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInterimText(transcript);
        
        if (event.results[0].isFinal) {
          console.log('Texto reconocido final:', transcript);
          
          // Buscar un número en el texto (ya sea en formato número o texto)
          let recognizedNumber = null;
          
          // Primero buscar números en formato digital
          const numberPattern = /\d+([.,]\d+)?/;
          const match = transcript.match(numberPattern);
          
          if (match) {
            // Se encontró un número en formato digital
            recognizedNumber = match[0].replace(',', '.');
            console.log('Número reconocido (formato digital):', recognizedNumber);
          } else {
            // Intentar convertir texto a número
            recognizedNumber = tryConvertTextToNumber(transcript);
            console.log('Número reconocido (convertido de texto):', recognizedNumber);
          }
          
          // Si encontramos un número, enviar a la función de callback
          if (recognizedNumber !== null) {
            // Reproducir sonido de éxito
            if (audioSuccessRef.current) {
              audioSuccessRef.current.play().catch(e => console.log('Error reproduciendo audio de éxito:', e));
            }
            
            // Notificar al componente padre
            if (onResultRecognized) {
              onResultRecognized(recognizedNumber);
              
              // Añadimos un mensaje explícito para mostrar el número reconocido
              setInterimText(`Número reconocido: ${recognizedNumber}`);
              
              // Limpiar después de unos segundos
              setTimeout(() => {
                if (!isListening) {
                  setInterimText('');
                }
              }, 2000);
            }
          } else {
            // No se reconoció ningún número
            setInterimText('No se detectó ningún número. Intente de nuevo.');
            
            // Limpiar después de unos segundos
            setTimeout(() => {
              setInterimText('');
            }, 2000);
          }
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Error en reconocimiento:', event.error);
        setError(`Error: ${event.error}`);
        setIsListening(false);
        setAnimateRipple(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        setAnimateRipple(false);
        console.log('Reconocimiento de voz finalizado');
        
        // Reproducir sonido de finalización
        if (audioEndRef.current) {
          audioEndRef.current.play().catch(e => console.log('Error reproduciendo audio de fin:', e));
        }
      };
      
      // Guardar instancia y comenzar
      setRecognitionInstance(recognition);
      recognition.start();
      
    } catch (error) {
      console.error('Error iniciando reconocimiento:', error);
      setError(`Error: ${error.message}`);
      setAnimateRipple(false);
    }
  };
  
  // Detener reconocimiento
  const stopListening = () => {
    if (recognitionInstance) {
      recognitionInstance.stop();
    }
    setAnimateRipple(false);
  };
  
  // Alternar reconocimiento
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  return (
    <div className="voice-btn-container">
      {/* Botón principal tipo WhatsApp */}
      <button
        className={`voice-btn ${isListening ? 'voice-btn--active' : ''}`}
        onClick={toggleListening}
        title={`${isListening ? 'Detener' : 'Iniciar'} reconocimiento (${selectedLanguage.name})`}
        aria-label="Reconocimiento de voz"
      >
        <span className="voice-btn__flag">{selectedLanguage.flag}</span>
        <span className="voice-btn__icon">
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </span>
        
        {/* Efectos visuales cuando está escuchando */}
        {isListening && (
          <span className="voice-btn__waves"></span>
        )}
        
        {/* Efecto de ripple al inicio */}
        {animateRipple && (
          <span className="voice-btn__ripple"></span>
        )}
      </button>
      
      {/* Texto reconocido (aparece mientras se escucha) */}
      {interimText && (
        <div className="voice-tooltip">
          {interimText}
        </div>
      )}
      
      {/* Mensaje de error */}
      {error && (
        <div className="voice-error">
          {error}
        </div>
      )}
      
      {/* Estilos CSS mejorados */}
      <style jsx>{`
        .voice-btn-container {
          position: relative;
          margin: 0 2px;
        }
        
        .voice-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(145deg, #2563eb, #1e40af);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 5px rgba(37, 99, 235, 0.3);
          position: relative;
          overflow: hidden;
          padding: 0;
        }
        
        .voice-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(37, 99, 235, 0.4);
        }
        
        .voice-btn:active {
          transform: translateY(1px);
          box-shadow: 0 1px 3px rgba(37, 99, 235, 0.3);
        }
        
        .voice-btn--active {
          background: linear-gradient(145deg, #ef4444, #b91c1c);
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5), 0 0 0 5px rgba(239, 68, 68, 0.2);
          animation: pulse 1.5s infinite;
        }
        
        .voice-btn__flag {
          position: absolute;
          font-size: 10px;
          top: -2px;
          right: -2px;
          background: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        
        .voice-btn__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        
        .voice-btn__waves {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border-radius: 50%;
          z-index: 1;
        }
        
        .voice-btn__waves:before,
        .voice-btn__waves:after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.5);
          animation: waves 2s linear infinite;
        }
        
        .voice-btn__waves:after {
          animation-delay: 0.5s;
        }
        
        .voice-btn__ripple {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          z-index: 1;
          animation: ripple 0.8s ease-out;
        }
        
        .voice-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 12px;
          white-space: nowrap;
          z-index: 50;
          animation: fadeIn 0.3s ease-out;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          max-width: 250px;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        
        .voice-tooltip:after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 5px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
        }
        
        .voice-error {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
          background: #fef2f2;
          color: #b91c1c;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 12px;
          white-space: nowrap;
          z-index: 50;
          animation: fadeIn 0.3s ease-out;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #fee2e2;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        
        @keyframes waves {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        
        @keyframes ripple {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default VoiceRecognitionButton;