import verbsPart0 from './verbs_n5_0.json';
import verbsPart1 from './verbs_n5_1.json';
import type { Verb } from '$lib/types/verb';

// Combinar ambos archivos JSON en un solo array
const allVerbs: Verb[] = [...verbsPart0, ...verbsPart1] as Verb[];

export default allVerbs;
