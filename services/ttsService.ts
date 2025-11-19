/**
 * Text-to-Speech Service using Web Speech API
 * Provides audio playback for language learning with controls
 */

export interface TTSConfig {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

class TextToSpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPaused: boolean = false;

  constructor() {
    // Check if browser supports Web Speech API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  /**
   * Check if TTS is supported in current browser
   */
  isSupported(): boolean {
    return this.synthesis !== null;
  }

  /**
   * Get available voices for a specific language
   */
  getVoicesForLanguage(lang: string): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    
    const voices = this.synthesis.getVoices();
    return voices.filter(voice => voice.lang.startsWith(lang));
  }

  /**
   * Speak the provided text with custom configuration
   */
  speak(
    text: string, 
    config: TTSConfig = {},
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: SpeechSynthesisErrorEvent) => void
  ): void {
    if (!this.synthesis) {
      console.warn('Speech Synthesis not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    this.stop();

    const {
      lang = 'es-ES', // Spanish (Spain) by default
      rate = 0.85,    // Slower for language learners
      pitch = 1.0,
      volume = 1.0
    } = config;

    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.lang = lang;
    this.currentUtterance.rate = rate;
    this.currentUtterance.pitch = pitch;
    this.currentUtterance.volume = volume;

    // Try to get a native Spanish voice
    const voices = this.synthesis.getVoices();
    const spanishVoice = voices.find(voice => 
      voice.lang.startsWith('es') && voice.name.includes('Google')
    ) || voices.find(voice => voice.lang.startsWith('es'));
    
    if (spanishVoice) {
      this.currentUtterance.voice = spanishVoice;
    }

    // Event handlers
    this.currentUtterance.onstart = () => {
      this.isPaused = false;
      onStart?.();
    };

    this.currentUtterance.onend = () => {
      this.isPaused = false;
      this.currentUtterance = null;
      onEnd?.();
    };

    this.currentUtterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.isPaused = false;
      this.currentUtterance = null;
      onError?.(event);
    };

    this.synthesis.speak(this.currentUtterance);
  }

  /**
   * Pause the current speech
   */
  pause(): void {
    if (this.synthesis && this.synthesis.speaking && !this.isPaused) {
      this.synthesis.pause();
      this.isPaused = true;
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.synthesis && this.isPaused) {
      this.synthesis.resume();
      this.isPaused = false;
    }
  }

  /**
   * Stop and cancel current speech
   */
  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isPaused = false;
      this.currentUtterance = null;
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synthesis?.speaking ?? false;
  }

  /**
   * Check if currently paused
   */
  isPausedState(): boolean {
    return this.isPaused;
  }

  /**
   * Get all available voices (useful for debugging)
   */
  getAllVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }
}

// Export singleton instance
export const ttsService = new TextToSpeechService();

// Convenience function for quick usage
export const speakSpanish = (
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (error: SpeechSynthesisErrorEvent) => void
): void => {
  ttsService.speak(text, { lang: 'es-ES', rate: 0.85 }, onStart, onEnd, onError);
};
