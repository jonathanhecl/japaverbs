import { writable } from 'svelte/store';
import { browser } from '$app/environment';

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
		masteryScore: number; // -5 (muy difícil) a +5 (dominado)
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
		recordPractice: (verbId: string, correct: boolean) => update(profile => {
			const today = new Date().toISOString().split('T')[0];
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
			
			// Sistema de puntuación: +1 por correcto, -1 por incorrecto
			// Rango: -5 (muy difícil) a +5 (dominado)
			if (correct) {
				studiedVerb.correctCount++;
				studiedVerb.masteryScore = Math.min(5, studiedVerb.masteryScore + 1);
			} else {
				studiedVerb.incorrectCount++;
				studiedVerb.masteryScore = Math.max(-5, studiedVerb.masteryScore - 1);
			}

			// Calcular próxima fecha de revisión usando repetición espaciada
			// Intervalos basados en mastery score:
			// -5 a -3: 0 días (revisar inmediatamente)
			// -2 a -1: 1 día
			// 0: 2 días
			// 1: 3 días
			// 2: 5 días
			// 3: 8 días
			// 4: 13 días
			// 5: 21 días
			const intervalDays = studiedVerb.masteryScore <= -3 ? 0 :
				studiedVerb.masteryScore === -2 ? 1 :
				studiedVerb.masteryScore === -1 ? 1 :
				studiedVerb.masteryScore === 0 ? 2 :
				studiedVerb.masteryScore === 1 ? 3 :
				studiedVerb.masteryScore === 2 ? 5 :
				studiedVerb.masteryScore === 3 ? 8 :
				studiedVerb.masteryScore === 4 ? 13 : 21;
			
			const nextDate = new Date();
			nextDate.setDate(nextDate.getDate() + intervalDays);
			studiedVerb.nextReviewDate = nextDate.toISOString().split('T')[0];

			let newStreak = 1;
			if (profile.lastStudyDate) {
				const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
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
				totalPractices: profile.totalPractices + 1,
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
				const timestamp = new Date().toISOString().split('T')[0];
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
// masteryScore va de -5 a +5, lo convertimos a 0-100%
export function getMasteryPercentage(masteryScore: number): number {
	return Math.round(((masteryScore + 5) / 10) * 100);
}

// Helper para obtener el nivel de dominio
export function getMasteryLevel(masteryScore: number): { label: string; color: string } {
	if (masteryScore <= -3) return { label: 'Muy difícil', color: 'text-red-400' };
	if (masteryScore <= -1) return { label: 'Difícil', color: 'text-orange-400' };
	if (masteryScore === 0) return { label: 'Nuevo', color: 'text-slate-400' };
	if (masteryScore <= 2) return { label: 'Aprendiendo', color: 'text-yellow-400' };
	if (masteryScore <= 4) return { label: 'Bueno', color: 'text-blue-400' };
	return { label: 'Dominado', color: 'text-green-400' };
}
