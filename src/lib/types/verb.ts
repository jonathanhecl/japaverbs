export interface VerbExample {
	ja: string;
	es: string;
}

export interface Verb {
	kanji: string;
	kana: string;
	romaji: string;
	type: 'godan' | 'ichidan' | 'irregular';
	'meaning-es': string;
	freq?: 'high' | 'medium' | 'low';
	examples: VerbExample[];
	transitivity?: 'transitive' | 'intransitive' | 'both';
	tags?: string[];
}

export type VerbType = 'godan' | 'ichidan' | 'irregular';

export interface SpanishConjugation {
	kanji: string;
	base: string;      // forma diccionario
	masu: string;      // forma ます (presente formal)
	ta: string;        // forma た (pasado)
	te: string;        // forma て (gerundio)
	nai: string;       // forma ない (negativo)
	mashita: string;   // forma ました (pasado formal)
}
