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
	<!-- Dictionary Header -->
	<header class="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-indigo-900/50 via-slate-900 to-slate-900 p-[1px] shadow-2xl">
		<div class="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
		<div class="relative rounded-[calc(theme(borderRadius.3xl)-1px)] bg-slate-950/50 p-8 backdrop-blur-xl">
			<div class="flex items-center gap-6">
				<div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-4xl shadow-inner border border-slate-800">
					📚
				</div>
				<div class="space-y-2">
					<div class="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/20">
						JLPT N5
					</div>
					<h1 class="text-3xl font-black text-white tracking-tight">Diccionario</h1>
					<p class="text-slate-400 max-w-lg leading-relaxed">
						Explora nuestra colección de <span class="text-white font-bold">{stats().total} verbos</span> con conjugaciones detalladas, ejemplos y audio.
					</p>
				</div>
			</div>
		</div>
	</header>

	<div class="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/50 p-6 backdrop-blur-sm">
		<!-- Search and Filters -->
		<div class="space-y-5">
			<!-- Search Bar -->
			<div class="relative group">
				<div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-20 group-focus-within:opacity-100 transition duration-500 blur"></div>
				<div class="relative flex items-center bg-slate-900 rounded-xl border border-slate-800">
					<span class="pl-4 text-slate-400 text-xl">🔍</span>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Buscar por kanji, kana, romaji o significado..."
						class="w-full px-4 py-4 bg-transparent text-white placeholder-slate-500 focus:outline-none font-medium"
					/>
					{#if searchQuery}
						<button
							onclick={() => (searchQuery = '')}
							class="pr-4 text-slate-400 hover:text-white transition-colors"
						>
							✕
						</button>
					{/if}
				</div>
			</div>

			<!-- Filter Buttons -->
			<div class="flex flex-col xl:flex-row gap-4">
				<div class="flex flex-wrap gap-2 flex-1">
					<button
						onclick={() => (selectedType = 'all')}
						class="px-4 py-2 rounded-xl text-sm font-bold transition-all {selectedType === 'all'
							? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
							: 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-300'}"
					>
						Todos ({stats().total})
					</button>
					<button
						onclick={() => (selectedType = 'godan')}
						class="px-4 py-2 rounded-xl text-sm font-bold transition-all {selectedType === 'godan'
							? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
							: 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-blue-500/50 hover:text-blue-300'}"
					>
						Godan ({stats().godan})
					</button>
					<button
						onclick={() => (selectedType = 'ichidan')}
						class="px-4 py-2 rounded-xl text-sm font-bold transition-all {selectedType === 'ichidan'
							? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
							: 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-300'}"
					>
						Ichidan ({stats().ichidan})
					</button>
					<button
						onclick={() => (selectedType = 'irregular')}
						class="px-4 py-2 rounded-xl text-sm font-bold transition-all {selectedType === 'irregular'
							? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
							: 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-purple-500/50 hover:text-purple-300'}"
					>
						Irregulares ({stats().irregular})
					</button>
				</div>
				
				<!-- Sort Dropdown -->
				<div class="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800">
					<span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Ordenar:</span>
					<select
						id="sort-select"
						bind:value={sortBy}
						class="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer"
					>
						{#each SORT_OPTIONS as option}
							<option value={option.value} class="bg-slate-900">{option.label}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>

		<!-- Results Count -->
		<div class="flex items-center justify-between border-t border-slate-800/50 pt-4">
			<p class="text-xs font-medium text-slate-500">
				Mostrando <span class="text-white">{filteredVerbs().length}</span> resultados
			</p>
		</div>

		<!-- Verbs Grid -->
		{#if filteredVerbs().length === 0}
			<div class="flex flex-col items-center justify-center py-20 text-center">
				<div class="relative mb-6">
					<div class="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
					<div class="relative text-6xl">🔍</div>
				</div>
				<h3 class="text-xl font-bold text-white mb-2">No se encontraron verbos</h3>
				<p class="text-slate-400 mb-6 max-w-xs mx-auto">No hay resultados que coincidan con tu búsqueda o filtros actuales.</p>
				<button
					onclick={() => {
						searchQuery = '';
						selectedType = 'all';
					}}
					class="px-6 py-2.5 rounded-xl bg-indigo-600 font-bold text-white shadow-lg hover:bg-indigo-500 transition-all active:scale-95"
				>
					Limpiar filtros
				</button>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-4">
				{#each filteredVerbs() as verb (verb.kanji + verb.kana)}
					<VerbCard {verb} />
				{/each}
			</div>
		{/if}
	</div>
</section>
