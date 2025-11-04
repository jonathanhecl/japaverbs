import { getVerbsWithTranslations, preloadTranslations } from './verbsNew';
import type { VerbWithTranslation } from '$lib/types/verb';
import { languageStore } from '$lib/stores/language';

// Variable para almacenar los verbos cargados
let loadedVerbs: VerbWithTranslation[] = [];

// Función asíncrona para inicializar los verbos
async function initializeVerbs() {
	await preloadTranslations('es');
	loadedVerbs = await getVerbsWithTranslations('es');
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
	return loadedVerbs;
}

// Mantener compatibilidad con export default (pero será array vacío hasta que cargue)
export default loadedVerbs;
