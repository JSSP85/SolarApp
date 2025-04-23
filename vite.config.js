import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/SolarApp/', // URL base para despliegue en GitHub Pages
  server: {
    port: 3000, // Puerto para desarrollo local
    open: true, // Abre automáticamente el navegador al iniciar
  },
  build: {
    outDir: 'dist', // Directorio de salida para la compilación
    sourcemap: true, // Genera sourcemaps para depuración
    chunkSizeWarningLimit: 1000, // Límite de tamaño de chunks para advertencias
  },
  resolve: {
    alias: {
      '@': '/src', // Permite usar '@' como alias para la carpeta src
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'], // Optimiza estas dependencias
  }
})
