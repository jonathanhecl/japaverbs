<script lang="ts">
	import { speak } from '$lib/utils/tts';
	import type { VerbWithTranslation } from '$lib/types/verb';
	import { conjugateVerb } from '$lib/utils/conjugation';
	import { userProfile, getMasteryPercentage, getMasteryLevel } from '$lib/stores/userProgress';

	let { verb }: { verb: VerbWithTranslation } = $props();
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

	function getFrequencyColor(freq?: string): string {
		switch (freq) {
			case 'high':
				return 'bg-red-500/20 text-red-400 border-red-500/50';
			case 'medium':
				return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
			case 'low':
				return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
			default:
				return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
		}
	}

	function getFrequencyLabel(freq?: string): string {
		switch (freq) {
			case 'high':
				return 'Alta';
			case 'medium':
				return 'Media';
			case 'low':
				return 'Baja';
			default:
				return 'N/A';
		}
	}

	const conjugations = conjugateVerb(verb);

	function speakKana(text: string) {
		if (!text) return 'unsupported';
		console.log('[TTS][VerbCard] Reproduciendo:', text);
		return speak(text);
	}
	
	// Agrupar conjugaciones por categoría según JLPT N5
	const basicForm = conjugations.filter((form) => form.key === 'dictionary');
	const formalForms = conjugations.filter((form) => 
		form.key.startsWith('masu') || 
		form.key === 'invitation' || 
		form.key === 'desireFormal' || 
		form.key === 'permission' || 
		form.key === 'prohibition' || 
		form.key === 'progressiveFormal'
	);
	const informalForms = conjugations.filter((form) => 
		form.key === 'plainNegative' || 
		form.key === 'plainPast' || 
		form.key === 'plainPastNegative' || 
		form.key === 'desireInformal' || 
		form.key === 'invitationInformal' || 
		form.key === 'request' || 
		form.key === 'negativeRequest' || 
		form.key === 'progressiveInformal'
	);
	
	// Función para obtener color según el tipo de forma
	function getFormColor(key: string) {
		switch(key) {
			// Diccionario (gris)
			case 'dictionary': return { bg: 'bg-slate-500/10', border: 'border-slate-500/40', text: 'text-slate-200', label: 'Diccionario' };
			
			// Formales (azul)
			case 'masuPresent': 
			case 'masuPresentNegative': 
			case 'masuPast': 
			case 'masuPastNegative': 
			case 'invitation': 
			case 'desireFormal': 
			case 'permission': 
			case 'prohibition': 
			case 'progressiveFormal': 
				return { bg: 'bg-blue-500/10', border: 'border-blue-500/40', text: 'text-blue-200', label: 'Formal' };
			
			// Pasado (naranja)
			case 'plainPast': 
			case 'plainPastNegative': 
				return { bg: 'bg-orange-500/10', border: 'border-orange-500/40', text: 'text-orange-200', label: 'Pasado' };
			
			// Versátil (púrpura)
			case 'request': 
			case 'progressiveInformal': 
				return { bg: 'bg-purple-500/10', border: 'border-purple-500/40', text: 'text-purple-200', label: 'Versátil' };
			
			// Negativa (rojo)
			case 'plainNegative': 
			case 'negativeRequest': 
				return { bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-200', label: 'Negativa' };
			
			default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/40', text: 'text-slate-200', label: '' };
		}
	}

	// Obtener progreso del verbo
	const verbProgress = $derived($userProfile.studiedVerbs[verb.kanji] || null);
	const masteryScore = $derived(verbProgress?.masteryScore ?? 0);
	const masteryPercentage = $derived(getMasteryPercentage(masteryScore));
	const masteryLevel = $derived(getMasteryLevel(masteryScore));

	// Auto-reproducir audio al expandir
	$effect(() => {
		if (isExpanded && !hasAutoPlayed) {
			setTimeout(() => {
				speakKana(verb.kana || verb.kanji);
				hasAutoPlayed = true;
			}, 300);
		}
		
		// Resetear flag cuando se colapsa
		if (!isExpanded) {
			hasAutoPlayed = false;
		}
	});

	function handleSpeak() {
		const status = speakKana(verb.kana || verb.kanji);

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
					<button
						onclick={handleSpeak}
						class="p-2 rounded-full hover:bg-slate-800 transition-colors text-xl"
						aria-label="Reproducir audio"
					>
						🔊
					</button>
				</div>
				
				<!-- Significado -->
				<p class="text-base text-indigo-300 font-medium mb-2">{verb.translation.meaning}</p>

				
				
				<!-- Tags y Progreso -->
				<div class="flex flex-wrap items-center gap-2">
					<span
						class="px-2 py-0.5 rounded-full text-xs font-medium border {getVerbTypeColor(verb.type)}"
					>
						{getVerbTypeLabel(verb.type)}
					</span>
					
					<span
						class="px-2 py-0.5 rounded-full text-xs font-medium border {getFrequencyColor(verb.freq)}"
					>
						🔥 {getFrequencyLabel(verb.freq)}
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
			<!-- Conjugaciones -->
			<div>
				<h3 class="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3">Conjugaciones</h3>

				<!-- Formas Formales (ます形) -->
				{#if formalForms.length}
					<div class="mb-4">
						<div class="rounded-2xl border border-blue-500/40 bg-blue-500/10 p-4">
							<h4 class="text-sm font-semibold uppercase tracking-wide text-blue-200 mb-3">Formales (ます形)</h4>
							<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
								{#each formalForms as form (form.key)}
									{@const colors = getFormColor(form.key)}
									<div class="rounded-xl border {colors.border} bg-slate-900/80 p-3">
										<div class="flex items-start justify-between gap-2">
											<div class="flex-1 min-w-0">
												<p class="text-xs font-medium uppercase tracking-wide {colors.text} mb-1">
													{form.label.split('(')[0].trim()}
												</p>
												<p class="text-base font-medium text-white mb-1">{form.kana}</p>
												<p class="text-xs text-emerald-400 mb-1">→ {form.translation}</p>
												<p class="text-xs text-slate-400">{form.description}</p>
											</div>
											<button
												onclick={() => speakKana(form.kana)}
												class="p-1.5 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white flex-shrink-0"
												aria-label="Escuchar pronunciación"
											>
												🔊
											</button>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/if}

				<!-- Formas Informales (普通形) -->
				{#if informalForms.length}
					<div>
						<div class="rounded-2xl border border-slate-600/40 bg-slate-700/10 p-4">
							<h4 class="text-sm font-semibold uppercase tracking-wide text-slate-200 mb-3">Informales (普通形)</h4>
							<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
								{#each informalForms as form (form.key)}
									{@const colors = getFormColor(form.key)}
									<div class="rounded-xl border {colors.border} bg-slate-900/80 p-3">
										<div class="flex items-start justify-between gap-2">
											<div class="flex-1 min-w-0">
												<p class="text-xs font-medium uppercase tracking-wide {colors.text} mb-1">
													{form.label.split('(')[0].trim()}
												</p>
												<p class="text-base font-medium text-white mb-1">{form.kana}</p>
												<p class="text-xs text-emerald-400 mb-1">→ {form.translation}</p>
												<p class="text-xs text-slate-400">{form.description}</p>
											</div>
											<button
												onclick={() => speakKana(form.kana)}
												class="p-1.5 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white flex-shrink-0"
												aria-label="Escuchar pronunciación"
											>
												🔊
											</button>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Ejemplos -->
			{#if verb.translation.examples && verb.translation.examples.length > 0}
				<div>
					<h3 class="font-semibold text-sm text-slate-400 uppercase tracking-wide mb-2">Ejemplos</h3>
					<div class="space-y-2">
						{#each verb.translation.examples as example, i}
							<div class="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
								<div class="flex items-start gap-2">
									<span class="text-slate-500 font-mono text-xs mt-1">{i + 1}.</span>
									<div class="flex-1">
										<p class="text-white mb-1 font-japanese">{example.ja}</p>
										<p class="text-slate-400 text-sm">{example.es}</p>
									</div>
									<button
										onclick={() => speakKana(example.kana || example.ja)}
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
