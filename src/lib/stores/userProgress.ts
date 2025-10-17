import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import {
	initGoogleDrive,
	requestGoogleAuth,
	revokeGoogleAuth,
	isAuthenticated,
	saveProgressToDrive,
	loadProgressFromDrive,
	deleteProgressFromDrive
} from '$lib/utils/googleDrive';

export interface DailyProgress {
	date: string;
	practiceCount: number;
	correctAnswers: number;
	totalQuestions: number;
	studyTimeMinutes: number;
	verbsReviewed: string[];
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
	achievements: []
};

function createUserStore() {
	const stored = browser ? localStorage.getItem('userProfile') : null;
	const initial = stored ? { ...defaultProfile, ...JSON.parse(stored) } : defaultProfile;
	
	const { subscribe, set, update } = writable<UserProfile>(initial);

	if (browser) {
		subscribe((val) => {
			localStorage.setItem('userProfile', JSON.stringify(val));
		});
	}

	return {
		subscribe,
		set,
		update,
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
			
			// Sistema de puntuación: +1 por correcto, -2 por incorrecto
			// Rango: -5 (muy difícil) a +5 (dominado)
			if (correct) {
				studiedVerb.correctCount++;
				studiedVerb.masteryScore = Math.min(5, studiedVerb.masteryScore + 1);
			} else {
				studiedVerb.incorrectCount++;
				studiedVerb.masteryScore = Math.max(-5, studiedVerb.masteryScore - 2);
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
		reset: () => set(defaultProfile),
		
		// Google Drive Sync Methods
		syncWithDrive: async () => {
			if (!browser) return { success: false, message: 'Not in browser' };
			
			try {
				const currentProfile = await new Promise<UserProfile>((resolve) => {
					const unsubscribe = subscribe((val) => {
						unsubscribe();
						resolve(val);
					});
				});
				
				if (!currentProfile) {
					return { success: false, message: 'No profile data' };
				}
				
				await saveProgressToDrive(currentProfile);
				return { success: true, message: 'Progreso sincronizado con Google Drive' };
			} catch (error) {
				console.error('Sync error:', error);
				return { success: false, message: error instanceof Error ? error.message : 'Error al sincronizar' };
			}
		},
		
		loadFromDrive: async () => {
			if (!browser) return { success: false, message: 'Not in browser' };
			
			try {
				const driveProfile = await loadProgressFromDrive();
				
				if (!driveProfile) {
					return { success: false, message: 'No se encontró progreso en Google Drive' };
				}
				
				// Merge with current profile (keep the most recent data)
				const currentProfile = await new Promise<UserProfile>((resolve) => {
					const unsubscribe = subscribe((val) => {
						unsubscribe();
						resolve(val);
					});
				});
				
				if (currentProfile && currentProfile.lastStudyDate > driveProfile.lastStudyDate) {
					// Local is more recent, ask user before overwriting
					return { 
						success: false, 
						message: 'El progreso local es más reciente. ¿Deseas sobrescribirlo?',
						data: driveProfile 
					};
				}
				
				set(driveProfile);
				return { success: true, message: 'Progreso cargado desde Google Drive' };
			} catch (error) {
				console.error('Load error:', error);
				return { success: false, message: error instanceof Error ? error.message : 'Error al cargar' };
			}
		},
		
		forceLoadFromDrive: async () => {
			if (!browser) return { success: false, message: 'Not in browser' };
			
			try {
				const driveProfile = await loadProgressFromDrive();
				
				if (!driveProfile) {
					return { success: false, message: 'No se encontró progreso en Google Drive' };
				}
				
				set(driveProfile);
				return { success: true, message: 'Progreso cargado desde Google Drive' };
			} catch (error) {
				console.error('Load error:', error);
				return { success: false, message: error instanceof Error ? error.message : 'Error al cargar' };
			}
		},
		
		deleteFromDrive: async () => {
			if (!browser) return { success: false, message: 'Not in browser' };
			
			try {
				await deleteProgressFromDrive();
				return { success: true, message: 'Progreso eliminado de Google Drive' };
			} catch (error) {
				console.error('Delete error:', error);
				return { success: false, message: error instanceof Error ? error.message : 'Error al eliminar' };
			}
		}
	};
}

// Google Drive Auth helpers
export const googleDriveAuth = {
	init: initGoogleDrive,
	login: requestGoogleAuth,
	logout: revokeGoogleAuth,
	isAuthenticated
};

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
