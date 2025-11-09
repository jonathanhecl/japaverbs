import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Helper para obtener la fecha local en formato YYYY-MM-DD usando la zona horaria del cliente
export function getLocalDateString(date: Date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export interface DailyProgress {
	date: string;
	practiceCount: number;
	correctAnswers: number;
	totalQuestions: number;
	studyTimeMinutes: number;
	verbsReviewed: string[];
}

export interface PracticeSettings {
	questionsPerSession: number;
	autoReadVerbs: boolean;
	showTimer: boolean;
}

export interface UserProfile {
	name: string;
	createdAt: string;
	level: number;
	xp: number;
	streak: number;
	lastStudyDate: string;
	totalPractices: number;
	totalCorrect: number;
	totalQuestions: number;
	studiedVerbs: Record<string, { 
		lastStudied: string; 
		timesReviewed: number; 
		correctCount: number;
		incorrectCount: number;
		masteryScore: number; // -5 (muy difícil) a +10 (dominado completo)
		nextReviewDate: string; // Fecha para próxima revisión espaciada
	}>;
	dailyHistory: DailyProgress[];
	achievements: string[];
	practiceSettings: PracticeSettings;
}

const defaultProfile: UserProfile = {
	name: '',
	createdAt: new Date().toISOString(),
	level: 1,
	xp: 0,
	streak: 0,
	lastStudyDate: '',
	totalPractices: 0,
	totalCorrect: 0,
	totalQuestions: 0,
	studiedVerbs: {},
	dailyHistory: [],
	achievements: [],
	practiceSettings: {
		questionsPerSession: 10,
		autoReadVerbs: false,
		showTimer: false
	}
};

function createUserStore() {
	const stored = browser ? localStorage.getItem('userProfile') : null;
	const parsedProfile = stored ? JSON.parse(stored) : null;

	const initial: UserProfile = {
		...defaultProfile,
		...(parsedProfile ?? {}),
		studiedVerbs: {
			...defaultProfile.studiedVerbs,
			...(parsedProfile?.studiedVerbs ?? {})
		},
		dailyHistory: Array.isArray(parsedProfile?.dailyHistory) ? parsedProfile.dailyHistory : [],
		achievements: Array.isArray(parsedProfile?.achievements) ? parsedProfile.achievements : [],
		practiceSettings: {
			...defaultProfile.practiceSettings,
			...(parsedProfile?.practiceSettings ?? {})
		}
	};
	
	const { subscribe, set, update } = writable<UserProfile>(initial);

	const getSnapshot = () => {
		let currentValue = initial;
		const unsubscribe = subscribe((val) => {
			currentValue = val;
		});
		unsubscribe();
		return currentValue;
	};

	if (browser) {
		subscribe((val) => {
			localStorage.setItem('userProfile', JSON.stringify(val));
		});
	}

	return {
		subscribe,
		set,
		update,
		getCurrentProfile: () => Promise.resolve(getSnapshot()),
		importFromJson: (data: Partial<UserProfile>) => {
			if (!data || typeof data !== 'object') {
				throw new Error('Invalid profile data');
			}

			const sanitized: UserProfile = {
				...defaultProfile,
				...data,
				studiedVerbs: {
					...defaultProfile.studiedVerbs,
					...(data.studiedVerbs ?? {})
				},
				dailyHistory: Array.isArray(data.dailyHistory) ? data.dailyHistory : [],
				achievements: Array.isArray(data.achievements) ? data.achievements : [],
				practiceSettings: {
					...defaultProfile.practiceSettings,
					...(data.practiceSettings ?? {})
				}
			};

			set(sanitized);
			return sanitized;
		},
		updateName: (name: string) => update(profile => ({ ...profile, name })),
		addXP: (amount: number) => update(profile => {
			const newXP = profile.xp + amount;
			const newLevel = Math.floor(newXP / 100) + 1;
			return { ...profile, xp: newXP, level: newLevel };
		}),
		recordPractice: (verbId: string, correct: boolean, incrementSessionCount: boolean = true, difficultyMultiplier: number = 1) => update(profile => {
			const today = getLocalDateString();
			const studiedVerb = profile.studiedVerbs[verbId] || {
				lastStudied: today,
				timesReviewed: 0,
				correctCount: 0,
				incorrectCount: 0,
				masteryScore: 0,
				nextReviewDate: today
			};

			studiedVerb.timesReviewed++;
			studiedVerb.lastStudied = today;
			
			// Sistema de puntuación diferenciado por dificultad:
			// difficultyMultiplier varía según el tipo de práctica:
			// - Flashcards básicas: 0.5 (más fácil, menos puntos)
			// - Verb Type Quiz: 0.75
			// - Multiple Choice/Listening: 1.0 (estándar)
			// - Conjugation Flashcards: 1.5
			// - Conjugation Quiz/Inverse: 2.0 (más difícil, más puntos)
			// Al llegar a 10 puntos = Dominio completo
			if (correct) {
				studiedVerb.correctCount++;
				// Incrementar mastery score hasta máximo 10, aplicando el multiplicador de dificultad
				const pointsGained = difficultyMultiplier;
				studiedVerb.masteryScore = Math.min(10, studiedVerb.masteryScore + pointsGained);
			} else {
				studiedVerb.incorrectCount++;
				// Lógica de penalización más indulgente según nivel actual
				if (studiedVerb.masteryScore >= 8) {
					// Error desde dominio alto (8-10): baja 2 puntos (a nivel 6)
					studiedVerb.masteryScore = Math.max(6, studiedVerb.masteryScore - 2);
				} else if (studiedVerb.masteryScore >= 4) {
					// Error desde nivel medio (4-7): baja 1 punto
					studiedVerb.masteryScore = Math.max(0, studiedVerb.masteryScore - 1);
				} else if (studiedVerb.masteryScore >= 0) {
					// Error en nivel bajo (0-3): baja 0.5 puntos (más indulgente al aprender)
					studiedVerb.masteryScore = Math.max(-5, studiedVerb.masteryScore - 0.5);
				} else {
					// Error en nivel negativo: baja 1 punto (necesita repaso urgente)
					studiedVerb.masteryScore = Math.max(-5, studiedVerb.masteryScore - 1);
				}
			}

			// Calcular próxima fecha de revisión usando repetición espaciada
			// Intervalos basados en mastery score (escala de -5 a 10):
			// -5 a -3: 0 días (revisar inmediatamente)
			// -2 a -1: 1 día
			// 0-1: 2 días
			// 2-3: 4 días
			// 4-5: 7 días
			// 6-7: 14 días
			// 8-9: 21 días
			// 10: 30 días (máximo dominio)
			const intervalDays = studiedVerb.masteryScore <= -3 ? 0 :
				studiedVerb.masteryScore <= -1 ? 1 :
				studiedVerb.masteryScore <= 1 ? 2 :
				studiedVerb.masteryScore <= 3 ? 4 :
				studiedVerb.masteryScore <= 5 ? 7 :
				studiedVerb.masteryScore <= 7 ? 14 :
				studiedVerb.masteryScore <= 9 ? 21 : 30;
			
			const nextDate = new Date();
			nextDate.setDate(nextDate.getDate() + intervalDays);
			studiedVerb.nextReviewDate = getLocalDateString(nextDate);

			let newStreak = 1;
			if (profile.lastStudyDate) {
				const yesterday = getLocalDateString(new Date(Date.now() - 86400000));
				if (profile.lastStudyDate === today) {
					newStreak = profile.streak;
				} else if (profile.lastStudyDate === yesterday) {
					newStreak = profile.streak + 1;
				}
			}

			let dailyProgress = profile.dailyHistory.find(d => d.date === today);
			if (!dailyProgress) {
				dailyProgress = {
					date: today,
					practiceCount: 0,
					correctAnswers: 0,
					totalQuestions: 0,
					studyTimeMinutes: 0,
					verbsReviewed: []
				};
				profile.dailyHistory.push(dailyProgress);
			}

			dailyProgress.totalQuestions++;
			if (correct) dailyProgress.correctAnswers++;
			if (!dailyProgress.verbsReviewed.includes(verbId)) {
				dailyProgress.verbsReviewed.push(verbId);
			}

			return {
				...profile,
				studiedVerbs: { ...profile.studiedVerbs, [verbId]: studiedVerb },
				totalPractices: incrementSessionCount ? profile.totalPractices + 1 : profile.totalPractices,
				totalCorrect: profile.totalCorrect + (correct ? 1 : 0),
				totalQuestions: profile.totalQuestions + 1,
				lastStudyDate: today,
				streak: newStreak,
				dailyHistory: profile.dailyHistory.slice(-90) // Keep last 90 days
			};
		}),
		addAchievement: (achievementId: string) => update(profile => {
			if (!profile.achievements.includes(achievementId)) {
				return { ...profile, achievements: [...profile.achievements, achievementId] };
			}
			return profile;
		}),
		updatePracticeSettings: (partial: Partial<PracticeSettings>) => update(profile => ({
			...profile,
			practiceSettings: {
				...profile.practiceSettings,
				...partial
			}
		})),
		reset: () => set(defaultProfile),
		
		// Export/Import Methods
		exportToJson: async (): Promise<string> => {
			const currentProfile = getSnapshot();
			return JSON.stringify(currentProfile, null, 2);
		},
		
		downloadBackup: async () => {
			if (!browser) return;
			
			try {
				const currentProfile = getSnapshot();
				
				const json = JSON.stringify(currentProfile, null, 2);
				const blob = new Blob([json], { type: 'application/json' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				const timestamp = getLocalDateString();
				a.href = url;
				a.download = `japaverbs-backup-${timestamp}.json`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			} catch (error) {
				console.error('Export error:', error);
				throw error;
			}
		}
	};
}

export const userProfile = createUserStore();

// Helper para calcular porcentaje de dominio de un verbo
// masteryScore va de -5 a +10, lo convertimos a 0-100%
export function getMasteryPercentage(masteryScore: number): number {
	return Math.round(((masteryScore + 5) / 15) * 100);
}

// Helper para obtener el nivel de dominio (escala de -5 a 10)
export function getMasteryLevel(masteryScore: number): { label: string; color: string } {
	if (masteryScore <= -3) return { label: 'Muy difícil', color: 'text-red-400' };
	if (masteryScore <= -1) return { label: 'Difícil', color: 'text-orange-400' };
	if (masteryScore <= 1) return { label: 'Nuevo', color: 'text-slate-400' };
	if (masteryScore <= 3) return { label: 'Aprendiendo', color: 'text-yellow-400' };
	if (masteryScore <= 5) return { label: 'Progresando', color: 'text-yellow-300' };
	if (masteryScore <= 7) return { label: 'Bueno', color: 'text-blue-400' };
	if (masteryScore <= 9) return { label: 'Casi dominado', color: 'text-green-300' };
	return { label: 'Dominado', color: 'text-green-400' };
}
