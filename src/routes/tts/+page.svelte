<script lang="ts">
  const osGuides = [
    {
      title: 'Windows 11 / Windows 10',
      icon: '🪟',
      steps: [
        'Abre **Configuración** → **Hora e idioma** → **Voz**',
        'En la sección "Administrar voces", pulsa **Agregar voces**',
        'Busca *Japanese* (日本語), marca la casilla y presiona **Agregar**',
        'Espera a que se descargue el paquete de voz (puede tardar algunos minutos)',
        'Reinicia el navegador para que la voz japonesa se active en JapaVerbs'
      ],
      extra: 'Si quieres mantener la pronunciación en español como fallback, también puedes agregar la voz "Spanish (Spain)".'
    },
    {
      title: 'macOS Ventura / Monterey',
      icon: '🍎',
      steps: [
        'Ve a **Preferencias del Sistema** → **Accesibilidad** → **Contenido hablado**',
        'En "Voz del sistema", pulsa **Gestionar voces…**',
        'Desplázate hasta **Japanese** y haz clic en **Descargar** (por ejemplo, la voz Kyoko)',
        'Opcional: descarga una voz en español si deseas el fallback en español',
        'Cierra y vuelve a abrir tu navegador para que detecte la nueva voz'
      ],
      extra: 'También puedes ajustar la velocidad de voz desde este panel para hacerlo más natural.'
    },
    {
      title: 'Android (Google Chrome)',
      icon: '🤖',
      steps: [
        'Abre **Ajustes** → **Sistema** → **Idiomas e introducción de texto**',
        'Selecciona **Salida de texto a voz**',
        'Toca el icono de ajustes del **Motor de síntesis de voz de Google**',
        'En **Instalar datos de voz**, descarga el paquete **Japanese**',
        'Reinicia la app JapaVerbs o el navegador para aplicar la nueva voz'
      ],
      extra: 'Si quieres escuchar el fallback en español en Android, descarga también el paquete de voz Spanish.'
    },
    {
      title: 'iOS / iPadOS (Safari o Chrome)',
      icon: '📱',
      steps: [
        'Abre **Ajustes** → **Accesibilidad** → **Contenido leído**',
        'Pulsa **Voces** y elige **Idioma** → **Añadir voz…**',
        'Descarga una voz japonesa (por ejemplo, Kyoko o Otoya)',
        'Opcional: descarga una voz en español para mejorar el fallback',
        'Cierra completamente el navegador y vuelve a abrirlo para que la voz se active'
      ],
      extra: 'En iOS puedes ajustar el control deslizante de velocidad para que la pronunciación sea más lenta si lo necesitas.'
    }
  ];
</script>

<svelte:head>
  <title>Instalar voces TTS · JapaVerbs N5</title>
  <meta name="description" content="Guía paso a paso para instalar voces japonesas en Windows, macOS, Android y iOS y habilitar el TTS de JapaVerbs." />
</svelte:head>

<section class="space-y-6">
  <header class="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-center">
    <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-3xl">
      🔊
    </div>
    <h1 class="mt-4 text-3xl font-bold text-white">Instalar voces para Text-to-Speech</h1>
    <p class="mt-2 text-sm text-slate-300">
      Sigue los pasos según tu sistema operativo para obtener la voz japonesa y disfrutar la pronunciación nativa en JapaVerbs.
    </p>
  </header>

  <div class="space-y-6">
    {#each osGuides as guide}
      <article class="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <header class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-2xl">
            {guide.icon}
          </div>
          <h2 class="text-xl font-semibold text-white">{guide.title}</h2>
        </header>

        <ol class="mt-4 space-y-3 text-sm text-slate-200">
          {#each guide.steps as step, index}
            <li class="flex items-start gap-3">
              <span class="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-300">
                {index + 1}
              </span>
              <span>{@html step}</span>
            </li>
          {/each}
        </ol>

        <p class="mt-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-xs text-indigo-100">
          {guide.extra}
        </p>
      </article>
    {/each}
  </div>

  <footer class="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-slate-300">
    <p>
      Después de instalar la voz japonesa, reinicia tu navegador y vuelve a tocar el icono 🔊 en JapaVerbs.
      Si sigues escuchando la voz de fallback en español, vuelve a esta página y revisa que la descarga se haya completado correctamente.
    </p>
  </footer>
</section>
