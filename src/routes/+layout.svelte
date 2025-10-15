<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';

	let { children } = $props();

	const navItems = [
		{ href: '/', label: 'Inicio', icon: '🏠' },
		{ href: '/diccionario', label: 'Diccionario', icon: '📚' },
		{ href: '/practica', label: 'Práctica', icon: '🎮' },
		{ href: '/conjugaciones', label: 'Guías', icon: '🈂️' },
		{ href: '/perfil', label: 'Perfil', icon: '👤' }
	];
</script>

<svelte:head>
	<title>JapaVerbs N5 - Aprende verbos japoneses</title>
	<meta name="description" content="Diccionario interactivo de verbos japoneses JLPT N5. Aprende, practica y domina los verbos básicos del japonés." />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="theme-color" content="#0f172a" />
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="/manifest.json" />
</svelte:head>

<div class="min-h-screen bg-slate-950 text-white flex flex-col">
	<!-- Content -->
	<main class="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-20 pt-4 sm:px-5 sm:pb-24">
		{@render children?.()}
	</main>

	<!-- Bottom Navigation -->
	<nav class="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur-lg shadow-[0_-10px_25px_rgba(15,23,42,0.6)]">
		<div class="mx-auto flex max-w-3xl">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-all {$page.url.pathname === item.href
						? 'text-white bg-indigo-600/20'
						: 'text-slate-400 active:text-white'}"
				>
					<span class="text-xl">{item.icon}</span>
					<span class="text-[10px] font-medium leading-tight">{item.label}</span>
				</a>
			{/each}
		</div>
	</nav>
</div>
