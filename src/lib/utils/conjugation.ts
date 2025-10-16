import type { Verb } from '$lib/types/verb';

export type ConjugationFormKey =
  | 'dictionary'
  | 'masu'
  | 'masuPast'
  | 'plainPast'
  | 'plainNegative'
  | 'te';

export interface ConjugationForm {
  key: ConjugationFormKey;
  label: string;
  kana: string;
  description: string;
  translation: string; // Nueva: traducción específica en español
}

type GodanEnding =
  | 'う'
  | 'つ'
  | 'る'
  | 'む'
  | 'ぶ'
  | 'ぬ'
  | 'く'
  | 'ぐ'
  | 'す';

const GODAN_RULES: Record<GodanEnding, {
  nai: string;
  masu: string;
  te: string;
  ta: string;
}> = {
  う: { nai: 'わ', masu: 'い', te: 'って', ta: 'った' },
  つ: { nai: 'た', masu: 'ち', te: 'って', ta: 'った' },
  る: { nai: 'ら', masu: 'り', te: 'って', ta: 'った' },
  む: { nai: 'ま', masu: 'み', te: 'んで', ta: 'んだ' },
  ぶ: { nai: 'ば', masu: 'び', te: 'んで', ta: 'んだ' },
  ぬ: { nai: 'な', masu: 'に', te: 'んで', ta: 'んだ' },
  く: { nai: 'か', masu: 'き', te: 'いて', ta: 'いた' },
  ぐ: { nai: 'が', masu: 'ぎ', te: 'いで', ta: 'いだ' },
  す: { nai: 'さ', masu: 'し', te: 'して', ta: 'した' }
};

function handleGodanExceptionTe(form: string, verb: Verb): string {
  if (verb.kana === 'いく') {
    return form.replace('いて', 'って');
  }
  return form;
}

function handleGodanExceptionTa(form: string, verb: Verb): string {
  if (verb.kana === 'いく') {
    return form.replace('いた', 'った');
  }
  return form;
}

function conjugateIchidan(kana: string) {
  const stem = kana.slice(0, -1);
  return {
    dictionary: kana,
    masu: `${stem}ます`,
    masuPast: `${stem}ました`,
    plainPast: `${stem}た`,
    plainNegative: `${stem}ない`,
    te: `${stem}て`
  };
}

function conjugateGodan(verb: Verb) {
  const kana = verb.kana;
  const ending = kana.slice(-1) as GodanEnding;
  const stem = kana.slice(0, -1);
  const rule = GODAN_RULES[ending];

  if (!rule) {
    return conjugateIchidan(kana);
  }

  const teForm = handleGodanExceptionTe(`${stem}${rule.te}`, verb);
  const taForm = handleGodanExceptionTa(`${stem}${rule.ta}`, verb);

  return {
    dictionary: kana,
    masu: `${stem}${rule.masu}ます`,
    masuPast: `${stem}${rule.masu}ました`,
    plainPast: taForm,
    plainNegative: `${stem}${rule.nai}ない`,
    te: teForm
  };
}

function conjugateIrregular(verb: Verb) {
  const kana = verb.kana;

  if (kana === 'する') {
    return {
      dictionary: 'する',
      masu: 'します',
      masuPast: 'しました',
      plainPast: 'した',
      plainNegative: 'しない',
      te: 'して'
    };
  }

  if (kana === 'くる' || kana === '来る') {
    return {
      dictionary: 'くる',
      masu: 'きます',
      masuPast: 'きました',
      plainPast: 'きた',
      plainNegative: 'こない',
      te: 'きて'
    };
  }

  return conjugateGodan(verb);
}

/**
 * Genera la traducción en español de una forma verbal conjugada
 * Intenta conjugar el verbo español según la forma japonesa
 */
function getTranslation(meaning: string, key: ConjugationFormKey): string {
  // Limpiar el significado (ej: "comer (algo)" -> "comer")
  const cleanMeaning = meaning.split('(')[0].trim().toLowerCase();
  
  switch (key) {
    case 'dictionary':
      return cleanMeaning; // "comer"
    
    case 'masu':
      // Presente formal - intentar conjugar en presente
      return conjugateToPresent(cleanMeaning); // "como/come"
    
    case 'masuPast':
      // Pasado formal
      return conjugateToPast(cleanMeaning); // "comí/comió"
    
    case 'plainPast':
      // Pasado informal
      return conjugateToPast(cleanMeaning); // "comí/comió"
    
    case 'plainNegative':
      // Negativo
      return `no ${conjugateToPresent(cleanMeaning)}`; // "no como/come"
    
    case 'te':
      // Forma て - gerundio o imperativo suave
      return conjugateToGerund(cleanMeaning); // "comiendo"
    
    default:
      return cleanMeaning;
  }
}

/**
 * Intenta conjugar un verbo español al presente
 */
function conjugateToPresent(verb: string): string {
  // Verbos en -ar
  if (verb.endsWith('ar')) {
    const stem = verb.slice(0, -2);
    return `${stem}o / ${stem}a`; // "como / come"
  }
  // Verbos en -er
  if (verb.endsWith('er')) {
    const stem = verb.slice(0, -2);
    return `${stem}o / ${stem}e`; // "bebo / bebe"
  }
  // Verbos en -ir
  if (verb.endsWith('ir')) {
    const stem = verb.slice(0, -2);
    return `${stem}o / ${stem}e`; // "vivo / vive"
  }
  return verb;
}

/**
 * Intenta conjugar un verbo español al pasado
 */
function conjugateToPast(verb: string): string {
  // Verbos en -ar
  if (verb.endsWith('ar')) {
    const stem = verb.slice(0, -2);
    return `${stem}é / ${stem}ó`; // "comí / comió"
  }
  // Verbos en -er o -ir
  if (verb.endsWith('er') || verb.endsWith('ir')) {
    const stem = verb.slice(0, -2);
    return `${stem}í / ${stem}ió`; // "bebí / bebió"
  }
  return verb;
}

/**
 * Intenta conjugar un verbo español al gerundio
 */
function conjugateToGerund(verb: string): string {
  // Verbos en -ar
  if (verb.endsWith('ar')) {
    const stem = verb.slice(0, -2);
    return `${stem}ando`; // "comiendo"
  }
  // Verbos en -er o -ir
  if (verb.endsWith('er') || verb.endsWith('ir')) {
    const stem = verb.slice(0, -2);
    return `${stem}iendo`; // "bebiendo", "viviendo"
  }
  return verb;
}

export function conjugateVerb(verb: Verb): ConjugationForm[] {
  let forms: ReturnType<typeof conjugateIchidan>;

  if (verb.type === 'ichidan') {
    forms = conjugateIchidan(verb.kana);
  } else if (verb.type === 'godan') {
    forms = conjugateGodan(verb);
  } else {
    forms = conjugateIrregular(verb);
  }

  const meaning = verb.meaning;

  const entries: ConjugationForm[] = [
    {
      key: 'dictionary',
      label: 'Forma diccionario (辞書形)',
      kana: forms.dictionary,
      description: `Uso neutro. Se traduce como "${meaning}".`,
      translation: getTranslation(meaning, 'dictionary')
    },
    {
      key: 'masu',
      label: 'Forma formal presente (ます形)',
      kana: forms.masu,
      description: `Modo formal en presente. Equivale a "${meaning}" con trato respetuoso.`,
      translation: getTranslation(meaning, 'masu')
    },
    {
      key: 'masuPast',
      label: 'Forma formal pasada (ました形)',
      kana: forms.masuPast,
      description: `Pasado formal: "${meaning}" en pasado con trato respetuoso.`,
      translation: getTranslation(meaning, 'masuPast')
    },
    {
      key: 'plainPast',
      label: 'Forma pasada informal (た形)',
      kana: forms.plainPast,
      description: `Pasado casual. Aproximadamente "${meaning}" en pasado.`,
      translation: getTranslation(meaning, 'plainPast')
    },
    {
      key: 'plainNegative',
      label: 'Forma negativa informal (ない形)',
      kana: forms.plainNegative,
      description: `Negación casual. Se entiende como "no ${meaning}".`,
      translation: getTranslation(meaning, 'plainNegative')
    },
    {
      key: 'te',
      label: 'Forma て (て形)',
      kana: forms.te,
      description: 'Usada para conectar acciones, solicitudes o progresivo.',
      translation: getTranslation(meaning, 'te')
    }
  ];

  return entries;
}
