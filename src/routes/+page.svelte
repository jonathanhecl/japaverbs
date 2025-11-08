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
			description: `Explora ${stats().total} verbos N5`,
			icon: '📚',
			gradient: 'from-indigo-500 to-purple-500'
		},
		{
			href: '/practica',
			title: 'Práctica',
			description: 'Juegos y ejercicios interactivos',
			icon: '🎮',
			gradient: 'from-purple-500 to-pink-500'
		},
		{
			href: '/conjugaciones',
			title: 'Guías',
			description: 'Aprende a conjugar verbos',
			icon: '🈂️',
			gradient: 'from-green-500 to-emerald-500'
		},
		{
			href: '/perfil',
			title: 'Mi Perfil',
			description: 'Revisa tu progreso y estadísticas',
			icon: '👤',
			gradient: 'from-blue-500 to-cyan-500'
		}
	]);

	const features = $derived(() => [
		{
			icon: '📚',
			title: 'Diccionario completo',
			description: `${stats().total} verbos con conjugaciones y ejemplos`
		},
		{
			icon: '🎮',
			title: 'Multiples modos de práctica',
			description: 'Flashcards, opción múltiple, conjugación con audio'
		},
		{
			icon: '📊',
			title: 'Seguimiento de progreso',
			description: 'Rastrea tu aprendizaje día a día'
		},
		{
			icon: '🔊',
			title: 'Audio en japonés',
			description: 'Pronunciación nativa para cada verbo'
		},
		{
			icon: '📱',
			title: 'Funciona offline',
			description: 'Estudia en cualquier lugar sin internet'
		},
		{
			icon: '🏆',
			title: 'Sistema de logros',
			description: 'Desbloquea insignias mientras aprendes'
		}
	]);
</script>

<section class="relative mb-10 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 p-[1px]">
	<div class="relative overflow-hidden rounded-[calc(theme(borderRadius.3xl)-1px)] bg-slate-950/60">
		<div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.25),transparent_45%)]"></div>
		<div class="relative mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12 text-center">
			<div class="space-y-3 text-left">
				<p class="text-sm uppercase tracking-[0.35em] text-indigo-300">JapaVerbs</p>
				<h1 class="text-4xl font-bold leading-tight text-white sm:text-5xl">こんにちは, aprende verbos japoneses</h1>
				<p class="text-base text-slate-300 sm:text-lg">
					Tu hub interactivo para dominar verbos japoneses desde el móvil o escritorio
				</p>
			</div>

			<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<div class="rounded-2xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-5 text-left">
					<p class="text-xs uppercase tracking-wide text-indigo-300">Total</p>
					<p class="mt-1 text-3xl font-bold text-white">{stats().total}</p>
					<p class="text-xs text-indigo-200/80">Verbos N5</p>
				</div>
				<div class="rounded-2xl border border-blue-500/40 bg-blue-500/10 px-4 py-5 text-left">
					<p class="text-xs uppercase tracking-wide text-blue-300">Godan</p>
					<p class="mt-1 text-3xl font-bold text-white">{stats().godan}</p>
					<p class="text-xs text-blue-200/80">五段</p>
				</div>
				<div class="rounded-2xl border border-green-500/40 bg-green-500/10 px-4 py-5 text-left">
					<p class="text-xs uppercase tracking-wide text-green-300">Ichidan</p>
					<p class="mt-1 text-3xl font-bold text-white">{stats().ichidan}</p>
					<p class="text-xs text-green-200/80">一段</p>
				</div>
				<div class="rounded-2xl border border-purple-500/40 bg-purple-500/10 px-4 py-5 text-left">
					<p class="text-xs uppercase tracking-wide text-purple-300">Irregulares</p>
					<p class="mt-1 text-3xl font-bold text-white">{stats().irregular}</p>
					<p class="text-xs text-purple-200/80">する・来る</p>
				</div>
			</div>

			<!-- Quick Actions Grid -->
			<div class="grid gap-3 grid-cols-2">
				{#each quickActions() as action}
					<a
						href={action.href}
						class={`group flex flex-col rounded-2xl border border-slate-800 bg-gradient-to-br ${action.gradient} text-left p-[1px] transition-all active:scale-95`}
					>
						<div class="rounded-[calc(theme(borderRadius.2xl)-1px)] bg-slate-950/80 p-4">
							<span class="text-3xl mb-3 block">{action.icon}</span>
							<h2 class="text-base font-semibold text-white mb-1">{action.title}</h2>
							<p class="text-xs text-slate-400">{action.description}</p>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- User Progress Summary -->
{#if $userProfile.totalPractices > 0}
	<section class="mb-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-green-600/10 to-emerald-600/10 p-5">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold text-white">Tu progreso hoy</h2>
			<a href="/perfil" class="text-xs text-indigo-400 hover:text-indigo-300">Ver más →</a>
		</div>
		<div class="grid grid-cols-3 gap-3">
			<div class="text-center">
				<div class="text-2xl mb-1">🔥</div>
				<p class="text-xl font-bold text-white">{$userProfile.streak}</p>
				<p class="text-xs text-slate-400">Racha</p>
			</div>
			<div class="text-center">
				<div class="text-2xl mb-1">📊</div>
				<p class="text-xl font-bold text-white">{Object.keys($userProfile.studiedVerbs).length}</p>
				<p class="text-xs text-slate-400">Verbos</p>
			</div>
			<div class="text-center">
				<div class="text-2xl mb-1">⭐</div>
				<p class="text-xl font-bold text-white">{$userProfile.level}</p>
				<p class="text-xs text-slate-400">Nivel</p>
			</div>
		</div>
	</section>
{/if}

<!-- Features Grid -->
<section class="mb-6">
	<h2 class="text-lg font-semibold text-white mb-4">Características</h2>
	<div class="grid gap-3 grid-cols-2">
		{#each features() as feature}
			<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
				<div class="text-2xl mb-2">{feature.icon}</div>
				<h3 class="text-sm font-semibold text-white mb-1">{feature.title}</h3>
				<p class="text-xs text-slate-400">{feature.description}</p>
			</div>
		{/each}
	</div>
</section>

<!-- CTA Section -->
<section class="mb-6 rounded-2xl border border-indigo-500/50 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 p-6 text-center">
	<h2 class="text-2xl font-bold text-white mb-2">¿Listo para empezar?</h2>
	<p class="text-sm text-slate-300 mb-5">
		Comienza tu viaje en el aprendizaje del japonés hoy mismo
	</p>
	<div class="flex flex-col gap-3">
		<a
			href="/practica"
			class="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white transition-all active:scale-95"
		>
			🎮 Empezar práctica
		</a>
		<a
			href="/diccionario"
			class="rounded-2xl border border-indigo-500/50 px-6 py-3 text-sm font-semibold text-indigo-100 transition-all active:scale-95"
		>
			📚 Explorar diccionario
		</a>
	</div>
</section>
