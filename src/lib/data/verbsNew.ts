import verbsPart0 from './verbs_n5_0_clean.json';
import verbsPart1 from './verbs_n5_1_clean.json';
import spanishTranslations from './verbs_translations_es.json';
import type { VerbBase, VerbWithTranslation, VerbTranslation } from '$lib/types/verb';
import type { SupportedLanguage } from '$lib/stores/language';
import { languageStore } from '$lib/stores/language';

// Cache para traducciones cargadas
const translationCache = new Map<SupportedLanguage, Record<string, VerbTranslation>>();

// Cargar traducción en español por defecto
translationCache.set('es', spanishTranslations);

// Combinar ambos archivos JSON en un solo array de verbos base
const baseVerbs: VerbBase[] = [...verbsPart0, ...verbsPart1] as VerbBase[];

/**
 * Carga las traducciones para un idioma específico
 */
async function loadTranslations(language: SupportedLanguage): Promise<Record<string, VerbTranslation>> {
	// Verificar cache primero
	if (translationCache.has(language)) {
		return translationCache.get(language)!;
	}

	try {
		// Import dinámico del archivo de traducciones
		const translationsModule = await import(`./verbs_translations_${language}.json`);
		const translations = translationsModule.default as Record<string, VerbTranslation>;
		
		// Guardar en cache
		translationCache.set(language, translations);
		
		return translations;
	} catch (error) {
		console.warn(`No se pudieron cargar las traducciones para ${language}:`, error);
		
		// Si no hay traducciones para el idioma solicitado, intentar con español
		if (language !== 'es') {
			console.warn('Cargando traducciones en español como fallback');
			return loadTranslations('es');
		}
		
		// Si ni siquiera hay español, devolver objeto vacío
		return {};
	}
}

/**
 * Combina los verbos base con sus traducciones
 */
function combineVerbsWithTranslations(
	base: VerbBase[], 
	translations: Record<string, VerbTranslation>
): VerbWithTranslation[] {
	return base.map(verb => {
		const translation = translations[verb.kanji];
		
		if (!translation) {
			console.warn(`No se encontró traducción para el verbo: ${verb.kanji}`);
			// Devolver verbo con traducción vacía
			return {
				...verb,
				translation: {
					meaning: '',
					examples: []
				}
			};
		}

		return {
			...verb,
			translation
		};
	});
}

/**
 * Obtiene los verbos con traducciones para el idioma actual
 */
export async function getVerbsWithTranslations(language?: SupportedLanguage): Promise<VerbWithTranslation[]> {
	const targetLanguage = language || languageStore.getCurrent();
	
	// Cargar traducciones
	const translations = await loadTranslations(targetLanguage);
	
	// Combinar con verbos base
	return combineVerbsWithTranslations(baseVerbs, translations);
}

/**
 * Obtiene los verbos con traducciones (versión síncrona para compatibilidad)
 * Usa las traducciones en cache si están disponibles
 */
export function getVerbsWithTranslationsSync(language?: SupportedLanguage): VerbWithTranslation[] {
	const targetLanguage = language || languageStore.getCurrent();
	
	// Verificar si tenemos traducciones en cache
	if (!translationCache.has(targetLanguage)) {
		console.warn(`Las traducciones para ${targetLanguage} no están cargadas. Usa getVerbsWithTranslations() primero.`);
		// Devolver verbos con traducciones vacías como fallback
		return baseVerbs.map(verb => ({
			...verb,
			translation: { meaning: '', examples: [] }
		}));
	}
	
	const translations = translationCache.get(targetLanguage)!;
	return combineVerbsWithTranslations(baseVerbs, translations);
}

/**
 * Precarga las traducciones para un idioma
 */
export async function preloadTranslations(language: SupportedLanguage): Promise<void> {
	await loadTranslations(language);
}

/**
 * Limpia el cache de traducciones
 */
export function clearTranslationCache(): void {
	translationCache.clear();
}

/**
 * Obtiene los verbos base sin traducciones (para uso interno)
 */
export function getBaseVerbs(): VerbBase[] {
	return [...baseVerbs];
}

/**
 * Busca un verbo específico por su kanji
 */
export async function findVerbByKanji(kanji: string, language?: SupportedLanguage): Promise<VerbWithTranslation | null> {
	const verbs = await getVerbsWithTranslations(language);
	return verbs.find(verb => verb.kanji === kanji) || null;
}

/**
 * Filtra verbos por tipo
 */
export async function getVerbsByType(type: 'godan' | 'ichidan' | 'irregular', language?: SupportedLanguage): Promise<VerbWithTranslation[]> {
	const verbs = await getVerbsWithTranslations(language);
	return verbs.filter(verb => verb.type === type);
}

/**
 * Filtra verbos por frecuencia
 */
export async function getVerbsByFrequency(freq: 'high' | 'medium' | 'low', language?: SupportedLanguage): Promise<VerbWithTranslation[]> {
	const verbs = await getVerbsWithTranslations(language);
	return verbs.filter(verb => verb.freq === freq);
}

// Exportar los verbos combinados con traducciones en español por defecto
// Para mantener compatibilidad con el código existente
export default getVerbsWithTranslationsSync();
