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
				return 'bg-blue-100 text-blue-800 border-blue-200';
			case 'ichidan':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'irregular':
				return 'bg-purple-100 text-purple-800 border-purple-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	}

	function handleSpeak() {
		speak(verb.kanji || verb.kana);
	}
</script>

<article class="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all bg-white">
	<div class="flex justify-between items-start mb-4">
		<div class="flex-1">
			<div class="flex items-center gap-3 mb-2">
				<h2 class="text-3xl font-bold text-gray-900">{verb.kanji}</h2>
				<button
					onclick={handleSpeak}
					class="p-2 rounded-full hover:bg-gray-100 transition-colors text-2xl"
					aria-label="Reproducir audio"
				>
					🔊
				</button>
			</div>
			<div class="text-xl text-gray-600 mb-1">{verb.kana}</div>
			<div class="text-sm text-gray-500">{verb.romaji}</div>
		</div>
	</div>

	<div class="mb-4">
		<p class="text-xl text-gray-800 font-semibold">{verb.meaning}</p>
	</div>

	<div class="flex gap-2 mb-4">
		<span
			class="px-3 py-1 rounded-full text-xs font-medium border {getVerbTypeColor(verb.type)}"
		>
			{getVerbTypeLabel(verb.type)}
		</span>
		<span class="px-3 py-1 rounded-full text-xs font-medium border bg-indigo-100 text-indigo-800 border-indigo-200">
			JLPT N5
		</span>
	</div>

	{#if verb.examples && verb.examples.length > 0}
		<div class="space-y-3 border-t pt-4 mt-4">
			<h3 class="font-semibold text-sm text-gray-700 uppercase tracking-wide">Ejemplos</h3>
			{#each verb.examples as example, i}
				<div class="bg-gray-50 p-3 rounded-lg">
					<div class="flex items-start gap-2 mb-1">
						<span class="text-gray-400 font-mono text-xs mt-1">{i + 1}.</span>
						<div class="flex-1">
							<p class="text-gray-900 mb-1 font-japanese">{example.ja}</p>
							<p class="text-gray-600 text-sm">{example.es}</p>
						</div>
						<button
							onclick={() => speak(example.ja)}
							class="p-1 rounded hover:bg-gray-200 transition-colors text-sm"
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
