// Text-to-Speech (TTS)
export function speakEnglish(text: string, rate: number = 1.0) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  window.speechSynthesis.cancel(); // Cancel any ongoing speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  utterance.pitch = 1.0;

  // Try to pick a natural US English voice if available
  const voices = window.speechSynthesis.getVoices();
  const usVoice = voices.find(v => (v.lang === 'en-US' || v.lang === 'en_US') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('David')));
  if (usVoice) {
    utterance.voice = usVoice;
  }

  window.speechSynthesis.speak(utterance);
}

// Optional STT for practice check
export class SpeechRecognizer {
  private recognition: any = null;
  public isSupported: boolean = false;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.isSupported = true;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = false;
    }
  }

  start(onResult: (transcript: string) => void, onError?: () => void) {
    if (!this.recognition) return;
    try {
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };
      this.recognition.onerror = () => {
        if (onError) onError();
      };
      this.recognition.start();
    } catch (e) {
      console.error(e);
      if (onError) onError();
    }
  }

  stop() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}
