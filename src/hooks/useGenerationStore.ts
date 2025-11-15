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
  processingSteps: ProcessingStep[];
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
  startProcessing: () => void;
  setProcessingSteps: (steps: ProcessingStep[]) => void;
  updateProcessingStep: (id: string, updates: Partial<ProcessingStep>) => void;
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
  processingSteps: [],
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
  startProcessing: () => set({ appStatus: 'processing', currentStep: 1 }),
  setProcessingSteps: (steps) => set({ processingSteps: steps }),
  updateProcessingStep: (id, updates) =>
    set((state) => ({
      processingSteps: state.processingSteps.map((step) =>
        step.id === id ? { ...step, ...updates } : step
      ),
    })),
  showResults: (result) => set({ appStatus: 'results', result }),
  reset: () =>
    set({
      ...initialState,
      appStatus: 'form',
      currentStep: 1,
      processingSteps: [],
      result: null,
    }),
}));