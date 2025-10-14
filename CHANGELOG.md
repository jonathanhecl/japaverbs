# 📝 Changelog

## [2.0.0] - 2024-10-14

### 🎨 Rediseño Completo de UI

#### Agregado
- **Tema oscuro moderno**: Interfaz completamente rediseñada con colores slate/indigo/purple
- **Nueva página de inicio**: Hero section con estadísticas y características principales
- **Página "¿Por qué aprender verbos?"**: Contenido educativo sobre la importancia de los verbos
- **Navegación mejorada**: Barra de navegación sticky con tabs entre secciones
- **Gradientes y efectos**: Uso de gradientes de color y efectos de backdrop blur

#### Cambiado
- **Estructura de rutas**:
  - `/` - Página de inicio con bienvenida
  - `/por-que` - Página informativa
  - `/diccionario` - Diccionario completo (antes era la página principal)
- **VerbCard**: Rediseñado completamente con estilo oscuro y mejores efectos hover
- **Layout**: Nuevo layout con navegación global y footer
- **Colores del tema**: Actualizado manifest.json con colores oscuros (#0f172a)

#### Mejorado
- **Responsive design**: Mejor adaptación a móviles y tablets
- **Accesibilidad**: Mejores contrastes y navegación por teclado
- **Experiencia de usuario**: Flujo más intuitivo con páginas separadas

---

## [1.0.0] - 2024-10-13

### 🚀 Lanzamiento Inicial

#### Agregado
- Diccionario interactivo con 55 verbos JLPT N5
- Búsqueda por kanji, kana, romaji y significado
- Filtros por tipo de verbo (Godan, Ichidan, Irregular)
- Text-to-Speech con voz japonesa
- PWA instalable en móvil y desktop
- Ejemplos de uso para cada verbo
- Interfaz responsive con TailwindCSS
- Configuración para Cloudflare Pages
