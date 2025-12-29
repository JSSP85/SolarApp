# 📱 Plan de Implementación - Valmont Warehouse Mobile App

## 🎯 Objetivo
Crear una app Android React Native con Expo para que operarios del depósito puedan:
- Escanear códigos QR de componentes
- Ver información del inventario
- Registrar conteos físicos (ajustes de inventario)
- Sincronizar en tiempo real con la webapp

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
```
📱 Frontend: React Native + Expo SDK 50+
🔐 Auth: Firebase Authentication (compartido con webapp)
💾 Database: Firebase Firestore (misma DB que webapp)
📦 Offline Storage: AsyncStorage + Queue System
📷 QR Scanner: expo-camera + expo-barcode-scanner
🌍 i18n: react-i18next (Inglés/Italiano)
🎨 UI: React Native Paper + Custom Valmont Theme
📦 Build: Expo EAS Build
```

### Colores Corporativos Valmont
```javascript
colors: {
  primary: '#0077A2',      // Azul Valmont principal
  primaryDark: '#005F83',  // Azul oscuro
  primaryLight: '#0090C6', // Azul claro
  accent: '#10b981',       // Verde para success
  warning: '#f59e0b',      // Naranja para warnings
  error: '#ef4444',        // Rojo para errores
  background: '#f9fafb',   // Gris claro fondo
  surface: '#ffffff',      // Blanco
  text: '#1f2937',         // Texto principal
  textSecondary: '#6b7280' // Texto secundario
}
```

---

## 📂 Estructura del Proyecto

```
warehouse-mobile/
├── app.json                      # Configuración Expo
├── package.json
├── babel.config.js
├── App.js                        # Entry point
│
├── src/
│   ├── config/
│   │   ├── firebase.js           # Config Firebase (compartido)
│   │   ├── theme.js              # Tema Valmont
│   │   └── constants.js          # Constantes
│   │
│   ├── i18n/
│   │   ├── index.js              # Setup i18next
│   │   ├── en.json               # Traducciones inglés
│   │   └── it.json               # Traducciones italiano
│   │
│   ├── services/
│   │   ├── authService.js        # Autenticación
│   │   ├── warehouseService.js   # CRUD inventario
│   │   ├── offlineService.js     # Sistema offline
│   │   └── syncService.js        # Sincronización
│   │
│   ├── screens/
│   │   ├── SplashScreen.js       # Logo + carga inicial
│   │   ├── LoginScreen.js        # Login operario
│   │   ├── DashboardScreen.js    # Lista inventario
│   │   ├── ScannerScreen.js      # Escáner QR
│   │   ├── ArticleDetailScreen.js # Detalle + conteo
│   │   └── SettingsScreen.js     # Idioma + logout
│   │
│   ├── components/
│   │   ├── ArticleCard.js        # Card de artículo
│   │   ├── StatsHeader.js        # Estadísticas header
│   │   ├── OfflineIndicator.js   # Indicador sin conexión
│   │   ├── SyncStatus.js         # Estado sincronización
│   │   └── LanguageSelector.js   # Selector idioma
│   │
│   ├── navigation/
│   │   └── AppNavigator.js       # React Navigation
│   │
│   ├── hooks/
│   │   ├── useOffline.js         # Hook offline status
│   │   └── useFirestore.js       # Hook Firestore real-time
│   │
│   └── assets/
│       ├── logo.png              # Logo Valmont
│       └── icons/                # Iconos personalizados
│
└── README.md
```

---

## 🔄 Flujo de Usuario

### 1. Login
```
[Splash Screen con Logo Valmont]
         ↓
[Login Screen]
- Email
- Password
- Selector de idioma (🇬🇧/🇮🇹)
         ↓
[Autenticación Firebase]
         ↓
[Dashboard]
```

### 2. Dashboard Principal
```
┌─────────────────────────────────────┐
│  🏢 Valmont Warehouse              │
│  👤 Operatore: Giovanni            │
│  📊 Articoli: 1,245 | 🔄 Sync: ✓   │
├─────────────────────────────────────┤
│  🔍 [Search bar...]                │
│  📁 Categories: [All ▼]            │
├─────────────────────────────────────┤
│  📦 ART-001 | Solar Panel 100W     │
│     Stock: 45 | SAP: 50            │
│  ────────────────────────────────   │
│  📦 ART-002 | Inverter 5kW         │
│     Stock: 12 | SAP: 15            │
├─────────────────────────────────────┤
│  [🎯 Scan QR]  [⚙️ Settings]      │
└─────────────────────────────────────┘
```

### 3. Escáner QR
```
[Camera View con overlay]
- Guías para alinear QR
- Botón para activar flash
- Feedback visual al escanear
         ↓
[QR detectado] → Vibración + Sonido
         ↓
[Article Detail Screen]
```

### 4. Registro de Conteo
```
┌─────────────────────────────────────┐
│  ← Volver                           │
│                                     │
│  📦 ART-001                         │
│  Solar Panel 100W                   │
│  Category: Solar Panels             │
├─────────────────────────────────────┤
│  📊 Información Actual:             │
│  ├─ SAP Stock: 50                  │
│  ├─ Movimientos: -5                │
│  └─ Stock Actual: 45               │
├─────────────────────────────────────┤
│  ✏️ Conteo Físico:                  │
│  ┌───────────────────────┐         │
│  │  [ 43 ]               │  ← Input│
│  └───────────────────────┘         │
│  Diferencia: -2 ⚠️                 │
├─────────────────────────────────────┤
│  💬 Comentarios (opcional):         │
│  ┌───────────────────────┐         │
│  │  Encontrado en sector B│         │
│  └───────────────────────┘         │
├─────────────────────────────────────┤
│  [✓ CONFIRMAR CONTEO]              │
└─────────────────────────────────────┘
```

### 5. Post-Confirmación
```
[Guardando...]
         ↓
[✓ Conteo registrado]
         ↓
Si hay conexión:
  → Sincroniza inmediatamente
  → Actualiza Firebase
  → Visible en webapp en tiempo real
         ↓
Si NO hay conexión:
  → Guarda en queue local
  → Muestra indicador "Pendiente sync"
  → Sincroniza cuando vuelva conexión
         ↓
[Volver automático a Scanner Screen]
```

---

## 💾 Sistema Offline - Arquitectura

### Storage Local (AsyncStorage)
```javascript
// Estructura de datos offline
{
  "pending_movements": [
    {
      "id": "TEMP-1234567890",
      "codice_articolo": "ART-001",
      "tipo": "AGGIUSTAMENTO",
      "quantita_conteo": 43,
      "quantita_ajuste": -2,
      "comentario": "Encontrado en sector B",
      "operatore": "giovanni@valmont.com",
      "timestamp": "2025-12-23T18:00:00Z",
      "synced": false
    }
  ],
  "cached_articles": [...], // Cache del inventario
  "last_sync": "2025-12-23T17:00:00Z"
}
```

### Queue de Sincronización
```
┌─────────────────────────────────────┐
│  1. Operario registra conteo       │
│     → Guarda local (AsyncStorage)  │
│     → Marca como pending           │
├─────────────────────────────────────┤
│  2. Monitor de conexión detecta    │
│     internet disponible            │
├─────────────────────────────────────┤
│  3. SyncService procesa queue:     │
│     FOR EACH pending_movement:     │
│       → Intenta enviar a Firebase  │
│       → Si OK: marca synced=true   │
│       → Si FAIL: mantiene en queue │
├─────────────────────────────────────┤
│  4. Limpia movimientos sincronizados│
└─────────────────────────────────────┘
```

---

## 🔥 Integración Firebase

### Collections Firestore (ya existentes)
```javascript
// articoli/{codice}
{
  codice: "ART-001",
  descrizione: "Solar Panel 100W",
  categoria: "Solar Panels",
  giacenza_sap: 50,
  giacenza_attuale_magazino: 45,
  movimenti_totali: -5,
  giacenza_minima: 10,
  giacenza_massima: 100,
  unita_misura: "pz"
}

// movimenti/{id}
{
  id: "MOV-2025-12-23-123456",
  timestamp: Timestamp,
  codice_articolo: "ART-001",
  tipo: "AGGIUSTAMENTO",
  quantita: -2,  // Diferencia encontrada
  operatore: "giovanni@valmont.com",
  motivo: "Conteo físico - Encontrado en sector B",
  giacenza_precedente_magazino: 45,
  giacenza_nuova_magazino: 43,
  movimenti_totali_precedenti: -5,
  nuovi_movimenti_totali: -7,
  origen: "mobile_app"  // ← Nuevo campo para identificar
}
```

### Real-time Listeners
```javascript
// En la webapp (ya implementado)
onSnapshot(collection(db, 'movimenti'), (snapshot) => {
  // Se actualiza automáticamente cuando mobile app registra conteos
});

// En la mobile app
onSnapshot(collection(db, 'articoli'), (snapshot) => {
  // Se actualiza si alguien modifica desde webapp
});
```

---

## 🌍 Sistema de Idiomas (i18n)

### Archivo: src/i18n/en.json
```json
{
  "login": {
    "title": "Warehouse Login",
    "email": "Email",
    "password": "Password",
    "signIn": "Sign In",
    "error": "Invalid credentials"
  },
  "dashboard": {
    "title": "Warehouse",
    "search": "Search articles...",
    "allCategories": "All Categories",
    "stock": "Stock",
    "sapStock": "SAP Stock"
  },
  "scanner": {
    "title": "Scan QR Code",
    "instructions": "Align QR code within frame",
    "notFound": "Article not found"
  },
  "count": {
    "title": "Physical Count",
    "currentInfo": "Current Information",
    "physicalCount": "Physical Count",
    "difference": "Difference",
    "comments": "Comments (optional)",
    "confirm": "Confirm Count",
    "success": "Count registered successfully"
  }
}
```

### Archivo: src/i18n/it.json
```json
{
  "login": {
    "title": "Accesso Magazzino",
    "email": "Email",
    "password": "Password",
    "signIn": "Accedi",
    "error": "Credenziali non valide"
  },
  "dashboard": {
    "title": "Magazzino",
    "search": "Cerca articoli...",
    "allCategories": "Tutte le Categorie",
    "stock": "Giacenza",
    "sapStock": "Giacenza SAP"
  },
  "scanner": {
    "title": "Scansiona Codice QR",
    "instructions": "Allinea il codice QR nel riquadro",
    "notFound": "Articolo non trovato"
  },
  "count": {
    "title": "Conteggio Fisico",
    "currentInfo": "Informazioni Attuali",
    "physicalCount": "Conteggio Fisico",
    "difference": "Differenza",
    "comments": "Commenti (opzionale)",
    "confirm": "Conferma Conteggio",
    "success": "Conteggio registrato con successo"
  }
}
```

---

## 📦 Build y Distribución del APK

### 1. Build con Expo EAS
```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar proyecto
eas build:configure

# Build APK para Android
eas build --platform android --profile production
```

### 2. Descarga del APK
Expo genera un link de descarga que podemos agregar en la webapp:

**En webapp → Tools section:**
```jsx
<div className="wms-nav-item" onClick={() => downloadAPK()}>
  <span className="wms-nav-icon">📱</span>
  <span className="wms-nav-text">Download Mobile App</span>
</div>
```

### 3. Auto-update (OTA - Over The Air)
Expo permite actualizar la app SIN necesidad de descargar nuevo APK:
```bash
eas update --branch production
```
Los operarios recibirán updates automáticamente al abrir la app.

---

## 🚀 Timeline de Implementación

### Fase 1: Setup Base (2-3 horas)
- ✅ Crear proyecto Expo
- ✅ Configurar Firebase
- ✅ Setup i18n
- ✅ Configurar tema Valmont

### Fase 2: Autenticación (1-2 horas)
- ✅ Pantalla Login
- ✅ Integración Firebase Auth
- ✅ Persistencia de sesión

### Fase 3: Dashboard (2-3 horas)
- ✅ Lista de artículos
- ✅ Search y filters
- ✅ Real-time sync

### Fase 4: Scanner QR (2 horas)
- ✅ Implementar expo-camera
- ✅ Detección de QR
- ✅ Feedback visual/sonoro

### Fase 5: Registro de Conteo (3-4 horas)
- ✅ Pantalla de detalle
- ✅ Input de cantidad
- ✅ Cálculo de diferencias
- ✅ Registro en Firebase

### Fase 6: Sistema Offline (3-4 horas)
- ✅ AsyncStorage setup
- ✅ Queue de movimientos
- ✅ Auto-sync al reconectar
- ✅ Indicadores visuales

### Fase 7: Polish y Testing (2-3 horas)
- ✅ UX improvements
- ✅ Animaciones
- ✅ Testing offline mode
- ✅ Testing sincronización

### Fase 8: Build y Deploy (1-2 horas)
- ✅ Build APK
- ✅ Testing en dispositivo real
- ✅ Agregar link en webapp

**Total estimado: 16-23 horas de desarrollo**

---

## 🎨 Mockups de Pantallas

### Login Screen
```
┌─────────────────────────────┐
│                             │
│       [Logo Valmont]        │
│                             │
│    Warehouse Management     │
│                             │
│  ┌───────────────────────┐ │
│  │ 📧 Email              │ │
│  └───────────────────────┘ │
│                             │
│  ┌───────────────────────┐ │
│  │ 🔒 Password           │ │
│  └───────────────────────┘ │
│                             │
│  ┌───────────────────────┐ │
│  │    SIGN IN           │ │
│  └───────────────────────┘ │
│                             │
│  Language: [🇬🇧 EN ▼]      │
│                             │
└─────────────────────────────┘
```

### Scanner Screen
```
┌─────────────────────────────┐
│  ← Back                     │
│                             │
│  ┌─────────────────────┐   │
│  │                     │   │
│  │   ┌───────────┐     │   │
│  │   │           │     │   │
│  │   │   [QR]    │     │   │
│  │   │           │     │   │
│  │   └───────────┘     │   │
│  │                     │   │
│  └─────────────────────┘   │
│                             │
│  Align QR code within frame│
│                             │
│         [💡 Flash]          │
│                             │
└─────────────────────────────┘
```

---

## 🔐 Seguridad

### Autenticación
- Login obligatorio antes de usar la app
- Token JWT de Firebase Auth
- Sesión persistente con AsyncStorage (seguro)

### Permisos Firebase
```javascript
// Firestore Rules (ya existentes)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /articoli/{articolo} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /movimenti/{movimento} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

---

## ✅ Checklist Final Antes de Deploy

- [ ] Testing en dispositivo Android real
- [ ] Modo offline funciona correctamente
- [ ] Scanner QR detecta códigos
- [ ] Sincronización en tiempo real funciona
- [ ] Idiomas inglés/italiano completos
- [ ] Logo Valmont visible
- [ ] Colores corporativos aplicados
- [ ] APK firmado y funcionando
- [ ] Link de descarga en webapp activo
- [ ] Documentación para operarios lista

---

## 📞 Próximos Pasos

1. ✅ **Aprobar este plan**
2. ✅ **Comenzar implementación** (Fase 1)
3. ✅ **Testing progresivo** después de cada fase
4. ✅ **Deploy final** con APK en webapp

---

**¿Aprobamos este plan y comenzamos con la implementación?** 🚀
