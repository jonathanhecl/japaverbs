type SpeakOptions = {
  lang?: string;
  fallbackText?: string;
  fallbackLang?: string;
};

export type SpeakStatus = 'native' | 'fallback' | 'pending' | 'unsupported';

const cachedVoices = new Map<string, string>();

function selectVoiceFromList(voices: SpeechSynthesisVoice[], lang: string) {
  const key = lang.toLowerCase().slice(0, 2);
  if (!voices.length) {
    return null;
  }

  const cachedName = cachedVoices.get(key);
  if (cachedName) {
    const cached = voices.find((voice) => voice.name === cachedName);
    if (cached) {
      return cached;
    }
  }

  const found = voices.find((voice) => voice.lang?.toLowerCase().startsWith(key));
  if (found) {
    cachedVoices.set(key, found.name);
    return found;
  }

  return null;
}

export function speak(text: string, options: SpeakOptions = {}): SpeakStatus {
  if (typeof window === 'undefined') {
    return 'unsupported';
  }

  const synth = window.speechSynthesis;
  if (!synth) {
    console.warn('Speech synthesis is not supported in this browser.');
    return 'unsupported';
  }

  const {
    lang = 'ja-JP',
    fallbackText,
    fallbackLang = 'en-US'
  } = options;

  let utterText = text;
  let utterLang = lang;

  const initialVoices = synth.getVoices();
  const voicesLoaded = initialVoices.length > 0;

  let voice = selectVoiceFromList(initialVoices, lang);
  let usingFallback = false;

  if (!voice && fallbackText) {
    utterText = fallbackText;
    utterLang = fallbackLang;
    voice = selectVoiceFromList(initialVoices, fallbackLang);
    if (voicesLoaded) {
      usingFallback = true;
    }
  } else if (!voice && voicesLoaded) {
    usingFallback = true;
  }

  const utter = new SpeechSynthesisUtterance(utterText);
  utter.lang = utterLang;
  utter.rate = 1;
  utter.pitch = 1;
  utter.volume = 1;

  const speakUtterance = () => {
    // Algunos navegadores (especialmente Chrome) requieren llamar a resume()
    // porque speechSynthesis puede quedar en pausa después de cancel() o tras
    // haber estado en segundo plano.
    if (typeof synth.resume === 'function') {
      synth.resume();
    }

    synth.cancel();
    synth.speak(utter);
  };

  if (voice) {
    utter.voice = voice;
    speakUtterance();
  } else {
    const speakWhenReady = () => {
      const updatedVoices = synth.getVoices();
      let readyVoice = selectVoiceFromList(updatedVoices, lang);

      if (!readyVoice && fallbackText) {
        readyVoice = selectVoiceFromList(updatedVoices, fallbackLang);
        if (readyVoice) {
          utter.voice = readyVoice;
          utter.lang = fallbackLang;
          utter.text = fallbackText;
          usingFallback = true;
        }
      } else if (readyVoice) {
        utter.voice = readyVoice;
        usingFallback = false;
      }

      synth.removeEventListener('voiceschanged', speakWhenReady);
      speakUtterance();
    };

    synth.addEventListener('voiceschanged', speakWhenReady, { once: true });
    synth.getVoices();

    // Fallback inmediato usando la voz por defecto del navegador
    speakUtterance();
  }

  if (!voicesLoaded) {
    return 'pending';
  }

  return usingFallback ? 'fallback' : 'native';
}
