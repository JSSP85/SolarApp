# Fix para Error "Activity is not defined" en Movement Registry

## 🔴 Problema
Al abrir la sección "Movement Registry" en Warehouse Management System, aparece el error:
```
Uncaught ReferenceError: Activity is not defined
```

## 🔍 Causa
El paquete `lucide-react` (que contiene el icono Activity) está listado en `package.json` pero **no está instalado** en `node_modules` del ambiente de ejecución.

## ✅ Solución

### 🚀 PARA TU FLUJO DE TRABAJO (GitHub Codespaces → Netlify):

**OPCIÓN 1: Clear Cache and Deploy (RECOMENDADO)**

1. Ve a **Netlify Dashboard** (https://app.netlify.com)
2. Selecciona tu sitio "SolarApp"
3. Ve a **Deploys** en el menú lateral
4. Haz clic en **"Trigger deploy"** (botón verde)
5. Selecciona **"Clear cache and deploy site"**

Esto forzará a Netlify a:
- Limpiar el cache de `node_modules`
- Reinstalar todas las dependencias desde cero
- Construir la aplicación con las dependencias correctas

**OPCIÓN 2: Desde GitHub Codespaces**

Si la Opción 1 no funciona, haz un commit dummy para forzar rebuild:

```bash
# En tu Codespace
echo "# $(date)" >> .netlify-rebuild
git add .netlify-rebuild
git commit -m "Force Netlify rebuild to fix dependencies"
git push
```

Netlify detectará el push y hará un nuevo build.

---

### Si ejecutas la aplicación LOCALMENTE (en tu PC):

1. **Elimina node_modules y reinstala dependencias:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Para desarrollo:**
   ```bash
   npm run dev
   ```

3. **Para producción:**
   ```bash
   npm run build
   npm run preview
   ```

---

### Si la aplicación está DESPLEGADA en otros servidores:

#### Para Vercel:
1. Ve a tu proyecto en Vercel Dashboard
2. Haz clic en "Redeploy" (esto forzará una reinstalación de dependencias)

#### Para Firebase Hosting:
```bash
npm install
npm run build
firebase deploy
```

#### Para servidor propio:
```bash
# En el servidor
cd /ruta/a/SolarApp
rm -rf node_modules package-lock.json
npm install
npm run build
# Reinicia tu servidor/servicio
```

## 📋 Verificación

Después de aplicar la solución, verifica:
1. ✅ `node_modules/lucide-react` existe
2. ✅ No hay errores en la consola del navegador
3. ✅ Movement Registry se abre correctamente
4. ✅ Los iconos se muestran correctamente

## 🔧 Scripts Disponibles

```bash
npm install          # Instala todas las dependencias
npm run dev         # Inicia servidor de desarrollo (puerto 5173)
npm run build       # Construye para producción
npm run preview     # Preview del build de producción
npm run lint        # Ejecuta el linter
```

## 📦 Dependencias Principales

- `lucide-react@0.479.0` - Librería de iconos (contiene Activity)
- `react@19.0.0`
- `vite@6.2.0`
- `firebase@11.7.1`

## ❓ ¿Dónde está desplegada tu aplicación?

Si sigues teniendo problemas, indica:
- ¿Ejecutas la app localmente o está desplegada?
- ¿Qué servicio de hosting usas? (Vercel, Netlify, Firebase, servidor propio, etc.)
- ¿Tienes acceso al servidor/ambiente donde corre?
