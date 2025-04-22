// src/utils/googleSheetsService.js
import * as XLSX from 'xlsx';

// Almacenamos en caché los datos después de la primera carga
let componentsCache = null;

/**
 * Carga los datos del archivo Excel
 */
const loadComponentsData = async () => {
  // Devuelve datos en caché si ya están cargados
  if (componentsCache) return componentsCache;
  
  try {
    // Ajusta la ruta si tu archivo se llama distinto o está en otra ubicación
    const response = await fetch('/data/Database_componenti.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    
    // Lee el workbook
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Toma la primera hoja
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convierte a JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    if (rawData.length === 0) return [];
    
    // La primera fila suele ser encabezados; si tu Excel los trae
    // como "verdaderos encabezados" en la fila 1, XLSX los usa como keys
    // Dado que .sheet_to_json a veces asume la primera fila como headers,
    // ya tendríamos "A", "A+", "B", "B+", etc., en los keys.
    
    // Guardamos en caché todos los datos
    componentsCache = rawData;
    
    return componentsCache;
  } catch (error) {
    console.error('Error al cargar datos de componentes:', error);
    return [];
  }
};

/**
 * Obtiene las familias de componentes del Excel
 */
export const fetchComponentFamilies = async () => {
  try {
    const data = await loadComponentsData();
    // Suponiendo que cada fila tiene la columna "Familia"
    const families = [...new Set(data.map(item => item.Familia))];
    return families;
  } catch (error) {
    console.error('Error al obtener familias de componentes:', error);
    return ["TORQUE TUBES", "POSTS", "MODULE RAILS", "KIT"];
  }
};

/**
 * Obtiene los códigos de componente (columna "Codigo") para una familia dada
 */
export const fetchComponentCodes = async (family) => {
  try {
    const data = await loadComponentsData();
    const filteredCodes = data
      .filter(item => item.Familia === family)
      .map(item => ({
        code: item.Codigo,
        name: item.Nombre || item.Codigo
      }));
    return filteredCodes;
  } catch (error) {
    console.error(`Error al obtener códigos para la familia ${family}:`, error);
    return [];
  }
};

/**
 * Obtiene dimensiones para un código de componente específico,
 * identificando nominal, tolerancia + y tolerancia - según encabezados "A", "A+", "A-"
 */
export const fetchDimensions = async (componentCode) => {
  try {
    const data = await loadComponentsData();
    
    // Busca la fila del Excel que coincida con ese código
    const componentRow = data.find(item => item.Codigo === componentCode);
    if (!componentRow) return [];
    
    // Creamos un objeto temporal para guardar info de cada cota: { A: { nominal, plus, minus }, B: { ... } ...}
    const dimensionMap = {};
    
    // Recorremos todas las columnas del row
    for (const key of Object.keys(componentRow)) {
      // Valor real en la celda
      const rawValue = componentRow[key];
      if (!rawValue && rawValue !== 0) continue; 
      
      // Patrón para cota nominal: "A", "B", "C", "Ø1", etc. (una letra, o Ø + dígitos)
      // Patrón para tolerancia +: "A+", "B+", ...
      // Patrón para tolerancia -: "A-", "B-", ...
      
      // 1) Nominal (ej: "A", "C", "Ø1")
      if (/^[A-Z]$/.test(key) || /^Ø\d+$/.test(key)) {
        // Si no existe en dimensionMap, lo creamos
        if (!dimensionMap[key]) {
          dimensionMap[key] = { code: key, nominal: null, plus: 0, minus: 0 };
        }
        // Intentamos parsear a número
        const val = parseFloat(String(rawValue).replace(',', '.'));
        if (!isNaN(val)) {
          dimensionMap[key].nominal = val;
        }
      }
      // 2) Tolerancia +
      else if (/^[A-Z]\+$/.test(key) || /^Ø\d+\+$/.test(key)) {
        // Sacamos la parte sin "+"
        const baseKey = key.replace(/\+$/, '');
        if (!dimensionMap[baseKey]) {
          dimensionMap[baseKey] = { code: baseKey, nominal: null, plus: 0, minus: 0 };
        }
        const val = parseFloat(String(rawValue).replace(',', '.'));
        if (!isNaN(val)) {
          dimensionMap[baseKey].plus = val;
        }
      }
      // 3) Tolerancia -
      else if (/^[A-Z]\-$/.test(key) || /^Ø\d+\-$/.test(key)) {
        // Sacamos la parte sin "-"
        const baseKey = key.replace(/\-$/, '');
        if (!dimensionMap[baseKey]) {
          dimensionMap[baseKey] = { code: baseKey, nominal: null, plus: 0, minus: 0 };
        }
        let val = parseFloat(String(rawValue).replace(',', '.'));
        if (isNaN(val)) val = 0;
        dimensionMap[baseKey].minus = Math.abs(val);
      }
      // Si no coincide con ninguno de esos patrones, ignoramos la columna
    }
    
    // Ahora convertimos dimensionMap en array, filtrando las cotas que tengan nominal válido
    const dimensionsResult = [];
    
    for (const dimKey of Object.keys(dimensionMap)) {
      const dimObj = dimensionMap[dimKey];
      // Chequear si nominal es un número y no es NaN
      if (dimObj.nominal === null || isNaN(dimObj.nominal)) {
        // No la consideramos
        continue;
      }
      // Creamos un objeto final
      dimensionsResult.push({
        code: dimObj.code,
        nominal: dimObj.nominal,
        tolerancePlus: dimObj.plus,
        toleranceMinus: dimObj.minus,
        // el usuario dijo "no llevan descripcion," podemos poner una cadena vacía
        description: ''
      });
    }
    
    return dimensionsResult;
    
  } catch (error) {
    console.error(`Error al obtener dimensiones para el componente ${componentCode}:`, error);
    return [];
  }
};

/**
 * Obtiene requisitos de recubrimiento para un tipo de protección.
 * Ajusta la lógica según tus propias necesidades.
 */
export const fetchCoatingRequirements = async (surfaceProtection, thickness, specialCoating) => {
  let requirements = {
    mean: 32,
    local: 22
  };
  
  if (surfaceProtection.includes('Z275')) {
    requirements = { mean: 20, local: 13 };
  } else if (surfaceProtection.includes('Z450')) {
    requirements = { mean: 32, local: 22 };
  } else if (surfaceProtection.includes('Z600')) {
    requirements = { mean: 42, local: 29 };
  } else if (surfaceProtection.includes('Z725')) {
    requirements = { mean: 51, local: 37 };
  } else if (surfaceProtection.includes('Z800')) {
    requirements = { mean: 56, local: 40 };
  } else if (surfaceProtection.includes('ISO1461')) {
    if (thickness) {
      const t = parseFloat(thickness);
      if (t < 1.5) requirements = { mean: 45, local: 35 };
      else if (t < 3) requirements = { mean: 55, local: 45 };
      else if (t < 6) requirements = { mean: 70, local: 55 };
      else requirements = { mean: 85, local: 70 };
    }
  } else if (surfaceProtection.includes('special coating')) {
    if (specialCoating) {
      requirements = { 
        mean: parseFloat(specialCoating), 
        local: Math.round(parseFloat(specialCoating) * 0.8) 
      };
    }
  }
  
  return requirements;
};
