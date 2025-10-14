export interface VerbExample {
	ja: string;
	es: string;
}

export interface Verb {
	kanji: string;
	kana: string;
	romaji: string;
	type: 'godan' | 'ichidan' | 'irregular';
	meaning: string;
	examples: VerbExample[];
	transitivity?: 'transitive' | 'intransitive' | 'both';
	frequency?: 'high' | 'medium' | 'low';
	tags?: string[];
}

export type VerbType = 'godan' | 'ichidan' | 'irregular';
