import type { Verb } from '$lib/types/verb';
import { getSpanishConjugation } from '$lib/data/spanish_conjugations';

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
    // Formales (ます形)
    masuPresent: `${stem}ます`,
    masuPresentNegative: `${stem}ません`,
    masuPast: `${stem}ました`,
    masuPastNegative: `${stem}ませんでした`,
    invitation: `${stem}ましょう`,
    desireFormal: `${stem}たいです`,
    permission: `${stem}てもいいです`,
    prohibition: `${stem}てはいけません`,
    progressiveFormal: `${stem}ています`,
    
    // Informales (普通形)
    dictionary: kana,
    plainNegative: `${stem}ない`,
    plainPast: `${stem}た`,
    plainPastNegative: `${stem}なかった`,
    desireInformal: `${stem}たい`,
    invitationInformal: `${stem}よう`,
    request: `${stem}て`,
    negativeRequest: `${stem}ないで`,
    progressiveInformal: `${stem}ている`
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
    // Formales (ます形)
    masuPresent: `${stem}${rule.masu}ます`,
    masuPresentNegative: `${stem}${rule.masu}ません`,
    masuPast: `${stem}${rule.masu}ました`,
    masuPastNegative: `${stem}${rule.masu}ませんでした`,
    invitation: `${stem}${rule.masu}ましょう`,
    desireFormal: `${stem}${rule.masu}たいです`,
    permission: `${stem}${rule.te}もいいです`,
    prohibition: `${stem}${rule.te}はいけません`,
    progressiveFormal: `${stem}${rule.te}います`,
    
    // Informales (普通形)
    dictionary: kana,
    plainNegative: `${stem}${rule.nai}ない`,
    plainPast: taForm,
    plainPastNegative: `${stem}${rule.nai}なかった`,
    desireInformal: `${stem}${rule.masu}たい`,
    invitationInformal: `${stem}${rule.masu}よう`,
    request: teForm,
    negativeRequest: `${stem}${rule.nai}ないで`,
    progressiveInformal: `${stem}${rule.te}いる`
  };
}

function conjugateIrregular(verb: Verb) {
  const kana = verb.kana;

  if (kana === 'する') {
    return {
      // Formales (ます形)
      masuPresent: 'します',
      masuPresentNegative: 'しません',
      masuPast: 'しました',
      masuPastNegative: 'しませんでした',
      invitation: 'しましょう',
      desireFormal: 'したいです',
      permission: 'してもいいです',
      prohibition: 'してはいけません',
      progressiveFormal: 'しています',
      
      // Informales (普通形)
      dictionary: 'する',
      plainNegative: 'しない',
      plainPast: 'した',
      plainPastNegative: 'しなかった',
      desireInformal: 'したい',
      invitationInformal: 'しよう',
      request: 'して',
      negativeRequest: 'しないで',
      progressiveInformal: 'している'
    };
  }

  if (kana === 'くる' || kana === '来る') {
    return {
      // Formales (ます形)
      masuPresent: 'きます',
      masuPresentNegative: 'きません',
      masuPast: 'きました',
      masuPastNegative: 'きませんでした',
      invitation: 'きましょう',
      desireFormal: 'きたいです',
      permission: 'きてもいいです',
      prohibition: 'きてはいけません',
      progressiveFormal: 'きています',
      
      // Informales (普通形)
      dictionary: 'くる',
      plainNegative: 'こない',
      plainPast: 'きた',
      plainPastNegative: 'こなかった',
      desireInformal: 'きたい',
      invitationInformal: 'こよう',
      request: 'きて',
      negativeRequest: 'こないで',
      progressiveInformal: 'きている'
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
    // Formales (ます形)
    case 'masuPresent':
      return spanishConj.masuPresent;
    case 'masuPresentNegative':
      return spanishConj.masuPresentNegative;
    case 'masuPast':
      return spanishConj.masuPast;
    case 'masuPastNegative':
      return spanishConj.masuPastNegative;
    case 'invitation':
      return spanishConj.invitation;
    case 'desireFormal':
      return spanishConj.desireFormal;
    case 'permission':
      return spanishConj.permission;
    case 'prohibition':
      return spanishConj.prohibition;
    case 'progressiveFormal':
      return spanishConj.progressiveFormal;
    
    // Informales (普通形)
    case 'dictionary':
      return spanishConj.dictionary;
    case 'plainNegative':
      return spanishConj.plainNegative;
    case 'plainPast':
      return spanishConj.plainPast;
    case 'plainPastNegative':
      return spanishConj.plainPastNegative;
    case 'desireInformal':
      return spanishConj.desireInformal;
    case 'invitationInformal':
      return spanishConj.invitationInformal;
    case 'request':
      return spanishConj.request;
    case 'negativeRequest':
      return spanishConj.negativeRequest;
    case 'progressiveInformal':
      return spanishConj.progressiveInformal;
    
    default:
      return spanishConj.dictionary;
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
    // Formales (ます形)
    {
      key: 'masuPresent',
      label: 'Presente afirmativo formal (ます)',
      kana: forms.masuPresent,
      description: `Forma cortés en presente: "${meaning}"`,
      translation: getTranslation(kanji, 'masuPresent', meaning)
    },
    {
      key: 'masuPresentNegative',
      label: 'Presente negativo formal (ません)',
      kana: forms.masuPresentNegative,
      description: `Forma cortés negativa: "no ${meaning}"`,
      translation: getTranslation(kanji, 'masuPresentNegative', meaning)
    },
    {
      key: 'masuPast',
      label: 'Pasado afirmativo formal (ました)',
      kana: forms.masuPast,
      description: `Pasado cortés: "${meaning}" en pasado`,
      translation: getTranslation(kanji, 'masuPast', meaning)
    },
    {
      key: 'masuPastNegative',
      label: 'Pasado negativo formal (ませんでした)',
      kana: forms.masuPastNegative,
      description: `Pasado cortés negativo: "no ${meaning}" en pasado`,
      translation: getTranslation(kanji, 'masuPastNegative', meaning)
    },
    {
      key: 'invitation',
      label: 'Invitación (ましょう / ～ませんか)',
      kana: forms.invitation,
      description: `Para invitar o sugerir: "¿${meaning}?"`,
      translation: getTranslation(kanji, 'invitation', meaning)
    },
    {
      key: 'desireFormal',
      label: 'Deseo (たいです)',
      kana: forms.desireFormal,
      description: `Expresar deseo: "quiero ${meaning}"`,
      translation: getTranslation(kanji, 'desireFormal', meaning)
    },
    {
      key: 'permission',
      label: 'Permiso (てもいいです)',
      kana: forms.permission,
      description: `Pedir permiso: "¿puedo ${meaning}?"`,
      translation: getTranslation(kanji, 'permission', meaning)
    },
    {
      key: 'prohibition',
      label: 'Prohibición (てはいけません)',
      kana: forms.prohibition,
      description: `Prohibir algo: "no se puede ${meaning}"`,
      translation: getTranslation(kanji, 'prohibition', meaning)
    },
    {
      key: 'progressiveFormal',
      label: 'Progresivo (ています)',
      kana: forms.progressiveFormal,
      description: `Acción en progreso: "estoy ${meaning}"`,
      translation: getTranslation(kanji, 'progressiveFormal', meaning)
    },
    
    // Informales (普通形)
    {
      key: 'dictionary',
      label: 'Presente/futuro informal (辞書形)',
      kana: forms.dictionary,
      description: `Forma básica: "${meaning}"`,
      translation: getTranslation(kanji, 'dictionary', meaning)
    },
    {
      key: 'plainNegative',
      label: 'Presente/futuro negativo informal (ない)',
      kana: forms.plainNegative,
      description: `Negación casual: "no ${meaning}"`,
      translation: getTranslation(kanji, 'plainNegative', meaning)
    },
    {
      key: 'plainPast',
      label: 'Pasado afirmativo informal (た)',
      kana: forms.plainPast,
      description: `Pasado casual: "${meaning}" en pasado`,
      translation: getTranslation(kanji, 'plainPast', meaning)
    },
    {
      key: 'plainPastNegative',
      label: 'Pasado negativo informal (なかった)',
      kana: forms.plainPastNegative,
      description: `Pasado casual negativo: "no ${meaning}" en pasado`,
      translation: getTranslation(kanji, 'plainPastNegative', meaning)
    },
    {
      key: 'desireInformal',
      label: 'Deseo informal (たい)',
      kana: forms.desireInformal,
      description: `Deseo casual: "quiero ${meaning}"`,
      translation: getTranslation(kanji, 'desireInformal', meaning)
    },
    {
      key: 'invitationInformal',
      label: 'Invitación informal (よう)',
      kana: forms.invitationInformal,
      description: `Invitación casual: "vamos a ${meaning}"`,
      translation: getTranslation(kanji, 'invitationInformal', meaning)
    },
    {
      key: 'request',
      label: 'Petición (て)',
      kana: forms.request,
      description: `Petición casual: "${meaning}" por favor`,
      translation: getTranslation(kanji, 'request', meaning)
    },
    {
      key: 'negativeRequest',
      label: 'Negación de acción (ないで)',
      kana: forms.negativeRequest,
      description: `Pedir que no se haga: "no ${meaning}"`,
      translation: getTranslation(kanji, 'negativeRequest', meaning)
    },
    {
      key: 'progressiveInformal',
      label: 'Progresivo informal (ている)',
      kana: forms.progressiveInformal,
      description: `Acción en progreso casual: "estoy ${meaning}"`,
      translation: getTranslation(kanji, 'progressiveInformal', meaning)
    }
  ];

  return entries;
}
