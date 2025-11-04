export interface VerbExample {
	ja: string;
	es: string;
}

export interface VerbTranslation {
	meaning: string;
	examples: VerbExample[];
}

export interface VerbBase {
	kanji: string;
	kana: string;
	romaji: string;
	type: 'godan' | 'ichidan' | 'irregular';
	freq?: 'high' | 'medium' | 'low';
}

export interface Verb extends VerbBase {
	'meaning-es': string;
	examples: VerbExample[];
	transitivity?: 'transitive' | 'intransitive' | 'both';
	tags?: string[];
}

export interface VerbWithTranslation extends VerbBase {
	translation: VerbTranslation;
	transitivity?: 'transitive' | 'intransitive' | 'both';
	tags?: string[];
}

export type ConjugationFormKey =
  // Formal (ます形)
  | 'masuPresent'        // Presente afirmativo formal
  | 'masuPresentNegative' // Presente negativo formal  
  | 'masuPast'           // Pasado afirmativo formal
  | 'masuPastNegative'   // Pasado negativo formal
  | 'invitation'         // ～ましょう / ～ませんか
  | 'desireFormal'       // ～たいです
  | 'permission'         // ～てもいいです
  | 'prohibition'        // ～てはいけません
  | 'progressiveFormal'  // ～ています
  
  // Informal (普通形)
  | 'dictionary'         // Presente/futuro afirmativo informal
  | 'plainNegative'      // Presente/futuro negativo informal
  | 'plainPast'          // Pasado afirmativo informal
  | 'plainPastNegative'  // Pasado negativo informal
  | 'desireInformal'     // ～たい
  | 'invitationInformal' // ～よう
  | 'request'            // ～て
  | 'negativeRequest'    // ～ないで
  | 'progressiveInformal'// ～ている;

export type VerbType = 'godan' | 'ichidan' | 'irregular';

export interface SpanishConjugation {
	kanji: string;
	// Formales (ます形)
	masuPresent: string;           // Presente afirmativo formal
	masuPresentNegative: string;   // Presente negativo formal
	masuPast: string;              // Pasado afirmativo formal
	masuPastNegative: string;      // Pasado negativo formal
	invitation: string;            // ～ましょう / ～ませんか
	desireFormal: string;          // ～たいです
	permission: string;            // ～てもいいです
	prohibition: string;           // ～てはいけません
	progressiveFormal: string;     // ～ています
	
	// Informales (普通形)
	dictionary: string;            // Presente/futuro afirmativo informal
	plainNegative: string;         // Presente/futuro negativo informal
	plainPast: string;             // Pasado afirmativo informal
	plainPastNegative: string;     // Pasado negativo informal
	desireInformal: string;        // ～たい
	invitationInformal: string;    // ～よう
	request: string;               // ～て
	negativeRequest: string;       // ～ないで
	progressiveInformal: string;   // ～ている
}
