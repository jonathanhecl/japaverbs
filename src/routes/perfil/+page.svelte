<script lang="ts">
	import { userProfile } from '$lib/stores/userProgress';
	import { onMount } from 'svelte';
	import type { Verb } from '$lib/types/verb';
	import verbsData from '$lib/data/verbs_n5.json';

	const verbs: Verb[] = verbsData as Verb[];

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

	const last7Days = $derived(() => {
		const days = [];
		for (let i = 6; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			const dateStr = date.toISOString().split('T')[0];
			const dayProgress = profile.dailyHistory.find(d => d.date === dateStr);
			days.push({
				date: dateStr,
				day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
				count: dayProgress?.totalQuestions || 0
			});
		}
		return days;
	});

	const maxDayCount = $derived(Math.max(...last7Days().map(d => d.count), 1));

	// Calcular verbos masterizados (mastery score = 5) vs pendientes
	const verbStats = $derived(() => {
		const totalVerbs = verbs.length;
		let masteredCount = 0;
		let inProgressCount = 0;
		let notStartedCount = 0;

		verbs.forEach(verb => {
			const progress = profile.studiedVerbs[verb.kanji];
			if (!progress) {
				notStartedCount++;
			} else if (progress.masteryScore >= 5) {
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
			studiedPercent: Math.round(((masteredCount + inProgressCount) / totalVerbs) * 100)
		};
	});

	const achievements = [
		{ id: 'first_practice', title: 'Primer paso', icon: '🎯', description: 'Completa tu primera práctica', unlocked: profile.totalPractices >= 1 },
		{ id: 'practice_10', title: 'Dedicado', icon: '📚', description: 'Completa 10 prácticas', unlocked: profile.totalPractices >= 10 },
		{ id: 'practice_50', title: 'Estudiante serio', icon: '🎓', description: 'Completa 50 prácticas', unlocked: profile.totalPractices >= 50 },
		{ id: 'streak_3', title: 'Constancia', icon: '🔥', description: 'Mantén una racha de 3 días', unlocked: profile.streak >= 3 },
		{ id: 'streak_7', title: 'Semana perfecta', icon: '⭐', description: 'Mantén una racha de 7 días', unlocked: profile.streak >= 7 },
		{ id: 'accuracy_80', title: 'Precisión', icon: '🎯', description: 'Alcanza 80% de precisión', unlocked: accuracy >= 80 && profile.totalQuestions >= 20 },
		{ id: 'level_5', title: 'Nivel 5', icon: '🏆', description: 'Alcanza el nivel 5', unlocked: profile.level >= 5 },
		{ id: 'verbs_20', title: 'Explorador', icon: '🗺️', description: 'Estudia 20 verbos diferentes', unlocked: Object.keys(profile.studiedVerbs).length >= 20 }
	];
</script>

<svelte:head>
	<title>Mi Perfil · JapaVerbs</title>
</svelte:head>

<div class="space-y-6 pb-6">
	<!-- Profile Header -->
	<section class="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 p-[1px]">
		<div class="rounded-[calc(theme(borderRadius.3xl)-1px)] bg-slate-950/80 p-6">
			<div class="flex items-start justify-between mb-4">
				<div class="flex items-center gap-4">
					<div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-3xl">
						👤
					</div>
					<div>
						{#if editingName}
							<input
								type="text"
								bind:value={tempName}
								onkeydown={(e) => e.key === 'Enter' && saveName()}
								class="bg-slate-900 border-2 border-indigo-500 rounded-xl px-3 py-2 text-xl font-bold text-white focus:outline-none"
								placeholder="Tu nombre"
								autofocus
							/>
							<div class="flex gap-2 mt-2">
								<button
									onclick={saveName}
									class="px-3 py-1 text-xs bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
								>
									Guardar
								</button>
								<button
									onclick={cancelEdit}
									class="px-3 py-1 text-xs bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
								>
									Cancelar
								</button>
							</div>
						{:else}
							<h1 class="text-2xl font-bold text-white">
								{profile.name || 'Usuario'}
							</h1>
							<button
								onclick={startEditName}
								class="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1"
							>
								✏️ {profile.name ? 'Editar nombre' : 'Añadir nombre'}
							</button>
						{/if}
					</div>
				</div>
			</div>

			<!-- Level & XP -->
			<div class="space-y-2">
				<div class="flex items-center justify-between text-sm">
					<span class="text-slate-300">Nivel {profile.level}</span>
					<span class="text-slate-400">{profile.xp % 100} / {xpForNextLevel} XP</span>
				</div>
				<div class="h-3 bg-slate-900 rounded-full overflow-hidden">
					<div 
						class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
						style="width: {xpProgress * 100}%"
					></div>
				</div>
			</div>
		</div>
	</section>

	<!-- Stats Grid -->
	<section class="grid grid-cols-2 gap-3">
		<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
			<div class="text-3xl mb-1">🔥</div>
			<p class="text-2xl font-bold text-white">{profile.streak}</p>
			<p class="text-xs text-slate-400">Días de racha</p>
		</div>
		<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
			<div class="text-3xl mb-1">🎯</div>
			<p class="text-2xl font-bold text-white">{accuracy}%</p>
			<p class="text-xs text-slate-400">Precisión</p>
		</div>
		<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
			<div class="text-3xl mb-1">📝</div>
			<p class="text-2xl font-bold text-white">{profile.totalPractices}</p>
			<p class="text-xs text-slate-400">Prácticas totales</p>
		</div>
		<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
			<div class="text-3xl mb-1">📚</div>
			<p class="text-2xl font-bold text-white">{Object.keys(profile.studiedVerbs).length}</p>
			<p class="text-xs text-slate-400">Verbos estudiados</p>
		</div>
	</section>

	<!-- Activity Chart -->
	<section class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
		<h2 class="text-lg font-semibold text-white mb-4">Actividad esta semana</h2>
		<div class="flex items-end justify-between gap-2 h-32">
			{#each last7Days() as day}
				<div class="flex-1 flex flex-col items-center gap-2">
					<div class="flex-1 flex items-end w-full">
						<div 
							class="w-full rounded-t-lg transition-all {day.count > 0 ? 'bg-gradient-to-t from-indigo-600 to-purple-500' : 'bg-slate-800'}"
							style="height: {day.count > 0 ? (day.count / maxDayCount * 100) : 10}%"
							title="{day.count} preguntas"
						></div>
					</div>
					<span class="text-[10px] text-slate-400 uppercase">{day.day}</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- Verbos Masterizados -->
	<section class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
		<h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
			<span>🎓</span>
			<span>Progreso de Verbos</span>
		</h2>
		
		<!-- Resumen visual -->
		<div class="grid grid-cols-3 gap-3 mb-4">
			<div class="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-center">
				<div class="text-2xl font-bold text-green-400">{verbStats().mastered}</div>
				<p class="text-xs text-green-300/80">Dominados</p>
			</div>
			<div class="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-center">
				<div class="text-2xl font-bold text-yellow-400">{verbStats().inProgress}</div>
				<p class="text-xs text-yellow-300/80">En progreso</p>
			</div>
			<div class="rounded-xl border border-slate-700 bg-slate-800/50 p-3 text-center">
				<div class="text-2xl font-bold text-slate-400">{verbStats().notStarted}</div>
				<p class="text-xs text-slate-400">Pendientes</p>
			</div>
		</div>

		<!-- Barra de progreso general -->
		<div class="space-y-2">
			<div class="flex items-center justify-between text-sm">
				<span class="text-slate-300">Verbos dominados</span>
				<span class="text-indigo-400 font-semibold">{verbStats().masteredPercent}%</span>
			</div>
			<div class="h-3 bg-slate-800 rounded-full overflow-hidden">
				<div 
					class="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
					style="width: {verbStats().masteredPercent}%"
				></div>
			</div>
			<p class="text-xs text-slate-400 text-center">
				{verbStats().mastered} de {verbStats().total} verbos con dominio completo
			</p>
		</div>

		<!-- Link al diccionario -->
		<a 
			href="/diccionario"
			class="mt-4 flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm font-medium text-indigo-300 hover:border-indigo-500/50 hover:bg-indigo-500/20 transition-colors"
		>
			<span>📚</span>
			<span>Ver todos los verbos en el diccionario</span>
			<span>→</span>
		</a>
	</section>

	<!-- Achievements -->
	<section class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
		<h2 class="text-lg font-semibold text-white mb-4">Logros</h2>
		<div class="grid grid-cols-2 gap-3">
			{#each achievements as achievement}
				<div 
					class="rounded-xl border p-3 transition-all {achievement.unlocked 
						? 'border-indigo-500/50 bg-indigo-500/10' 
						: 'border-slate-800 bg-slate-900/50 opacity-50'}"
				>
					<div class="text-2xl mb-2">{achievement.icon}</div>
					<h3 class="text-sm font-semibold text-white mb-1">{achievement.title}</h3>
					<p class="text-xs text-slate-400">{achievement.description}</p>
					{#if achievement.unlocked}
						<div class="mt-2 text-xs text-green-400 flex items-center gap-1">
							✓ Desbloqueado
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</section>

	<!-- Recent Activity -->
	{#if profile.dailyHistory.length > 0}
		<section class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
			<h2 class="text-lg font-semibold text-white mb-4">Historial reciente</h2>
			<div class="space-y-2">
				{#each profile.dailyHistory.slice(-5).reverse() as day}
					<div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
						<div>
							<p class="text-sm font-medium text-white">
								{new Date(day.date).toLocaleDateString('es-ES', { 
									weekday: 'long', 
									year: 'numeric', 
									month: 'long', 
									day: 'numeric' 
								})}
							</p>
							<p class="text-xs text-slate-400">
								{day.verbsReviewed.length} verbos · {day.totalQuestions} preguntas
							</p>
						</div>
						<div class="text-right">
							<p class="text-sm font-bold text-indigo-400">
								{day.totalQuestions > 0 ? Math.round((day.correctAnswers / day.totalQuestions) * 100) : 0}%
							</p>
							<p class="text-xs text-slate-500">Precisión</p>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Actions -->
	<section class="space-y-3">
		<a
			href="/practica"
			class="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4 text-sm font-semibold text-white transition-transform active:scale-95"
		>
			🎮 Ir a practicar
		</a>
		<button
			onclick={() => {
				if (confirm('¿Estás seguro de que quieres reiniciar tu progreso? Esta acción no se puede deshacer.')) {
					userProfile.reset();
				}
			}}
			class="w-full rounded-2xl border border-red-500/50 px-6 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
		>
			⚠️ Reiniciar progreso
		</button>
	</section>
</div>
