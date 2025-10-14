<script lang="ts">
  const sections = [
    {
      title: 'Tipos de verbos',
      icon: '🧭',
      content: `Los verbos japoneses se dividen en tres grupos principales:
- **Godan (五段)**: cambian la última sílaba según la conjugación. Ejemplo: 行く (iku).
- **Ichidan (一段)**: terminan en る precedido por vocal /e/ o /i/. Se conjugan quitando る. Ejemplo: 食べる (taberu).
- **Irregulares**: する (hacer) y 来る (venir) tienen patrones únicos.`
    },
    {
      title: 'Conjugaciones básicas',
      icon: '📚',
      content: `Las formas esenciales para el JLPT N5 son:
- **Forma diccionario (辞書形)**: uso neutro/informal.
- **Forma ます (ます形)**: presente/ futuro con trato formal.
- **Forma ました (ました形)**: pasado formal.
- **Forma ない (ない形)**: negación informal.
- **Forma た (た形)**: pasado informal.
- **Forma て (て形)**: conectar acciones, pedir favores, progresivo.`
    },
    {
      title: 'Cómo conjugar',
      icon: '🛠️',
      content: `- **Ichidan**: elimina る y añade el sufijo necesario. 食べる → 食べます, 食べた, 食べない, 食べて.
- **Godan**: cambia la última sílaba. 行く → 行きます, 行った, 行かない, 行って.
- **Irregulares**: する → します, した, しない, して. / 来る → きます, きた, こない, きて.`
    },
    {
      title: 'Consejos de estudio',
      icon: '💡',
      content: `1. Aprende primero la forma diccionario y la ます.
2. Practica con tarjetas que incluyan la forma negativa.
3. Usa la forma て para encadenar acciones: 食べて寝る (como y duermo).
4. Escucha la pronunciación con el botón 🔊 para fijar los patrones.`
    }
  ];
</script>

<svelte:head>
  <title>Guía de conjugación de verbos · JapaVerbs N5</title>
  <meta name="description" content="Aprende a conjugar verbos godan, ichidan e irregulares con ejemplos prácticos para JLPT N5." />
</svelte:head>

<section class="space-y-6">
  <header class="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-center">
    <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-3xl">
      🈂️
    </div>
    <h1 class="mt-4 text-3xl font-bold text-white">Guía rápida de conjugación</h1>
    <p class="mt-2 text-sm text-slate-300">
      Repasa los patrones clave para conjugar verbos japoneses y vuelve al diccionario para ver ejemplos por verbo.
    </p>
    <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
      <a href="/diccionario" class="rounded-2xl bg-white px-5 py-2 text-sm font-semibold text-indigo-700 hover:-translate-y-0.5 transition-transform">
        📚 Ver diccionario
      </a>
      <a href="/practica" class="rounded-2xl border border-indigo-500/50 px-5 py-2 text-sm font-semibold text-indigo-100 hover:-translate-y-0.5 transition-transform">
        🎮 Ir a práctica
      </a>
    </div>
  </header>

  <div class="space-y-6">
    {#each sections as section}
      <article class="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <header class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-2xl">
            {section.icon}
          </div>
          <h2 class="text-xl font-semibold text-white">{section.title}</h2>
        </header>
        <div class="mt-4 text-sm text-slate-200 whitespace-pre-line">
          {@html section.content}
        </div>
      </article>
    {/each}
  </div>
</section>
