<script lang="ts">
	import VerbCard from '$lib/components/VerbCard.svelte';
	import type { Verb } from '$lib/types/verb';
	import verbsData from '$lib/data/verbs_n5.json';

	const verbs: Verb[] = verbsData as Verb[];

	let searchQuery = $state('');
	let selectedType = $state<string>('all');

	const filteredVerbs = $derived(() => {
		let result = verbs;

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(verb) =>
					verb.kanji.includes(query) ||
					verb.kana.includes(query) ||
					verb.romaji.toLowerCase().includes(query) ||
					verb.meaning.toLowerCase().includes(query)
			);
		}

		// Filter by type
		if (selectedType !== 'all') {
			result = result.filter((verb) => verb.type === selectedType);
		}

		return result;
	});

	const stats = $derived({
		total: verbs.length,
		godan: verbs.filter((v) => v.type === 'godan').length,
		ichidan: verbs.filter((v) => v.type === 'ichidan').length,
		irregular: verbs.filter((v) => v.type === 'irregular').length
	});
</script>

<div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
	<!-- Header -->
	<header class="bg-white border-b shadow-sm sticky top-0 z-10">
		<div class="container mx-auto px-4 py-6">
			<div class="flex items-center justify-between mb-6">
				<div>
					<h1 class="text-4xl font-bold text-gray-900 mb-2">
						🇯🇵 JapaVerbs <span class="text-indigo-600">N5</span>
					</h1>
					<p class="text-gray-600">Diccionario interactivo de verbos japoneses</p>
				</div>
				<div class="text-right">
					<div class="text-3xl font-bold text-indigo-600">{stats.total}</div>
					<div class="text-sm text-gray-600">verbos</div>
				</div>
			</div>

			<!-- Search and Filters -->
			<div class="flex flex-col md:flex-row gap-4">
				<div class="flex-1">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Buscar por kanji, kana, romaji o significado..."
						class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
					/>
				</div>
				<div class="flex gap-2">
					<button
						onclick={() => (selectedType = 'all')}
						class="px-4 py-3 rounded-lg font-medium transition-all {selectedType === 'all'
							? 'bg-indigo-600 text-white'
							: 'bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-300'}"
					>
						Todos
					</button>
					<button
						onclick={() => (selectedType = 'godan')}
						class="px-4 py-3 rounded-lg font-medium transition-all {selectedType === 'godan'
							? 'bg-blue-600 text-white'
							: 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300'}"
					>
						Godan ({stats.godan})
					</button>
					<button
						onclick={() => (selectedType = 'ichidan')}
						class="px-4 py-3 rounded-lg font-medium transition-all {selectedType === 'ichidan'
							? 'bg-green-600 text-white'
							: 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-300'}"
					>
						Ichidan ({stats.ichidan})
					</button>
					<button
						onclick={() => (selectedType = 'irregular')}
						class="px-4 py-3 rounded-lg font-medium transition-all {selectedType === 'irregular'
							? 'bg-purple-600 text-white'
							: 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300'}"
					>
						Irregular ({stats.irregular})
					</button>
				</div>
			</div>
		</div>
	</header>

	<!-- Verbs Grid -->
	<main class="container mx-auto px-4 py-8">
		<div class="mb-6">
			<p class="text-gray-600">
				Mostrando <span class="font-semibold text-indigo-600">{filteredVerbs().length}</span> verbos
			</p>
		</div>

		{#if filteredVerbs().length === 0}
			<div class="text-center py-16">
				<div class="text-6xl mb-4">🔍</div>
				<p class="text-xl text-gray-600">No se encontraron verbos</p>
				<p class="text-gray-500 mt-2">Intenta con otra búsqueda</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{#each filteredVerbs() as verb (verb.kanji + verb.kana)}
					<VerbCard {verb} />
				{/each}
			</div>
		{/if}
	</main>

	<!-- Footer -->
	<footer class="bg-white border-t mt-16 py-8">
		<div class="container mx-auto px-4 text-center text-gray-600">
			<p>PWA para aprender verbos japoneses · JLPT N5</p>
			<p class="text-sm mt-2">
				Hecho con ❤️ usando SvelteKit + TailwindCSS
			</p>
		</div>
	</footer>
</div>
