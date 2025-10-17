# 🚀 Guía Rápida: Sincronización con Google Drive

## ¿Qué hace?

Ahora los usuarios de JapaVerbs pueden:
- ☁️ Guardar su progreso en Google Drive
- 📱 Acceder a su progreso desde cualquier dispositivo
- 🔄 Sincronizar automáticamente su avance
- 🛡️ Hacer backup de sus datos sin esfuerzo

## Para Empezar (3 Pasos)

### 1. Obtener Client ID de Google

Ve a [Google Cloud Console](https://console.cloud.google.com/) y:
1. Crea un proyecto nuevo
2. Habilita "Google Drive API"
3. Crea credenciales OAuth 2.0
4. Copia el **Client ID**

📖 **Guía detallada**: [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md)

### 2. Configurar Variables de Entorno

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env y pega tu Client ID
VITE_GOOGLE_CLIENT_ID=tu-client-id-aqui.apps.googleusercontent.com
```

### 3. Probar la Funcionalidad

```bash
# Inicia el servidor de desarrollo
npm run dev

# Ve a http://localhost:5173/perfil
# Busca la sección "Sincronización con Google Drive"
# Haz clic en "Iniciar sesión con Google"
```

## Cómo lo Usan los Usuarios

### Escenario 1: Primer Uso
1. Usuario va a su **Perfil**
2. Ve la sección **"Sincronización con Google Drive"**
3. Hace clic en **"Iniciar sesión con Google"**
4. Autoriza la aplicación
5. Hace clic en **"Guardar en Drive"**
6. ✅ ¡Listo! Su progreso está en la nube

### Escenario 2: Otro Dispositivo
1. Usuario abre JapaVerbs en otro dispositivo
2. Va a **Perfil** → **Sincronización**
3. Inicia sesión con Google
4. Hace clic en **"Cargar de Drive"**
5. ✅ Su progreso se restaura automáticamente

## Archivos Importantes

```
📁 Proyecto
├── 📄 .env.example              # Plantilla de configuración
├── 📄 GOOGLE_DRIVE_SETUP.md     # Guía completa paso a paso
├── 📄 FEATURE_GOOGLE_DRIVE_SYNC.md  # Documentación técnica
└── 📁 src/
    ├── 📁 lib/
    │   ├── 📁 components/
    │   │   └── GoogleDriveSync.svelte   # Componente UI
    │   ├── 📁 stores/
    │   │   └── userProgress.ts          # Store extendido
    │   └── 📁 utils/
    │       └── googleDrive.ts           # API de Google Drive
    └── 📁 routes/
        └── 📁 perfil/
            └── +page.svelte             # Página con sync integrado
```

## Despliegue en Producción

### Cloudflare Pages
1. Ve a tu dashboard de Cloudflare
2. **Settings** → **Environment variables**
3. Agrega: `VITE_GOOGLE_CLIENT_ID=tu-client-id`
4. Guarda y redeploy

### Vercel / Netlify
1. Ve a configuración del proyecto
2. Agrega variable de entorno: `VITE_GOOGLE_CLIENT_ID`
3. Redeploy

⚠️ **Importante**: En Google Cloud Console, agrega tu dominio de producción a "Authorized JavaScript origins"

## Seguridad

✅ **Lo que la app PUEDE hacer:**
- Crear y modificar archivos que ella misma crea
- Leer el progreso del usuario

❌ **Lo que la app NO PUEDE hacer:**
- Ver otros archivos en tu Drive
- Modificar archivos que no creó
- Acceder a información personal
- Compartir datos con terceros

## Solución Rápida de Problemas

| Problema | Solución |
|----------|----------|
| No aparece el botón de Google | Verifica que `.env` existe y tiene `VITE_GOOGLE_CLIENT_ID` |
| Error al iniciar sesión | Revisa que los JavaScript origins están configurados en Google Cloud |
| No se guarda el progreso | Verifica que la API de Drive está habilitada |

## Funcionalidad sin Google Drive

Si no configuras Google Drive, **la app sigue funcionando perfectamente**:
- El progreso se guarda en `localStorage` (navegador)
- Solo será local al dispositivo/navegador actual
- No habrá sincronización entre dispositivos

## Próximos Pasos

1. [ ] Configura Google Cloud Console
2. [ ] Agrega el Client ID a `.env`
3. [ ] Prueba en desarrollo
4. [ ] Configura variables en producción
5. [ ] ¡Disfruta de la sincronización!

## Soporte

- 📖 Guía completa: [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md)
- 🔧 Documentación técnica: [FEATURE_GOOGLE_DRIVE_SYNC.md](./FEATURE_GOOGLE_DRIVE_SYNC.md)
- 🐛 Problemas: Abre un issue en GitHub

---

**¡Tu progreso, en cualquier lugar!** ☁️📱💻
