<script lang="ts">
	import VerbCard from '$lib/components/VerbCard.svelte';
	import type { Verb } from '$lib/types/verb';
	import verbs from '$lib/data/verbs';

	let searchQuery = $state('');
	let selectedType = $state<string>('all');

	const TYPE_ORDER: Record<string, number> = {
	ichidan: 0,
	godan: 1,
	irregular: 2
};

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
					verb['meaning-es'].toLowerCase().includes(query)
			);
		}

		// Filter by type
		if (selectedType !== 'all') {
			result = result.filter((verb) => verb.type === selectedType);
		}

		const sortedResult = [...result].sort((a, b) => {
			const orderDifference = (TYPE_ORDER[a.type] ?? Number.POSITIVE_INFINITY) - (TYPE_ORDER[b.type] ?? Number.POSITIVE_INFINITY);
			if (orderDifference !== 0) {
				return orderDifference;
			}

			return a.romaji.localeCompare(b.romaji);
		});

		return sortedResult;
	});

	const stats = $derived({
		total: verbs.length,
		godan: verbs.filter((v) => v.type === 'godan').length,
		ichidan: verbs.filter((v) => v.type === 'ichidan').length,
		irregular: verbs.filter((v) => v.type === 'irregular').length
	});
</script>

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
			📚 Diccionario de Verbos
		</h1>
		<p class="text-slate-400">
			Explora {stats.total} verbos japoneses (JLPT N5)
		</p>
	</div>

	<!-- Search and Filters -->
	<div class="mb-8 space-y-4">
		<!-- Search Bar -->
		<div class="relative">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="🔍 Buscar por kanji, kana, romaji o significado..."
				class="w-full px-6 py-4 bg-slate-900 border-2 border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-white placeholder-slate-500"
			/>
			{#if searchQuery}
				<button
					onclick={() => (searchQuery = '')}
					class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
				>
					✕
				</button>
			{/if}
		</div>

		<!-- Filter Buttons -->
		<div class="flex flex-wrap gap-3">
			<button
				onclick={() => (selectedType = 'all')}
				class="px-6 py-3 rounded-xl font-medium transition-all {selectedType === 'all'
					? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
					: 'bg-slate-900 border-2 border-slate-800 text-slate-300 hover:border-indigo-500'}"
			>
				Todos ({stats.total})
			</button>
			<button
				onclick={() => (selectedType = 'ichidan')}
				class="px-6 py-3 rounded-xl font-medium transition-all {selectedType === 'ichidan'
					? 'bg-green-600 text-white shadow-lg shadow-green-500/50'
					: 'bg-slate-900 border-2 border-slate-800 text-slate-300 hover:border-green-500'}"
			>
				Ichidan · 一段 ({stats.ichidan})
			</button>
			<button
				onclick={() => (selectedType = 'godan')}
				class="px-6 py-3 rounded-xl font-medium transition-all {selectedType === 'godan'
					? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
					: 'bg-slate-900 border-2 border-slate-800 text-slate-300 hover:border-blue-500'}"
			>
				Godan · 五段 ({stats.godan})
			</button>
			<button
				onclick={() => (selectedType = 'irregular')}
				class="px-6 py-3 rounded-xl font-medium transition-all {selectedType === 'irregular'
					? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
					: 'bg-slate-900 border-2 border-slate-800 text-slate-300 hover:border-purple-500'}"
			>
				Irregular ({stats.irregular})
			</button>
		</div>
	</div>

	<!-- Results Count -->
	<div class="mb-6">
		<p class="text-slate-400">
			Mostrando <span class="font-semibold text-indigo-400">{filteredVerbs().length}</span> de <span class="font-semibold">{stats.total}</span> verbos
		</p>
	</div>

	<!-- Verbs Grid -->
	{#if filteredVerbs().length === 0}
		<div class="text-center py-20">
			<div class="text-7xl mb-6">🔍</div>
			<p class="text-2xl text-slate-300 mb-2">No se encontraron verbos</p>
			<p class="text-slate-500">Intenta con otra búsqueda o filtro</p>
			<button
				onclick={() => {
					searchQuery = '';
					selectedType = 'all';
				}}
				class="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium transition-colors"
			>
				Limpiar filtros
			</button>
		</div>
	{:else}
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{#each filteredVerbs() as verb (verb.kanji + verb.kana)}
				<VerbCard {verb} />
			{/each}
		</div>
	{/if}
</div>
