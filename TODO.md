# 📝 TODO - Tareas Pendientes

## 🚀 Fase 2: Sistema de Práctica (PRÓXIMA)

### Quiz Básico
- [ ] Crear componente `QuizCard.svelte`
- [ ] Crear componente `QuizQuestion.svelte`
- [ ] Crear página `/practice/basic`
- [ ] Implementar generador de preguntas aleatorias
- [ ] Sistema de respuestas múltiples (4 opciones)
- [ ] Feedback visual (✅ correcto / ❌ incorrecto)
- [ ] Explicación de respuestas incorrectas

### Modos de Quiz
- [ ] **Modo 1**: Verbo → Traducción
  - Mostrar verbo en kanji/kana
  - Elegir traducción correcta en español
  
- [ ] **Modo 2**: Traducción → Verbo
  - Mostrar palabra en español
  - Elegir verbo correcto en japonés
  
- [ ] **Modo 3**: Identificar tipo
  - Mostrar verbo
  - Identificar si es Godan/Ichidan/Irregular

### Sistema de Puntuación
- [ ] Contador de respuestas correctas/incorrectas
- [ ] Porcentaje de aciertos
- [ ] Racha de respuestas correctas
- [ ] Guardar estadísticas en localStorage

### Navegación
- [ ] Agregar botón "Practicar" en header
- [ ] Crear menú de navegación
- [ ] Breadcrumbs para navegación

## 📚 Fase 3: Gramática Avanzada

### Transitividad
- [ ] Agregar campo `transitivity` a todos los verbos en JSON
- [ ] Actualizar tipo `Verb` en TypeScript
- [ ] Badge visual en VerbCard para transitividad
- [ ] Crear quiz de transitividad
- [ ] Agregar explicaciones sobre transitivo/intransitivo
- [ ] Ejemplos contrastivos (開ける vs 開く)

### Filtros Adicionales
- [ ] Filtro por transitividad
- [ ] Actualizar UI de filtros

### Explicaciones
- [ ] Crear componente `GrammarExplanation.svelte`
- [ ] Popup o modal con explicaciones
- [ ] Ejemplos visuales de diferencias

## 🎯 Fase 4: Contexto y Frases

### Base de Datos de Frases
- [ ] Crear `phrases_practice.json`
- [ ] Mínimo 50 frases incompletas
- [ ] Mínimo 30 frases con errores comunes

### Ejercicios
- [ ] **Completar la frase**: 朝ごはんを（　）
- [ ] **Correcto/Incorrecto**: 車を乗る → 車に乗る
- [ ] **Elegir partícula correcta**: を、に、で、へ、が
- [ ] Explicación de errores comunes

### Componentes
- [ ] Crear `FillInTheBlank.svelte`
- [ ] Crear `ErrorDetection.svelte`
- [ ] Crear `ParticleChoice.svelte`

## 🏷️ Fase 5: Clasificación Inteligente

### Metadatos Adicionales
- [ ] Agregar campo `frequency` (high/medium/low) a todos los verbos
- [ ] Agregar campo `tags` array
- [ ] Agregar campo `theme` (comida, movimiento, emociones, etc.)
- [ ] Actualizar JSON con nuevos campos

### Tags Sugeridos
- [ ] `#comida` - Verbos relacionados con comida
- [ ] `#movimiento` - Verbos de movimiento
- [ ] `#comunicación` - Verbos de hablar/escuchar
- [ ] `#diario` - Verbos de uso diario
- [ ] `#emociones` - Verbos de sentimientos
- [ ] `#trabajo` - Verbos de trabajo/estudio
- [ ] `#hogar` - Verbos del hogar

### Filtros Avanzados
- [ ] Filtro multi-select por tags
- [ ] Filtro por frecuencia de uso
- [ ] Filtro por tema
- [ ] Combinar múltiples filtros

### UI
- [ ] Página "Explorar por categorías"
- [ ] Vista de tarjetas por tema
- [ ] Sidebar con filtros avanzados

## 🎮 Fase 6: Gamificación

### Sistema de Puntos
- [ ] Definir sistema de puntos
  - 10 pts por respuesta correcta
  - 5 pts por verbo nuevo visto
  - 20 pts por quiz completado
- [ ] Store para puntos totales
- [ ] Visualización de puntos en header

### Niveles
- [ ] Definir niveles de usuario
  - Nivel 1: Principiante (0-100 pts)
  - Nivel 2: Aprendiz (100-300 pts)
  - Nivel 3: Intermedio (300-600 pts)
  - Nivel 4: Avanzado (600-1000 pts)
  - Nivel 5: Experto (1000+ pts)
- [ ] Barra de progreso de nivel
- [ ] Animación al subir de nivel

### Logros (Badges)
- [ ] Crear sistema de logros
- [ ] Diseñar badges visuales
- [ ] Logros sugeridos:
  - 🎓 "Primera lección" - Completa tu primera lección
  - 📚 "Lector ávido" - Estudia 10 verbos
  - 🎯 "Precisión perfecta" - 10 respuestas correctas seguidas
  - 🔥 "Racha de 7" - Estudia 7 días seguidos
  - 🏆 "Maestro Ichidan" - Domina todos los verbos Ichidan
  - ⚡ "Rayo" - Completa un quiz en menos de 1 minuto
  - 🌟 "Estrella N5" - Domina todos los verbos N5

### Estadísticas
- [ ] Página de estadísticas personales
- [ ] Verbos aprendidos / total
- [ ] Tasa de aciertos por tipo de verbo
- [ ] Racha actual y mejor racha
- [ ] Tiempo total de estudio
- [ ] Gráfico de progreso semanal

### Sistema SRS (Spaced Repetition)
- [ ] Implementar algoritmo SRS simple
- [ ] Priorizar verbos con más errores
- [ ] Calendario de repaso
- [ ] Notificaciones de repaso

### Daily Goals
- [ ] Meta diaria de verbos
- [ ] Recordatorios (notificaciones web)
- [ ] Streak counter

## 🔧 Mejoras Técnicas

### Performance
- [ ] Lazy loading de componentes
- [ ] Virtual scrolling para lista de verbos
- [ ] Optimizar bundle size
- [ ] Code splitting por rutas

### PWA Avanzada
- [ ] Implementar service worker con cache
- [ ] Modo offline completo
- [ ] Background sync
- [ ] Push notifications para recordatorios

### Testing
- [ ] Setup Vitest
- [ ] Tests unitarios para componentes
- [ ] Tests para utilidades (TTS, filtros)
- [ ] Setup Playwright
- [ ] Tests E2E para flujos principales

### CI/CD
- [ ] GitHub Actions workflow
- [ ] Auto-deploy a Vercel/Netlify
- [ ] Lighthouse CI
- [ ] Auto-format y lint en PRs

### Accesibilidad
- [ ] Revisar ARIA labels
- [ ] Navegación por teclado
- [ ] Contraste de colores (WCAG AA)
- [ ] Screen reader testing

## 🎨 UI/UX Improvements

### Features
- [ ] Dark mode / Light mode toggle
- [ ] Ajustar velocidad de TTS
- [ ] Favoritos / Bookmarks
- [ ] Compartir verbos en redes sociales
- [ ] Imprimir lista de verbos
- [ ] Exportar progreso como CSV/JSON

### Animations
- [ ] Animación de entrada para tarjetas
- [ ] Transiciones suaves entre páginas
- [ ] Confetti al completar quiz
- [ ] Animación de feedback (✅/❌)

### Mobile
- [ ] Gestos swipe en tarjetas
- [ ] Bottom navigation para móvil
- [ ] Ajustar espaciado para móvil

## 📚 Contenido Futuro

### Expansión de Verbos
- [ ] Agregar verbos JLPT N4 (~100 verbos)
- [ ] Agregar verbos JLPT N3 (~200 verbos)
- [ ] Agregar verbos JLPT N2 (~300 verbos)
- [ ] Agregar verbos JLPT N1 (~400 verbos)

### Otros Contenidos
- [ ] Adjetivos い (i-adjectives)
- [ ] Adjetivos な (na-adjectives)
- [ ] Partículas
- [ ] Kanji básicos
- [ ] Frases útiles (travel phrases)

### Multi-idioma
- [ ] Traducción de interfaz a inglés
- [ ] Traducción de interfaz a francés
- [ ] Traducción de interfaz a portugués
- [ ] Traducción de verbos a múltiples idiomas

## 🌐 Social / Community

### Features Sociales
- [ ] Compartir resultados en Twitter/X
- [ ] Compartir progreso en Instagram
- [ ] Leaderboard (tabla de clasificación)
- [ ] Desafíos semanales
- [ ] Competir con amigos

### Comunidad
- [ ] Foro o Discord
- [ ] Sistema de comentarios por verbo
- [ ] Contribuciones de la comunidad
- [ ] Reportar errores en verbos

## 📊 Analytics (Opcional)

- [ ] Implementar analytics (privacy-friendly)
- [ ] Tracking de verbos más vistos
- [ ] Tracking de tasa de abandono
- [ ] A/B testing para mejoras
- [ ] Heatmaps de interacción

## 🔐 Backend Futuro (Opcional)

Si el proyecto crece, considerar:
- [ ] Crear backend (Node.js/Deno)
- [ ] Base de datos (Supabase/Firebase)
- [ ] Autenticación de usuarios
- [ ] Sincronización multi-dispositivo
- [ ] API REST para datos
- [ ] GraphQL endpoint

## 📖 Documentación

- [ ] Crear guía de contribución (CONTRIBUTING.md)
- [ ] Documentar API de componentes
- [ ] Crear storybook para componentes
- [ ] Tutoriales en video
- [ ] Blog con tips de estudio

## 🐛 Bugs Conocidos

_Ninguno reportado actualmente_

## 💡 Ideas para Considerar

- [ ] Modo "flashcards" estilo Anki
- [ ] Integración con Anki (export deck)
- [ ] Modo "historia" con narrativa
- [ ] Chatbot para practicar conversación
- [ ] AR (Realidad Aumentada) para objetos
- [ ] Integración con IME japonés
- [ ] Reconocimiento de escritura (handwriting)
- [ ] Modo competitivo multijugador
- [ ] Plugin para navegador
- [ ] Extensión para VS Code

---

## 📅 Priorización

### 🔥 Alta Prioridad (Próximas 2 semanas)
- Sistema de quiz básico (Fase 2)
- Navegación entre páginas
- Sistema de puntuación simple

### 🟡 Media Prioridad (Próximo mes)
- Transitividad (Fase 3)
- Contexto y frases (Fase 4)
- Service worker para PWA

### 🟢 Baja Prioridad (Futuro)
- Gamificación completa (Fase 6)
- Multi-idioma
- Backend y autenticación

---

**Última actualización**: Octubre 2024
