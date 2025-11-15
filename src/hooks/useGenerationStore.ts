import { create } from 'zustand';
import {
  GenerationSettings,
  AppStatus,
  ProcessingStep,
  GenerationResult,
  SummarizationLevel,
  FarsiFont,
  EnglishFont,
  ColorTheme,
} from '@/lib/types';
interface GenerationState extends GenerationSettings {
  appStatus: AppStatus;
  currentStep: number;
  isLoading: boolean;
  error: string | null;
  result: GenerationResult | null;
  setPaperName: (name: string) => void;
  setPdfFile: (file: File | null) => void;
  setNumSlides: (slides: number) => void;
  setSummarizationLevel: (level: SummarizationLevel) => void;
  setFarsiFont: (font: FarsiFont) => void;
  setEnglishFont: (font: EnglishFont) => void;
  setFontSize: (size: number) => void;
  setColorTheme: (theme: ColorTheme) => void;
  nextStep: () => void;
  prevStep: () => void;
  startProcessing: () => Promise<void>;
  showResults: (result: GenerationResult) => void;
  reset: () => void;
}
const initialState: GenerationSettings = {
  paperName: '',
  pdfFile: null,
  numSlides: 25,
  summarizationLevel: 'medium',
  farsiFont: 'IRANSans',
  englishFont: 'Calibri',
  fontSize: 18,
  colorTheme: 'professional',
};
export const useGenerationStore = create<GenerationState>((set, get) => ({
  ...initialState,
  appStatus: 'form',
  currentStep: 1,
  isLoading: false,
  error: null,
  result: null,
  setPaperName: (name) => set({ paperName: name }),
  setPdfFile: (file) => set({ pdfFile: file }),
  setNumSlides: (slides) => set({ numSlides: slides }),
  setSummarizationLevel: (level) => set({ summarizationLevel: level }),
  setFarsiFont: (font) => set({ farsiFont: font }),
  setEnglishFont: (font) => set({ englishFont: font }),
  setFontSize: (size) => set({ fontSize: size }),
  setColorTheme: (theme) => set({ colorTheme: theme }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 3) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  startProcessing: async () => {
    const { pdfFile, ...settings } = get();
    if (!pdfFile) {
      set({ error: 'PDF file is required.' });
      return;
    }
    set({ appStatus: 'processing', isLoading: true, error: null });
    const formData = new FormData();
    formData.append('pdfFile', pdfFile);
    Object.entries(settings).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    try {
      const response = await fetch('/api/generate-presentation', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to generate presentation.');
      }
      set({ appStatus: 'results', result: result.data, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      set({ appStatus: 'form', error: errorMessage, isLoading: false });
      // Optionally reset to a specific step, e.g., step 1
      // set({ currentStep: 1 });
    }
  },
  showResults: (result) => set({ appStatus: 'results', result, isLoading: false }),
  reset: () =>
    set({
      ...initialState,
      appStatus: 'form',
      currentStep: 1,
      isLoading: false,
      error: null,
      result: null,
    }),
}));