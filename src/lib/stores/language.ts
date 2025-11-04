import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type SupportedLanguage = 'es' | 'en' | 'fr' | 'de' | 'pt' | 'it';

export interface LanguageConfig {
	code: SupportedLanguage;
	name: string;
	flag: string;
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
	es: { code: 'es', name: 'Español', flag: '🇪🇸' },
	en: { code: 'en', name: 'English', flag: '🇺🇸' },
	fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
	de: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
	pt: { code: 'pt', name: 'Português', flag: '🇵🇹' },
	it: { code: 'it', name: 'Italiano', flag: '🇮🇹' }
};

const DEFAULT_LANGUAGE: SupportedLanguage = 'es';

// Obtener idioma desde localStorage o del navegador
function getInitialLanguage(): SupportedLanguage {
	if (!browser) return DEFAULT_LANGUAGE;
	
	// 1. Verificar si hay idioma guardado
	const stored = localStorage.getItem('japaverbs-language');
	if (stored && Object.keys(SUPPORTED_LANGUAGES).includes(stored)) {
		return stored as SupportedLanguage;
	}
	
	// 2. Detectar idioma del navegador
	const browserLang = navigator.language.split('-')[0];
	if (Object.keys(SUPPORTED_LANGUAGES).includes(browserLang)) {
		return browserLang as SupportedLanguage;
	}
	
	// 3. Usar idioma por defecto
	return DEFAULT_LANGUAGE;
}

function createLanguageStore() {
	const initial = getInitialLanguage();
	const { subscribe, set, update } = writable<SupportedLanguage>(initial);

	if (browser) {
		// Sincronizar con localStorage
		subscribe((value) => {
			localStorage.setItem('japaverbs-language', value);
		});
	}

	return {
		subscribe,
		set: (language: SupportedLanguage) => {
			if (Object.keys(SUPPORTED_LANGUAGES).includes(language)) {
				set(language);
			} else {
				console.warn(`Unsupported language: ${language}`);
			}
		},
		changeLanguage: (language: SupportedLanguage) => {
			set(language);
		},
		reset: () => set(DEFAULT_LANGUAGE),
		getCurrent: (): SupportedLanguage => {
			let current = initial;
			const unsubscribe = subscribe((value) => {
				current = value;
			});
			unsubscribe();
			return current;
		}
	};
}

export const languageStore = createLanguageStore();

// Helper para obtener el archivo de traducciones según el idioma
export function getTranslationFilePath(language: SupportedLanguage): string {
	return `/src/lib/data/verbs_translations_${language}.json`;
}

// Helper para verificar si un idioma tiene traducciones disponibles
export function isLanguageAvailable(language: SupportedLanguage): boolean {
	// Por ahora, todos los idiomas están "disponibles" pero podríamos
	// verificar si el archivo existe realmente
	return Object.keys(SUPPORTED_LANGUAGES).includes(language);
}
