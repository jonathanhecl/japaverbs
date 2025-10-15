<script lang="ts">
  import { speak } from '$lib/utils/tts';

  let expandedSection = $state<number | null>(null);

  const sections = [
    {
      title: 'Tipos de verbos japoneses',
      icon: '🧭',
      color: 'indigo',
      intro: 'Los verbos japoneses se clasifican en tres grupos principales según su patrón de conjugación.',
      subsections: [
        {
          title: 'Verbos Godan (五段)',
          badge: 'Grupo 1',
          examples: [
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
          examples: [
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
          examples: [
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
      intro: 'Cada verbo japonés tiene múltiples formas que expresan tiempo, cortesía y modo.',
      subsections: [
        {
          title: 'Forma Diccionario (辞書形)',
          badge: 'Básica',
          explanation: 'Es la forma base del verbo. Se usa en contextos informales y es la forma que aparece en los diccionarios.',
          examples: [
            { text: '明日、映画を見る。', translation: 'Mañana veré una película.' }
          ]
        },
        {
          title: 'Forma Masu (ます形)',
          badge: 'Formal',
          explanation: 'Forma cortés del presente/futuro. Es esencial para conversaciones formales.',
          examples: [
            { text: '日本語を勉強します。', translation: 'Estudio japonés.' },
            { text: '明日行きます。', translation: 'Iré mañana.' }
          ]
        },
        {
          title: 'Forma Ta (た形)',
          badge: 'Pasado',
          explanation: 'Expresa acciones completadas en el pasado (informal).',
          examples: [
            { text: '昨日、友達に会った。', translation: 'Ayer vi a un amigo.' },
            { text: '朝ごはんを食べた。', translation: 'Desayuné.' }
          ]
        },
        {
          title: 'Forma Te (て形)',
          badge: 'Versátil',
          explanation: 'Una de las formas más importantes. Se usa para conectar verbos, hacer peticiones y formar el progresivo.',
          examples: [
            { text: 'ご飯を食べて、寝る。', translation: 'Como y luego duermo.' },
            { text: '今、勉強している。', translation: 'Ahora estoy estudiando.' },
            { text: '手伝ってください。', translation: 'Por favor ayúdame.' }
          ]
        },
        {
          title: 'Forma Nai (ない形)',
          badge: 'Negativa',
          explanation: 'Forma negativa informal del presente/futuro.',
          examples: [
            { text: '今日は行かない。', translation: 'Hoy no voy.' },
            { text: 'お酒を飲まない。', translation: 'No bebo alcohol.' }
          ]
        },
        {
          title: 'Forma Mashita (ました形)',
          badge: 'Pasado Formal',
          explanation: 'Pasado cortés. Combina cortesía con tiempo pasado.',
          examples: [
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

  function toggleSection(index: number) {
    expandedSection = expandedSection === index ? null : index;
  }
</script>

<svelte:head>
  <title>Guía de conjugación de verbos · JapaVerbs N5</title>
  <meta name="description" content="Aprende a conjugar verbos godan, ichidan e irregulares con ejemplos prácticos para JLPT N5." />
</svelte:head>

<section class="space-y-6 pb-6">
  <header class="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-center">
    <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-3xl">
      🈂️
    </div>
    <h1 class="mt-4 text-3xl font-bold text-white">Guía completa de conjugación</h1>
    <p class="mt-2 text-sm text-slate-300">
      Domina las conjugaciones verbales del japonés con ejemplos detallados y ejercicios prácticos
    </p>
    <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
      <a href="/diccionario" class="rounded-2xl bg-white px-5 py-2 text-sm font-semibold text-indigo-700 active:scale-95 transition-transform">
        📚 Ver diccionario
      </a>
      <a href="/practica" class="rounded-2xl border border-indigo-500/50 px-5 py-2 text-sm font-semibold text-indigo-100 active:scale-95 transition-transform">
        🎮 Ir a práctica
      </a>
    </div>
  </header>

  <div class="space-y-4">
    {#each sections as section, i}
      <article class="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <button
          onclick={() => toggleSection(i)}
          class="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/50 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-{section.color}-500/20 text-2xl">
              {section.icon}
            </div>
            <div>
              <h2 class="text-xl font-semibold text-white">{section.title}</h2>
              <p class="text-sm text-slate-400 mt-1">{section.intro}</p>
            </div>
          </div>
          <div class="text-slate-400 text-2xl transition-transform {expandedSection === i ? 'rotate-180' : ''}">
            ▼
          </div>
        </button>

        {#if expandedSection === i}
          <div class="p-5 pt-0 space-y-6">
            {#if section.subsections}
              {#each section.subsections as subsection}
                <div class="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                  <div class="flex items-start justify-between mb-3">
                    <h3 class="text-lg font-semibold text-white">{subsection.title}</h3>
                    <span class="text-xs px-2 py-1 rounded-full bg-{section.color}-500/20 text-{section.color}-300 border border-{section.color}-500/50">
                      {subsection.badge}
                    </span>
                  </div>
                  
                  <p class="text-sm text-slate-300 mb-4">{subsection.explanation}</p>

                  {#if subsection.examples && subsection.examples.length > 0 && subsection.examples[0].kanji}
                    <div class="grid gap-2">
                      {#each subsection.examples as example}
                        <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                          <div class="flex-1">
                            <p class="text-white font-medium">{example.kanji} ({example.kana})</p>
                            <p class="text-sm text-slate-400">{example.meaning}</p>
                          </div>
                          <button
                            onclick={() => speak(example.kanji)}
                            class="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                          >
                            🔊
                          </button>
                        </div>
                      {/each}
                    </div>
                  {/if}

                  {#if subsection.examples && subsection.examples.length > 0 && subsection.examples[0].text}
                    <div class="space-y-2">
                      {#each subsection.examples as example}
                        <div class="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                          <p class="text-white font-japanese mb-1">{example.text}</p>
                          <p class="text-sm text-slate-400">{example.translation}</p>
                        </div>
                      {/each}
                    </div>
                  {/if}

                  {#if subsection.steps}
                    <div class="space-y-3">
                      {#each subsection.steps as step}
                        <div class="pl-4 border-l-2 border-{section.color}-500">
                          <p class="text-sm font-semibold text-{section.color}-300 mb-1">{step.step}</p>
                          {#if step.example}
                            <p class="text-sm text-slate-300">{step.example}</p>
                          {/if}
                          {#if step.examples}
                            <div class="space-y-1 mt-2">
                              {#each step.examples as ex}
                                <p class="text-xs text-slate-400 font-mono">• {ex}</p>
                              {/each}
                            </div>
                          {/if}
                          {#if step.note}
                            <p class="text-xs text-amber-400 mt-2">💡 {step.note}</p>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  {/if}

                  {#if subsection.conjugations}
                    <div class="space-y-4">
                      {#each subsection.conjugations as conj}
                        <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                          <h4 class="text-base font-semibold text-white mb-3">{conj.verb}</h4>
                          <div class="grid gap-2">
                            {#each conj.forms as form}
                              <div class="flex justify-between items-center p-2 rounded-lg bg-slate-950/50">
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
            {/if}

            {#if section.tips}
              <div class="grid gap-3">
                {#each section.tips as tip}
                  <div class="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <div class="flex items-start gap-3 mb-2">
                      <span class="text-2xl">{tip.icon}</span>
                      <div class="flex-1">
                        <div class="flex items-center justify-between mb-1">
                          <h3 class="text-base font-semibold text-white">{tip.title}</h3>
                          <span class="text-xs px-2 py-1 rounded-full {
                            tip.priority === 'Alta' 
                              ? 'bg-red-500/20 text-red-300 border border-red-500/50' 
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                          }">
                            {tip.priority}
                          </span>
                        </div>
                        <p class="text-sm text-slate-400">{tip.description}</p>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </article>
    {/each}
  </div>
</section>

<style>
  .font-japanese {
    font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic Pro', 'Meiryo', sans-serif;
  }
</style>
