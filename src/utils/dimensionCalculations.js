// src/utils/dimensionCalculations.js

/**
 * Procesa los datos dimensionales desde el Excel para el componente seleccionado.
 * Se espera recibir un array con dos elementos:
 *  - [0]: fila de encabezados (array de strings) en orden exacto (como se leeron del Excel)
 *  - [1]: fila de datos para el componente seleccionado (array de valores)
 * Se iteran, a partir de la columna E (índice 4), hasta (máximo) 70 columnas.
 * Se interpreta un encabezado que:
 *   - Termina en "+" → tolerancia superior.
 *   - Termina en "-" → tolerancia inferior.
 *   - Caso contrario, el encabezado se toma como valor nominal.
 *
 * @param {Array} sheetRows - Array de dos elementos: [headerRow, dataRow]
 * @returns {Array} - Array de objetos dimensión con valores procesados.
 */
export function processDimensionsFromExcel(sheetRows) {
  if (!sheetRows || sheetRows.length < 2) {
    console.warn("No se proporcionaron suficientes datos (encabezado y fila de datos).");
    return [];
  }

  const headerRow = sheetRows[0];
  const dataRow = sheetRows[1];

  const dimensions = [];
  const maxColumnsToCheck = Math.min(headerRow.length, 4 + 70); // desde columna E (índice 4)

  // Función auxiliar para obtener la descripción (puedes personalizarla)
  const getDescriptionForDimension = (dimCode) => {
    const descriptions = {
      'A': 'Longitud',
      'B': 'Anchura',
      'C': 'Altura',
      'D': 'Espesor'
      // Puedes agregar más si lo necesitas.
    };
    // Si el código comienza con "Ø", interpretamos como diámetro.
    if (dimCode.startsWith('Ø')) {
      return `Diámetro ${dimCode.substring(1)}`;
    }
    return descriptions[dimCode] || `Cota ${dimCode}`;
  };

  // Recorremos las columnas desde la 5ª (índice 4) hasta el máximo definido.
  for (let col = 4; col < maxColumnsToCheck; col++) {
    let header = headerRow[col];
    if (!header || typeof header !== 'string' || header.trim() === "") continue;
    header = header.trim();
    let type = "nominal"; // por defecto es valor nominal.
    let base = header;
    
    if (header.endsWith('+')) {
      type = "tolerancePlus";
      base = header.slice(0, -1).trim();
    } else if (header.endsWith('-')) {
      type = "toleranceMinus";
      base = header.slice(0, -1).trim();
    } else {
      type = "nominal";
      base = header;
    }
    
    // Buscamos si ya existe una entrada para la cota (base)
    let dimensionObj = dimensions.find(dim => dim.code === base);
    if (!dimensionObj) {
      // Crear objeto cota con valores por defecto
      dimensionObj = {
        code: base,
        nominal: 0,
        tolerancePlus: 0,
        toleranceMinus: 0,
        description: getDescriptionForDimension(base)
      };
      dimensions.push(dimensionObj);
    }
    
    // Intentamos parsear el valor de la celda como número
    const cellValue = dataRow[col];
    const numValue = parseFloat(String(cellValue).replace(',', '.')) || 0;
    
    if (type === "nominal") {
      dimensionObj.nominal = numValue;
    } else if (type === "tolerancePlus") {
      dimensionObj.tolerancePlus = numValue;
    } else if (type === "toleranceMinus") {
      // Aseguramos que sea valor absoluto
      dimensionObj.toleranceMinus = Math.abs(numValue);
    }
  }
  
  // Depuración
  dimensions.forEach(dim => {
    console.log(`Dimensión procesada: ${dim.code} = ${dim.nominal} [+${dim.tolerancePlus}, -${dim.toleranceMinus}]`);
  });
  
  return dimensions;
}

/**
 * Verifica si un valor dimensional está dentro de las tolerancias.
 * @param {Object} dimension - Objeto con información de la dimensión.
 * @param {number|string} value - Valor de la medición.
 * @returns {boolean} - Verdadero si el valor está dentro de tolerancias, false en caso contrario.
 */
export function isDimensionValueValid(dimension, value) {
  if (!dimension || value === undefined || value === null || value === "") {
    return true; // Considera vacío como "no medido", por lo tanto, no se reporta error.
  }
  
  const numValue = parseFloat(String(value).replace(',', '.'));
  if (isNaN(numValue)) return false;
  
  const min = dimension.nominal - dimension.toleranceMinus;
  const max = dimension.nominal + dimension.tolerancePlus;
  
  return numValue >= min && numValue <= max;
}

/**
 * Cuenta las no conformidades en un conjunto de mediciones dimensionales.
 * @param {Array} measurements - Array de mediciones.
 * @param {Object} dimension - Objeto con la información de la dimensión y sus tolerancias.
 * @returns {number} - Número de mediciones fuera de tolerancia.
 */
export function countNonConformities(measurements, dimension) {
  if (!measurements || !dimension) return 0;
  
  let count = 0;
  measurements.forEach(value => {
    if (value !== undefined && value !== null && value !== "") {
      if (!isDimensionValueValid(dimension, value)) {
        count++;
      }
    }
  });
  return count;
}

/**
 * Devuelve una clase CSS según el estado de la medición.
 * @param {Object} dimension - Objeto con información de la dimensión.
 * @param {number|string} value - Valor de la medición.
 * @returns {string} - Clase CSS para aplicar.
 */
export function getDimensionStatusClass(dimension, value) {
  if (!value || value === "") return 'bg-gray-200';
  return isDimensionValueValid(dimension, value) ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
}
