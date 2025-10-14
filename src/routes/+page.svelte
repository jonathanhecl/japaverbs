<script lang="ts">
	import verbsData from '$lib/data/verbs_n5.json';
	import type { Verb } from '$lib/types/verb';

	const verbs: Verb[] = verbsData as Verb[];

	const stats = {
		total: verbs.length,
		godan: verbs.filter((v) => v.type === 'godan').length,
		ichidan: verbs.filter((v) => v.type === 'ichidan').length,
		irregular: verbs.filter((v) => v.type === 'irregular').length
	};

	const quickActions = [
		{
			href: '/diccionario',
			title: 'Diccionario',
			description: `Explora los ${stats.total} verbos JLPT N5`,
			icon: '📚',
			gradient: 'from-indigo-500 to-purple-500'
		},
		{
			href: '/practica',
			title: 'Modo práctica',
			description: 'Pon a prueba tu memoria con quizzes',
			icon: '🎮',
			gradient: 'from-purple-500 to-pink-500'
		},
		{
			href: '/por-que',
			title: '¿Por qué estudiar?',
			description: 'Descubre la importancia de los verbos',
			icon: '💡',
			gradient: 'from-blue-500 to-cyan-500'
		}
	];
</script>

<section class="relative mb-10 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 p-[1px]">
	<div class="relative overflow-hidden rounded-[calc(theme(borderRadius.3xl)-1px)] bg-slate-950/60">
		<div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.25),transparent_45%)]"></div>
		<div class="relative mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12 text-center">
			<div class="space-y-3">
				<p class="text-sm uppercase tracking-[0.35em] text-indigo-300">JapaVerbs N5</p>
				<h1 class="text-4xl font-bold leading-tight text-white sm:text-5xl">こんにちは, aprende verbos japoneses</h1>
				<p class="text-base text-slate-300 sm:text-lg">
					Tu hub interactivo para dominar los verbos esenciales del JLPT N5 desde el móvil o escritorio
				</p>
			</div>

			<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<div class="rounded-2xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-5 text-left">
					<p class="text-xs uppercase tracking-wide text-indigo-300">Total</p>
					<p class="mt-1 text-3xl font-bold text-white">{stats.total}</p>
					<p class="text-xs text-indigo-200/80">Verbos N5</p>
				</div>
				<div class="rounded-2xl border border-blue-500/40 bg-blue-500/10 px-4 py-5 text-left">
					<p class="text-xs uppercase tracking-wide text-blue-300">Godan</p>
					<p class="mt-1 text-3xl font-bold text-white">{stats.godan}</p>
					<p class="text-xs text-blue-200/80">五段</p>
				</div>
				<div class="rounded-2xl border border-green-500/40 bg-green-500/10 px-4 py-5 text-left">
					<p class="text-xs uppercase tracking-wide text-green-300">Ichidan</p>
					<p class="mt-1 text-3xl font-bold text-white">{stats.ichidan}</p>
					<p class="text-xs text-green-200/80">一段</p>
				</div>
				<div class="rounded-2xl border border-purple-500/40 bg-purple-500/10 px-4 py-5 text-left">
					<p class="text-xs uppercase tracking-wide text-purple-300">Irregulares</p>
					<p class="mt-1 text-3xl font-bold text-white">{stats.irregular}</p>
					<p class="text-xs text-purple-200/80">する・来る</p>
				</div>
			</div>

			<div class="grid gap-3 sm:grid-cols-3">
				{#each quickActions as action}
					<a
						href={action.href}
						class={`group flex flex-col rounded-3xl border border-slate-800 bg-gradient-to-br ${action.gradient} text-left p-[1px] transition-transform hover:-translate-y-1`}
					>
						<div class="rounded-[calc(theme(borderRadius.3xl)-1px)] bg-slate-950/80 p-5">
							<span class="text-2xl">{action.icon}</span>
							<h2 class="mt-3 text-lg font-semibold text-white">{action.title}</h2>
							<p class="mt-1 text-sm text-slate-300">{action.description}</p>
							<span class="mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200 group-hover:text-white">
								Entrar
							</span>
						</div>
					</a>
				{/each}
			</div>
			<div class="text-4xl mb-4">📚</div>
			<h3 class="text-xl font-bold mb-2 text-indigo-400">Diccionario Completo</h3>
			<p class="text-slate-400">
				{stats.total} verbos esenciales del JLPT N5 con conjugaciones, ejemplos y pronunciación
			</p>
		</div>

		<div class="bg-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-800 hover:border-purple-500 transition-all">
			<div class="text-4xl mb-4">🔍</div>
			<h3 class="text-xl font-bold mb-2 text-purple-400">Búsqueda Inteligente</h3>
			<p class="text-slate-400">
				Busca por kanji, hiragana, romaji o significado en español
			</p>
		</div>

		<div class="bg-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-800 hover:border-pink-500 transition-all">
			<div class="text-4xl mb-4">🎯</div>
			<h3 class="text-xl font-bold mb-2 text-pink-400">Filtros por Tipo</h3>
			<p class="text-slate-400">
				Organiza por Godan, Ichidan o Irregulares para un aprendizaje estructurado
			</p>
		</div>

		<div class="bg-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-800 hover:border-blue-500 transition-all">
			<div class="text-4xl mb-4">🔊</div>
			<h3 class="text-xl font-bold mb-2 text-blue-400">Pronunciación Nativa</h3>
			<p class="text-slate-400">
				Text-to-Speech con voz japonesa para perfeccionar tu pronunciación
			</p>
		</div>

		<div class="bg-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-800 hover:border-green-500 transition-all">
			<div class="text-4xl mb-4">📱</div>
			<h3 class="text-xl font-bold mb-2 text-green-400">PWA Instalable</h3>
			<p class="text-slate-400">
				Instala como app en tu móvil o desktop. Funciona sin conexión
			</p>
		</div>

		<div class="bg-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-800 hover:border-yellow-500 transition-all">
			<div class="text-4xl mb-4">⚡</div>
			<h3 class="text-xl font-bold mb-2 text-yellow-400">Súper Rápida</h3>
			<p class="text-slate-400">
				Interfaz moderna y optimizada para una experiencia fluida
			</p>
		</div>
	</div>
</section>

<section class="mb-10 space-y-4">
	<h2 class="text-lg font-semibold text-slate-200">Beneficios clave</h2>
	<div class="grid gap-4 sm:grid-cols-2">
		<div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
			<h3 class="flex items-center gap-2 text-base font-semibold text-indigo-300">
				<span>🔍</span>Búsqueda inteligente
			</h3>
			<p class="mt-2 text-sm text-slate-300">
				Encuentra verbos por kanji, kana, romaji o significado. Ideal para estudiar en cualquier momento.
			</p>
		</div>
		<div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
			<h3 class="flex items-center gap-2 text-base font-semibold text-purple-300">
				<span>🎯</span>Filtros por tipo
			</h3>
			<p class="mt-2 text-sm text-slate-300">
				Segmenta por Godan, Ichidan o Irregulares para enfocarte en los verbos que más necesitas.
			</p>
		</div>
		<div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
			<h3 class="flex items-center gap-2 text-base font-semibold text-blue-300">
				<span>🔊</span>Pronunciación nativa
			</h3>
			<p class="mt-2 text-sm text-slate-300">
				Escucha la pronunciación japonesa y practica tu oído con Text-to-Speech integrado.
			</p>
		</div>
		<div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
			<h3 class="flex items-center gap-2 text-base font-semibold text-emerald-300">
				<span>📱</span>PWA lista para instalar
			</h3>
			<p class="mt-2 text-sm text-slate-300">
				Disfruta de la app incluso sin conexión, con tiempos de carga instantáneos y experiencia mobile-first.
			</p>
		</div>
	</div>
</section>

<section class="mb-12 rounded-3xl border border-slate-800 bg-gradient-to-br from-indigo-600 to-purple-600 p-[1px]">
	<div class="rounded-[calc(theme(borderRadius.3xl)-1px)] bg-slate-950/90 p-8 text-center sm:p-12">
		<h2 class="text-3xl font-bold text-white sm:text-4xl">¿Listo para practicar?</h2>
		<p class="mt-3 text-sm text-indigo-100 sm:text-base">
			Comienza tu sesión diaria y domina los verbos más usados del japonés.
		</p>
		<div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
			<a
				href="/practica"
				class="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 transition-transform hover:-translate-y-0.5"
			>
				🎮 Empezar práctica
			</a>
			<a
				href="/diccionario"
				class="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-300/50 px-6 py-3 text-sm font-semibold text-indigo-100 transition-transform hover:-translate-y-0.5"
			>
				📚 Ver todos los verbos
			</a>
		</div>
	</div>
</section>
