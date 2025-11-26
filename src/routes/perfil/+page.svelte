<script lang="ts">
	import { userProfile } from '$lib/stores/userProgress';
	import { onMount } from 'svelte';
	import type { Verb } from '$lib/types/verb';
	import { getCurrentVerbs } from '$lib/data/verbs';
	import BackupManager from '$lib/components/BackupManager.svelte';
	import ProgressChart from '$lib/components/ProgressChart.svelte';

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

		verbs.forEach((verb) => {
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
		{
			id: 'first_practice',
			title: 'Primer paso',
			icon: '🎯',
			description: 'Completa tu primera práctica',
			unlocked: profile.totalPractices >= 1
		},
		{
			id: 'practice_10',
			title: 'Dedicado',
			icon: '📚',
			description: 'Completa 10 prácticas',
			unlocked: profile.totalPractices >= 10
		},
		{
			id: 'practice_50',
			title: 'Estudiante serio',
			icon: '🎓',
			description: 'Completa 50 prácticas',
			unlocked: profile.totalPractices >= 50
		},
		{
			id: 'streak_3',
			title: 'Constancia',
			icon: '🔥',
			description: 'Mantén una racha de 3 días',
			unlocked: profile.streak >= 3
		},
		{
			id: 'streak_7',
			title: 'Semana perfecta',
			icon: '⭐',
			description: 'Mantén una racha de 7 días',
			unlocked: profile.streak >= 7
		},
		{
			id: 'accuracy_80',
			title: 'Precisión',
			icon: '🎯',
			description: 'Alcanza 80% de precisión',
			unlocked: accuracy >= 80 && profile.totalQuestions >= 20
		},
		{
			id: 'level_5',
			title: 'Nivel 5',
			icon: '🏆',
			description: 'Alcanza el nivel 5',
			unlocked: profile.level >= 5
		},
		{
			id: 'verbs_20',
			title: 'Explorador',
			icon: '🗺️',
			description: 'Estudia 20 verbos diferentes',
			unlocked: Object.keys(profile.studiedVerbs).length >= 20
		}
	]);
</script>

<svelte:head>
	<title>Mi Perfil · JapaVerbs</title>
</svelte:head>

<div class="space-y-8 pb-10">
	<!-- Profile Header -->
	<section
		class="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-indigo-900/50 via-slate-900 to-slate-900 p-[1px] shadow-2xl"
	>
		<div
			class="absolute inset-0 bg-[url('/grid.svg')] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] bg-center opacity-10"
		></div>
		<div
			class="relative rounded-[calc(theme(borderRadius.3xl)-1px)] bg-slate-950/50 p-8 backdrop-blur-xl"
		>
			<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
				<div class="flex items-center gap-5">
					<div class="group relative">
						<div
							class="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-75 blur transition duration-200 group-hover:opacity-100"
						></div>
						<div
							class="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900 text-4xl shadow-inner"
						>
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
									class="w-full max-w-xs rounded-xl border-2 border-indigo-500 bg-slate-900/80 px-4 py-2 text-2xl font-bold text-white transition-all focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
									placeholder="Tu nombre"
								/>
								<div class="flex gap-2">
									<button
										onclick={saveName}
										class="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold shadow-lg shadow-indigo-900/20 transition-all hover:bg-indigo-500"
									>
										Guardar
									</button>
									<button
										onclick={cancelEdit}
										class="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-bold text-slate-300 transition-all hover:bg-slate-700"
									>
										Cancelar
									</button>
								</div>
							</div>
						{:else}
							<h1 class="text-3xl font-bold tracking-tight text-white">
								{profile.name || 'Usuario'}
							</h1>
							<button
								onclick={startEditName}
								class="mt-1 -ml-2 flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-500/10 hover:text-indigo-300"
							>
								✏️ {profile.name ? 'Editar nombre' : 'Añadir nombre'}
							</button>
						{/if}
					</div>
				</div>

				<!-- Level Badge -->
				<div class="flex flex-col items-end">
					<div class="mb-1 text-sm font-medium text-slate-400">Nivel actual</div>
					<div class="flex items-baseline gap-2">
						<span
							class="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-5xl font-black text-transparent"
						>
							{profile.level}
						</span>
						<span class="text-lg font-bold text-slate-500">LVL</span>
					</div>
				</div>
			</div>

			<!-- XP Progress -->
			<div class="rounded-2xl border border-slate-800/50 bg-slate-900/50 p-4">
				<div class="mb-2 flex items-center justify-between text-sm">
					<span class="font-medium text-indigo-300">Progreso de Nivel</span>
					<span class="font-mono text-slate-400"
						>{profile.xp % 100} <span class="text-slate-600">/</span> {xpForNextLevel} XP</span
					>
				</div>
				<div class="h-4 overflow-hidden rounded-full bg-slate-800 shadow-inner">
					<div
						class="relative h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500"
						style="width: {xpProgress * 100}%"
					>
						<div class="absolute inset-0 animate-[pulse_2s_infinite] bg-white/20"></div>
					</div>
				</div>
				<div class="mt-2 text-right text-xs text-slate-500">
					Faltan {xpForNextLevel - (profile.xp % 100)} XP para el nivel {profile.level + 1}
				</div>
			</div>
		</div>
	</section>

	<!-- Stats Grid -->
	<section class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
		<!-- Racha -->
		<div
			class="group relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-red-600/5 p-5 transition-all hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-900/20"
		>
			<div
				class="absolute -top-4 -right-4 text-6xl opacity-10 transition-transform group-hover:scale-110"
			>
				🔥
			</div>
			<div class="relative">
				<div class="mb-2 text-3xl">🔥</div>
				<p class="text-3xl font-bold tracking-tight text-white">{profile.streak}</p>
				<p class="mt-1 text-xs font-medium tracking-wider text-orange-300 uppercase">
					Racha actual
				</p>
			</div>
		</div>

		<!-- Precisión -->
		<div
			class="group relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-600/5 p-5 transition-all hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-900/20"
		>
			<div
				class="absolute -top-4 -right-4 text-6xl opacity-10 transition-transform group-hover:scale-110"
			>
				🎯
			</div>
			<div class="relative">
				<div class="mb-2 text-3xl">🎯</div>
				<p class="text-3xl font-bold tracking-tight text-white">{accuracy}%</p>
				<p class="mt-1 text-xs font-medium tracking-wider text-blue-300 uppercase">Precisión</p>
			</div>
		</div>

		<!-- Prácticas -->
		<div
			class="group relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-600/5 p-5 transition-all hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-900/20"
		>
			<div
				class="absolute -top-4 -right-4 text-6xl opacity-10 transition-transform group-hover:scale-110"
			>
				📝
			</div>
			<div class="relative">
				<div class="mb-2 text-3xl">📝</div>
				<p class="text-3xl font-bold tracking-tight text-white">{profile.totalPractices}</p>
				<p class="mt-1 text-xs font-medium tracking-wider text-purple-300 uppercase">Prácticas</p>
			</div>
		</div>

		<!-- Verbos -->
		<div
			class="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-600/5 p-5 transition-all hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-900/20"
		>
			<div
				class="absolute -top-4 -right-4 text-6xl opacity-10 transition-transform group-hover:scale-110"
			>
				📚
			</div>
			<div class="relative">
				<div class="mb-2 text-3xl">📚</div>
				<p class="text-3xl font-bold tracking-tight text-white">
					{Object.keys(profile.studiedVerbs).length}
				</p>
				<p class="mt-1 text-xs font-medium tracking-wider text-emerald-300 uppercase">
					Verbos estudiados
				</p>
			</div>
		</div>
	</section>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<!-- Verbos Masterizados (Main Column) -->
		<section
			class="rounded-3xl border border-slate-800 bg-slate-950/50 p-6 backdrop-blur-sm lg:col-span-2"
		>
			<h2 class="mb-6 flex items-center gap-3 text-xl font-bold text-white">
				<span
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400"
					>🎓</span
				>
				<span>Dominio de Verbos</span>
			</h2>

			<!-- Resumen visual -->
			<div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div
					class="group relative overflow-hidden rounded-2xl border border-green-500/20 bg-green-500/5 p-4 text-center transition-colors hover:bg-green-500/10"
				>
					<div class="absolute top-0 right-0 p-2 text-4xl opacity-10">👑</div>
					<div class="mb-1 text-4xl font-black text-green-400">{verbStats().mastered}</div>
					<p class="text-xs font-bold tracking-widest text-green-500/80 uppercase">Dominados</p>
					<p class="mt-1 text-[10px] text-green-500/60">Score ≥ 7 (80%)</p>
				</div>
				<div
					class="group relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-center transition-colors hover:bg-yellow-500/10"
				>
					<div class="absolute top-0 right-0 p-2 text-4xl opacity-10">🚧</div>
					<div class="mb-1 text-4xl font-black text-yellow-400">{verbStats().inProgress}</div>
					<p class="text-xs font-bold tracking-widest text-yellow-500/80 uppercase">En progreso</p>
				</div>
				<div
					class="group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/30 p-4 text-center transition-colors hover:bg-slate-800/50"
				>
					<div class="absolute top-0 right-0 p-2 text-4xl opacity-10">💤</div>
					<div class="mb-1 text-4xl font-black text-slate-400">{verbStats().notStarted}</div>
					<p class="text-xs font-bold tracking-widest text-slate-500 uppercase">Pendientes</p>
				</div>
			</div>

			<!-- Barra de progreso general -->
			<div class="rounded-2xl border border-slate-800/50 bg-slate-900/50 p-6">
				<div class="mb-3 flex items-center justify-between text-sm">
					<span class="font-medium text-slate-300">Progreso total del diccionario</span>
					<span class="text-lg font-bold text-indigo-400"
						>{verbStats().masteredPercent + verbStats().inProgressPercent}%</span
					>
				</div>
				<div class="flex h-6 overflow-hidden rounded-full bg-slate-800 shadow-inner">
					<!-- Dominados (verde) -->
					{#if verbStats().masteredPercent > 0}
						<div
							class="flex h-full items-center justify-center bg-gradient-to-r from-green-600 to-emerald-500"
							style="width: {verbStats().masteredPercent}%"
							title="Dominados"
						>
							{#if verbStats().masteredPercent > 10}
								<span class="text-[10px] font-bold text-slate-900"
									>{verbStats().masteredPercent}%</span
								>
							{/if}
						</div>
					{/if}
					<!-- En progreso (amarillo) -->
					{#if verbStats().inProgressPercent > 0}
						<div
							class="flex h-full items-center justify-center bg-gradient-to-r from-yellow-500 to-amber-500"
							style="width: {verbStats().inProgressPercent}%"
							title="En progreso"
						>
							{#if verbStats().inProgressPercent > 10}
								<span class="text-[10px] font-bold text-slate-900"
									>{verbStats().inProgressPercent}%</span
								>
							{/if}
						</div>
					{/if}
				</div>
				<div class="mt-3 flex items-center justify-between px-1 text-xs text-slate-500">
					<div class="flex items-center gap-2">
						<div class="h-3 w-3 rounded-full bg-gradient-to-r from-green-600 to-emerald-500"></div>
						<span>Dominado (>80%)</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="h-3 w-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500"></div>
						<span>Aprendiendo</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="h-3 w-3 rounded-full bg-slate-800"></div>
						<span>Por descubrir</span>
					</div>
				</div>
			</div>

			<!-- Link al diccionario -->
			<a
				href="/diccionario"
				class="group mt-6 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-4 text-sm font-medium text-slate-300 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-300"
			>
				<div class="flex items-center gap-2">
					<span class="text-2xl transition-transform group-hover:scale-110">📖</span>
					<span>Explorar el diccionario completo</span>
				</div>
				<span class="transition-transform group-hover:translate-x-1">→</span>
			</a>
		</section>

		<!-- Right Column: Actions -->
		<div class="space-y-8">
			<section class="space-y-4">
				<a
					href="/practica"
					class="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-base font-bold text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
				>
					<div
						class="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0"
					></div>
					<span class="text-xl">🎮</span>
					<span>Continuar Practicando</span>
				</a>

				<BackupManager />

				<button
					onclick={() => {
						if (
							confirm(
								'¿Estás seguro de que quieres reiniciar tu progreso? Esta acción no se puede deshacer.'
							)
						) {
							userProfile.reset();
						}
					}}
					class="w-full rounded-2xl border border-red-500/20 px-6 py-3 text-xs font-bold tracking-wider text-red-400 uppercase transition-colors hover:border-red-500/40 hover:bg-red-500/10"
				>
					⚠️ Reiniciar progreso
				</button>
			</section>
		</div>
	</div>

	<!-- Achievements (full width) -->
	<section class="rounded-3xl border border-slate-800 bg-slate-950/50 p-6 backdrop-blur-sm">
		<h2 class="mb-6 flex items-center gap-3 text-xl font-bold text-white">
			<span
				class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400"
				>🏆</span
			>
			<span>Logros</span>
		</h2>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
			{#each achievements as achievement}
				<div
					class="relative overflow-hidden rounded-2xl border p-4 transition-all {achievement.unlocked
						? 'border-indigo-500/30 bg-indigo-500/5'
						: 'border-slate-800 bg-slate-900/30 opacity-70'}"
				>
					<div class="flex items-start gap-4">
						<div class="text-3xl drop-shadow-lg filter">{achievement.icon}</div>
						<div class="space-y-1">
							<h3
								class="text-sm font-bold text-white {achievement.unlocked
									? 'text-indigo-200'
									: 'text-slate-300'}"
							>
								{achievement.title}
							</h3>
							<p class="text-xs leading-relaxed text-slate-400">{achievement.description}</p>
							{#if achievement.unlocked}
								<div
									class="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-400"
								>
									<span>✓</span> Completado
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Progress Chart -->
	{#if profile.dailyHistory.length > 0}
		<section class="rounded-3xl border border-slate-800 bg-slate-950/50 p-6 backdrop-blur-sm">
			<h2 class="mb-6 flex items-center gap-3 text-xl font-bold text-white">
				<span
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400"
					>📈</span
				>
				<span>Tendencia de aprendizaje</span>
			</h2>
			<ProgressChart history={profile.dailyHistory} />
		</section>
	{/if}

	<!-- Recent Activity (Full Width) -->
	{#if profile.dailyHistory.length > 0}
		<section class="rounded-3xl border border-slate-800 bg-slate-950/50 p-6 backdrop-blur-sm">
			<h2 class="mb-6 flex items-center gap-3 text-xl font-bold text-white">
				<span
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/30 text-slate-300"
					>📅</span
				>
				<span>Historial reciente</span>
			</h2>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each profile.dailyHistory.slice(-6).reverse() as day}
					<div
						class="group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition-all hover:border-slate-700 hover:bg-slate-900"
					>
						<div class="mb-3 flex items-center justify-between">
							<p class="text-sm font-bold text-white capitalize">
								{new Date(day.date).toLocaleDateString('es-ES', {
									weekday: 'short',
									day: 'numeric',
									month: 'short'
								})}
							</p>
							<span class="font-mono text-xs text-slate-500">{day.date}</span>
						</div>

						<div class="mt-auto flex items-end justify-between">
							<div class="space-y-1">
								<div class="flex items-center gap-1.5 text-xs text-slate-400">
									<span class="text-indigo-400">📚</span>
									{day.verbsReviewed.length} verbos
								</div>
								<div class="flex items-center gap-1.5 text-xs text-slate-400">
									<span class="text-purple-400">📝</span>
									{day.totalQuestions} preguntas
								</div>
							</div>

							<div class="text-right">
								<div
									class="text-2xl font-black {day.totalQuestions > 0 &&
									day.correctAnswers / day.totalQuestions >= 0.8
										? 'text-green-400'
										: 'text-indigo-400'}"
								>
									{day.totalQuestions > 0
										? Math.round((day.correctAnswers / day.totalQuestions) * 100)
										: 0}%
								</div>
								<div class="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
									Precisión
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>
