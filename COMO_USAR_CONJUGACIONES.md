# 📘 Guía: Cómo Usar el Sistema de Conjugaciones

## Para Desarrolladores

---

## 🎯 Uso Básico

### Importar la función

```typescript
import { conjugateVerb } from '$lib/utils/conjugation';
import type { VerbWithTranslation } from '$lib/types/verb';
```

### Obtener conjugaciones de un verbo

```typescript
const verb: VerbWithTranslation = {
  kanji: '食べる',
  kana: 'たべる',
  romaji: 'taberu',
  type: 'ichidan',
  translation: {
    meaning: 'comer',
    examples: [...]
  }
};

const conjugations = conjugateVerb(verb);
// Retorna array de 18 objetos ConjugationForm
```

---

## 📦 Estructura de ConjugationForm

```typescript
interface ConjugationForm {
  key: ConjugationFormKey;        // Identificador único
  label: string;                  // Etiqueta descriptiva
  kana: string;                   // Conjugación en kana
  description: string;            // Descripción de uso
  translation: string;            // Traducción al español
}
```

### Ejemplo de retorno:

```typescript
{
  key: 'masuPresent',
  label: 'Presente afirmativo formal (ます)',
  kana: 'たべます',
  description: 'Forma cortés en presente: "comer"',
  translation: 'como'
}
```

---

## 🔑 Claves de Conjugación (ConjugationFormKey)

### Formales (ます形)
- `masuPresent` - ます
- `masuPresentNegative` - ません
- `masuPast` - ました
- `masuPastNegative` - ませんでした
- `invitation` - ましょう
- `desireFormal` - たいです
- `permission` - てもいいです
- `prohibition` - てはいけません
- `progressiveFormal` - ています

### Informales (普通形)
- `dictionary` - Forma diccionario
- `plainNegative` - ない
- `plainPast` - た
- `plainPastNegative` - なかった
- `desireInformal` - たい
- `invitationInformal` - よう
- `request` - て
- `negativeRequest` - ないで
- `progressiveInformal` - ている

---

## 💻 Ejemplos de Uso en Componentes

### Ejemplo 1: Mostrar una conjugación específica

```svelte
<script lang="ts">
  import { conjugateVerb } from '$lib/utils/conjugation';
  
  let verb = { /* ... */ };
  const conjugations = conjugateVerb(verb);
  
  // Obtener forma específica
  const teForm = conjugations.find(c => c.key === 'request');
</script>

<div>
  <p>Forma て: {teForm?.kana}</p>
  <p>{teForm?.translation}</p>
</div>
```

### Ejemplo 2: Mostrar todas las formas formales

```svelte
<script lang="ts">
  import { conjugateVerb } from '$lib/utils/conjugation';
  
  let verb = { /* ... */ };
  const conjugations = conjugateVerb(verb);
  
  // Filtrar solo formas formales
  const formalForms = conjugations.filter(c => 
    c.key.startsWith('masu') || 
    c.key === 'invitation' ||
    c.key === 'desireFormal' ||
    c.key === 'permission' ||
    c.key === 'prohibition' ||
    c.key === 'progressiveFormal'
  );
</script>

<div>
  {#each formalForms as form}
    <div class="conjugation-card">
      <h4>{form.label}</h4>
      <p class="kana">{form.kana}</p>
      <p class="translation">{form.translation}</p>
    </div>
  {/each}
</div>
```

### Ejemplo 3: Generar opciones para quiz

```typescript
function generateQuizOptions(correctVerb: VerbWithTranslation, targetForm: string) {
  const correctConjugations = conjugateVerb(correctVerb);
  const correctAnswer = correctConjugations.find(c => c.key === targetForm);
  
  // Generar distractores de otros verbos
  const wrongAnswers = otherVerbs.map(verb => {
    const conjugations = conjugateVerb(verb);
    return conjugations.find(c => c.key === targetForm)?.kana;
  }).filter(Boolean).slice(0, 3);
  
  return shuffle([correctAnswer?.kana, ...wrongAnswers]);
}
```

---

## 🎨 Sistema de Colores

Usa esta función para obtener colores consistentes:

```typescript
function getFormColor(key: ConjugationFormKey) {
  switch(key) {
    case 'dictionary': 
      return { 
        bg: 'bg-slate-500/10', 
        border: 'border-slate-500/40', 
        text: 'text-slate-200' 
      };
    
    case 'masuPresent':
    case 'masuPresentNegative':
    case 'masuPast':
    case 'masuPastNegative':
    // ... otras formas formales
      return { 
        bg: 'bg-blue-500/10', 
        border: 'border-blue-500/40', 
        text: 'text-blue-200' 
      };
    
    case 'plainPast':
    case 'plainPastNegative':
      return { 
        bg: 'bg-orange-500/10', 
        border: 'border-orange-500/40', 
        text: 'text-orange-200' 
      };
    
    case 'request':
    case 'progressiveInformal':
      return { 
        bg: 'bg-purple-500/10', 
        border: 'border-purple-500/40', 
        text: 'text-purple-200' 
      };
    
    case 'plainNegative':
    case 'negativeRequest':
      return { 
        bg: 'bg-red-500/10', 
        border: 'border-red-500/40', 
        text: 'text-red-200' 
      };
    
    default: 
      return { 
        bg: 'bg-slate-500/10', 
        border: 'border-slate-500/40', 
        text: 'text-slate-200' 
      };
  }
}
```

---

## 🧪 Testing

### Verificar una conjugación específica

```typescript
import { conjugateVerb } from '$lib/utils/conjugation';

describe('Conjugación de 行く', () => {
  const iku = {
    kanji: '行く',
    kana: 'いく',
    romaji: 'iku',
    type: 'godan',
    translation: { meaning: 'ir', examples: [] }
  };
  
  const conjugations = conjugateVerb(iku);
  
  test('Forma て debe ser 行って (excepción)', () => {
    const teForm = conjugations.find(c => c.key === 'request');
    expect(teForm?.kana).toBe('いって'); // No いいて
  });
  
  test('Forma た debe ser 行った (excepción)', () => {
    const taForm = conjugations.find(c => c.key === 'plainPast');
    expect(taForm?.kana).toBe('いった'); // No いいた
  });
  
  test('Progresivo debe usar て correcta', () => {
    const progressive = conjugations.find(c => c.key === 'progressiveInformal');
    expect(progressive?.kana).toBe('いっている'); // No いいている
  });
});
```

---

## ⚠️ Casos Especiales

### 1. Verbo 行く (iku)

**Excepción:** La forma て es `って` (no `いて`)

```typescript
const iku = { kanji: '行く', kana: 'いく', type: 'godan', ... };
const conj = conjugateVerb(iku);

conj.find(c => c.key === 'request')?.kana;           // "いって" ✓
conj.find(c => c.key === 'plainPast')?.kana;         // "いった" ✓
conj.find(c => c.key === 'progressiveInformal')?.kana; // "いっている" ✓
```

### 2. Verbo 来る (kuru)

**Irregular completo:** Cambia raíz según forma

```typescript
const kuru = { kanji: '来る', kana: 'くる', type: 'irregular', ... };
const conj = conjugateVerb(kuru);

conj.find(c => c.key === 'dictionary')?.kana;         // "くる" ✓
conj.find(c => c.key === 'plainNegative')?.kana;      // "こない" ✓ (no きない)
conj.find(c => c.key === 'invitationInformal')?.kana; // "こよう" ✓ (no きよう)
conj.find(c => c.key === 'masuPresent')?.kana;        // "きます" ✓
```

---

## 📝 Añadir Nuevas Formas de Conjugación

Si necesitas agregar una nueva forma en el futuro:

### Paso 1: Actualizar el tipo

```typescript
// src/lib/types/verb.ts
export type ConjugationFormKey =
  | 'masuPresent'
  // ... existentes ...
  | 'nuevaForma';  // ← Agregar aquí
```

### Paso 2: Actualizar funciones de conjugación

```typescript
// src/lib/utils/conjugation.ts

function conjugateIchidan(kana: string) {
  return {
    // ... formas existentes ...
    nuevaForma: `${stem}nuevosufijo`
  };
}

function conjugateGodan(verb: VerbWithTranslation) {
  return {
    // ... formas existentes ...
    nuevaForma: `${stem}${rule.algo}nuevosufijo`
  };
}

function conjugateIrregular(verb: VerbWithTranslation) {
  if (kana === 'する') {
    return {
      // ... formas existentes ...
      nuevaForma: 'しnuevosufijo'
    };
  }
  // ... etc
}
```

### Paso 3: Actualizar array de salida

```typescript
export function conjugateVerb(verb: VerbWithTranslation): ConjugationForm[] {
  // ... código existente ...
  
  const entries: ConjugationForm[] = [
    // ... formas existentes ...
    {
      key: 'nuevaForma',
      label: 'Nueva Forma (descripción)',
      kana: forms.nuevaForma,
      description: 'Descripción de uso',
      translation: getTranslation(kanji, 'nuevaForma', meaning)
    }
  ];
  
  return entries;
}
```

### Paso 4: Actualizar JSONs de traducción

```json
// src/lib/data/conj_n5_X_es.json
{
  "kanji": "食べる",
  "dictionary": "comer",
  // ... traducciones existentes ...
  "nuevaForma": "traducción al español"
}
```

---

## 🚀 Buenas Prácticas

### ✅ DO (Hacer)

- Usar siempre `conjugateVerb()` para generar conjugaciones
- Filtrar el array retornado según necesites
- Usar las claves de `ConjugationFormKey` para identificar formas
- Aplicar colores consistentes con `getFormColor()`
- Testear con verbos de los 3 tipos (ichidan, godan, irregular)

### ❌ DON'T (No hacer)

- ❌ Hardcodear conjugaciones en el código
- ❌ Crear tu propia lógica de conjugación
- ❌ Asumir que todos los verbos siguen el mismo patrón
- ❌ Olvidar manejar excepciones (行く)
- ❌ Usar strings mágicos en lugar de las claves definidas

---

## 📚 Recursos Adicionales

- **Tipos:** `src/lib/types/verb.ts`
- **Lógica:** `src/lib/utils/conjugation.ts`
- **Traducciones:** `src/lib/data/conj_n5_*.json`
- **Ejemplos:** `src/lib/components/VerbCard.svelte`
- **Tests:** `test_conjugations.js`

---

## 🆘 Solución de Problemas

### Problema: Conjugación incorrecta

**Solución:** Verifica el tipo del verbo
```typescript
// Asegúrate de que el tipo sea correcto
verb.type === 'godan' || 'ichidan' || 'irregular'
```

### Problema: Traducción faltante

**Solución:** Verifica que exista en los JSONs
```typescript
// Si no existe en JSON, usa fallback
const translation = getTranslation(kanji, key, meaning);
```

### Problema: Excepción no manejada

**Solución:** Revisa `handleGodanExceptionTe` y `handleGodanExceptionTa`
```typescript
// Solo 行く tiene excepción actualmente
if (verb.kana === 'いく') {
  // manejo especial
}
```

---

## ✨ Conclusión

El sistema de conjugaciones es:
- ✅ **Centralizado** - Una función para todo
- ✅ **Completo** - 18 formas JLPT N5
- ✅ **Preciso** - Maneja excepciones correctamente
- ✅ **Fácil de usar** - API simple y clara
- ✅ **Extensible** - Fácil agregar nuevas formas

**Usa `conjugateVerb()` y nada más. Todo está manejado por ti.**

---

**Última actualización:** 17 de Noviembre, 2025
