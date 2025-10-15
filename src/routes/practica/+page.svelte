<script lang="ts">
	import { userProfile } from '$lib/stores/userProgress';
	import { speak } from '$lib/utils/tts';
	import { conjugateVerb } from '$lib/utils/conjugation';
	import type { Verb } from '$lib/types/verb';
	import verbsData from '$lib/data/verbs_n5.json';
	import { onMount } from 'svelte';

	const verbs: Verb[] = verbsData as Verb[];

	type GameMode = 'menu' | 'config' | 'flashcards' | 'multiple-choice' | 'conjugation' | 'listening' | 'conjugation-quiz';

	let currentMode = $state<GameMode>('menu');
	let selectedGame = $state<GameMode>('flashcards');
	let questionsPerSession = $state(10);
	let currentVerb = $state<Verb | null>(null);
	let questionCount = $state(0);
	let correctCount = $state(0);
	let showAnswer = $state(false);
	let selectedAnswer = $state<string | null>(null);
	let gameVerbs = $state<Verb[]>([]);
	let currentIndex = $state(0);
	let options = $state<string[]>([]);
	let feedback = $state('');
	let conjugationForm = $state('');
	let autoPlayedExample = $state(false);

	const games = [
		{
			id: 'flashcards',
			title: 'Tarjetas de memoria',
			description: 'Repasa verbos con tarjetas interactivas',
			icon: '🎴',
			color: 'from-blue-500 to-cyan-500',
			difficulty: 'Fácil'
		},
		{
			id: 'multiple-choice',
			title: 'Opción múltiple',
			description: 'Elige la traducción correcta',
			icon: '✅',
			color: 'from-green-500 to-emerald-500',
			difficulty: 'Medio'
		},
		{
			id: 'conjugation-quiz',
			title: 'Quiz de conjugación',
			description: 'Elige la conjugación correcta',
			icon: '🎯',
			color: 'from-indigo-500 to-purple-500',
			difficulty: 'Difícil'
		},
		{
			id: 'conjugation',
			title: 'Estudio de conjugación',
			description: 'Aprende formas verbales',
			icon: '📝',
			color: 'from-purple-500 to-pink-500',
			difficulty: 'Medio'
		},
		{
			id: 'listening',
			title: 'Comprensión auditiva',
			description: 'Identifica el verbo que escuchas',
			icon: '🔊',
			color: 'from-orange-500 to-red-500',
			difficulty: 'Medio'
		}
	];

	function selectGame(game: GameMode) {
		selectedGame = game;
		currentMode = 'config';
	}

	function startGame() {
		currentMode = selectedGame;
		gameVerbs = shuffleArray([...verbs]).slice(0, questionsPerSession);
		currentIndex = 0;
		questionCount = 0;
		correctCount = 0;
		loadNextQuestion();
	}

	function shuffleArray<T>(array: T[]): T[] {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	function loadNextQuestion() {
		if (currentIndex >= gameVerbs.length) {
			finishGame();
			return;
		}

		currentVerb = gameVerbs[currentIndex];
		showAnswer = false;
		selectedAnswer = null;
		feedback = '';
		autoPlayedExample = false;
		questionCount++;

		if (currentMode === 'multiple-choice' || currentMode === 'listening') {
			generateOptions();
		} else if (currentMode === 'conjugation-quiz') {
			generateConjugationQuiz();
		}
	}

	function generateOptions() {
		if (!currentVerb) return;
		
		const correctAnswer = currentVerb.meaning;
		const otherVerbs = verbs.filter(v => v.kanji !== currentVerb!.kanji);
		const wrongAnswers = shuffleArray(otherVerbs)
			.slice(0, 3)
			.map(v => v.meaning);
		
		options = shuffleArray([correctAnswer, ...wrongAnswers]);
	}

	function generateConjugationQuiz() {
		if (!currentVerb) return;
		
		const forms = ['ます', 'た', 'て', 'ない'];
		const selectedForm = forms[Math.floor(Math.random() * forms.length)];
		conjugationForm = selectedForm;
		
		const conjugations = conjugateVerb(currentVerb);
		const correctConjugation = conjugations.find(c => c.label.includes(selectedForm))?.kana || currentVerb.kana;
		
		// Generar opciones incorrectas usando otros verbos
		const otherVerbs = shuffleArray(verbs.filter(v => v.kanji !== currentVerb!.kanji)).slice(0, 3);
		const wrongAnswers = otherVerbs.map(v => {
			const conj = conjugateVerb(v);
			return conj.find(c => c.label.includes(selectedForm))?.kana || v.kana;
		});
		
		options = shuffleArray([correctConjugation, ...wrongAnswers]);
	}

	// Auto-reproducir ejemplo cuando se voltea la tarjeta
	$effect(() => {
		if (showAnswer && currentVerb && !autoPlayedExample && currentMode === 'flashcards') {
			if (currentVerb.examples && currentVerb.examples.length > 0) {
				setTimeout(() => {
					speak(currentVerb!.examples[0].ja);
					autoPlayedExample = true;
				}, 500);
			}
		}
	});

	function handleFlashcardAnswer(knew: boolean) {
		if (!currentVerb) return;
		
		if (knew) {
			correctCount++;
			userProfile.addXP(5);
		}
		
		userProfile.recordPractice(currentVerb.kanji, knew);
		currentIndex++;
		loadNextQuestion();
	}

	function handleMultipleChoiceAnswer(answer: string) {
		if (!currentVerb || selectedAnswer) return;
		
		selectedAnswer = answer;
		const correct = answer === currentVerb.meaning;
		
		if (correct) {
			correctCount++;
			feedback = '¡Correcto! 🎉';
			userProfile.addXP(10);
		} else {
			feedback = `Incorrecto. La respuesta correcta es: ${currentVerb.meaning}`;
		}
		
		userProfile.recordPractice(currentVerb.kanji, correct);
		
		// Reproducir audio del verbo antes de avanzar
		speak(currentVerb.kanji || currentVerb.kana);
		
		setTimeout(() => {
			currentIndex++;
			loadNextQuestion();
		}, 2500);
	}

	function handleConjugationQuizAnswer(answer: string) {
		if (!currentVerb || selectedAnswer) return;
		
		selectedAnswer = answer;
		const conjugations = conjugateVerb(currentVerb);
		const correctAnswer = conjugations.find(c => c.label.includes(conjugationForm))?.kana || currentVerb.kana;
		const correct = answer === correctAnswer;
		
		if (correct) {
			correctCount++;
			feedback = '¡Correcto! 🎉';
			userProfile.addXP(15);
		} else {
			feedback = `Incorrecto. La respuesta correcta es: ${correctAnswer}`;
		}
		
		userProfile.recordPractice(currentVerb.kanji, correct);
		
		// Reproducir audio de la conjugación
		speak(answer);
		
		setTimeout(() => {
			currentIndex++;
			loadNextQuestion();
		}, 2500);
	}

	function handleListeningPlay() {
		if (!currentVerb) return;
		speak(currentVerb.kanji || currentVerb.kana);
	}

	function handleConjugationAnswer(knew: boolean) {
		if (!currentVerb) return;
		
		if (knew) {
			correctCount++;
			userProfile.addXP(15);
		}
		
		userProfile.recordPractice(currentVerb.kanji, knew);
		currentIndex++;
		loadNextQuestion();
	}

	function finishGame() {
		currentMode = 'menu';
		const accuracy = Math.round((correctCount / questionCount) * 100);
		
		// Check for achievements
		if (questionCount >= 10 && accuracy === 100) {
			userProfile.addAchievement('perfect_game');
		}
	}

	function exitGame() {
		if (confirm('¿Seguro que quieres salir? Se perderá el progreso actual.')) {
			currentMode = 'menu';
		}
	}
</script>

<svelte:head>
	<title>Práctica · JapaVerbs N5</title>
</svelte:head>

<div class="pb-6">
	{#if currentMode === 'menu'}
		<!-- Game Selection Menu -->
		<section class="space-y-6">
			<div class="text-center">
				<div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-3xl mb-4">
					🎮
				</div>
				<h1 class="text-3xl font-bold text-white mb-2">Modo Práctica</h1>
				<p class="text-slate-400">Elige un juego para empezar a practicar</p>
			</div>

			<div class="grid gap-4">
				{#each games as game}
					<button
						onclick={() => selectGame(game.id as GameMode)}
						class="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br {game.color} text-left p-[1px] transition-all active:scale-95"
					>
						<div class="rounded-[calc(theme(borderRadius.2xl)-1px)] bg-slate-950/90 p-5">
							<div class="flex items-start gap-4">
								<div class="text-4xl">{game.icon}</div>
								<div class="flex-1">
									<div class="flex items-center justify-between mb-1">
										<h2 class="text-xl font-semibold text-white">{game.title}</h2>
										<span class="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300">
											{game.difficulty}
										</span>
									</div>
									<p class="text-sm text-slate-400">{game.description}</p>
									<div class="mt-3 inline-flex items-center text-xs font-semibold uppercase tracking-wider text-indigo-200 group-hover:text-white transition-colors">
										Jugar ahora →
									</div>
								</div>
							</div>
						</div>
					</button>
				{/each}
			</div>

			<!-- Quick Stats -->
			<div class="grid grid-cols-2 gap-3 pt-4">
				<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-center">
					<div class="text-2xl mb-1">📊</div>
					<p class="text-lg font-bold text-white">{$userProfile.totalPractices}</p>
					<p class="text-xs text-slate-400">Sesiones totales</p>
				</div>
				<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-center">
					<div class="text-2xl mb-1">🎯</div>
					<p class="text-lg font-bold text-white">
						{$userProfile.totalQuestions > 0 
							? Math.round(($userProfile.totalCorrect / $userProfile.totalQuestions) * 100) 
							: 0}%
					</p>
					<p class="text-xs text-slate-400">Precisión global</p>
				</div>
			</div>
		</section>

	{:else if currentMode === 'config'}
		<!-- Configuration Screen -->
		<section class="space-y-6">
			<div class="flex items-center justify-between">
				<button
					onclick={() => currentMode = 'menu'}
					class="text-slate-400 hover:text-white transition-colors"
				>
					← Volver
				</button>
			</div>

			<div class="text-center">
				<div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-3xl mb-4">
					{games.find(g => g.id === selectedGame)?.icon || '🎮'}
				</div>
				<h1 class="text-2xl font-bold text-white mb-2">
					{games.find(g => g.id === selectedGame)?.title}
				</h1>
				<p class="text-slate-400">Configura tu sesión de práctica</p>
			</div>

			<!-- Questions Selector -->
			<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
				<h2 class="text-lg font-semibold text-white mb-4">Cantidad de preguntas</h2>
				<div class="grid grid-cols-2 gap-3">
					{#each [10, 20, 30, 40] as amount}
						<button
							onclick={() => questionsPerSession = amount}
							class="rounded-xl border-2 p-4 text-center font-semibold transition-all active:scale-95 {
								questionsPerSession === amount
									? 'border-indigo-500 bg-indigo-500/20 text-white'
									: 'border-slate-800 bg-slate-900 text-slate-400 hover:border-indigo-500/50'
							}"
						>
							<div class="text-3xl font-bold mb-1">{amount}</div>
							<div class="text-xs">preguntas</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Start Button -->
			<button
				onclick={startGame}
				class="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4 text-lg font-semibold text-white transition-all active:scale-95"
			>
				Comenzar práctica
			</button>
		</section>

	{:else if currentMode === 'flashcards'}
		<!-- Flashcards Game -->
		<section class="space-y-6">
			<!-- Header -->
			<div class="flex items-center justify-between">
				<button
					onclick={exitGame}
					class="text-slate-400 hover:text-white transition-colors"
				>
					← Salir
				</button>
				<div class="text-sm text-slate-400">
					{currentIndex + 1} / {gameVerbs.length}
				</div>
			</div>

			{#if currentVerb}
				<!-- Flashcard -->
				<div 
					class="relative h-96 w-full cursor-pointer perspective-1000"
					onclick={(e) => {
						const target = e.target as HTMLElement;
						if (!target.closest('button')) {
							showAnswer = !showAnswer;
						}
					}}
					role="button"
					tabindex="0"
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							showAnswer = !showAnswer;
						}
					}}
				>
					<div class="absolute inset-0 transition-transform duration-500 preserve-3d {showAnswer ? 'rotate-y-180' : ''}">
						<!-- Front -->
						<div class="absolute inset-0 backface-hidden rounded-3xl border-2 border-indigo-500 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 p-8 flex flex-col items-center justify-center text-center">
							<div class="text-6xl font-bold text-white mb-4">
								{currentVerb.kanji}
							</div>
							<div class="text-2xl text-slate-300 mb-2">{currentVerb.kana}</div>
							<div class="text-lg text-slate-400">{currentVerb.romaji}</div>
							<button
								onclick={(e) => {
									e.stopPropagation();
									speak(currentVerb!.kanji || currentVerb!.kana);
								}}
								class="mt-6 p-3 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-2xl"
								type="button"
							>
								🔊
							</button>
							<p class="mt-8 text-sm text-slate-500">Toca para ver la respuesta</p>
						</div>

						<!-- Back -->
						<div class="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl border-2 border-green-500 bg-gradient-to-br from-green-600/20 to-emerald-600/20 p-8 flex flex-col items-center justify-center text-center">
							<div class="text-4xl font-bold text-white mb-8">
								{currentVerb.meaning}
							</div>
							{#if currentVerb.examples.length > 0}
								<div class="space-y-3 w-full">
									<div class="relative text-sm text-slate-300 bg-slate-900/50 rounded-xl p-4 border border-slate-800">
										<p class="font-japanese mb-2">{currentVerb.examples[0].ja}</p>
										<p class="text-slate-400 mb-3">{currentVerb.examples[0].es}</p>
										<button
											onclick={(e) => {
												e.stopPropagation();
												speak(currentVerb!.examples[0].ja);
											}}
											class="absolute top-3 right-3 p-2 rounded-lg hover:bg-slate-800 transition-colors text-lg"
											type="button"
										>
											🔊
										</button>
									</div>
								</div>
							{/if}
							<p class="mt-8 text-sm text-slate-500">Toca para voltear</p>
						</div>
					</div>
				</div>

				<!-- Answer Buttons -->
				{#if showAnswer}
					<div class="grid grid-cols-2 gap-3">
						<button
							onclick={() => handleFlashcardAnswer(false)}
							class="rounded-2xl border-2 border-red-500/50 bg-red-500/10 px-6 py-4 text-lg font-semibold text-red-400 transition-all active:scale-95"
						>
							❌ No sabía
						</button>
						<button
							onclick={() => handleFlashcardAnswer(true)}
							class="rounded-2xl border-2 border-green-500/50 bg-green-500/10 px-6 py-4 text-lg font-semibold text-green-400 transition-all active:scale-95"
						>
							✅ Sí sabía
						</button>
					</div>
				{/if}
			{:else}
				<div class="text-center py-20">
					<div class="text-6xl mb-4">🎉</div>
					<h2 class="text-2xl font-bold text-white mb-2">¡Sesión completada!</h2>
					<p class="text-slate-400 mb-6">
						{correctCount} de {questionCount} correctas ({Math.round((correctCount / questionCount) * 100)}%)
					</p>
					<button
						onclick={() => currentMode = 'menu'}
						class="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 font-semibold text-white"
					>
						Volver al menú
					</button>
				</div>
			{/if}
		</section>

	{:else if currentMode === 'multiple-choice'}
		<!-- Multiple Choice Game -->
		<section class="space-y-6">
			<!-- Header -->
			<div class="flex items-center justify-between">
				<button
					onclick={exitGame}
					class="text-slate-400 hover:text-white transition-colors"
				>
					← Salir
				</button>
				<div class="text-sm text-slate-400">
					{currentIndex + 1} / {gameVerbs.length}
				</div>
			</div>

			{#if currentVerb}
				<!-- Question -->
				<div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center">
					<p class="text-sm text-slate-400 mb-4">¿Qué significa?</p>
					<div class="text-5xl font-bold text-white mb-3">
						{currentVerb.kanji}
					</div>
					<div class="text-xl text-slate-300 mb-2">{currentVerb.kana}</div>
					<div class="text-lg text-slate-400">{currentVerb.romaji}</div>
					<button
						onclick={() => speak(currentVerb!.kanji || currentVerb!.kana)}
						class="mt-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-xl"
					>
						🔊
					</button>
				</div>

				<!-- Options -->
				<div class="grid gap-3">
					{#each options as option}
						<button
							onclick={() => handleMultipleChoiceAnswer(option)}
							disabled={selectedAnswer !== null}
							class="rounded-2xl border-2 p-4 text-lg font-medium transition-all active:scale-95 {
								selectedAnswer === null
									? 'border-slate-800 bg-slate-900/70 text-white hover:border-indigo-500'
									: selectedAnswer === option
										? option === currentVerb.meaning
											? 'border-green-500 bg-green-500/20 text-green-400'
											: 'border-red-500 bg-red-500/20 text-red-400'
										: option === currentVerb.meaning
											? 'border-green-500 bg-green-500/20 text-green-400'
											: 'border-slate-800 bg-slate-900/50 text-slate-500'
							}"
						>
							{option}
						</button>
					{/each}
				</div>

				<!-- Feedback -->
				{#if feedback}
					<div class="text-center">
						<p class="text-lg font-medium {feedback.includes('Correcto') ? 'text-green-400' : 'text-red-400'}">
							{feedback}
						</p>
					</div>
				{/if}
			{:else}
				<div class="text-center py-20">
					<div class="text-6xl mb-4">🎉</div>
					<h2 class="text-2xl font-bold text-white mb-2">¡Sesión completada!</h2>
					<p class="text-slate-400 mb-6">
						{correctCount} de {questionCount} correctas ({Math.round((correctCount / questionCount) * 100)}%)
					</p>
					<button
						onclick={() => currentMode = 'menu'}
						class="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 font-semibold text-white"
					>
						Volver al menú
					</button>
				</div>
			{/if}
		</section>

	{:else if currentMode === 'listening'}
		<!-- Listening Game -->
		<section class="space-y-6">
			<!-- Header -->
			<div class="flex items-center justify-between">
				<button
					onclick={exitGame}
					class="text-slate-400 hover:text-white transition-colors"
				>
					← Salir
				</button>
				<div class="text-sm text-slate-400">
					{currentIndex + 1} / {gameVerbs.length}
				</div>
			</div>

			{#if currentVerb}
				<!-- Audio Player -->
				<div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-12 text-center">
					<p class="text-sm text-slate-400 mb-6">Escucha el audio y elige la respuesta correcta</p>
					<button
						onclick={handleListeningPlay}
						class="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-5xl hover:scale-110 transition-transform active:scale-95 shadow-lg shadow-orange-500/30"
					>
						🔊
					</button>
					<p class="text-xs text-slate-500 mt-6">Toca para reproducir</p>
				</div>

				<!-- Options -->
				<div class="grid gap-3">
					{#each options as option}
						<button
							onclick={() => handleMultipleChoiceAnswer(option)}
							disabled={selectedAnswer !== null}
							class="rounded-2xl border-2 p-4 text-lg font-medium transition-all active:scale-95 {
								selectedAnswer === null
									? 'border-slate-800 bg-slate-900/70 text-white hover:border-orange-500'
									: selectedAnswer === option
										? option === currentVerb.meaning
											? 'border-green-500 bg-green-500/20 text-green-400'
											: 'border-red-500 bg-red-500/20 text-red-400'
										: option === currentVerb.meaning
											? 'border-green-500 bg-green-500/20 text-green-400'
											: 'border-slate-800 bg-slate-900/50 text-slate-500'
							}"
						>
							{option}
						</button>
					{/each}
				</div>

				<!-- Feedback -->
				{#if feedback}
					<div class="text-center">
						<p class="text-lg font-medium {feedback.includes('Correcto') ? 'text-green-400' : 'text-red-400'}">
							{feedback}
						</p>
					</div>
				{/if}
			{:else}
				<div class="text-center py-20">
					<div class="text-6xl mb-4">🎉</div>
					<h2 class="text-2xl font-bold text-white mb-2">¡Sesión completada!</h2>
					<p class="text-slate-400 mb-6">
						{correctCount} de {questionCount} correctas ({Math.round((correctCount / questionCount) * 100)}%)
					</p>
					<button
						onclick={() => currentMode = 'menu'}
						class="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 font-semibold text-white"
					>
						Volver al menú
					</button>
				</div>
			{/if}
		</section>

	{:else if currentMode === 'conjugation-quiz'}
		<!-- Conjugation Quiz Game -->
		<section class="space-y-6">
			<!-- Header -->
			<div class="flex items-center justify-between">
				<button
					onclick={exitGame}
					class="text-slate-400 hover:text-white transition-colors"
				>
					← Salir
				</button>
				<div class="text-sm text-slate-400">
					{currentIndex + 1} / {gameVerbs.length}
				</div>
			</div>

			{#if currentVerb}
				<!-- Question -->
				<div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center">
					<p class="text-sm text-slate-400 mb-4">¿Cómo se conjuga este verbo?</p>
					<div class="text-5xl font-bold text-white mb-3">
						{currentVerb.kanji}
					</div>
					<div class="text-xl text-slate-300 mb-2">{currentVerb.kana}</div>
					<div class="text-lg text-indigo-400 mb-4">{currentVerb.meaning}</div>
					<div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/50">
						<span class="text-sm font-medium text-purple-300">Forma {conjugationForm}</span>
					</div>
					<button
						onclick={() => speak(currentVerb!.kanji || currentVerb!.kana)}
						class="mt-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-xl"
					>
						🔊
					</button>
				</div>

				<!-- Options -->
				<div class="grid gap-3">
					{#each options as option}
						<button
							onclick={() => handleConjugationQuizAnswer(option)}
							disabled={selectedAnswer !== null}
							class="rounded-2xl border-2 p-4 text-lg font-medium transition-all active:scale-95 {
								selectedAnswer === null
									? 'border-slate-800 bg-slate-900/70 text-white hover:border-indigo-500'
									: selectedAnswer === option
										? (() => {
											const conjugations = conjugateVerb(currentVerb);
											const correctAnswer = conjugations.find(c => c.label.includes(conjugationForm))?.kana || currentVerb.kana;
											return option === correctAnswer
												? 'border-green-500 bg-green-500/20 text-green-400'
												: 'border-red-500 bg-red-500/20 text-red-400';
										})()
										: (() => {
											const conjugations = conjugateVerb(currentVerb);
											const correctAnswer = conjugations.find(c => c.label.includes(conjugationForm))?.kana || currentVerb.kana;
											return option === correctAnswer
												? 'border-green-500 bg-green-500/20 text-green-400'
												: 'border-slate-800 bg-slate-900/50 text-slate-500';
										})()
							}"
						>
							{option}
						</button>
					{/each}
				</div>

				<!-- Feedback -->
				{#if feedback}
					<div class="text-center">
						<p class="text-lg font-medium {feedback.includes('Correcto') ? 'text-green-400' : 'text-red-400'}">
							{feedback}
						</p>
					</div>
				{/if}
			{:else}
				<div class="text-center py-20">
					<div class="text-6xl mb-4">🎉</div>
					<h2 class="text-2xl font-bold text-white mb-2">¡Sesión completada!</h2>
					<p class="text-slate-400 mb-6">
						{correctCount} de {questionCount} correctas ({Math.round((correctCount / questionCount) * 100)}%)
					</p>
					<button
						onclick={() => currentMode = 'menu'}
						class="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 font-semibold text-white"
					>
						Volver al menú
					</button>
				</div>
			{/if}
		</section>

	{:else if currentMode === 'conjugation'}
		<!-- Conjugation Study Mode -->
		<section class="space-y-6">
			<!-- Header -->
			<div class="flex items-center justify-between">
				<button
					onclick={exitGame}
					class="text-slate-400 hover:text-white transition-colors"
				>
					← Salir
				</button>
				<div class="text-sm text-slate-400">
					{currentIndex + 1} / {gameVerbs.length}
				</div>
			</div>

			{#if currentVerb}
				<!-- Question -->
				<div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-center">
					<p class="text-sm text-slate-400 mb-4">Conjuga este verbo</p>
					<div class="text-4xl font-bold text-white mb-3">
						{currentVerb.kanji}
					</div>
					<div class="text-xl text-slate-300 mb-2">{currentVerb.kana}</div>
					<div class="text-lg text-indigo-400 mb-2">{currentVerb.meaning}</div>
					<span class="inline-block px-3 py-1 rounded-full text-xs font-medium border bg-purple-500/20 text-purple-400 border-purple-500/50">
						{currentVerb.type === 'godan' ? 'Godan' : currentVerb.type === 'ichidan' ? 'Ichidan' : 'Irregular'}
					</span>
				</div>

				{#if !showAnswer}
					<div class="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
						<p class="text-slate-300 mb-8">
							Piensa en las conjugaciones principales de este verbo (forma ます, forma た, forma て, etc.)
						</p>
						<button
							onclick={() => showAnswer = true}
							class="rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-8 py-3 font-semibold text-white transition-colors"
						>
							Ver conjugaciones
						</button>
					</div>
				{:else}
					<!-- Conjugations Display -->
					<div class="space-y-3">
						<div class="grid gap-2">
							<div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
								<p class="text-xs font-semibold text-indigo-300 mb-1">Forma ます</p>
								<p class="text-xl font-medium text-white">{currentVerb.kana}ます</p>
							</div>
							<div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
								<p class="text-xs font-semibold text-indigo-300 mb-1">Forma た</p>
								<p class="text-xl font-medium text-white">{currentVerb.kana}た</p>
							</div>
							<div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
								<p class="text-xs font-semibold text-indigo-300 mb-1">Forma て</p>
								<p class="text-xl font-medium text-white">{currentVerb.kana}て</p>
							</div>
							<div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
								<p class="text-xs font-semibold text-indigo-300 mb-1">Forma ない</p>
								<p class="text-xl font-medium text-white">{currentVerb.kana}ない</p>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-3 pt-4">
							<button
								onclick={() => handleConjugationAnswer(false)}
								class="rounded-2xl border-2 border-red-500/50 bg-red-500/10 px-6 py-4 text-lg font-semibold text-red-400 transition-all active:scale-95"
							>
								❌ No sabía
							</button>
							<button
								onclick={() => handleConjugationAnswer(true)}
								class="rounded-2xl border-2 border-green-500/50 bg-green-500/10 px-6 py-4 text-lg font-semibold text-green-400 transition-all active:scale-95"
							>
								✅ Sí sabía
							</button>
						</div>
					</div>
				{/if}
			{:else}
				<div class="text-center py-20">
					<div class="text-6xl mb-4">🎉</div>
					<h2 class="text-2xl font-bold text-white mb-2">¡Sesión completada!</h2>
					<p class="text-slate-400 mb-6">
						{correctCount} de {questionCount} correctas ({Math.round((correctCount / questionCount) * 100)}%)
					</p>
					<button
						onclick={() => currentMode = 'menu'}
						class="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 font-semibold text-white"
					>
						Volver al menú
					</button>
				</div>
			{/if}
		</section>
	{/if}
</div>

<style>
	.font-japanese {
		font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic Pro', 'Meiryo', sans-serif;
	}

	.perspective-1000 {
		perspective: 1000px;
	}

	.preserve-3d {
		transform-style: preserve-3d;
	}

	.backface-hidden {
		backface-visibility: hidden;
	}

	.rotate-y-180 {
		transform: rotateY(180deg);
	}
</style>
