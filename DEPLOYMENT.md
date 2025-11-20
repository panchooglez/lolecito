# Despliegue en Vercel - Guía Paso a Paso

## Preparación Completada ✅

Tu proyecto ya está listo para desplegarse en Vercel con las siguientes configuraciones:

- ✅ `vercel.json` configurado para SPA routing
- ✅ `.gitignore` actualizado
- ✅ Build de producción verificado
- ✅ README.md completo con documentación

## Opción 1: Despliegue Automático con GitHub (Recomendado)

### Paso 1: Sube tu código a GitHub

```bash
# Inicializa git (si aún no lo has hecho)
cd c:/proyectos/lolecito/web
git init

# Agrega todos los archivos
git add .

# Crea tu primer commit
git commit -m "Initial commit - League of Legends Guide"

# Crea un repositorio en GitHub y luego:
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

### Paso 2: Conecta con Vercel

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta (puedes usar GitHub)
2. Haz clic en "Add New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Vite
5. **Configuración del proyecto:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
6. Haz clic en "Deploy"

¡Listo! Cada vez que hagas push a `main`, Vercel desplegará automáticamente.

## Opción 2: Despliegue Manual con Vercel CLI

```bash
# Instala Vercel CLI globalmente
npm install -g vercel

# Navega a tu proyecto
cd c:/proyectos/lolecito/web

# Despliega (primera vez)
vercel

# Sigue las instrucciones en pantalla:
# - Set up and deploy? Y
# - Which scope? (tu cuenta)
# - Link to existing project? N
# - What's your project's name? lol-guide (o el que prefieras)
# - In which directory is your code located? ./
# - Want to override the settings? N

# Para despliegues a producción
vercel --prod
```

## Verificación Post-Despliegue

Vercel te dará una URL como `https://tu-proyecto.vercel.app`

Verifica que funcionen:
- ✅ Página de inicio
- ✅ Lista de campeones
- ✅ Detalles de campeón (ej: /champions/Aatrox)
- ✅ Página de objetos
- ✅ Página de runas
- ✅ Navegación entre páginas

## Dominios Personalizados (Opcional)

1. En el dashboard de Vercel, ve a tu proyecto
2. Haz clic en "Settings" → "Domains"
3. Agrega tu dominio personalizado
4. Sigue las instrucciones para configurar los DNS

## Variables de Entorno (Si las necesitas)

Si en el futuro necesitas variables de entorno:

1. Ve a "Settings" → "Environment Variables"
2. Agrega las variables necesarias
3. Redespliega el proyecto

## Troubleshooting

### Error 404 en rutas
- ✅ Ya está solucionado con `vercel.json`

### Imágenes no cargan
- Las imágenes vienen del CDN de Riot, asegúrate de tener conexión

### Build falla
- Verifica que `npm run build` funcione localmente primero
- Revisa los logs en el dashboard de Vercel

## Comandos Útiles

```bash
# Ver tus deployments
vercel list

# Ver logs
vercel logs

# Remover deployment
vercel remove [deployment-url]
```

## Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Dashboard de Vercel](https://vercel.com/dashboard)
