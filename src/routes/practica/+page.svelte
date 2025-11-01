<script lang="ts">
	import { userProfile } from '$lib/stores/userProgress';
	import { speak } from '$lib/utils/tts';
	import { conjugateVerb } from '$lib/utils/conjugation';
	import type { Verb } from '$lib/types/verb';
	import verbs from '$lib/data/verbs';

	type GameMode = 'menu' | 'config' | 'flashcards' | 'multiple-choice' | 'conjugation' | 'listening' | 'conjugation-quiz' | 'inverse-conjugation-quiz' | 'verb-type-quiz' | 'results';

	interface VerbResult {
		verb: Verb;
		correct: boolean;
		previousMastery: number;
		newMastery: number;
	}

	interface VerbStats {
		verb: Verb;
		correctCount: number;
		incorrectCount: number;
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
	let autoReadTriggered = $state(false);
	let sessionResults = $state<VerbResult[]>([]);
	let completedGameMode = $state<GameMode>('flashcards');
	let autoReadVerbs = $state(false);
	let showTimer = $state(false);
	let timerSeconds = $state(0);
	let timerInterval: ReturnType<typeof setInterval> | null = null;
	let currentConjugations = $state<any[]>([]);

	// Reactive derived value for verb statistics
	const verbStats = $derived(() => getVerbStats());

	// Reactive derived value for current session errors
	const currentSessionErrors = $derived(() => sessionResults.filter(r => !r.correct).map(r => r.verb.kanji));

	// Helper function to aggregate verb statistics
	function getVerbStats(): VerbStats[] {
		const statsMap = new Map<string, VerbStats>();
		
		// Only process verbs from current session
		for (const result of sessionResults) {
			const verbKey = result.verb.kanji;
			
			// Get historical data from userProfile if exists
			const historicalData = $userProfile.studiedVerbs[verbKey];
			const historicalCorrect = historicalData?.correctCount || 0;
			const historicalIncorrect = historicalData?.incorrectCount || 0;
			
			// Create stats with historical data
			statsMap.set(verbKey, {
				verb: result.verb,
				correctCount: historicalCorrect,
				incorrectCount: historicalIncorrect,
				previousMastery: result.previousMastery,
				newMastery: result.newMastery
			});
		}
		
		return Array.from(statsMap.values());
	}

	// Función para obtener colores según el tipo de forma (actualizado JLPT N5)
	function getFormColor(key: string) {
		switch(key) {
			// Diccionario (gris)
			case 'dictionary': return { bg: 'bg-slate-500/10', border: 'border-slate-500/40', text: 'text-slate-200', label: 'Diccionario' };
			
			// Formales (azul)
			case 'masuPresent': 
			case 'masuPresentNegative': 
			case 'masuPast': 
			case 'masuPastNegative': 
			case 'invitation': 
			case 'desireFormal': 
			case 'permission': 
			case 'prohibition': 
			case 'progressiveFormal': 
				return { bg: 'bg-blue-500/10', border: 'border-blue-500/40', text: 'text-blue-200', label: 'Formal' };
			
			// Pasado (naranja)
			case 'plainPast': 
			case 'plainPastNegative': 
				return { bg: 'bg-orange-500/10', border: 'border-orange-500/40', text: 'text-orange-200', label: 'Pasado' };
			
			// Versátil (púrpura)
			case 'request': 
			case 'progressiveInformal': 
				return { bg: 'bg-purple-500/10', border: 'border-purple-500/40', text: 'text-purple-200', label: 'Versátil' };
			
			// Negativa (rojo)
			case 'plainNegative': 
			case 'negativeRequest': 
				return { bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-200', label: 'Negativa' };
			
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
			description: 'Aprende las 18 formas JLPT N5 (formales e informales)',
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
			description: 'Elige la forma JLPT N5 correcta',
			icon: '🎯',
			color: 'from-indigo-500 to-purple-500',
			difficulty: 'Difícil',
			order: 5
		},
		{
			id: 'inverse-conjugation-quiz',
			title: 'Quiz de conjugación inversa',
			description: 'Identifica el significado de la forma JLPT N5',
			icon: '🔄',
			color: 'from-purple-500 to-pink-500',
			difficulty: 'Difícil',
			order: 6
		},
		{
			id: 'verb-type-quiz',
			title: 'Quiz de tipos de verbos',
			description: 'Identifica si el verbo es Godan, Ichidan o Irregular',
			icon: '🏷️',
			color: 'from-amber-500 to-orange-500',
			difficulty: 'Medio',
			order: 7
		}
	].sort((a, b) => a.order - b.order);

	$effect(() => {
		const settings = $userProfile.practiceSettings;
		if (!settings) return;

		if (settings.questionsPerSession !== questionsPerSession) {
			questionsPerSession = settings.questionsPerSession;
		}

		if (settings.autoReadVerbs !== autoReadVerbs) {
			autoReadVerbs = settings.autoReadVerbs;
		}

		if (settings.showTimer !== showTimer) {
			showTimer = settings.showTimer;
		}
	});

	function updateQuestionsPerSession(amount: number) {
		if (questionsPerSession === amount) return;
		questionsPerSession = amount;
		userProfile.updatePracticeSettings({ questionsPerSession: amount });
	}

	function updateAutoReadPreference(enabled: boolean) {
		if (autoReadVerbs === enabled) return;
		autoReadVerbs = enabled;
		userProfile.updatePracticeSettings({ autoReadVerbs: enabled });
	}

	function updateTimerPreference(enabled: boolean) {
		if (showTimer === enabled) return;
		showTimer = enabled;
		userProfile.updatePracticeSettings({ showTimer: enabled });
	}

	function startTimer() {
		if (!showTimer || timerInterval) return;
		timerSeconds = 0;
		timerInterval = setInterval(() => {
			timerSeconds++;
		}, 1000);
	}

	function stopTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	function startGame(mode: GameMode) {
		currentMode = mode;
		completedGameMode = mode;
		sessionResults = []; // Reiniciar resultados de la sesión
		
		// Iniciar timer si está habilitado
		startTimer();
		
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
		autoReadTriggered = false;
		questionCount++;
		
		// Update conjugations when verb changes
		if (currentVerb) {
			currentConjugations = conjugateVerb(currentVerb);
		}

		if (currentMode === 'multiple-choice' || currentMode === 'listening') {
			generateOptions();
		} else if (currentMode === 'conjugation-quiz') {
			generateConjugationQuiz();
		} else if (currentMode === 'inverse-conjugation-quiz') {
			generateInverseConjugationQuiz();
		} else if (currentMode === 'verb-type-quiz') {
			generateVerbTypeQuiz();
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
		
		// Formas JLPT N5 con información de formalidad
		const formsWithFormality = [
			// Formales (ます形)
			{ key: 'masuPresent', formality: 'formal', label: 'Presente formal' },
			{ key: 'masuPresentNegative', formality: 'formal', label: 'Presente negativo formal' },
			{ key: 'masuPast', formality: 'formal', label: 'Pasado formal' },
			{ key: 'masuPastNegative', formality: 'formal', label: 'Pasado negativo formal' },
			{ key: 'invitation', formality: 'formal', label: 'Invitación formal' },
			{ key: 'desireFormal', formality: 'formal', label: 'Deseo formal' },
			{ key: 'permission', formality: 'formal', label: 'Permiso' },
			{ key: 'prohibition', formality: 'formal', label: 'Prohibición' },
			{ key: 'progressiveFormal', formality: 'formal', label: 'Progresivo formal' },
			
			// Informales (普通形)
			{ key: 'dictionary', formality: 'informal', label: 'Diccionario' },
			{ key: 'plainNegative', formality: 'informal', label: 'Negativo informal' },
			{ key: 'plainPast', formality: 'informal', label: 'Pasado informal' },
			{ key: 'plainPastNegative', formality: 'informal', label: 'Pasado negativo informal' },
			{ key: 'desireInformal', formality: 'informal', label: 'Deseo informal' },
			{ key: 'invitationInformal', formality: 'informal', label: 'Invitación informal' },
			{ key: 'request', formality: 'informal', label: 'Petición' },
			{ key: 'negativeRequest', formality: 'informal', label: 'Negación de acción' },
			{ key: 'progressiveInformal', formality: 'informal', label: 'Progresivo informal' }
		];
		
		const selected = formsWithFormality[Math.floor(Math.random() * formsWithFormality.length)];
		conjugationForm = selected.label;
		conjugationFormality = selected.formality;
		
		const selectedConjugation = currentConjugations.find(c => c.key === selected.key);
		const correctConjugation = selectedConjugation?.kana || currentVerb.kana;
		
		// Guardar la traducción de la forma seleccionada
		conjugationTranslation = selectedConjugation?.translation || currentVerb['meaning-es'];
		
		// Generar opciones incorrectas usando OTRAS CONJUGACIONES DEL MISMO VERBO
		const otherForms = formsWithFormality.filter(f => f.key !== selected.key);
		const wrongAnswers: string[] = [];
		
		for (const formObj of otherForms) {
			const conj = currentConjugations.find(c => c.key === formObj.key);
			if (conj && conj.kana !== correctConjugation && !wrongAnswers.includes(conj.kana)) {
				wrongAnswers.push(conj.kana);
			}
			if (wrongAnswers.length >= 3) break;
		}
		
		options = shuffleArray([correctConjugation, ...wrongAnswers]);
	}

	function generateInverseConjugationQuiz() {
		if (!currentVerb) return;
		
		// Formas JLPT N5 con información de formalidad
		const formsWithFormality = [
			// Formales (ます形)
			{ key: 'masuPresent', formality: 'formal', label: 'Presente formal' },
			{ key: 'masuPresentNegative', formality: 'formal', label: 'Presente negativo formal' },
			{ key: 'masuPast', formality: 'formal', label: 'Pasado formal' },
			{ key: 'masuPastNegative', formality: 'formal', label: 'Pasado negativo formal' },
			{ key: 'invitation', formality: 'formal', label: 'Invitación formal' },
			{ key: 'desireFormal', formality: 'formal', label: 'Deseo formal' },
			{ key: 'permission', formality: 'formal', label: 'Permiso' },
			{ key: 'prohibition', formality: 'formal', label: 'Prohibición' },
			{ key: 'progressiveFormal', formality: 'formal', label: 'Progresivo formal' },
			
			// Informales (普通形)
			{ key: 'dictionary', formality: 'informal', label: 'Diccionario' },
			{ key: 'plainNegative', formality: 'informal', label: 'Negativo informal' },
			{ key: 'plainPast', formality: 'informal', label: 'Pasado informal' },
			{ key: 'plainPastNegative', formality: 'informal', label: 'Pasado negativo informal' },
			{ key: 'desireInformal', formality: 'informal', label: 'Deseo informal' },
			{ key: 'invitationInformal', formality: 'informal', label: 'Invitación informal' },
			{ key: 'request', formality: 'informal', label: 'Petición' },
			{ key: 'negativeRequest', formality: 'informal', label: 'Negación de acción' },
			{ key: 'progressiveInformal', formality: 'informal', label: 'Progresivo informal' }
		];
		
		const selected = formsWithFormality[Math.floor(Math.random() * formsWithFormality.length)];
		conjugationForm = selected.label;
		conjugationFormality = selected.formality;
		
		const selectedConjugation = currentConjugations.find(c => c.key === selected.key);
		const correctConjugation = selectedConjugation?.kana || currentVerb.kana;
		
		// Guardar la traducción de la forma seleccionada (esta será la respuesta correcta)
		conjugationTranslation = selectedConjugation?.translation || currentVerb['meaning-es'];
		
		// Generar opciones incorrectas usando traducciones de OTRAS CONJUGACIONES DEL MISMO VERBO
		const otherForms = formsWithFormality.filter(f => f.key !== selected.key);
		const wrongAnswers: string[] = [];
		
		for (const formObj of otherForms) {
			const conj = currentConjugations.find(c => c.key === formObj.key);
			if (conj && conj.translation !== conjugationTranslation && !wrongAnswers.includes(conj.translation)) {
				wrongAnswers.push(conj.translation);
			}
			if (wrongAnswers.length >= 3) break;
		}
		
		// Si no hay suficientes opciones incorrectas del mismo verbo, agregar de otros verbos
		if (wrongAnswers.length < 3) {
			const otherVerbs = verbs.filter(v => v.kanji !== currentVerb!.kanji);
			for (const verb of otherVerbs) {
				if (wrongAnswers.length >= 3) break;
				const otherConjugations = conjugateVerb(verb);
				for (const conj of otherConjugations) {
					if (conj.translation !== conjugationTranslation && !wrongAnswers.includes(conj.translation)) {
						wrongAnswers.push(conj.translation);
						if (wrongAnswers.length >= 3) break;
					}
				}
			}
		}
		
		options = shuffleArray([conjugationTranslation, ...wrongAnswers]);
	}

	function generateVerbTypeQuiz() {
		if (!currentVerb) return;
		
		// Obtener el tipo correcto del verbo actual
		const correctType = currentVerb.type;
		
		// Generar opciones incorrectas usando otros tipos de verbos
		const allTypes = ['godan', 'ichidan', 'irregular'];
		const wrongTypes = allTypes.filter(type => type !== correctType);
		
		// Crear las opciones con nombres en español
		const typeNames: { [key: string]: string } = {
			'godan': 'Godan (Grupo 1)',
			'ichidan': 'Ichidan (Grupo 2)',
			'irregular': 'Irregular (Grupo 3)'
		};
		
		const correctAnswer = typeNames[correctType];
		const wrongAnswers = wrongTypes.map(type => typeNames[type]);
		
		options = shuffleArray([correctAnswer, ...wrongAnswers]);
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
			
			// Auto-leer verbo si está habilitado (además del ejemplo)
			if (autoReadVerbs) {
				setTimeout(() => {
					speak(currentVerb!.kanji || currentVerb!.kana);
				}, 1200);
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

	// Auto-leer verbos cuando está habilitado
	$effect(() => {
		if (!autoReadVerbs || !currentVerb || currentMode === 'listening' || autoReadTriggered) {
			return;
		}

		const timer = setTimeout(() => {
			let textToSpeak: string | undefined;

			if (currentMode === 'inverse-conjugation-quiz') {
				const selectedConjugation = currentConjugations.find((c) => c.label === conjugationForm);
				textToSpeak = selectedConjugation?.kana || currentVerb!.kana;
			} else {
				textToSpeak = currentVerb!.kanji || currentVerb!.kana;
			}

			if (textToSpeak) {
				speak(textToSpeak);
				autoReadTriggered = true;
			}
		}, 800);

		return () => clearTimeout(timer);
	});

	// Auto-leer verbo en modo conjugación cuando se muestran las conjugaciones
	$effect(() => {
		if (autoReadVerbs && showAnswer && currentVerb && currentMode === 'conjugation' && !autoPlayedExample) {
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
			
			// Auto-leer verbo si está habilitado
			if (autoReadVerbs) {
				setTimeout(() => {
					speak(currentVerb!.kanji || currentVerb!.kana);
				}, 300);
			}
			
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
		const correctAnswer = currentConjugations.find(c => c.label === conjugationForm)?.kana || currentVerb.kana;
		const correct = answer === correctAnswer;
		
		// Guardar mastery score previo
		const previousMastery = $userProfile.studiedVerbs[currentVerb.kanji]?.masteryScore ?? 0;
		
		// Leer la respuesta correcta siempre que está habilitada la auto-lectura
		if (autoReadVerbs) {
			setTimeout(() => {
				speak(correctAnswer);
			}, 300);
		}
		
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

	function handleInverseConjugationQuizAnswer(answer: string) {
		if (!currentVerb || selectedAnswer) return;
		
		selectedAnswer = answer;
		const selectedConjugation = currentConjugations.find(c => c.label === conjugationForm);
		const correctAnswer = selectedConjugation?.translation || currentVerb['meaning-es'];
		const correct = answer === correctAnswer;
		
		// Guardar mastery score previo
		const previousMastery = $userProfile.studiedVerbs[currentVerb.kanji]?.masteryScore ?? 0;
		
		// Leer la forma conjugada en japonés siempre que está habilitada la auto-lectura
		if (autoReadVerbs) {
			setTimeout(() => {
				speak(selectedConjugation?.kana || currentVerb!.kana);
			}, 300);
		}
		
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

	function handleVerbTypeQuizAnswer(answer: string) {
		if (!currentVerb || selectedAnswer) return;
		
		selectedAnswer = answer;
		
		// Obtener el tipo correcto del verbo actual
		const typeNames: { [key: string]: string } = {
			'godan': 'Godan (Grupo 1)',
			'ichidan': 'Ichidan (Grupo 2)',
			'irregular': 'Irregular (Grupo 3)'
		};
		
		// Explicaciones para cada tipo de verbo
		const typeExplanations: { [key: string]: string } = {
			'godan': 'Los verbos Godan (Grupo 1) terminan en -u, -ku, -gu, -su, -tsu, -nu, -bu, -mu, -ru. Cambian la vocal final al conjugar.',
			'ichidan': 'Los verbos Ichidan (Grupo 2) siempre terminan en -ru. Simplemente se quita el -ru para conjugar.',
			'irregular': 'Solo hay 2 verbos irregulares: する (hacer) y 来る (venir). Deben memorizarse.'
		};
		
		const correctAnswer = typeNames[currentVerb.type];
		const correctExplanation = typeExplanations[currentVerb.type];
		const correct = answer === correctAnswer;
		
		// Guardar mastery score previo
		const previousMastery = $userProfile.studiedVerbs[currentVerb.kanji]?.masteryScore ?? 0;
		
		// Leer la respuesta correcta siempre que está habilitada la auto-lectura
		if (autoReadVerbs) {
			setTimeout(() => {
				speak(currentVerb.kanji || currentVerb.kana);
			}, 300);
		}
		
		if (correct) {
			correctCount++;
			feedback = '¡Correcto!';
			userProfile.recordPractice(currentVerb.kanji, true);
			
			// Guardar resultado
			const newMastery = $userProfile.studiedVerbs[currentVerb.kanji]?.masteryScore ?? 0;
			sessionResults.push({
				verb: currentVerb,
				correct: true,
				previousMastery,
				newMastery
			});
			
			// Avanzar a la siguiente pregunta después de un breve retraso
			setTimeout(() => {
				currentIndex++;
				loadNextQuestion();
			}, 1000);
		} else {
			feedback = `Incorrecto. La respuesta correcta es: ${correctAnswer}\n\n${correctExplanation}`;
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
			
			// Auto-leer verbo si está habilitado
			if (autoReadVerbs) {
				setTimeout(() => {
					speak(currentVerb!.kanji || currentVerb!.kana);
				}, 300);
			}
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
		// Detener timer
		stopTimer();
		
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
		// Detener timer
		stopTimer();
		
		// Resetear estados de audio para evitar reproducción después de salir
		autoPlayedExample = true;
		autoReadTriggered = true;
		
		if (confirm('¿Seguro que quieres salir? Se perderá el progreso actual.')) {
			currentMode = 'menu';
		} else {
			// Si no sale, restaurar los estados de audio
			autoPlayedExample = false;
			autoReadTriggered = false;
		}
	}
</script>

<svelte:head>
	<title>Práctica · JapaVerbs</title>
</svelte:head>

<div class="pb-6">
	{#if currentMode === 'menu'}
		<section class="space-y-8">
			<header class="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 md:px-10 sm:px-4">
				<div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
					<div class="flex items-center gap-4">
						<div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-3xl">
							🎮
						</div>
						<div>
							<p class="text-xs uppercase tracking-[0.25em] text-indigo-200">Centro de práctica</p>
							<h1 class="mt-1 text-3xl font-bold text-white">Diseña tu sesión perfecta</h1>
							<p class="mt-1 text-sm text-slate-300 max-w-xl">
								Combina cantidad de preguntas y modos de juego para reforzar conjugaciones, significado y audio según tus objetivos del día.
							</p>
						</div>
					</div>
				</div>
			</header>

			<div class="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 sm:px-4 sm:py-4">
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
			</div>

			<div class="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8">
				<h2 class="text-base font-semibold text-white mb-4">Opciones de la sesión</h2>
				<div class="space-y-5">
					<div>
						<p class="text-sm uppercase tracking-[0.2em] text-slate-400 mb-2">Cantidad de preguntas</p>
						<div class="grid grid-cols-4 gap-2">
							{#each [10, 20, 30, 40] as amount}
								<button
									onclick={() => updateQuestionsPerSession(amount)}
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

					<div>
						<p class="text-sm uppercase tracking-[0.2em] text-slate-400 mb-2">Audio</p>
						<label class="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-800 bg-slate-900/70 cursor-pointer hover:border-indigo-500 transition-colors">
							<input
								type="checkbox"
								checked={autoReadVerbs}
								onchange={(event) => updateAutoReadPreference((event.target as HTMLInputElement).checked)}
								class="w-5 h-5 rounded border-2 border-slate-600 bg-slate-800 text-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 focus:ring-offset-slate-900"
							/>
							<div class="flex-1">
								<p class="text-white font-medium">Lectura automática de verbos</p>
								<p class="text-sm text-slate-400">Reproduce automáticamente el audio de los verbos durante la práctica</p>
							</div>
							<span class="text-2xl">🔊</span>
						</label>
					</div>

					<div>
						<p class="text-sm uppercase tracking-[0.2em] text-slate-400 mb-2">Visualización</p>
						<label class="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-800 bg-slate-900/70 cursor-pointer hover:border-indigo-500 transition-colors">
							<input
								type="checkbox"
								checked={showTimer}
								onchange={(event) => updateTimerPreference((event.target as HTMLInputElement).checked)}
								class="w-5 h-5 rounded border-2 border-slate-600 bg-slate-800 text-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 focus:ring-offset-slate-900"
							/>
							<div class="flex-1">
								<p class="text-white font-medium">Mostrar temporizador</p>
								<p class="text-sm text-slate-400">Muestra el tiempo transcurrido durante la sesión de práctica</p>
							</div>
							<span class="text-2xl">⏱️</span>
						</label>
					</div>
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
				<div class="flex items-center gap-4">
					{#if showTimer}
						<div class="text-sm text-slate-400 font-mono">
							⏱️ {formatTime(timerSeconds)}
						</div>
					{/if}
					<div class="text-sm text-slate-400">
						{currentIndex + 1} / {gameVerbs.length}
					</div>
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
				<div class="flex items-center gap-4">
					{#if showTimer}
						<div class="text-sm text-slate-400 font-mono">
							⏱️ {formatTime(timerSeconds)}
						</div>
					{/if}
					<div class="text-sm text-slate-400">
						{currentIndex + 1} / {gameVerbs.length}
					</div>
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
				<div class="flex items-center gap-4">
					{#if showTimer}
						<div class="text-sm text-slate-400 font-mono">
							⏱️ {formatTime(timerSeconds)}
						</div>
					{/if}
					<div class="text-sm text-slate-400">
						{currentIndex + 1} / {gameVerbs.length}
					</div>
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
				<div class="flex items-center gap-4">
					{#if showTimer}
						<div class="text-sm text-slate-400 font-mono">
							⏱️ {formatTime(timerSeconds)}
						</div>
					{/if}
					<div class="text-sm text-slate-400">
						{currentIndex + 1} / {gameVerbs.length}
					</div>
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
											const correctAnswer = currentConjugations.find(c => c.label === conjugationForm)?.kana || currentVerb.kana;
											return option === correctAnswer
												? 'border-green-500 bg-green-500/20 text-green-400'
												: 'border-red-500 bg-red-500/20 text-red-400';
										})()
										: (() => {
											const correctAnswer = currentConjugations.find(c => c.label === conjugationForm)?.kana || currentVerb.kana;
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

	{:else if currentMode === 'inverse-conjugation-quiz'}
		<!-- Inverse Conjugation Quiz Game -->
		<section class="space-y-6">
			<!-- Header -->
			<div class="flex items-center justify-between">
				<button
					onclick={exitGame}
					class="text-slate-400 hover:text-white transition-colors"
				>
					← Salir
				</button>
				<div class="flex items-center gap-4">
					{#if showTimer}
						<div class="text-sm text-slate-400 font-mono">
							⏱️ {formatTime(timerSeconds)}
						</div>
					{/if}
					<div class="text-sm text-slate-400">
						{currentIndex + 1} / {gameVerbs.length}
					</div>
				</div>
			</div>

			{#if currentVerb}
				<!-- Question -->
				<div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center">
					<p class="text-sm text-slate-400 mb-4">¿Qué significa esta conjugación?</p>
					<div class="text-5xl font-bold text-white mb-3">
						{currentConjugations.find(c => c.label === conjugationForm)?.kana || currentVerb.kana}
					</div>
					<div class="text-lg text-indigo-400 mb-2">Verbo: {currentVerb.kanji} ({currentVerb['meaning-es']})</div>
					<div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/50 mb-4">
						<span class="text-sm font-medium text-purple-300">
							{conjugationFormality === 'formal' ? 'Formal' : 'Informal'}
						</span>
					</div>
					<button
						onclick={() => speak(currentConjugations.find(c => c.label === conjugationForm)?.kana || currentVerb!.kana)}
						class="mt-2 p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-xl"
					>
						🔊
					</button>
				</div>

				<!-- Options -->
				<div class="grid gap-3">
					{#each options as option}
						{@const selectedConjugation = currentConjugations.find(c => c.label === conjugationForm)}
						<button
							onclick={() => handleInverseConjugationQuizAnswer(option)}
							disabled={selectedAnswer !== null}
							class="rounded-2xl border-2 p-4 transition-all active:scale-95 {
								selectedAnswer === null
									? 'border-slate-800 bg-slate-900/70 text-white hover:border-purple-500'
									: selectedAnswer === option
										? (() => {
											const correctAnswer = selectedConjugation?.translation || currentVerb['meaning-es'];
											return option === correctAnswer
												? 'border-green-500 bg-green-500/20 text-green-400'
												: 'border-red-500 bg-red-500/20 text-red-400';
										})()
										: (() => {
											const correctAnswer = selectedConjugation?.translation || currentVerb['meaning-es'];
											return option === correctAnswer
												? 'border-green-500 bg-green-500/20 text-green-400'
												: 'border-slate-800 bg-slate-900/50 text-slate-500';
										})()
							}"
						>
							<div class="text-xl font-medium">{option}</div>
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

	{:else if currentMode === 'verb-type-quiz'}
		<!-- Verb Type Quiz Game -->
		<section class="space-y-6">
			<!-- Header -->
			<div class="flex items-center justify-between">
				<button
					onclick={exitGame}
					class="text-slate-400 hover:text-white transition-colors"
				>
					← Salir
				</button>
				<div class="flex items-center gap-4">
					{#if showTimer}
						<div class="text-sm text-slate-400 font-mono">
							⏱️ {formatTime(timerSeconds)}
						</div>
					{/if}
					<div class="text-sm text-slate-400">
						{currentIndex + 1} / {gameVerbs.length}
					</div>
				</div>
			</div>

			{#if currentVerb}
				<!-- Question -->
				<div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center">
					<p class="text-sm text-slate-400 mb-4">¿Qué tipo de verbo es?</p>
					<div class="text-5xl font-bold text-white mb-3">
						{currentVerb.kanji}
					</div>
					<div class="text-xl text-slate-300 mb-2">{currentVerb.kana}</div>
					<div class="text-lg text-indigo-400 mb-2">{currentVerb['meaning-es']}</div>
					<button
						onclick={() => speak(currentVerb.kanji || currentVerb.kana)}
						class="mt-2 p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-xl"
					>
						🔊
					</button>
				</div>

				<!-- Options -->
				<div class="grid gap-3">
					{#each options as option}
						{@const typeNames: { [key: string]: string } = {
							'godan': 'Godan (Grupo 1)',
							'ichidan': 'Ichidan (Grupo 2)',
							'irregular': 'Irregular (Grupo 3)'
						}}
						{@const correctAnswer = typeNames[currentVerb.type]}
						<button
							onclick={() => handleVerbTypeQuizAnswer(option)}
							disabled={selectedAnswer !== null}
							class="rounded-2xl border-2 p-4 transition-all active:scale-95 {
								selectedAnswer === null
									? 'border-slate-800 bg-slate-900/70 text-white hover:border-amber-500'
									: selectedAnswer === option
										? option === correctAnswer
											? 'border-green-500 bg-green-500/20 text-green-400'
											: 'border-red-500 bg-red-500/20 text-red-400'
										: option === correctAnswer
											? 'border-green-500 bg-green-500/20 text-green-400'
											: 'border-slate-800 bg-slate-900/50 text-slate-500'
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
						onclick={exitGame}
						class="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white"
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
				<div class="flex items-center gap-4">
					{#if showTimer}
						<div class="text-sm text-slate-400 font-mono">
							⏱️ {formatTime(timerSeconds)}
						</div>
					{/if}
					<div class="text-sm text-slate-400">
						{currentIndex + 1} / {gameVerbs.length}
					</div>
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
							Piensa en las conjugaciones JLPT N5 de este verbo (formales ます形 e informales 普通形)
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
							{#each currentConjugations.slice(1) as form}
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
			<div class="grid {showTimer ? 'grid-cols-3' : 'grid-cols-2'} gap-3">
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
				{#if showTimer}
					<div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-center">
						<div class="text-3xl font-bold text-emerald-400 mb-1">
							{formatTime(timerSeconds)}
						</div>
						<p class="text-xs text-slate-400 uppercase tracking-wide">Tiempo</p>
					</div>
				{/if}
			</div>

			<!-- Resumen por verbo -->
			<div>
				<h2 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
					<span>📊</span>
					<span>Detalle por verbo</span>
				</h2>
				
				{#if currentSessionErrors().length > 0}
					<div class="mb-4 p-3 rounded-xl border border-orange-500/30 bg-orange-500/10">
						<p class="text-sm text-orange-300 flex items-center gap-2">
							<span>⚠️</span>
							<span>Verbos para repasar: {currentSessionErrors().length}</span>
						</p>
					</div>
				{/if}
				
				<div class="space-y-2">
					{#each verbStats() as stats}
						{@const hasCurrentSessionError = currentSessionErrors().includes(stats.verb.kanji)}
						<div class="rounded-xl border {
							!hasCurrentSessionError 
								? 'border-green-500/20 bg-green-500/5' 
								: 'border-orange-500/30 bg-orange-500/10'
						} p-4 transition-all hover:scale-[1.02]">
							<div class="flex items-start justify-between gap-3">
								<div class="flex-1">
									<div class="flex items-center gap-2 mb-1">
										<span class="text-xl font-bold text-white">{stats.verb.kanji}</span>
										<span class="text-base text-slate-400">{stats.verb.kana}</span>
										{#if !hasCurrentSessionError}
											<span class="text-green-400 text-lg">✓</span>
										{:else}
											<span class="text-orange-400 text-lg">⚠️</span>
										{/if}
									</div>
									<p class="text-sm text-indigo-300">{stats.verb['meaning-es']}</p>
									
									{#if hasCurrentSessionError}
										<p class="text-xs text-orange-400 mt-1 flex items-center gap-1">
											<span>🔄</span>
											<span>Necesita repaso</span>
										</p>
									{/if}
								</div>
								<button
									onclick={() => speak(stats.verb.kanji || stats.verb.kana)}
									class="p-2 rounded-lg hover:bg-slate-800 transition-colors text-lg flex-shrink-0"
									aria-label="Reproducir"
								>
									🔊
								</button>
							</div>
							
							<!-- Progreso de mastery simplificado -->
							<div class="mt-3">
								<div class="flex items-center justify-between text-xs text-slate-400 mb-1">
									<span>Nivel de dominio 
										{#if stats.incorrectCount > 0}
											(<span class="text-red-400">{stats.incorrectCount}</span>/<span class="text-green-400">{stats.correctCount}</span>)
										{:else}
											(<span class="text-green-400">{stats.correctCount}</span>)
										{/if}
									</span>
								</div>
								<div class="h-2 bg-slate-800 rounded-full overflow-hidden">
									<div 
										class="h-full transition-all duration-500 {
											stats.newMastery <= -3 ? 'bg-red-500' :
											stats.newMastery <= -1 ? 'bg-orange-500' :
											stats.newMastery === 0 ? 'bg-slate-500' :
											stats.newMastery <= 2 ? 'bg-yellow-500' :
											stats.newMastery === 3 ? 'bg-blue-500' :
											'bg-green-500'
										}"
										style="width: {((stats.newMastery + 5) / 10) * 100}%"
									></div>
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
