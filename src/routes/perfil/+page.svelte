<script lang="ts">
	import { userProfile } from '$lib/stores/userProgress';
	import { onMount } from 'svelte';
	import type { Verb } from '$lib/types/verb';
	import { getCurrentVerbs } from '$lib/data/verbs';
	import BackupManager from '$lib/components/BackupManager.svelte';

	let profile = $state($userProfile);
	let editingName = $state(false);
	let tempName = $state('');

	$effect(() => {
		profile = $userProfile;
	});

	function startEditName() {
		tempName = profile.name;
		editingName = true;
	}

	function saveName() {
		if (tempName.trim()) {
			userProfile.updateName(tempName.trim());
			editingName = false;
		}
	}

	function cancelEdit() {
		editingName = false;
		tempName = '';
	}

	const accuracy = $derived(
		profile.totalQuestions > 0 
			? Math.round((profile.totalCorrect / profile.totalQuestions) * 100) 
			: 0
	);

	const xpForNextLevel = $derived(profile.level * 100);
	const xpProgress = $derived((profile.xp % 100) / 100);

	// Calcular verbos masterizados (mastery score = 7, 80%) vs pendientes
	const verbStats = $derived(() => {
		const verbs = getCurrentVerbs();
		const totalVerbs = verbs.length;
		
		// Proteger contra división por cero
		if (totalVerbs === 0) {
			return {
				total: 0,
				mastered: 0,
				inProgress: 0,
				notStarted: 0,
				masteredPercent: 0,
				inProgressPercent: 0,
				studiedPercent: 0
			};
		}
		
		let masteredCount = 0;
		let inProgressCount = 0;
		let notStartedCount = 0;

		verbs.forEach(verb => {
			const progress = profile.studiedVerbs[verb.kanji];
			if (!progress) {
				notStartedCount++;
			} else if (progress.masteryScore >= 7) {
				masteredCount++;
			} else {
				inProgressCount++;
			}
		});

		return {
			total: totalVerbs,
			mastered: masteredCount,
			inProgress: inProgressCount,
			notStarted: notStartedCount,
			masteredPercent: Math.round((masteredCount / totalVerbs) * 100),
			inProgressPercent: Math.round((inProgressCount / totalVerbs) * 100),
			studiedPercent: Math.round(((masteredCount + inProgressCount) / totalVerbs) * 100)
		};
	});

	const achievements = $derived([
		{ id: 'first_practice', title: 'Primer paso', icon: '🎯', description: 'Completa tu primera práctica', unlocked: profile.totalPractices >= 1 },
		{ id: 'practice_10', title: 'Dedicado', icon: '📚', description: 'Completa 10 prácticas', unlocked: profile.totalPractices >= 10 },
		{ id: 'practice_50', title: 'Estudiante serio', icon: '🎓', description: 'Completa 50 prácticas', unlocked: profile.totalPractices >= 50 },
		{ id: 'streak_3', title: 'Constancia', icon: '🔥', description: 'Mantén una racha de 3 días', unlocked: profile.streak >= 3 },
		{ id: 'streak_7', title: 'Semana perfecta', icon: '⭐', description: 'Mantén una racha de 7 días', unlocked: profile.streak >= 7 },
		{ id: 'accuracy_80', title: 'Precisión', icon: '🎯', description: 'Alcanza 80% de precisión', unlocked: accuracy >= 80 && profile.totalQuestions >= 20 },
		{ id: 'level_5', title: 'Nivel 5', icon: '🏆', description: 'Alcanza el nivel 5', unlocked: profile.level >= 5 },
		{ id: 'verbs_20', title: 'Explorador', icon: '🗺️', description: 'Estudia 20 verbos diferentes', unlocked: Object.keys(profile.studiedVerbs).length >= 20 }
	]);

</script>

<svelte:head>
	<title>Mi Perfil · JapaVerbs</title>
</svelte:head>

<div class="space-y-8 pb-10">
	<!-- Profile Header -->
	<section class="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-indigo-900/50 via-slate-900 to-slate-900 p-[1px] shadow-2xl">
		<div class="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
		<div class="relative rounded-[calc(theme(borderRadius.3xl)-1px)] bg-slate-950/50 p-8 backdrop-blur-xl">
			<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
				<div class="flex items-center gap-5">
					<div class="relative group">
						<div class="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-75 blur transition duration-200 group-hover:opacity-100"></div>
						<div class="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900 text-4xl shadow-inner">
							👤
						</div>
					</div>
					<div>
						{#if editingName}
							<div class="flex flex-col gap-2">
								<input
									type="text"
									bind:value={tempName}
									onkeydown={(e) => e.key === 'Enter' && saveName()}
									class="bg-slate-900/80 border-2 border-indigo-500 rounded-xl px-4 py-2 text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all w-full max-w-xs"
									placeholder="Tu nombre"
								/>
								<div class="flex gap-2">
									<button
										onclick={saveName}
										class="px-4 py-1.5 text-xs font-bold bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20"
									>
										Guardar
									</button>
									<button
										onclick={cancelEdit}
										class="px-4 py-1.5 text-xs font-bold bg-slate-800 rounded-lg hover:bg-slate-700 transition-all text-slate-300"
									>
										Cancelar
									</button>
								</div>
							</div>
						{:else}
							<h1 class="text-3xl font-bold text-white tracking-tight">
								{profile.name || 'Usuario'}
							</h1>
							<button
								onclick={startEditName}
								class="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 mt-1 transition-colors font-medium px-2 py-1 -ml-2 rounded-lg hover:bg-indigo-500/10"
							>
								✏️ {profile.name ? 'Editar nombre' : 'Añadir nombre'}
							</button>
						{/if}
					</div>
				</div>

				<!-- Level Badge -->
				<div class="flex flex-col items-end">
					<div class="text-sm text-slate-400 font-medium mb-1">Nivel actual</div>
					<div class="flex items-baseline gap-2">
						<span class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
							{profile.level}
						</span>
						<span class="text-slate-500 font-bold text-lg">LVL</span>
					</div>
				</div>
			</div>

			<!-- XP Progress -->
			<div class="bg-slate-900/50 rounded-2xl p-4 border border-slate-800/50">
				<div class="flex items-center justify-between text-sm mb-2">
					<span class="text-indigo-300 font-medium">Progreso de Nivel</span>
					<span class="text-slate-400 font-mono">{profile.xp % 100} <span class="text-slate-600">/</span> {xpForNextLevel} XP</span>
				</div>
				<div class="h-4 bg-slate-800 rounded-full overflow-hidden shadow-inner">
					<div 
						class="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 relative"
						style="width: {xpProgress * 100}%"
					>
						<div class="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
					</div>
				</div>
				<div class="mt-2 text-xs text-right text-slate-500">
					Faltan {xpForNextLevel - (profile.xp % 100)} XP para el nivel {profile.level + 1}
				</div>
			</div>
		</div>
	</section>

	<!-- Stats Grid -->
	<section class="grid grid-cols-2 md:grid-cols-4 gap-4">
		<!-- Racha -->
		<div class="group relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-red-600/5 p-5 hover:border-orange-500/40 transition-all hover:shadow-lg hover:shadow-orange-900/20">
			<div class="absolute -right-4 -top-4 text-6xl opacity-10 group-hover:scale-110 transition-transform">🔥</div>
			<div class="relative">
				<div class="text-3xl mb-2">🔥</div>
				<p class="text-3xl font-bold text-white tracking-tight">{profile.streak}</p>
				<p class="text-xs font-medium text-orange-300 uppercase tracking-wider mt-1">Racha actual</p>
			</div>
		</div>
		
		<!-- Precisión -->
		<div class="group relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-600/5 p-5 hover:border-blue-500/40 transition-all hover:shadow-lg hover:shadow-blue-900/20">
			<div class="absolute -right-4 -top-4 text-6xl opacity-10 group-hover:scale-110 transition-transform">🎯</div>
			<div class="relative">
				<div class="text-3xl mb-2">🎯</div>
				<p class="text-3xl font-bold text-white tracking-tight">{accuracy}%</p>
				<p class="text-xs font-medium text-blue-300 uppercase tracking-wider mt-1">Precisión</p>
			</div>
		</div>
		
		<!-- Prácticas -->
		<div class="group relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-600/5 p-5 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-900/20">
			<div class="absolute -right-4 -top-4 text-6xl opacity-10 group-hover:scale-110 transition-transform">📝</div>
			<div class="relative">
				<div class="text-3xl mb-2">📝</div>
				<p class="text-3xl font-bold text-white tracking-tight">{profile.totalPractices}</p>
				<p class="text-xs font-medium text-purple-300 uppercase tracking-wider mt-1">Prácticas</p>
			</div>
		</div>
		
		<!-- Verbos -->
		<div class="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-600/5 p-5 hover:border-emerald-500/40 transition-all hover:shadow-lg hover:shadow-emerald-900/20">
			<div class="absolute -right-4 -top-4 text-6xl opacity-10 group-hover:scale-110 transition-transform">📚</div>
			<div class="relative">
				<div class="text-3xl mb-2">📚</div>
				<p class="text-3xl font-bold text-white tracking-tight">{Object.keys(profile.studiedVerbs).length}</p>
				<p class="text-xs font-medium text-emerald-300 uppercase tracking-wider mt-1">Verbos estudiados</p>
			</div>
		</div>
	</section>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Verbos Masterizados (Main Column) -->
		<section class="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-950/50 p-6 backdrop-blur-sm">
			<h2 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
				<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">🎓</span>
				<span>Dominio de Verbos</span>
			</h2>
			
			<!-- Resumen visual -->
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
				<div class="relative overflow-hidden rounded-2xl border border-green-500/20 bg-green-500/5 p-4 text-center group hover:bg-green-500/10 transition-colors">
					<div class="absolute top-0 right-0 p-2 opacity-10 text-4xl">👑</div>
					<div class="text-4xl font-black text-green-400 mb-1">{verbStats().mastered}</div>
					<p class="text-xs font-bold uppercase tracking-widest text-green-500/80">Dominados</p>
					<p class="text-[10px] text-green-500/60 mt-1">Score ≥ 7 (80%)</p>
				</div>
				<div class="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-center group hover:bg-yellow-500/10 transition-colors">
					<div class="absolute top-0 right-0 p-2 opacity-10 text-4xl">🚧</div>
					<div class="text-4xl font-black text-yellow-400 mb-1">{verbStats().inProgress}</div>
					<p class="text-xs font-bold uppercase tracking-widest text-yellow-500/80">En progreso</p>
				</div>
				<div class="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/30 p-4 text-center group hover:bg-slate-800/50 transition-colors">
					<div class="absolute top-0 right-0 p-2 opacity-10 text-4xl">💤</div>
					<div class="text-4xl font-black text-slate-400 mb-1">{verbStats().notStarted}</div>
					<p class="text-xs font-bold uppercase tracking-widest text-slate-500">Pendientes</p>
				</div>
			</div>

			<!-- Barra de progreso general -->
			<div class="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/50">
				<div class="flex items-center justify-between text-sm mb-3">
					<span class="text-slate-300 font-medium">Progreso total del diccionario</span>
					<span class="text-indigo-400 font-bold text-lg">{verbStats().masteredPercent + verbStats().inProgressPercent}%</span>
				</div>
				<div class="h-6 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
					<!-- Dominados (verde) -->
					{#if verbStats().masteredPercent > 0}
						<div 
							class="h-full bg-gradient-to-r from-green-600 to-emerald-500 flex items-center justify-center"
							style="width: {verbStats().masteredPercent}%"
							title="Dominados"
						>
							{#if verbStats().masteredPercent > 10}
								<span class="text-[10px] font-bold text-slate-900">{verbStats().masteredPercent}%</span>
							{/if}
						</div>
					{/if}
					<!-- En progreso (amarillo) -->
					{#if verbStats().inProgressPercent > 0}
						<div 
							class="h-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center"
							style="width: {verbStats().inProgressPercent}%"
							title="En progreso"
						>
							{#if verbStats().inProgressPercent > 10}
								<span class="text-[10px] font-bold text-slate-900">{verbStats().inProgressPercent}%</span>
							{/if}
						</div>
					{/if}
				</div>
				<div class="flex items-center justify-between text-xs mt-3 text-slate-500 px-1">
					<div class="flex items-center gap-2">
						<div class="w-3 h-3 rounded-full bg-gradient-to-r from-green-600 to-emerald-500"></div>
						<span>Dominado (>80%)</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500"></div>
						<span>Aprendiendo</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="w-3 h-3 rounded-full bg-slate-800"></div>
						<span>Por descubrir</span>
					</div>
				</div>
			</div>

			<!-- Link al diccionario -->
			<a 
				href="/diccionario"
				class="mt-6 group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-4 text-sm font-medium text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-300 transition-all"
			>
				<div class="flex items-center gap-2">
					<span class="text-2xl group-hover:scale-110 transition-transform">📖</span>
					<span>Explorar el diccionario completo</span>
				</div>
				<span class="group-hover:translate-x-1 transition-transform">→</span>
			</a>
		</section>

		<!-- Right Column: Actions -->
		<div class="space-y-8">
			<section class="space-y-4">
				<a
					href="/practica"
					class="relative group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-base font-bold text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95 overflow-hidden"
				>
					<div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
					<span class="text-xl">🎮</span>
					<span>Continuar Practicando</span>
				</a>
				
				<BackupManager />

				<button
					onclick={() => {
						if (confirm('¿Estás seguro de que quieres reiniciar tu progreso? Esta acción no se puede deshacer.')) {
							userProfile.reset();
						}
					}}
					class="w-full rounded-2xl border border-red-500/20 px-6 py-3 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/10 hover:border-red-500/40 uppercase tracking-wider"
				>
					⚠️ Reiniciar progreso
				</button>
			</section>
		</div>
	</div>

	<!-- Achievements (full width) -->
	<section class="rounded-3xl border border-slate-800 bg-slate-950/50 p-6 backdrop-blur-sm">
		<h2 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
			<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">🏆</span>
			<span>Logros</span>
		</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
			{#each achievements as achievement}
				<div 
					class="relative overflow-hidden rounded-2xl border p-4 transition-all {achievement.unlocked 
						? 'border-indigo-500/30 bg-indigo-500/5' 
						: 'border-slate-800 bg-slate-900/30 opacity-70'}"
				>
					<div class="flex items-start gap-4">
						<div class="text-3xl filter drop-shadow-lg">{achievement.icon}</div>
						<div class="space-y-1">
							<h3 class="text-sm font-bold text-white {achievement.unlocked ? 'text-indigo-200' : 'text-slate-300'}">
								{achievement.title}
							</h3>
							<p class="text-xs text-slate-400 leading-relaxed">{achievement.description}</p>
							{#if achievement.unlocked}
								<div class="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-400 border border-green-500/20">
									<span>✓</span> Completado
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>
	
	<!-- Recent Activity (Full Width) -->
	{#if profile.dailyHistory.length > 0}
		<section class="rounded-3xl border border-slate-800 bg-slate-950/50 p-6 backdrop-blur-sm">
			<h2 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
				<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/30 text-slate-300">📅</span>
				<span>Historial reciente</span>
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each profile.dailyHistory.slice(-6).reverse() as day}
					<div class="group flex flex-col p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all hover:bg-slate-900">
						<div class="flex items-center justify-between mb-3">
							<p class="text-sm font-bold text-white capitalize">
								{new Date(day.date).toLocaleDateString('es-ES', { 
									weekday: 'short', 
									day: 'numeric',
									month: 'short'
								})}
							</p>
							<span class="text-xs font-mono text-slate-500">{day.date}</span>
						</div>
						
						<div class="flex items-end justify-between mt-auto">
							<div class="space-y-1">
								<div class="text-xs text-slate-400 flex items-center gap-1.5">
									<span class="text-indigo-400">📚</span> {day.verbsReviewed.length} verbos
								</div>
								<div class="text-xs text-slate-400 flex items-center gap-1.5">
									<span class="text-purple-400">📝</span> {day.totalQuestions} preguntas
								</div>
							</div>
							
							<div class="text-right">
								<div class="text-2xl font-black {day.totalQuestions > 0 && (day.correctAnswers / day.totalQuestions) >= 0.8 ? 'text-green-400' : 'text-indigo-400'}">
									{day.totalQuestions > 0 ? Math.round((day.correctAnswers / day.totalQuestions) * 100) : 0}%
								</div>
								<div class="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Precisión</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

</div>
