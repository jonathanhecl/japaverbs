import { getVerbsWithTranslations, preloadTranslations } from './verbsNew';
import type { VerbWithTranslation } from '$lib/types/verb';
import { languageStore } from '$lib/stores/language';

// Variable para almacenar los verbos cargados
let loadedVerbs: VerbWithTranslation[] = [];

// Función asíncrona para inicializar los verbos
async function initializeVerbs() {
	console.log('🔄 Inicializando verbos en español...');
	try {
		await preloadTranslations('es');
		loadedVerbs = await getVerbsWithTranslations('es');
		console.log('✅ Verbos cargados:', loadedVerbs.length, 'verbos');
		if (loadedVerbs.length === 0) {
			console.error('❌ ERROR: No se cargaron verbos. Revisar JSONs.');
		}
	} catch (error) {
		console.error('❌ ERROR al inicializar verbos:', error);
	}
}

// Inicializar inmediatamente
initializeVerbs();

// Escuchar cambios de idioma y recargar
languageStore.subscribe(async (language) => {
	await preloadTranslations(language);
	loadedVerbs = await getVerbsWithTranslations(language);
});

// Exportar función para obtener verbos actualizados
export function getCurrentVerbs(): VerbWithTranslation[] {
	console.log('📊 getCurrentVerbs() llamado, devuelve:', loadedVerbs.length, 'verbos');
	if (loadedVerbs.length === 0) {
		console.warn('⚠️ ADVERTENCIA: getCurrentVerbs() devuelve array vacío');
	}
	return loadedVerbs;
}

// Mantener compatibilidad con export default (pero será array vacío hasta que cargue)
export default loadedVerbs;
