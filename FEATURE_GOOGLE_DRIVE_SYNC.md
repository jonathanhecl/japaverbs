# ☁️ Google Drive Sync - Documentación de Implementación

## 📝 Resumen

Se ha implementado un sistema completo de sincronización con Google Drive que permite a los usuarios guardar y restaurar su progreso en la nube.

## ✨ Características Implementadas

### 1. **Autenticación con Google**
- Login/Logout con OAuth 2.0
- Gestión automática de tokens
- Verificación de estado de autenticación

### 2. **Sincronización Bidireccional**
- **Guardar en Drive**: Sube el progreso actual a Google Drive
- **Cargar desde Drive**: Descarga el progreso desde la nube
- **Detección de conflictos**: Alerta si el progreso local es más reciente

### 3. **Gestión Automática de Archivos**
- Crea automáticamente la carpeta "JapaVerbs" en Drive
- Guarda los datos en formato JSON
- Actualiza el archivo existente en lugar de duplicar

### 4. **UI Moderna e Intuitiva**
- Componente visual integrado en la página de perfil
- Estados de carga y mensajes de feedback
- Modal de confirmación para prevenir sobrescritura accidental

## 🏗️ Arquitectura

### Archivos Creados

```
src/
├── lib/
│   ├── components/
│   │   └── GoogleDriveSync.svelte       # Componente UI principal
│   ├── stores/
│   │   └── userProgress.ts              # Extendido con métodos sync
│   └── utils/
│       └── googleDrive.ts               # API wrapper para Google Drive
├── routes/
│   └── perfil/
│       └── +page.svelte                 # Integra el componente
.env.example                             # Plantilla de configuración
GOOGLE_DRIVE_SETUP.md                    # Guía de configuración
```

### Flujo de Datos

```
Usuario → GoogleDriveSync.svelte
    ↓
userProfile.syncWithDrive() / loadFromDrive()
    ↓
googleDrive.ts (API wrapper)
    ↓
Google Drive API v3
    ↓
Carpeta "JapaVerbs" / Archivo "user-progress.json"
```

## 🔧 API y Métodos

### `googleDrive.ts`

```typescript
// Inicialización
initGoogleDrive(): Promise<void>

// Autenticación
requestGoogleAuth(): Promise<string>
revokeGoogleAuth(): Promise<void>
isAuthenticated(): boolean

// Operaciones de datos
saveProgressToDrive(profile: UserProfile): Promise<void>
loadProgressFromDrive(): Promise<UserProfile | null>
deleteProgressFromDrive(): Promise<void>
```

### `userProgress.ts` (Métodos Nuevos)

```typescript
// Sincronización
syncWithDrive(): Promise<{ success: boolean; message: string }>
loadFromDrive(): Promise<{ success: boolean; message: string; data?: UserProfile }>
forceLoadFromDrive(): Promise<{ success: boolean; message: string }>
deleteFromDrive(): Promise<{ success: boolean; message: string }>

// Autenticación
googleDriveAuth.init()
googleDriveAuth.login()
googleDriveAuth.logout()
googleDriveAuth.isAuthenticated()
```

## 🎯 Casos de Uso

### Caso 1: Usuario Nuevo

1. Usuario instala la app en su teléfono
2. Estudia durante una semana
3. Va a "Perfil" → "Sincronización con Google Drive"
4. Inicia sesión con Google
5. Hace clic en "Guardar en Drive"
6. ✅ Su progreso está en la nube

### Caso 2: Cambio de Dispositivo

1. Usuario accede desde su laptop
2. Va a "Perfil" → "Sincronización con Google Drive"
3. Inicia sesión con su cuenta de Google
4. Hace clic en "Cargar de Drive"
5. ✅ Su progreso se restaura completamente

### Caso 3: Conflicto de Versiones

1. Usuario tiene progreso local del lunes
2. Intenta cargar progreso de Drive del domingo
3. 🛡️ El sistema detecta que el local es más reciente
4. Muestra un modal de confirmación
5. Usuario decide qué hacer (mantener local o sobrescribir)

## 🔐 Seguridad

### Permisos Mínimos
- `drive.file`: Solo archivos creados por la app
- `drive.appdata`: Datos de aplicación

### Almacenamiento de Tokens
- Tokens guardados en `localStorage`
- Expiración automática respetada
- Limpieza al hacer logout

### Datos Sensibles
- ✅ Client ID en variables de entorno
- ✅ No se hardcodean credenciales
- ✅ `.env` en `.gitignore`

## 📊 Estructura de Datos

### Archivo en Google Drive: `user-progress.json`

```json
{
  "name": "Usuario",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "level": 5,
  "xp": 450,
  "streak": 7,
  "lastStudyDate": "2025-01-15",
  "totalPractices": 50,
  "totalCorrect": 180,
  "totalQuestions": 200,
  "studiedVerbs": {
    "食べる": {
      "lastStudied": "2025-01-15",
      "timesReviewed": 10,
      "correctCount": 8,
      "incorrectCount": 2,
      "masteryScore": 4,
      "nextReviewDate": "2025-01-28"
    }
  },
  "dailyHistory": [...],
  "achievements": ["first_practice", "streak_7"]
}
```

## 🧪 Testing

### Pruebas Manuales Recomendadas

1. **Autenticación**
   - [ ] Login exitoso
   - [ ] Logout exitoso
   - [ ] Reautenticación con token expirado

2. **Guardar Datos**
   - [ ] Primera sincronización crea carpeta y archivo
   - [ ] Sincronizaciones posteriores actualizan archivo existente
   - [ ] Datos guardados correctamente en JSON

3. **Cargar Datos**
   - [ ] Carga exitosa desde Drive
   - [ ] Detección de conflictos funciona
   - [ ] Modal de confirmación se muestra correctamente
   - [ ] Sobrescritura forzada funciona

4. **UI/UX**
   - [ ] Estados de carga se muestran
   - [ ] Mensajes de error son claros
   - [ ] Mensajes de éxito se muestran
   - [ ] Componente responsive en móvil

## 🚀 Despliegue

### Variables de Entorno Requeridas

**Desarrollo Local** (`.env`):
```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Producción** (Cloudflare Pages, Vercel, Netlify):
```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Configuración en Google Cloud

1. Crear proyecto
2. Habilitar Google Drive API
3. Configurar OAuth consent screen
4. Crear credenciales OAuth 2.0 Client ID
5. Agregar JavaScript origins autorizados:
   - `http://localhost:5173` (dev)
   - `https://japaverbs.pages.dev` (prod)

Ver [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md) para guía completa.

## 📈 Mejoras Futuras

### Corto Plazo
- [ ] Sincronización automática después de cada práctica
- [ ] Indicador visual de última sincronización
- [ ] Opción de sincronización automática periódica

### Medio Plazo
- [ ] Historial de versiones (recuperar progreso antiguo)
- [ ] Exportar/Importar progreso como JSON
- [ ] Compartir logros en redes sociales

### Largo Plazo
- [ ] Sincronización entre múltiples usuarios (familias)
- [ ] Backup automático cada X días
- [ ] Migración a otros servicios cloud (Dropbox, OneDrive)

## 🐛 Problemas Conocidos

1. **Rate Limiting**: Google Drive tiene límites de API
   - **Mitigación**: No sincronizar más de 1 vez por minuto

2. **Tokens Expirados**: Token expira después de ~1 hora
   - **Mitigación**: Sistema de reautenticación automática

3. **Conflictos de Sincronización**: Múltiples dispositivos al mismo tiempo
   - **Mitigación**: Sistema de detección de conflictos implementado

## 💡 Consejos para Usuarios

1. **Sincroniza regularmente**: Haz backup de tu progreso cada semana
2. **Revisa conflictos**: Si aparece el modal, revisa bien antes de sobrescribir
3. **Múltiples dispositivos**: Carga siempre antes de estudiar, guarda después
4. **Privacidad**: Solo tú puedes ver tus archivos en Drive

## 📚 Referencias

- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [Google Drive API v3](https://developers.google.com/drive/api/v3/reference)
- [OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)

## ✅ Checklist de Implementación

- [x] API wrapper para Google Drive
- [x] Gestión de autenticación OAuth 2.0
- [x] Métodos de sincronización en store
- [x] Componente UI de sincronización
- [x] Integración en página de perfil
- [x] Detección de conflictos
- [x] Modal de confirmación
- [x] Variables de entorno
- [x] Documentación completa
- [x] Guía de configuración
- [x] Actualización del README

---

**Estado**: ✅ Implementación Completa

**Fecha**: Octubre 2025

**Autor**: JapaVerbs Team
