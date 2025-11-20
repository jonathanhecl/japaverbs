<script lang="ts">
  import { speak } from '$lib/utils/tts';
  import { tick } from 'svelte';

  let currentSection = $state(0);
  let sectionCarouselEl: HTMLDivElement | null = null;
  let touchStartX = $state<number | null>(null);

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
      case 'Informal':
        return { bg: 'bg-slate-600/20', text: 'text-slate-200', border: 'border-slate-600/50' };
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
      title: 'Formas de conjugación JLPT N5',
      icon: '📚',
      color: 'purple',
      palette: getSectionPalette('purple'),
      intro: 'Las conjugaciones japonesas se organizan en dos categorías principales: formales (ます形) e informales (普通形). Ambas son esenciales para el JLPT N5.',
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
          title: 'Formales (ます形)',
          badge: 'Formal',
          explanation: 'Las formas formales se usan en conversaciones corteses, con superiores o en situaciones profesionales. Todas terminan en ます o ません.',
          wordExamples: [
            { kanji: '食べます', kana: 'たべます', romaji: 'tabemasu', meaning: 'como' },
            { kanji: '食べません', kana: 'たべません', romaji: 'tabemasen', meaning: 'no como' },
            { kanji: '食べました', kana: 'たべました', romaji: 'tabemashita', meaning: 'comí' },
            { kanji: '食べませんでした', kana: 'たべませんでした', romaji: 'tabemasen deshita', meaning: 'no comí' }
          ],
          sentenceExamples: [
            { text: '日本語を勉強します。', translation: 'Estudio japonés.' },
            { text: '昨日、本を読みませんでした。', translation: 'Ayer no leí un libro.' }
          ]
        },
        {
          title: 'Formales especiales',
          badge: 'Formal',
          explanation: 'Formas formales adicionales para expresar deseos, invitaciones, permisos y acciones en progreso.',
          wordExamples: [
            { kanji: '食べたいです', kana: 'たべたいです', romaji: 'tabetai desu', meaning: 'quiero comer' },
            { kanji: '食べましょう', kana: 'たべましょう', romaji: 'tabemashou', meaning: 'comamos' },
            { kanji: '食べています', kana: 'たべています', romaji: 'tabete imasu', meaning: 'estoy comiendo' }
          ],
          sentenceExamples: [
            { text: '一緒に映画を見ましょう。', translation: 'Vamos a ver una película juntos.' },
            { text: '今、ご飯を食べています。', translation: 'Ahora estoy comiendo.' }
          ]
        },
        {
          title: 'Informales (普通形)',
          badge: 'Informal',
          explanation: 'Las formas informales se usan con amigos, familia o en situaciones casuales. Son más directas y cortas.',
          wordExamples: [
            { kanji: '食べる', kana: 'たべる', romaji: 'taberu', meaning: 'como/comeré' },
            { kanji: '食べない', kana: 'たべない', romaji: 'tabenai', meaning: 'no como' },
            { kanji: '食べた', kana: 'たべた', romaji: 'tabeta', meaning: 'comí' },
            { kanji: '食べなかった', kana: 'たべなかった', romaji: 'tabenakatta', meaning: 'no comí' }
          ],
          sentenceExamples: [
            { text: '今日、映画を見る。', translation: 'Hoy veo una película.' },
            { text: '昨日、本を読まなかった。', translation: 'Ayer no leí un libro.' }
          ]
        },
        {
          title: 'Informales especiales',
          badge: 'Informal',
          explanation: 'Formas informales para deseos, peticiones, invitaciones casuales y acciones en progreso.',
          wordExamples: [
            { kanji: '食べたい', kana: 'たべたい', romaji: 'tabetai', meaning: 'quiero comer' },
            { kanji: '食べて', kana: 'たべて', romaji: 'tabete', meaning: 'come/por favor' },
            { kanji: '食べないで', kana: 'たべないで', romaji: 'tabenaide', meaning: 'no comas' },
            { kanji: '食べている', kana: 'たべている', romaji: 'tabete iru', meaning: 'estoy comiendo' }
          ],
          sentenceExamples: [
            { text: 'ご飯を食べて、寝る。', translation: 'Como y luego duermo.' },
            { text: '今、ご飯を食べている。', translation: 'Ahora estoy comiendo.' }
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
          explanation: 'Los verbos Ichidan son los más simples de conjugar. Solo quita る y añade el sufijo.',
          steps: [
            { step: '1. Identifica el verbo', example: '食べる (taberu) - comer' },
            { step: '2. Quita る', example: '食べ (tabe)' },
            { step: '3. Añade el sufijo formal', examples: [
              'Formales (ます形):',
              'ます → 食べます (tabemasu) - como',
              'ません → 食べません (tabemasen) - no como',
              'ました → 食べました (tabemashita) - comí',
              'ませんでした → 食べませんでした (tabemasen deshita) - no comí'
            ]},
            { step: '4. Añade el sufijo informal', examples: [
              'Informales (普通形):',
              'る → 食べる (taberu) - como/comeré',
              'ない → 食べない (tabenai) - no como',
              'た → 食べた (tabeta) - comí',
              'なかった → 食べなかった (tabenakatta) - no comí'
            ]},
            { step: '5. Formas especiales', examples: [
              'Deseo: たいです/たい → 食べたいです/食べたい',
              'Invitación: ましょう → 食べましょう',
              'Petición: て → 食べて',
              'Progresivo: ています/ている → 食べています/食べている'
            ]}
          ]
        },
        {
          title: 'Conjugando verbos Godan',
          badge: 'Medio',
          explanation: 'Los verbos Godan requieren cambiar la vocal final según reglas específicas.',
          steps: [
            { step: '1. Identifica el verbo', example: '行く (iku) - ir' },
            { step: '2. Cambia la terminación -u para formas formales', examples: [
              'く → き + ます → 行きます (ikimasu)',
              'く → き + ません → 行きません (ikimasen)',
              'く → き + ました → 行きました (ikimashita)',
              'く → き + ませんでした → 行きませんでした (ikimasen deshita)'
            ]},
            { step: '3. Cambia para formas informales', examples: [
              'く → か + ない → 行かない (ikanai)',
              'く → った → 行った (itta) - Excepción de 行く',
              'く → か + なかった → 行かなかった (ikanakatta)'
            ]},
            { step: '4. Forma te especial', examples: [
              'く → って → 行って (itte) - Excepción de 行く',
              'Formas especiales: 行きたい/行きたいです, 行こう, 行っている/行っています'
            ]},
            { step: '5. Atención a irregularidades', note: 'Los verbos que terminan en -ku/-gu/-su/-tsu/-nu/-bu/-mu/-ru tienen cambios específicos en la forma te. 行く es una excepción: su forma te es 行って (no 行いて).' }
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
                { form: 'Formales', result: 'します/しません/しました/しませんでした' },
                { form: 'Informales', result: 'する/しない/した/しなかった' },
                { form: 'Especiales', result: 'したい/したいです/しよう/して/しないで/している/しています' }
              ]
            },
            {
              verb: '来る (kuru) - venir',
              forms: [
                { form: 'Formales', result: 'きます/きません/きました/きませんでした' },
                { form: 'Informales', result: 'くる/こない/きた/こなかった' },
                { form: 'Especiales', result: 'きたい/きたいです/こよう/きて/こないで/きている/きています' }
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
          title: 'Domina la dualidad formal/informal',
          icon: '🎯',
          description: 'Aprende siempre las formas en pares: formal (ます形) e informal (普通形). Por ejemplo: 食べます/食べる, 食べません/食べない.',
          priority: 'Alta'
        },
        {
          title: 'Prioriza las 9 formas esenciales',
          icon: '🔥',
          description: 'Para JLPT N5, enfócate en: presente formal/informal, negativo formal/informal, pasado formal/informal, deseo, invitación y progresivo.',
          priority: 'Alta'
        },
        {
          title: 'Practica la forma て',
          icon: '🔗',
          description: 'La forma て es clave para peticiones (食べて), progresivo (食べている/食べています) y conectar acciones. Úsala: 朝起きて、顔を洗って、朝ごはんを食べます.',
          priority: 'Alta'
        },
        {
          title: 'Memoriza patrones por tipo',
          icon: '📋',
          description: 'Ichidan: solo quita る. Godan: cambia vocal final. Irregulares: memorizar する y 来る. Agrupa verbos por tipo para practicar.',
          priority: 'Media'
        },
        {
          title: 'Usa flashcards por categoría',
          icon: '🎴',
          description: 'Crea tarjetas separadas: una cara con formas formales, otra con informales. Practica ambas direcciones.',
          priority: 'Alta'
        },
        {
          title: 'Contexto real',
          icon: '📖',
          description: 'Usa las 18 formas en frases reales. Por ejemplo: 食べたいです vs 食べたい, 食べてください vs 食べて.',
          priority: 'Alta'
        },
        {
          title: 'Errores comunes',
          icon: '⚠️',
          description: 'No mezcles formal/informal incorrectamente. 食べますない (incorrecto) → 食べません (correcto). 食べるません (incorrecto) → 食べません (correcto).',
          priority: 'Media'
        },
        {
          title: 'Practica todos los días',
          icon: '📅',
          description: 'Dedica 10-15 minutos diarios. Alterna entre formas formales e informales para mantener el equilibrio.',
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

  function handleTouchStart(event: TouchEvent) {
    if (event.touches.length > 0) {
      touchStartX = event.touches[0].clientX;
    }
  }

  function handleTouchEnd(event: TouchEvent) {
    if (touchStartX === null || event.changedTouches.length === 0) {
      touchStartX = null;
      return;
    }

    const touchEndX = event.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    const threshold = 50;

    if (deltaX > threshold) {
      prevSection();
    } else if (deltaX < -threshold) {
      nextSection();
    }

    touchStartX = null;
  }
</script>

<svelte:head>
  <title>Guía de conjugación de verbos · JapaVerbs</title>
  <meta name="description" content="Aprende a conjugar verbos godan, ichidan e irregulares con ejemplos prácticos." />
</svelte:head>

  <section class="space-y-8 pb-10">
    <header class="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-indigo-900/50 via-slate-900 to-slate-900 p-[1px] shadow-2xl">
      <div class="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div class="relative rounded-[calc(theme(borderRadius.3xl)-1px)] bg-slate-950/50 p-8 backdrop-blur-xl">
        <div class="flex items-center gap-6">
          <div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-4xl shadow-inner border border-slate-800">
            🈂️
          </div>
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-300 border border-green-500/20">
              Guía Completa
            </div>
            <h1 class="text-3xl font-black text-white tracking-tight">Guía de verbos</h1>
            <p class="text-slate-400 max-w-lg leading-relaxed">
              Comprende cómo se clasifican, se conjugan y se aplican los verbos con ejemplos claros y recursos prácticos.
            </p>
          </div>
        </div>
      </div>
    </header>

    <div class="rounded-3xl border border-slate-800 bg-slate-950/50 p-6 md:p-8 backdrop-blur-sm">
      <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold">Índice interactivo</p>
          <h2 class="mt-2 text-2xl font-bold text-white">Aprende sobre verbos japoneses</h2>
          <p class="mt-2 text-sm text-slate-400 max-w-2xl">Explora cada tema y profundiza en las tarjetas de referencia para dominar las conjugaciones.</p>
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

    <div class="mt-6">
      <div
        class="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/60"
        bind:this={sectionCarouselEl}
        onscroll={handleCarouselScroll}
        ontouchstart={handleTouchStart}
        ontouchend={handleTouchEnd}
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
                                <div class="flex items-start justify-between gap-3">
                                  <p class="text-sm text-white font-japanese">{example.text}</p>
                                  <button
                                    onclick={() => speak(example.text)}
                                    class="rounded-lg border border-slate-700 px-3 py-1 text-sm text-slate-300 transition-colors hover:border-indigo-400 hover:text-indigo-200"
                                    type="button"
                                  >
                                    🔊
                                  </button>
                                </div>
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
