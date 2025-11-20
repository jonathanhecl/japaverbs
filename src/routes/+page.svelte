<script lang="ts">
	import { getCurrentVerbs } from '$lib/data/verbs';
	import type { VerbWithTranslation } from '$lib/types/verb';
	import { userProfile } from '$lib/stores/userProgress';
	
	// Obtener verbos actualizados según el idioma
	let verbs = $derived<VerbWithTranslation[]>(getCurrentVerbs());

	const stats = $derived(() => ({
		total: verbs.length,
		godan: verbs.filter((v) => v.type === 'godan').length,
		ichidan: verbs.filter((v) => v.type === 'ichidan').length,
		irregular: verbs.filter((v) => v.type === 'irregular').length
	}));

	const quickActions = $derived(() => [
		{
			href: '/diccionario',
			title: 'Diccionario',
			description: `Explora ${stats().total} verbos`,
			icon: '📚',
			gradient: 'from-indigo-500/20 to-blue-500/20',
			border: 'group-hover:border-indigo-500/50',
			text: 'text-indigo-400'
		},
		{
			href: '/practica',
			title: 'Práctica',
			description: 'Minijuegos y ejercicios',
			icon: '🎮',
			gradient: 'from-purple-500/20 to-pink-500/20',
			border: 'group-hover:border-purple-500/50',
			text: 'text-purple-400'
		},
		{
			href: '/conjugaciones',
			title: 'Guías',
			description: 'Aprende a conjugar',
			icon: '🈂️',
			gradient: 'from-emerald-500/20 to-teal-500/20',
			border: 'group-hover:border-emerald-500/50',
			text: 'text-emerald-400'
		},
		{
			href: '/perfil',
			title: 'Perfil',
			description: 'Tu progreso',
			icon: '👤',
			gradient: 'from-amber-500/20 to-orange-500/20',
			border: 'group-hover:border-amber-500/50',
			text: 'text-amber-400'
		}
	]);

	const features = $derived(() => [
		{
			icon: '🔊',
			title: 'Audio Nativo',
			description: 'Pronunciación para cada verbo'
		},
		{
			icon: '📱',
			title: 'Offline',
			description: 'Estudia sin internet'
		},
		{
			icon: '🏆',
			title: 'Logros',
			description: 'Sistema de medallas'
		},
		{
			icon: '📊',
			title: 'Estadísticas',
			description: 'Rastrea tu avance'
		}
	]);
</script>

<div class="space-y-8">
	<!-- Hero Section -->
	<section class="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-[1px] shadow-2xl">
		<div class="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
		<div class="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"></div>
		<div class="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl"></div>
		
		<div class="relative rounded-[calc(theme(borderRadius.3xl)-1px)] bg-slate-950/30 p-8 backdrop-blur-sm sm:p-10">
			<div class="flex flex-col gap-6 text-center sm:text-left">
				<div class="space-y-2">
					<div class="inline-flex items-center gap-2 rounded-full bg-slate-800/50 px-3 py-1 text-xs font-medium text-indigo-300 border border-slate-700/50 backdrop-blur-md mx-auto sm:mx-0">
						<span class="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
						JapaVerbs Beta
					</div>
					<h1 class="text-4xl font-black tracking-tight text-white sm:text-6xl">
						Domina los <br class="hidden sm:block" />
						<span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Verbos Japoneses</span>
					</h1>
					<p class="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto sm:mx-0">
						Tu compañero definitivo para aprender, practicar y perfeccionar la conjugación japonesa.
					</p>
				</div>

				<div class="flex flex-wrap justify-center sm:justify-start gap-3">
					<a
						href="/practica"
						class="relative group flex items-center gap-2 rounded-xl bg-white text-slate-950 px-6 py-3 text-sm font-bold hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
					>
						<span>Empezar a practicar</span>
						<span class="group-hover:translate-x-0.5 transition-transform">→</span>
					</a>
					<a
						href="/diccionario"
						class="flex items-center gap-2 rounded-xl bg-slate-800/50 border border-slate-700 text-white px-6 py-3 text-sm font-bold hover:bg-slate-800 transition-all hover:border-slate-600"
					>
						Explorar diccionario
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- Quick Stats -->
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
		<div class="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-center backdrop-blur-sm hover:border-indigo-500/30 transition-colors group">
			<p class="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-indigo-400 transition-colors">Total</p>
			<p class="mt-1 text-3xl font-black text-white">{stats().total}</p>
			<p class="text-[10px] text-slate-600">Verbos N5</p>
		</div>
		<div class="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-center backdrop-blur-sm hover:border-blue-500/30 transition-colors group">
			<p class="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-400 transition-colors">Godan</p>
			<p class="mt-1 text-3xl font-black text-white">{stats().godan}</p>
			<p class="text-[10px] text-slate-600">Grupo 1</p>
		</div>
		<div class="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-center backdrop-blur-sm hover:border-emerald-500/30 transition-colors group">
			<p class="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-emerald-400 transition-colors">Ichidan</p>
			<p class="mt-1 text-3xl font-black text-white">{stats().ichidan}</p>
			<p class="text-[10px] text-slate-600">Grupo 2</p>
		</div>
		<div class="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-center backdrop-blur-sm hover:border-purple-500/30 transition-colors group">
			<p class="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-purple-400 transition-colors">Irreg.</p>
			<p class="mt-1 text-3xl font-black text-white">{stats().irregular}</p>
			<p class="text-[10px] text-slate-600">Grupo 3</p>
		</div>
	</div>

	<!-- Navigation Grid -->
	<section>
		<h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
			<span class="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
			Explorar
		</h2>
		<div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
			{#each quickActions() as action}
				<a
					href={action.href}
					class={`group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] ${action.border}`}
				>
					<div class={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
					<div class="relative flex items-center gap-4">
						<div class="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-950/50 text-3xl shadow-inner group-hover:scale-110 transition-transform duration-300">
							{action.icon}
						</div>
						<div>
							<h3 class="text-lg font-bold text-white group-hover:text-white transition-colors">
								{action.title}
							</h3>
							<p class="text-sm text-slate-400 group-hover:text-indigo-100/80 transition-colors">
								{action.description}
							</p>
						</div>
						<div class="ml-auto text-slate-600 group-hover:text-white/50 transition-colors">
							→
						</div>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<!-- User Progress Summary -->
	{#if $userProfile.totalPractices > 0}
		<section class="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6">
			<div class="absolute top-0 right-0 p-8 opacity-5 text-9xl rotate-12 select-none pointer-events-none">🔥</div>
			
			<div class="relative">
				<div class="flex items-center justify-between mb-6">
					<div>
						<h2 class="text-xl font-bold text-white">Tu progreso hoy</h2>
						<p class="text-xs text-slate-400 mt-1">Sigue así, la constancia es clave</p>
					</div>
					<a 
						href="/perfil" 
						class="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-colors"
					>
						Ver perfil completo
					</a>
				</div>

				<div class="grid grid-cols-3 gap-4">
					<div class="flex flex-col items-center p-3 rounded-2xl bg-slate-950/30 border border-white/5">
						<span class="text-2xl mb-2">🔥</span>
						<span class="text-2xl font-black text-white">{$userProfile.streak}</span>
						<span class="text-[10px] uppercase tracking-wider font-bold text-slate-500">Días racha</span>
					</div>
					<div class="flex flex-col items-center p-3 rounded-2xl bg-slate-950/30 border border-white/5">
						<span class="text-2xl mb-2">📚</span>
						<span class="text-2xl font-black text-white">{Object.keys($userProfile.studiedVerbs).length}</span>
						<span class="text-[10px] uppercase tracking-wider font-bold text-slate-500">Verbos</span>
					</div>
					<div class="flex flex-col items-center p-3 rounded-2xl bg-slate-950/30 border border-white/5">
						<span class="text-2xl mb-2">⭐</span>
						<span class="text-2xl font-black text-white">{$userProfile.level}</span>
						<span class="text-[10px] uppercase tracking-wider font-bold text-slate-500">Nivel</span>
					</div>
				</div>
			</div>
		</section>
	{/if}
</div>
