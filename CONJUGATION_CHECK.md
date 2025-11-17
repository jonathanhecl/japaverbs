# ✓ Lista de Verificación de Conjugaciones

## Pre-Presentación - Verificación Rápida

Use esta lista para verificar que todas las conjugaciones funcionen correctamente en la aplicación antes de la presentación.

---

## 🔍 Verificación en Diccionario

### 1. Verbos Ichidan ✅

**食べる (taberu) - comer**
```
✓ Formal presente: たべます
✓ Formal negativo: たべません
✓ Pasado formal: たべました
✓ Forma て: たべて
✓ Progresivo: たべている / たべています
```

**見る (miru) - ver**
```
✓ Formal presente: みます
✓ Forma て: みて
✓ Pasado: みた
✓ Negativo: みない
```

---

### 2. Verbos Godan - Críticos ⚠️

**行く (iku) - ir** ⚠️ EXCEPCIÓN IMPORTANTE
```
✓ Formal presente: いきます
✓ Negativo: いかない
✓ Pasado: いった (NO いいた) ⚠️
✓ Forma て: いって (NO いいて) ⚠️
✓ Permiso: いってもいいです ⚠️
✓ Prohibición: いってはいけません ⚠️
✓ Progresivo: いっている / いっています ⚠️
```

**飲む (nomu) - beber**
```
✓ Formal presente: のみます
✓ Negativo: のまない
✓ Pasado: のんだ
✓ Forma て: のんで
✓ Progresivo: のんでいる
```

**話す (hanasu) - hablar**
```
✓ Formal presente: はなします
✓ Negativo: はなさない
✓ Pasado: はなした
✓ Forma て: はなして
✓ Progresivo: はなしている
```

**書く (kaku) - escribir**
```
✓ Formal presente: かきます
✓ Negativo: かかない
✓ Pasado: かいた
✓ Forma て: かいて
✓ Progresivo: かいている
```

**待つ (matsu) - esperar**
```
✓ Formal presente: まちます
✓ Negativo: またない
✓ Pasado: まった
✓ Forma て: まって
✓ Progresivo: まっている
```

**帰る (kaeru) - regresar**
```
✓ Formal presente: かえります
✓ Negativo: かえらない
✓ Pasado: かえった
✓ Forma て: かえって
✓ Progresivo: かえっている
```

---

### 3. Verbos Irregulares ⚠️

**する (suru) - hacer**
```
✓ Formal presente: します
✓ Formal negativo: しません
✓ Pasado formal: しました
✓ Negativo: しない
✓ Pasado: した
✓ Forma て: して
✓ Invitación: しよう
✓ Progresivo: している / しています
```

**来る (kuru) - venir** ⚠️ IMPORTANTE
```
✓ Formal presente: きます
✓ Formal negativo: きません
✓ Pasado formal: きました
✓ Negativo: こない (NO きない) ⚠️
✓ Pasado: きた
✓ Forma て: きて
✓ Invitación: こよう (NO きよう) ⚠️
✓ Negativo petición: こないで ⚠️
✓ Progresivo: きている / きています
```

---

## 🎯 Verificación en Guía de Conjugaciones

Navegar a: `/conjugaciones`

### Sección 3: "Guía paso a paso"

**Verificar ejemplos de 行く:**
```
✓ Paso 3: "く → った → 行った (itta) - Excepción de 行く"
✓ Paso 4: "く → って → 行って (itte) - Excepción de 行く"
✓ Paso 5: Nota sobre excepción de 行く menciona "行って (no 行いて)"
```

**Verificar ejemplos de 来る:**
```
✓ Formas especiales: "こよう" (no きよう)
✓ Lista completa incluye todas las formas correctas
```

---

## 🏋️ Verificación en Práctica

Navegar a: `/practica`

### Test 1: Conjugation Quiz
1. Seleccionar verbo **行く**
2. Verificar que las opciones incluyan:
   - ✓ `行って` (no `行いて`)
   - ✓ `行った` (no `行いた`)

### Test 2: Multiple Choice
1. Seleccionar varios verbos
2. Verificar que las conjugaciones sean consistentes
3. No debe haber formas como `きよう` para 来る

### Test 3: Flashcards de Conjugación
1. Practicar con verbos godan
2. Verificar formas て correctas
3. Audio debe funcionar en cada conjugación

---

## 📊 Checklist Completo

Marcar cada ítem después de verificar:

### Funcionalidad Básica
- [ ] Diccionario muestra todas las conjugaciones
- [ ] Audio funciona en todas las formas
- [ ] Colores consistentes (gris, azul, naranja, púrpura, rojo)
- [ ] Expandir/colapsar funciona en VerbCard

### Conjugaciones Críticas
- [ ] 行く genera 行って (no 行いて)
- [ ] 行く genera 行った (no 行いた)
- [ ] 来る genera こよう (no きよう)
- [ ] 来る genera こない (no きない)

### Guía de Conjugaciones
- [ ] Ejemplos de 行く son correctos
- [ ] Ejemplos de 来る son correctos
- [ ] Notas sobre excepciones están presentes
- [ ] Audio funciona en ejemplos

### Ejercicios de Práctica
- [ ] Conjugation Quiz genera opciones correctas
- [ ] Multiple Choice muestra conjugaciones correctas
- [ ] Flashcards muestran todas las formas
- [ ] Audio funciona durante práctica

### Todos los Tipos de Verbos
- [ ] Ichidan: 食べる, 見る funcionan correctamente
- [ ] Godan く: 行く, 書く funcionan correctamente
- [ ] Godan す: 話す funciona correctamente
- [ ] Godan む: 飲む funciona correctamente
- [ ] Godan つ: 待つ funciona correctamente
- [ ] Godan る: 帰る funciona correctamente
- [ ] Irregular: する funciona correctamente
- [ ] Irregular: 来る funciona correctamente

---

## 🚨 Señales de Alerta

Si encuentras alguno de estos errores, revisa `conjugation.ts`:

❌ **行いて** o **行いた** - Error crítico con 行く
❌ **きよう** - Error en 来る invitación
❌ **きない** - Error en 来る negativo
❌ Formas て incorrectas en verbos godan
❌ Formas progresivas sin て procesada correctamente

---

## 📱 Verificación en Dispositivos

Probar en:
- [ ] Desktop (Chrome/Firefox)
- [ ] Mobile (Chrome Android/Safari iOS)
- [ ] Tablet

Verificar:
- [ ] Audio TTS funciona
- [ ] Todas las conjugaciones son visibles
- [ ] Interfaz responsive
- [ ] No hay errores en consola

---

## ✅ Aprobación Final

Una vez completado todo:

- [ ] Todas las conjugaciones verificadas
- [ ] Guía revisada
- [ ] Ejercicios probados
- [ ] Audio funcionando
- [ ] Sin errores en consola

**Firma de aprobación:** _________________

**Fecha:** _________________

---

**🎉 Listo para presentación cuando todos los ítems estén marcados 🎉**
