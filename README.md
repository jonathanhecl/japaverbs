# 🇯🇵 JapaVerbs

> PWA moderna para aprender verbos japoneses del nivel JLPT N5

[![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=flat&logo=svelte&logoColor=white)](https://kit.svelte.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## 🌍 Acceso a la Aplicación

### 🌐 Versión en Línea
Puedes acceder a la versión más reciente de JapaVerbs en:

[![Abrir JapaVerbs](https://img.shields.io/badge/🌐_Abrir_JapaVerbs-4F46E5?style=for-the-badge&logo=googlechrome&logoColor=white)](https://japaverbs.pages.dev/)

### 📥 Instalar como Aplicación
JapaVerbs es una PWA (Aplicación Web Progresiva) que puedes instalar en tu dispositivo:

#### 📱 En Móvil (Android/iOS)
1. Abre [japaverbs.pages.dev](https://japaverbs.pages.dev/) en Chrome o Safari
2. Toca el menú (⋮ o ⋯) y selecciona "Instalar" o "Añadir a pantalla de inicio"
3. Confirma la instalación
4. ¡Listo! La aplicación tendrá su propio ícono

#### 💻 En Escritorio (Windows/macOS/Linux)
1. Abre [japaverbs.pages.dev](https://japaverbs.pages.dev/) en Chrome o Edge
2. Haz clic en el botón de instalación en la barra de direcciones (⤴️ o ➕)
3. Sigue las instrucciones para completar la instalación
4. La aplicación se abrirá en su propia ventana

### 🚀 Características de la PWA
- Funciona sin conexión después de la primera carga
- Carga instantánea en visitas posteriores
- Interfaz nativa en tu dispositivo
- Notificaciones (próximamente)

## 🌟 Características

### MVP v1.0 (✅ Completado)

- **📚 Diccionario Interactivo**: 50 verbos esenciales JLPT N5
- **🔍 Búsqueda Inteligente**: Busca por kanji, kana, romaji o significado
- **🎯 Filtros por Tipo**: Godan, Ichidan, Irregular
- **🔊 Text-to-Speech**: Pronunciación nativa japonesa
- **📱 PWA**: Instalable en móvil y desktop
- **🎨 UI Moderna**: Diseño limpio con TailwindCSS
- **⚡ Rápida**: Construida con Vite y SvelteKit

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

La aplicación estará disponible en `http://localhost:5173`

## 📖 Contenido

### Verbos Incluidos (N5)

La aplicación incluye 50 verbos fundamentales del JLPT N5, clasificados en:

- **Godan (五段)**: ~30 verbos
- **Ichidan (一段)**: ~15 verbos  
- **Irregular (不規則)**: ~5 verbos

Cada verbo incluye:
- ✅ Kanji y kana
- ✅ Romanización (romaji)
- ✅ Traducción al español
- ✅ Tipo de verbo
- ✅ 2 ejemplos de uso con traducción
- ✅ Audio TTS

## 🎯 Filosofía de Aprendizaje

Este proyecto sigue un enfoque de **3 capas progresivas**:

### 1. 🧠 Conocimiento (✅ MVP)
Diccionario interactivo donde aprendes la forma, significado y uso básico de cada verbo.

### 2. 🎯 Reconocimiento (🔜 Próximamente)
Mini-tests para asociar verbos con traducción, identificar tipos y distinguir usos.

### 3. ⚙️ Aplicación (🔜 Próximamente)
Práctica con frases reales, detección de errores y uso correcto de partículas.

> **Objetivo**: Memoria de uso sólida, no repetición ciega.

## 📱 PWA

JapaVerbs es una Progressive Web App que puedes instalar en tu dispositivo:

1. Abre la app en tu navegador
2. Busca la opción "Instalar" o "Agregar a pantalla de inicio"
3. ¡Disfruta del acceso rápido como una app nativa!

## 🛠️ Tecnologías

- **Frontend**: SvelteKit 2.x (Svelte 5)
- **Estilos**: TailwindCSS 4.x
- **Lenguaje**: TypeScript 5.x
- **Build**: Vite 7.x
- **PWA**: Web App Manifest + Service Worker (próximamente)
- **TTS**: Web Speech API

## 📂 Estructura del Proyecto

```
japaverbs/
├── src/
│   ├── lib/
│   │   ├── components/     # Componentes Svelte
│   │   ├── data/           # Base de datos de verbos
│   │   ├── stores/         # Stores de Svelte
│   │   ├── types/          # Tipos TypeScript
│   │   └── utils/          # Utilidades (TTS, etc.)
│   └── routes/             # Páginas de la app
├── static/                 # Assets estáticos
└── PROJECT_NOTES.md        # Documentación detallada
```

## 🔮 Roadmap

### Fase 2: Práctica Básica (En desarrollo)
- [ ] Quiz de traducción verbo ↔ español
- [ ] Modo "Elige el verbo correcto"
- [ ] Sistema de puntuación

### Fase 3: Gramática Avanzada
- [ ] Identificación transitivo/intransitivo
- [ ] Quiz de tipos de verbos
- [ ] Explicaciones gramaticales

### Fase 4: Contexto Real
- [ ] Completar frases
- [ ] Detectar errores
- [ ] Práctica con partículas (を、に、で、へ、が)

### Fase 5: Clasificación Inteligente
- [ ] Filtros por frecuencia
- [ ] Filtros por tema
- [ ] Tags y categorías

### Fase 6: Gamificación
- [ ] Sistema de puntos y niveles
- [ ] Logros y badges
- [ ] Estadísticas personales
- [ ] Repetición espaciada (SRS)

## 📚 Recursos

- [Notas Completas del Proyecto](./PROJECT_NOTES.md) - Documentación exhaustiva
- [JLPT N5 Vocabulary List](https://jlptsensei.com/jlpt-n5-vocabulary-list/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres agregar verbos, mejorar ejemplos o añadir nuevas características:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Agregar Verbos

Los verbos se encuentran en `src/lib/data/verbs_n5.json`. Formato:

```json
{
  "kanji": "食べる",
  "kana": "たべる",
  "romaji": "taberu",
  "type": "ichidan",
  "meaning": "comer",
  "examples": [
    {
      "ja": "パンを食べます。",
      "es": "Como pan."
    }
  ]
}
```

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](./LICENSE) para más detalles.

## 🙏 Agradecimientos

- Comunidad de estudiantes de japonés
- [SvelteKit](https://kit.svelte.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [JLPT Resources](https://www.jlpt.jp/)

---

**Hecho con ❤️ para estudiantes de japonés**

¿Preguntas? Abre un [Issue](../../issues) o contacta al equipo.
