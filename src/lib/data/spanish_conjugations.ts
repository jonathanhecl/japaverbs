import type { SpanishConjugation } from '$lib/types/verb';
import conj_n5_0_es from './conj_n5_0_es.json';
import conj_n5_1_es from './conj_n5_1_es.json';

// Unificar todas las conjugaciones en español
const allSpanishConjugations: SpanishConjugation[] = [
	...conj_n5_0_es,
	...conj_n5_1_es
];

// Crear un mapa para búsqueda rápida por kanji
const conjugationMap = new Map<string, SpanishConjugation>();
allSpanishConjugations.forEach(conj => {
	conjugationMap.set(conj.kanji, conj);
});

/**
 * Obtiene la conjugación en español para un verbo por su kanji
 */
export function getSpanishConjugation(kanji: string): SpanishConjugation | undefined {
	return conjugationMap.get(kanji);
}

/**
 * Obtiene todas las conjugaciones en español
 */
export function getAllSpanishConjugations(): SpanishConjugation[] {
	return allSpanishConjugations;
}

export default allSpanishConjugations;
