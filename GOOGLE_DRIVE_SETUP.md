# 🔐 Configuración de Google Drive Sync

Esta guía te ayudará a configurar la sincronización con Google Drive para JapaVerbs.

## 📋 Resumen

La sincronización con Google Drive permite a los usuarios:
- ✅ Guardar su progreso en la nube
- ✅ Acceder a su progreso desde cualquier dispositivo
- ✅ Hacer backup automático de sus datos
- ✅ No perder progreso al cambiar de navegador o dispositivo

## 🚀 Configuración Paso a Paso

### 1. Crear un Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Dale un nombre como "JapaVerbs" o "JapaVerbs PWA"

### 2. Habilitar Google Drive API

1. En el menú lateral, ve a **APIs & Services** > **Library**
2. Busca "Google Drive API"
3. Haz clic en "Google Drive API" y luego en **Enable**

### 3. Configurar la Pantalla de Consentimiento OAuth

1. Ve a **APIs & Services** > **OAuth consent screen**
2. Selecciona **External** (para uso público) y haz clic en **Create**
3. Completa la información requerida:
   - **App name**: JapaVerbs
   - **User support email**: Tu email
   - **Developer contact information**: Tu email
4. En **Scopes**, agrega:
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/drive.appdata`
5. Guarda y continúa

### 4. Crear Credenciales OAuth 2.0

1. Ve a **APIs & Services** > **Credentials**
2. Haz clic en **Create Credentials** > **OAuth client ID**
3. Selecciona **Web application**
4. Configura:
   - **Name**: JapaVerbs Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:5173` (para desarrollo)
     - `https://japaverbs.pages.dev` (para producción)
     - Añade cualquier otro dominio donde hospedarás la app
   - **Authorized redirect URIs**: (No es necesario para JavaScript origins)
5. Haz clic en **Create**
6. **¡Importante!** Copia el **Client ID** que se muestra

### 5. Configurar Variables de Entorno

#### Desarrollo Local

1. Crea un archivo `.env` en la raíz del proyecto (copia de `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` y agrega tu Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=tu-client-id-aqui.apps.googleusercontent.com
   ```

#### Producción (Cloudflare Pages)

1. Ve a tu dashboard de Cloudflare Pages
2. Selecciona tu proyecto
3. Ve a **Settings** > **Environment variables**
4. Agrega una nueva variable:
   - **Variable name**: `VITE_GOOGLE_CLIENT_ID`
   - **Value**: Tu Client ID
   - **Environment**: Production (y Preview si quieres)
5. Guarda los cambios
6. Redeploy tu aplicación para aplicar los cambios

### 6. Verificar la Configuración

1. Inicia tu aplicación en desarrollo:
   ```bash
   npm run dev
   ```

2. Ve a la página de perfil: `http://localhost:5173/perfil`

3. Busca la sección "Sincronización con Google Drive"

4. Haz clic en "Iniciar sesión con Google"

5. Deberías ver la pantalla de autorización de Google

6. Acepta los permisos

7. ¡Listo! Ahora puedes sincronizar tu progreso

## 🔒 Seguridad y Privacidad

### ¿Qué datos se guardan?

La aplicación guarda un archivo JSON (`user-progress.json`) en una carpeta dedicada en el Drive del usuario que contiene:
- Nombre de usuario
- Nivel y XP
- Estadísticas de práctica
- Historial de verbos estudiados
- Racha y logros

### ¿Es seguro?

- ✅ Solo el usuario tiene acceso a sus datos
- ✅ Los datos se guardan en el Drive personal del usuario
- ✅ La app solo puede leer/escribir sus propios archivos
- ✅ OAuth 2.0 es el estándar de seguridad de Google
- ✅ No se almacenan credenciales en el código

### Permisos Solicitados

- `drive.file`: Permite crear y modificar archivos creados por la app
- `drive.appdata`: Permite almacenar datos en la carpeta de aplicación

Estos son los permisos mínimos necesarios. La app **NO** puede:
- ❌ Ver otros archivos en tu Drive
- ❌ Modificar archivos que no creó
- ❌ Acceder a tu información personal
- ❌ Compartir tus datos con terceros

## 🛠️ Solución de Problemas

### Error: "Google Identity Services not available"

**Causa**: El script de Google no se cargó correctamente.

**Solución**:
1. Verifica tu conexión a internet
2. Asegúrate de que no hay bloqueadores de scripts
3. Recarga la página

### Error: "Google Client ID not configured"

**Causa**: La variable de entorno no está configurada.

**Solución**:
1. Verifica que el archivo `.env` existe
2. Verifica que la variable `VITE_GOOGLE_CLIENT_ID` está configurada
3. Reinicia el servidor de desarrollo

### Error: "Failed to obtain access token"

**Causa**: Usuario canceló la autorización o hay un problema con las credenciales.

**Solución**:
1. Intenta nuevamente
2. Verifica que los JavaScript origins están correctamente configurados
3. Asegúrate de que la API de Drive está habilitada

### No aparece la opción de sincronización

**Causa**: La variable de entorno no está disponible en el navegador.

**Solución**:
1. Las variables de entorno en Vite deben empezar con `VITE_`
2. Reinicia el servidor después de crear/modificar el `.env`
3. Limpia el caché del navegador

## 📝 Uso

### Guardar Progreso

1. Ve a tu perfil
2. Haz clic en "Guardar en Drive"
3. Tu progreso se sincronizará automáticamente

### Cargar Progreso

1. En un dispositivo nuevo, inicia sesión con Google
2. Haz clic en "Cargar de Drive"
3. Si hay conflictos, se te preguntará qué versión mantener

### Sincronización Automática (Próximamente)

En futuras versiones, la app podría sincronizar automáticamente cada vez que:
- Completes una práctica
- Alcances un logro
- Cambies tu perfil

## 🚀 Despliegue en Producción

### Cloudflare Pages

1. La configuración ya está lista para Cloudflare Pages
2. Solo necesitas agregar la variable de entorno en el dashboard
3. Los JavaScript origins deben incluir tu dominio de producción

### Otros Hosting

Para otros servicios de hosting (Vercel, Netlify, etc.):
1. Agrega la variable de entorno `VITE_GOOGLE_CLIENT_ID`
2. Configura los JavaScript origins en Google Cloud Console
3. Asegúrate de que la app se construye correctamente

## 📚 Referencias

- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [Google Drive API](https://developers.google.com/drive/api/guides/about-sdk)
- [OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)

## 💡 Tips

1. **Desarrollo**: Usa un proyecto de Google separado para desarrollo y producción
2. **Testing**: Prueba en modo incógnito para simular nuevos usuarios
3. **Backup**: Los usuarios pueden descargar manualmente su `user-progress.json` desde Drive
4. **Migración**: Si cambias de proyecto, los usuarios necesitarán autorizar nuevamente

## 🤝 Soporte

Si tienes problemas con la configuración:
1. Revisa esta guía paso a paso
2. Verifica los logs de la consola del navegador
3. Abre un issue en GitHub con detalles del error

---

¡Listo! Ahora tus usuarios pueden sincronizar su progreso con Google Drive 🎉
