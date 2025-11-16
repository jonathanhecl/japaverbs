<script lang="ts">
	import { userProfile, getLocalDateString } from '$lib/stores/userProgress';
	import { speak } from '$lib/utils/tts';
	import { conjugateVerb } from '$lib/utils/conjugation';
	import type { VerbWithTranslation } from '$lib/types/verb';
	import { getCurrentVerbs } from '$lib/data/verbs';
	import { languageStore } from '$lib/stores/language';

	type GameMode = 'menu' | 'config' | 'flashcards' | 'multiple-choice' | 'meaning-to-verb' | 'conjugation' | 'listening' | 'conjugation-quiz' | 'inverse-conjugation-quiz' | 'verb-type-quiz' | 'verb-matching' | 'results';

	interface VerbResult {
		verb: VerbWithTranslation;
		correct: boolean;
		previousMastery: number;
		newMastery: number;
	}

	interface VerbStats {
		verb: VerbWithTranslation;
		correctCount: number;
		incorrectCount: number;
		previousMastery: number;
		newMastery: number;
	}

	type ConjugationFormality = 'formal' | 'informal';

	interface ConjugationType {
		key: string;
		formality: ConjugationFormality;
		name: string;
		shortName: string;
		description: string;
		example: string;
	}

	let currentMode = $state<GameMode>('menu');
	let selectedGame = $state<GameMode>('flashcards');
	let questionsPerSession = $state(10);
	let currentVerb = $state<VerbWithTranslation | null>(null);
	let questionCount = $state(0);
	let correctCount = $state(0);
	let showAnswer = $state(false);
	let selectedAnswer = $state<string | null>(null);
	let gameVerbs = $state<VerbWithTranslation[]>([]);
	let currentIndex = $state(0);
	let options = $state<string[]>([]);
	let feedback = $state('');
	let feedbackHint = $state('');
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
	interface ConjugationEntry {
		key: string;
		label: string;
		kana: string;
		description: string;
		translation: string;
	}

	let currentConjugations = $state<ConjugationEntry[]>([]);
	let isRetrySession = $state(false);
	
	// Verb Matching state
	let matchingVerbs = $state<VerbWithTranslation[]>([]);
	let matchingMeanings = $state<string[]>([]);
	let selectedMatches = $state<Map<number, number>>(new Map());
	let selectedVerbIndex = $state<number | null>(null);
	let matchingCurrentPage = $state(0);
	let matchingTotalPages = $state(0);
	let matchingPageVerbs = $state<VerbWithTranslation[]>([]);
	let matchingPageResults = $state<{ verb: VerbWithTranslation; correct: boolean; selectedMeaning: string; correctMeaning: string }[]>([]);
	let showingResults = $state(false);

	// Lista completa de tipos de conjugaciones con información descriptiva
	const conjugationTypes: ConjugationType[] = [
		// Formales (ます形) - Situaciones corteses y formales
		{ 
			key: 'masuPresent', 
			formality: 'formal', 
			name: 'Presente formal (ます)',
			shortName: 'Presente formal',
			description: 'Acción que ocurre ahora o habitualmente (formal)',
			example: 'する → します (hago)'
		},
		{ 
			key: 'masuPresentNegative', 
			formality: 'formal', 
			name: 'Presente negativo formal (ません)',
			shortName: 'Negativo formal',
			description: 'Acción que NO ocurre (formal)',
			example: 'する → しません (no hago)'
		},
		{ 
			key: 'masuPast', 
			formality: 'formal', 
			name: 'Pasado formal (ました)',
			shortName: 'Pasado formal',
			description: 'Acción que ocurrió en el pasado (formal)',
			example: 'する → しました (hice)'
		},
		{ 
			key: 'masuPastNegative', 
			formality: 'formal', 
			name: 'Pasado negativo formal (ませんでした)',
			shortName: 'Pasado negativo formal',
			description: 'Acción que NO ocurrió en el pasado (formal)',
			example: 'する → しませんでした (no hice)'
		},
		{ 
			key: 'invitation', 
			formality: 'formal', 
			name: 'Invitación (ましょう)',
			shortName: 'Invitación',
			description: 'Para invitar o sugerir hacer algo juntos',
			example: 'する → しましょう (hagamos)'
		},
		{ 
			key: 'desireFormal', 
			formality: 'formal', 
			name: 'Deseo formal (たいです)',
			shortName: 'Deseo formal',
			description: 'Expresar que quieres hacer algo (formal)',
			example: 'する → したいです (quiero hacer)'
		},
		{ 
			key: 'permission', 
			formality: 'formal', 
			name: 'Permiso (てもいいです)',
			shortName: 'Permiso',
			description: 'Pedir permiso o indicar que está permitido',
			example: 'する → してもいいです (puedo hacer)'
		},
		{ 
			key: 'prohibition', 
			formality: 'formal', 
			name: 'Prohibición (てはいけません)',
			shortName: 'Prohibición',
			description: 'Indicar que algo está prohibido',
			example: 'する → してはいけません (no se puede hacer)'
		},
		{ 
			key: 'progressiveFormal', 
			formality: 'formal', 
			name: 'Progresivo formal (ています)',
			shortName: 'Progresivo formal',
			description: 'Acción en progreso o estado continuo (formal)',
			example: 'する → しています (estoy haciendo)'
		},
		
		// Informales (普通形) - Situaciones casuales con amigos/familia
		{ 
			key: 'dictionary', 
			formality: 'informal', 
			name: 'Forma diccionario (普通形)',
			shortName: 'Forma diccionario',
			description: 'Forma básica del verbo (presente/futuro informal)',
			example: 'する → する (hacer/haré)'
		},
		{ 
			key: 'plainNegative', 
			formality: 'informal', 
			name: 'Negativo informal (ない)',
			shortName: 'Negativo informal',
			description: 'Acción que NO ocurre (informal)',
			example: 'する → しない (no hago)'
		},
		{ 
			key: 'plainPast', 
			formality: 'informal', 
			name: 'Pasado informal (た)',
			shortName: 'Pasado informal',
			description: 'Acción que ocurrió en el pasado (informal)',
			example: 'する → した (hice)'
		},
		{ 
			key: 'plainPastNegative', 
			formality: 'informal', 
			name: 'Pasado negativo informal (なかった)',
			shortName: 'Pasado negativo informal',
			description: 'Acción que NO ocurrió en el pasado (informal)',
			example: 'する → しなかった (no hice)'
		},
		{ 
			key: 'desireInformal', 
			formality: 'informal', 
			name: 'Deseo informal (たい)',
			shortName: 'Deseo informal',
			description: 'Expresar que quieres hacer algo (informal)',
			example: 'する → したい (quiero hacer)'
		},
		{ 
			key: 'invitationInformal', 
			formality: 'informal', 
			name: 'Invitación informal (よう)',
			shortName: 'Invitación informal',
			description: 'Sugerir hacer algo juntos (informal)',
			example: 'する → しよう (hagamos)'
		},
		{ 
			key: 'request', 
			formality: 'informal', 
			name: 'Forma て (て)',
			shortName: 'Forma て',
			description: 'Para pedir, conectar acciones o dar órdenes suaves',
			example: 'する → して (haz/haciendo)'
		},
		{ 
			key: 'negativeRequest', 
			formality: 'informal', 
			name: 'Petición negativa (ないで)',
			shortName: 'No hagas',
			description: 'Pedir que no se haga algo',
			example: 'する → しないで (no hagas)'
		},
		{ 
			key: 'progressiveInformal', 
			formality: 'informal', 
			name: 'Progresivo informal (ている)',
			shortName: 'Progresivo informal',
			description: 'Acción en progreso o estado continuo (informal)',
			example: 'する → している (estoy haciendo)'
		}
	];

	// Obtener verbos actualizados según el idioma
	let verbs = $derived<VerbWithTranslation[]>(getCurrentVerbs());

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

	function getFormalityStyles(formality?: ConjugationFormality) {
		switch (formality) {
			case 'formal':
				return {
					container: 'border border-blue-500/40 bg-blue-500/10',
					title: 'text-white',
					description: 'text-blue-200'
				};
			case 'informal':
				return {
					container: 'border border-slate-600/40 bg-slate-700/10',
					title: 'text-white',
					description: 'text-slate-300'
				};
			default:
				return {
					container: 'border border-indigo-500/50 bg-gradient-to-r from-indigo-500/20 to-purple-500/20',
					title: 'text-white',
					description: 'text-indigo-300'
				};
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
			id: 'verb-type-quiz',
			title: 'Quiz de tipos de verbos',
			description: 'Identifica si el verbo es Godan, Ichidan o Irregular',
			icon: '🏷️',
			color: 'from-amber-500 to-orange-500',
			difficulty: 'Medio',
			order: 2
		},
		{
			id: 'multiple-choice',
			title: 'Opción múltiple',
			description: 'Elige la traducción correcta (verbo -> significado)',
			icon: '✅',
			color: 'from-green-500 to-emerald-500',
			difficulty: 'Medio',
			order: 3
		},
		{
			id: 'meaning-to-verb',
			title: 'Opción múltiple inversa',
			description: 'Elige el verbo correcto desde el significado (significado -> verbo)',
			icon: '🔄',
			color: 'from-cyan-500 to-blue-500',
			difficulty: 'Medio',
			order: 4
		},
		{
			id: 'verb-matching',
			title: 'Emparejamiento',
			description: 'Conecta cada verbo con su significado correcto',
			icon: '🔗',
			color: 'from-teal-500 to-cyan-500',
			difficulty: 'Medio',
			order: 5
		},
		{
			id: 'listening',
			title: 'Opción múltiple (solo escucha)',
			description: 'Identifica el verbo que escuchas (verbo -> significado)',
			icon: '👂',
			color: 'from-orange-500 to-red-500',
			difficulty: 'Medio',
			order: 6
		},
		{
			id: 'conjugation',
			title: 'Tarjetas de conjugación',
			description: 'Aprende las conjugaciones con tarjetas interactivas',
			icon: '🎴',
			color: 'from-purple-500 to-pink-500',
			difficulty: 'Medio',
			order: 6
		},
		{
			id: 'conjugation-quiz',
			title: 'Quiz de conjugación',
			description: 'Elige la conjugación correcta desde el verbo diccionario',
			icon: '🎯',
			color: 'from-indigo-500 to-purple-500',
			difficulty: 'Difícil',
			order: 7
		},
		{
			id: 'inverse-conjugation-quiz',
			title: 'Quiz de conjugación inversa',
			description: 'Identifica el tipo de conjugación desde el verbo conjugado',
			icon: '🔄',
			color: 'from-purple-500 to-pink-500',
			difficulty: 'Difícil',
			order: 8
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

	function startGame(mode: GameMode, isRetry: boolean = false) {
		currentMode = mode;
		completedGameMode = mode;
		sessionResults = []; // Reiniciar resultados de la sesión
		isRetrySession = isRetry; // Guardar si es una sesión de reintento
		
		// Iniciar timer si está habilitado
		startTimer();
		
		// Implementar algoritmo de repetición espaciada
		const today = getLocalDateString();
		
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
				// Nueva escala: -5 a 10, entonces usamos (10 - masteryScore) * 30
				priority += (10 - masteryScore) * 30; // -5 score = +450, +10 score = +0
			} else {
				// No es momento de revisión, pero verbos difíciles aún tienen prioridad
				priority = Math.max(0, (10 - masteryScore) * 15); // -5 score = +225, +10 score = +0
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
		feedbackHint = '';
		autoPlayedExample = false;
		autoReadTriggered = false;
		
		// No incrementar questionCount en verb-matching, se maneja en validateMatchingPage
		if (currentMode !== 'verb-matching') {
			questionCount++;
		}
		
		// Update conjugations when verb changes
		if (currentVerb) {
			currentConjugations = conjugateVerb(currentVerb);
		}

		if (currentMode === 'multiple-choice' || currentMode === 'listening') {
			generateOptions();
		} else if (currentMode === 'meaning-to-verb') {
			generateMeaningToVerbOptions();
		} else if (currentMode === 'conjugation-quiz') {
			generateConjugationQuiz();
		} else if (currentMode === 'inverse-conjugation-quiz') {
			generateInverseConjugationQuiz();
		} else if (currentMode === 'verb-type-quiz') {
			generateVerbTypeQuiz();
		} else if (currentMode === 'verb-matching') {
			generateMatchingPage();
		}
	}

	function generateOptions() {
		if (!currentVerb) return;
		
		const correctAnswer = currentVerb.translation.meaning;
		const otherVerbs = verbs.filter(v => v.kanji !== currentVerb!.kanji);
		const wrongAnswers = shuffleArray(otherVerbs)
			.slice(0, 3)
			.map(v => v.translation.meaning);
		
		options = shuffleArray([correctAnswer, ...wrongAnswers]);
	}

	function generateMeaningToVerbOptions() {
		if (!currentVerb) return;
		
		// The correct answer is the verb itself (kanji + kana)
		const correctAnswer = `${currentVerb.kanji} (${currentVerb.kana})`;
		const otherVerbs = verbs.filter(v => v.kanji !== currentVerb!.kanji);
		const wrongAnswers = shuffleArray(otherVerbs)
			.slice(0, 3)
			.map(v => `${v.kanji} (${v.kana})`);
		
		options = shuffleArray([correctAnswer, ...wrongAnswers]);
	}

	function generateConjugationQuiz() {
		if (!currentVerb) return;
		
		// Seleccionar un tipo de conjugación aleatorio
		const selected = conjugationTypes[Math.floor(Math.random() * conjugationTypes.length)];
		conjugationForm = selected.name;
		conjugationFormality = selected.formality;
		
		const selectedConjugation = currentConjugations.find(c => c.key === selected.key);
		const correctConjugation = selectedConjugation?.kana || currentVerb.kana;
		
		// Guardar la traducción de la forma seleccionada
		conjugationTranslation = selectedConjugation?.translation || currentVerb.translation.meaning;
		
		// Generar opciones incorrectas usando OTRAS CONJUGACIONES DEL MISMO VERBO
		const otherForms = conjugationTypes.filter(f => f.key !== selected.key);
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
		
		// Seleccionar un tipo de conjugación aleatorio
		const selected = conjugationTypes[Math.floor(Math.random() * conjugationTypes.length)];
		conjugationForm = selected.name;
		conjugationFormality = selected.formality;
		
		const selectedConjugation = currentConjugations.find(c => c.key === selected.key);
		const correctConjugation = selectedConjugation?.kana || currentVerb.kana;
		
		// Guardar la traducción de la forma seleccionada para mostrar información adicional
		conjugationTranslation = selectedConjugation?.translation || currentVerb.translation.meaning;
		
		// La respuesta correcta es el NOMBRE del tipo de conjugación
		const correctAnswer = selected.name;
		
		// Generar opciones incorrectas usando NOMBRES de OTRAS CONJUGACIONES
		const otherForms = conjugationTypes.filter(f => f.key !== selected.key);
		const wrongAnswers: string[] = [];
		
		// Mezclar y seleccionar 3 opciones incorrectas
		const shuffledOtherForms = shuffleArray(otherForms);
		for (let i = 0; i < Math.min(3, shuffledOtherForms.length); i++) {
			wrongAnswers.push(shuffledOtherForms[i].name);
		}
		
		options = shuffleArray([correctAnswer, ...wrongAnswers]);
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
			const hasExamples = currentVerb.translation.examples?.length > 0;

			if (hasExamples) {
				setTimeout(() => {
					speak(currentVerb!.translation.examples[0].ja);
					autoPlayedExample = true;
				}, 500);
			}
			
			// Auto-leer verbo si está habilitado (además del ejemplo)
			if (autoReadVerbs && !hasExamples) {
				setTimeout(() => {
					speak(currentVerb!.kanji || currentVerb!.kana);
					autoPlayedExample = true;
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
		if (!autoReadVerbs || !currentVerb || currentMode === 'listening' || currentMode === 'verb-matching' || currentMode === 'results' || currentMode === 'meaning-to-verb' || autoReadTriggered) {
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
		
		// Flashcards básicas: multiplicador 0.5 (fácil)
		userProfile.recordPractice(currentVerb.kanji, knew, !isRetrySession, 0.5);
		
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
		const correct = answer === currentVerb.translation.meaning;
		
		// Guardar mastery score previo
		const previousMastery = $userProfile.studiedVerbs[currentVerb.kanji]?.masteryScore ?? 0;
		
		if (correct) {
			feedbackHint = '';
			correctCount++;
			userProfile.addXP(10);
			// Multiple Choice: multiplicador 1.0 (estándar)
			userProfile.recordPractice(currentVerb.kanji, true, !isRetrySession, 1.0);
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
			feedback = `Incorrecto. La respuesta correcta es: ${currentVerb.translation.meaning}`;
			showErrorOverlay = true;
			// Multiple Choice error: multiplicador 1.0 (estándar)
			userProfile.recordPractice(currentVerb.kanji, false, !isRetrySession, 1.0);
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

	function handleMeaningToVerbAnswer(answer: string) {
		if (!currentVerb || selectedAnswer) return;
		
		selectedAnswer = answer;
		const correctAnswer = `${currentVerb.kanji} (${currentVerb.kana})`;
		const correct = answer === correctAnswer;
		
		// Guardar mastery score previo
		const previousMastery = $userProfile.studiedVerbs[currentVerb.kanji]?.masteryScore ?? 0;
		const queueSpeakAnswer = () => {
			setTimeout(() => {
				speak(currentVerb!.kanji || currentVerb!.kana);
			}, 300);
		};
		
		if (correct) {
			feedbackHint = '';
			correctCount++;
			userProfile.addXP(10);
			// Meaning to Verb: multiplicador 1.0 (medio, estándar)
			userProfile.recordPractice(currentVerb.kanji, true, !isRetrySession, 1.0);
			queueSpeakAnswer();
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
			queueSpeakAnswer();
			// Meaning to Verb error: multiplicador 1.0 (medio, estándar)
			userProfile.recordPractice(currentVerb.kanji, false, !isRetrySession, 1.0);
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
		
		if (correct) {
			correctCount++;
			userProfile.addXP(20);
			// Conjugation Quiz: multiplicador 2.0 (difícil)
			userProfile.recordPractice(currentVerb.kanji, true, !isRetrySession, 2.0);
			
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
			feedbackHint = '';
			showErrorOverlay = true;
			
			// Reproducir la conjugación correcta cuando hay error
			if (autoReadVerbs) {
				setTimeout(() => {
					speak(correctAnswer);
				}, 300);
			}
			
			// Conjugation Quiz error: multiplicador 2.0 (difícil)
			userProfile.recordPractice(currentVerb.kanji, false, !isRetrySession, 2.0);
			
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
		
		// La respuesta correcta es el NOMBRE de la conjugación (no la traducción)
		const correctAnswer = conjugationForm;
		const correct = answer === correctAnswer;
		
		// Obtener info adicional de la conjugación seleccionada
		const selectedConjugation = currentConjugations.find(c => c.label === conjugationForm);
		const conjugationType = conjugationTypes.find(t => t.name === conjugationForm);
		
		// Guardar mastery score previo
		const previousMastery = $userProfile.studiedVerbs[currentVerb.kanji]?.masteryScore ?? 0;
		
		if (correct) {
			correctCount++;
			userProfile.addXP(20);
			// Inverse Conjugation Quiz: multiplicador 2.0 (difícil)
			userProfile.recordPractice(currentVerb.kanji, true, !isRetrySession, 2.0);
			
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
			feedback = `Incorrecto. La respuesta correcta es:\n${correctAnswer}`;
			if (conjugationType) {
				feedbackHint = conjugationType.description;
			}
			showErrorOverlay = true;
			
			// Reproducir la forma conjugada correcta cuando hay error
			if (autoReadVerbs) {
				setTimeout(() => {
					speak(selectedConjugation?.kana || currentVerb!.kana);
				}, 300);
			}
			
			// Inverse Conjugation Quiz error: multiplicador 2.0 (difícil)
			userProfile.recordPractice(currentVerb.kanji, false, !isRetrySession, 2.0);
			
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

	function generateMatchingPage() {
		if (matchingCurrentPage === 0) {
			// Primera vez: preparar todos los verbos y calcular páginas
			matchingVerbs = [...gameVerbs];
			matchingTotalPages = Math.ceil(matchingVerbs.length / 5);
		}
		
		// Obtener verbos para la página actual
		const startIdx = matchingCurrentPage * 5;
		const endIdx = Math.min(startIdx + 5, matchingVerbs.length);
		matchingPageVerbs = matchingVerbs.slice(startIdx, endIdx);
		
		// Generar significados mezclados para esta página
		matchingMeanings = shuffleArray(
			matchingPageVerbs.map(v => v.translation.meaning)
		);
		
		// Resetear selecciones y resultados
		selectedMatches = new Map();
		selectedVerbIndex = null;
		showingResults = false;
		matchingPageResults = [];
	}
	
	function handleMatchingVerbClick(verbIndex: number) {
		if (selectedVerbIndex === verbIndex) {
			// Deseleccionar si se hace clic de nuevo
			selectedVerbIndex = null;
		} else {
			selectedVerbIndex = verbIndex;
		}
	}
	
	function handleMatchingMeaningClick(meaningIndex: number) {
		if (selectedVerbIndex === null) return;
		
		// Verificar si este significado ya está emparejado
		const alreadyMatched = Array.from(selectedMatches.values()).includes(meaningIndex);
		if (alreadyMatched) {
			// Encontrar qué verbo tenía este significado y eliminarlo
			for (const [vIdx, mIdx] of selectedMatches.entries()) {
				if (mIdx === meaningIndex) {
					selectedMatches.delete(vIdx);
					break;
				}
			}
		}
		
		// Crear nuevo emparejamiento
		selectedMatches.set(selectedVerbIndex, meaningIndex);
		selectedMatches = new Map(selectedMatches); // Trigger reactivity
		selectedVerbIndex = null;
	}
	
	function validateMatchingPage() {
		// Verificar que todos los verbos estén emparejados
		if (selectedMatches.size !== matchingPageVerbs.length) {
			return;
		}
		
		// Validar cada emparejamiento
		let pageCorrectCount = 0;
		matchingPageResults = [];
		
		matchingPageVerbs.forEach((verb, verbIdx) => {
			const meaningIdx = selectedMatches.get(verbIdx);
			if (meaningIdx === undefined) return;
			
			const selectedMeaning = matchingMeanings[meaningIdx];
			const correctMeaning = verb.translation.meaning;
			const correct = selectedMeaning === correctMeaning;
			
			// Guardar resultado para mostrar con más detalles
			matchingPageResults.push({ 
				verb, 
				correct, 
				selectedMeaning, 
				correctMeaning 
			});
			
			// Guardar mastery score previo
			const previousMastery = $userProfile.studiedVerbs[verb.kanji]?.masteryScore ?? 0;
			
			if (correct) {
				pageCorrectCount++;
				correctCount++;
				userProfile.addXP(10);
			}
			
			// Verb Matching: multiplicador 1.0 (medio, estándar)
			userProfile.recordPractice(verb.kanji, correct, !isRetrySession, 1.0);
			
			// Guardar resultado
			const newMastery = $userProfile.studiedVerbs[verb.kanji]?.masteryScore ?? 0;
			sessionResults.push({
				verb,
				correct,
				previousMastery,
				newMastery
			});
		});
		
		// Ordenar resultados: correctos arriba, incorrectos abajo
		matchingPageResults.sort((a, b) => {
			if (a.correct === b.correct) return 0;
			return a.correct ? -1 : 1;
		});
		
		// Incrementar contador de preguntas (1 por verbo emparejado)
		questionCount += matchingPageVerbs.length;
		
		// Mostrar resultados en lugar de popup
		showingResults = true;
	}
	
	function proceedToNextPage() {
		showingResults = false;
		matchingCurrentPage++;
		
		if (matchingCurrentPage < matchingTotalPages) {
			generateMatchingPage();
		} else {
			// Resetear para la próxima vez
			matchingCurrentPage = 0;
			finishGame();
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
				currentVerb && speak(currentVerb.kanji || currentVerb.kana);
			}, 300);
		}
		
		if (correct) {
			correctCount++;
			feedback = '¡Correcto!';
			userProfile.addXP(8);
			// Verb Type Quiz: multiplicador 0.75 (medio-fácil)
			userProfile.recordPractice(currentVerb.kanji, true, !isRetrySession, 0.75);
			
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
			feedback = `Incorrecto. La respuesta correcta es: ${correctAnswer}`;
			feedbackHint = correctExplanation;
			showErrorOverlay = true;
			
			// Verb Type Quiz error: multiplicador 0.75 (medio-fácil)
			userProfile.recordPractice(currentVerb.kanji, false, !isRetrySession, 0.75);
			
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
		
		// Conjugation Flashcards: multiplicador 1.5 (medio-alto)
		userProfile.recordPractice(currentVerb.kanji, knew, !isRetrySession, 1.5);
		
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
		
		// Actualizar estadísticas globales de la sesión
		userProfile.update(profile => ({
			...profile,
			totalPractices: profile.totalPractices + 1,
			totalCorrect: profile.totalCorrect + correctCount,
			totalQuestions: profile.totalQuestions + questionCount
		}));
		
		// Check for achievements
		if (questionCount >= 10 && accuracy === 100) {
			userProfile.addAchievement('perfect_game');
		}
		
		// Ir a la pantalla de resultados
		currentMode = 'results';
	}
	
	function retryGame() {
		startGame(completedGameMode, true);
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
							<span class="mt-4 inline-block px-3 py-1 rounded-full text-xs font-semibold border border-purple-500/50 bg-purple-500/20 text-purple-300">
								{currentVerb.type === 'godan' ? 'Godan (Grupo 1)' : currentVerb.type === 'ichidan' ? 'Ichidan (Grupo 2)' : 'Irregular (Grupo 3)'}
							</span>
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
							<div class="text-4xl font-bold text-white mb-4">
								{currentVerb.translation.meaning}
							</div>
							<span class="mb-4 inline-block px-3 py-1 rounded-full text-xs font-medium border border-purple-500/50 bg-purple-500/20 text-purple-400">
								{currentVerb.type === 'godan' ? 'Godan (Grupo 1)' : currentVerb.type === 'ichidan' ? 'Ichidan (Grupo 2)' : 'Irregular (Grupo 3)'}
							</span>
							{#if currentVerb.translation.examples.length > 0}
								<div class="space-y-3 w-full">
									<div class="relative text-sm text-slate-300 bg-slate-900/50 rounded-xl p-4 border border-slate-800">
										<p class="font-japanese mb-2">{currentVerb.translation.examples[0].ja}</p>
										<p class="text-slate-400 mb-3">{currentVerb.translation.examples[0].es}</p>
										<button
											onclick={(e) => {
												e.stopPropagation();
												speak(currentVerb!.translation.examples[0].ja);
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
					<div class="text-2xl text-slate-300 mb-2">{currentVerb.kana}</div>
					<div class="text-lg text-slate-400">{currentVerb.romaji}</div>
					<span class="mt-4 inline-block px-3 py-1 rounded-full text-xs font-medium border border-purple-500/50 bg-purple-500/20 text-purple-400">
						{currentVerb.type === 'godan' ? 'Godan (Grupo 1)' : currentVerb.type === 'ichidan' ? 'Ichidan (Grupo 2)' : 'Irregular (Grupo 3)'}
					</span>
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
									? option === currentVerb.translation.meaning
										? 'border-green-500 bg-green-500/20 text-green-400'
										: 'border-red-500 bg-red-500/20 text-red-400'
									: option === currentVerb.translation.meaning
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

	{:else if currentMode === 'meaning-to-verb'}
		<!-- Meaning to Verb Game -->
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
					<p class="text-sm text-slate-400 mb-4">¿Qué verbo significa?</p>
					<div class="text-3xl font-bold text-white mb-4">
						{currentVerb.translation.meaning}
					</div>
					<div class="text-sm text-slate-500 mb-2">
						Tipo: {currentVerb.type === 'godan' ? 'Godan (Grupo 1)' : currentVerb.type === 'ichidan' ? 'Ichidan (Grupo 2)' : 'Irregular (Grupo 3)'}
					</div>
				</div>

				<!-- Options -->
				<div class="grid gap-3">
					{#each options as option}
						{@const correctAnswer = `${currentVerb.kanji} (${currentVerb.kana})`}
						<button
							onclick={() => handleMeaningToVerbAnswer(option)}
							disabled={selectedAnswer !== null}
							class="rounded-2xl border-2 p-4 text-lg font-medium transition-all active:scale-95 {
								selectedAnswer === null
								? 'border-slate-800 bg-slate-900/70 text-white hover:border-cyan-500'
								: selectedAnswer === option
									? option === correctAnswer
										? 'border-green-500 bg-green-500/20 text-green-400'
										: 'border-red-500 bg-red-500/20 text-red-400'
									: option === correctAnswer
										? 'border-green-500 bg-green-500/20 text-green-400'
										: 'border-slate-800 bg-slate-900/50 text-slate-500'
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
						class="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white"
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
									? option === currentVerb.translation.meaning
										? 'border-green-500 bg-green-500/20 text-green-400'
										: 'border-red-500 bg-red-500/20 text-red-400'
									: option === currentVerb.translation.meaning
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

	{:else if currentMode === 'verb-matching'}
		<!-- Verb Matching Game -->
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
						Página {matchingCurrentPage + 1} / {matchingTotalPages}
					</div>
				</div>
			</div>

			<!-- Instrucciones -->
			<div class="rounded-2xl border border-teal-500/30 bg-teal-500/10 p-4 text-center">
				<p class="text-sm text-teal-200">
					🔗 Empareja cada verbo con su significado correcto. Toca un verbo y luego su significado.
				</p>
			</div>

			{#if !showingResults}
				<!-- Botón de validación (arriba para móvil) -->
				<div class="mb-4">
					<button
						onclick={validateMatchingPage}
						disabled={selectedMatches.size !== matchingPageVerbs.length}
						class="w-full rounded-2xl border-2 p-4 text-lg font-semibold transition-all active:scale-95 {
							selectedMatches.size === matchingPageVerbs.length
								? 'border-teal-500 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-teal-500/50'
								: 'border-slate-800 bg-slate-900/50 text-slate-500 cursor-not-allowed'
						}"
					>
						{#if matchingCurrentPage < matchingTotalPages - 1}
							Siguiente página →
						{:else}
							✓ Finalizar
						{/if}
					</button>
				</div>

				<!-- Matching Grid -->
				<div class="grid md:grid-cols-2 gap-6">
					<!-- Verbos (izquierda) -->
					<div class="space-y-3">
						<h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">Verbos</h3>
						{#each matchingPageVerbs as verb, verbIdx}
							{@const isSelected = selectedVerbIndex === verbIdx}
							{@const isMatched = selectedMatches.has(verbIdx)}
							<div class="relative">
								<button
									onclick={() => handleMatchingVerbClick(verbIdx)}
									class="w-full rounded-xl border-2 p-4 text-left transition-all active:scale-95 {
										isSelected
											? 'border-teal-500 bg-teal-500/20 shadow-lg shadow-teal-500/30'
											: isMatched
												? 'border-green-500/50 bg-green-500/10'
												: 'border-slate-800 bg-slate-900/70 hover:border-teal-500/50'
									}"
								>
									<div class="flex items-center justify-between gap-3 pr-12">
										<div class="flex-1">
											<div class="text-2xl font-bold text-white mb-1">{verb.kanji}</div>
											<div class="text-base text-slate-300">{verb.kana}</div>
											<div class="text-sm text-slate-400">{verb.romaji}</div>
										</div>
									</div>
									{#if isMatched}
										<div class="mt-2 flex items-center gap-1 text-xs text-green-400">
											<span>✓</span>
											<span>Emparejado</span>
										</div>
									{/if}
								</button>
								<button
									onclick={(e) => {
										e.stopPropagation();
										speak(verb.kanji || verb.kana);
									}}
									class="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-800 transition-colors text-xl z-10"
									type="button"
								>
									🔊
								</button>
							</div>
						{/each}
					</div>

					<!-- Significados (derecha) -->
					<div class="space-y-3">
						<h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">Significados</h3>
						{#each matchingMeanings as meaning, meaningIdx}
							{@const isMatchedToThis = Array.from(selectedMatches.values()).includes(meaningIdx)}
							<button
								onclick={() => handleMatchingMeaningClick(meaningIdx)}
								disabled={selectedVerbIndex === null}
								class="w-full rounded-xl border-2 p-4 text-left transition-all active:scale-95 {
									isMatchedToThis
										? 'border-green-500/50 bg-green-500/10'
										: selectedVerbIndex !== null
											? 'border-slate-800 bg-slate-900/70 hover:border-teal-500/50 cursor-pointer'
											: 'border-slate-800 bg-slate-900/50 text-slate-500 cursor-not-allowed'
								}"
							>
								<div class="text-lg font-medium {isMatchedToThis ? 'text-white' : selectedVerbIndex !== null ? 'text-white' : 'text-slate-500'}">
									{meaning}
								</div>
								{#if isMatchedToThis}
									<div class="mt-2 flex items-center gap-1 text-xs text-green-400">
										<span>✓</span>
										<span>Seleccionado</span>
									</div>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{:else}
				<!-- Botón de continuar (arriba) -->
				<div class="mb-4">
					<button
						onclick={proceedToNextPage}
						class="w-full rounded-2xl border-2 border-teal-500 bg-gradient-to-r from-teal-500 to-cyan-500 p-4 text-lg font-semibold text-white hover:shadow-lg hover:shadow-teal-500/50 transition-all active:scale-95"
					>
						{#if matchingCurrentPage < matchingTotalPages - 1}
							Continuar →
						{:else}
							Ver resultados finales
						{/if}
					</button>
				</div>

				<!-- Resultados en pares -->
				<div class="space-y-6">
					<!-- Correctos -->
					{#if matchingPageResults.some(r => r.correct)}
						<div class="space-y-3">
							<h3 class="text-base font-semibold text-green-400 mb-3 flex items-center gap-2">
								<span>✅</span>
								<span>Correctos ({matchingPageResults.filter(r => r.correct).length})</span>
							</h3>
							<div class="space-y-2">
								{#each matchingPageResults.filter(r => r.correct) as result}
									<div class="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
										<div class="flex items-center justify-between">
											<div class="flex items-center gap-3">
												<span class="text-2xl font-bold text-white">{result.verb.kanji}</span>
												<span class="text-slate-300">{result.verb.kana}</span>
											</div>
											<div class="flex items-center gap-3">
												<div class="text-right">
													<div class="text-lg font-medium text-green-400">{result.correctMeaning}</div>
													<div class="text-xs text-green-400">✓ Correcto</div>
												</div>
												<button
													onclick={() => speak(result.verb.kanji || result.verb.kana)}
													class="p-2 rounded-lg hover:bg-slate-800 transition-colors text-xl"
													type="button"
												>
													🔊
												</button>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Incorrectos -->
					{#if matchingPageResults.some(r => !r.correct)}
						<div class="space-y-3">
							<h3 class="text-base font-semibold text-red-400 mb-3 flex items-center gap-2">
								<span>❌</span>
								<span>Incorrectos ({matchingPageResults.filter(r => !r.correct).length})</span>
							</h3>
							<div class="space-y-2">
								{#each matchingPageResults.filter(r => !r.correct) as result}
									<div class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
										<div class="flex items-center justify-between mb-2">
											<div class="flex items-center gap-3">
												<span class="text-2xl font-bold text-white">{result.verb.kanji}</span>
												<span class="text-slate-300">{result.verb.kana}</span>
												<button
													onclick={() => speak(result.verb.kanji || result.verb.kana)}
													class="p-2 rounded-lg hover:bg-slate-800 transition-colors text-xl"
													type="button"
												>
													🔊
												</button>
											</div>
										</div>
										<div class="grid grid-cols-2 gap-4 text-sm">
											<div>
												<span class="text-slate-400">Seleccionaste:</span>
												<div class="text-red-400 font-medium">{result.selectedMeaning}</div>
											</div>
											<div>
												<span class="text-slate-400">Correcto era:</span>
												<div class="text-green-400 font-medium">{result.correctMeaning}</div>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Progreso y botón de validación -->
			<div class="space-y-3">
				{#if !showingResults}
					<div class="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
						<div class="flex items-center justify-between mb-2">
							<span class="text-sm text-slate-400">Emparejamientos completados</span>
							<span class="text-sm font-bold text-white">{selectedMatches.size} / {matchingPageVerbs.length}</span>
						</div>
						<div class="h-2 bg-slate-800 rounded-full overflow-hidden">
							<div 
								class="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300"
								style="width: {(selectedMatches.size / matchingPageVerbs.length) * 100}%"
							></div>
						</div>
					</div>
				{:else}
					<!-- Botón de continuar (abajo para fácil acceso) -->
					<div class="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
						<div class="flex items-center justify-between">
							<span class="text-sm text-slate-400">
								{matchingPageResults.filter(r => r.correct).length} / {matchingPageResults.length} correctas
							</span>
							<button
								onclick={proceedToNextPage}
								class="rounded-xl border-2 border-teal-500 bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white hover:shadow-lg hover:shadow-teal-500/50 transition-all active:scale-95"
							>
								{#if matchingCurrentPage < matchingTotalPages - 1}
									Continuar →
								{:else}
									Ver resultados finales
								{/if}
							</button>
						</div>
					</div>
				{/if}
			</div>
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
				{@const conjugationType = conjugationTypes.find(t => t.name === conjugationForm)}
				{@const formalityStyles = getFormalityStyles(conjugationType?.formality)}
				<!-- Question -->
				<div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center">
					<p class="text-sm text-slate-400 mb-2">Elige la conjugación correcta desde el verbo diccionario</p>
					
					<!-- Verbo en forma diccionario -->
					<div class="text-5xl font-bold text-white mb-3">
						{currentVerb.kanji}
					</div>
					<div class="text-xl text-slate-300 mb-1">{currentVerb.kana}</div>
					<div class="text-base text-slate-400 mb-4">({currentVerb.translation.meaning})</div>
					<span class="mb-4 inline-block px-3 py-1 rounded-full text-xs font-medium border border-purple-500/50 bg-purple-500/20 text-purple-400">
						{currentVerb.type === 'godan' ? 'Godan (Grupo 1)' : currentVerb.type === 'ichidan' ? 'Ichidan (Grupo 2)' : 'Irregular (Grupo 3)'}
					</span>
					
					<!-- Tipo de conjugación solicitado -->
					<div class="max-w-md mx-auto mb-4">
						<div class={`rounded-xl ${formalityStyles.container} p-4`}>
							<div class={`text-lg font-bold mb-1 ${formalityStyles.title}`}>
								{conjugationForm}
							</div>
							{#if conjugationType}
								<div class={`text-sm ${formalityStyles.description}`}>
									{conjugationType.description}
								</div>
							{/if}
						</div>
					</div>
					
					<button
						onclick={() => speak(currentVerb!.kanji || currentVerb!.kana)}
						class="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-xl"
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
				{@const selectedConjugation = currentConjugations.find(c => c.label === conjugationForm)}
				<!-- Question -->
				<div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center">
					<p class="text-sm text-slate-400 mb-2">Identifica el tipo de conjugación desde el verbo conjugado</p>
					
					<!-- Verbo conjugado mostrado -->
					<div class="text-5xl font-bold text-white mb-3">
						{selectedConjugation?.kana || currentVerb.kana}
					</div>
					
					<!-- Info del verbo base y significado -->
					<div class="text-base text-slate-400 mb-1">
						Verbo base: <span class="text-slate-300">{currentVerb.kanji}</span> 
						<span class="text-slate-500">({currentVerb.translation.meaning})</span>
					</div>
					<span class="mb-3 inline-block px-3 py-1 rounded-full text-xs font-medium border border-purple-500/50 bg-purple-500/20 text-purple-400">
						{currentVerb.type === 'godan' ? 'Godan (Grupo 1)' : currentVerb.type === 'ichidan' ? 'Ichidan (Grupo 2)' : 'Irregular (Grupo 3)'}
					</span>
					
					{#if conjugationTranslation}
						<div class="text-base text-indigo-300 mb-4">
							Significado: {conjugationTranslation}
						</div>
					{/if}
					
					<!-- Pregunta clara -->
					<div class="max-w-md mx-auto mb-4">
						<div class="rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 p-3">
							<div class="text-sm font-semibold text-purple-200">
								¿Qué tipo de conjugación es?
							</div>
						</div>
					</div>
					
					<button
						onclick={() => speak(selectedConjugation?.kana || currentVerb!.kana)}
						class="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-xl"
					>
						🔊
					</button>
				</div>

				<!-- Options -->
				<div class="grid gap-3">
					{#each options as option}
						<button
							onclick={() => handleInverseConjugationQuizAnswer(option)}
							disabled={selectedAnswer !== null}
							class="rounded-2xl border-2 p-4 transition-all active:scale-95 {
								selectedAnswer === null
									? 'border-slate-800 bg-slate-900/70 text-white hover:border-purple-500'
									: selectedAnswer === option
										? (() => {
											const correctAnswer = conjugationForm;
											return option === correctAnswer
												? 'border-green-500 bg-green-500/20 text-green-400'
												: 'border-red-500 bg-red-500/20 text-red-400';
										})()
										: (() => {
											const correctAnswer = conjugationForm;
											return option === correctAnswer
												? 'border-green-500 bg-green-500/20 text-green-400'
												: 'border-slate-800 bg-slate-900/50 text-slate-500';
										})()
							}"
						>
							<div class="text-base font-medium leading-tight">{option}</div>
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
					<div class="text-lg text-indigo-400 mb-2">{currentVerb.translation.meaning}</div>
					<button
						onclick={() => (currentVerb && speak(currentVerb.kanji || currentVerb.kana))}
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
					<div class="text-lg text-indigo-400 mb-2">{currentVerb.translation.meaning}</div>
					<span class="inline-block px-3 py-1 rounded-full text-xs font-medium border bg-purple-500/20 text-purple-400 border-purple-500/50">
						{currentVerb.type === 'godan' ? 'Godan (Grupo 1)' : currentVerb.type === 'ichidan' ? 'Ichidan (Grupo 2)' : 'Irregular (Grupo 3)'}
					</span>
				</div>

				{#if !showAnswer}
					<div class="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
						<p class="text-slate-300 mb-8">
							Piensa en las conjugaciones de este verbo
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
								{@const conjugationType = conjugationTypes.find(t => t.key === form.key)}
								<div class="rounded-xl border {colors.border} {colors.bg} p-4">
									<div class="flex items-start justify-between mb-2">
										<div class="flex-1">
											<p class="text-sm font-semibold {colors.text} mb-1">
												{conjugationType?.name || form.label}
											</p>
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
									<p class="text-xs text-slate-400 mt-2">
										{conjugationType?.description || form.description}
									</p>
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
					🔄 Volver a hacer
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
									<p class="text-sm text-indigo-300">{stats.verb.translation.meaning}</p>
									
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
			<p class="text-lg font-medium text-white">{feedback}</p>
			{#if feedbackHint}
				<div class="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-left">
					<p class="text-sm font-semibold text-red-200 uppercase tracking-wide mb-1">Cómo identificarlo</p>
					<p class="text-sm text-slate-200 leading-relaxed">{feedbackHint}</p>
				</div>
			{/if}
			<p class="text-sm text-slate-400 mt-5">Toca para continuar</p>
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
