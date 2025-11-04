<script lang="ts">
	import VerbCard from '$lib/components/VerbCard.svelte';
	import type { VerbWithTranslation } from '$lib/types/verb';
	import { getCurrentVerbs } from '$lib/data/verbs';
	import { userProfile, getMasteryPercentage } from '$lib/stores/userProgress';

	let searchQuery = $state('');
	let selectedType = $state<string>('all');
	let sortBy = $state<string>('type'); // 'type', 'frequency', 'mastery'

	// Obtener verbos actualizados
	let verbs = $derived(() => getCurrentVerbs());

	const TYPE_ORDER: Record<string, number> = {
		godan: 0,
		ichidan: 1,
		irregular: 2
	};

	const FREQUENCY_ORDER: Record<string, number> = {
		high: 0,
		medium: 1,
		low: 2,
		undefined: 3
	};

	const SORT_OPTIONS = [
		{ value: 'type', label: 'Tipo de verbo' },
		{ value: 'frequency', label: 'Frecuencia' },
		{ value: 'mastery', label: 'Progreso de aprendizaje' }
	];

	const filteredVerbs = $derived(() => {
		let result = verbs();

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(verb) =>
					verb.kanji.includes(query) ||
					verb.kana.includes(query) ||
					verb.romaji.toLowerCase().includes(query) ||
					verb.translation.meaning.toLowerCase().includes(query)
			);
		}

		// Filter by type
		if (selectedType !== 'all') {
			result = result.filter((verb) => verb.type === selectedType);
		}

		const sortedResult = [...result].sort((a, b) => {
			// Sort by selected criteria
			if (sortBy === 'frequency') {
				const freqDiff = (FREQUENCY_ORDER[a.freq ?? 'undefined'] ?? 3) - (FREQUENCY_ORDER[b.freq ?? 'undefined'] ?? 3);
				if (freqDiff !== 0) return freqDiff;
			} else if (sortBy === 'mastery') {
				const aMastery = getMasteryPercentage($userProfile.studiedVerbs[a.kanji]?.masteryScore ?? 0);
				const bMastery = getMasteryPercentage($userProfile.studiedVerbs[b.kanji]?.masteryScore ?? 0);
				const masteryDiff = bMastery - aMastery; // Higher mastery first
				if (masteryDiff !== 0) return masteryDiff;
			} else {
				// Default: sort by type
				const orderDifference = (TYPE_ORDER[a.type] ?? Number.POSITIVE_INFINITY) - (TYPE_ORDER[b.type] ?? Number.POSITIVE_INFINITY);
				if (orderDifference !== 0) {
					return orderDifference;
				}
			}

			// Fallback: sort by romaji alphabetically
			return a.romaji.localeCompare(b.romaji);
		});

		return sortedResult;
	});

	const stats = $derived(() => ({
		total: verbs().length,
		godan: verbs().filter((v) => v.type === 'godan').length,
		ichidan: verbs().filter((v) => v.type === 'ichidan').length,
		irregular: verbs().filter((v) => v.type === 'irregular').length
	}));
</script>

<section class="space-y-8 pb-10">
	<header class="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 md:px-10 sm:px-4">
		<div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
			<div class="flex items-center gap-4">
				<div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-3xl">
					📚
				</div>
				<div>
					<p class="text-xs uppercase tracking-[0.25em] text-indigo-200">Centro de referencia</p>
					<h1 class="mt-1 text-3xl font-bold text-white">Diccionario de verbos japoneses</h1>
					<p class="mt-1 text-sm text-slate-300 max-w-xl">
						Explora {stats().total} verbos JLPT N5 con filtros rápidos, ejemplos claros y el mismo sistema de colores que en la guía de verbos.
					</p>
				</div>
			</div>
		</div>
	</header>

	<div class="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 sm:px-4 sm:py-4">
		<!-- Search and Filters -->
		<div class="space-y-4">
			<!-- Search Bar -->
			<div class="relative">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="🔍 Buscar por kanji, kana, romaji o significado..."
					class="w-full px-6 py-4 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none"
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
			<div class="flex flex-col sm:flex-row gap-3">
				<div class="flex flex-wrap gap-3 flex-1">
					<button
						onclick={() => (selectedType = 'all')}
						class="px-6 py-3 rounded-xl font-medium transition-all {selectedType === 'all'
							? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40'
							: 'border border-slate-800 bg-slate-950/70 text-slate-300 hover:border-indigo-500'}"
					>
						Todos ({stats().total})
					</button>
					<button
						onclick={() => (selectedType = 'godan')}
						class="px-6 py-3 rounded-xl font-medium transition-all {selectedType === 'godan'
							? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40'
							: 'border border-slate-800 bg-slate-950/70 text-slate-300 hover:border-blue-500'}"
					>
						Grupo 1 · Godan · 五段 ({stats().godan})
					</button>
					<button
						onclick={() => (selectedType = 'ichidan')}
						class="px-6 py-3 rounded-xl font-medium transition-all {selectedType === 'ichidan'
							? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/40'
							: 'border border-slate-800 bg-slate-950/70 text-slate-300 hover:border-emerald-500'}"
					>
						Grupo 2 · Ichidan · 一段 ({stats().ichidan})
					</button>
					<button
						onclick={() => (selectedType = 'irregular')}
						class="px-6 py-3 rounded-xl font-medium transition-all {selectedType === 'irregular'
							? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40'
							: 'border border-slate-800 bg-slate-950/70 text-slate-300 hover:border-purple-500'}"
					>
						Irregulares ({stats().irregular})
					</button>
				</div>
				
				<!-- Sort Dropdown -->
				<div class="flex items-center gap-2">
					<label for="sort-select" class="text-sm text-slate-400">Ordenar por:</label>
					<select
						id="sort-select"
						bind:value={sortBy}
						class="px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/70 text-white text-sm focus:border-indigo-500 focus:outline-none"
					>
						{#each SORT_OPTIONS as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>

		<!-- Results Count -->
		<div>
			<p class="text-sm text-slate-400">
				Mostrando <span class="font-semibold text-indigo-400">{filteredVerbs().length}</span> de <span class="font-semibold">{stats().total}</span> verbos
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
					class="mt-6 px-6 py-3 rounded-xl bg-indigo-600 font-medium transition-colors hover:bg-indigo-500"
				>
					Limpiar filtros
				</button>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-6">
				{#each filteredVerbs() as verb (verb.kanji + verb.kana)}
					<VerbCard {verb} />
				{/each}
			</div>
		{/if}
	</div>
</section>
