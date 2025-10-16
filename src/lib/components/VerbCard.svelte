<script lang="ts">
	import { speak } from '$lib/utils/tts';
	import type { Verb } from '$lib/types/verb';
	import { conjugateVerb } from '$lib/utils/conjugation';
	import { userProfile, getMasteryPercentage, getMasteryLevel } from '$lib/stores/userProgress';

	let { verb }: { verb: Verb } = $props();
	let isExpanded = $state(false);
	let hasAutoPlayed = $state(false);

	function getVerbTypeLabel(type: string): string {
		switch (type) {
			case 'godan':
				return 'Godan (五段)';
			case 'ichidan':
				return 'Ichidan (一段)';
			case 'irregular':
				return 'Irregular';
			default:
				return type;
		}
	}

	function getVerbTypeColor(type: string): string {
		switch (type) {
			case 'godan':
				return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
			case 'ichidan':
				return 'bg-green-500/20 text-green-400 border-green-500/50';
			case 'irregular':
				return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
			default:
				return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
		}
	}

	const conjugations = conjugateVerb(verb);

	// Obtener progreso del verbo
	const verbProgress = $derived($userProfile.studiedVerbs[verb.kanji] || null);
	const masteryScore = $derived(verbProgress?.masteryScore ?? 0);
	const masteryPercentage = $derived(getMasteryPercentage(masteryScore));
	const masteryLevel = $derived(getMasteryLevel(masteryScore));

	// Auto-reproducir audio al expandir
	$effect(() => {
		if (isExpanded && !hasAutoPlayed) {
			setTimeout(() => {
				speak(verb.kanji || verb.kana, {
					fallbackText: verb.meaning,
					fallbackLang: 'es-ES'
				});
				hasAutoPlayed = true;
			}, 300);
		}
		
		// Resetear flag cuando se colapsa
		if (!isExpanded) {
			hasAutoPlayed = false;
		}
	});

	function handleSpeak() {
		const status = speak(verb.kanji || verb.kana, {
			fallbackText: verb.meaning,
			fallbackLang: 'es-ES'
		});

		if (status === 'fallback') {
			window.open('/tts', '_blank');
		}
	}

	function toggleExpand() {
		isExpanded = !isExpanded;
	}
</script>

<article class="bg-slate-900/50 backdrop-blur-lg border-2 border-slate-800 rounded-xl overflow-hidden hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all">
	<!-- Vista compacta (siempre visible) -->
	<div class="p-4">
		<div class="flex items-start justify-between gap-3">
			<div class="flex-1 min-w-0">
				<!-- Kanji y Kana -->
				<div class="flex items-baseline gap-2 mb-1">
					<h2 class="text-2xl font-bold text-white truncate">{verb.kanji}</h2>
					<span class="text-lg text-slate-300">{verb.kana}</span>
				</div>
				
				<!-- Significado -->
				<p class="text-base text-indigo-300 font-medium mb-2">{verb.meaning}</p>
				
				<!-- Tags y Progreso -->
				<div class="flex flex-wrap items-center gap-2">
					<span
						class="px-2 py-0.5 rounded-full text-xs font-medium border {getVerbTypeColor(verb.type)}"
					>
						{getVerbTypeLabel(verb.type)}
					</span>
					
					{#if verbProgress}
						<span class="px-2 py-0.5 rounded-full text-xs font-medium border bg-slate-800/50 {masteryLevel.color} border-slate-700">
							📊 {masteryPercentage}% · {masteryLevel.label}
						</span>
					{/if}
				</div>
			</div>
			
			<!-- Botón expandir -->
			<button
				onclick={toggleExpand}
				class="flex-shrink-0 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all active:scale-95"
				aria-label={isExpanded ? 'Contraer' : 'Expandir'}
			>
				{isExpanded ? '▲' : '▼'}
			</button>
		</div>
	</div>

	<!-- Vista expandida (solo visible cuando isExpanded = true) -->
	{#if isExpanded}
		<div class="border-t border-slate-800 p-4 space-y-4 animate-slideDown">
			<!-- Romaji y Audio -->
			<div class="flex items-center gap-3">
				<span class="text-sm text-slate-400">{verb.romaji}</span>
				<button
					onclick={handleSpeak}
					class="p-2 rounded-full hover:bg-slate-800 transition-colors text-xl"
					aria-label="Reproducir audio"
				>
					🔊
				</button>
			</div>

			<!-- Conjugaciones -->
			<div>
				<h3 class="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-2">Conjugaciones clave</h3>
				<div class="grid gap-2 sm:grid-cols-2">
					{#each conjugations as form (form.key)}
						<div class="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
							<p class="text-xs font-semibold text-indigo-300">{form.label}</p>
							<p class="mt-1 text-base font-medium text-white">{form.kana}</p>
							<p class="mt-1 text-sm text-emerald-400">→ {form.translation}</p>
							<p class="mt-1 text-xs text-slate-400">{form.description}</p>
						</div>
					{/each}
				</div>
			</div>

			<!-- Ejemplos -->
			{#if verb.examples && verb.examples.length > 0}
				<div>
					<h3 class="font-semibold text-sm text-slate-400 uppercase tracking-wide mb-2">Ejemplos</h3>
					<div class="space-y-2">
						{#each verb.examples as example, i}
							<div class="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
								<div class="flex items-start gap-2">
									<span class="text-slate-500 font-mono text-xs mt-1">{i + 1}.</span>
									<div class="flex-1">
										<p class="text-white mb-1 font-japanese">{example.ja}</p>
										<p class="text-slate-400 text-sm">{example.es}</p>
									</div>
									<button
										onclick={() => speak(example.ja)}
										class="p-1 rounded hover:bg-slate-700 transition-colors text-sm"
										aria-label="Reproducir ejemplo"
									>
										🔊
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</article>

<style>
	.font-japanese {
		font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic Pro', 'Meiryo', sans-serif;
	}
</style>
