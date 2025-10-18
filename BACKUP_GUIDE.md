# 💾 Guía de Backup - JapaVerbs

Esta guía explica cómo hacer backup de tu progreso en JapaVerbs y transferirlo entre dispositivos.

## 📋 Resumen

El sistema de backup de JapaVerbs te permite:
- ✅ Descargar tu progreso como archivo JSON
- ✅ Guardar el archivo donde prefieras (nube, USB, email, etc.)
- ✅ Cargar tu progreso en cualquier dispositivo
- ✅ Transferir datos entre navegadores o computadoras
- ✅ Mantener copias de seguridad de tu progreso

## 🚀 Cómo Usar

### Descargar tu Progreso

1. Ve a tu **Perfil** en JapaVerbs
2. Busca la sección **"Backup de Progreso"**
3. Haz clic en **"Descargar backup"**
4. Se descargará un archivo llamado `japaverbs-backup-YYYY-MM-DD.json`
5. Guarda este archivo en un lugar seguro

### Cargar tu Progreso

1. Ve a tu **Perfil** en JapaVerbs (en el dispositivo donde quieres restaurar)
2. Busca la sección **"Backup de Progreso"**
3. Haz clic en **"Cargar backup"**
4. Selecciona el archivo JSON que descargaste anteriormente
5. Confirma que quieres reemplazar tu progreso actual
6. ¡Listo! Tu progreso ha sido restaurado

## 📦 ¿Qué Datos se Guardan?

El archivo JSON contiene toda tu información de progreso:

- **Perfil**: Nombre, nivel, XP, racha
- **Estadísticas**: Total de prácticas, precisión, preguntas respondidas
- **Verbos estudiados**: Historial completo de cada verbo que has practicado
  - Veces revisado
  - Respuestas correctas e incorrectas
  - Puntuación de dominio (mastery score)
  - Fecha de próxima revisión
- **Historial diario**: Últimos 90 días de actividad
- **Logros**: Todos los logros desbloqueados

## 💡 Consejos y Mejores Prácticas

### Dónde Guardar tus Backups

Puedes guardar el archivo JSON en:
- ☁️ **Servicios de nube**: Google Drive, Dropbox, OneDrive, iCloud
- 📧 **Email**: Envíatelo a ti mismo como adjunto
- 💾 **USB/Disco externo**: Copia física de seguridad
- 📱 **Mensajería**: WhatsApp, Telegram (envíatelo a ti mismo)
- 🗂️ **Carpeta local**: En tu computadora (pero haz backup de esta carpeta)

### Frecuencia Recomendada

- **Uso casual**: Una vez al mes
- **Uso regular**: Una vez por semana
- **Uso intensivo**: Después de cada sesión importante
- **Antes de**: Cambiar de dispositivo, reinstalar navegador, limpiar datos

### Seguridad

- ✅ El archivo es solo texto JSON, no contiene contraseñas ni datos sensibles
- ✅ Puedes abrirlo con cualquier editor de texto para ver su contenido
- ✅ No se comparte automáticamente con nadie
- ✅ Tú controlas dónde y cómo guardarlo

## 🔄 Transferir entre Dispositivos

### Opción 1: Usando la Nube
1. Descarga backup en dispositivo A
2. Sube el archivo a tu servicio de nube favorito
3. Descarga el archivo en dispositivo B
4. Carga el backup en dispositivo B

### Opción 2: Usando Email
1. Descarga backup en dispositivo A
2. Envíate el archivo por email
3. Abre el email en dispositivo B
4. Descarga el adjunto
5. Carga el backup en dispositivo B

### Opción 3: Usando Mensajería
1. Descarga backup en dispositivo A
2. Envíate el archivo por WhatsApp/Telegram
3. Abre la app en dispositivo B
4. Descarga el archivo
5. Carga el backup en dispositivo B

## ⚠️ Advertencias Importantes

### Al Cargar un Backup

- ⚠️ **Tu progreso actual será reemplazado completamente**
- ⚠️ **Esta acción no se puede deshacer**
- ⚠️ **Asegúrate de tener un backup de tu progreso actual antes de cargar otro**

### Recomendaciones

1. Siempre descarga un backup de tu progreso actual antes de cargar otro
2. Verifica que el archivo JSON sea válido antes de cargarlo
3. No edites manualmente el archivo JSON a menos que sepas lo que haces
4. Mantén múltiples copias de tus backups importantes

## 🛠️ Solución de Problemas

### "Error al importar" o "Archivo JSON inválido"

**Causa**: El archivo está corrupto o no es un backup válido de JapaVerbs.

**Solución**:
1. Verifica que el archivo no esté dañado
2. Asegúrate de que sea un archivo `.json` descargado de JapaVerbs
3. No edites el archivo manualmente
4. Intenta con otro backup si tienes

### El backup no se descarga

**Causa**: Bloqueador de descargas o problema del navegador.

**Solución**:
1. Verifica que tu navegador permita descargas
2. Revisa si hay bloqueadores de pop-ups activos
3. Intenta en modo incógnito
4. Prueba con otro navegador

### El archivo descargado está vacío

**Causa**: No hay progreso guardado o error en la exportación.

**Solución**:
1. Verifica que tengas progreso guardado (practica al menos una vez)
2. Recarga la página e intenta de nuevo
3. Revisa la consola del navegador por errores

## 📱 Compatibilidad

El sistema de backup funciona en:
- ✅ Todos los navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Dispositivos móviles (iOS, Android)
- ✅ Tablets
- ✅ Computadoras (Windows, Mac, Linux)

## 🔐 Privacidad

- Tu progreso se guarda **solo en tu dispositivo** (localStorage del navegador)
- Los backups son **archivos locales** que tú controlas
- **No se envía ningún dato** a servidores externos
- **No hay cuentas** ni autenticación requerida
- **Tú decides** dónde y cómo guardar tus backups

## 📚 Formato del Archivo

El archivo JSON tiene esta estructura básica:

```json
{
  "name": "Tu nombre",
  "level": 5,
  "xp": 450,
  "streak": 7,
  "totalPractices": 42,
  "studiedVerbs": {
    "食べる": {
      "timesReviewed": 10,
      "correctCount": 8,
      "incorrectCount": 2,
      "masteryScore": 3
    }
  },
  "dailyHistory": [...],
  "achievements": [...]
}
```

## 🆘 Soporte

Si tienes problemas:
1. Lee esta guía completa
2. Verifica la consola del navegador (F12) por errores
3. Intenta en otro navegador
4. Abre un issue en GitHub con detalles del problema

---

**¡Importante!** Recuerda hacer backups regulares de tu progreso para no perder tu esfuerzo. 🎯
