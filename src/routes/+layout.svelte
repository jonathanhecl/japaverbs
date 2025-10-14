<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<title>JapaVerbs N5 - Aprende verbos japoneses</title>
	<meta name="description" content="Diccionario interactivo de verbos japoneses JLPT N5. Aprende, practica y domina los verbos básicos del japonés." />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="theme-color" content="#4F46E5" />
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="/manifest.json" />
</svelte:head>

{@render children?.()}
