# League of Legends Guide

Una aplicación web moderna para explorar campeones, objetos y runas de League of Legends. Construida con React, TypeScript y Vite.

## 🚀 Características

- **Campeones**: Explora todos los campeones con información detallada sobre sus habilidades, estadísticas, builds recomendadas y consejos de juego
- **Objetos**: Navega por todos los objetos del juego organizados por categorías (Iniciales, Botas, Básicos, Épicos, Legendarios)
- **Runas**: Visualiza todos los árboles de runas con descripciones detalladas
- **Diseño Premium**: Interfaz moderna con glassmorphism, gradientes y animaciones suaves
- **Tooltips Inteligentes**: Descripciones emergentes que se adaptan a los bordes de la pantalla

## 📋 Requisitos

- Node.js 18+
- npm o yarn

## 🛠️ Instalación Local

```bash
# Clona el repositorio
git clone <tu-repo-url>
cd web

# Instala las dependencias
npm install

# Ejecuta el servidor de desarrollo
npm run dev

# Compila para producción
npm run build

# Previsualiza la build de producción
npm run preview
```

## 🌐 Despliegue en Vercel

Este proyecto está optimizado para desplegarse en Vercel:

1. **Método Automático** (Recomendado):
   - Conecta tu repositorio de GitHub a Vercel
   - Vercel detectará automáticamente que es un proyecto Vite
   - El despliegue se hará automáticamente con cada push

2. **Método Manual**:
   ```bash
   # Instala Vercel CLI
   npm install -g vercel

   # Despliega
   vercel
   ```

### Configuración de Vercel

El proyecto incluye un archivo `vercel.json` que configura automáticamente:
- Rewrites para SPA routing
- Optimización de builds
- Configuración de headers

## 📁 Estructura del Proyecto

```
web/
├── public/
│   └── data/           # JSON data de campeones, objetos y runas
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/         # Páginas de la aplicación
│   ├── services/      # Servicios de datos
│   ├── types/         # Definiciones TypeScript
│   └── index.css      # Estilos globales
├── vercel.json        # Configuración de Vercel
└── package.json
```

## 🎨 Tecnologías Utilizadas

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **React Router** - Routing
- **CSS Modules** - Styling

## 📝 Notas de Desarrollo

- Los datos son cargados desde archivos JSON estáticos en `/public/data/`
- Las imágenes se cargan desde el CDN de Riot Games (ddragon.leagueoflegends.com)
- El proyecto usa variables CSS para temas consistentes

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

## 📄 Licencia

Este proyecto es solo para fines educativos. League of Legends y todos los assets relacionados son propiedad de Riot Games.
