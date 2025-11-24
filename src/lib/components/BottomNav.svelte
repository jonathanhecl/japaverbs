<script lang="ts">
	import { page } from '$app/stores';

	const navItems = [
		{ href: '/', label: 'Inicio', icon: '🏠' },
		{ href: '/diccionario', label: 'Diccionario', icon: '📚' },
		{ href: '/practica', label: 'Práctica', icon: '🎮' },
		{ href: '/conjugaciones', label: 'Guías', icon: '🈂️' },
		{ href: '/perfil', label: 'Perfil', icon: '👤' }
	];
</script>

<nav class="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-xl pb-safe">
	<div class="mx-auto flex max-w-3xl justify-around px-2">
		{#each navItems as item}
			{@const isActive = $page.url.pathname === item.href}
			<a
				href={item.href}
				class="group relative flex flex-1 flex-col items-center justify-center gap-1 pt-3 pb-5 transition-all duration-300"
			>
				{#if isActive}
					<div class="absolute top-0 h-[2px] w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"></div>
					<div class="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-100 transition-opacity"></div>
				{/if}
				
				<span class="relative text-2xl transition-transform duration-300 {isActive ? 'scale-110 -translate-y-0.5' : 'group-hover:scale-110 group-active:scale-95 opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100'}">
					{item.icon}
				</span>
				<span class="relative text-[10px] font-medium leading-tight transition-colors duration-300 {isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}">
					{item.label}
				</span>
			</a>
		{/each}
	</div>
</nav>

<style>
	/* Support for safe area on mobile devices */
	.pb-safe {
		padding-bottom: env(safe-area-inset-bottom, 1rem);
	}
</style>
