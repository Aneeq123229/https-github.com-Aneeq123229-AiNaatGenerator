export interface NaatResponse {
  title: string;
  urduLyrics: string[];
  transliteration: string[];
  englishTranslation: string;
}

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  audioBuffer: AudioBuffer | null;
}
