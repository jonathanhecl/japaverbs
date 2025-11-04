# Sistema de Idiomas - JapaVerbs

## Overview

El sistema de idiomas permite separar los datos de los verbos de sus traducciones, facilitando la internacionalización y el mantenimiento.

## Estructura de Archivos

### Datos Base
- `verbs_n5_0_clean.json` - Verbos N5 parte 1 (solo datos estructurales)
- `verbs_n5_1_clean.json` - Verbos N5 parte 2 (solo datos estructurales)

### Traducciones
- `verbs_translations_es.json` - Traducciones en español
- `verbs_translations_en.json` - Traducciones en inglés (futuro)
- `verbs_translations_fr.json` - Traducciones en francés (futuro)

### Sistema
- `src/lib/stores/language.ts` - Store de configuración de idiomas
- `src/lib/data/verbsNew.ts` - Lógica de carga de verbos con traducciones
- `src/lib/data/verbs.ts` - Interfaz principal (actualizada)
- `src/lib/components/LanguageSelector.svelte` - Componente selector de idiomas

## Formato de Datos

### Verbos Base
```json
{
  "kanji": "食べる",
  "kana": "たべる", 
  "romaji": "taberu",
  "type": "ichidan",
  "freq": "high"
}
```

### Traducciones
```json
{
  "食べる": {
    "meaning": "comer",
    "examples": [
      {"ja": "パンを食べます。", "es": "Como pan."},
      {"ja": "朝ごはんを食べました。", "es": "Comí el desayuno."}
    ]
  }
}
```

## Uso en Componentes

### Importar verbos con traducciones
```typescript
import { getCurrentVerbs } from '$lib/data/verbs';
import type { VerbWithTranslation } from '$lib/types/verb';

let verbs = $derived<VerbWithTranslation[]>(getCurrentVerbs());
```

### Acceder a traducciones
```typescript
// Antes: verb['meaning-es']
// Ahora: verb.translation.meaning

// Antes: verb.examples
// Ahora: verb.translation.examples
```

### Selector de idiomas
```svelte
<script>
  import LanguageSelector from '$lib/components/LanguageSelector.svelte';
</script>

<LanguageSelector />
```

## Agregar Nuevo Idioma

1. Crear archivo `verbs_translations_xx.json` con las traducciones
2. Agregar idioma a `SUPPORTED_LANGUAGES` en `language.ts`
3. El sistema lo detectará automáticamente

## Funciones Disponibles

### `getVerbsWithTranslations(language?)`
Obtiene verbos con traducciones para un idioma específico

### `getCurrentVerbs()`
Obtiene verbos del idioma actual

### `preloadTranslations(language)`
Precarga traducciones para mejor rendimiento

### `languageStore.set(language)`
Cambia el idioma activo

## Cache y Rendimiento

- Las traducciones se cachean después de la primera carga
- Cambiar de idioma es instantáneo si ya está en cache
- Fallback automático a español si no hay traducciones

## Tipos TypeScript

```typescript
interface VerbBase {
  kanji: string;
  kana: string;
  romaji: string;
  type: 'godan' | 'ichidan' | 'irregular';
  freq?: 'high' | 'medium' | 'low';
}

interface VerbTranslation {
  meaning: string;
  examples: VerbExample[];
}

interface VerbWithTranslation extends VerbBase {
  translation: VerbTranslation;
  transitivity?: 'transitive' | 'intransitive' | 'both';
  tags?: string[];
}
```

## Migración desde Sistema Antiguo

1. Reemplazar `import verbs from '$lib/data/verbs'` con `import { getCurrentVerbs } from '$lib/data/verbs'`
2. Cambiar `verb['meaning-es']` por `verb.translation.meaning`
3. Cambiar `verb.examples` por `verb.translation.examples`
4. Actualizar tipos de `Verb` a `VerbWithTranslation`

## Beneficios

- **Mantenimiento**: Los datos base no se duplican por idioma
- **Rendimiento**: Carga bajo demanda y cache inteligente
- **Escalabilidad**: Fácil agregar nuevos idiomas
- **Compatibilidad**: API similar al sistema anterior
