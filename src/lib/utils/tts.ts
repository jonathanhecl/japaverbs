export function speak(text: string, lang = 'ja-JP') {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  speechSynthesis.speak(utter);
}
