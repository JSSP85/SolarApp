// src/context/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Configuración ampliada de idiomas disponibles
const AVAILABLE_LANGUAGES = [
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' }
];

// Crear el contexto
const LanguageContext = createContext();

// Proveedor del contexto
export const LanguageProvider = ({ children }) => {
  // Intentar recuperar el idioma guardado de localStorage o usar español como predeterminado
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
      const parsed = JSON.parse(savedLang);
      const found = AVAILABLE_LANGUAGES.find(lang => lang.code === parsed.code);
      return found || AVAILABLE_LANGUAGES[0];
    }
    return AVAILABLE_LANGUAGES[0]; // Español como predeterminado
  });
  
  // Función para cambiar el idioma
  const changeLanguage = (languageCode) => {
    const newLanguage = AVAILABLE_LANGUAGES.find(lang => lang.code === languageCode);
    if (newLanguage) {
      setSelectedLanguage(newLanguage);
      // Guardar preferencia en localStorage
      localStorage.setItem('preferredLanguage', JSON.stringify(newLanguage));
    }
  };
  
  // Detectar idioma del navegador al iniciar (solo la primera vez)
  useEffect(() => {
    // Solo detectar si no hay preferencia guardada
    if (!localStorage.getItem('preferredLanguage')) {
      const browserLang = navigator.language;
      // Buscar coincidencia aproximada (ej. 'es' coincide con 'es-ES')
      const matchedLang = AVAILABLE_LANGUAGES.find(
        lang => browserLang.startsWith(lang.code.split('-')[0])
      );
      
      if (matchedLang) {
        setSelectedLanguage(matchedLang);
        localStorage.setItem('preferredLanguage', JSON.stringify(matchedLang));
      }
    }
  }, []);
  
  // Datos específicos por idioma para reconocimiento de voz
  const voiceRecognitionData = {
    // Comandos por idioma
    commands: {
      'es-ES': {
        next: ['siguiente', 'próximo', 'avanzar', 'adelante'],
        previous: ['anterior', 'previo', 'atrás', 'retroceder'],
        clear: ['borrar', 'limpiar', 'vaciar', 'eliminar'],
        command: ['comando', 'comandos']
      },
      'en-US': {
        next: ['next', 'forward', 'advance', 'continue'],
        previous: ['previous', 'back', 'backward', 'return'],
        clear: ['clear', 'delete', 'remove', 'erase'],
        command: ['command', 'commands']
      },
      'it-IT': {
        next: ['avanti', 'successivo', 'prossimo', 'continua'],
        previous: ['indietro', 'precedente', 'ritorno'],
        clear: ['cancella', 'pulisci', 'elimina'],
        command: ['comando', 'comandi']
      },
      'fr-FR': {
        next: ['suivant', 'prochain', 'avancer', 'continuer'],
        previous: ['précédent', 'retour', 'arrière', 'revenir'],
        clear: ['effacer', 'supprimer', 'vider', 'enlever'],
        command: ['commande', 'commandes']
      },
      'de-DE': {
        next: ['weiter', 'nächste', 'vorwärts', 'fortfahren'],
        previous: ['zurück', 'vorherige', 'rückwärts'],
        clear: ['löschen', 'entfernen', 'leeren'],
        command: ['befehl', 'befehle', 'kommando']
      },
      'pt-BR': {
        next: ['próximo', 'seguinte', 'avançar', 'continuar'],
        previous: ['anterior', 'voltar', 'retornar'],
        clear: ['apagar', 'limpar', 'deletar'],
        command: ['comando', 'comandos']
      }
    },
    
    // Patrones de números por idioma
    numberPatterns: {
      'es-ES': /\b\d+([.,]\d+)?\b/,
      'en-US': /\b\d+([.,]\d+)?\b/,
      'it-IT': /\b\d+([.,]\d+)?\b/,
      'fr-FR': /\b\d+([.,]\d+)?\b/,
      'de-DE': /\b\d+([.,]\d+)?\b/,
      'pt-BR': /\b\d+([.,]\d+)?\b/
    },
    
    // Separador decimal por idioma (para normalización)
    decimalSeparator: {
      'es-ES': ',',
      'en-US': '.',
      'it-IT': ',',
      'fr-FR': ',',
      'de-DE': ',',
      'pt-BR': ','
    },
    
    // Mensajes de UI por idioma
    uiMessages: {
      'es-ES': {
        listening: 'Escuchando',
        detected: 'Detectado',
        processing: 'Procesando',
        error: 'Error',
        commandMode: 'Modo comando'
      },
      'en-US': {
        listening: 'Listening',
        detected: 'Detected',
        processing: 'Processing',
        error: 'Error',
        commandMode: 'Command mode'
      },
      // ... etc. para otros idiomas
    }
  };
  
  // Valor proporcionado por el contexto
  const value = {
    selectedLanguage,
    availableLanguages: AVAILABLE_LANGUAGES,
    changeLanguage,
    voiceRecognitionData
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de un LanguageProvider');
  }
  return context;
};

export default LanguageContext;