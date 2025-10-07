// migrateNCData.js - Script de migración única de datos NC
import XLSX from 'xlsx';
import { readFile } from 'fs/promises';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// ⚠️ IMPORTANTE: Reemplaza con tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDrSh_P2JjyOlveC1rkPS2_WBl2hY6E8ig",
  authDomain: "solarapp-12b70.firebaseapp.com",
  projectId: "solarapp-12b70",
  storageBucket: "solarapp-12b70.firebasestorage.app",
  messagingSenderId: "780419471456",
  appId: "1:780419471456:web:7fa3c5e1c01fbe1f6c8b05"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Tablas de conversión
const categoryToClass = {
  'NCP': 'major',
  'NCS': 'major',
  'NCI': 'minor',
  'NCC': 'critical',
  'NFC': 'major',
  'MP': 'minor',
  'tbd': 'minor'
};

const statusMapping = {
  'c': 'closed',
  'C': 'closed',
  'a': 'open',
  'p': 'in_progress',
  'canc': 'cancelled'
};

const detectionPhaseMapping = {
  'Production': 'production',
  'On site': 'on_site',
  'NC BY CLIENT': 'by_client',
  'Incoming goods ': 'incoming_goods',
  'Incoming goods': 'incoming_goods',
  'Installation': 'installation',
  'Malpractice': 'malpractice',
  'Logistics': 'logistics'
};

// Función para formatear fechas
const formatDate = (dateValue) => {
  if (!dateValue) return '';
  try {
    const date = new Date(dateValue);
    return date.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
};

// Función principal de migración
async function migrateNCData() {
  console.log('🚀 Iniciando migración de datos NC...\n');

  try {
    // 1. Leer el archivo Excel
    console.log('📖 Leyendo archivo Excel...');
    const fileBuffer = await readFile('./NC_Reg.xls.xlsx');
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`✅ Archivo leído: ${jsonData.length} registros encontrados\n`);

    // 2. Filtrar hasta NC #561
    const dataToMigrate = jsonData.filter(record => {
      const num = parseInt(record.Number);
      return num && num <= 561;
    });

    console.log(`📊 Registros a migrar: ${dataToMigrate.length}\n`);

    // 3. Procesar y subir cada registro
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < dataToMigrate.length; i++) {
      const record = dataToMigrate[i];
      
      try {
        // Transformar datos
        const ncData = {
          number: String(record.Number || ''),
          year: record.Year || new Date().getFullYear(),
          month: record.Month || '',
          status: statusMapping[record.Status] || 'open',
          ncIssuer: record['NC issuer (opening)'] || '',
          dateOfDetection: formatDate(record['Date of detection']),
          detectionPhase: detectionPhaseMapping[record['DETECTION PHASE']] || '',
          orderNumber: record['n° Order'] || '',
          projectCode: record['Project Code CM:'] || '',
          projectName: record['Project:'] || '',
          ncClass: categoryToClass[record['NC category']] || 'minor',
          accountable: record['Accountable'] || '',
          ncMainSubject: record['NC main subject'] || '',
          ncBriefSummary: record['NC brief summary&root cause'] || '',
          treatment: record['Treatment progress'] || '',
          dateOfClosure: formatDate(record['Date of treatment closure ']),
          rootCauseAnalysis: record['Root Cause Analysis'] || '',
          correctiveAction: record['Corrective Action'] || '',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        // Subir a Firebase
        await addDoc(collection(db, 'nc_registry'), ncData);
        
        successCount++;
        
        // Mostrar progreso cada 10 registros
        if ((i + 1) % 10 === 0) {
          console.log(`⏳ Progreso: ${i + 1}/${dataToMigrate.length} registros procesados...`);
        }

      } catch (error) {
        errorCount++;
        errors.push({
          nc: record.Number,
          error: error.message
        });
        console.error(`❌ Error en NC #${record.Number}: ${error.message}`);
      }
    }

    // 4. Mostrar resumen
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📊 Total procesados: ${dataToMigrate.length}`);
    
    if (errors.length > 0) {
      console.log('\n⚠️ Detalles de errores:');
      errors.forEach(err => {
        console.log(`  - NC #${err.nc}: ${err.error}`);
      });
    }

    console.log('\n🎉 Migración completada!\n');
    
    process.exit(0);

  } catch (error) {
    console.error('\n💥 Error fatal en la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateNCData();