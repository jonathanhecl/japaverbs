<script lang="ts">
	import { speak } from '$lib/utils/tts';
	import type { Verb } from '$lib/types/verb';

	let { verb }: { verb: Verb } = $props();

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

	function handleSpeak() {
		speak(verb.kanji || verb.kana, {
			fallbackText: verb.meaning,
			fallbackLang: 'es-ES'
		});
	}
</script>

<article class="bg-slate-900/50 backdrop-blur-lg border-2 border-slate-800 rounded-xl p-6 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all">
	<div class="flex justify-between items-start mb-4">
		<div class="flex-1">
			<div class="flex items-center gap-3 mb-2">
				<h2 class="text-3xl font-bold text-white">{verb.kanji}</h2>
				<button
					onclick={handleSpeak}
					class="p-2 rounded-full hover:bg-slate-800 transition-colors text-2xl"
					aria-label="Reproducir audio"
				>
					🔊
				</button>
			</div>
			<div class="text-xl text-slate-300 mb-1">{verb.kana}</div>
			<div class="text-sm text-slate-500">{verb.romaji}</div>
		</div>
	</div>

	<div class="mb-4">
		<p class="text-xl text-indigo-300 font-semibold">{verb.meaning}</p>
	</div>

	<div class="flex gap-2 mb-4">
		<span
			class="px-3 py-1 rounded-full text-xs font-medium border {getVerbTypeColor(verb.type)}"
		>
			{getVerbTypeLabel(verb.type)}
		</span>
		<span class="px-3 py-1 rounded-full text-xs font-medium border bg-indigo-500/20 text-indigo-400 border-indigo-500/50">
			JLPT N5
		</span>
	</div>

	{#if verb.examples && verb.examples.length > 0}
		<div class="space-y-3 border-t border-slate-800 pt-4 mt-4">
			<h3 class="font-semibold text-sm text-slate-400 uppercase tracking-wide">Ejemplos</h3>
			{#each verb.examples as example, i}
				<div class="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
					<div class="flex items-start gap-2 mb-1">
						<span class="text-slate-500 font-mono text-xs mt-1">{i + 1}.</span>
						<div class="flex-1">
							<p class="text-white mb-1 font-japanese">{example.ja}</p>
							<p class="text-slate-400 text-sm">{example.es}</p>
						</div>
						<button
							onclick={() => speak(example.ja, { fallbackText: example.es, fallbackLang: 'es-ES' })}
							class="p-1 rounded hover:bg-slate-700 transition-colors text-sm"
							aria-label="Reproducir ejemplo"
						>
							🔊
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</article>

<style>
	.font-japanese {
		font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic Pro', 'Meiryo', sans-serif;
	}
</style>
