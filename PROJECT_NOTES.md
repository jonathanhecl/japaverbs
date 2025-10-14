# 🇯🇵 JapaVerbs N5 - Notas del Proyecto

## 📋 Resumen del Proyecto

PWA (Progressive Web App) para aprender verbos japoneses del nivel JLPT N5 mediante tres capas de aprendizaje progresivo:

1. **🧠 Conocimiento** - Diccionario interactivo
2. **🎯 Reconocimiento** - Mini-tests y ejercicios de elección
3. **⚙️ Aplicación** - Frases y contexto real

## ✅ MVP Completado (Fase 1)

### Características Implementadas

#### 1. Diccionario Interactivo ✅
- **50 verbos JLPT N5** cargados desde JSON
- Información completa por verbo:
  - Kanji (食べる)
  - Kana (たべる)
  - Rōmaji (taberu)
  - Traducción (comer)
  - Tipo: Godan / Ichidan / Irregular
  - 2 ejemplos de uso con traducción
- **TTS (Text-to-Speech)** integrado para kanji y ejemplos
- Diseño en tarjetas (cards) responsive

#### 2. Sistema de Búsqueda ✅
- Búsqueda por:
  - Kanji
  - Kana
  - Rōmaji
  - Significado en español
- Búsqueda en tiempo real (live search)

#### 3. Filtros por Tipo de Verbo ✅
- Filtro "Todos" (50 verbos)
- Filtro "Godan" (~30 verbos)
- Filtro "Ichidan" (~15 verbos)
- Filtro "Irregular" (~5 verbos)
- Contador dinámico por categoría

#### 4. PWA Configurada ✅
- Manifest.json configurado
- Meta tags para PWA
- Theme color: Indigo (#4F46E5)
- Preparado para instalación en dispositivos móviles

#### 5. UI/UX Moderna ✅
- TailwindCSS 4.x
- Diseño responsive (mobile-first)
- Header sticky con búsqueda
- Gradientes suaves
- Transiciones y animaciones
- Fuentes japonesas (Noto Sans JP)
- Estados de hover/focus
- Mensajes de estado (sin resultados)

## 🏗️ Estructura del Proyecto

```
japaverbs/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   └── VerbCard.svelte          # Tarjeta de verbo individual
│   │   ├── data/
│   │   │   └── verbs_n5.json            # Base de datos de 50 verbos N5
│   │   ├── stores/
│   │   │   └── userProgress.ts          # Store para progreso (localStorage)
│   │   ├── types/
│   │   │   └── verb.ts                  # Tipos TypeScript
│   │   └── utils/
│   │       └── tts.ts                   # Utilidad Text-to-Speech
│   ├── routes/
│   │   ├── +layout.svelte               # Layout principal
│   │   └── +page.svelte                 # Página del diccionario
│   ├── app.css                          # Estilos globales
│   └── app.html                         # Template HTML
├── static/
│   ├── manifest.json                    # PWA manifest
│   └── favicon.png                      # Icono de la app
├── package.json
├── vite.config.ts
├── svelte.config.js
└── PROJECT_NOTES.md                     # Este archivo
```

## 🎯 Arquitectura de Aprendizaje (3 Capas)

### Capa 1: 🧠 Conocimiento (✅ IMPLEMENTADO)
**Diccionario de verbos**
- Aprender forma, significado, ejemplos, tipo
- Búsqueda y filtros
- TTS para pronunciación

### Capa 2: 🎯 Reconocimiento (⏳ PENDIENTE)
**Mini-tests de elección múltiple**
- Asociar verbo ↔ traducción
- Identificar tipo de verbo
- Distinguir transitivo/intransitivo

### Capa 3: ⚙️ Aplicación (⏳ PENDIENTE)
**Frases y contexto**
- Aprender cuándo y cómo usar cada verbo
- Detectar errores en frases
- Práctica con partículas

## 📊 Datos Actuales

### Estructura de Verbos (verbs_n5.json)

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

### Campos Implementados ✅
- `kanji` - Forma en kanji
- `kana` - Lectura en hiragana
- `romaji` - Romanización
- `type` - Tipo de verbo (godan/ichidan/irregular)
- `meaning` - Traducción al español
- `examples[]` - Array de ejemplos con japonés y español

### Campos Futuros (Fase 5) ⏳
- `transitivity` - "transitive" | "intransitive" | "both"
- `frequency` - "high" | "medium" | "low"
- `tags` - Array de etiquetas ["#comida", "#diario", "#N5"]
- `jlpt_level` - "N5" (para futura expansión N4-N1)
- `theme` - Categoría temática

## 🚀 Roadmap de Desarrollo

### ✅ Fase 1: MVP - Diccionario (COMPLETADA)
- [x] Diccionario con 50 verbos N5
- [x] Búsqueda por múltiples campos
- [x] Filtros por tipo de verbo
- [x] TTS integrado
- [x] Diseño responsive
- [x] PWA básica configurada

### 📝 Fase 2: Práctica Básica (SIGUIENTE)
**Objetivo:** Repetición y memorización

#### Modo 1: "Elige el verbo correcto"
```
Pregunta: Comer (transitivo)
Opciones:
  a) 食べる ✅
  b) 飲む
  c) 行く
  d) 見る

Feedback: "飲む significa beber, no comer"
```

#### Modo 2: "Traducción ↔ Verbo"
```
Mostrar: 食べる
Elegir la traducción correcta en español
```

**Tareas:**
- [ ] Crear componente QuizCard
- [ ] Sistema de preguntas aleatorias
- [ ] Generador de opciones incorrectas (distractores)
- [ ] Feedback visual (✅/❌)
- [ ] Contador de respuestas correctas/incorrectas
- [ ] Botón "Siguiente pregunta"

### 📝 Fase 3: Gramática Avanzada
**Objetivo:** Consolidar tipos y transitividad

#### Modo 3: "Transitivo o Intransitivo"
```
Pregunta: ドアが開く
Este verbo es:
  a) Transitivo
  b) Intransitivo ✅

Explicación: "開く es intransitivo; el sujeto es la puerta"
```

#### Modo 4: "Tipo de verbo"
```
食べる es un verbo:
  a) Godan
  b) Ichidan ✅
  c) Irregular
```

**Tareas:**
- [ ] Agregar campo `transitivity` a verbs_n5.json
- [ ] Crear explicaciones de transitividad
- [ ] Crear quiz de identificación de tipo
- [ ] Añadir ejemplos contrastivos (開ける vs 開く)

### 📝 Fase 4: Contexto Real
**Objetivo:** Uso en frases reales

#### Modo 5: "Completa la frase"
```
朝ごはんを（　）
  a) 食べる ✅
  b) 飲む
  c) 寝る
```

#### Modo 6: "Correcto o incorrecto"
```
Frase: 車を乗る。
¿Correcto? ❌

Corrección: 車に乗る
Explicación: "乗る requiere la partícula に"
```

**Tareas:**
- [ ] Crear base de datos de frases incompletas
- [ ] Crear base de datos de errores comunes
- [ ] Sistema de explicación de partículas
- [ ] Ejercicios con を、に、で、へ、が
- [ ] Modo "detecta el error"

### 📝 Fase 5: Clasificación Inteligente
**Objetivo:** Filtros avanzados y metadatos

**Tareas:**
- [ ] Agregar frecuencia de uso (daily/academic/literary)
- [ ] Agregar transitividad a todos los verbos
- [ ] Crear sistema de tags
- [ ] Filtro por tema (#comida, #movimiento, #emociones)
- [ ] Filtro por frecuencia
- [ ] Filtro por transitividad
- [ ] Página de "Explorar por categorías"

### 📝 Fase 6: Gamificación
**Objetivo:** Engagement y progreso visible

**Tareas:**
- [ ] Sistema de puntos
- [ ] Niveles de usuario (Principiante → Experto)
- [ ] Logros/Badges
  - "Primera lección completa"
  - "10 verbos dominados"
  - "Maestro Ichidan"
  - "Racha de 7 días"
- [ ] Estadísticas personales
  - Verbos aprendidos
  - Tasa de aciertos
  - Racha actual
  - Tiempo de estudio
- [ ] Sistema de repaso espaciado (SRS)
- [ ] Recordatorios diarios
- [ ] Gráficos de progreso

### 📝 Fase 7: Modos Avanzados (Futuro)

#### 🎧 Modo Audio
- [ ] Escuchar la frase y elegir el verbo correcto
- [ ] Dictado de verbos
- [ ] Reconocimiento de voz

#### 🔤 Modo Conjugación
- [ ] Practicar formas: ます、て、た、ない、etc.
- [ ] Quiz de conjugaciones
- [ ] Tabla de conjugación completa por verbo

#### 🌍 Multi-idioma
- [ ] Interfaz en inglés
- [ ] Interfaz en francés
- [ ] Traducciones en múltiples idiomas

#### 📊 Analítica Avanzada
- [ ] Identificar verbos problemáticos
- [ ] Sugerencias personalizadas de repaso
- [ ] Comparación con otros usuarios
- [ ] Exportar progreso

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** SvelteKit 2.x (Svelte 5 con Runes)
- **Estilos:** TailwindCSS 4.x
- **TypeScript:** 5.x
- **Build:** Vite 7.x

### PWA
- **Manifest:** Configurado
- **Service Worker:** Por implementar (cache offline)
- **Instalable:** Sí

### APIs
- **Web Speech API (TTS):** Para pronunciación
- **Web Speech API (STT):** Futuro (reconocimiento de voz)

### Storage
- **LocalStorage:** Para progreso del usuario
- **IndexedDB:** Futuro (datos offline)

### Deployment
- **Adapter:** @sveltejs/adapter-static (preparado para GitHub Pages, Vercel, Netlify)
- **Cloudflare:** Adapter disponible para edge deployment

## 💡 Ideas Adicionales

### Funcionalidades Extra
- [ ] Modo oscuro (dark mode)
- [ ] Ajustar velocidad de TTS
- [ ] Favoritos/Marcadores
- [ ] Compartir verbos
- [ ] Imprimir lista de verbos
- [ ] Exportar a Anki
- [ ] Integración con calendario
- [ ] Modo sin conexión (offline-first)

### Contenido Futuro
- [ ] Verbos JLPT N4 (100 verbos)
- [ ] Verbos JLPT N3 (200 verbos)
- [ ] Verbos JLPT N2 (300 verbos)
- [ ] Verbos JLPT N1 (400 verbos)
- [ ] Adjetivos i/na
- [ ] Partículas
- [ ] Kanji

### Social/Community
- [ ] Compartir resultados en redes sociales
- [ ] Tabla de clasificación (leaderboard)
- [ ] Desafíos semanales
- [ ] Comunidad de estudiantes

## 🐛 Issues Conocidos

Ninguno actualmente. El MVP funciona correctamente.

## 📝 Notas de Desarrollo

### Decisiones de Arquitectura

1. **Svelte 5 Runes:** Se usa la nueva sintaxis de Svelte 5:
   - `$state()` para estado reactivo
   - `$derived()` para valores computados
   - `$props()` para propiedades de componentes

2. **Estructura de Datos:** JSON simple para facilitar expansión y contribuciones

3. **TTS Nativo:** Se usa Web Speech API en lugar de servicios externos (Google TTS) para:
   - Sin costos
   - Sin límites de uso
   - Funciona offline
   - Privacy-friendly

4. **Mobile-First:** El diseño está pensado principalmente para móvil, ya que es donde más se estudia

### Mejoras Técnicas Futuras

- [ ] Agregar tests unitarios (Vitest)
- [ ] Agregar tests E2E (Playwright)
- [ ] CI/CD con GitHub Actions
- [ ] Lighthouse score optimization
- [ ] Lazy loading de verbos
- [ ] Virtual scrolling para listas grandes
- [ ] Optimización de bundle size
- [ ] Implementar service worker para cache

## 📚 Recursos de Referencia

### Japonés - Gramática
- **Tipos de verbos:** Godan (五段), Ichidan (一段), Irregular (不規則)
- **Transitividad:** Transitivo (他動詞), Intransitivo (自動詞)
- **JLPT Levels:** N5 (básico) → N1 (avanzado)

### Web APIs
- [Web Speech API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Service Workers - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest - MDN](https://developer.mozilla.org/en-US/docs/Web/Manifest)

### Learning Science
- **Spaced Repetition:** Algoritmo de repetición espaciada (SRS)
- **Active Recall:** Práctica activa vs. pasiva
- **Contextual Learning:** Aprender en contexto real

## 🎓 Pedagogía del Proyecto

### ¿Por qué funciona este método?

1. **Progresión Natural:** Conocer → Reconocer → Aplicar
2. **Contexto Real:** Ejemplos de uso, no solo traducciones
3. **Audio + Visual:** TTS refuerza la memoria auditiva
4. **Práctica Activa:** Quizzes, no solo lectura pasiva
5. **Feedback Inmediato:** Saber qué está mal y por qué
6. **Gamificación:** Hacer el aprendizaje adictivo

### Diferencias con Anki/Duolingo

| Característica | JapaVerbs | Anki | Duolingo |
|----------------|-----------|------|----------|
| Contexto | ✅ Ejemplos reales | ⚠️ Tarjetas simples | ✅ Frases |
| Gramática | ✅ Tipos, transitividad | ❌ No | ⚠️ Implícita |
| Partículas | 🔜 Fase 4 | ❌ No | ⚠️ Básico |
| Gratis | ✅ 100% | ✅ Sí | ⚠️ Con ads |
| Offline | 🔜 PWA | ✅ Sí | ❌ No |
| Open Source | ✅ Sí | ❌ No | ❌ No |

## 📞 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview build
npm run preview

# Linting
npm run lint

# Format
npm run format

# Type checking
npm run check
```

## 🏁 Conclusión del MVP

El MVP está **completo y funcional**. Incluye:
- ✅ 50 verbos JLPT N5
- ✅ Búsqueda inteligente
- ✅ Filtros por tipo
- ✅ TTS integrado
- ✅ Diseño moderno y responsive
- ✅ PWA configurada

**Próximo paso:** Implementar Fase 2 (Sistema de Quizzes) para comenzar con el aprendizaje activo mediante mini-tests.

---

**Fecha de creación del MVP:** Octubre 2024
**Stack:** SvelteKit + TailwindCSS + TypeScript
**Autor:** [Tu nombre/equipo]
