import type { Verb } from '$lib/types/verb';
import { getSpanishConjugation } from '$lib/data/spanish_conjugations';

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
 * Obtiene la traducción en español de una forma verbal conjugada desde los JSONs
 */
function getTranslation(kanji: string, key: ConjugationFormKey, fallbackMeaning: string): string {
  const spanishConj = getSpanishConjugation(kanji);
  
  if (!spanishConj) {
    // Fallback al significado básico si no hay conjugación en el JSON
    return fallbackMeaning.split('(')[0].trim().toLowerCase();
  }
  
  switch (key) {
    case 'dictionary':
      return spanishConj.base;
    
    case 'masu':
      return spanishConj.masu;
    
    case 'masuPast':
      return spanishConj.mashita;
    
    case 'plainPast':
      return spanishConj.ta;
    
    case 'plainNegative':
      return spanishConj.nai;
    
    case 'te':
      return spanishConj.te;
    
    default:
      return spanishConj.base;
  }
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

  const meaning = verb['meaning-es'];
  const kanji = verb.kanji;

  const entries: ConjugationForm[] = [
    {
      key: 'dictionary',
      label: 'Forma diccionario (辞書形)',
      kana: forms.dictionary,
      description: `Uso neutro. Se traduce como "${meaning}".`,
      translation: getTranslation(kanji, 'dictionary', meaning)
    },
    {
      key: 'masu',
      label: 'Forma formal presente (ます形)',
      kana: forms.masu,
      description: `Modo formal en presente. Equivale a "${meaning}" con trato respetuoso.`,
      translation: getTranslation(kanji, 'masu', meaning)
    },
    {
      key: 'masuPast',
      label: 'Forma formal pasada (ました形)',
      kana: forms.masuPast,
      description: `Pasado formal: "${meaning}" en pasado con trato respetuoso.`,
      translation: getTranslation(kanji, 'masuPast', meaning)
    },
    {
      key: 'plainPast',
      label: 'Forma pasada informal (た形)',
      kana: forms.plainPast,
      description: `Pasado casual. Aproximadamente "${meaning}" en pasado.`,
      translation: getTranslation(kanji, 'plainPast', meaning)
    },
    {
      key: 'plainNegative',
      label: 'Forma negativa informal (ない形)',
      kana: forms.plainNegative,
      description: `Negación casual. Se entiende como "no ${meaning}".`,
      translation: getTranslation(kanji, 'plainNegative', meaning)
    },
    {
      key: 'te',
      label: 'Forma て (て形)',
      kana: forms.te,
      description: 'Usada para conectar acciones, solicitudes o progresivo.',
      translation: getTranslation(kanji, 'te', meaning)
    }
  ];

  return entries;
}
