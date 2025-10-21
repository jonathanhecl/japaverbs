<script lang="ts">
	import { userProfile } from '$lib/stores/userProgress';
	import { speak } from '$lib/utils/tts';
	import { conjugateVerb } from '$lib/utils/conjugation';
	import type { Verb } from '$lib/types/verb';
	import verbs from '$lib/data/verbs';
	import { onMount } from 'svelte';

	type GameMode = 'menu' | 'config' | 'flashcards' | 'multiple-choice' | 'conjugation' | 'listening' | 'conjugation-quiz' | 'results';

	interface VerbResult {
		verb: Verb;
		correct: boolean;
		previousMastery: number;
		newMastery: number;
	}

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
	let showErrorOverlay = $state(false);
	let conjugationForm = $state('');
	let conjugationTranslation = $state('');
	let conjugationFormality = $state(''); // 'formal' o 'informal'
	let autoPlayedExample = $state(false);
	let sessionResults = $state<VerbResult[]>([]);
	let completedGameMode = $state<GameMode>('flashcards');

	// Función para obtener colores según el tipo de forma
	function getFormColor(key: string) {
		switch(key) {
			case 'dictionary': return { bg: 'bg-slate-500/10', border: 'border-slate-500/40', text: 'text-slate-200', label: 'Diccionario' };
			case 'masu': return { bg: 'bg-blue-500/10', border: 'border-blue-500/40', text: 'text-blue-200', label: 'Formal' };
			case 'masuPast': return { bg: 'bg-blue-500/10', border: 'border-blue-500/40', text: 'text-blue-200', label: 'Pasado Formal' };
			case 'plainPast': return { bg: 'bg-orange-500/10', border: 'border-orange-500/40', text: 'text-orange-200', label: 'Pasado' };
			case 'te': return { bg: 'bg-purple-500/10', border: 'border-purple-500/40', text: 'text-purple-200', label: 'Versátil' };
			case 'plainNegative': return { bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-200', label: 'Negativa' };
			default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/40', text: 'text-slate-200', label: '' };
		}
	}

	const games = [
		{
			id: 'flashcards',
			title: 'Tarjetas de memoria',
			description: 'Repasa verbos con tarjetas interactivas',
			icon: '🎴',
			color: 'from-blue-500 to-cyan-500',
			difficulty: 'Fácil',
			order: 1
		},
		{
			id: 'multiple-choice',
			title: 'Opción múltiple',
			description: 'Elige la traducción correcta',
			icon: '✅',
			color: 'from-green-500 to-emerald-500',
			difficulty: 'Medio',
			order: 2
		},
		{
			id: 'conjugation',
			title: 'Estudio de conjugación',
			description: 'Aprende formas verbales',
			icon: '📝',
			color: 'from-purple-500 to-pink-500',
			difficulty: 'Medio',
			order: 3
		},
		{
			id: 'listening',
			title: 'Comprensión auditiva',
			description: 'Identifica el verbo que escuchas',
			icon: '🔊',
			color: 'from-orange-500 to-red-500',
			difficulty: 'Medio',
			order: 4
		},
		{
			id: 'conjugation-quiz',
			title: 'Quiz de conjugación',
			description: 'Elige la conjugación correcta',
			icon: '🎯',
			color: 'from-indigo-500 to-purple-500',
			difficulty: 'Difícil',
			order: 5
		}
	].sort((a, b) => a.order - b.order);

	function startGame(mode: GameMode) {
		currentMode = mode;
		completedGameMode = mode;
		sessionResults = []; // Reiniciar resultados de la sesión
		
		// Implementar algoritmo de repetición espaciada
		const today = new Date().toISOString().split('T')[0];
		
		// Calcular prioridad de cada verbo
		const verbsWithPriority = verbs.map(verb => {
			const progress = $userProfile.studiedVerbs[verb.kanji];
			
			if (!progress) {
				// Verbos nuevos tienen prioridad alta
				return { verb, priority: 1000 };
			}
			
			const masteryScore = progress.masteryScore;
			const nextReviewDate = progress.nextReviewDate;
			const isReady = nextReviewDate <= today;
			
			// Calcular prioridad:
			// - Verbos listos para revisión: prioridad alta
			// - Verbos difíciles (masteryScore bajo): prioridad más alta
			// - Verbos dominados (masteryScore alto): prioridad más baja
			let priority = 0;
			
			if (isReady) {
				// Listo para revisión: base de 500
				priority = 500;
				// Agregar bonus según dificultad (más difícil = más prioridad)
				priority += (5 - masteryScore) * 50; // -5 score = +500, +5 score = +0
			} else {
				// No es momento de revisión, pero verbos difíciles aún tienen prioridad
				priority = Math.max(0, (5 - masteryScore) * 20); // -5 score = +200, +5 score = +0
			}
			
			return { verb, priority };
		});
		
		// Ordenar por prioridad (mayor primero) y agregar algo de aleatoriedad
		verbsWithPriority.sort((a, b) => {
			// Agregar factor aleatorio pequeño para no ser completamente determinista
			const randomFactor = (Math.random() - 0.5) * 50;
			return (b.priority - a.priority) + randomFactor;
		});
		
		// Seleccionar los primeros N verbos según prioridad
		gameVerbs = verbsWithPriority.slice(0, questionsPerSession).map(v => v.verb);
		
		// Mezclar el orden de los verbos seleccionados
		gameVerbs = shuffleArray(gameVerbs);
		
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
		
		const correctAnswer = currentVerb['meaning-es'];
		const otherVerbs = verbs.filter(v => v.kanji !== currentVerb!.kanji);
		const wrongAnswers = shuffleArray(otherVerbs)
			.slice(0, 3)
			.map(v => v['meaning-es']);
		
		options = shuffleArray([correctAnswer, ...wrongAnswers]);
	}

	function generateConjugationQuiz() {
		if (!currentVerb) return;
		
		// Formas con información de formalidad
		const formsWithFormality = [
			{ form: 'ます', formality: 'formal' },
			{ form: 'ました', formality: 'formal' },
			{ form: 'た', formality: 'informal' },
			{ form: 'て', formality: 'informal' },
			{ form: 'ない', formality: 'informal' }
		];
		
		const selected = formsWithFormality[Math.floor(Math.random() * formsWithFormality.length)];
		conjugationForm = selected.form;
		conjugationFormality = selected.formality;
		
		const conjugations = conjugateVerb(currentVerb);
		const selectedConjugation = conjugations.find(c => c.label.includes(selected.form));
		const correctConjugation = selectedConjugation?.kana || currentVerb.kana;
		
		// Guardar la traducción de la forma seleccionada
		conjugationTranslation = selectedConjugation?.translation || currentVerb['meaning-es'];
		
		// Generar opciones incorrectas usando OTRAS CONJUGACIONES DEL MISMO VERBO
		// Esto hace el ejercicio más desafiante
		const otherForms = formsWithFormality.filter(f => f.form !== selected.form);
		const wrongAnswers: string[] = [];
		
		for (const formObj of otherForms) {
			const conj = conjugations.find(c => c.label.includes(formObj.form));
			if (conj && conj.kana !== correctConjugation && !wrongAnswers.includes(conj.kana)) {
				wrongAnswers.push(conj.kana);
			}
			if (wrongAnswers.length >= 3) break;
		}
		
		options = shuffleArray([correctConjugation, ...wrongAnswers]);
	}

	// Auto-reproducir ejemplo cuando se voltea la tarjeta en flashcards
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

	// Auto-reproducir audio en modo listening al cargar nueva pregunta
	$effect(() => {
		if (currentMode === 'listening' && currentVerb && !autoPlayedExample) {
			setTimeout(() => {
				speak(currentVerb!.kanji || currentVerb!.kana);
				autoPlayedExample = true;
			}, 500);
		}
	});

	function handleFlashcardAnswer(knew: boolean) {
		if (!currentVerb) return;
		
		// Guardar mastery score previo
		const previousMastery = $userProfile.studiedVerbs[currentVerb.kanji]?.masteryScore ?? 0;
		
		if (knew) {
			correctCount++;
			userProfile.addXP(5);
		}
		
		userProfile.recordPractice(currentVerb.kanji, knew);
		
		// Guardar resultado
		const newMastery = $userProfile.studiedVerbs[currentVerb.kanji]?.masteryScore ?? 0;
		sessionResults.push({
			verb: currentVerb,
			correct: knew,
			previousMastery,
			newMastery
		});
		
		currentIndex++;
		loadNextQuestion();
	}

	function handleMultipleChoiceAnswer(answer: string) {
		if (!currentVerb || selectedAnswer) return;
		
		selectedAnswer = answer;
		const correct = answer === currentVerb['meaning-es'];
		
		// Guardar mastery score previo
		const previousMastery = $userProfile.studiedVerbs[currentVerb.kanji]?.masteryScore ?? 0;
		
		if (correct) {
			correctCount++;
			userProfile.addXP(10);
			userProfile.recordPractice(currentVerb.kanji, true);
			
			// Guardar resultado
			const newMastery = $userProfile.studiedVerbs[currentVerb.kanji]?.masteryScore ?? 0;
			sessionResults.push({
				verb: currentVerb,
				correct: true,
				previousMastery,
				newMastery
			});
			
			// Mostrar botón verde por 1 segundo antes de pasar al siguiente
			setTimeout(() => {
				currentIndex++;
				loadNextQuestion();
			}, 1000);
		} else {
			feedback = `Incorrecto. La respuesta correcta es: ${currentVerb['meaning-es']}`;
			showErrorOverlay = true;
			
			userProfile.recordPractice(currentVerb.kanji, false);
			
			// Guardar resultado
			const newMastery = $userProfile.studiedVerbs[currentVerb.kanji]?.masteryScore ?? 0;
			sessionResults.push({
				verb: currentVerb,
				correct: false,
				previousMastery,
				newMastery
			});
			// El overlay se cerrará al tocar en cualquier parte
		}
	}

	function handleConjugationQuizAnswer(answer: string) {
		if (!currentVerb || selectedAnswer) return;
		
		selectedAnswer = answer;
		const conjugations = conjugateVerb(currentVerb);
		const correctAnswer = conjugations.find(c => c.label.includes(conjugationForm))?.kana || currentVerb.kana;
		const correct = answer === correctAnswer;
		
		// Guardar mastery score previo
		const previousMastery = $userProfile.studiedVerbs[currentVerb.kanji]?.masteryScore ?? 0;
		
		if (correct) {
			correctCount++;
			userProfile.addXP(15);
			userProfile.recordPractice(currentVerb.kanji, true);
			
			// Guardar resultado
			const newMastery = $userProfile.studiedVerbs[currentVerb.kanji]?.masteryScore ?? 0;
			sessionResults.push({
				verb: currentVerb,
				correct: true,
				previousMastery,
				newMastery
			});
			
			// Mostrar botón verde por 1 segundo antes de pasar al siguiente
			setTimeout(() => {
				currentIndex++;
				loadNextQuestion();
			}, 1000);
		} else {
			feedback = `Incorrecto. La respuesta correcta es: ${correctAnswer}`;
			showErrorOverlay = true;
			
			userProfile.recordPractice(currentVerb.kanji, false);
			
			// Guardar resultado
			const newMastery = $userProfile.studiedVerbs[currentVerb.kanji]?.masteryScore ?? 0;
			sessionResults.push({
				verb: currentVerb,
				correct: false,
				previousMastery,
				newMastery
			});
			// El overlay se cerrará al tocar en cualquier parte
		}
	}

	function handleListeningPlay() {
		if (!currentVerb) return;
		speak(currentVerb.kanji || currentVerb.kana);
	}

	function handleConjugationAnswer(knew: boolean) {
		if (!currentVerb) return;
		
		// Guardar mastery score previo
		const previousMastery = $userProfile.studiedVerbs[currentVerb.kanji]?.masteryScore ?? 0;
		
		if (knew) {
			correctCount++;
			userProfile.addXP(15);
		}
		
		userProfile.recordPractice(currentVerb.kanji, knew);
		
		// Guardar resultado
		const newMastery = $userProfile.studiedVerbs[currentVerb.kanji]?.masteryScore ?? 0;
		sessionResults.push({
			verb: currentVerb,
			correct: knew,
			previousMastery,
			newMastery
		});
		
		currentIndex++;
		loadNextQuestion();
	}

	function finishGame() {
		const accuracy = Math.round((correctCount / questionCount) * 100);
		
		// Check for achievements
		if (questionCount >= 10 && accuracy === 100) {
			userProfile.addAchievement('perfect_game');
		}
		
		// Ir a la pantalla de resultados
		currentMode = 'results';
	}
	
	function retryGame() {
		startGame(completedGameMode);
	}

	function exitGame() {
		if (confirm('¿Seguro que quieres salir? Se perderá el progreso actual.')) {
			currentMode = 'menu';
		}
	}
</script>

<svelte:head>
	<title>Práctica · JapaVerbs</title>
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
				<p class="text-slate-400">Elige cuántas preguntas y un modo de juego</p>
			</div>

			<!-- Questions Selector -->
			<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
				<h2 class="text-base font-semibold text-white mb-3">Cantidad de preguntas</h2>
				<div class="grid grid-cols-4 gap-2">
					{#each [10, 20, 30, 40] as amount}
						<button
							onclick={() => questionsPerSession = amount}
							class="rounded-xl border-2 p-3 text-center font-semibold transition-all active:scale-95 {
								questionsPerSession === amount
									? 'border-indigo-500 bg-indigo-500/20 text-white'
									: 'border-slate-800 bg-slate-900 text-slate-400'
							}"
						>
							<div class="text-2xl font-bold">{amount}</div>
						</button>
					{/each}
				</div>
			</div>

			<div class="grid gap-4">
				{#each games as game}
					<button
						onclick={() => startGame(game.id as GameMode)}
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
								{currentVerb['meaning-es']}
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
							class="rounded-2xl border-2 border-red-500/50 bg-red-500/10 px-6 py-3 text-lg font-semibold text-red-400 transition-all active:scale-95"
						>
							❌ No sabía
						</button>
						<button
							onclick={() => handleFlashcardAnswer(true)}
							class="rounded-2xl border-2 border-green-500/50 bg-green-500/10 px-6 py-3 text-lg font-semibold text-green-400 transition-all active:scale-95"
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
							class="rounded-2xl border-2 p-3 text-lg font-medium transition-all active:scale-95 {
								selectedAnswer === null
								? 'border-slate-800 bg-slate-900/70 text-white hover:border-indigo-500'
								: selectedAnswer === option
									? option === currentVerb['meaning-es']
										? 'border-green-500 bg-green-500/20 text-green-400'
										: 'border-red-500 bg-red-500/20 text-red-400'
									: option === currentVerb['meaning-es']
										? 'border-green-500 bg-green-500/20 text-green-400'
										: 'border-slate-800 bg-slate-900/50 text-slate-500'
							}"
						>
							{option}
						</button>
					{/each}
				</div>
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
							class="rounded-2xl border-2 p-3 text-lg font-medium transition-all active:scale-95 {
								selectedAnswer === null
									? 'border-slate-800 bg-slate-900/70 text-white hover:border-orange-500'
									: selectedAnswer === option
										? option === currentVerb['meaning-es']
											? 'border-green-500 bg-green-500/20 text-green-400'
											: 'border-red-500 bg-red-500/20 text-red-400'
										: option === currentVerb['meaning-es']
											? 'border-green-500 bg-green-500/20 text-green-400'
											: 'border-slate-800 bg-slate-900/50 text-slate-500'
							}"
						>
							{option}
						</button>
					{/each}
				</div>
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
					<div class="text-lg text-indigo-400 mb-2">{currentVerb['meaning-es']}, {conjugationTranslation}</div>
					<div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/50 mb-4">
						<span class="text-sm font-medium text-purple-300">
							{conjugationFormality === 'formal' ? 'Formal' : 'Informal'}
						</span>
					</div>
					<button
						onclick={() => speak(currentVerb!.kanji || currentVerb!.kana)}
						class="mt-2 p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-xl"
					>
						🔊
					</button>
				</div>

				<!-- Options -->
				{@const conjugations = conjugateVerb(currentVerb)}
				<div class="grid gap-3">
					{#each options as option}
						<button
							onclick={() => handleConjugationQuizAnswer(option)}
							disabled={selectedAnswer !== null}
							class="rounded-2xl border-2 p-4 transition-all active:scale-95 {
								selectedAnswer === null
									? 'border-slate-800 bg-slate-900/70 text-white hover:border-indigo-500'
									: selectedAnswer === option
										? (() => {
											const correctAnswer = conjugations.find(c => c.label.includes(conjugationForm))?.kana || currentVerb.kana;
											return option === correctAnswer
												? 'border-green-500 bg-green-500/20 text-green-400'
												: 'border-red-500 bg-red-500/20 text-red-400';
										})()
										: (() => {
											const correctAnswer = conjugations.find(c => c.label.includes(conjugationForm))?.kana || currentVerb.kana;
											return option === correctAnswer
												? 'border-green-500 bg-green-500/20 text-green-400'
												: 'border-slate-800 bg-slate-900/50 text-slate-500';
										})()
							}"
						>
							<div class="text-2xl font-medium">{option}</div>
						</button>
					{/each}
				</div>
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
					<div class="text-lg text-indigo-400 mb-2">{currentVerb['meaning-es']}</div>
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
					{@const conjugations = conjugateVerb(currentVerb)}
					<div class="space-y-3">
						<div class="grid gap-2">
							{#each conjugations.slice(1) as form}
								{@const colors = getFormColor(form.key)}
								<div class="rounded-xl border {colors.border} {colors.bg} p-4">
									<div class="flex items-start justify-between mb-2">
										<div class="flex-1">
											<p class="text-xs font-semibold uppercase tracking-wide {colors.text} mb-1">{colors.label}</p>
											<p class="text-xl font-medium text-white mb-1">{form.kana}</p>
											<p class="text-sm text-emerald-400">→ {form.translation}</p>
										</div>
										<button
											onclick={() => speak(form.kana)}
											class="p-2 rounded-lg hover:bg-slate-800 transition-colors text-base flex-shrink-0"
											aria-label="Reproducir"
										>
											🔊
										</button>
									</div>
									<p class="text-xs text-slate-500 mt-2">{form.description}</p>
								</div>
							{/each}
						</div>

						<div class="grid grid-cols-2 gap-3 pt-4">
							<button
								onclick={() => handleConjugationAnswer(false)}
								class="rounded-2xl border-2 border-red-500/50 bg-red-500/10 px-6 py-3 text-lg font-semibold text-red-400 transition-all active:scale-95"
							>
								❌ No sabía
							</button>
							<button
								onclick={() => handleConjugationAnswer(true)}
								class="rounded-2xl border-2 border-green-500/50 bg-green-500/10 px-6 py-3 text-lg font-semibold text-green-400 transition-all active:scale-95"
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

	{:else if currentMode === 'results'}
		<!-- Results Screen -->
		<section class="space-y-6">
			<!-- Header con estadísticas generales -->
			<div class="text-center">
				<div class="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 text-4xl mb-4">
					🎉
				</div>
				<h1 class="text-3xl font-bold text-white mb-2">¡Sesión completada!</h1>
				<p class="text-slate-400 mb-4">
					{games.find(g => g.id === completedGameMode)?.title || 'Práctica'}
				</p>
			</div>

			<!-- Botones de acción -->
			<div class="grid grid-cols-2 gap-3">
				<button
					onclick={() => currentMode = 'menu'}
					class="rounded-2xl border-2 border-slate-800 bg-slate-900 px-6 py-3 font-semibold text-white hover:border-indigo-500 transition-colors"
				>
					← Menú
				</button>
				<button
					onclick={retryGame}
					class="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 font-semibold text-white hover:shadow-lg hover:shadow-indigo-500/50 transition-all"
				>
					🔄 Reintentar
				</button>
			</div>

			<!-- Estadísticas principales -->
			<div class="grid grid-cols-2 gap-3">
				<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-center">
					<div class="text-3xl font-bold text-white mb-1">{correctCount}/{questionCount}</div>
					<p class="text-xs text-slate-400 uppercase tracking-wide">Correctas</p>
				</div>
				<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-center">
					<div class="text-3xl font-bold text-indigo-400 mb-1">
						{Math.round((correctCount / questionCount) * 100)}%
					</div>
					<p class="text-xs text-slate-400 uppercase tracking-wide">Precisión</p>
				</div>
			</div>

			<!-- Resumen por verbo -->
			<div>
				<h2 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
					<span>📊</span>
					<span>Detalle por verbo</span>
				</h2>
				<div class="space-y-2">
					{#each sessionResults as result}
						<div class="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
							<div class="flex items-start justify-between gap-3 mb-3">
								<div class="flex-1">
									<div class="flex items-center gap-2 mb-1">
										<span class="text-xl font-bold text-white">{result.verb.kanji}</span>
										<span class="text-base text-slate-400">{result.verb.kana}</span>
										{#if result.correct}
											<span class="text-green-400 text-xl">✓</span>
										{:else}
											<span class="text-red-400 text-xl">✗</span>
										{/if}
									</div>
									<p class="text-sm text-indigo-300">{result.verb['meaning-es']}</p>
								</div>
								<button
									onclick={() => speak(result.verb.kanji || result.verb.kana)}
									class="p-2 rounded-lg hover:bg-slate-800 transition-colors text-lg flex-shrink-0"
									aria-label="Reproducir"
								>
									🔊
								</button>
							</div>
							
							<!-- Progreso de mastery -->
							<div class="flex items-center gap-3">
								<div class="flex-1">
									<div class="flex items-center justify-between text-xs text-slate-400 mb-1">
										<span>Progreso</span>
										<span class="{result.correct ? 'text-green-400' : 'text-red-400'}">
											{result.previousMastery > result.newMastery ? '↓' : result.previousMastery < result.newMastery ? '↑' : '→'}
											{result.newMastery > 0 ? '+' : ''}{result.newMastery}
										</span>
									</div>
									<div class="h-2 bg-slate-800 rounded-full overflow-hidden">
										<div 
											class="h-full transition-all duration-500 {
												result.newMastery <= -3 ? 'bg-red-500' :
												result.newMastery <= -1 ? 'bg-orange-500' :
												result.newMastery === 0 ? 'bg-slate-500' :
												result.newMastery <= 2 ? 'bg-yellow-500' :
												result.newMastery <= 4 ? 'bg-blue-500' :
												'bg-green-500'
											}"
											style="width: {((result.newMastery + 5) / 10) * 100}%"
										></div>
									</div>
								</div>
								<div class="text-xs font-medium px-2 py-1 rounded {
									result.newMastery <= -3 ? 'bg-red-500/20 text-red-400' :
									result.newMastery <= -1 ? 'bg-orange-500/20 text-orange-400' :
									result.newMastery === 0 ? 'bg-slate-500/20 text-slate-400' :
									result.newMastery <= 2 ? 'bg-yellow-500/20 text-yellow-400' :
									result.newMastery <= 4 ? 'bg-blue-500/20 text-blue-400' :
									'bg-green-500/20 text-green-400'
								}">
									{Math.round(((result.newMastery + 5) / 10) * 100)}%
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}
</div>

<!-- Error Overlay -->
{#if showErrorOverlay}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 cursor-pointer"
		onclick={() => {
			showErrorOverlay = false;
			currentIndex++;
			loadNextQuestion();
		}}
		role="button"
		tabindex="0"
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				showErrorOverlay = false;
				currentIndex++;
				loadNextQuestion();
			}
		}}
	>
		<div class="rounded-3xl border-2 border-red-500 bg-slate-900/95 backdrop-blur-md p-8 text-center shadow-2xl shadow-red-500/50 max-w-md mx-4">
			<div class="text-5xl mb-4">❌</div>
			<p class="text-xl font-bold text-red-400 mb-2">Incorrecto</p>
			<p class="text-lg font-medium text-white mb-4">{feedback}</p>
			<p class="text-sm text-slate-400">Toca para continuar</p>
		</div>
	</div>
{/if}

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
