type SpeakOptions = {
  lang?: string;
  fallbackText?: string;
  fallbackLang?: string;
};

const cachedVoices = new Map<string, SpeechSynthesisVoice>();

function selectVoice(synth: SpeechSynthesis, lang: string) {
  const key = lang.toLowerCase().slice(0, 2);
  const voices = synth.getVoices();
  if (!voices.length) {
    return null;
  }

  const cached = cachedVoices.get(key);
  if (cached && voices.some((voice) => voice.name === cached.name)) {
    return cached;
  }

  const found = voices.find((voice) => voice.lang?.toLowerCase().startsWith(key));
  if (found) {
    cachedVoices.set(key, found);
    return found;
  }

  return null;
}

export function speak(text: string, options: SpeakOptions = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  const synth = window.speechSynthesis;
  if (!synth) {
    console.warn('Speech synthesis is not supported in this browser.');
    return;
  }

  const {
    lang = 'ja-JP',
    fallbackText,
    fallbackLang = 'en-US'
  } = options;

  let utterText = text;
  let utterLang = lang;
  let voice = selectVoice(synth, lang);

  if (!voice && fallbackText) {
    utterText = fallbackText;
    utterLang = fallbackLang;
    voice = selectVoice(synth, fallbackLang);
  }

  const utter = new SpeechSynthesisUtterance(utterText);
  utter.lang = utterLang;
  utter.rate = 1;
  utter.pitch = 1;
  utter.volume = 1;

  const speakUtterance = () => {
    synth.cancel();
    synth.speak(utter);
  };

  if (voice) {
    utter.voice = voice;
    speakUtterance();
    return;
  }

  const speakWhenReady = () => {
    let readyVoice = selectVoice(synth, utterLang);

    if (!readyVoice && fallbackText) {
      readyVoice = selectVoice(synth, fallbackLang);
      if (readyVoice) {
        utter.voice = readyVoice;
        utter.lang = fallbackLang;
        utter.text = fallbackText;
      }
    } else if (readyVoice) {
      utter.voice = readyVoice;
    }

    synth.removeEventListener('voiceschanged', speakWhenReady);
    speakUtterance();
  };

  synth.addEventListener('voiceschanged', speakWhenReady, { once: true });
  synth.getVoices();

  // Fallback inmediato usando la voz por defecto del navegador
  speakUtterance();
}
