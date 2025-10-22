<script lang="ts">
  import { speak } from '$lib/utils/tts';
  import { tick } from 'svelte';

  let currentSection = $state(0);
  let sectionCarouselEl: HTMLDivElement | null = null;

  type SectionColor = 'indigo' | 'purple' | 'green' | 'yellow';

  interface SectionPalette {
    iconBg: string;
    accentText: string;
  }

  interface VerbExample {
    kanji: string;
    kana: string;
    romaji: string;
    meaning: string;
  }

  interface SentenceExample {
    text: string;
    translation: string;
  }

  interface StepDetail {
    step: string;
    example?: string;
    examples?: string[];
    note?: string;
  }

  interface ConjugationForm {
    form: string;
    result: string;
  }

  interface ConjugationDetail {
    verb: string;
    forms: ConjugationForm[];
  }

  interface SubsectionDetail {
    title: string;
    badge: string;
    explanation: string;
    wordExamples?: VerbExample[];
    sentenceExamples?: SentenceExample[];
    steps?: StepDetail[];
    conjugations?: ConjugationDetail[];
  }

  interface TipDetail {
    title: string;
    icon: string;
    description: string;
    priority: 'Alta' | 'Media';
  }

  interface SectionDetail {
    title: string;
    icon: string;
    color: SectionColor;
    palette: SectionPalette;
    intro: string;
    subsections?: SubsectionDetail[];
    tips?: TipDetail[];
  }

  function getBadgeColors(badge: string) {
    switch (badge) {
      case 'Básica':
        return { bg: 'bg-slate-500/20', text: 'text-slate-200', border: 'border-slate-500/50' };
      case 'Formal':
        return { bg: 'bg-blue-500/20', text: 'text-blue-200', border: 'border-blue-500/50' };
      case 'Pasado Formal':
        return { bg: 'bg-blue-500/20', text: 'text-blue-200', border: 'border-blue-500/50' };
      case 'Pasado':
        return { bg: 'bg-orange-500/20', text: 'text-orange-200', border: 'border-orange-500/50' };
      case 'Versátil':
        return { bg: 'bg-purple-500/20', text: 'text-purple-200', border: 'border-purple-500/50' };
      case 'Negativa':
        return { bg: 'bg-red-500/20', text: 'text-red-200', border: 'border-red-500/50' };
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-500/50' };
    }
  }

  const sections: SectionDetail[] = [
    {
      title: 'Tipos de verbos japoneses',
      icon: '🧭',
      color: 'indigo',
      palette: getSectionPalette('indigo'),
      intro: 'Los verbos japoneses se clasifican en tres grupos principales según su patrón de conjugación.',
      subsections: [
        {
          title: 'Verbos Godan (五段)',
          badge: 'Grupo 1',
          wordExamples: [
            { kanji: '行く', kana: 'いく', romaji: 'iku', meaning: 'ir' },
            { kanji: '書く', kana: 'かく', romaji: 'kaku', meaning: 'escribir' },
            { kanji: '飲む', kana: 'のむ', romaji: 'nomu', meaning: 'beber' },
            { kanji: '話す', kana: 'はなす', romaji: 'hanasu', meaning: 'hablar' }
          ],
          explanation: 'Los verbos Godan terminan en -u y cambian la última sílaba según la conjugación. Son el grupo más numeroso.'
        },
        {
          title: 'Verbos Ichidan (一段)',
          badge: 'Grupo 2',
          wordExamples: [
            { kanji: '食べる', kana: 'たべる', romaji: 'taberu', meaning: 'comer' },
            { kanji: '見る', kana: 'みる', romaji: 'miru', meaning: 'ver' },
            { kanji: '起きる', kana: 'おきる', romaji: 'okiru', meaning: 'levantarse' },
            { kanji: '寝る', kana: 'ねる', romaji: 'neru', meaning: 'dormir' }
          ],
          explanation: 'Los verbos Ichidan terminan en -eru o -iru. Se conjugan simplemente quitando る y añadiendo el sufijo.'
        },
        {
          title: 'Verbos Irregulares',
          badge: 'Grupo 3',
          wordExamples: [
            { kanji: 'する', kana: 'する', romaji: 'suru', meaning: 'hacer' },
            { kanji: '来る', kana: 'くる', romaji: 'kuru', meaning: 'venir' }
          ],
          explanation: 'Solo hay dos verbos irregulares en japonés. Ambos son extremadamente comunes y deben memorizarse.'
        }
      ]
    },
    {
      title: 'Formas de conjugación',
      icon: '📚',
      color: 'purple',
      palette: getSectionPalette('purple'),
      intro: 'Cada verbo japonés tiene múltiples formas que expresan tiempo, cortesía y modo.',
      subsections: [
        {
          title: 'Forma Diccionario (辞書形)',
          badge: 'Básica',
          explanation: 'Es la forma base del verbo. Se usa en contextos informales y es la forma que aparece en los diccionarios.',
          sentenceExamples: [
            { text: '明日、映画を見る。', translation: 'Mañana veré una película.' }
          ]
        },
        {
          title: 'Forma Masu (ます形)',
          badge: 'Formal',
          explanation: 'Forma cortés del presente/futuro. Es esencial para conversaciones formales.',
          sentenceExamples: [
            { text: '日本語を勉強します。', translation: 'Estudio japonés.' },
            { text: '明日行きます。', translation: 'Iré mañana.' }
          ]
        },
        {
          title: 'Forma Ta (た形)',
          badge: 'Pasado',
          explanation: 'Expresa acciones completadas en el pasado (informal).',
          sentenceExamples: [
            { text: '昨日、友達に会った。', translation: 'Ayer vi a un amigo.' },
            { text: '朝ごはんを食べた。', translation: 'Desayuné.' }
          ]
        },
        {
          title: 'Forma Te (て形)',
          badge: 'Versátil',
          explanation: 'Una de las formas más importantes. Se usa para conectar verbos, hacer peticiones y formar el progresivo.',
          sentenceExamples: [
            { text: 'ご飯を食べて、寝る。', translation: 'Como y luego duermo.' },
            { text: '今、勉強している。', translation: 'Ahora estoy estudiando.' },
            { text: '手伝ってください。', translation: 'Por favor ayúdame.' }
          ]
        },
        {
          title: 'Forma Nai (ない形)',
          badge: 'Negativa',
          explanation: 'Forma negativa informal del presente/futuro.',
          sentenceExamples: [
            { text: '今日は行かない。', translation: 'Hoy no voy.' },
            { text: 'お酒を飲まない。', translation: 'No bebo alcohol.' }
          ]
        },
        {
          title: 'Forma Mashita (ました形)',
          badge: 'Pasado Formal',
          explanation: 'Pasado cortés. Combina cortesía con tiempo pasado.',
          sentenceExamples: [
            { text: '昨日、東京に行きました。', translation: 'Ayer fui a Tokio.' },
            { text: '映画を見ました。', translation: 'Vi una película.' }
          ]
        }
      ]
    },
    {
      title: 'Guía paso a paso',
      icon: '🛠️',
      color: 'green',
      palette: getSectionPalette('green'),
      intro: 'Aprende a conjugar cada tipo de verbo con ejemplos detallados.',
      subsections: [
        {
          title: 'Conjugando verbos Ichidan',
          badge: 'Fácil',
          explanation: 'Los verbos Ichidan son los más simples de conjugar.',
          steps: [
            { step: '1. Identifica el verbo', example: '食べる (taberu) - comer' },
            { step: '2. Quita る', example: '食べ (tabe)' },
            { step: '3. Añade el sufijo', examples: [
              'ます → 食べます (tabemasu) - como/comeré',
              'た → 食べた (tabeta) - comí',
              'て → 食べて (tabete) - comiendo/y comer',
              'ない → 食べない (tabenai) - no como'
            ]}
          ]
        },
        {
          title: 'Conjugando verbos Godan',
          badge: 'Medio',
          explanation: 'Los verbos Godan requieren cambiar la vocal final según reglas específicas.',
          steps: [
            { step: '1. Identifica el verbo', example: '行く (iku) - ir' },
            { step: '2. Cambia la terminación -u', examples: [
              'く → き + ます → 行きます (ikimasu)',
              'く → いた → 行った (itta)',
              'く → いて → 行って (itte)',
              'く → かない → 行かない (ikanai)'
            ]},
            { step: '3. Atención a irregularidades', note: 'Los verbos que terminan en -ku/-gu/-su/-tsu/-nu/-bu/-mu/-ru tienen cambios específicos.' }
          ]
        },
        {
          title: 'Conjugando verbos irregulares',
          badge: 'Especial',
          explanation: 'Estos verbos deben memorizarse. Son los más usados en japonés.',
          conjugations: [
            {
              verb: 'する (suru) - hacer',
              forms: [
                { form: 'ます形', result: 'します (shimasu)' },
                { form: 'た形', result: 'した (shita)' },
                { form: 'て形', result: 'して (shite)' },
                { form: 'ない形', result: 'しない (shinai)' }
              ]
            },
            {
              verb: '来る (kuru) - venir',
              forms: [
                { form: 'ます形', result: 'きます (kimasu)' },
                { form: 'た形', result: 'きた (kita)' },
                { form: 'て形', result: 'きて (kite)' },
                { form: 'ない形', result: 'こない (konai)' }
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Consejos y trucos',
      icon: '💡',
      color: 'yellow',
      palette: getSectionPalette('yellow'),
      intro: 'Estrategias efectivas para dominar las conjugaciones verbales.',
      tips: [
        {
          title: 'Empieza con lo básico',
          icon: '🎯',
          description: 'Domina primero la forma diccionario y la forma ます. Estas dos formas son fundamentales.',
          priority: 'Alta'
        },
        {
          title: 'Practica la forma て',
          icon: '🔗',
          description: 'La forma て es extremadamente versátil. Úsala para conectar acciones: 朝起きて、顔を洗って、朝ごはんを食べます。',
          priority: 'Alta'
        },
        {
          title: 'Agrupa verbos similares',
          icon: '📋',
          description: 'Los verbos que terminan igual se conjugan igual. Por ejemplo: 書く, 聞く, 歩く todos siguen el mismo patrón.',
          priority: 'Media'
        },
        {
          title: 'Usa flashcards',
          icon: '🎴',
          description: 'Crea tarjetas con el verbo en un lado y sus conjugaciones en el otro. Practica diariamente.',
          priority: 'Alta'
        },
        {
          title: 'Escucha y repite',
          icon: '🔊',
          description: 'Usa el botón de audio para escuchar la pronunciación correcta. La práctica auditiva refuerza la memoria.',
          priority: 'Media'
        },
        {
          title: 'Contexto real',
          icon: '📖',
          description: 'Lee los ejemplos de cada verbo en el diccionario. Ver los verbos en contexto ayuda a recordar su uso.',
          priority: 'Alta'
        },
        {
          title: 'Errores comunes',
          icon: '⚠️',
          description: 'No confundas Ichidan con Godan. Verbos como 帰る (kaeru) parecen Ichidan pero son Godan.',
          priority: 'Media'
        },
        {
          title: 'Practica todos los días',
          icon: '📅',
          description: 'Dedica 10-15 minutos diarios. La consistencia es más importante que largas sesiones esporádicas.',
          priority: 'Alta'
        }
      ]
    }
  ];

  const sectionCount = sections.length;

  function getSectionPalette(color: SectionColor): SectionPalette {
    switch (color) {
      case 'indigo':
        return {
          iconBg: 'bg-indigo-500/15 text-indigo-200',
          accentText: 'text-indigo-200'
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-500/15 text-purple-200',
          accentText: 'text-purple-200'
        };
      case 'green':
        return {
          iconBg: 'bg-emerald-500/15 text-emerald-200',
          accentText: 'text-emerald-200'
        };
      case 'yellow':
        return {
          iconBg: 'bg-amber-500/15 text-amber-200',
          accentText: 'text-amber-200'
        };
      default:
        return {
          iconBg: 'bg-slate-500/15 text-slate-200',
          accentText: 'text-slate-200'
        };
    }
  }

  async function goToSection(index: number) {
    const clamped = Math.max(0, Math.min(index, sectionCount - 1));
    currentSection = clamped;
    await tick();
    if (sectionCarouselEl) {
      const width = sectionCarouselEl.clientWidth;
      sectionCarouselEl.scrollTo({ left: clamped * width, behavior: 'smooth' });
    }
  }

  function nextSection() {
    if (currentSection < sectionCount - 1) {
      goToSection(currentSection + 1);
    }
  }

  function prevSection() {
    if (currentSection > 0) {
      goToSection(currentSection - 1);
    }
  }

  function handleCarouselScroll() {
    if (!sectionCarouselEl) return;
    const width = sectionCarouselEl.clientWidth;
    if (width === 0) return;
    const index = Math.round(sectionCarouselEl.scrollLeft / width);
    if (index !== currentSection) {
      currentSection = Math.max(0, Math.min(index, sectionCount - 1));
    }
  }

  function handleSectionKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextSection();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prevSection();
    }
  }
</script>

<svelte:head>
  <title>Guía de conjugación de verbos · JapaVerbs</title>
  <meta name="description" content="Aprende a conjugar verbos godan, ichidan e irregulares con ejemplos prácticos." />
</svelte:head>

<section class="space-y-8 pb-10">
  <header class="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 md:px-10">
    <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div class="flex items-center gap-4">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-3xl">
          🈂️
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-indigo-200">Centro de aprendizaje</p>
          <h1 class="mt-1 text-3xl font-bold text-white">Guía de verbos japonesa</h1>
          <p class="mt-1 text-sm text-slate-300 max-w-xl">
            Comprende cómo se clasifican, se conjugan y se aplican los verbos con ejemplos claros y recursos prácticos.
          </p>
        </div>
      </div>
    </div>
  </header>

  <div class="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8">
    <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Índice interactivo</p>
        <h2 class="mt-2 text-2xl font-semibold text-white">Aprende sobre verbos japoneses</h2>
        <p class="mt-2 text-sm text-slate-400 max-w-2xl">
          Navega las secciones principales con el carrusel lateral. Usa las flechas para avanzar y consulta cada tarjeta para profundizar.<br />
          También puedes saltar directamente desde la lista de secciones.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          onclick={prevSection}
          class="h-10 w-10 rounded-full border border-slate-700 text-slate-300 transition-colors hover:border-indigo-400 hover:text-indigo-200 disabled:pointer-events-none disabled:opacity-40"
          disabled={currentSection === 0}
          aria-label="Sección anterior"
          type="button"
        >
          ←
        </button>
        <button
          onclick={nextSection}
          class="h-10 w-10 rounded-full border border-slate-700 text-slate-300 transition-colors hover:border-indigo-400 hover:text-indigo-200 disabled:pointer-events-none disabled:opacity-40"
          disabled={currentSection === sectionCount - 1}
          aria-label="Sección siguiente"
          type="button"
        >
          →
        </button>
      </div>
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-[280px,1fr]">
      <aside class="space-y-3">
        {#each sections as section, index}
          <button
            onclick={() => goToSection(index)}
            class={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
              currentSection === index
                ? 'border-indigo-400 bg-indigo-500/10 text-white shadow-md shadow-indigo-500/20'
                : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-600'
            }`}
            type="button"
          >
            <span class={`flex h-10 w-10 items-center justify-center rounded-xl ${section.palette.iconBg}`}>{section.icon}</span>
            <span>
              <span class="text-sm font-semibold">{section.title}</span>
              <span class="mt-1 block text-xs text-slate-400">{section.intro}</span>
            </span>
          </button>
        {/each}
      </aside>

      <div
        class="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/60"
        bind:this={sectionCarouselEl}
        onscroll={handleCarouselScroll}
        role="group"
        aria-label="Carrusel de secciones de la guía de verbos"
      >
        <div class="flex">
          {#each sections as section, index (section.title)}
            <article class="w-full flex-shrink-0 p-5 sm:p-7 md:p-8">
              <header class="mb-6 flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-start gap-4">
                  <span class={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${section.palette.iconBg}`}>
                    {section.icon}
                  </span>
                  <div>
                    <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Sección {index + 1} de {sectionCount}</p>
                    <h3 class="mt-1 text-2xl font-semibold text-white">{section.title}</h3>
                    <p class="mt-2 text-sm text-slate-300">{section.intro}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-400">
                  <span class="inline-flex h-2 w-6 rounded-full bg-slate-700">
                    <span class={`block h-full rounded-full ${currentSection === index ? 'w-full bg-indigo-400' : 'w-1 bg-transparent'}`}></span>
                  </span>
                  {index + 1}/{sectionCount}
                </div>
              </header>

              <div class="space-y-6">
                {#if section.subsections}
                  <div class="grid gap-5 lg:grid-cols-2">
                    {#each section.subsections as subsection}
                      {@const badgeColors = getBadgeColors(subsection.badge)}
                      <div class="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                        <div class="flex items-start justify-between gap-3">
                          <h4 class="text-lg font-semibold text-white">{subsection.title}</h4>
                          <span class={`text-xs px-2 py-1 rounded-full border ${badgeColors.border} ${badgeColors.bg} ${badgeColors.text}`}>
                            {subsection.badge}
                          </span>
                        </div>
                        <p class="mt-3 text-sm text-slate-300">{subsection.explanation}</p>

                        {#if subsection.wordExamples && subsection.wordExamples.length > 0}
                          <div class="mt-4 space-y-2">
                            {#each subsection.wordExamples as example}
                              <div class="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                                <div class="flex-1">
                                  <p class="text-white font-medium">{example.kanji} ({example.kana})</p>
                                  <p class="text-xs text-slate-400">{example.meaning}</p>
                                </div>
                                <button
                                  onclick={() => speak(example.kanji)}
                                  class="rounded-lg border border-slate-700 px-3 py-1 text-sm text-slate-300 transition-colors hover:border-indigo-400 hover:text-indigo-200"
                                  type="button"
                                >
                                  🔊
                                </button>
                              </div>
                            {/each}
                          </div>
                        {/if}

                        {#if subsection.sentenceExamples && subsection.sentenceExamples.length > 0}
                          <div class="mt-4 space-y-3">
                            {#each subsection.sentenceExamples as example}
                              <div class="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                                <p class="text-sm text-white font-japanese">{example.text}</p>
                                <p class="mt-1 text-xs text-slate-400">{example.translation}</p>
                              </div>
                            {/each}
                          </div>
                        {/if}

                        {#if subsection.steps}
                          <ol class="mt-4 space-y-3">
                            {#each subsection.steps as step}
                              <li class="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                                <p class={`text-xs font-semibold uppercase tracking-wide ${section.palette.accentText}`}>{step.step}</p>
                                {#if step.example}
                                  <p class="mt-1 text-sm text-slate-300">{step.example}</p>
                                {/if}
                                {#if step.examples}
                                  <div class="mt-2 space-y-1 text-xs text-slate-400 font-mono">
                                    {#each step.examples as exampleText}
                                      <p>• {exampleText}</p>
                                    {/each}
                                  </div>
                                {/if}
                                {#if step.note}
                                  <p class="mt-2 text-xs text-amber-300">💡 {step.note}</p>
                                {/if}
                              </li>
                            {/each}
                          </ol>
                        {/if}

                        {#if subsection.conjugations}
                          <div class="mt-4 space-y-4">
                            {#each subsection.conjugations as conjugation}
                              <div class="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                                <p class="text-sm font-semibold text-white">{conjugation.verb}</p>
                                <div class="mt-3 grid gap-2">
                                  {#each conjugation.forms as form}
                                    <div class="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2">
                                      <span class="text-xs text-slate-400">{form.form}</span>
                                      <span class="text-sm font-medium text-white">{form.result}</span>
                                    </div>
                                  {/each}
                                </div>
                              </div>
                            {/each}
                          </div>
                        {/if}
                      </div>
                    {/each}
                  </div>
                {/if}

                {#if section.tips}
                  <div class="grid gap-3 md:grid-cols-2">
                    {#each section.tips as tip}
                      <div class="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                        <div class="flex items-start gap-3">
                          <span class="text-2xl">{tip.icon}</span>
                          <div class="flex-1">
                            <div class="flex items-center justify-between">
                              <h4 class="text-base font-semibold text-white">{tip.title}</h4>
                              <span class={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                                tip.priority === 'Alta'
                                  ? 'border-red-500/50 bg-red-500/10 text-red-200'
                                  : 'border-blue-500/50 bg-blue-500/10 text-blue-200'
                              }`}>
                                {tip.priority}
                              </span>
                            </div>
                            <p class="mt-2 text-sm text-slate-300">{tip.description}</p>
                          </div>
                        </div>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            </article>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .font-japanese {
    font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic Pro', 'Meiryo', sans-serif;
  }
</style>
