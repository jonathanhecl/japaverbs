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
