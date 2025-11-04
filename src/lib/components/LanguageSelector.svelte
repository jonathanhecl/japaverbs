<script lang="ts">
	import { languageStore, SUPPORTED_LANGUAGES, type SupportedLanguage } from '$lib/stores/language';
	import { getCurrentVerbs } from '$lib/data/verbs';
	import { onMount } from 'svelte';

	let currentLanguage = $state<SupportedLanguage>('es');
	let isOpen = $state(false);

	// Sincronizar con el store
	$effect(() => {
		currentLanguage = $languageStore;
	});

	function changeLanguage(lang: SupportedLanguage) {
		languageStore.set(lang);
		isOpen = false;
	}

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	// Cerrar dropdown cuando se hace clic fuera
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.language-selector')) {
			isOpen = false;
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="language-selector relative">
	<button
		onclick={toggleDropdown}
		class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-white"
		type="button"
		aria-label="Seleccionar idioma"
		aria-expanded={isOpen}
	>
		<span class="text-lg">{SUPPORTED_LANGUAGES[currentLanguage].flag}</span>
		<span class="text-sm font-medium">{SUPPORTED_LANGUAGES[currentLanguage].name}</span>
		<svg
			class="w-4 h-4 transition-transform {isOpen ? 'rotate-180' : ''}"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if isOpen}
		<div class="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 min-w-[150px]">
			{#each Object.entries(SUPPORTED_LANGUAGES) as [code, config]}
				<button
					onclick={() => changeLanguage(code as SupportedLanguage)}
					class="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-700 transition-colors text-white first:rounded-t-lg last:rounded-b-lg {
						currentLanguage === code ? 'bg-slate-700 text-blue-400' : ''
					}"
					type="button"
				>
					<span class="text-lg">{config.flag}</span>
					<span class="text-sm font-medium">{config.name}</span>
					{#if currentLanguage === code}
						<svg class="w-4 h-4 ml-auto text-blue-400" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
						</svg>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.language-selector {
		/* Asegurar que el dropdown esté por encima de otros elementos */
		z-index: 9999;
	}
</style>
