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
				incorrectCount: 0
			};

			studiedVerb.timesReviewed++;
			studiedVerb.lastStudied = today;
			if (correct) {
				studiedVerb.correctCount++;
			} else {
				studiedVerb.incorrectCount++;
			}

			const newStreak = profile.lastStudyDate === today || 
				new Date(profile.lastStudyDate).toISOString().split('T')[0] === 
				new Date(Date.now() - 86400000).toISOString().split('T')[0]
				? profile.streak + (profile.lastStudyDate !== today ? 1 : 0)
				: 1;

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
		reset: () => set(defaultProfile)
	};
}

export const userProfile = createUserStore();
