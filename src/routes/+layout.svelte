<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';

	let { children } = $props();

	const navItems = [
		{ href: '/', label: 'Inicio', icon: '🏠' },
		{ href: '/por-que', label: '¿Por qué?', icon: '💡' },
		{ href: '/diccionario', label: 'Diccionario', icon: '📚' },
		{ href: '/conjugaciones', label: 'Conjugaciones', icon: '🈂️' },
		{ href: '/practica', label: 'Práctica', icon: '🎮' }
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
	<!-- App Header -->
	<header class="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
		<div class="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-5 py-4">
			<a href="/" class="flex items-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-2xl shadow-lg shadow-indigo-500/30">
					🇯🇵
				</div>
				<div class="flex flex-col">
					<span class="text-sm text-slate-400">JapaVerbs N5</span>
					<h1 class="text-xl font-semibold leading-tight text-white">Aprende verbos japoneses</h1>
				</div>
			</a>
			<a
				href="https://japaverbs.pages.dev/"
				target="_blank"
				rel="noreferrer"
				class="hidden rounded-2xl border border-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-indigo-500 hover:text-white sm:block"
			>
				Abrir PWA
			</a>
		</div>

		<!-- Desktop Nav Pills -->
		<div class="mx-auto hidden w-full max-w-3xl gap-2 px-5 pb-4 sm:flex">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex-1 rounded-2xl px-4 py-3 text-center text-sm font-semibold transition-all {$page.url.pathname === item.href
						? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
						: 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-indigo-500 hover:text-white'}"
				>
					<span class="mr-2">{item.icon}</span>{item.label}
				</a>
			{/each}
		</div>
	</header>

	<!-- Content -->
	<main class="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pb-28 pt-6 sm:pb-12">
		{@render children?.()}
	</main>

	<!-- Bottom Navigation (mobile) -->
	<nav class="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur-lg shadow-[0_-10px_25px_rgba(15,23,42,0.6)] sm:hidden">
		<div class="mx-auto flex max-w-3xl divide-x divide-slate-800 text-sm">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-all {$page.url.pathname === item.href
						? 'text-white bg-indigo-600/20'
						: 'text-slate-400 hover:text-white'}"
				>
					<span class="text-lg">{item.icon}</span>
					<span class="text-xs font-medium">{item.label}</span>
				</a>
			{/each}
		</div>
	</nav>

	<!-- Desktop Footer -->
	<footer class="mt-16 hidden border-t border-slate-800 bg-slate-950/70 py-10 sm:block">
		<div class="mx-auto w-full max-w-3xl px-5 text-center text-slate-400">
			<p>PWA para aprender verbos japoneses · JLPT N5</p>
			<p class="mt-2 text-sm">Hecho con ❤️ usando SvelteKit + TailwindCSS</p>
		</div>
	</footer>
</div>
