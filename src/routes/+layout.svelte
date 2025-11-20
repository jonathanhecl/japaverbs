<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import BottomNav from '$lib/components/BottomNav.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>JapaVerbs - Aprende verbos japoneses</title>
	<meta name="description" content="Diccionario interactivo de verbos japoneses. Aprende, practica y domina verbos del japonés con múltiples modos de juego." />
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
	<meta name="theme-color" content="#020617" />
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="/manifest.json" />
</svelte:head>

<div class="min-h-screen bg-[#020617] text-white flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
	<!-- Content -->
	<main class="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-32 pt-6 sm:px-6 sm:pb-36">
		{@render children?.()}
	</main>

	<!-- Bottom Navigation -->
	<BottomNav />
</div>
